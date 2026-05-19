import { io } from "socket.io-client";

// IMPORTANTE: withCredentials: true para que el navegador envíe la cookie httpOnly
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

const socket = io(SERVER_URL, {
  autoConnect: false,
  withCredentials: true,   // <-- esto hace que la cookie viaje con el socket
});

export default socket;
export { SERVER_URL };
