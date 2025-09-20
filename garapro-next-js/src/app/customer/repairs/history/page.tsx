"use client";

import { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Filter, Download, Eye, Calendar, Car, Wrench, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { RepairStatusBadge } from '@/components/customer/common/StatusBadges';

interface RepairHistory {
  id: number | string;
  vehicle: string;
  licensePlate: string;
  issue: string;
  service: string;
  date: string;
  status: "completed" | "in-progress" | "pending" | "cancelled";
  cost: number;
  technician: string;
  rating?: number;
  description: string;
  parts: string[];
  laborHours: number;
}

export default function RepairHistoryPage() {
  const [repairHistory, setRepairHistory] = useState<RepairHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  useEffect(() => {
    // Simulate loading repair history
    setRepairHistory([
      {
        id: 1,
        vehicle: 'Honda Civic 2020',
        licensePlate: '59A-123.45',
        issue: 'Động cơ kêu lạ',
        service: 'Bảo dưỡng định kỳ',
        date: '2025-01-10',
        status: 'completed',
        cost: 1500000,
        technician: 'Nguyễn Văn A',
        rating: 5,
        description: 'Thay dầu máy, lọc dầu, kiểm tra hệ thống phanh',
        parts: ['Dầu máy 5W-30', 'Lọc dầu', 'Lọc gió'],
        laborHours: 2
      },
      {
        id: 2,
        vehicle: 'Toyota Camry 2019',
        licensePlate: '51G-678.90',
        issue: 'Phanh kêu',
        service: 'Sửa chữa phanh',
        date: '2025-01-08',
        status: 'completed',
        cost: 3200000,
        technician: 'Trần Thị B',
        rating: 4,
        description: 'Thay má phanh trước, kiểm tra dầu phanh, điều chỉnh phanh tay',
        parts: ['Má phanh trước', 'Dầu phanh DOT4', 'Dây phanh'],
        laborHours: 4
      },
      {
        id: 3,
        vehicle: 'BMW X5 2021',
        licensePlate: '30F-246.80',
        issue: 'Đèn check engine',
        service: 'Kiểm tra động cơ',
        date: '2025-01-05',
        status: 'completed',
        cost: 2500000,
        technician: 'Lê Văn C',
        rating: 5,
        description: 'Chẩn đoán lỗi động cơ, thay bugi, kiểm tra hệ thống đánh lửa',
        parts: ['Bugi', 'Dây bugi', 'Bộ lọc nhiên liệu'],
        laborHours: 3
      },
      {
        id: 4,
        vehicle: 'Honda Civic 2020',
        licensePlate: '59A-123.45',
        issue: 'Lốp mòn',
        service: 'Thay lốp',
        date: '2025-01-03',
        status: 'completed',
        cost: 800000,
        technician: 'Nguyễn Văn A',
        rating: 4,
        description: 'Thay 4 lốp mới, cân bằng bánh xe, kiểm tra áp suất',
        parts: ['Lốp 205/55R16 x4', 'Van lốp'],
        laborHours: 1
      },
      {
        id: 5,
        vehicle: 'Toyota Camry 2019',
        licensePlate: '51G-678.90',
        issue: 'Điều hòa không mát',
        service: 'Sửa chữa điều hòa',
        date: '2024-12-28',
        status: 'completed',
        cost: 4500000,
        technician: 'Trần Thị B',
        rating: 5,
        description: 'Thay máy nén điều hòa, nạp gas, kiểm tra hệ thống làm mát',
        parts: ['Máy nén điều hòa', 'Gas R134a', 'Bộ lọc cabin'],
        laborHours: 5
      }
    ]);
  }, []);

  const filteredHistory = repairHistory.filter(item => {
    const matchesSearch = 
      item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate === 'last-week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      matchesDate = new Date(item.date) >= lastWeek;
    } else if (filterDate === 'last-month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      matchesDate = new Date(item.date) >= lastMonth;
    } else if (filterDate === 'last-year') {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      matchesDate = new Date(item.date) >= lastYear;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử sửa chữa</h1>
        <p className="text-muted-foreground">
          Xem lại các lần sửa chữa trước đây
        </p>
      </div>
      
      {/* Bộ lọc và tìm kiếm */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo xe, dịch vụ, biển số..."
              className="w-full rounded-md border border-gray-300 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <select
              className="rounded-md border border-gray-300 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Hoàn thành</option>
              <option value="in-progress">Đang xử lý</option>
              <option value="pending">Chờ xử lý</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <select
              className="rounded-md border border-gray-300 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">Tất cả thời gian</option>
              <option value="last-week">Tuần qua</option>
              <option value="last-month">Tháng qua</option>
              <option value="last-year">Năm qua</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Danh sách lịch sử */}
      {filteredHistory.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xe
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vấn đề
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chi phí
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((repair) => (
                  <tr key={repair.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{repair.vehicle}</div>
                          <div className="text-sm text-gray-500">{repair.licensePlate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{repair.issue}</div>
                      <div className="text-sm text-gray-500">{repair.service}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{repair.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RepairStatusBadge status={repair.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(repair.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/customer/repairs/${repair.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <HistoryIcon className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Không tìm thấy lịch sử sửa chữa</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterDate !== 'all' 
              ? 'Không có kết quả phù hợp với bộ lọc của bạn.'
              : 'Bạn chưa có lịch sử sửa chữa nào.'}
          </p>
        </div>
      )}
    </div>
  );
}