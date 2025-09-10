"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  Settings,
  Bell,
} from "lucide-react";

// Import các component con
import ServiceRequestForm from "@/components/receptionist/ServiceRequestForm";
import CustomerManagement from "@/components/receptionist/CustomerManagement";
import ProgressTracking from "@/components/receptionist/ProgressTracking";
import QuoteManagement from "@/components/receptionist/QuoteManagement";
import CustomerFeedback from "@/components/receptionist/CustomerFeedback";
import RepairSchedule from "@/components/receptionist/RepairSchedule";

// Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  vehicles: Vehicle[];
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  vehicleId: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  estimatedCompletionDate?: Date;
  technicianId?: string;
  notes?: string;
}

export interface Quote {
  id: string;
  serviceRequestId: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "approved" | "rejected";
  validUntil: Date;
  createdAt: Date;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: "labor" | "parts" | "other";
}

export interface Feedback {
  id: string;
  serviceRequestId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  response?: string;
}

const ReceptionistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - trong thực tế sẽ fetch từ API
  const dashboardStats = {
    pendingRequests: 12,
    inProgress: 8,
    completedToday: 5,
    pendingQuotes: 3,
    newFeedback: 2,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bảng điều khiển Lễ tân
              </h1>
              <p className="text-sm text-gray-600">
                Quản lý đơn sửa chữa và khách hàng
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Thông báo
                {dashboardStats.newFeedback > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {dashboardStats.newFeedback}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="requests">Đơn sửa chữa</TabsTrigger>
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
            <TabsTrigger value="progress">Tiến độ</TabsTrigger>
            <TabsTrigger value="quotes">Báo giá</TabsTrigger>
            <TabsTrigger value="feedback">Phản hồi</TabsTrigger>
          </TabsList>

          {/* Tổng quan */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Đơn chờ xử lý
                  </CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.pendingRequests}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cần xác nhận sớm
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Đang sửa chữa
                  </CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.inProgress}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Đang thực hiện
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Hoàn thành hôm nay
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.completedToday}
                  </div>
                  <p className="text-xs text-muted-foreground">Đã giao xe</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Báo giá chờ duyệt
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.pendingQuotes}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Chờ khách xác nhận
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Phản hồi mới
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.newFeedback}
                  </div>
                  <p className="text-xs text-muted-foreground">Cần phản hồi</p>
                </CardContent>
              </Card>
            </div>

            {/* Lịch sửa chữa hôm nay */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch sửa chữa hôm nay</CardTitle>
                <CardDescription>
                  Danh sách các xe dự kiến hoàn thành trong ngày
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RepairSchedule viewMode="today" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Đơn sửa chữa */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý đơn sửa chữa</CardTitle>
                <CardDescription>
                  Tạo mới và quản lý các đơn sửa chữa từ khách hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceRequestForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Khách hàng */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý khách hàng</CardTitle>
                <CardDescription>
                  Thông tin khách hàng và phương tiện
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tiến độ */}
          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Theo dõi tiến độ</CardTitle>
                <CardDescription>
                  Cập nhật và theo dõi tiến độ sửa chữa từ kỹ thuật viên
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressTracking />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Báo giá */}
          <TabsContent value="quotes">
            <Card>
              <CardHeader>
                <CardTitle>Quản lý báo giá</CardTitle>
                <CardDescription>
                  Tạo và gửi báo giá cho khách hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuoteManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Phản hồi */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Phản hồi khách hàng</CardTitle>
                <CardDescription>
                  Xem và phản hồi đánh giá từ khách hàng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerFeedback />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
