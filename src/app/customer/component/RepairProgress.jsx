"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, Wrench, MessageCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function RepairProgress() {
  const [repairRequests, setRepairRequests] = useState([]);
  const [contactToast, setContactToast] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [activeTech, setActiveTech] = useState({ id: null, name: 'Kỹ thuật viên' });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // search & filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | in-progress | completed
  const [priorityFilter, setPriorityFilter] = useState('all'); // all | high | medium | low

  useEffect(() => {
    setRepairRequests([
      { id: 1, vehicle: 'Honda Civic 2020', issue: 'Động cơ kêu lạ', status: 'pending', date: '2024-09-10', priority: 'high' },
      { id: 2, vehicle: 'Toyota Camry 2019', issue: 'Thay dầu máy', status: 'in-progress', date: '2024-09-08', priority: 'medium' },
      { id: 3, vehicle: 'BMW X5 2021', issue: 'Kiểm tra phanh', status: 'completed', date: '2024-09-05', priority: 'low' },
    ]);
  }, []);

  const visibleRequests = repairRequests.filter((r) => {
    const matchesSearch =
      r.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <>
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Theo dõi tiến độ sửa chữa</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo xe hoặc vấn đề..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Lọc trạng thái"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="in-progress">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Lọc mức ưu tiên"
              >
                <option value="all">Tất cả ưu tiên</option>
                <option value="high">Ưu tiên cao</option>
                <option value="medium">Ưu tiên trung bình</option>
                <option value="low">Ưu tiên thấp</option>
              </select>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {visibleRequests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      request.status === 'completed'
                        ? 'bg-green-500'
                        : request.status === 'in-progress'
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-yellow-500'
                    }`}
                  />
                  <h3 className="text-lg font-semibold">{request.vehicle}</h3>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      request.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : request.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {request.priority === 'high'
                      ? 'Ưu tiên cao'
                      : request.priority === 'medium'
                      ? 'Ưu tiên trung bình'
                      : 'Ưu tiên thấp'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{request.date}</span>
              </div>
              <p className="text-gray-700 mb-4">{request.issue}</p>
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className={`flex items-center space-x-2 ${
                    ['pending', 'in-progress', 'completed'].includes(request.status)
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Tiếp nhận</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200">
                  <div
                    className={`h-full ${
                      ['in-progress', 'completed'].includes(request.status)
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } transition-all duration-500`}
                  />
                </div>
                <div
                  className={`flex items-center space-x-2 ${
                    ['in-progress', 'completed'].includes(request.status)
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                >
                  <Wrench className="h-5 w-5" />
                  <span className="text-sm">Đang sửa</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200">
                  <div
                    className={`h-full ${
                      request.status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                    } transition-all duration-500`}
                  />
                </div>
                <div
                  className={`flex items-center space-x-2 ${
                    request.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Hoàn thành</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Link 
                  href={`/request-detail?requestId=${request.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Xem chi tiết
                </Link>
                <button
                  onClick={() => {
                    setActiveTech({ id: request.id, name: 'KTV phụ trách #' + request.id });
                    setChatMessages([
                      { id: 1, from: 'tech', text: `Xin chào! Tôi là KTV phụ trách yêu cầu #${request.id}. Tôi có thể hỗ trợ gì?`, time: new Date().toLocaleTimeString('vi-VN') }
                    ]);
                    setShowChat(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <MessageCircle className="h-4 w-4 inline mr-2" />
                  Liên hệ kỹ thuật viên
                </button>
              </div>
            </div>
          ))}
          {visibleRequests.length === 0 && (
            <div className="text-center text-gray-500 py-10">Không tìm thấy yêu cầu phù hợp.</div>
          )}
        </div>
      </div>
    </div>
    {contactToast && (
      <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">{contactToast}</div>
    )}
    {showChat && (
      <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
          <span className="font-semibold">Chat với {activeTech.name}</span>
          <button onClick={() => setShowChat(false)} className="text-white/90 hover:text-white">×</button>
        </div>
        <div className="h-64 p-4 overflow-y-auto space-y-2 bg-gray-50">
          {chatMessages.map((m) => (
            <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${m.from === 'me' ? 'bg-blue-600 text-white ml-auto' : 'bg-white border border-gray-200'}`}>
              <div>{m.text}</div>
              <div className="text-[10px] opacity-70 mt-1 text-right">{m.time}</div>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!chatInput.trim()) return;
            setChatMessages((prev) => [
              ...prev,
              { id: prev.length + 1, from: 'me', text: chatInput.trim(), time: new Date().toLocaleTimeString('vi-VN') }
            ]);
            setChatInput('');
            // Giả lập phản hồi
            setTimeout(() => {
              setChatMessages((prev) => [
                ...prev,
                { id: prev.length + 1, from: 'tech', text: 'Đã nhận thông tin, tôi sẽ kiểm tra ngay.', time: new Date().toLocaleTimeString('vi-VN') }
              ]);
            }, 800);
          }}
          className="flex items-center p-2 bg-white border-t border-gray-200"
        >
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button type="submit" className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Gửi</button>
        </form>
      </div>
    )}
    </>
  );
}