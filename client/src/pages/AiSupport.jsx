import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";

export default function AISupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && chat.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setChat([
          {
            sender: "ai",
            text: "Welcome to Social App! I'm your AI assistant. How can I help you today?",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const renderReply = (reply) => {
    if (!reply) return null;

    // If string, render directly
    if (typeof reply === "string")
      return <p className="text-sm leading-relaxed">{reply}</p>;

    // If object, render fields
    if (typeof reply === "object") {
      return (
        <div className="space-y-2 text-sm">
          {reply.description && <p>{reply.description}</p>}

          {reply.batch && (
            <div className="ml-2">
              <p>Batch ID: {reply.batch.batch_id}</p>
              <p>Material: {reply.batch.material}</p>
              <p>Quantity: {reply.batch.quantity}</p>
              <p>Status: {reply.batch.status}</p>
              <p>
                Inspection Required:{" "}
                {reply.batch.inspection_required ? "Yes" : "No"}
              </p>
            </div>
          )}

          {reply.batches && reply.batches.length > 0 && (
            <div className="ml-2 space-y-1">
              {reply.batches.map((b) => (
                <div key={b.batch_id}>
                  <p>
                    Batch ID: {b.batch_id}, Material: {b.material}, Status:{" "}
                    {b.status}
                  </p>
                </div>
              ))}
            </div>
          )}

          {reply.won_bids && reply.won_bids.length > 0 && (
            <div className="ml-2 space-y-1">
              {reply.won_bids.map((b, i) => (
                <div key={i}>
                  <p>
                    Batch ID: {b.batch_id}, Material: {b.material}, Price:{" "}
                    {b.price}
                  </p>
                </div>
              ))}
            </div>
          )}

          {reply.bids && reply.bids.length > 0 && (
            <div className="ml-2 space-y-1">
              {reply.bids.map((b, i) => (
                <div key={i}>
                  <p>
                    Batch ID: {b.batch_id}, Buyer: {b.buyer}, Amount: {b.amount}
                    , Status: {b.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // fallback
    return <p>Unable to display response</p>;
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
      const res = await fetch("http://localhost:3000/api/v1/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">S</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Social App</h3>
                <div className="flex items-center gap-1 text-green-100 text-xs">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-[19rem] overflow-y-auto p-4 bg-gray-50 space-y-4">
            {chat.map((c, i) => (
              <div
                key={i}
                className={`flex ${
                  c.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    c.sender === "user"
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-none"
                  }`}
                >
                  {renderReply(c.text)}
                  <span
                    className={`text-xs mt-1 block ${
                      c.sender === "user" ? "text-green-100" : "text-gray-400"
                    }`}
                  >
                    {c.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                rows="1"
                className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                style={{ maxHeight: "100px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by Social App AI Assistant
            </p>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-green-600 to-green-700 text-white w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 flex items-center justify-center relative group"
      >
        {isOpen ? (
          <Minimize2 className="w-7 h-7" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              1
            </span>
          </>
        )}

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Need help? Chat with us!
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        )}
      </button>
    </div>
  );
}
