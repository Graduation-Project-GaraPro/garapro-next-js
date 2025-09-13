"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Wrench, MessageCircle, Search, Filter, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import TechnicianChat from "@/components/customer/TechnicianChat";

// Kiểu dữ liệu cho repair request
interface RepairRequest {
  id: number | string;
  vehicle: string;
  licensePlate: string;
  issue: string;
  status: "pending" | "in-progress" | "completed";
  date: string;
  priority: "high" | "medium" | "low";
  progress: number;
  estimatedCompletion: string;
  technician: string;
  steps: RepairStep[];
}

// Kiểu dữ liệu cho repair step
interface RepairStep {
  id: number | string;
  name: string;
  status: "pending" | "in-progress" | "completed";
  estimatedTime: number; // in hours
  actualTime?: number;
  notes?: string;
}

// Kiểu dữ liệu cho technician
interface Technician {
  id: number | string | null;
  name: string;
}

// Kiểu dữ liệu cho chat message
interface ChatMessage {
  id: number | string;
  from: "user" | "tech";
  text: string;
  time: string;
}

export default function RepairProgressPage() {
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [contactToast, setContactToast] = useState<string>("");
  const [showChat, setShowChat] = useState<boolean>(false);
  const [activeTech, setActiveTech] = useState<Technician>({
    id: null,
    name: "Kỹ thuật viên",
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // search & filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "in-progress" | "completed"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  useEffect(() => {
    // Simulate loading repair requests
    setRepairRequests([
      {
        id: 1,
        vehicle: "Honda Civic 2020",
        licensePlate: "59A-123.45",
        issue: "Động cơ kêu lạ",
        status: "pending",
        date: "2024-09-10",
        priority: "high",
        progress: 0,
        estimatedCompletion: "2024-09-15",
        technician: "Đang chờ phân công",
        steps: [
          {
            id: 1,
            name: "Tiếp nhận xe",
            status: "pending",
            estimatedTime: 0.5,
          },
          {
            id: 2,
            name: "Chẩn đoán sơ bộ",
            status: "pending",
            estimatedTime: 1,
          },
          {
            id: 3,
            name: "Sửa chữa",
            status: "pending",
            estimatedTime: 3,
          },
          {
            id: 4,
            name: "Kiểm tra chất lượng",
            status: "pending",
            estimatedTime: 0.5,
          },
        ],
      },
      {
        id: 2,
        vehicle: "Toyota Camry 2019",
        licensePlate: "51G-678.90",
        issue: "Thay dầu máy",
        status: "in-progress",
        date: "2024-09-08",
        priority: "medium",
        progress: 50,
        estimatedCompletion: "2024-09-12",
        technician: "Nguyễn Văn A",
        steps: [
          {
            id: 1,
            name: "Tiếp nhận xe",
            status: "completed",
            estimatedTime: 0.5,
            actualTime: 0.4,
            notes: "Đã tiếp nhận và kiểm tra tổng quát",
          },
          {
            id: 2,
            name: "Xả dầu cũ",
            status: "completed",
            estimatedTime: 0.5,
            actualTime: 0.5,
          },
          {
            id: 3,
            name: "Thay lọc dầu và đổ dầu mới",
            status: "in-progress",
            estimatedTime: 1,
          },
          {
            id: 4,
            name: "Kiểm tra và bàn giao",
            status: "pending",
            estimatedTime: 0.5,
          },
        ],
      },
      {
        id: 3,
        vehicle: "BMW X5 2021",
        licensePlate: "30F-246.80",
        issue: "Kiểm tra phanh",
        status: "completed",
        date: "2024-09-05",
        priority: "low",
        progress: 100,
        estimatedCompletion: "2024-09-07",
        technician: "Trần Thị B",
        steps: [
          {
            id: 1,
            name: "Tiếp nhận xe",
            status: "completed",
            estimatedTime: 0.5,
            actualTime: 0.5,
          },
          {
            id: 2,
            name: "Kiểm tra hệ thống phanh",
            status: "completed",
            estimatedTime: 1,
            actualTime: 1.2,
            notes: "Phát hiện má phanh mòn",
          },
          {
            id: 3,
            name: "Thay má phanh",
            status: "completed",
            estimatedTime: 2,
            actualTime: 1.8,
          },
          {
            id: 4,
            name: "Kiểm tra và bàn giao",
            status: "completed",
            estimatedTime: 0.5,
            actualTime: 0.5,
            notes: "Đã bàn giao cho khách hàng",
          },
        ],
      },
    ]);
  }, []);

  const visibleRequests = repairRequests.filter((r) => {
    const matchesSearch =
      r.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.issue.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || r.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleContactTech = (techName: string) => {
    setContactToast(`Đang kết nối với ${techName}...`);
    setTimeout(() => {
      setContactToast("");
      setShowChat(true);
      setActiveTech({ id: 1, name: techName });
      setChatMessages([
        {
          id: 1,
          from: "tech",
          text: "Xin chào, tôi là " + techName + ". Tôi có thể giúp gì cho bạn?",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }, 1500);
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      from: "user",
      text: message,
      time: new Date().toLocaleTimeString(),
    } as ChatMessage;

    setChatMessages([...chatMessages, userMessage]);

    // Simulate tech response
    setTimeout(() => {
      const techResponse = {
        id: chatMessages.length + 2,
        from: "tech",
        text: "Cảm ơn bạn đã liên hệ. Chúng tôi đang xử lý yêu cầu của bạn và sẽ cập nhật sớm nhất có thể.",
        time: new Date().toLocaleTimeString(),
      } as ChatMessage;

      setChatMessages((prev) => [...prev, techResponse]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Theo dõi tiến độ</h1>
        <p className="text-muted-foreground">
          Theo dõi tiến độ sửa chữa phương tiện của bạn
        </p>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo xe, biển số..."
              className="w-full rounded-md border border-gray-300 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <select
              className="rounded-md border border-gray-300 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="in-progress">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>

          <div className="relative">
            <AlertTriangle className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <select
              className="rounded-md border border-gray-300 pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
            >
              <option value="all">Tất cả mức độ</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Repair requests */}
      {visibleRequests.length > 0 ? (
        <div className="space-y-6">
          {visibleRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-lg font-semibold">{request.vehicle}</h2>
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100">
                        {request.licensePlate}
                      </span>
                      {request.status === "pending" && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Chờ xử lý
                        </span>
                      )}
                      {request.status === "in-progress" && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          Đang xử lý
                        </span>
                      )}
                      {request.status === "completed" && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Hoàn thành
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="inline-flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {request.date}
                      </span>
                      <span className="inline-flex items-center ml-4">
                        <Wrench className="h-4 w-4 mr-1" />
                        {request.issue}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <Link
                      href={"/customer/repairs/" + request.id}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Tiến độ</span>
                    <span>{request.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${request.status === "completed" ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ width: `${request.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Thông tin tiến độ
                  </h3>
                  <div className="flex items-center text-sm">
                    <div className="mr-6">
                      <span className="text-gray-500">Kỹ thuật viên:</span>{" "}
                      <span className="font-medium">{request.technician}</span>
                      {request.status === "in-progress" && (
                        <button
                          onClick={() => handleContactTech(request.technician)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <MessageCircle className="h-4 w-4 inline" />
                        </button>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Dự kiến hoàn thành:</span>{" "}
                      <span className="font-medium">
                        {request.estimatedCompletion}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Các bước thực hiện
                  </h3>
                  <div className="space-y-3">
                    {request.steps.map((step) => (
                      <div key={step.id} className="flex items-center">
                        {step.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : step.status === "in-progress" ? (
                          <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-2"></div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-gray-300 mr-2"></div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span
                              className={`text-sm ${step.status === "completed" ? "line-through text-gray-500" : "text-gray-700"}`}
                            >
                              {step.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {step.actualTime
                                ? `${step.actualTime} giờ`
                                : `Ước tính: ${step.estimatedTime} giờ`}
                            </span>
                          </div>
                          {step.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {step.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Wrench className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Không tìm thấy yêu cầu sửa chữa
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
              ? "Không có kết quả phù hợp với bộ lọc của bạn."
              : "Bạn chưa có yêu cầu sửa chữa nào đang được xử lý."}
          </p>
          <div className="mt-6">
            <Link
              href="/customer/repairs/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Tạo yêu cầu mới
            </Link>
          </div>
        </div>
      )}

      {/* Chat with technician */}
      {showChat && (
        <TechnicianChat
          technician={activeTech}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Toast notification */}
      {contactToast && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
          {contactToast}
        </div>
      )}
    </div>
  );
}