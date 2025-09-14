"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { validateTextField, validateLicensePlateField } from '@/utils/validate/formValidation';

export default function CreateRepairRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    vehicle: "",
    licensePlate: "",
    issue: "",
    description: "",
    date: "",
    time: "",
    images: [] as File[],
  });
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles]
      }));

      // Tạo URL xem trước
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Xóa URL xem trước và giải phóng bộ nhớ
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Xác thực form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Xác thực loại xe
    const vehicleValidation = validateTextField(formData.vehicle, {
      required: true,
      minLength: 3,
      label: 'Loại xe'
    });
    if (!vehicleValidation.isValid) {
      errors.vehicle = vehicleValidation.error;
    }
    
    // Xác thực biển số xe
    const licensePlateValidation = validateLicensePlateField(formData.licensePlate, {
      required: true,
      label: 'Biển số xe'
    });
    if (!licensePlateValidation.isValid) {
      errors.licensePlate = licensePlateValidation.error;
    }
    
    // Xác thực vấn đề
    const issueValidation = validateTextField(formData.issue, {
      required: true,
      minLength: 5,
      label: 'Vấn đề'
    });
    if (!issueValidation.isValid) {
      errors.issue = issueValidation.error;
    }
    
    // Xác thực mô tả
    const descriptionValidation = validateTextField(formData.description, {
      required: false,
      minLength: 10,
      label: 'Mô tả chi tiết'
    });
    if (formData.description && !descriptionValidation.isValid) {
      errors.description = descriptionValidation.error;
    }
    
    // Xác thực ngày
    if (!formData.date) {
      errors.date = 'Ngày là bắt buộc';
    }
    
    // Xác thực giờ
    if (!formData.time) {
      errors.time = 'Giờ là bắt buộc';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Xác thực form trước khi gửi
    const validation = validateForm();
    if (!validation.isValid) {
      // Hiển thị lỗi đầu tiên
      const firstError = Object.values(validation.errors)[0];
      alert(firstError);
      return;
    }
    
    setLoading(true);

    try {
      // Trong thực tế, đây sẽ là một API call
      // const formDataToSend = new FormData();
      // Object.entries(formData).forEach(([key, value]) => {
      //   if (key === 'images') {
      //     formData.images.forEach(image => {
      //       formDataToSend.append('images', image);
      //     });
      //   } else {
      //     formDataToSend.append(key, value);
      //   }
      // });
      // await fetch('/api/repairs', {
      //   method: 'POST',
      //   body: formDataToSend
      // });

      // Giả lập độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Chuyển hướng đến trang danh sách yêu cầu
      router.push('/customer/repairs');
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/customer/repairs" className="text-blue-600 hover:underline flex items-center">
          <ArrowLeft className="h-5 w-5 mr-1" /> Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Tạo yêu cầu sửa chữa mới</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Thông tin xe</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-1">
                Loại xe
              </label>
              <input
                type="text"
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ví dụ: Toyota Camry 2020"
              />
            </div>
            
            <div>
              <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">
                Biển số xe
              </label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ví dụ: 51F-123.45"
              />
            </div>
          </div>

          <div>
            <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
              Vấn đề
            </label>
            <input
              type="text"
              id="issue"
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả ngắn gọn vấn đề của xe"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả chi tiết vấn đề của xe"
            />
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Thời gian</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Giờ
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Hình ảnh</h2>
          
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Tải lên hình ảnh (không bắt buộc)
            </label>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/customer/repairs"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </div>
      </form>
    </div>
  );
}