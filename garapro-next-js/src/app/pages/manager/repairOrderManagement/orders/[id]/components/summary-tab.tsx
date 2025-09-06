"use client"

import { Copy, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SummaryTabProps {
  orderId: string
}

export default function SummaryTab({ orderId }: SummaryTabProps) {
  return (
    <div className="space-y-6">
      {/* Vehicle Issues Section */}
      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex space-x-6">
            <button className="text-sm font-medium text-gray-900 border-b-2 pb-2" style={{ borderColor: "#154c79" }}>
              VEHICLE ISSUES
            </button>
            <button className="text-sm font-medium text-gray-500 pb-2">DECLINED JOBS</button>
            <button className="text-sm font-medium text-gray-500 pb-2">JOB HISTORY</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Concerns */}
          <div>
            <div className="flex items-center justify-between mb-4">
                             <h3 className="text-sm font-medium text-gray-700">Customer Concerns - RO #{orderId}</h3>
              <span className="text-sm text-gray-500">Finding</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+</span>
                </div>
                <span className="text-sm font-medium">ADD CONCERN</span>
              </div>
              <div className="flex items-center space-x-2">
                <Copy className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">COPY TO ESTIMATE (0)</span>
              </div>
            </div>
          </div>

          {/* Technician Concerns */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Technician Concerns</h3>
              <span className="text-sm text-gray-500">Finding</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+</span>
                </div>
                <span className="text-sm font-medium">ADD CONCERN</span>
              </div>
              <div className="flex items-center space-x-2">
                <Copy className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">COPY TO ESTIMATE (0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center space-x-4 p-6 border-t bg-gray-50">
          <Button 
            className="text-white px-6" 
            style={{ backgroundColor: "#154c79" }} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#123a5c"} 
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#154c79"}
          >
            <span className="mr-2">+</span>
            BUILD ESTIMATE
          </Button>
          <Button variant="outline" className="relative bg-transparent">
            <Settings className="w-4 h-4 mr-2" />
            PARTS HUB
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">4</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
