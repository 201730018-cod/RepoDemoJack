const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ─── Estado en memoria (sin Redis, sin persistencia) ────────────────────────
const rooms = new Map();   // roomId -> { name, messages: [] }
const users = new Map();   // socketId -> { id, username, roomId }

// Sala general por defecto
rooms.set("general", { name: "General", messages: [] });

// ─── REST: listar salas disponibles ─────────────────────────────────────────
app.get("/api/rooms", (req, res) => {
  const list = Array.from(rooms.entries()).map(([id, room]) => ({
    id,
    name: room.name,
    userCount: [...users.values()].filter((u) => u.roomId === id).length,
  }));
  res.json(list);
});

// ─── WebSocket ───────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[+] Socket conectado: ${socket.id}`);

  // El cliente envía su username al conectarse
  socket.on("register", ({ username }) => {
    const user = { id: uuidv4(), username, roomId: null };
    users.set(socket.id, user);

    socket.emit("registered", {
      userId: user.id,
      rooms: Array.from(rooms.entries()).map(([id, r]) => ({
        id,
        name: r.name,
        userCount: [...users.values()].filter((u) => u.roomId === id).length,
      })),
    });

    console.log(`[register] ${username}`);
  });

  // Unirse a una sala
  socket.on("join_room", ({ roomId }) => {
    const user = users.get(socket.id);
    if (!user) return;

    // Salir de la sala anterior si aplica
    if (user.roomId) {
      socket.leave(user.roomId);
      io.to(user.roomId).emit("user_left", { username: user.username });
    }

    user.roomId = roomId;

    // Crear sala si no existe
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { name: roomId, messages: [] });
    }

    socket.join(roomId);

    const room = rooms.get(roomId);

    // Mandar historial al usuario que se une
    socket.emit("room_history", {
      roomId,
      messages: room.messages,
    });

    // Avisar a los demás
    io.to(roomId).emit("user_joined", { username: user.username, roomId });

    console.log(`[join] ${user.username} -> ${roomId}`);
  });

  // Crear nueva sala
  socket.on("create_room", ({ roomName }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const roomId = roomName.toLowerCase().replace(/\s+/g, "-");

    if (rooms.has(roomId)) {
      socket.emit("error_msg", { message: "Esa sala ya existe." });
      return;
    }

    rooms.set(roomId, { name: roomName, messages: [] });

    // Notificar a todos los usuarios de la nueva sala
    io.emit("room_created", { id: roomId, name: roomName, userCount: 0 });
    console.log(`[create_room] ${user.username} creó "${roomName}"`);
  });

  // Enviar mensaje
  socket.on("send_message", ({ content }) => {
    const user = users.get(socket.id);
    if (!user || !user.roomId) return;

    const room = rooms.get(user.roomId);
    if (!room) return;

    const message = {
      id: uuidv4(),
      userId: user.id,
      username: user.username,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // Guardar en memoria (se pierde al reiniciar — sin persistencia intencional)
    room.messages.push(message);

    // Limitar historial a 100 mensajes por sala
    if (room.messages.length > 100) room.messages.shift();

    io.to(user.roomId).emit("new_message", message);
  });

  // Desconexión
  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      if (user.roomId) {
        io.to(user.roomId).emit("user_left", { username: user.username });
      }
      users.delete(socket.id);
      console.log(`[-] ${user.username} desconectado`);
    }
  });
});

// ─── Arrancar ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
