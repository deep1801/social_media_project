const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const colors = require("colors");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

// Load env vars
dotenv.config();

// Connect DB
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// ✅ PRODUCTION + LOCALHOST CORS FIX
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
          ],
    credentials: true,
  }),
);

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ STATIC FILE SERVING (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/posts", require("./routes/posts"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/messages", require("./routes/messages"));
app.use("/api/v1/notifications", require("./routes/notifications"));
app.use("/api/v1/sentiment", require("./routes/sentiment"));
app.use("/api/v1/assistant/chat", require("./routes/assistantChatRouter"));

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running...",
  });
});

// Error handler
app.use(errorHandler);

// Server start
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold,
  );
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
