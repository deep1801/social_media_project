import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2, Sparkles } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export default function AISupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && chat.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setChat([
          {
            sender: "ai",
            text: "Hi! I'm your Social App assistant. How can I help you today? 👋",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 800);
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isTyping]);
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const renderReply = (reply) => {
    if (!reply) return null;
    if (typeof reply === "string")
      return <p className="text-sm leading-relaxed">{reply}</p>;
    if (typeof reply === "object") {
      return (
        <div className="space-y-1.5 text-sm">
          {reply.description && <p>{reply.description}</p>}
          {reply.batch && (
            <div className="ml-2 space-y-0.5 text-xs opacity-80">
              <p>
                Batch: {reply.batch.batch_id} · {reply.batch.material}
              </p>
              <p>
                Qty: {reply.batch.quantity} · Status: {reply.batch.status}
              </p>
            </div>
          )}
          {reply.batches?.length > 0 && (
            <div className="ml-2 space-y-0.5 text-xs opacity-80">
              {reply.batches.map((b) => (
                <p key={b.batch_id}>
                  {b.batch_id} · {b.material} · {b.status}
                </p>
              ))}
            </div>
          )}
          {reply.won_bids?.length > 0 && (
            <div className="ml-2 space-y-0.5 text-xs opacity-80">
              {reply.won_bids.map((b, i) => (
                <p key={i}>
                  {b.batch_id} · {b.material} · {b.price}
                </p>
              ))}
            </div>
          )}
          {reply.bids?.length > 0 && (
            <div className="ml-2 space-y-0.5 text-xs opacity-80">
              {reply.bids.map((b, i) => (
                <p key={i}>
                  {b.batch_id} · {b.buyer} · {b.amount} · {b.status}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return <p className="text-sm">Unable to display response</p>;
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMessage = {
      sender: "user",
      text: message,
      timestamp: new Date(),
    };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);
    try {
      const { data } = await axiosInstance.post("/api/v1/assistant/chat", {
        message,
      });
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          { sender: "ai", text: data.reply, timestamp: new Date() },
        ]);
        setIsTyping(false);
      }, 600);
    } catch (err) {
      console.error("AI chat error:", err?.response?.data || err.message);
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 600);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[22rem] bg-white rounded-2xl shadow-dropdown border border-gray-100 overflow-hidden flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AI Assistant</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-white/70 text-[11px]">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {chat.map((c, i) => (
              <div
                key={i}
                className={`flex ${c.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    c.sender === "user"
                      ? "bg-brand-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-card rounded-bl-md border border-gray-100"
                  }`}
                >
                  {renderReply(c.text)}
                  <span
                    className={`text-[10px] mt-1 block ${c.sender === "user" ? "text-brand-200" : "text-gray-400"}`}
                  >
                    {c.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-card border border-gray-100">
                  <div className="flex gap-1 items-center">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything…"
                rows="1"
                className="flex-1 resize-none input-field py-2.5 text-sm"
                style={{ maxHeight: "80px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="btn-primary p-2.5 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-dropdown hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center relative"
      >
        {isOpen ? (
          <Minimize2 size={22} />
        ) : (
          <>
            <MessageCircle size={22} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
              1
            </span>
          </>
        )}
      </button>
    </div>
  );
}
