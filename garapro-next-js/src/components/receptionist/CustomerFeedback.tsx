import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  User,
  Car,
  Reply,
  Filter,
  TrendingUp,
  Award,
  AlertTriangle,
} from "lucide-react";

interface Feedback {
  id: string;
  customerName: string;
  vehicleInfo: string;
  licensePlate: string;
  serviceDate: string;
  rating: number; // 1-5
  serviceType: string;
  comment: string;
  category:
    | "service-quality"
    | "staff-attitude"
    | "pricing"
    | "facility"
    | "waiting-time"
    | "other";
  status: "new" | "reviewed" | "responded" | "resolved";
  response?: string;
  responseDate?: string;
  respondedBy?: string;
  isRecommended: boolean;
  tags: string[];
}

const CustomerFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: "FB-001",
      customerName: "Nguyễn Văn A",
      vehicleInfo: "Honda Civic 2020",
      licensePlate: "29A-12345",
      serviceDate: "2024-01-15",
      rating: 5,
      serviceType: "Bảo dưỡng định kỳ",
      comment:
        "Dịch vụ rất tốt, nhân viên thân thiện và chuyên nghiệp. Xe được chăm sóc kỹ lưỡng. Tôi rất hài lòng và sẽ quay lại lần sau.",
      category: "service-quality",
      status: "responded",
      response:
        "Cảm ơn anh đã tin tưởng dịch vụ của chúng tôi. Chúng tôi luôn cố gắng mang đến trải nghiệm tốt nhất cho khách hàng.",
      responseDate: "2024-01-16",
      respondedBy: "Quản lý dịch vụ",
      isRecommended: true,
      tags: ["excellent-service", "professional-staff"],
    },
    {
      id: "FB-002",
      customerName: "Trần Thị B",
      vehicleInfo: "Toyota Camry 2019",
      licensePlate: "51G-67890",
      serviceDate: "2024-01-16",
      rating: 3,
      serviceType: "Sửa chữa động cơ",
      comment:
        "Chất lượng sửa chữa ổn nhưng thời gian chờ hơi lâu. Hy vọng lần sau sẽ nhanh hơn.",
      category: "waiting-time",
      status: "new",
      isRecommended: false,
      tags: ["long-wait", "service-ok"],
    },
    {
      id: "FB-003",
      customerName: "Lê Văn C",
      vehicleInfo: "BMW 320i 2021",
      licensePlate: "30H-11111",
      serviceDate: "2024-01-14",
      rating: 2,
      serviceType: "Kiểm tra định kỳ",
      comment:
        "Giá cả hơi cao so với mặt bằng chung. Staff cần được đào tạo thêm về cách giao tiếp.",
      category: "pricing",
      status: "reviewed",
      isRecommended: false,
      tags: ["expensive", "staff-training-needed"],
    },
    {
      id: "FB-004",
      customerName: "Phạm Thị D",
      vehicleInfo: "Mazda CX-5 2022",
      licensePlate: "43C-98765",
      serviceDate: "2024-01-17",
      rating: 4,
      serviceType: "Thay dầu và bảo dưỡng",
      comment:
        "Nhìn chung khá hài lòng. Cơ sở vật chất hiện đại, nhân viên nhiệt tình. Chỉ có điều bãi đỗ xe hơi chật.",
      category: "facility",
      status: "new",
      isRecommended: true,
      tags: ["modern-facility", "enthusiastic-staff", "parking-issue"],
    },
  ]);

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesRating =
      filterRating === "all" ||
      (filterRating === "positive" && feedback.rating >= 4) ||
      (filterRating === "neutral" && feedback.rating === 3) ||
      (filterRating === "negative" && feedback.rating <= 2);

    const matchesStatus =
      filterStatus === "all" || feedback.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || feedback.category === filterCategory;

    return matchesRating && matchesStatus && matchesCategory;
  });

  const stats = {
    totalFeedbacks: feedbacks.length,
    averageRating:
      feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length,
    positiveCount: feedbacks.filter((f) => f.rating >= 4).length,
    negativeCount: feedbacks.filter((f) => f.rating <= 2).length,
    responseRate:
      (feedbacks.filter((f) => f.status === "responded").length /
        feedbacks.length) *
      100,
  };

  const handleResponse = () => {
    if (!selectedFeedback || !responseText.trim()) return;

    const today = new Date().toISOString().split("T")[0];

    setFeedbacks((prev) =>
      prev.map((feedback) =>
        feedback.id === selectedFeedback.id
          ? {
              ...feedback,
              response: responseText,
              responseDate: today,
              respondedBy: "Quản lý dịch vụ",
              status: "responded" as const,
            }
          : feedback
      )
    );

    setResponseText("");
    setIsResponseDialogOpen(false);
    setSelectedFeedback(null);
  };

  const handleStatusChange = (
    feedbackId: string,
    newStatus: Feedback["status"]
  ) => {
    setFeedbacks((prev) =>
      prev.map((feedback) =>
        feedback.id === feedbackId
          ? { ...feedback, status: newStatus }
          : feedback
      )
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating === 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "destructive";
      case "reviewed":
        return "default";
      case "responded":
        return "default";
      case "resolved":
        return "secondary";
      default:
        return "default";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      "service-quality": "Chất lượng dịch vụ",
      "staff-attitude": "Thái độ nhân viên",
      pricing: "Giá cả",
      facility: "Cơ sở vật chất",
      "waiting-time": "Thời gian chờ",
      other: "Khác",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phản Hồi Khách Hàng</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {feedbacks.length} phản hồi | Trung bình:{" "}
            {stats.averageRating.toFixed(1)} ⭐
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalFeedbacks}</p>
                <p className="text-sm text-gray-600">Tổng phản hồi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Điểm trung bình</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.positiveCount}</p>
                <p className="text-sm text-gray-600">Đánh giá tích cực</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Reply className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.responseRate.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600">Tỷ lệ phản hồi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Lọc:</span>
        </div>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Đánh giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="positive">Tích cực (4-5 sao)</SelectItem>
            <SelectItem value="neutral">Trung tính (3 sao)</SelectItem>
            <SelectItem value="negative">Tiêu cực (1-2 sao)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="new">Mới</SelectItem>
            <SelectItem value="reviewed">Đã xem</SelectItem>
            <SelectItem value="responded">Đã phản hồi</SelectItem>
            <SelectItem value="resolved">Đã giải quyết</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            <SelectItem value="service-quality">Chất lượng dịch vụ</SelectItem>
            <SelectItem value="staff-attitude">Thái độ nhân viên</SelectItem>
            <SelectItem value="pricing">Giá cả</SelectItem>
            <SelectItem value="facility">Cơ sở vật chất</SelectItem>
            <SelectItem value="waiting-time">Thời gian chờ</SelectItem>
            <SelectItem value="other">Khác</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFeedbacks.map((feedback) => (
          <Card
            key={feedback.id}
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>{feedback.customerName}</span>
                    {feedback.isRecommended && (
                      <Award
                        className="w-4 h-4 text-yellow-600"
                        xlinkTitle="Khách hàng giới thiệu"
                      />
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {feedback.vehicleInfo} - {feedback.licensePlate}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant={getStatusColor(feedback.status)}>
                    {feedback.status === "new" && "Mới"}
                    {feedback.status === "reviewed" && "Đã xem"}
                    {feedback.status === "responded" && "Đã phản hồi"}
                    {feedback.status === "resolved" && "Đã giải quyết"}
                  </Badge>
                  {feedback.rating <= 2 && (
                    <AlertTriangle
                      className="w-4 h-4 text-red-500"
                      xlinkTitle="Cần chú ý"
                    />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {renderStars(feedback.rating)}
                  <span
                    className={`font-medium ${getRatingColor(feedback.rating)}`}
                  >
                    {feedback.rating}/5
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{feedback.serviceDate}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(feedback.category)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {feedback.serviceType}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {feedback.comment}
                </p>
              </div>

              {feedback.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {feedback.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {feedback.response && (
                <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-3 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <Reply className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Phản hồi từ {feedback.respondedBy}
                    </span>
                    <span className="text-xs text-blue-600">
                      {feedback.responseDate}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">{feedback.response}</p>
                </div>
              )}

              <div className="flex space-x-2">
                {feedback.status === "new" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(feedback.id, "reviewed")}
                  >
                    Đánh dấu đã xem
                  </Button>
                )}

                {!feedback.response && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedFeedback(feedback);
                      setIsResponseDialogOpen(true);
                    }}
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Phản hồi
                  </Button>
                )}

                {feedback.status === "responded" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(feedback.id, "resolved")}
                  >
                    Đánh dấu đã giải quyết
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Response Dialog */}
      <Dialog
        open={isResponseDialogOpen}
        onOpenChange={setIsResponseDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Phản Hồi Khách Hàng</DialogTitle>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">
                    {selectedFeedback.customerName}
                  </span>
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedFeedback.rating)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedFeedback.comment}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Phản hồi của bạn:
                </label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Nhập phản hồi cho khách hàng..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsResponseDialogOpen(false);
                    setResponseText("");
                    setSelectedFeedback(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleResponse}
                  disabled={!responseText.trim()}
                >
                  Gửi Phản Hồi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerFeedback;
