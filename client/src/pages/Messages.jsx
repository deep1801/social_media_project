import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import socket, { connectSocket } from "../api/socket";
import { Send, MessageCircle, Image as ImageIcon, X, Paperclip, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL = 2000;
const UPLOAD_TIMEOUT = 30000;

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
          resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file),
        "image/jpeg",
        quality
      );
    };
    img.src = url;
  });

const formatTime = (d) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const BASE_URL = "https://social-media-project-si7w.onrender.com";

const Messages = () => {
  const { userId } = useParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConv] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (user?._id) connectSocket(user._id);
  }, [user]);

  // Receive messages
  useEffect(() => {
    socket.on("message:receive", (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });
    return () => socket.off("message:receive");
  }, []);

  // Typing indicator from other user
  useEffect(() => {
    socket.on("user:typing", ({ isTyping }) => {
      setOtherUserTyping(isTyping);
    });
    return () => socket.off("user:typing");
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  // Emit typing events
  const handleTextChange = (e) => {
    setMessageText(e.target.value);

    const receiverId = selectedConversation?.participants?.find(
      (p) => p._id !== user?._id
    )?._id;

    if (receiverId) {
      socket.emit("typing:start", { receiverId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit("typing:stop", { receiverId });
      }, 1500);
    }
  };

  const handleSend = async () => {
    if ((!messageText.trim() && !imageFile) || !selectedConversation) return;

    // Stop typing indicator when sending
    const receiverId = selectedConversation.participants.find(
      (p) => p._id !== user._id
    )?._id;
    if (receiverId) socket.emit("typing:stop", { receiverId });
    clearTimeout(typingTimeout.current);

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
          formData
        );
      } else {
        res = await axiosInstance.post(
          `/api/v1/messages/${selectedConversation._id}`,
          { text: messageText }
        );
      }

      const msg = res.data.data;
      setMessages((prev) => [...prev, msg]);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherParticipant = selectedConversation?.participants?.find(
    (p) => p._id !== user?._id
  );

  return (
    <div
      className="flex flex-col bg-gray-50 dark:bg-gray-950/50"
      style={{ height: "calc(100vh - 56px)" }}
    >
      {/* Chat header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {otherParticipant
              ? otherParticipant.name?.charAt(0).toUpperCase()
              : <MessageCircle size={16} />}
          </div>
          {selectedConversation && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            {otherParticipant?.name || "Messages"}
          </p>
          {selectedConversation ? (
            otherUserTyping ? (
              <p className="text-xs text-brand-500 dark:text-brand-400 font-medium animate-pulse">
                typing…
              </p>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-xs text-gray-400">Active now</span>
              </div>
            )
          ) : (
            <p className="text-xs text-gray-400">
              Go to People to start a conversation
            </p>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-12">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20 flex items-center justify-center shadow-sm animate-float">
              <MessageCircle size={36} className="text-brand-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                Your Messages
              </h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                Send a message to start a conversation. Find someone on the
                People page and tap Message.
              </p>
            </div>
            <Link to="/users" className="btn-primary gap-2">
              <Users size={16} />
              Find People
            </Link>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine =
              msg.sender?._id === user?._id || msg.sender === user?._id;
            const showAvatar =
              !isMine &&
              (i === 0 || messages[i - 1]?.sender?._id !== msg.sender?._id);

            return (
              <div
                key={msg._id}
                className={`flex gap-2 items-end animate-slide-up ${isMine ? "flex-row-reverse" : ""}`}
                style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
              >
                {!isMine ? (
                  showAvatar ? (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
                      {msg.sender?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  ) : (
                    <div className="w-7 flex-shrink-0" />
                  )
                ) : null}

                <div
                  className={`max-w-[70%] flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-br-md shadow-sm"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-card rounded-bl-md border border-gray-100 dark:border-gray-700/60"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={
                          msg.image.startsWith("http")
                            ? msg.image
                            : `${BASE_URL}${msg.image}`
                        }
                        className="rounded-xl max-w-xs mb-2 cursor-pointer"
                        alt="attachment"
                      />
                    )}
                    {msg.text && <p>{msg.text}</p>}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">
                    {msg.createdAt ? formatTime(msg.createdAt) : ""}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator bubble */}
        {otherUserTyping && selectedConversation && (
          <div className="flex gap-2 items-end animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {otherParticipant?.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-card border border-gray-100 dark:border-gray-700/60">
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700/60 px-4 py-3 flex-shrink-0">
        {imageFile && (
          <div className="mb-2.5 flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-3 py-2">
            <ImageIcon size={14} className="text-brand-500 flex-shrink-0" />
            <span className="text-xs text-brand-600 dark:text-brand-400 flex-1 truncate">
              {imageFile.name}
            </span>
            <button
              onClick={() => setImageFile(null)}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand-500 transition-colors flex-shrink-0"
            title="Attach image"
          >
            <Paperclip size={18} />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
            />
          </button>

          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedConversation
                  ? "Type a message… (Enter to send)"
                  : "Select a conversation to start chatting"
              }
              rows={1}
              disabled={!selectedConversation}
              className="input-field py-2.5 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ maxHeight: "120px" }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={
              sending ||
              (!messageText.trim() && !imageFile) ||
              !selectedConversation
            }
            className="p-2.5 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm hover:shadow-md hover:from-brand-600 hover:to-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex-shrink-0"
          >
            {sending ? <span className="spinner w-5 h-5" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
