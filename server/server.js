const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const colors = require("colors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  "https://deep1801-socialmediaproject-cwuq.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// ── SOCKET.IO ─────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// ✅ SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("user:join", (userId) => {
    console.log("👤 User joined:", userId);
    socket.join(userId);
  });

  socket.on("message:send", ({ receiverId, message }) => {
    if (receiverId) {
      io.to(receiverId).emit("message:receive", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// attach io
app.set("io", io);

// ── MIDDLEWARE ─────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── ROUTES ─────────────────────────────
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/posts", require("./routes/posts"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/messages", require("./routes/messages"));
app.use("/api/v1/notifications", require("./routes/notifications"));

app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running..." });
});

app.use(errorHandler);

// ── START SERVER ─────────────────────────────
const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.yellow.bold);
});
