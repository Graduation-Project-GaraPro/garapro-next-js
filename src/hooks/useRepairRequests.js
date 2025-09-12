import { useState, useEffect } from 'react';

/**
 * Hook quản lý yêu cầu sửa chữa xe
 * @returns {Object} - Các phương thức và trạng thái để quản lý yêu cầu sửa chữa
 */
export default function useRepairRequests() {
  const [repairRequests, setRepairRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Giả lập việc tải dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Giả lập API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dữ liệu mẫu
        const mockData = [
          {
            id: 1,
            customerName: 'Nguyễn Văn A',
            vehicle: 'Toyota Camry',
            licensePlate: '51A-12345',
            issue: 'Thay dầu và kiểm tra phanh',
            status: 'pending',
            createdAt: '2023-10-15T08:30:00Z'
          },
          {
            id: 2,
            customerName: 'Trần Thị B',
            vehicle: 'Honda Civic',
            licensePlate: '59C-54321',
            issue: 'Điều hòa không mát',
            status: 'in_progress',
            createdAt: '2023-10-14T10:15:00Z'
          },
          {
            id: 3,
            customerName: 'Lê Văn C',
            vehicle: 'Ford Ranger',
            licensePlate: '61D-67890',
            issue: 'Thay lốp và cân bằng động',
            status: 'completed',
            createdAt: '2023-10-13T14:45:00Z'
          }
        ];
        
        setRepairRequests(mockData);
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu yêu cầu sửa chữa');
        console.error('Error fetching repair requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Thêm yêu cầu sửa chữa mới
   * @param {Object} request - Thông tin yêu cầu sửa chữa
   */
  const addRepairRequest = (request) => {
    const newRequest = {
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...request
    };

    setRepairRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };

  /**
   * Cập nhật trạng thái yêu cầu sửa chữa
   * @param {number} id - ID của yêu cầu
   * @param {string} status - Trạng thái mới
   */
  const updateRequestStatus = (id, status) => {
    setRepairRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, status } : request
      )
    );
  };

  /**
   * Xóa yêu cầu sửa chữa
   * @param {number} id - ID của yêu cầu cần xóa
   */
  const deleteRepairRequest = (id) => {
    setRepairRequests(prev => prev.filter(request => request.id !== id));
  };

  /**
   * Lọc yêu cầu sửa chữa theo trạng thái
   * @param {string} status - Trạng thái cần lọc
   * @returns {Array} - Danh sách yêu cầu đã lọc
   */
  const filterByStatus = (status) => {
    return repairRequests.filter(request => request.status === status);
  };

  return {
    repairRequests,
    loading,
    error,
    addRepairRequest,
    updateRequestStatus,
    deleteRepairRequest,
    filterByStatus,
    pendingRequests: filterByStatus('pending'),
    inProgressRequests: filterByStatus('in_progress'),
    completedRequests: filterByStatus('completed')
  };
}