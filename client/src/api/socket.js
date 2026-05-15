import { io } from "socket.io-client";

const SOCKET_URL = "https://social-media-project-si7w.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,

  // ❌ REMOVE ONLY websocket
  // ✅ allow fallback
  transports: ["websocket", "polling"],

  reconnection: true,
  reconnectionAttempts: 10,
  timeout: 20000,
});

export const connectSocket = (userId) => {
  // Always ensure user:join is emitted when socket is ready
  if (socket.connected) {
    socket.emit("user:join", userId);
  } else {
    socket.once("connect", () => {
      socket.emit("user:join", userId);
    });
    socket.connect();
  }
};

socket.on("connect_error", (err) => {
  console.error("❌ Socket error:", err.message);
});

export default socket;
