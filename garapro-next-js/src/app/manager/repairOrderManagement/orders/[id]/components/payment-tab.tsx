"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileDown, Share2, X, Download, Printer, Check, QrCode, Archive } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { paymentService } from "@/services/manager/payment-service"
import { useToast } from "@/hooks/use-toast"
import type { PaymentSummaryResponse, PaymentPreviewResponse } from "@/types/manager/payment"
import { getPaymentMethodName, getPaymentStatusName, getPaymentStatusColor } from "@/types/manager/payment"
import { formatVND } from "@/lib/currency"
import { usePaymentHub } from "@/hooks/use-payment-hub"

interface PaymentTabProps {
  orderId: string
  repairOrderStatus?: number
  paidStatus?: string
  isArchived?: boolean
  onPaymentSuccess?: () => void
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "cash",
    name: "Cash Payment",
    icon: <DollarSign className="w-8 h-8" />
  },
  {
    id: "payos",
    name: "PayOs (QR Code)",
    icon: <QrCode className="w-8 h-8" />
  }
]

export default function PaymentTab({ orderId, repairOrderStatus, paidStatus, isArchived, onPaymentSuccess }: PaymentTabProps) {
  const { toast } = useToast()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [showInvoice, setShowInvoice] = useState<boolean>(false)
  const [showPaymentPreview, setShowPaymentPreview] = useState<boolean>(false)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryResponse | null>(null)
  const [paymentPreview, setPaymentPreview] = useState<PaymentPreviewResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false)
  const [processingPayment, setProcessingPayment] = useState<boolean>(false)
  const [cashPaymentData, setCashPaymentData] = useState({
    description: ""
  })

  const isRepairOrderCompleted = repairOrderStatus === 3

  // Initialize SignalR payment hub for real-time updates
  const { isConnected: isPaymentHubConnected } = usePaymentHub({
    repairOrderId: orderId,
    isManager: true,
    autoConnect: isRepairOrderCompleted, 
    showToasts: false, 
    onPaymentCreated: (event) => {
      console.log("Payment created for this RO:", event)
      // Reload payment summary when new payment is created
      loadPaymentSummary()
      if (onPaymentSuccess) {
        onPaymentSuccess()
      }
    },
    onPaymentStatusUpdated: (event) => {
      console.log("Payment status updated:", event)
      // Reload payment summary when payment status changes
      loadPaymentSummary()
    },
    onPaymentCompleted: (event) => {
      console.log("Payment completed for this RO:", event)
      // Update payment summary with the completed data
      setPaymentSummary(event.paymentSummary)
      if (onPaymentSuccess) {
        onPaymentSuccess()
      }
      toast({
        title: "Payment Completed!",
        description: `Repair Order is now fully paid.`,
      })
    }
  })

  // Load payment summary
  useEffect(() => {
    if (isRepairOrderCompleted) {
      loadPaymentSummary()
    }
  }, [orderId, isRepairOrderCompleted])

  const loadPaymentSummary = async () => {
    try {
      setLoading(true)
      const data = await paymentService.getPaymentSummary(orderId)
      
      // Add computed fields for backward compatibility
      const enrichedData: PaymentSummaryResponse = {
        ...data,
        totalAmount: data.repairOrderCost,
        discountAmount: data.totalDiscount,
        paymentStatus: data.paidStatus === 1 ? 'Paid' : 'Unpaid'
      }
      
      setPaymentSummary(enrichedData)
    } catch (error: any) {
      console.error("Failed to load payment summary:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load payment summary",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Check if repair order is paid (no partial payments)
  const isPaid = paymentSummary?.paidStatus === 1 || paymentSummary?.paymentStatus === 'Paid'

  const handleShareInvoice = () => {
    // TODO: Implement email functionality
    console.log("Share invoice via email")
  }

  const handleDownloadInvoice = () => {
    // TODO: Implement PDF download
    console.log("Download invoice as PDF")
  }

  const handlePrintInvoice = () => {
    // TODO: Implement print functionality
    console.log("Print invoice")
  }

  const handlePaymentMethodSelect = async (methodId: string) => {
    if (isArchived) {
      toast({
        title: "Cannot Process Payment",
        description: "This repair order is archived and cannot be modified.",
        variant: "destructive",
      })
      return
    }

    if (!isRepairOrderCompleted) {
      toast({
        title: "Cannot Process Payment",
        description: "Repair order must be completed before processing payment",
        variant: "destructive",
      })
      return
    }

    // Cannot pay if already fully paid
    if (paidStatus === 'Paid') {
      toast({
        title: "Payment Not Allowed",
        description: "This repair order is already fully paid. No additional payment is needed.",
        variant: "destructive",
      })
      return
    }

    setSelectedPaymentMethod(methodId)
    
    if (methodId === "cash") {
      await loadPaymentPreview()
    } else if (methodId === "payos") {
      handleGenerateQRCode()
    }
  }

  const loadPaymentPreview = async () => {
    try {
      setLoadingPreview(true)
      const preview = await paymentService.getPaymentPreview(orderId)
      setPaymentPreview(preview)
      setShowPaymentPreview(true)
    } catch (error: any) {
      console.error("Failed to load payment preview:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load payment preview",
        variant: "destructive",
      })
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (paidStatus === 'Paid') {
      toast({
        title: "Payment Not Allowed",
        description: "This repair order is already fully paid. No additional payment is needed.",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessingPayment(true)
      
      const paymentRequest = {
        method: 1,
        description: cashPaymentData.description || `Cash payment for repair order ${orderId}`,
      };
      
      console.log("=== PAYMENT REQUEST ===");
      console.log("Repair Order ID:", orderId);
      console.log("Request Body:", JSON.stringify(paymentRequest, null, 2));
      console.log("API Endpoint:", `/payments/manager-create/${orderId}`);
      console.log("Note: Backend automatically gets customer userId from repair order");
      
      const response = await paymentService.createPayment(orderId, paymentRequest)

      toast({
        title: "Payment Success",
        description: response.message || "Cash payment processed successfully. Repair order status updated.",
      })

      await loadPaymentSummary()
      if (onPaymentSuccess) {
        onPaymentSuccess()
      }

      setShowPaymentPreview(false)
      setPaymentPreview(null)
      setCashPaymentData({
        description: ""
      })
    } catch (error: any) {
      console.error("=== PAYMENT ERROR ===");
      console.error("Error object:", error);
      console.error("Error message:", error?.message);
      console.error("Error status:", error?.status);
      console.error("Error code:", error?.code);
      console.error("Error details:", error?.details);
      
      const errorMessage = error?.message || "";
      const responseData = error?.details;
      
      const isActuallySuccessful = 
        errorMessage.includes("Payment record created successfully") || 
        errorMessage.includes("successfully") ||
        (responseData && responseData.message && responseData.message.includes("successfully"));
      
      if (isActuallySuccessful) {
        toast({
          title: "Payment Success",
          description: responseData?.message || "Cash payment processed successfully. Repair order status updated.",
        })

        await loadPaymentSummary()

        if (onPaymentSuccess) {
          onPaymentSuccess()
        }

        setShowPaymentPreview(false)
        setPaymentPreview(null)
        setCashPaymentData({
          description: ""
        })
      } else {
        // Actual failure
        toast({
          title: "Payment Failed",
          description: errorMessage || "Failed to process cash payment",
          variant: "destructive",
        })
      }
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleCancelPaymentPreview = () => {
    setShowPaymentPreview(false)
    setPaymentPreview(null)
    setCashPaymentData({
      description: ""
    })
  }

  const handleGenerateQRCode = async () => {
    try {
      setProcessingPayment(true)
      const response = await paymentService.generateQRCode(orderId, {
        method: "PayOs",
        description: `PayOs payment for repair order ${orderId}`,
      })

      console.log("PayOS Payment Response:", {
        paymentId: response.paymentId,
        orderCode: response.orderCode,
        checkoutUrl: response.checkoutUrl
      })

      toast({
        title: "Payment Link Created",
        description: response.message || "Opening PayOS payment page...",
      })

      // Open PayOS checkout page directly in new tab
      if (response.checkoutUrl) {
        window.open(response.checkoutUrl, '_blank')
      }

      // Reload payment summary after a short delay to show the pending payment
      setTimeout(() => {
        loadPaymentSummary()
      }, 1000)
    } catch (error: any) {
      console.error("Failed to generate payment link:", error)
      toast({
        title: "Payment Link Failed",
        description: error.response?.data?.message || "Failed to create PayOS payment link",
        variant: "destructive",
      })
    } finally {
      setProcessingPayment(false)
    }
  }



  if (!isRepairOrderCompleted) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <FileDown className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold">Repair Order Not Completed</h3>
              <p className="text-gray-600">
                Payment processing is only available for completed repair orders. 
                Please complete the repair order first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#154c79] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Left Side - Payment Methods and Transactions */}
      <div className="flex-1 space-y-6">
        {/* Payment Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select payment method</CardTitle>
          </CardHeader>
          <CardContent>
            {isArchived ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Archive className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Archived Order</h3>
                <p className="text-gray-600">
                  This repair order is archived and cannot accept new payments.
                </p>
              </div>
            ) : paidStatus === 'Paid' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fully Paid</h3>
                <p className="text-gray-600">
                  This repair order has been fully paid. No additional payment is needed.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedPaymentMethod === method.id
                        ? "border-[#154c79] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-3 rounded-full ${
                        selectedPaymentMethod === method.id
                          ? "bg-[#154c79] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {method.icon}
                      </div>
                      <h3 className="font-semibold text-center">{method.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentSummary && paymentSummary.paymentHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Amount</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Method</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentSummary.paymentHistory.map((payment) => {
                        const methodName = getPaymentMethodName(payment.method);
                        const statusName = getPaymentStatusName(payment.status);
                        const statusColor = getPaymentStatusColor(payment.status);
                        
                        return (
                          <tr key={payment.paymentId} className="border-b">
                            <td className="py-3 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 text-sm font-medium">{formatVND(payment.amount)}</td>
                            <td className="py-3 text-sm">
                              <span className="inline-flex items-center gap-1">
                                {methodName === 'Cash' && '💵'}
                                {methodName === 'PayOs' && '📱'}
                                {methodName}
                              </span>
                            </td>
                            <td className="py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${statusColor.bg} ${statusColor.text}`}>
                                {statusName}
                              </span>
                            </td>
                            <td className="py-3 text-sm text-gray-600">{payment.description || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No payment history yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Payment Summary */}
      <div className="w-96">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentSummary ? (
              <>
                {/* Customer & Vehicle Info */}
                <div className="space-y-2 pb-4 border-b">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{paymentSummary.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{paymentSummary.vehicleInfo}</p>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Repair Order Cost:</span>
                    <span className="text-sm font-medium">{formatVND(paymentSummary.repairOrderCost)}</span>
                  </div>
                  {paymentSummary.totalDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-red-600">Discount:</span>
                      <span className="text-sm font-medium text-red-600">-{formatVND(paymentSummary.totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-[#154c79]">{formatVND(paymentSummary.amountToPay)}</span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">Payment Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isPaid
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No payment information available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Invoice Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Invoice - RO #{orderId}</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareInvoice}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInvoice(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Company Info */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">GaragePro Auto Service</h3>
                <p className="text-gray-600">123 Main Street, City, State 12345</p>
                <p className="text-gray-600">Phone: (555) 123-4567 | Email: info@garagepro.com</p>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
                  <p className="text-gray-600">Quan</p>
                  <p className="text-gray-600">2011 Honda Element EX</p>
                  <p className="text-gray-600">VIN: 1HGBH41JXMN109186</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Invoice Details:</h4>
                  <p className="text-gray-600">Invoice #: INV-{orderId}</p>
                  <p className="text-gray-600">Date: August 27, 2021</p>
                  <p className="text-gray-600">Due Date: September 6, 2021</p>
                </div>
              </div>

              {/* Service Details */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Service Details</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Hours</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Rate</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="py-3 px-4">Engine Diagnostic</td>
                        <td className="py-3 px-4 text-right">1.5</td>
                        <td className="py-3 px-4 text-right">$95.00</td>
                        <td className="py-3 px-4 text-right">$142.50</td>
                      </tr>
                      <tr className="border-t">
                        <td className="py-3 px-4">Oil Change</td>
                        <td className="py-3 px-4 text-right">0.5</td>
                        <td className="py-3 px-4 text-right">$70.00</td>
                        <td className="py-3 px-4 text-right">$35.00</td>
                      </tr>
                      <tr className="border-t">
                        <td className="py-3 px-4">Air Filter Replacement</td>
                        <td className="py-3 px-4 text-right">0.3</td>
                        <td className="py-3 px-4 text-right">$0.00</td>
                        <td className="py-3 px-4 text-right">$0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Parts Details */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Parts</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Part Number</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Qty</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Unit Price</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="py-3 px-4">OF-12345</td>
                        <td className="py-3 px-4">Oil Filter</td>
                        <td className="py-3 px-4 text-right">1</td>
                        <td className="py-3 px-4 text-right">$12.99</td>
                        <td className="py-3 px-4 text-right">$12.99</td>
                      </tr>
                      <tr className="border-t">
                        <td className="py-3 px-4">AF-67890</td>
                        <td className="py-3 px-4">Air Filter</td>
                        <td className="py-3 px-4 text-right">1</td>
                        <td className="py-3 px-4 text-right">$24.99</td>
                        <td className="py-3 px-4 text-right">$24.99</td>
                      </tr>
                      <tr className="border-t">
                        <td className="py-3 px-4">OIL-5W30</td>
                        <td className="py-3 px-4">Motor Oil 5W-30 (5qt)</td>
                        <td className="py-3 px-4 text-right">1</td>
                        <td className="py-3 px-4 text-right">$28.99</td>
                        <td className="py-3 px-4 text-right">$28.99</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-80">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">{formatVND(paymentSummary?.totalAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">-{formatVND(paymentSummary?.discountAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Amount to Pay:</span>
                      <span>{formatVND(paymentSummary?.amountToPay || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Terms</h4>
                <p className="text-sm text-gray-600">
                  Payment is due within 10 days of invoice date. Late payments may be subject to a 1.5% monthly service charge.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment Preview Modal */}
      {showPaymentPreview && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Cash Payment Preview</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelPaymentPreview}
                disabled={processingPayment || loadingPreview}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            {loadingPreview ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#154c79] mb-4"></div>
                <p className="text-gray-600">Loading payment preview...</p>
              </div>
            ) : paymentPreview ? (
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Customer & Vehicle Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Customer & Vehicle Information</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{paymentPreview.customerName}</p>
                    <p className="text-gray-600">{paymentPreview.vehicleInfo}</p>
                  </div>
                </div>

                {/* Services */}
                {paymentPreview.services && paymentPreview.services.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-3">Services</h4>
                    <div className="space-y-2">
                      {paymentPreview.services.map((service, index) => (
                        <div key={`${service.serviceId}-${index}`} className="flex justify-between text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{service.serviceName}</p>
                            <p className="text-xs text-gray-600">Duration: {service.estimatedDuration}h</p>
                          </div>
                          <span className="font-medium">{formatVND(service.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parts */}
                {paymentPreview.parts && paymentPreview.parts.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-gray-900 mb-3">Parts</h4>
                    <div className="space-y-2">
                      {paymentPreview.parts.map((part) => (
                        <div key={part.partId} className="flex justify-between text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{part.partName}</p>
                            <p className="text-xs text-gray-600">Qty: {part.quantity} × {formatVND(part.unitPrice)}</p>
                          </div>
                          <span className="font-medium">{formatVND(part.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Estimated Amount:</span>
                      <span className="font-medium">{formatVND(paymentPreview.estimatedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Repair Order Cost:</span>
                      <span className="font-medium">{formatVND(paymentPreview.repairOrderCost)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span className="font-medium">-{formatVND(paymentPreview.discountAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-green-300 pt-2 font-bold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-red-600">{formatVND(paymentPreview.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-gray-900">Payment Method: Cash</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    This payment will be processed immediately and marked as paid.
                  </p>
                </div>

                {/* Optional Description */}
                <div>
                  <Label htmlFor="payment-description">Description (Optional)</Label>
                  <Input
                    id="payment-description"
                    value={cashPaymentData.description}
                    onChange={(e) => setCashPaymentData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1"
                    placeholder="e.g., Cash payment for repair services"
                    disabled={processingPayment}
                  />
                </div>

                {paymentPreview.totalAmount <= 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      This repair order has been fully paid. No additional payment is required.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p>No preview data available</p>
              </div>
            )}

            {/* Modal Footer */}
            {!loadingPreview && paymentPreview && (
              <div className="flex justify-end gap-3 p-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelPaymentPreview}
                  disabled={processingPayment}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={processingPayment || paymentPreview.totalAmount <= 0}
                  className="bg-[#154c79] hover:bg-[#123c66] text-white"
                >
                  {processingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Payment ({formatVND(paymentPreview.totalAmount)})
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
