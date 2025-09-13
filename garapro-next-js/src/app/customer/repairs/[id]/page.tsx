"use client";

import { useState, useEffect } from "react";
import { RepairDetails } from "@/components/customer/repairs/RepairDetails";
import { useRepairDetails } from "@/hooks/customer/useRepairDetails";

export default function RepairDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: request, loading, error } = useRepairDetails(id);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Không tìm thấy yêu cầu
        </h2>
        <p className="text-gray-600 mb-4">
          Yêu cầu sửa chữa không tồn tại hoặc đã bị xóa.
        </p>
      </div>
    );
  }

  return <RepairDetails request={request} />;
}