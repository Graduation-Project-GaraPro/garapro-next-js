import { useEffect, useState } from 'react';
import { AppointmentsService } from '@/services/appointments.service';

const mockData = [
  {
    id: 1,
    date: '2025-01-15',
    time: '09:00',
    service: 'Bảo dưỡng định kỳ',
    vehicle: 'Honda Civic 2020',
    licensePlate: '59A-123.45',
    customerName: 'Nguyễn Văn A',
    phone: '0901234567',
    notes: 'Thay dầu máy và lọc dầu',
    status: 'confirmed'
  },
  {
    id: 2,
    date: '2025-01-16',
    time: '14:30',
    service: 'Sửa chữa phanh',
    vehicle: 'Toyota Camry 2019',
    licensePlate: '51G-678.90',
    customerName: 'Trần Thị B',
    phone: '0907654321',
    notes: 'Phanh yếu, cần kiểm tra toàn bộ hệ thống',
    status: 'pending'
  },
  {
    id: 3,
    date: '2025-01-17',
    time: '10:15',
    service: 'Kiểm tra động cơ',
    vehicle: 'BMW X5 2021',
    licensePlate: '30F-246.80',
    customerName: 'Lê Văn C',
    phone: '0909876543',
    notes: 'Động cơ kêu lạ khi khởi động',
    status: 'completed'
  }
];

export default function useAppointmentsQuery({ useMock = true, params } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = useMock ? mockData : await AppointmentsService.list(params);
        if (active) setData(result || []);
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [useMock, JSON.stringify(params)]);

  return { data, loading, error };
}


