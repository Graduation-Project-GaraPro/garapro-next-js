"use client";

import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/customer/useCurrentUser';
import { Star, ThumbsUp, MessageCircle, Filter, Search, Plus, Edit, Trash2, User, Calendar } from 'lucide-react';

export default function Reviews() {
  const { name: currentUser } = useCurrentUser();
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    service: '',
    rating: 5,
    comment: '',
    customerName: currentUser || '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Simulate loading reviews
    setReviews([
      {
        id: 1,
        service: 'Bảo dưỡng định kỳ',
        rating: 5,
        comment: 'Dịch vụ rất tốt, kỹ thuật viên chuyên nghiệp và nhiệt tình. Xe chạy mượt mà sau khi bảo dưỡng.',
        customerName: 'Nguyễn Văn A',
        date: '2025-01-10',
        likes: 12,
        replies: [
          {
            id: 1,
            content: 'Cảm ơn bạn đã đánh giá tích cực! Chúng tôi sẽ tiếp tục cố gắng mang đến dịch vụ tốt nhất.',
            author: 'AutoCare Pro',
            date: '2025-01-10'
          }
        ]
      },
      {
        id: 2,
        service: 'Sửa chữa phanh',
        rating: 4,
        comment: 'Sửa chữa nhanh chóng, giá cả hợp lý. Tuy nhiên cần cải thiện thêm về thời gian chờ đợi.',
        customerName: 'Trần Thị B',
        date: '2025-01-08',
        likes: 8,
        replies: []
      },
      {
        id: 3,
        service: 'Kiểm tra động cơ',
        rating: 5,
        comment: 'Chẩn đoán chính xác, giải thích rõ ràng về vấn đề và cách khắc phục. Rất hài lòng!',
        customerName: 'Lê Văn C',
        date: '2025-01-05',
        likes: 15,
        replies: []
      },
      {
        id: 4,
        service: 'Thay lốp',
        rating: 3,
        comment: 'Dịch vụ ổn nhưng giá hơi cao so với các nơi khác. Chất lượng lốp tốt.',
        customerName: 'Phạm Thị D',
        date: '2025-01-03',
        likes: 3,
        replies: [
          {
            id: 2,
            content: 'Cảm ơn phản hồi của bạn. Chúng tôi sẽ xem xét điều chỉnh giá để phù hợp hơn.',
            author: 'AutoCare Pro',
            date: '2025-01-03'
          }
        ]
      },
      {
        id: 5,
        service: 'Sửa chữa điều hòa',
        rating: 5,
        comment: 'Kỹ thuật viên rất giỏi, sửa chữa triệt để. Điều hòa hoạt động tốt như mới.',
        customerName: 'Hoàng Văn E',
        date: '2024-12-28',
        likes: 20,
        replies: []
      }
    ]);
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;
    
    return matchesSearch && matchesRating;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, customerName: currentUser };
    if (editingId) {
      setReviews(prev => 
        prev.map(review => review.id === editingId ? { ...review, ...payload } : review)
      );
    } else {
      const newReview = {
        id: reviews.length + 1,
        ...payload,
        likes: 0,
        replies: []
      };
      setReviews(prev => [...prev, newReview]);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({
      service: '',
      rating: 5,
      comment: '',
      customerName: currentUser || '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (review) => {
    if (review.customerName !== currentUser) return; // chặn nếu không phải chủ sở hữu
    setFormData(review);
    setEditingId(review.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const r = reviews.find(rv => rv.id === id);
    if (!r || r.customerName !== currentUser) return;
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá của mình?')) {
      setReviews(prev => prev.filter(review => review.id !== id));
    }
  };

  const handleLike = (id) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === id ? { ...review, likes: review.likes + 1 } : review
      )
    );
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
        onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
      />
    ));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const count = reviews.filter(review => review.rating === 5 - i).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating: 5 - i, count, percentage };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-yellow-100 p-2 rounded-lg">
          <Star className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Đánh giá dịch vụ</h2>
          <p className="text-gray-600">Xem và quản lý đánh giá từ khách hàng</p>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Tổng quan đánh giá</h3>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">{averageRating}</div>
                <div className="flex items-center justify-center">
                  {renderStars(Math.round(averageRating))}
                </div>
                <div className="text-sm text-gray-600">{reviews.length} đánh giá</div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Phân bố đánh giá</h4>
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm w-8">{rating} sao</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Add Review */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm đánh giá..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm đánh giá
          </button>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ</label>
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  placeholder="Tên dịch vụ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Tên khách hàng"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
              <div className="flex items-center space-x-1">
                {renderStars(formData.rating, true, (rating) => 
                  setFormData({ ...formData, rating })
                )}
                <span className="ml-2 text-sm text-gray-600">{formData.rating} sao</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows="4"
                placeholder="Chia sẻ trải nghiệm của bạn..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Cập nhật' : 'Thêm đánh giá'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    service: '',
                    rating: 5,
                    comment: '',
                    customerName: '',
                    date: new Date().toISOString().split('T')[0]
                  });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Danh sách đánh giá ({filteredReviews.length})</h3>
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{review.customerName}</h4>
                    <p className="text-sm text-gray-600">{review.service}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                  <div className="flex space-x-1">
                    {review.customerName === currentUser && (
                      <>
                        <button
                          onClick={() => handleEdit(review)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Sửa đánh giá của tôi"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa đánh giá của tôi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{review.comment}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{review.date}</span>
                  </div>
                  <button
                    onClick={() => handleLike(review.id)}
                    className="flex items-center space-x-1 hover:text-blue-600 transition"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.likes}</span>
                  </button>
                </div>
              </div>
              
              {/* Replies */}
              {review.replies.length > 0 && (
                <div className="mt-4 pl-6 border-l-2 border-gray-200">
                  {review.replies.map((reply) => (
                    <div key={reply.id} className="mb-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-blue-600">{reply.author}</span>
                        <span className="text-xs text-gray-500">{reply.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {filteredReviews.length === 0 && (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy đánh giá nào</p>
          </div>
        )}
      </div>
    </div>
  );
}