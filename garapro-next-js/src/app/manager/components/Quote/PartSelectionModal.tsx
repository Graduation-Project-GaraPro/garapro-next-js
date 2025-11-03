// src/app/manager/components/Quote/PartSelectionModal.tsx
"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Part } from "@/services/service-catalog"

// Removed PartWithRecommendation interface since we're removing recommended functionality
// export interface PartWithRecommendation extends Part {
//   recommended: boolean
// }

interface PartSelectionModalProps {
  serviceName: string
  parts: Part[]
  isAdvancedService?: boolean // Add this prop
  onSelect: (part: Part) => void
  // Removed onToggleRecommendation since we're removing recommended functionality
  onClose: () => void
}

export function PartSelectionModal({ serviceName, parts, isAdvancedService = true, onSelect, onClose }: PartSelectionModalProps) {
  // Prevent closing parent dialog when clicking on modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSelect = (part: Part) => {
    onSelect(part);
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
        className="w-full max-w-md p-6" 
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

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {parts.map((part) => (
            <div
              key={part.partId}
              className="w-full text-left p-3 border border-border rounded hover:bg-muted transition-colors flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{part.name}</span>
                  <span className="text-sm font-semibold text-primary">${part.price.toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Stock: {part.stock}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
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
          ))}
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