"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, MapPin, Phone, Car, ArrowLeft, Send, Clock } from 'lucide-react';

// Định nghĩa kiểu dữ liệu
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

interface EmergencyRequest {
  id: string;
  vehicleId: string;
  vehicleName: string;
  location: string;
  description: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  createdAt: string;
  estimatedArrival?: string;
}

export default function EmergencyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Dữ liệu mẫu cho phương tiện
  const vehicles: Vehicle[] = [
    { id: '1', make: 'Toyota', model: 'Camry', year: 2019, licensePlate: '29A-12345' },
    { id: '2', make: 'Honda', model: 'Civic', year: 2020, licensePlate: '30A-54321' },
    { id: '3', make: 'Ford', model: 'Ranger', year: 2021, licensePlate: '29B-67890' },
  ];
  
  // Dữ liệu mẫu cho lịch sử yêu cầu cứu hộ
  const emergencyHistory: EmergencyRequest[] = [
    {
      id: '1',
      vehicleId: '1',
      vehicleName: 'Toyota Camry - 29A-12345',
      location: 'Đường Láng, Đống Đa, Hà Nội',
      description: 'Xe không thể khởi động, nghi ngờ do ắc quy',
      status: 'completed',
      createdAt: '2023-05-10T14:30:00Z',
    },
    {
      id: '2',
      vehicleId: '2',
      vehicleName: 'Honda Civic - 30A-54321',
      location: 'Đường Giải Phóng, Hai Bà Trưng, Hà Nội',
      description: 'Lốp xe bị xẹp, cần hỗ trợ thay lốp',
      status: 'completed',
      createdAt: '2023-04-22T09:15:00Z',
    },
  ];
  
  // Dữ liệu mẫu cho yêu cầu đang hoạt động
  const mockActiveRequest: EmergencyRequest = {
    id: '3',
    vehicleId: '3',
    vehicleName: 'Ford Ranger - 29B-67890',
    location: 'Đường Trần Duy Hưng, Cầu Giấy, Hà Nội',
    description: 'Xe bị chết máy giữa đường, không thể khởi động lại',
    status: 'in_progress',
    createdAt: '2023-06-10T10:45:00Z',
    estimatedArrival: '2023-06-10T11:15:00Z',
  };
  
  // Giả lập có một yêu cầu đang hoạt động
  useState(() => {
    setActiveRequest(mockActiveRequest);
  });
  
  // Xử lý khi chuyển bước
  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Xử lý khi gửi yêu cầu cứu hộ
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Giả lập API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Tạo yêu cầu mới và hiển thị
      const newRequest: EmergencyRequest = {
        id: '4',
        vehicleId: selectedVehicle,
        vehicleName: `${vehicles.find(v => v.id === selectedVehicle)?.make} ${vehicles.find(v => v.id === selectedVehicle)?.model} - ${vehicles.find(v => v.id === selectedVehicle)?.licensePlate}`,
        location: location,
        description: description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        estimatedArrival: new Date(Date.now() + 30 * 60000).toISOString(), // 30 phút sau
      };
      
      setActiveRequest(newRequest);
      setStep(1);
      setSelectedVehicle('');
      setLocation('');
      setDescription('');
    }, 1500);
  };
  
  // Kiểm tra xem có thể chuyển sang bước tiếp theo không
  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedVehicle !== '';
      case 2:
        return location.trim() !== '';
      case 3:
        return description.trim() !== '';
      default:
        return true;
    }
  };
  
  // Format thời gian
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Hiển thị trạng thái yêu cầu
  const getStatusInfo = (status: EmergencyRequest['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Đang xử lý',
          color: 'bg-yellow-100 text-yellow-800',
        };
      case 'accepted':
        return {
          label: 'Đã tiếp nhận',
          color: 'bg-blue-100 text-blue-800',
        };
      case 'in_progress':
        return {
          label: 'Đang trên đường',
          color: 'bg-blue-100 text-blue-800',
        };
      case 'completed':
        return {
          label: 'Hoàn thành',
          color: 'bg-green-100 text-green-800',
        };
      default:
        return {
          label: 'Không xác định',
          color: 'bg-gray-100 text-gray-800',
        };
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/customer/services" className="flex items-center text-blue-500 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại danh sách dịch vụ
        </Link>
      </div>
      
      {/* Header */}
      <div className="bg-red-500 text-white p-6 rounded-t-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Dịch vụ cứu hộ khẩn cấp</h1>
            <p className="mt-1 opacity-90">Hỗ trợ 24/7 cho các trường hợp khẩn cấp trên đường</p>
          </div>
        </div>
      </div>
      
      {/* Thông tin liên hệ khẩn cấp */}
      <div className="bg-white p-6 rounded-b-lg shadow-sm mb-6">
        <div className="flex items-center justify-center">
          <div className="bg-red-100 rounded-full p-4">
            <Phone className="h-8 w-8 text-red-500" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold">Hotline cứu hộ: 1900-8888</h2>
            <p className="text-gray-600">Gọi ngay để được hỗ trợ nhanh nhất</p>
          </div>
        </div>
      </div>
      
      {/* Yêu cầu đang hoạt động */}
      {activeRequest && (
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="bg-blue-500 text-white px-6 py-4">
            <h2 className="font-semibold">Yêu cầu cứu hộ đang hoạt động</h2>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{activeRequest.vehicleName}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{activeRequest.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Yêu cầu lúc: {formatDate(activeRequest.createdAt)}</span>
                  </div>
                  {activeRequest.estimatedArrival && (
                    <div className="flex items-center text-blue-600 font-medium">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Dự kiến đến nơi: {formatTime(activeRequest.estimatedArrival)}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700">
                    <span className="font-medium">Mô tả:</span> {activeRequest.description}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(activeRequest.status).color}`}>
                  {getStatusInfo(activeRequest.status).label}
                </span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Mã yêu cầu: #{activeRequest.id}
              </div>
              
              <a 
                href="tel:19008888"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Phone className="h-4 w-4 mr-2" />
                Gọi ngay
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Form yêu cầu cứu hộ mới */}
      {!activeRequest && (
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="font-semibold">Yêu cầu cứu hộ mới</h2>
          </div>
          
          <div className="p-6">
            {/* Thanh tiến trình */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <div className="text-sm font-medium">
                  Bước {step}/3: {step === 1 ? 'Chọn phương tiện' : step === 2 ? 'Vị trí hiện tại' : 'Mô tả vấn đề'}
                </div>
                <div className="text-sm text-gray-500">{step}/3</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Bước 1: Chọn phương tiện */}
            {step === 1 && (
              <div>
                <h3 className="font-medium mb-4">Chọn phương tiện cần cứu hộ</h3>
                
                <div className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <div 
                      key={vehicle.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedVehicle === vehicle.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                    >
                      <div className="flex items-center">
                        <Car className={`h-5 w-5 mr-3 ${selectedVehicle === vehicle.id ? 'text-blue-500' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                          <div className="text-sm text-gray-500 mt-1">Biển số: {vehicle.licensePlate} • Năm SX: {vehicle.year}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-center">
                  <Link href="/customer/vehicles" className="text-blue-500 hover:underline">
                    Quản lý phương tiện
                  </Link>
                </div>
              </div>
            )}
            
            {/* Bước 2: Vị trí hiện tại */}
            {step === 2 && (
              <div>
                <h3 className="font-medium mb-4">Nhập vị trí hiện tại của bạn</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ hiện tại
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Nhập địa chỉ hoặc mô tả vị trí của bạn"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="w-full py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 flex items-center justify-center"
                    onClick={() => {
                      // Giả lập lấy vị trí hiện tại
                      setLocation('Đường Trần Duy Hưng, Cầu Giấy, Hà Nội');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Sử dụng vị trí hiện tại
                  </button>
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Vui lòng cung cấp vị trí chính xác nhất có thể để đội cứu hộ có thể tìm thấy bạn nhanh chóng.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bước 3: Mô tả vấn đề */}
            {step === 3 && (
              <div>
                <h3 className="font-medium mb-4">Mô tả vấn đề bạn đang gặp phải</h3>
                
                <div>
                  <textarea
                    placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải với phương tiện..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium">Một số thông tin hữu ích cần cung cấp:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Tình trạng hiện tại của xe (không nổ máy, lốp xẹp, etc.)</li>
                        <li>• Các dấu hiệu bất thường trước khi xảy ra sự cố</li>
                        <li>• Thông tin về môi trường xung quanh (đường cao tốc, đường nhỏ, etc.)</li>
                        <li>• Các yêu cầu đặc biệt nếu có</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer với các nút điều hướng */}
          <div className="p-6 bg-gray-50 border-t flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={handlePrevStep}
              >
                Quay lại
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                className={`px-6 py-2 rounded-lg text-white ${canProceed() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
                onClick={handleNextStep}
                disabled={!canProceed()}
              >
                Tiếp tục
              </button>
            ) : (
              <button
                type="button"
                className={`px-6 py-2 rounded-lg text-white flex items-center ${isSubmitting || !canProceed() ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed()}
              >
                {isSubmitting ? 'Đang xử lý...' : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gửi yêu cầu cứu hộ
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Lịch sử yêu cầu cứu hộ */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center cursor-pointer"
          onClick={() => setShowHistory(!showHistory)}
        >
          <h2 className="font-semibold">Lịch sử yêu cầu cứu hộ</h2>
          <button className="text-blue-500">
            {showHistory ? 'Ẩn' : 'Hiện'}
          </button>
        </div>
        
        {showHistory && (
          <div className="p-6">
            {emergencyHistory.length > 0 ? (
              <div className="space-y-4">
                {emergencyHistory.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{request.vehicleName}</div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{request.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{request.description}</p>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(request.status).color}`}>
                        {getStatusInfo(request.status).label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Bạn chưa có yêu cầu cứu hộ nào trước đây.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Thông tin hướng dẫn */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 className="font-medium text-blue-800">Lưu ý khi yêu cầu cứu hộ</h3>
        <ul className="mt-2 text-sm text-blue-700 space-y-1">
          <li>• Đảm bảo bạn ở vị trí an toàn và bật đèn cảnh báo nguy hiểm của xe.</li>
          <li>• Nếu có thể, di chuyển xe đến vị trí an toàn, tránh xa dòng xe cộ.</li>
          <li>• Chuẩn bị sẵn giấy tờ xe và giấy phép lái xe để xuất trình khi cần thiết.</li>
          <li>• Đội cứu hộ sẽ liên hệ với bạn qua số điện thoại đã đăng ký.</li>
          <li>• Trong trường hợp khẩn cấp, vui lòng gọi trực tiếp đến hotline: 1900-8888.</li>
        </ul>
      </div>
    </div>
  );
}