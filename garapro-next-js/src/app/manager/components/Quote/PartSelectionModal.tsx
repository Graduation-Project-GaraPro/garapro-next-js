// src/app/manager/components/Quote/PartSelectionModal.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus, Minus } from "lucide-react"
import { Part } from "@/services/service-catalog"

// Enhanced part interface with quantity
export interface PartWithQuantity extends Part {
  quantity: number
}

interface PartSelectionModalProps {
  serviceName: string
  parts: { partId: string; name: string; price: number; stock?: number; stockQuantity?: number }[]
  isAdvancedService?: boolean
  onSelect: (part: PartWithQuantity) => void
  onClose: () => void
}

export function PartSelectionModal({ serviceName, parts, isAdvancedService = true, onSelect, onClose }: PartSelectionModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // Prevent closing parent dialog when clicking on modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getQuantity = (partId: string) => quantities[partId] || 1

  const setQuantity = (partId: string, quantity: number) => {
    const part = parts.find(p => p.partId === partId)
    if (!part) return
    
    // Get stock quantity from either stock or stockQuantity property
    const stockQuantity = part.stock || part.stockQuantity || 0
    
    // Ensure quantity is within valid range
    const validQuantity = Math.max(1, Math.min(quantity, stockQuantity))
    setQuantities(prev => ({ ...prev, [partId]: validQuantity }))
  }

  const incrementQuantity = (partId: string) => {
    const currentQuantity = getQuantity(partId)
    const part = parts.find(p => p.partId === partId)
    const stockQuantity = part?.stock || part?.stockQuantity || 0
    if (part && currentQuantity < stockQuantity) {
      setQuantity(partId, currentQuantity + 1)
    }
  }

  const decrementQuantity = (partId: string) => {
    const currentQuantity = getQuantity(partId)
    if (currentQuantity > 1) {
      setQuantity(partId, currentQuantity - 1)
    }
  }

  const handleQuantityInputChange = (partId: string, value: string) => {
    const numValue = parseInt(value) || 1
    setQuantity(partId, numValue)
  }

  const handleSelect = (part: { partId: string; name: string; price: number; stock?: number; stockQuantity?: number }) => {
    const quantity = getQuantity(part.partId)
    const stockQuantity = part.stock || part.stockQuantity || 0
    const partWithQuantity: PartWithQuantity = {
      partId: part.partId,
      name: part.name,
      price: part.price,
      stock: stockQuantity, // Normalize to stock property
      quantity: quantity
    }
    onSelect(partWithQuantity);
  };

  // Prevent closing when clicking on backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };



  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
      style={{ zIndex: 1000 }}
      onClick={handleBackdropClick}
    >
      <Card 
        className="w-full max-w-lg p-6" 
        onClick={handleModalClick}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Parts for {serviceName}</h3>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Show inline message for simple services */}
        {!isAdvancedService && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-3">
            <p className="text-xs text-yellow-800">
              This is a simple service. You can only select one part.
            </p>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {parts.map((part) => {
            const currentQuantity = getQuantity(part.partId);
            const stockQuantity = part.stock || part.stockQuantity || 0;
            const isAtMaxStock = currentQuantity >= stockQuantity;
            const isAtMinQuantity = currentQuantity <= 1;
            
            return (
            <div
              key={part.partId}
              className="w-full text-left p-4 border border-border rounded hover:bg-muted transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{part.name}</span>
                    <span className="text-sm font-semibold text-primary">${part.price.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Stock: {stockQuantity} available
                  </div>
                </div>
              </div>



              {/* Quantity Selection */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        decrementQuantity(part.partId);
                      }}
                      disabled={isAtMinQuantity}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={stockQuantity}
                      value={currentQuantity}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleQuantityInputChange(part.partId, e.target.value);
                      }}
                      className="w-16 h-8 text-center"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();

                        incrementQuantity(part.partId);
                      }}
                      disabled={isAtMaxStock}

                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Total:</div>
                    <div className="text-sm font-semibold">
                      ${(part.price * currentQuantity).toLocaleString()}
                    </div>

                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(part);
                    }}
                    size="sm"
                    type="button"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )})}
        </div>

        <Button 
          variant="outline" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-full mt-4 bg-transparent"
          type="button"
        >
          Close
        </Button>
      </Card>
    </div>
  )
}