"use client";

import { useState, useEffect } from 'react';
import { Car, Wrench, CheckCircle, Calendar, Star, FileText,ChevronRight } from 'lucide-react';
import Link from 'next/link';



export default function Dashboard() {
  const [repairRequests, setRepairRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Simulate API call with updated dates (2025)
      setRepairRequests([
        { id: 1, vehicle: 'Honda Civic 2020', issue: 'Động cơ kêu lạ', status: 'pending', date: '2025-09-10', priority: 'high' },
        { id: 2, vehicle: 'Toyota Camry 2019', issue: 'Thay dầu máy', status: 'in-progress', date: '2025-09-08', priority: 'medium' },
        { id: 3, vehicle: 'BMW X5 2021', issue: 'Kiểm tra phanh', status: 'completed', date: '2025-09-05', priority: 'low' },
      ]);

      setAppointments([
        { id: 1, date: '2025-09-12', time: '09:00', service: 'Bảo dưỡng định kỳ', vehicle: 'Honda Civic 2020' },
        { id: 2, date: '2025-09-15', time: '14:30', service: 'Sửa chữa động cơ', vehicle: 'Toyota Camry 2019' },
      ]);

      setQuotations([
        { id: 1, vehicle: 'Honda Civic 2020', issue: 'Động cơ kêu lạ', status: 'pending', date: '2025-09-10', totalCost: 2000000 },
        { id: 2, vehicle: 'Toyota Camry 2019', issue: 'Thay dầu máy', status: 'confirmed', date: '2025-09-08', totalCost: 1000000 },
      ]);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    }
  }, []);

  // Calculate dynamic metrics
  const pendingRequests = repairRequests.filter((r) => r.status === 'pending').length;
  const completedThisMonth = repairRequests.filter((r) => {
    const requestDate = new Date(r.date);
    const now = new Date();
    return r.status === 'completed' && requestDate.getMonth() === now.getMonth() && requestDate.getFullYear() === now.getFullYear();
  }).length;
  const upcomingAppointments = appointments.filter((a) => new Date(a.date) >= new Date()).length;
  const pendingQuotations = quotations.filter((q) => q.status === 'pending').length;
  const averageRating = 4.8; // Placeholder

  if (error) {
    return <div className="text-red-600 text-center p-6">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link href="/progress" className="block">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:opacity-95 transition h-28">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Yêu cầu đang xử lý</p>
              <p className="text-2xl font-bold">{pendingRequests}</p>
            </div>
            <Wrench className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        </Link>
        <Link href="/history" className="block">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:opacity-95 transition h-28">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Hoàn thành tháng này</p>
              <p className="text-2xl font-bold">{completedThisMonth}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>
        </Link>
        <Link href="/appointments" className="block">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:opacity-95 transition h-28">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Lịch hẹn sắp tới</p>
              <p className="text-2xl font-bold">{upcomingAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-200" />
          </div>
        </div>
        </Link>
        <Link href="/reviews" className="block">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:opacity-95 transition h-28">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Đánh giá trung bình</p>
              <p className="text-2xl font-bold">{averageRating}</p>
            </div>
            <Star className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        </Link>
        <Link href="/notifications" className="block">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg hover:opacity-95 transition h-28">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Báo giá đang chờ</p>
              <p className="text-2xl font-bold">{pendingQuotations}</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Yêu cầu gần đây</h3>
          {repairRequests.length === 0 ? (
            <p className="text-gray-600">Không có yêu cầu nào.</p>
          ) : (
            <div className="space-y-4">
              {repairRequests.slice(0, 3).map((request) => (
                <Link href={`/progress?requestId=${request.id}`} key={request.id} className="block">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{request.vehicle}</p>
                        <p className="text-sm text-gray-500">{request.issue}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        request.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {request.status === 'completed' ? 'Hoàn thành' : request.status === 'in-progress' ? 'Đang xử lý' : 'Chờ xử lý'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Lịch hẹn sắp tới</h3>
          {appointments.length === 0 ? (
            <p className="text-gray-600">Không có lịch hẹn nào.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Link href={`/appointments?appointmentId=${appointment.id}`} key={appointment.id} className="block">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{appointment.service}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.date} - {appointment.time}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}