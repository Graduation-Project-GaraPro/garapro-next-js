"use client";

import { useState } from 'react';
import { Phone, MapPin, Clock, AlertTriangle, Car, Wrench } from 'lucide-react';

export default function EmergencyRescue() {
  const [emergencyRequests, setEmergencyRequests] = useState([
    {
      id: 1,
      vehicle: 'Honda Civic 2020',
      issue: 'Xe bị hỏng giữa đường',
      location: '123 Đường ABC, Quận 1, TP.HCM',
      priority: 'high',
      status: 'pending',
      time: '2025-01-15 14:30',
      phone: '0901234567'
    },
    {
      id: 2,
      vehicle: 'Toyota Camry 2019',
      issue: 'Xe không nổ máy',
      location: '456 Đường XYZ, Quận 3, TP.HCM',
      priority: 'medium',
      status: 'in-progress',
      time: '2025-01-15 13:45',
      phone: '0907654321'
    }
  ]);

  const [newRequest, setNewRequest] = useState({
    vehicle: '',
    issue: '',
    location: '',
    phone: '',
    priority: 'high'
  });

  const [toast, setToast] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatWith, setChatWith] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const handleSubmitEmergency = (e) => {
    e.preventDefault();
    const request = {
      id: emergencyRequests.length + 1,
      ...newRequest,
      status: 'pending',
      time: new Date().toLocaleString('vi-VN')
    };
    setEmergencyRequests([...emergencyRequests, request]);
    setNewRequest({ vehicle: '', issue: '', location: '', phone: '', priority: 'high' });
    setToast('Yêu cầu cứu hộ đã được gửi! Đội ngũ kỹ thuật sẽ liên hệ trong vòng 15 phút.');
    setTimeout(() => setToast(''), 2500);
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">{toast}</div>
      )}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <h2 className="text-2xl font-bold text-red-800">Dịch vụ cứu hộ khẩn cấp</h2>
        </div>
        <p className="text-red-700 mb-4">
          Dịch vụ cứu hộ 24/7 - Đội ngũ kỹ thuật viên sẽ có mặt trong vòng 30 phút
        </p>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleCall('1900123456')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center"
          >
            <Phone className="h-5 w-5 mr-2" />
            Gọi cứu hộ ngay
          </button>
          <span className="text-red-600 font-medium">Hotline: 1900 123 456</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Car className="h-6 w-6 mr-2 text-blue-600" />
            Gửi yêu cầu cứu hộ
          </h3>
          <form onSubmit={handleSubmitEmergency} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thông tin xe</label>
              <input
                type="text"
                value={newRequest.vehicle}
                onChange={(e) => setNewRequest({ ...newRequest, vehicle: e.target.value })}
                placeholder="VD: Honda Civic 2020"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vấn đề gặp phải</label>
              <input
                type="text"
                value={newRequest.issue}
                onChange={(e) => setNewRequest({ ...newRequest, issue: e.target.value })}
                placeholder="VD: Xe không nổ máy, hỏng phanh..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí hiện tại</label>
              <input
                type="text"
                value={newRequest.location}
                onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                placeholder="Địa chỉ chi tiết hoặc tọa độ GPS"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="tel"
                value={newRequest.phone}
                onChange={(e) => setNewRequest({ ...newRequest, phone: e.target.value })}
                placeholder="0901234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ khẩn cấp</label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="high">Cao - Cần cứu hộ ngay</option>
                <option value="medium">Trung bình - Có thể chờ</option>
                <option value="low">Thấp - Sắp xếp sau</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition duration-200"
            >
              Gửi yêu cầu cứu hộ
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Wrench className="h-6 w-6 mr-2 text-green-600" />
            Yêu cầu cứu hộ gần đây
          </h3>
          <div className="space-y-4">
            {emergencyRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{request.vehicle}</h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      request.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : request.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {request.priority === 'high' ? 'Cao' : request.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{request.issue}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{request.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{request.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCall(request.phone)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Gọi lại
                    </button>
                    <button
                      onClick={() => {
                        setChatWith(`KTV cứu hộ #${request.id}`);
                        setChatMessages([
                          { id: 1, from: 'tech', text: 'Xin chào! Tôi đang trên đường tới vị trí của bạn.', time: new Date().toLocaleTimeString('vi-VN') }
                        ]);
                        setShowChat(true);
                      }}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Nhắn tin
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
            <span className="font-semibold">Chat với {chatWith}</span>
            <button onClick={() => setShowChat(false)} className="text-white/90 hover:text-white">×</button>
          </div>
          <div className="h-64 p-4 overflow-y-auto space-y-2 bg-gray-50">
            {chatMessages.map((m) => (
              <div key={m.id} className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${m.from === 'me' ? 'bg-red-600 text-white ml-auto' : 'bg-white border border-gray-200'}`}>
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
              setTimeout(() => {
                setChatMessages((prev) => [
                  ...prev,
                  { id: prev.length + 1, from: 'tech', text: 'Đã nhận vị trí, vui lòng giữ liên lạc.', time: new Date().toLocaleTimeString('vi-VN') }
                ]);
              }, 800);
            }}
            className="flex items-center p-2 bg-white border-t border-gray-200"
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button type="submit" className="ml-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Gửi</button>
          </form>
        </div>
      )}
    </div>
  );
}
