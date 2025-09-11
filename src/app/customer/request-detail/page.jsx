"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Car, Calendar, User, Phone, MapPin, Wrench, CheckCircle, Clock, AlertTriangle, Download, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function RequestDetailPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatWith, setChatWith] = useState('Kỹ thuật viên');

  useEffect(() => {
    // Simulate loading request details
    const mockRequest = {
      id: requestId || 1,
      vehicle: 'Honda Civic 2020',
      licensePlate: '59A-123.45',
      issue: 'Động cơ kêu lạ khi khởi động',
      description: 'Xe phát ra tiếng kêu lạ khi khởi động, đặc biệt vào buổi sáng. Tiếng kêu giống như kim loại va chạm và kéo dài khoảng 2-3 giây sau khi nổ máy.',
      priority: 'high',
      status: 'in-progress',
      date: '2025-01-15',
      time: '14:30',
      customerName: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      technician: 'Trần Văn B',
      estimatedCost: 2500000,
      actualCost: 0,
      estimatedTime: '2-3 ngày',
      progress: 65,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop'
      ],
      parts: [
        { name: 'Bugi', quantity: 4, price: 200000, status: 'ordered' },
        { name: 'Dây bugi', quantity: 1, price: 150000, status: 'installed' },
        { name: 'Bộ lọc nhiên liệu', quantity: 1, price: 300000, status: 'pending' }
      ],
      timeline: [
        { date: '2025-01-15 14:30', action: 'Tiếp nhận yêu cầu', status: 'completed' },
        { date: '2025-01-15 15:00', action: 'Chẩn đoán sơ bộ', status: 'completed' },
        { date: '2025-01-16 09:00', action: 'Thay dây bugi', status: 'completed' },
        { date: '2025-01-16 14:00', action: 'Thay bugi', status: 'in-progress' },
        { date: '2025-01-17 09:00', action: 'Thay bộ lọc nhiên liệu', status: 'pending' },
        { date: '2025-01-17 16:00', action: 'Kiểm tra và bàn giao', status: 'pending' }
      ]
    };
    
    setTimeout(() => {
      setRequest(mockRequest);
      setLoading(false);
    }, 1000);
  }, [requestId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy yêu cầu</h2>
        <p className="text-gray-600 mb-4">Yêu cầu sửa chữa không tồn tại hoặc đã bị xóa.</p>
        <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in-progress': return 'Đang xử lý';
      case 'pending': return 'Chờ xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Chi tiết yêu cầu sửa chữa</h1>
          <p className="text-gray-600">Mã yêu cầu: #{request.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Thông tin yêu cầu</h2>
              <div className="flex space-x-2">
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(request.priority)}`}>
                  {getPriorityText(request.priority)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Car className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{request.vehicle}</p>
                  <p className="text-sm text-gray-600">Phương tiện</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Car className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{request.licensePlate}</p>
                  <p className="text-sm text-gray-600">Biển số</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{request.date} - {request.time}</p>
                  <p className="text-sm text-gray-600">Thời gian tiếp nhận</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">{request.technician}</p>
                  <p className="text-sm text-gray-600">Kỹ thuật viên</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">{request.estimatedTime}</p>
                  <p className="text-sm text-gray-600">Thời gian dự kiến</p>
                </div>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Mô tả vấn đề</h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{request.issue}</p>
              </div>
              <div>
                <p className="text-gray-700">{request.description}</p>
              </div>
            </div>
          </div>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Hình ảnh</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {request.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Hình ảnh ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Parts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Phụ tùng</h3>
            <div className="space-y-3">
              {request.parts.map((part, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wrench className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{part.name}</p>
                      <p className="text-sm text-gray-600">Số lượng: {part.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{part.price.toLocaleString('vi-VN')} VNĐ</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      part.status === 'installed' ? 'bg-green-100 text-green-800' :
                      part.status === 'ordered' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {part.status === 'installed' ? 'Đã lắp' :
                       part.status === 'ordered' ? 'Đã đặt' : 'Chờ xử lý'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Tiến độ thực hiện</h3>
            <div className="space-y-4">
              {request.timeline.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'in-progress' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-gray-600">{item.date}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status === 'completed' ? 'Hoàn thành' :
                     item.status === 'in-progress' ? 'Đang thực hiện' : 'Chờ xử lý'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin khách hàng</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{request.customerName}</p>
                  <p className="text-sm text-gray-600">Tên khách hàng</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{request.phone}</p>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-sm">{request.address}</p>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Chi phí</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Dự kiến:</span>
                <span className="font-medium">{request.estimatedCost.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              {request.actualCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thực tế:</span>
                  <span className="font-medium text-green-600">{request.actualCost.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Tiến độ</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Hoàn thành</span>
                <span className="font-medium">{request.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${request.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Hành động</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setChatWith(request.technician || 'Kỹ thuật viên');
                  setChatMessages([
                    { id: 1, from: 'tech', text: 'Xin chào, tôi là KTV phụ trách yêu cầu của bạn. Tôi có thể hỗ trợ gì?', time: new Date().toLocaleTimeString('vi-VN') }
                  ]);
                  setShowChat(true);
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Liên hệ kỹ thuật viên
              </button>
              <button
                onClick={async () => {
                  const [{ default: jsPDF }, html2canvas] = await Promise.all([
                    import('jspdf').then(m => ({ default: m.default })),
                    import('html2canvas')
                  ]);
                  const container = document.createElement('div');
                  container.style.position = 'fixed';
                  container.style.left = '-10000px';
                  container.style.top = '0';
                  container.style.width = '794px';
                  container.style.padding = '24px';
                  container.style.background = '#ffffff';
                  container.innerHTML = `
                    <h2 style="font-size:18px;margin:0 0 12px 0;">BÁO CÁO YÊU CẦU SỬA CHỮA #${request.id}</h2>
                    <div style="font-size:13px;line-height:1.5">
                      <div><b>Xe:</b> ${request.vehicle}</div>
                      <div><b>Vấn đề:</b> ${request.issue}</div>
                      <div><b>Kỹ thuật viên:</b> ${request.technician}</div>
                      <div><b>Ngày tiếp nhận:</b> ${request.date} ${request.time}</div>
                      <div><b>Tiến độ:</b> ${request.progress}%</div>
                    </div>
                  `;
                  document.body.appendChild(container);
                  const canvas = await html2canvas.default(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                  const imgData = canvas.toDataURL('image/png');
                  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
                  const pageWidth = pdf.internal.pageSize.getWidth();
                  const imgWidth = pageWidth;
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;
                  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                  pdf.save(`bao_cao_yeu_cau_${request.id}.pdf`);
                  document.body.removeChild(container);
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải báo cáo
              </button>
            </div>
          </div>
        </div>
      </div>
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
            <span className="font-semibold">Chat với {chatWith}</span>
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
              setTimeout(() => {
                setChatMessages((prev) => [
                  ...prev,
                  { id: prev.length + 1, from: 'tech', text: 'Đã nhận thông tin. Tôi sẽ phản hồi sớm!', time: new Date().toLocaleTimeString('vi-VN') }
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
    </div>
  );
}
