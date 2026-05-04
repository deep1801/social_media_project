import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import socket, { connectSocket } from "../api/socket";
import {
  Send,
  ArrowLeft,
  Trash2,
  MessageCircle,
  Image as ImageIcon,
  X,
  ZoomIn,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL = 2000;
const UPLOAD_TIMEOUT = 30000;

// ✅ image compress
const compressImage = (file, maxWidth = 1280, quality = 0.82) =>
  new Promise((resolve) => {
    if (file.size < 300 * 1024) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) =>
          resolve(
            blob ? new File([blob], file.name, { type: "image/jpeg" }) : file,
          ),
        "image/jpeg",
        quality,
      );
    };
    img.src = url;
  });

// helpers
const formatTime = (d) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const Messages = () => {
  const { userId } = useParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConv] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // ✅ FIX: socket connect inside component
  useEffect(() => {
    if (user?._id) {
      connectSocket(user._id);
    }
  }, [user]);

  // ✅ receive message
  useEffect(() => {
    socket.on("message:receive", (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => socket.off("message:receive");
  }, []);

  // scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // send message
  const handleSend = async () => {
    if ((!messageText.trim() && !imageFile) || !selectedConversation) return;

    setSending(true);

    try {
      let res;

      if (imageFile) {
        const compressed = await compressImage(imageFile);
        const formData = new FormData();
        if (messageText) formData.append("text", messageText);
        formData.append("image", compressed);

        res = await axiosInstance.post(
          `/api/v1/messages/${selectedConversation._id}`,
          formData,
        );
      } else {
        res = await axiosInstance.post(
          `/api/v1/messages/${selectedConversation._id}`,
          { text: messageText },
        );
      }

      const msg = res.data.data;

      setMessages((prev) => [...prev, msg]);

      // ✅ realtime send
      const receiverId = selectedConversation.participants.find(
        (p) => p._id !== user._id,
      )?._id;

      if (receiverId) {
        socket.emit("message:send", { receiverId, message: msg });
      }

      setMessageText("");
      setImageFile(null);
    } catch (err) {
      console.error(err);
      alert("Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4">
      <h2>Chat</h2>

      <div className="h-[400px] overflow-y-auto border p-2">
        {messages.map((msg) => (
          <div key={msg._id} className="mb-2">
            <b>{msg.sender?.name}</b>: {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 mt-2">
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="border p-2 flex-1"
        />
        <button onClick={handleSend} disabled={sending}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;
