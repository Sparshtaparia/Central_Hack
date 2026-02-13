// src/components/AIChatbot.tsx
import { useState } from "react";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY; // Your OpenRouter key

  const sendMessage = async () => {
    if (!input) return;

    setMessages([...messages, { from: "user", text: input }]);
    const userInput = input;
    setInput("");

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: userInput }],
        }),
      });

      const data = await res.json();
      const botReply = data?.choices?.[0]?.message?.content || "I didn't get that!";
      setMessages(prev => [...prev, { from: "bot", text: botReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { from: "bot", text: "Error connecting to OpenRouter." }]);
      console.error(err);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-24 right-4 md:right-8 w-72 sm:w-80 z-50 transform transition-transform duration-300 ease-in-out animate-float">
          <div className="bg-white border rounded-lg shadow-xl flex flex-col h-96">
            <div className="flex justify-between items-center p-2 border-b">
              <span className="font-bold">AI Chatbot</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded max-w-[80%] ${
                    m.from === "user"
                      ? "bg-blue-200 self-end"
                      : "bg-gray-200 self-start"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="flex p-2 border-t">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 border rounded p-1 mr-2 outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type a message..."
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 md:bottom-10 right-4 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform animate-float"
        >
          💰
        </button>
      )}

      {/* Tailwind keyframe animation for subtle floating */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>
    </>
  );
};

export default AIChatbot;
