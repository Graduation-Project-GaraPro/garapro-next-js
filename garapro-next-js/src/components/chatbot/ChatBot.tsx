"use client";

import { useState } from "react";
import { FaComments, FaTimes } from "react-icons/fa";

const ChatBotUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý của GaraPro. Tôi có thể giúp gì cho bạn về dịch vụ sửa chữa xe hoặc đặt lịch hẹn?",
      sender: "bot",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const sampleResponses = [
        "Cảm ơn bạn đã liên hệ với GaraPro. Chúng tôi sẽ phản hồi sớm nhất có thể.",
        "Bạn có thể đặt lịch hẹn sửa chữa xe thông qua ứng dụng hoặc gọi số hotline của chúng tôi.",
        "Chúng tôi cung cấp nhiều dịch vụ bảo dưỡng và sửa chữa xe. Bạn cần hỗ trợ cụ thể về vấn đề gì?",
        "Kỹ thuật viên của chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",
        "Bạn có thể kiểm tra tình trạng sửa chữa xe của mình trong mục 'Theo dõi sửa chữa' trên ứng dụng.",
      ];

      const randomResponse =
        sampleResponses[Math.floor(Math.random() * sampleResponses.length)];

      const botMsg = {
        id: Date.now() + 1,
        text: randomResponse,
        sender: "bot",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);

    setInput("");
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Nút mở Chatbot */}
      <button
        onClick={toggleChat}
        className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-110 focus:outline-none cursor-pointer"
        aria-label="Open Chatbot"
      >
        <FaComments className="w-10 h-10" />
      </button>

      {/* Khung Chatbot */}
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-[28rem] bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 ease-out translate-y-4 animate-slide-up">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">GaraPro Chat</h3>
            <button
              onClick={toggleChat}
              className="text-white hover:text-slate-300 focus:outline-none"
              aria-label="Close Chatbot"
            >
              <FaTimes className="w-5 h-5 cursor-pointer" />
            </button>
          </div>

          {/* Khung tin nhắn */}
          <div className="h-[30rem] p-4 overflow-y-auto bg-slate-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <div className="flex flex-col space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.sender === "user"
                      ? "bg-red-600 text-white self-end"
                      : "bg-gray-200 text-gray-800 self-start"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.text}
                    <span className="text-xs text-gray-500 ml-2">
                      {msg.time}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ô nhập */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSend}>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Nhập câu hỏi của bạn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700"
                />
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 cursor-pointer"
                >
                  Gửi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotUI;
