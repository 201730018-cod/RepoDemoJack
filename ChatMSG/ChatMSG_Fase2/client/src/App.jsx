import { useState, useEffect, useRef } from "react";
import socket, { SERVER_URL } from "./socket";

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      // POST al servidor — crea la cookie httpOnly
      const res = await fetch(`${SERVER_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",   // necesario para recibir/enviar cookies
        body: JSON.stringify({ username: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginWrapper}>
      <div style={styles.loginCard}>
        <div style={styles.loginLogo}>💬</div>
        <h1 style={styles.loginTitle}>ChatMSG</h1>
        <p style={styles.loginSub}>Fase 2 — Redis + Cookies httpOnly</p>
        {error && <p style={styles.errorMsg}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.loginForm}>
          <input
            style={styles.input}
            type="text"
            placeholder="Tu nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={24}
            autoFocus
            disabled={loading}
          />
          <button style={styles.btnPrimary} type="submit" disabled={!username.trim() || loading}>
            {loading ? "Entrando..." : "Entrar al chat"}
          </button>
        </form>
        <p style={styles.cookieNote}>
          🔒 Tu sesión se guarda en una cookie httpOnly segura
        </p>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ rooms, currentRoom, onJoinRoom, onCreateRoom, username, onLogout }) {
  const [newRoom, setNewRoom] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newRoom.trim()) return;
    onCreateRoom(newRoom.trim());
    setNewRoom("");
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <span style={styles.sidebarTitle}>💬 ChatMSG</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          <span style={styles.userChip}>@{username}</span>
          <button onClick={onLogout} style={styles.btnLogout} title="Cerrar sesión">⏻</button>
        </div>
        <div style={styles.fase2Badge}>Fase 2 · Redis</div>
      </div>

      <div style={styles.sidebarSection}>
        <p style={styles.sectionLabel}>SALAS</p>
        <ul style={styles.roomList}>
          {rooms.map((room) => (
            <li
              key={room.id}
              onClick={() => onJoinRoom(room.id)}
              style={{
                ...styles.roomItem,
                ...(currentRoom === room.id ? styles.roomItemActive : {}),
              }}
            >
              <span style={styles.roomHash}>#</span>
              <span style={styles.roomName}>{room.name}</span>
              <span style={styles.roomCount}>{room.userCount}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.sidebarSection}>
        <p style={styles.sectionLabel}>NUEVA SALA</p>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: 6 }}>
          <input
            style={{ ...styles.input, fontSize: 13, padding: "6px 10px" }}
            placeholder="nombre-sala"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            maxLength={30}
          />
          <button style={styles.btnIcon} type="submit" title="Crear sala">+</button>
        </form>
      </div>
    </aside>
  );
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
function Chat({ messages, currentRoom, userId, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  if (!currentRoom) {
    return (
      <div style={styles.chatEmpty}>
        <span style={{ fontSize: 48 }}>👈</span>
        <p style={{ color: "var(--text-muted)", marginTop: 12 }}>
          Selecciona una sala para empezar a chatear
        </p>
      </div>
    );
  }

  return (
    <div style={styles.chatWrapper}>
      <div style={styles.chatHeader}>
        <span style={styles.chatRoomName}># {currentRoom}</span>
        <span style={styles.chatBadge}>🔴 En vivo · Redis Pub/Sub</span>
      </div>

      <div style={styles.messageList}>
        {messages.length === 0 && (
          <p style={styles.emptyMsg}>No hay mensajes aún. ¡Sé el primero!</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.userId === userId;
          return (
            <div key={msg.id} style={{ ...styles.msgRow, justifyContent: isOwn ? "flex-end" : "flex-start" }}>
              {!isOwn && (
                <div style={styles.avatar}>{msg.username[0].toUpperCase()}</div>
              )}
              <div style={{ maxWidth: "65%" }}>
                {!isOwn && <p style={styles.msgUsername}>{msg.username}</p>}
                <div style={{ ...styles.bubble, ...(isOwn ? styles.bubbleOwn : styles.bubbleOther) }}>
                  <p style={styles.bubbleText}>{msg.content}</p>
                </div>
                <p style={{ ...styles.msgTime, textAlign: isOwn ? "right" : "left" }}>
                  {new Date(msg.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {isOwn && (
                <div style={{ ...styles.avatar, background: "#6c63ff22", color: "#6c63ff" }}>
                  {msg.username[0].toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputBar}>
        <input
          style={styles.msgInput}
          placeholder={`Mensaje en #${currentRoom}...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <button style={styles.btnSend} type="submit" disabled={!text.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // verificando sesión al inicio
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Al cargar la app, verificar si hay sesión activa (cookie)
  useEffect(() => {
    fetch(`${SERVER_URL}/api/session`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.active) {
          setUser(data.user);
          connectSocket();
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const connectSocket = () => {
    if (!socket.connected) {
      socket.connect();
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    connectSocket();
  };

  const handleLogout = async () => {
    await fetch(`${SERVER_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    socket.disconnect();
    setUser(null);
    setRooms([]);
    setCurrentRoom(null);
    setMessages([]);
  };

  // Eventos de Socket.IO
  useEffect(() => {
    socket.on("init", ({ user: u, rooms: r }) => {
      setRooms(r);
      // Auto-unirse a general
      socket.emit("join_room", { roomId: "general" });
    });

    socket.on("room_history", ({ roomId, messages: msgs }) => {
      setCurrentRoom(roomId);
      setMessages(msgs);
    });

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user_joined", ({ username: u, roomId }) => {
      addNotification(`${u} se unió a #${roomId}`);
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, userCount: r.userCount + 1 } : r))
      );
    });

    socket.on("user_left", ({ username: u }) => {
      addNotification(`${u} salió`);
    });

    socket.on("room_created", (room) => {
      setRooms((prev) => {
        if (prev.find((r) => r.id === room.id)) return prev;
        return [...prev, room];
      });
    });

    socket.on("error_msg", ({ message }) => {
      addNotification(`⚠️ ${message}`);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
      addNotification("⚠️ Error de conexión: " + err.message);
    });

    return () => {
      socket.off("init");
      socket.off("room_history");
      socket.off("new_message");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("room_created");
      socket.off("error_msg");
      socket.off("connect_error");
    };
  }, []);

  const addNotification = (text) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 3000);
  };

  const handleJoinRoom = (roomId) => {
    if (roomId === currentRoom) return;
    socket.emit("join_room", { roomId });
    setMessages([]);
  };

  const handleCreateRoom = (name) => {
    socket.emit("create_room", { roomName: name });
  };

  const handleSend = (content) => {
    socket.emit("send_message", { content, roomId: currentRoom });
  };

  if (loading) {
    return (
      <div style={styles.loginWrapper}>
        <p style={{ color: "var(--text-muted)" }}>Verificando sesión...</p>
      </div>
    );
  }

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div style={styles.appLayout}>
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onJoinRoom={handleJoinRoom}
        onCreateRoom={handleCreateRoom}
        username={user.username}
        onLogout={handleLogout}
      />
      <Chat
        messages={messages}
        currentRoom={currentRoom}
        userId={user.id}
        onSend={handleSend}
      />

      <div style={styles.notifContainer}>
        {notifications.map((n) => (
          <div key={n.id} style={styles.notif}>{n.text}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = {
  appLayout: { display: "flex", height: "100vh", overflow: "hidden" },

  loginWrapper: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
  },
  loginCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "48px 40px",
    width: 380,
    textAlign: "center",
  },
  loginLogo: { fontSize: 48, marginBottom: 12 },
  loginTitle: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
  loginSub: { color: "var(--text-muted)", fontSize: 13, marginBottom: 20 },
  loginForm: { display: "flex", flexDirection: "column", gap: 12 },
  errorMsg: {
    color: "var(--danger)",
    fontSize: 13,
    marginBottom: 8,
    background: "#e0525215",
    padding: "8px 12px",
    borderRadius: 8,
  },
  cookieNote: {
    color: "var(--text-muted)",
    fontSize: 11,
    marginTop: 16,
  },

  sidebar: {
    width: 240,
    minWidth: 240,
    background: "var(--bg-secondary)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "16px 14px",
    borderBottom: "1px solid var(--border)",
  },
  sidebarTitle: { fontSize: 16, fontWeight: 700 },
  userChip: {
    fontSize: 12,
    color: "var(--accent)",
    background: "#6c63ff1a",
    borderRadius: 20,
    padding: "2px 8px",
  },
  btnLogout: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: 16,
    cursor: "pointer",
    padding: "2px 4px",
  },
  fase2Badge: {
    fontSize: 10,
    color: "var(--success)",
    background: "#4caf7d15",
    borderRadius: 6,
    padding: "2px 8px",
    display: "inline-block",
    marginTop: 8,
  },
  sidebarSection: { padding: "14px 10px" },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--text-muted)",
    letterSpacing: "0.1em",
    marginBottom: 8,
    paddingLeft: 6,
  },
  roomList: { listStyle: "none", display: "flex", flexDirection: "column", gap: 2 },
  roomItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    color: "var(--text-muted)",
  },
  roomItemActive: { background: "#6c63ff22", color: "var(--text)" },
  roomHash: { color: "var(--text-muted)", fontSize: 16 },
  roomName: { flex: 1 },
  roomCount: {
    fontSize: 11,
    background: "var(--bg-card)",
    color: "var(--text-muted)",
    borderRadius: 10,
    padding: "1px 6px",
  },

  chatWrapper: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  chatEmpty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  chatHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatRoomName: { fontSize: 16, fontWeight: 600 },
  chatBadge: { fontSize: 11, color: "var(--success)" },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  emptyMsg: { color: "var(--text-muted)", fontSize: 14, textAlign: "center", marginTop: 40 },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#ffffff14",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  msgUsername: { fontSize: 12, color: "var(--text-muted)", marginBottom: 3, paddingLeft: 4 },
  bubble: { padding: "9px 14px", borderRadius: 14, wordBreak: "break-word" },
  bubbleOwn: { background: "var(--accent)", borderBottomRightRadius: 4 },
  bubbleOther: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 1.5 },
  msgTime: { fontSize: 11, color: "var(--text-muted)", marginTop: 3, paddingInline: 4 },

  inputBar: {
    display: "flex",
    gap: 10,
    padding: "12px 20px",
    borderTop: "1px solid var(--border)",
    background: "var(--bg-secondary)",
  },
  msgInput: {
    flex: 1,
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
  },
  btnSend: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "0 20px",
    fontWeight: 600,
    fontSize: 14,
  },

  input: {
    width: "100%",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
  },
  btnPrimary: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 0",
    fontWeight: 600,
    fontSize: 15,
    width: "100%",
  },
  btnIcon: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 8,
    width: 34,
    height: 34,
    fontSize: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  notifContainer: {
    position: "fixed",
    bottom: 20,
    right: 20,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 999,
  },
  notif: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 13,
    color: "var(--text-muted)",
    boxShadow: "0 4px 20px #0005",
  },
};
