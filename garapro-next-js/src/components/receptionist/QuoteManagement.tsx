import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calculator,
  Car,
  User,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: "parts" | "labor" | "service";
}

interface Quote {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleInfo: string;
  licensePlate: string;
  issueDescription: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: "draft" | "sent" | "approved" | "rejected" | "expired";
  createdDate: string;
  validUntil: string;
  notes?: string;
}

const QuoteManagement: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: "QT-001",
      customerName: "Nguyễn Văn A",
      customerPhone: "0901234567",
      customerEmail: "nguyenvana@email.com",
      vehicleInfo: "Honda Civic 2020",
      licensePlate: "29A-12345",
      issueDescription: "Tiếng kêu từ hệ thống phanh, cần kiểm tra và sửa chữa",
      items: [
        {
          id: "I1",
          name: "Má phanh trước",
          description: "Bộ má phanh ceramic cao cấp",
          quantity: 1,
          unitPrice: 800000,
          total: 800000,
          category: "parts",
        },
        {
          id: "I2",
          name: "Công thay má phanh",
          description: "Chi phí nhân công thay má phanh",
          quantity: 2,
          unitPrice: 200000,
          total: 400000,
          category: "labor",
        },
      ],
      subtotal: 1200000,
      tax: 120000,
      discount: 0,
      total: 1320000,
      status: "sent",
      createdDate: "2024-01-15",
      validUntil: "2024-01-25",
      notes: "Báo giá có hiệu lực 10 ngày",
    },
    {
      id: "QT-002",
      customerName: "Trần Thị B",
      customerPhone: "0912345678",
      customerEmail: "tranthib@email.com",
      vehicleInfo: "Toyota Camry 2019",
      licensePlate: "51G-67890",
      issueDescription: "Động cơ hoạt động không ổn định",
      items: [
        {
          id: "I3",
          name: "Chẩn đoán lỗi",
          description: "Kiểm tra và chẩn đoán hệ thống động cơ",
          quantity: 1,
          unitPrice: 300000,
          total: 300000,
          category: "service",
        },
      ],
      subtotal: 300000,
      tax: 30000,
      discount: 0,
      total: 330000,
      status: "draft",
      createdDate: "2024-01-16",
      validUntil: "2024-01-26",
    },
  ]);

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [newQuote, setNewQuote] = useState<Partial<Quote>>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    vehicleInfo: "",
    licensePlate: "",
    issueDescription: "",
    items: [],
    notes: "",
  });

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "sent":
        return "default";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "expired":
        return "secondary";
      default:
        return "default";
    }
  };

  const calculateQuoteTotal = (items: QuoteItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleCreateQuote = () => {
    if (!newQuote.customerName || !newQuote.vehicleInfo) return;

    const newId = `QT-${String(quotes.length + 1).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];
    const validUntil = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const quote: Quote = {
      id: newId,
      customerName: newQuote.customerName || "",
      customerPhone: newQuote.customerPhone || "",
      customerEmail: newQuote.customerEmail || "",
      vehicleInfo: newQuote.vehicleInfo || "",
      licensePlate: newQuote.licensePlate || "",
      issueDescription: newQuote.issueDescription || "",
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      status: "draft",
      createdDate: today,
      validUntil: validUntil,
      notes: newQuote.notes,
    };

    setQuotes((prev) => [...prev, quote]);
    setNewQuote({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      vehicleInfo: "",
      licensePlate: "",
      issueDescription: "",
      items: [],
      notes: "",
    });
    setIsCreateDialogOpen(false);
  };

  const handleStatusChange = (quoteId: string, newStatus: string) => {
    setQuotes((prev) =>
      prev.map((quote) =>
        quote.id === quoteId
          ? { ...quote, status: newStatus as Quote["status"] }
          : quote
      )
    );
  };

  const handleDeleteQuote = (quoteId: string) => {
    setQuotes((prev) => prev.filter((quote) => quote.id !== quoteId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản Lý Báo Giá</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Tạo Báo Giá Mới</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo Báo Giá Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Tên khách hàng *
                  </label>
                  <Input
                    value={newQuote.customerName || ""}
                    onChange={(e) =>
                      setNewQuote((prev) => ({
                        ...prev,
                        customerName: e.target.value,
                      }))
                    }
                    placeholder="Nhập tên khách hàng"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Số điện thoại</label>
                  <Input
                    value={newQuote.customerPhone || ""}
                    onChange={(e) =>
                      setNewQuote((prev) => ({
                        ...prev,
                        customerPhone: e.target.value,
                      }))
                    }
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newQuote.customerEmail || ""}
                  onChange={(e) =>
                    setNewQuote((prev) => ({
                      ...prev,
                      customerEmail: e.target.value,
                    }))
                  }
                  placeholder="Nhập email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Thông tin xe *</label>
                  <Input
                    value={newQuote.vehicleInfo || ""}
                    onChange={(e) =>
                      setNewQuote((prev) => ({
                        ...prev,
                        vehicleInfo: e.target.value,
                      }))
                    }
                    placeholder="VD: Honda Civic 2020"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Biển số xe</label>
                  <Input
                    value={newQuote.licensePlate || ""}
                    onChange={(e) =>
                      setNewQuote((prev) => ({
                        ...prev,
                        licensePlate: e.target.value,
                      }))
                    }
                    placeholder="VD: 29A-12345"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Mô tả vấn đề</label>
                <Textarea
                  value={newQuote.issueDescription || ""}
                  onChange={(e) =>
                    setNewQuote((prev) => ({
                      ...prev,
                      issueDescription: e.target.value,
                    }))
                  }
                  placeholder="Mô tả chi tiết vấn đề cần sửa chữa"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Ghi chú</label>
                <Textarea
                  value={newQuote.notes || ""}
                  onChange={(e) =>
                    setNewQuote((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Ghi chú thêm"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreateQuote}>Tạo Báo Giá</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo tên khách hàng, biển số, mã báo giá..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="draft">Nháp</SelectItem>
            <SelectItem value="sent">Đã gửi</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
            <SelectItem value="expired">Hết hạn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuotes.map((quote) => (
          <Card
            key={quote.id}
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{quote.id}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {quote.customerName}
                    </span>
                  </div>
                </div>
                <Badge variant={getStatusColor(quote.status)}>
                  {quote.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Car className="w-4 h-4" />
                  <span>{quote.vehicleInfo}</span>
                </div>
                {quote.licensePlate && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="w-4 h-4 text-center font-bold">•</span>
                    <span>{quote.licensePlate}</span>
                  </div>
                )}
                {quote.customerPhone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{quote.customerPhone}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tổng tiền:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(quote.total)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Tạo: {quote.createdDate}</span>
                  </div>
                  <span>HH: {quote.validUntil}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedQuote(quote);
                    setIsViewDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Xem
                </Button>

                <Select
                  onValueChange={(value) => handleStatusChange(quote.id, value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="sent">Đã gửi</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteQuote(quote.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quote Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Báo Giá - {selectedQuote?.id}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Thông tin khách hàng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{selectedQuote.customerName}</span>
                    </div>
                    {selectedQuote.customerPhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedQuote.customerPhone}</span>
                      </div>
                    )}
                    {selectedQuote.customerEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedQuote.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Thông tin xe</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4 text-gray-500" />
                      <span>{selectedQuote.vehicleInfo}</span>
                    </div>
                    {selectedQuote.licensePlate && (
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 text-center font-bold">•</span>
                        <span>Biển số: {selectedQuote.licensePlate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedQuote.issueDescription && (
                <div>
                  <h3 className="font-semibold mb-2">Mô tả vấn đề</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedQuote.issueDescription}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Chi tiết báo giá</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">
                          Hạng mục
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Mô tả
                        </th>
                        <th className="text-right p-3 text-sm font-medium">
                          SL
                        </th>
                        <th className="text-right p-3 text-sm font-medium">
                          Đơn giá
                        </th>
                        <th className="text-right p-3 text-sm font-medium">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuote.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3 text-sm">{item.name}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {item.description}
                          </td>
                          <td className="p-3 text-sm text-right">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-sm text-right">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="p-3 text-sm text-right font-medium">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(selectedQuote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Thuế (10%):</span>
                    <span>{formatCurrency(selectedQuote.tax)}</span>
                  </div>
                  {selectedQuote.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(selectedQuote.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">
                      {formatCurrency(selectedQuote.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Ngày tạo:</span>{" "}
                  {selectedQuote.createdDate}
                </div>
                <div>
                  <span className="font-medium">Có hiệu lực đến:</span>{" "}
                  {selectedQuote.validUntil}
                </div>
              </div>

              {selectedQuote.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Ghi chú</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedQuote.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Đóng
                </Button>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Xuất PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuoteManagement;
