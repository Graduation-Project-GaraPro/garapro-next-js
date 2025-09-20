"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Wrench, Clock, AlertTriangle } from "lucide-react";
import { RepairList } from "@/components/customer/repairs/RepairList";
import { FilterBar } from "@/components/customer/common/FilterBar";
import { SearchInput } from "@/components/customer/common/SearchInput";

export default function RepairsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yêu cầu sửa chữa</h1>
          <p className="text-muted-foreground">
            Quản lý các yêu cầu sửa chữa và theo dõi tiến độ
          </p>
        </div>
        <div>
          <Link 
            href="/customer/repairs/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Tạo yêu cầu mới
          </Link>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <SearchInput 
            placeholder="Tìm kiếm theo biển số xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <FilterBar 
          options={[
            { value: "all", label: "Tất cả" },
            { value: "pending", label: "Chờ xử lý" },
            { value: "in-progress", label: "Đang xử lý" },
            { value: "completed", label: "Hoàn thành" },
          ]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
        />
      </div>
      
      <RepairList searchTerm={searchTerm} statusFilter={statusFilter} />
    </div>
  );
}