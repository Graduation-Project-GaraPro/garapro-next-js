"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Wrench } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho dịch vụ bảo dưỡng
interface MaintenanceService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
}

export default function MaintenancePage() {
  // Dữ liệu mẫu cho các dịch vụ bảo dưỡng
  const maintenanceServices: MaintenanceService[] = [
    {
      id: '1',
      name: 'Bảo dưỡng định kỳ',
      description: 'Kiểm tra toàn diện và bảo dưỡng xe theo lịch trình khuyến nghị của nhà sản xuất.',
      price: 800000,
      duration: '2-3 giờ',
      image: '/images/services/maintenance.jpg'
    },
    {
      id: '2',
      name: 'Thay dầu động cơ',
      description: 'Thay dầu động cơ và lọc dầu để đảm bảo hiệu suất tối ưu của xe.',
      price: 350000,
      duration: '30-45 phút',
      image: '/images/services/oil-change.jpg'
    },
    {
      id: '4',
      name: 'Cân chỉnh bánh xe',
      description: 'Cân bằng và căn chỉnh bánh xe để giảm mài mòn lốp và cải thiện khả năng lái.',
      price: 450000,
      duration: '1 giờ',
      image: '/images/services/wheel-alignment.jpg'
    },
    {
      id: '8',
      name: 'Kiểm tra trước chuyến đi',
      description: 'Kiểm tra toàn diện xe trước khi bạn thực hiện chuyến đi dài.',
      price: 400000,
      duration: '1 giờ',
      image: '/images/services/pre-trip-inspection.jpg'
    },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/customer/services" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Quay lại dịch vụ</span>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Dịch vụ Bảo Dưỡng</h1>
      <p className="text-gray-600 mb-8">Các dịch vụ bảo dưỡng định kỳ và chuyên nghiệp cho xe của bạn</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maintenanceServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Wrench className="h-16 w-16 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">{service.price.toLocaleString('vi-VN')} VNĐ</p>
                  <p className="text-sm text-gray-500">Thời gian: {service.duration}</p>
                </div>
                <Link 
                  href={`/customer/services/appointments/create?serviceId=${service.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Đặt lịch
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Tại sao nên bảo dưỡng định kỳ?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Kéo dài tuổi thọ của xe</li>
          <li>Đảm bảo an toàn khi lái xe</li>
          <li>Tiết kiệm chi phí sửa chữa lớn</li>
          <li>Duy trì hiệu suất tối ưu của xe</li>
          <li>Giữ giá trị xe cao hơn khi bán lại</li>
        </ul>
      </div>
    </div>
  );
}