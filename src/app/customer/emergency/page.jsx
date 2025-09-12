"use client";

import { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, AlertTriangle, Car, Wrench, FileText, Eye } from 'lucide-react';
import useEmergencyRequestForm from '@/hooks/useEmergencyRequestForm';
import TechnicianChat from '@/components/TechnicianChat';
import RescueMap from '@/components/RescueMap';
import RescueStatus from '@/components/RescueStatus';
import { generatePdfFromHtml, buildQuotationHtml } from '@/utils/pdf';

export default function EmergencyRescue() {
  // State cho bản đồ và trạng thái cứu hộ
  const [showRescueDetails, setShowRescueDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [rescueTeamLocation, setRescueTeamLocation] = useState(null);
  
  const [emergencyRequests, setEmergencyRequests] = useState([
    {
      id: 1,
      vehicle: 'Honda Civic 2020',
      licensePlate: '59A-123.45',
      issue: 'Xe bị hỏng giữa đường',
      location: '123 Đường ABC, Quận 1, TP.HCM',
      priority: 'high',
      status: 'on-the-way',
      time: '2025-01-15 14:30',
      phone: '0901234567',
      coordinates: { lat: 10.772621, lng: 106.698891 },
      estimatedTime: 15
    },
    {
      id: 2,
      vehicle: 'Toyota Camry 2019',
      licensePlate: '51G-678.90',
      issue: 'Xe không nổ máy',
      location: '456 Đường XYZ, Quận 3, TP.HCM',
      priority: 'medium',
      status: 'confirmed',
      time: '2025-01-15 13:45',
      phone: '0907654321',
      coordinates: { lat: 10.762622, lng: 106.660172 },
      estimatedTime: 20
    }
  ]);

  const { formData: newRequest, errors, handleChange, handleSubmit, reset } = useEmergencyRequestForm({
    vehicle: '',
    licensePlate: '',
    issue: '',
    location: '',
    phone: '',
    priority: 'high'
  });

  const [toast, setToast] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatWith, setChatWith] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // Chuyển đổi địa chỉ thành tọa độ (mô phỏng)
  const geocodeAddress = (address) => {
    // Trong thực tế, bạn sẽ sử dụng Google Maps Geocoding API
    // Ở đây chúng ta mô phỏng bằng cách tạo tọa độ ngẫu nhiên quanh TP.HCM
    const baseLat = 10.762622;
    const baseLng = 106.660172;
    const randomLat = baseLat + (Math.random() - 0.5) * 0.05;
    const randomLng = baseLng + (Math.random() - 0.5) * 0.05;
    
    return { lat: randomLat, lng: randomLng };
  };
  
  const handleSubmitEmergency = async (e) => {
    e.preventDefault();
    const result = await handleSubmit(async (payload) => {
      const coordinates = geocodeAddress(payload.location);
      const request = {
        id: emergencyRequests.length + 1,
        ...payload,
        status: 'pending',
        time: new Date().toLocaleString('vi-VN'),
        coordinates,
        estimatedTime: Math.floor(Math.random() * 20) + 10
      };
      setEmergencyRequests(prev => [...prev, request]);
    });
    if (result.ok) {
      reset();
      setToast('Yêu cầu cứu hộ đã được gửi! Đội ngũ kỹ thuật sẽ liên hệ trong vòng 15 phút.');
      setTimeout(() => setToast(''), 2500);
    }
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`);
  };

  // Xử lý khi vị trí đội cứu hộ thay đổi
  const handleRescueTeamLocationChange = (newLocation) => {
    setRescueTeamLocation(newLocation);
    
    if (selectedRequest) {
      // Cập nhật thời gian ước tính
      const updatedRequest = { ...selectedRequest, estimatedTime: newLocation.estimatedTime };
      setSelectedRequest(updatedRequest);
      
      // Cập nhật trong danh sách yêu cầu
      const updatedRequests = emergencyRequests.map(req => 
        req.id === selectedRequest.id ? updatedRequest : req
      );
      setEmergencyRequests(updatedRequests);
    }
  };
  
  // Xử lý khi chọn xem chi tiết yêu cầu cứu hộ
  const handleViewRescueDetails = (request) => {
    setSelectedRequest(request);
    setCustomerLocation(request.coordinates);
    
    // Tạo vị trí mô phỏng cho đội cứu hộ (cách vị trí khách hàng một khoảng)
    const rescueTeamLat = request.coordinates.lat - 0.02;
    const rescueTeamLng = request.coordinates.lng - 0.01;
    setRescueTeamLocation({
      lat: rescueTeamLat,
      lng: rescueTeamLng,
      estimatedTime: request.estimatedTime
    });
    
    setShowRescueDetails(true);
  };
  
  // Mô phỏng cập nhật trạng thái cứu hộ
  useEffect(() => {
    if (!selectedRequest) return;
    
    const interval = setInterval(() => {
      // Mô phỏng cập nhật trạng thái theo thời gian
      setEmergencyRequests(prevRequests => {
        return prevRequests.map(req => {
          if (req.id === selectedRequest.id) {
            // Cập nhật trạng thái theo quy trình
            let newStatus = req.status;
            if (req.status === 'pending') newStatus = 'confirmed';
            else if (req.status === 'confirmed') newStatus = 'on-the-way';
            else if (req.status === 'on-the-way') newStatus = 'arrived';
            else if (req.status === 'arrived') newStatus = 'completed';
            
            // Chỉ cập nhật nếu trạng thái thay đổi
            if (newStatus !== req.status) {
              const updatedReq = { ...req, status: newStatus };
              // Cập nhật selectedRequest nếu đang được chọn
              if (selectedRequest.id === req.id) {
                setSelectedRequest(updatedReq);
              }
              return updatedReq;
            }
          }
          return req;
        });
      });
    }, 20000); // 20 giây
    
    return () => clearInterval(interval);
  }, [selectedRequest]);
  
  const handleExportPdf = async (request) => {
    try {
      const htmlContent = buildQuotationHtml({
        code: `ER${request.id}`,
        date: request.time,
        vehicle: request.vehicle,
        licensePlate: request.licensePlate,
        issue: request.issue,
        partsCost: 0,
        laborCost: 0,
        totalCost: 0
      });
      
      await generatePdfFromHtml(htmlContent, `cuu-ho-${request.licensePlate.replace(/\s+/g, '-')}.pdf`);
      setToast('Đã xuất file PDF thành công!');
      setTimeout(() => setToast(''), 2500);
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      setToast('Có lỗi khi xuất file PDF. Vui lòng thử lại sau.');
      setTimeout(() => setToast(''), 2500);
    }
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

      {/* Hiển thị chi tiết cứu hộ khi được chọn */}
      {showRescueDetails && selectedRequest && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <Car className="h-6 w-6 mr-2 text-red-600" />
              Chi tiết yêu cầu cứu hộ
            </h3>
            <button 
              onClick={() => setShowRescueDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Đóng
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bản đồ */}
            <div>
              <h4 className="font-medium mb-2">Vị trí trên bản đồ</h4>
              <RescueMap 
                location={customerLocation}
                technicianLocation={rescueTeamLocation}
                onRescueTeamLocationChange={handleRescueTeamLocationChange}
              />
            </div>
            
            {/* Trạng thái cứu hộ */}
            <RescueStatus 
              status={selectedRequest.status}
              estimatedArrival={new Date(Date.now() + selectedRequest.estimatedTime * 60000).toISOString()}
              requestTime={new Date().toISOString()}
              vehicleInfo={selectedRequest.vehicle}
              licensePlate={selectedRequest.licensePlate}
              updateStatus={(newStatus) => {
                const updatedRequest = { ...selectedRequest, status: newStatus };
                setSelectedRequest(updatedRequest);
                setEmergencyRequests(prevRequests => 
                  prevRequests.map(req => req.id === selectedRequest.id ? updatedRequest : req)
                );
              }}
              generatePdf={() => handleExportPdf(selectedRequest)}
            />
          </div>
        </div>
      )}
      
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
                onChange={(e) => { handleChange('vehicle', e.target.value); }}
                placeholder="VD: Honda Civic 2020"
                className={`w-full px-4 py-3 border ${errors.vehicle ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                required
              />
              {errors.vehicle && <p className="mt-1 text-sm text-red-600">{errors.vehicle}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biển số xe</label>
              <input
                type="text"
                value={newRequest.licensePlate}
                onChange={(e) => { handleChange('licensePlate', e.target.value); }}
                placeholder="VD: 59A-123.45"
                className={`w-full px-4 py-3 border ${errors.licensePlate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                required
              />
              {errors.licensePlate && <p className="mt-1 text-sm text-red-600">{errors.licensePlate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vấn đề gặp phải</label>
              <input
                type="text"
                value={newRequest.issue}
                onChange={(e) => { handleChange('issue', e.target.value); }}
                placeholder="VD: Xe không nổ máy, hỏng phanh..."
                className={`w-full px-4 py-3 border ${errors.issue ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                required
              />
              {errors.issue && <p className="mt-1 text-sm text-red-600">{errors.issue}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí hiện tại</label>
              <input
                type="text"
                value={newRequest.location}
                onChange={(e) => { handleChange('location', e.target.value); }}
                placeholder="Địa chỉ chi tiết hoặc tọa độ GPS"
                className={`w-full px-4 py-3 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                required
              />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="tel"
                value={newRequest.phone}
                onChange={(e) => { handleChange('phone', e.target.value); }}
                placeholder="0901234567"
                className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                required
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ khẩn cấp</label>
              <select
                value={newRequest.priority}
                onChange={(e) => { handleChange('priority', e.target.value); }}
                className={`w-full px-4 py-3 border ${errors.priority ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              >
                <option value="high">Cao - Cần cứu hộ ngay</option>
                <option value="medium">Trung bình - Có thể chờ</option>
                <option value="low">Thấp - Sắp xếp sau</option>
              </select>
              {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority}</p>}
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
                  <div>
                    <h4 className="font-semibold">{request.vehicle}</h4>
                    <p className="text-xs text-gray-500">BS: {request.licensePlate}</p>
                  </div>
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
                    <button
                      onClick={() => handleViewRescueDetails(request)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Theo dõi
                    </button>
                    <button
                      onClick={() => handleExportPdf(request)}
                      className="text-purple-600 hover:text-purple-800 font-medium flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Xuất PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TechnicianChat 
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        technicianName={chatWith}
        initialMessages={chatMessages}
        accentColor="red"
        sendMessage={(msg) => {
          const newMessage = {
            id: chatMessages.length + 1,
            from: 'user',
            text: msg,
            time: new Date().toLocaleTimeString('vi-VN')
          };
          setChatMessages([...chatMessages, newMessage]);
        }}
      />
    </div>
  );
}
