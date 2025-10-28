"use client";
import { useState, useRef, useEffect } from "react";
import { askAIStream } from "../lib/aiService";
import { Send } from "lucide-react";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, user: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // show typing
    setIsTyping(true);
    setMessages((prev) => [...prev, { text: "", user: false }]);
    let fullReply = "";

    await askAIStream(input, (word) => {
      fullReply += (fullReply ? " " : "") + word;
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { text: fullReply, user: false };
        return updated;
      });
    });

    setIsTyping(false);
  };

  // 🔥 Smart autoscroll logic
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (autoScroll && container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping, autoScroll]);

  // detect when user manually scrolls up (disable auto-scroll)
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const atBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 10;
    setAutoScroll(atBottom);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-black border border-purple-700 text-white shadow-lg rounded-none md:rounded-xl overflow-hidden min-h-[60vh] md:min-h-[500px] max-h-[85vh] relative">
      <h2 className="font-semibold text-lg md:text-xl text-purple-300 px-4 pt-3 pb-2 z-10 relative drop-shadow-neon">
        AI Chatbot
      </h2>

      {/* Chat container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.user ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] break-words transition-all ${
                msg.user
                  ? "bg-purple-700 text-purple-100 shadow-neon"
                  : "bg-cyan-700 text-cyan-100 shadow-neon"
              }`}
            >
              {msg.text}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <span className="inline-block px-4 py-2 rounded-2xl max-w-[30%] bg-cyan-700 text-cyan-100 shadow-neon animate-pulse">
              typing...
            </span>
          </div>
        )}
      </div>

      {/* Input field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex items-center gap-3 p-3 md:p-4 border-t border-purple-700 bg-gray-900/90 sticky bottom-0 backdrop-blur-sm"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full px-4 py-2 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center"
        >
          <Send size={18} className="text-white" />
        </button>
      </form>

      <style jsx>{`
        .drop-shadow-neon {
          text-shadow: 0 0 6px #a855f7, 0 0 12px #06b6d4;
        }
        .shadow-neon {
          box-shadow: 0 0 10px 2px rgba(168, 85, 247, 0.5),
            0 0 4px 1px rgba(6, 182, 212, 0.4) inset;
        }
      `}</style>
    </div>
  );
}
