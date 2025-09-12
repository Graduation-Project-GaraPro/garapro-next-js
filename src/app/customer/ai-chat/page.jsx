"use client";

import { useState } from 'react';
import { MessageCircle, Send, Bot, User, Car, Wrench, AlertTriangle } from 'lucide-react';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Xin chào! Tôi là AI chuyên gia chẩn đoán xe. Hãy mô tả vấn đề bạn đang gặp phải với xe của mình.',
      timestamp: new Date().toLocaleTimeString('vi-VN')
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('vi-VN')
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('vi-VN')
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('động cơ') || input.includes('máy')) {
      return `Dựa trên mô tả của bạn, có thể xe gặp vấn đề về động cơ. Tôi khuyến nghị:\n\n1. Kiểm tra dầu máy\n2. Kiểm tra hệ thống làm mát\n3. Kiểm tra bugi và dây điện\n4. Đưa xe đến garage để chẩn đoán chuyên sâu\n\nBạn có muốn tôi hướng dẫn chi tiết hơn không?`;
    } else if (input.includes('phanh') || input.includes('thắng')) {
      return `Vấn đề về phanh rất quan trọng! Hãy:\n\n1. Kiểm tra mức dầu phanh\n2. Kiểm tra độ dày má phanh\n3. Kiểm tra dây phanh\n4. Không lái xe cho đến khi sửa chữa\n\nTôi khuyến nghị đưa xe đến garage ngay lập tức.`;
    } else if (input.includes('tiếng kêu') || input.includes('ồn')) {
      return `Tiếng kêu lạ có thể do nhiều nguyên nhân:\n\n1. Vấn đề về phanh\n2. Vấn đề về động cơ\n3. Vấn đề về hệ thống treo\n4. Vấn đề về hộp số\n\nBạn có thể mô tả chi tiết hơn về tiếng kêu không?`;
    } else if (input.includes('không nổ máy') || input.includes('không khởi động')) {
      return `Xe không nổ máy có thể do:\n\n1. Hết xăng\n2. Ắc quy yếu\n3. Vấn đề về bugi\n4. Vấn đề về hệ thống đánh lửa\n5. Vấn đề về nhiên liệu\n\nHãy kiểm tra các yếu tố cơ bản trước.`;
    } else {
      return `Cảm ơn bạn đã mô tả vấn đề. Để tôi có thể hỗ trợ tốt hơn, bạn có thể:\n\n1. Mô tả chi tiết hơn về triệu chứng\n2. Cho biết thời gian xảy ra vấn đề\n3. Mô tả âm thanh hoặc cảm giác khi lái xe\n\nTôi sẽ cố gắng đưa ra lời khuyên phù hợp nhất.`;
    }
  };

  const quickQuestions = [
    "Xe không nổ máy",
    "Động cơ kêu lạ",
    "Phanh yếu",
    "Tiếng kêu khi lái xe",
    "Xe bị rung lắc"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Bot className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Chẩn đoán xe</h2>
          <p className="text-gray-600">Hỗ trợ chẩn đoán và tư vấn sửa chữa</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Quick Questions */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Câu hỏi thường gặp:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'bot' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                  {message.type === 'user' && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Mô tả vấn đề của xe..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Mẹo sử dụng AI:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Mô tả chi tiết triệu chứng và âm thanh</li>
          <li>• Cho biết thời gian xảy ra vấn đề</li>
          <li>• Mô tả điều kiện lái xe khi xảy ra vấn đề</li>
          <li>• AI chỉ mang tính chất tham khảo, nên đưa xe đến garage để kiểm tra chuyên sâu</li>
        </ul>
      </div>
    </div>
  );
}