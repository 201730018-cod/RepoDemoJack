require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("ioredis");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const SESSION_SECRET = process.env.SESSION_SECRET || "chatmsg_dev_secret";

// ─── Middlewares ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,           // Necesario para que las cookies viajen
}));
app.use(express.json());
app.use(cookieParser(SESSION_SECRET));

// ─── Redis: dos clientes (pub y sub por separado, requerido por socket.io) ───
const pubClient = createClient(REDIS_URL);
const subClient = pubClient.duplicate();

// Estado compartido en Redis (salas)
// Las salas se guardan como Hash en Redis: "rooms" -> { roomId: roomName }
// Los mensajes recientes: "messages:{roomId}" -> lista de JSON

// ─── Socket.IO con Redis Adapter ─────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── Helpers Redis ────────────────────────────────────────────────────────────
async function getRooms() {
  const data = await pubClient.hgetall("rooms");
  if (!data) return {};
  return data; // { roomId: roomName }
}

async function createRoom(roomId, roomName) {
  await pubClient.hset("rooms", roomId, roomName);
}

async function roomExists(roomId) {
  return await pubClient.hexists("rooms", roomId);
}

async function saveMessage(roomId, message) {
  const key = `messages:${roomId}`;
  await pubClient.rpush(key, JSON.stringify(message));
  await pubClient.ltrim(key, -100, -1); // máximo 100 mensajes por sala
}

async function getMessages(roomId) {
  const key = `messages:${roomId}`;
  const raw = await pubClient.lrange(key, 0, -1);
  return raw.map((m) => JSON.parse(m));
}

async function getRoomList() {
  const rooms = await getRooms();
  const list = [];
  for (const [id, name] of Object.entries(rooms)) {
    list.push({ id, name, userCount: 0 });
  }
  return list;
}

// ─── REST endpoints ───────────────────────────────────────────────────────────

// Verificar sesión activa (el frontend lo llama al cargar)
app.get("/api/session", (req, res) => {
  const session = req.signedCookies.chatSession;
  if (session) {
    try {
      const data = JSON.parse(session);
      return res.json({ active: true, user: data });
    } catch {
      return res.json({ active: false });
    }
  }
  res.json({ active: false });
});

// Login — crea la cookie httpOnly
app.post("/api/login", async (req, res) => {
  const { username } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ error: "Username requerido" });
  }

  const user = {
    id: uuidv4(),
    username: username.trim(),
  };

  // Cookie httpOnly firmada — JavaScript del frontend NO puede leerla
  res.cookie("chatSession", JSON.stringify(user), {
    httpOnly: true,
    signed: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 horas
    sameSite: "lax",
  });

  res.json({ ok: true, user });
});

// Logout — borra la cookie
app.post("/api/logout", (req, res) => {
  res.clearCookie("chatSession");
  res.json({ ok: true });
});

// Listar salas
app.get("/api/rooms", async (req, res) => {
  const list = await getRoomList();
  res.json(list);
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.use((socket, next) => {
  // Middleware: leer la cookie para autenticar el socket
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return next(new Error("No autenticado"));

  // Parsear cookies manualmente
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k.trim(), decodeURIComponent(v.join("="))];
    })
  );

  const signedCookie = cookies["chatSession"];
  if (!signedCookie) return next(new Error("No autenticado"));

  // Verificar firma (formato: s:JSON.signature)
  const cookieParser = require("cookie-parser");
  const unsigned = cookieParser.signedCookie(signedCookie, SESSION_SECRET);
  if (!unsigned) return next(new Error("Cookie inválida"));

  try {
    socket.user = JSON.parse(unsigned);
    next();
  } catch {
    next(new Error("Cookie malformada"));
  }
});

io.on("connection", async (socket) => {
  const user = socket.user;
  console.log(`[+] ${user.username} conectado (socket: ${socket.id})`);

  // Mandar lista de salas al conectarse
  const rooms = await getRoomList();
  socket.emit("init", { user, rooms });

  // Unirse a sala
  socket.on("join_room", async ({ roomId }) => {
    // Salir de salas anteriores (excepto la sala global de socket.io)
    const currentRooms = [...socket.rooms].filter((r) => r !== socket.id);
    for (const r of currentRooms) {
      socket.leave(r);
      io.to(r).emit("user_left", { username: user.username, roomId: r });
    }

    const exists = await roomExists(roomId);
    if (!exists) {
      socket.emit("error_msg", { message: "Sala no encontrada" });
      return;
    }

    socket.join(roomId);

    // Historial de mensajes
    const messages = await getMessages(roomId);
    socket.emit("room_history", { roomId, messages });

    // Notificar a los demás
    socket.to(roomId).emit("user_joined", { username: user.username, roomId });

    console.log(`[join] ${user.username} -> ${roomId}`);
  });

  // Crear sala
  socket.on("create_room", async ({ roomName }) => {
    const roomId = roomName.toLowerCase().replace(/\s+/g, "-");

    const exists = await roomExists(roomId);
    if (exists) {
      socket.emit("error_msg", { message: "Esa sala ya existe." });
      return;
    }

    await createRoom(roomId, roomName);

    // Notificar a TODOS los servidores vía Redis adapter
    io.emit("room_created", { id: roomId, name: roomName, userCount: 0 });
    console.log(`[create_room] ${user.username} creó "${roomName}"`);
  });

  // Enviar mensaje
  socket.on("send_message", async ({ content, roomId }) => {
    if (!content || !content.trim()) return;
    if (!roomId) return;

    const message = {
      id: uuidv4(),
      userId: user.id,
      username: user.username,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // Guardar en Redis (persiste entre reinicios de servidores)
    await saveMessage(roomId, message);

    // Broadcast a todos los sockets en esa sala (en TODOS los servidores)
    io.to(roomId).emit("new_message", message);
  });

  // Desconexión
  socket.on("disconnect", () => {
    const currentRooms = [...socket.rooms].filter((r) => r !== socket.id);
    for (const r of currentRooms) {
      socket.to(r).emit("user_left", { username: user.username, roomId: r });
    }
    console.log(`[-] ${user.username} desconectado`);
  });
});

// ─── Arrancar ─────────────────────────────────────────────────────────────────
async function main() {
  // ioredis se conecta automáticamente, solo verificamos con ping
  try {
    await pubClient.ping();
    console.log("✅ Redis conectado");
  } catch (err) {
    console.error("❌ No se pudo conectar a Redis:", err.message);
    process.exit(1);
  }

  // Crear sala general si no existe
  const exists = await roomExists("general");
  if (!exists) {
    await createRoom("general", "General");
    console.log("📌 Sala 'general' creada");
  }

  // Configurar el Redis Adapter en Socket.IO
  io.adapter(createAdapter(pubClient, subClient));

  server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 Redis: ${REDIS_URL}`);
  });
}

main().catch(console.error);