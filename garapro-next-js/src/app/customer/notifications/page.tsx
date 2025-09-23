"use client";

import { useState, useEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';

// Import components
import Header from '@/components/customer/Quotation/Header';
import Toast from '@/components/customer/Quotation/Toast';
import QuotationCard from '@/components/customer/Quotation/QuotationCard';
import ConfirmedQuotation from '@/components/customer/Quotation/ConfirmedQuotation';
import QuotationModal from '@/components/customer/Quotation/QuotationModal';

// Import types and utilities
import { QuotationDetail, QualityOption, ToastMessage } from '@/types/quotation';

// Sample data
const sampleQuotations: QuotationDetail[] = [
  {
    id: 1,
    vehicle: "Honda City 1.5 CVT 2020",
    licensePlate: "30A-123.45",
    issue: "Kiểm tra tổng quát + báo lỗi phanh",
    inspectionDate: "2025-01-15",
    mechanicName: "Nguyễn Văn Nam",
    customerPhone: "0987654321",
    estimatedTime: "2-3 giờ",
    requiredParts: [
      { 
        id: 1, 
        name: "Má phanh trước", 
        price: 800000, 
        quantity: 1, 
        category: "Phanh",
        condition: 'critical',
        description: "Má phanh đã mòn 90%, cần thay ngay lập tức để đảm bảo an toàn",
        qualityLevel: 'standard',
        warranty: "12 tháng"
      },
      { 
        id: 2, 
        name: "Dầu phanh DOT 4", 
        price: 150000, 
        quantity: 1, 
        category: "Phanh",
        condition: 'critical',
        description: "Dầu phanh đã bẩn, màu đen, ảnh hưởng nghiêm trọng đến hệ thống phanh",
        qualityLevel: 'standard',
        warranty: "12 tháng"
      }
    ],
    recommendedParts: [
      { 
        id: 3, 
        name: "Lọc dầu động cơ", 
        price: 150000, 
        quantity: 1, 
        category: "Bảo dưỡng",
        condition: 'recommended',
        description: "Đã đến chu kỳ thay thế theo khuyến cáo nhà sản xuất (10,000 km)",
        qualityLevel: 'standard',
        warranty: "10,000 km"
      },
      { 
        id: 4, 
        name: "Dầu động cơ 5W-30", 
        price: 450000, 
        quantity: 4, 
        category: "Dầu nhớt",
        condition: 'recommended',
        description: "Dầu còn sử dụng được nhưng nên thay để bảo vệ động cơ tối ưu",
        qualityLevel: 'standard',
        warranty: "6 tháng"
      }
    ],
    laborCost: 500000,
    totalRequiredCost: 0,
    totalRecommendedCost: 0,
    totalCost: 0,
    status: 'pending',
    date: '2025-01-15',
    notes: "Xe cần sửa chữa gấp phần phanh trước khi lưu thông. Khuyên khách hàng không lái xe cho đến khi sửa xong.",
    urgency: 'high'
  }
];

export default function GarageQuotationPage() {
  // State management
  const [quotations, setQuotations] = useState<QuotationDetail[]>(sampleQuotations);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationDetail | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editedQuotation, setEditedQuotation] = useState<QuotationDetail | null>(null);
  const [toast, setToast] = useState<ToastMessage>({ message: '', type: 'success' });
  const [selectedParts, setSelectedParts] = useState<{[key: number]: boolean}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Memoized calculations for better performance
  const quotationStats = useMemo(() => {
    const pending = quotations.filter(q => q.status === 'pending');
    const confirmed = quotations.filter(q => q.status === 'confirmed');
    const rejected = quotations.filter(q => q.status === 'rejected');
    const totalValue = confirmed.reduce((sum, q) => sum + q.totalCost, 0);

    return { pending, confirmed, rejected, totalValue };
  }, [quotations]);

  // Calculate selected parts cost
  const selectedPartsCost = useMemo(() => {
    if (!editedQuotation) return 0;
    
    return editedQuotation.recommendedParts
      .filter(part => selectedParts[part.id])
      .reduce((sum, part) => sum + (part.price * part.quantity), 0);
  }, [editedQuotation, selectedParts]);

  // Calculate final total
  const finalTotal = useMemo(() => {
    if (!editedQuotation) return 0;
    
    return editedQuotation.totalRequiredCost + selectedPartsCost + editedQuotation.laborCost;
  }, [editedQuotation, selectedPartsCost]);

  // Enhanced toast function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  // Calculate costs on quotation changes
  useEffect(() => {
    setQuotations(prev => prev.map(q => ({
      ...q,
      totalRequiredCost: q.requiredParts.reduce((sum, part) => sum + (part.price * part.quantity), 0),
      totalRecommendedCost: q.recommendedParts.reduce((sum, part) => sum + (part.price * part.quantity), 0),
      totalCost: q.requiredParts.reduce((sum, part) => sum + (part.price * part.quantity), 0) + 
                  q.recommendedParts.reduce((sum, part) => sum + (part.price * part.quantity), 0) + 
                  q.laborCost
    })));
  }, []);

  // Enhanced view details handler
  const handleViewDetails = (quotation: QuotationDetail) => {
    setSelectedQuotation(quotation);
    setEditedQuotation({...quotation});
    setShowDetails(true);
    
    // Initialize selected parts (all required parts selected by default)
    const initialSelected: {[key: number]: boolean} = {};
    quotation.requiredParts.forEach(part => {
      initialSelected[part.id] = true;
    });
    setSelectedParts(initialSelected);
  };

  // Enhanced part quality change handler
  const handlePartQualityChange = (partId: number, newQualityData: QualityOption, isRequired: boolean) => {
    if (!editedQuotation) return;
    
    const updateParts = (parts: Part[]) => 
      parts.map(part => 
        part.id === partId 
          ? { 
              ...part, 
              name: newQualityData.name, 
              price: newQualityData.price, 
              qualityLevel: newQualityData.level,
              warranty: newQualityData.warranty
            }
          : part
      );

    const updatedQuotation = {
      ...editedQuotation,
      requiredParts: isRequired ? updateParts(editedQuotation.requiredParts) : editedQuotation.requiredParts,
      recommendedParts: !isRequired ? updateParts(editedQuotation.recommendedParts) : editedQuotation.recommendedParts
    };

    // Recalculate costs
    updatedQuotation.totalRequiredCost = updatedQuotation.requiredParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
    updatedQuotation.totalRecommendedCost = updatedQuotation.recommendedParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
    updatedQuotation.totalCost = updatedQuotation.totalRequiredCost + updatedQuotation.totalRecommendedCost + updatedQuotation.laborCost;

    setEditedQuotation(updatedQuotation);
    showToast(`Đã cập nhật ${newQualityData.name}`, 'info');
  };

  // Enhanced part selection handler
  const handlePartSelection = (partId: number, selected: boolean) => {
    setSelectedParts(prev => ({ ...prev, [partId]: selected }));
  };

  // Enhanced confirm quotation handler with loading state
  const handleConfirmQuotation = async () => {
    if (!editedQuotation) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const confirmedRequired = editedQuotation.requiredParts.filter(part => selectedParts[part.id]);
    const confirmedRecommended = editedQuotation.recommendedParts.filter(part => selectedParts[part.id]);
    
    const finalQuotation = {
      ...editedQuotation,
      requiredParts: confirmedRequired,
      recommendedParts: confirmedRecommended,
      status: 'confirmed' as const
    };

    setQuotations(prev => prev.map(q => 
      q.id === editedQuotation.id ? finalQuotation : q
    ));

    setIsLoading(false);
    setShowDetails(false);
    showToast('Báo giá đã được xác nhận thành công! Garage sẽ liên hệ sớm.', 'success');
  };

  // Enhanced reject quotation handler
  const handleRejectQuotation = () => {
    if (!selectedQuotation) return;
    
    setQuotations(prev => prev.map(q => 
      q.id === selectedQuotation.id ? { ...q, status: 'rejected' } : q
    ));
    
    setShowDetails(false);
    showToast('Báo giá đã bị từ chối.', 'error');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header quotationStats={quotationStats} />

      <div className="container mx-auto px-4 py-8">
        {/* Toast */}
        <Toast toast={toast} />

        <div className="space-y-6">
          {/* Pending Quotations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Báo giá cần phản hồi</h2>
              {quotationStats.pending.length > 0 && (
                <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  {quotationStats.pending.length} cần xử lý
                </span>
              )}
            </div>
            
            {quotationStats.pending.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Không có báo giá nào cần phản hồi</p>
                <p className="text-sm text-gray-500 mt-1">Tất cả báo giá đã được xử lý</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotationStats.pending.map((quotation) => (
                  <QuotationCard
                    key={quotation.id}
                    quotation={quotation}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirmed Quotations */}
          {quotationStats.confirmed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Báo giá đã xác nhận</h2>
              <div className="space-y-3">
                {quotationStats.confirmed.map((quotation) => (
                  <ConfirmedQuotation
                    key={quotation.id}
                    quotation={quotation}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetails && selectedQuotation && editedQuotation && (
        <QuotationModal
          quotation={selectedQuotation}
          editedQuotation={editedQuotation}
          selectedParts={selectedParts}
          selectedPartsCost={selectedPartsCost}
          finalTotal={finalTotal}
          isLoading={isLoading}
          onClose={() => setShowDetails(false)}
          onPartQualityChange={handlePartQualityChange}
          onPartSelection={handlePartSelection}
          onConfirm={handleConfirmQuotation}
          onReject={handleRejectQuotation}
        />
      )}
    </div>
  );
}