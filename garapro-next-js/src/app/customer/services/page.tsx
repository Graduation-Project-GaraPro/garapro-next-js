"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Calendar, Wrench, AlertTriangle, ArrowRight } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho dịch vụ
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image: string;
}

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Dữ liệu mẫu cho các dịch vụ
  const services: Service[] = [
    {
      id: '1',
      name: 'Bảo dưỡng định kỳ',
      description: 'Kiểm tra toàn diện và bảo dưỡng xe theo lịch trình khuyến nghị của nhà sản xuất.',
      price: 800000,
      duration: '2-3 giờ',
      category: 'maintenance',
      image: '/images/services/maintenance.jpg'
    },
    {
      id: '2',
      name: 'Thay dầu động cơ',
      description: 'Thay dầu động cơ và lọc dầu để đảm bảo hiệu suất tối ưu của xe.',
      price: 350000,
      duration: '30-45 phút',
      category: 'maintenance',
      image: '/images/services/oil-change.jpg'
    },
    {
      id: '3',
      name: 'Kiểm tra và sửa chữa phanh',
      description: 'Kiểm tra toàn diện hệ thống phanh, thay thế má phanh và điều chỉnh nếu cần thiết.',
      price: 600000,
      duration: '1-2 giờ',
      category: 'repair',
      image: '/images/services/brake-service.jpg'
    },
    {
      id: '4',
      name: 'Cân chỉnh bánh xe',
      description: 'Cân bằng và căn chỉnh bánh xe để giảm mài mòn lốp và cải thiện khả năng lái.',
      price: 450000,
      duration: '1 giờ',
      category: 'maintenance',
      image: '/images/services/wheel-alignment.jpg'
    },
    {
      id: '5',
      name: 'Kiểm tra và sửa chữa điều hòa',
      description: 'Kiểm tra, nạp gas và sửa chữa hệ thống điều hòa không khí.',
      price: 750000,
      duration: '1-3 giờ',
      category: 'repair',
      image: '/images/services/ac-service.jpg'
    },
    {
      id: '6',
      name: 'Thay ắc quy',
      description: 'Kiểm tra và thay thế ắc quy để đảm bảo khởi động xe dễ dàng.',
      price: 1200000,
      duration: '30 phút',
      category: 'repair',
      image: '/images/services/battery-replacement.jpg'
    },
    {
      id: '7',
      name: 'Cứu hộ khẩn cấp',
      description: 'Dịch vụ cứu hộ 24/7 cho các trường hợp khẩn cấp trên đường.',
      price: 500000,
      duration: 'Tùy thuộc vào tình huống',
      category: 'emergency',
      image: '/images/services/emergency.jpg'
    },
    {
      id: '8',
      name: 'Kiểm tra trước chuyến đi',
      description: 'Kiểm tra toàn diện xe trước khi bạn thực hiện chuyến đi dài.',
      price: 400000,
      duration: '1 giờ',
      category: 'inspection',
      image: '/images/services/pre-trip-inspection.jpg'
    },
  ];
  
  // Danh sách các danh mục
  const categories = [
    { id: 'all', name: 'Tất cả dịch vụ' },
    { id: 'maintenance', name: 'Bảo dưỡng' },
    { id: 'repair', name: 'Sửa chữa' },
    { id: 'emergency', name: 'Cứu hộ' },
    { id: 'inspection', name: 'Kiểm tra' },
  ];
  
  // Lọc dịch vụ theo từ khóa tìm kiếm và danh mục
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dịch vụ</h1>
        <Link 
          href="/customer/services/appointments/create" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Đặt lịch hẹn
        </Link>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Danh sách dịch vụ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  {service.category === 'maintenance' && <Wrench className="h-12 w-12 text-blue-500" />}
                  {service.category === 'repair' && <Wrench className="h-12 w-12 text-orange-500" />}
                  {service.category === 'emergency' && <AlertTriangle className="h-12 w-12 text-red-500" />}
                  {service.category === 'inspection' && <Search className="h-12 w-12 text-green-500" />}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <span className="text-sm font-medium text-blue-500">{formatPrice(service.price)}</span>
                </div>
                
                <p className="text-gray-600 mt-2 text-sm line-clamp-2">{service.description}</p>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{service.duration}</span>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    {categories.find(c => c.id === service.category)?.name || service.category}
                  </span>
                  
                  <Link 
                    href={`/customer/services/appointments/create?service=${service.id}`}
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                  >
                    Đặt lịch
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
            <Search className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy dịch vụ</h3>
            <p className="mt-2 text-gray-500">
              Không có dịch vụ nào khớp với tìm kiếm của bạn.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="mt-4 text-blue-500 hover:text-blue-700"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Liên kết đến các trang liên quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link href="/customer/services/appointments">
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Quản lý lịch hẹn</h3>
                <p className="text-sm text-gray-600 mt-1">Xem và quản lý các lịch hẹn của bạn</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </div>
        </Link>
        
        <Link href="/customer/services/emergency">
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold">Dịch vụ cứu hộ khẩn cấp</h3>
                <p className="text-sm text-gray-600 mt-1">Yêu cầu hỗ trợ khẩn cấp 24/7</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Component hiển thị thời gian
function Clock({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}