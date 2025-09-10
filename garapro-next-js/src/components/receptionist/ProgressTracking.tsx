"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Car,
  Calendar,
  User,
} from "lucide-react";

interface RepairTask {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  progress: number;
  estimatedTime: number; // in hours
  actualTime?: number;
  assignedTo: string;
  priority: "low" | "medium" | "high";
}

interface RepairOrder {
  id: string;
  customerName: string;
  vehicleInfo: string;
  licensePlate: string;
  startDate: string;
  estimatedCompletion: string;
  status:
    | "received"
    | "diagnosed"
    | "in-repair"
    | "quality-check"
    | "completed"
    | "delivered";
  tasks: RepairTask[];
  overallProgress: number;
}

const ProgressTracking: React.FC = () => {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([
    {
      id: "RO-001",
      customerName: "Nguyễn Văn A",
      vehicleInfo: "Honda Civic 2020",
      licensePlate: "29A-12345",
      startDate: "2024-01-15",
      estimatedCompletion: "2024-01-20",
      status: "in-repair",
      overallProgress: 65,
      tasks: [
        {
          id: "T1",
          name: "Kiểm tra hệ thống phanh",
          status: "completed",
          progress: 100,
          estimatedTime: 2,
          actualTime: 1.5,
          assignedTo: "Thợ A",
          priority: "high",
        },
        {
          id: "T2",
          name: "Thay dầu động cơ",
          status: "completed",
          progress: 100,
          estimatedTime: 1,
          actualTime: 1,
          assignedTo: "Thợ B",
          priority: "medium",
        },
        {
          id: "T3",
          name: "Sửa hệ thống điều hòa",
          status: "in-progress",
          progress: 60,
          estimatedTime: 4,
          assignedTo: "Thợ C",
          priority: "medium",
        },
        {
          id: "T4",
          name: "Kiểm tra tổng thể",
          status: "pending",
          progress: 0,
          estimatedTime: 1,
          assignedTo: "Thợ A",
          priority: "low",
        },
      ],
    },
    {
      id: "RO-002",
      customerName: "Trần Thị B",
      vehicleInfo: "Toyota Camry 2019",
      licensePlate: "51G-67890",
      startDate: "2024-01-16",
      estimatedCompletion: "2024-01-18",
      status: "diagnosed",
      overallProgress: 25,
      tasks: [
        {
          id: "T5",
          name: "Chẩn đoán lỗi động cơ",
          status: "completed",
          progress: 100,
          estimatedTime: 2,
          actualTime: 2.5,
          assignedTo: "Thợ D",
          priority: "high",
        },
        {
          id: "T6",
          name: "Thay phụ tùng động cơ",
          status: "pending",
          progress: 0,
          estimatedTime: 6,
          assignedTo: "Thợ D",
          priority: "high",
        },
      ],
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<string>("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "on-hold":
        return "bg-yellow-500";
      case "pending":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <Wrench className="w-4 h-4" />;
      case "on-hold":
        return <AlertCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const updateTaskProgress = (
    orderId: string,
    taskId: string,
    newProgress: number
  ) => {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Theo Dõi Tiến Độ Sửa Chữa</h1>
        <div className="flex items-center space-x-2">
          <Car className="w-5 h-5" />
          <span className="text-sm text-gray-600">
            {repairOrders.length} đơn hàng đang xử lý
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {repairOrders.map((order) => (
          <Card key={order.id} className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.id}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {order.customerName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {order.vehicleInfo} - {order.licensePlate}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    order.status === "completed" ? "default" : "secondary"
                  }
                >
                  {order.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tiến độ tổng thể</span>
                  <span className="text-sm text-gray-600">
                    {order.overallProgress}%
                  </span>
                </div>
                <Progress value={order.overallProgress} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Bắt đầu: {order.startDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Dự kiến: {order.estimatedCompletion}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Danh sách công việc:</h4>
                {order.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm font-medium">{task.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={getPriorityColor(task.priority)}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {task.assignedTo}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Progress
                        value={task.progress}
                        className="flex-1 h-1.5 mr-2"
                      />
                      <span className="text-xs text-gray-600 min-w-[40px]">
                        {task.progress}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Dự kiến: {task.estimatedTime}h</span>
                      {task.actualTime && (
                        <span>Thực tế: {task.actualTime}h</span>
                      )}
                    </div>

                    {task.status === "in-progress" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateTaskProgress(
                              order.id,
                              task.id,
                              Math.min(task.progress + 25, 100)
                            )
                          }
                          className="text-xs"
                        >
                          +25%
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateTaskProgress(order.id, task.id, 100)
                          }
                          className="text-xs"
                        >
                          Hoàn thành
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracking;
