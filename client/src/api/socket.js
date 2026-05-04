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
  if (!socket.connected) {
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);

      socket.emit("user:join", userId);
    });
  }
};

socket.on("connect_error", (err) => {
  console.error("❌ Socket error:", err.message);
});

export default socket;
