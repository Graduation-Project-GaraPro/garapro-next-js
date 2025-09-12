"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, DollarSign, MoreHorizontal, FileDown, FolderOpen, Share2, X, Download, Printer, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PaymentTabProps {
  orderId: string
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
}

interface Transaction {
  id: string
  date: string
  name: string
  amount: number
  paymentMethod: string
  paymentInfo: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "cash",
    name: "Cash Payment",
    icon: <DollarSign className="w-8 h-8" />
  },
  {
    id: "credit",
    name: "Credit or Debit",
    icon: <CreditCard className="w-8 h-8" />
  },

  {
    id: "other",
    name: "Other",
    icon: <MoreHorizontal className="w-8 h-8" />
  }
]

// Sample transaction data
const completedTransactions: Transaction[] = [
  {
    id: "1",
    date: "August 27, 2021",
    name: "Frank Stan",
    amount: 100.00,
    paymentMethod: "Cash",
    paymentInfo: "Cash"
  }
]

export default function PaymentTab({ orderId }: PaymentTabProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [showInvoice, setShowInvoice] = useState<boolean>(false)
  const [showCashPayment, setShowCashPayment] = useState<boolean>(false)
  const [cashPaymentData, setCashPaymentData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: "Quan",
    amount: "",
    paidInFull: false
  })

  // Sample repair order data
  const totalLabor = 177.50
  const totalParts = 176.43
  const totalFees = 33.08
  const discounts = 33.93
  const subtotal = totalLabor + totalParts + totalFees - discounts
  const taxes = 16.67
  const grandTotal = subtotal + taxes
  const paidToDate = 100.00
  const balanceDue = grandTotal - paidToDate

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

  const handleCashPayment = () => {
    setShowCashPayment(true)
  }

  const handleCashPaymentSubmit = () => {
    // TODO: Process cash payment
    console.log("Process cash payment:", cashPaymentData)
    setShowCashPayment(false)
    // Reset form
    setCashPaymentData({
      date: new Date().toISOString().split('T')[0],
      customerName: "Quan",
      amount: "",
      paidInFull: false
    })
  }

  const handleCashPaymentCancel = () => {
    setShowCashPayment(false)
    setCashPaymentData({
      date: new Date().toISOString().split('T')[0],
      customerName: "Quan",
      amount: "",
      paidInFull: false
    })
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
            <div className="grid grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedPaymentMethod === method.id
                      ? "border-[#154c79] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedPaymentMethod(method.id)
                    if (method.id === "cash") {
                      handleCashPayment()
                    }
                  }}
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
          </CardContent>
        </Card>

        {/* Completed Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {completedTransactions.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Name</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Amount</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Payment Method</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Payment Info</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b">
                          <td className="py-3 text-sm">{transaction.date}</td>
                          <td className="py-3 text-sm font-medium">{transaction.name}</td>
                          <td className="py-3 text-sm">${transaction.amount.toFixed(2)} Payment</td>
                          <td className="py-3 text-sm">{transaction.paymentMethod}</td>
                          <td className="py-3 text-sm">{transaction.paymentInfo}</td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  RO #{orderId}: Quan 2011 Honda Element EX posted to A/R on Aug 27, 2021
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No completed transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Repair Order Summary */}
      <div className="w-96">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Repair Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* View Invoice Button */}
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowInvoice(true)}
            >
              <FileDown className="w-4 h-4 mr-2" />
              VIEW & SHARE INVOICE
            </Button>

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Labor:</span>
                <span className="text-sm font-medium">${totalLabor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Parts:</span>
                <span className="text-sm font-medium">${totalParts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Fees:</span>
                <span className="text-sm font-medium">${totalFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-600">Discounts:</span>
                <span className="text-sm font-medium text-red-600">-${discounts.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Subtotal:</span>
                <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Taxes:</span>
                <span className="text-sm font-medium">${taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Grand Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm">Paid To Date:</span>
                <span className="text-sm font-medium">${paidToDate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold">BALANCE DUE:</span>
                <span className="text-sm font-bold text-red-600">${balanceDue.toFixed(2)}</span>
              </div>
            </div>

            {/* Unpost Button */}
            <Button variant="outline" className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white">
              <FolderOpen className="w-4 h-4 mr-2" />
              UNPOST REPAIR ORDER
            </Button>
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
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (8.5%):</span>
                      <span className="font-medium">${taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Paid:</span>
                      <span>${paidToDate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-red-600 border-t pt-2">
                      <span>Balance Due:</span>
                      <span>${balanceDue.toFixed(2)}</span>
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

      {/* Cash Payment Modal */}
      {showCashPayment && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Cash Payment</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCashPaymentCancel}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Payment Date */}
              <div>
                <Label htmlFor="payment-date">Date of Payment</Label>
                <Input
                  id="payment-date"
                  type="date"
                  value={cashPaymentData.date}
                  onChange={(e) => setCashPaymentData(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Customer Name */}
              <div>
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input
                  id="customer-name"
                  value={cashPaymentData.customerName}
                  onChange={(e) => setCashPaymentData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter customer name"
                />
              </div>

              {/* Payment Amount */}
              <div>
                <Label htmlFor="payment-amount">Amount</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  value={cashPaymentData.amount}
                  onChange={(e) => setCashPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  className="mt-1"
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Balance Due: ${balanceDue.toFixed(2)}
                </p>
              </div>

              {/* Paid in Full Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="paid-in-full"
                  checked={cashPaymentData.paidInFull}
                  onChange={(e) => {
                    setCashPaymentData(prev => ({ 
                      ...prev, 
                      paidInFull: e.target.checked,
                      amount: e.target.checked ? balanceDue.toFixed(2) : prev.amount
                    }))
                  }}
                  className="w-4 h-4 text-[#154c79] border-gray-300 rounded focus:ring-[#154c79]"
                />
                <Label htmlFor="paid-in-full" className="text-sm font-medium">
                  Customer paid in full
                </Label>
              </div>

              {/* Payment Summary */}
              {cashPaymentData.amount && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Amount Received:</span>
                      <span>${parseFloat(cashPaymentData.amount || "0").toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Balance Due:</span>
                      <span>${balanceDue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Change Due:</span>
                      <span className={parseFloat(cashPaymentData.amount || "0") - balanceDue >= 0 ? "text-green-600" : "text-red-600"}>
                        ${(parseFloat(cashPaymentData.amount || "0") - balanceDue).toFixed(2)}
                        {parseFloat(cashPaymentData.amount || "0") - balanceDue < 0 && " (Insufficient)"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={handleCashPaymentCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCashPaymentSubmit}
                disabled={!cashPaymentData.amount || parseFloat(cashPaymentData.amount) <= 0}
                className="bg-[#154c79] hover:bg-[#123c66] text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Process Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
