"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar, Car, Wrench, Send, X } from 'lucide-react';
import useCurrentUser from '@/hooks/customer/useCurrentUser';
import { validateTextField, validateSelectField } from '@/utils/validate/formValidation';

export default function CreateReview() {
  const router = useRouter();
  const { name: currentUser } = useCurrentUser();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    service: '',
    rating: 5,
    comment: '',
    customerName: currentUser || '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Simulate loading completed services that can be reviewed
    setServices([
      {
        id: 1,
        name: 'Bảo dưỡng định kỳ',
        date: '2025-01-10',
        vehicle: 'Honda Civic 2020',
        technician: 'Nguyễn Văn A'
      },
      {
        id: 2,
        name: 'Sửa chữa phanh',
        date: '2025-01-08',
        vehicle: 'Toyota Camry 2019',
        technician: 'Trần Thị B'
      },
      {
        id: 3,
        name: 'Kiểm tra động cơ',
        date: '2025-01-05',
        vehicle: 'BMW X5 2021',
        technician: 'Lê Văn C'
      },
      {
        id: 4,
        name: 'Thay lốp',
        date: '2025-01-03',
        vehicle: 'Mazda CX-5 2018',
        technician: 'Phạm Thị D'
      },
      {
        id: 5,
        name: 'Sửa chữa điều hòa',
        date: '2024-12-28',
        vehicle: 'Ford Ranger 2022',
        technician: 'Hoàng Văn E'
      }
    ]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleServiceSelect = (serviceId) => {
    const selectedService = services.find(s => s.id === parseInt(serviceId));
    setFormData(prev => ({
      ...prev,
      service: selectedService ? selectedService.name : ''
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate service selection
    const serviceValidation = validateSelectField(formData.service, {
      required: true,
      label: 'Dịch vụ'
    });
    if (!serviceValidation.isValid) {
      newErrors.service = serviceValidation.error;
    }
    
    // Validate comment
    const commentValidation = validateTextField(formData.comment, {
      required: true,
      minLength: 10,
      label: 'Đánh giá'
    });
    if (!commentValidation.isValid) {
      newErrors.comment = commentValidation.error;
    }
    
    // Validate customer name
    const nameValidation = validateTextField(formData.customerName, {
      required: true,
      label: 'Tên khách hàng'
    });
    if (!nameValidation.isValid) {
      newErrors.customerName = nameValidation.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to submit review
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/customer/reviews');
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 cursor-pointer ${i < count ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        onClick={() => handleRatingChange(i + 1)}
      />
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success message */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Cảm ơn bạn đã đánh giá!</h3>
            <p className="text-gray-600 text-center mb-4">Đánh giá của bạn đã được gửi thành công.</p>
            <div className="flex justify-center">
              <div className="animate-pulse bg-gray-200 h-1 w-full rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-1/2 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link href="/customer/reviews" className="mr-4">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Tạo đánh giá mới</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn dịch vụ đã sử dụng</label>
              <select
                name="service"
                className={`w-full p-3 border ${errors.service ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                onChange={(e) => handleServiceSelect(e.target.value)}
                value={services.find(s => s.name === formData.service)?.id || ''}
              >
                <option value="">-- Chọn dịch vụ --</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.vehicle} ({service.date})
                  </option>
                ))}
              </select>
              {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
              <div className="flex items-center space-x-1">
                {renderStars(formData.rating)}
                <span className="ml-2 text-gray-600">{formData.rating}/5</span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét chi tiết</label>
              <textarea
                name="comment"
                rows={5}
                className={`w-full p-3 border ${errors.comment ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."
                value={formData.comment}
                onChange={handleChange}
              ></textarea>
              {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment}</p>}
              <p className="mt-1 text-sm text-gray-500">{formData.comment.length}/500 ký tự</p>
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <Link href="/customer/reviews" className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Hủy
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="-ml-1 mr-2 h-4 w-4" />
                    Gửi đánh giá
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hướng dẫn đánh giá</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="flex-shrink-0 text-green-500 mr-2">•</span>
                <span>Đánh giá chân thực sẽ giúp chúng tôi cải thiện dịch vụ</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 text-green-500 mr-2">•</span>
                <span>Chỉ đánh giá dịch vụ bạn đã sử dụng</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 text-green-500 mr-2">•</span>
                <span>Mô tả chi tiết trải nghiệm của bạn để giúp người khác hiểu rõ hơn</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 text-green-500 mr-2">•</span>
                <span>Đánh giá của bạn sẽ được hiển thị công khai trên trang đánh giá</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}