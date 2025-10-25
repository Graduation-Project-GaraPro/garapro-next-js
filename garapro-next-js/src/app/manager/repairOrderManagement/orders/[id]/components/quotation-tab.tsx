"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Printer, 
  Mail, 
  Copy, 
  Eye, 
  Edit3, 
  MoreHorizontal, 
  Download,
  Send
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface QuotationTabProps {
  orderId: string
}

interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Quotation {
  id: string
  title: string
  date: string
  validUntil: string
  status: "draft" | "sent" | "accepted" | "expired"
  items: QuotationItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
}

const initialQuotation: Quotation = {
  id: "QT-001",
  title: "Vehicle Repair Quotation",
  date: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: "draft",
  items: [
    {
      id: "1",
      description: "Engine Diagnostic",
      quantity: 1,
      unitPrice: 85.00,
      totalPrice: 85.00
    },
    {
      id: "2",
      description: "Oil Change",
      quantity: 1,
      unitPrice: 45.00,
      totalPrice: 45.00
    }
  ],
  subtotal: 130.00,
  tax: 13.00,
  total: 143.00,
  notes: "This quotation includes labor and parts. Valid for 30 days."
}

export default function QuotationTab({ orderId }: QuotationTabProps) {
  const [quotation, setQuotation] = useState<Quotation>(initialQuotation)
  const [isEditing, setIsEditing] = useState(false)
  const [editedQuotation, setEditedQuotation] = useState<Quotation>(initialQuotation)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleEdit = () => {
    setEditedQuotation({...quotation})
    setIsEditing(true)
  }

  const handleSave = () => {
    setQuotation({...editedQuotation})
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedQuotation({...quotation})
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof Quotation, value: string) => {
    setEditedQuotation(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleItemChange = (id: string, field: keyof QuotationItem, value: string | number) => {
    setEditedQuotation(prev => {
      const updatedItems = prev.items.map(item => 
        item.id === id 
          ? { 
              ...item, 
              [field]: value,
              ...(field === 'quantity' || field === 'unitPrice' 
                ? { totalPrice: field === 'quantity' 
                    ? Number(value) * item.unitPrice 
                    : item.quantity * Number(value) 
                  } 
                : {})
            } 
          : item
      )
      
      // Calculate new totals
      const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
      const tax = subtotal * 0.1
      const total = subtotal + tax
      
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        tax,
        total
      }
    })
  }

  const addNewItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }
    setEditedQuotation(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (id: string) => {
    setEditedQuotation(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
      subtotal: prev.items.reduce((sum, item) => 
        item.id !== id ? sum + item.totalPrice : sum, 0)
    }))
  }

  const getStatusBadge = (status: Quotation["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "sent":
        return <Badge className="bg-blue-500">Sent</Badge>
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="secondary">Draft</Badge>
    }
  }

  // Calculate totals whenever items change
  // ... existing code ...

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotation</h1>
          <p className="text-gray-600">Manage and send quotations for repair orders</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Quotation
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quotation Details */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Quotation Details</CardTitle>
            {getStatusBadge(quotation.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Quotation Title</Label>
                  <Input
                    id="title"
                    value={editedQuotation.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editedQuotation.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={editedQuotation.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                  />
                </div>
              </div>

              {/* Quotation Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Quotation Items</h3>
                  <Button onClick={addNewItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Qty</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Unit Price</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Total</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedQuotation.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-3 px-4">
                            <Input
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              placeholder="Item description"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                              className="text-right"
                              min="1"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                              className="text-right"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            ${item.totalPrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-4 space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${editedQuotation.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>${editedQuotation.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${editedQuotation.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editedQuotation.notes || ""}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes for the quotation"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Quotation Title</h3>
                  <p className="text-gray-900">{quotation.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-gray-900">{quotation.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Valid Until</h3>
                  <p className="text-gray-900">{quotation.validUntil}</p>
                </div>
              </div>

              {/* Quotation Items */}
              <div>
                <h3 className="text-lg font-medium mb-4">Quotation Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Qty</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Unit Price</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotation.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-3 px-4">{item.description}</td>
                          <td className="py-3 px-4 text-right">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-medium">${item.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-4 space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${quotation.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>${quotation.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${quotation.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {quotation.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{quotation.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Send Quotation
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Mail className="w-4 h-4 mr-2" />
              Send via Email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Printer className="w-4 h-4 mr-2" />
              Print Quotation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline">
          <Copy className="w-4 h-4 mr-2" />
          Copy to Estimate
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotation Preview</DialogTitle>
          </DialogHeader>
          <div className="p-6 bg-white">
            {/* Company Header */}
            <div className="border-b pb-6 mb-6">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">GaragePro Auto Services</h1>
                  <p className="text-gray-600">123 Auto Repair Street, City, State 12345</p>
                  <p className="text-gray-600">Phone: (123) 456-7890 | Email: info@garagepro.com</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">QUOTATION</h2>
                  <p className="text-gray-600">#{quotation.id}</p>
                </div>
              </div>
            </div>

            {/* Customer and Quotation Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                <p className="text-gray-600">Justine Anderson</p>
                <p className="text-gray-600">2017 Honda CR-V EX</p>
                <p className="text-gray-600">VIN: 1HGBH41JXMN109186</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Quotation Details:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-gray-600">Date:</p>
                  <p className="text-gray-900">{quotation.date}</p>
                  <p className="text-gray-600">Valid Until:</p>
                  <p className="text-gray-900">{quotation.validUntil}</p>
                  <p className="text-gray-600">RO Number:</p>
                  <p className="text-gray-900">#{orderId}</p>
                </div>
              </div>
            </div>

            {/* Quotation Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Qty</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Unit Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-medium">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="ml-auto max-w-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${quotation.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>${quotation.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${quotation.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quotation.notes && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
              <p>Thank you for your business! This quotation is valid for 30 days.</p>
              <p className="mt-1">Please contact us with any questions regarding this quotation.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}