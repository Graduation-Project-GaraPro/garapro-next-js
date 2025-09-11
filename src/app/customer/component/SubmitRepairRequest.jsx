"use client";

import { useState, useRef, useEffect } from 'react';
import { Plus, Camera } from 'lucide-react';

export default function SubmitRepairRequest() {
  const [repairRequests, setRepairRequests] = useState([]);
  const [formData, setFormData] = useState({
    vehicle: '',
    licensePlate: '',
    issue: '',
    description: '',
    priority: 'medium',
    images: [],
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(t);
  }, [showToast]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.images, ...files];
    setFormData({ ...formData, images: newImages });
    
    // Tạo preview cho hình ảnh
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
    setImagePreview(newPreviews);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const newImages = [...formData.images, ...files];
    setFormData({ ...formData, images: newImages });
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      id: repairRequests.length + 1,
      ...formData,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    };
    setRepairRequests([...repairRequests, newRequest]);
    setFormData({ vehicle: '', licensePlate: '', issue: '', description: '', priority: 'medium', images: [] });
    setImagePreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setToastMessage('Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ sớm.');
    setShowToast(true);
  };

  return (
    <>
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Gửi yêu cầu sửa chữa</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Xe của bạn</label>
          <input
            type="text"
            value={formData.vehicle}
            onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
            placeholder="VD: Honda Civic 2020"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Biển số xe</label>
          <input
            type="text"
            value={formData.licensePlate}
            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
            placeholder="VD: 59A-123.45"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vấn đề gặp phải</label>
          <input
            type="text"
            value={formData.issue}
            onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
            placeholder="VD: Động cơ kêu lạ, phanh yếu..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="4"
            placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ ưu tiên</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh (tùy chọn)</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
            onClick={openFileDialog}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFileDialog(); }}
          >
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Kéo thả ảnh vào đây hoặc nhấn để chọn</p>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
            />
          </div>
          
          {/* Image Preview */}
          {imagePreview.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Hình ảnh đã chọn:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
          </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
        >
          <Plus className="h-5 w-5 inline mr-2" />
          Gửi yêu cầu
        </button>
      </form>
    </div>
    {showToast && (
      <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50">
        <span className="font-medium">{toastMessage}</span>
        <button
          type="button"
          onClick={() => setShowToast(false)}
          className="text-white/90 hover:text-white"
        >
          ×
        </button>
      </div>
    )}
  </>
  );
}