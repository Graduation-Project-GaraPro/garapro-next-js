"use client";

import { useState } from "react";
import {
  Car,
  FileText,
  Save,
  ArrowLeft,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Settings,
  Package,
  CheckCircle, Info, AlertTriangle, Phone, User, Hash
} from "lucide-react";

// Define spare part type
interface SparePart {
  id: number;
  name: string;
  code: string;
  price: number;
  availability: "in-stock" | "order-required" | "discontinued";
}

// Define inspection item type
interface InspectionItem {
  id: number;
  category: string;
  item: string;
  status: "good" | "needs-attention" | "replace" | "not-checked";
  notes: string;
  selectedSpareParts?: number[]; // Array of spare part IDs
}

// Define vehicle info type (you can get this from props or API)
interface VehicleInfo {
  id: number;
  vehicle: string;
  licensePlate: string;
  owner: string;
  phone: string;
  issue: string;
  description: string;
}

export default function CheckConditionPage() {
  // Sample vehicle info - in real app, you'd get this from props or API
  const vehicleInfo: VehicleInfo = {
    id: 1,
    vehicle: "Toyota Camry 2020",
    licensePlate: "30A-12345",
    owner: "Nguyễn Văn An",
    phone: "0901234567",
    issue: "Engine Check",
    description:"Xe đi hay tắt máy đột ngột, lốp xe bị mòn, vỡ kính chắn gió, cần thay dầu nhớt. Xe đi hay tắt máy đột ngột, lốp xe bị mòn, vỡ kính chắn gió, cần thay dầu nhớt"
  };

  // Spare parts database - organized by inspection item
  const sparePartsDatabase: Record<string, SparePart[]> = {
    "Engine Oil Level": [
      { id: 1, name: "Synthetic Motor Oil 5W-30", code: "EO-5W30-4L", price: 45000, availability: "in-stock" },
      { id: 2, name: "Conventional Motor Oil 10W-40", code: "EO-10W40-4L", price: 35000, availability: "in-stock" },
      { id: 3, name: "Oil Filter", code: "OF-TOY-CAM20", price: 25000, availability: "in-stock" }
    ],
    "Air Filter": [
      { id: 4, name: "Engine Air Filter", code: "AF-TOY-CAM20", price: 18000, availability: "in-stock" },
      { id: 5, name: "Cabin Air Filter", code: "CAF-TOY-CAM20", price: 22000, availability: "order-required" }
    ],
    "Spark Plugs": [
      { id: 6, name: "Iridium Spark Plugs (Set of 4)", code: "SP-IRD-TOY20", price: 120000, availability: "in-stock" },
      { id: 7, name: "Platinum Spark Plugs (Set of 4)", code: "SP-PLT-TOY20", price: 85000, availability: "in-stock" }
    ],
    "Brake Pads": [
      { id: 8, name: "Front Brake Pads", code: "BP-FRT-TOY-CAM", price: 95000, availability: "in-stock" },
      { id: 9, name: "Rear Brake Pads", code: "BP-REA-TOY-CAM", price: 75000, availability: "in-stock" }
    ],
    "Brake Fluid": [
      { id: 10, name: "DOT 4 Brake Fluid (1L)", code: "BF-DOT4-1L", price: 28000, availability: "in-stock" }
    ],
    "Tire Tread Depth": [
      { id: 11, name: "All-Season Tire 215/60R16", code: "TR-AS-215-60-16", price: 180000, availability: "order-required" },
      { id: 12, name: "Summer Tire 215/60R16", code: "TR-SM-215-60-16", price: 165000, availability: "in-stock" }
    ],
    "Battery": [
      { id: 13, name: "Car Battery 12V 70Ah", code: "BT-12V-70AH", price: 250000, availability: "in-stock" },
      { id: 14, name: "Premium Car Battery 12V 70Ah", code: "BT-PRM-12V-70AH", price: 320000, availability: "in-stock" }
    ],
    "Lights": [
      { id: 15, name: "LED Headlight Bulbs (Pair)", code: "LB-LED-H7", price: 85000, availability: "in-stock" },
      { id: 16, name: "Halogen Headlight Bulbs (Pair)", code: "LB-HAL-H7", price: 35000, availability: "in-stock" }
    ]
  };

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { id: 1, category: "Engine", item: "Engine Oil Level", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 2, category: "Engine", item: "Coolant Level", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 3, category: "Engine", item: "Air Filter", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 4, category: "Engine", item: "Spark Plugs", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 5, category: "Brakes", item: "Brake Pads", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 6, category: "Brakes", item: "Brake Fluid", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 7, category: "Brakes", item: "Brake Lines", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 8, category: "Suspension", item: "Shock Absorbers", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 9, category: "Suspension", item: "Ball Joints", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 10, category: "Tires", item: "Tire Pressure", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 11, category: "Tires", item: "Tire Tread Depth", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 12, category: "Electrical", item: "Battery", status: "not-checked", notes: "", selectedSpareParts: [] },
    { id: 13, category: "Electrical", item: "Lights", status: "not-checked", notes: "", selectedSpareParts: [] }
  ]);

  const [generalNotes, setGeneralNotes] = useState("");
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [expandedSpareParts, setExpandedSpareParts] = useState<Record<number, boolean>>({});

  const statusConfig = {
    "good": { color: "bg-green-200 text-green-800 border-green-300", label: "Good" },
    "needs-attention": { color: "bg-yellow-200 text-yellow-800 border-yellow-300", label: "Needs Attention" },
    "replace": { color: "bg-red-200 text-red-800 border-red-300", label: "Replace" },
    "not-checked": { color: "bg-gray-400 text-gray-600 border-gray-600", label: "Not Checked" }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "in-stock":
        return "text-green-600 bg-green-100";
      case "order-required":
        return "text-amber-600 bg-amber-100";
      case "discontinued":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case "in-stock":
        return "In Stock";
      case "order-required":
        return "Order Required";
      case "discontinued":
        return "Discontinued";
      default:
        return "Unknown";
    }
  };

  const updateInspectionItem = (id: number, field: keyof InspectionItem, value: string | number[]) => {
    setInspectionItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const toggleSparePartSelection = (itemId: number, sparePartId: number) => {
  setInspectionItems(prev =>
    prev.map(item => {
      if (item.id === itemId) {
        const currentSelection = item.selectedSpareParts || [];
        const isSelected = currentSelection.includes(sparePartId);
        const newSelection = isSelected ? [] : [sparePartId];
        return { ...item, selectedSpareParts: newSelection };
      }
      return item;
    })
  );

  // Nếu chọn thì đóng dropdown lại
  setExpandedSpareParts(prev => ({
    ...prev,
    [itemId]: false
  }));
};


  const toggleSparePartsExpanded = (itemId: number) => {
    setExpandedSpareParts(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getSelectedSparePartName = (item: InspectionItem) => {
    if (!item.selectedSpareParts || item.selectedSpareParts.length === 0) return null;
    const selectedId = item.selectedSpareParts[0];
    const spareParts = sparePartsDatabase[item.item] || [];
    const selectedPart = spareParts.find(part => part.id === selectedId);
    return selectedPart?.name || null;
  };

  const groupedItems = inspectionItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InspectionItem[]>);

  const handleSaveInspection = () => {
    // Here you would save the inspection data
    console.log("Saving inspection data:", { vehicleInfo, inspectionItems, generalNotes });
    alert("Inspection report saved successfully!");
  };

  return (
    <div className="bg-[url('/images/image9.png')] bg-cover bg-no-repeat h-[640px] p-4 rounded-lg shadow-md ">
       <div className="flex items-center justify-between mb-2 gap-4">
      <div className="relative inline-block mb-3">
            <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
            <div className="relative flex items-center gap-2 px-4 py-2">
              <button
                onClick={() => window.history.back()}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 mr-2"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
             <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[24px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                  {vehicleInfo.vehicle}
                </h2>
              </div>
            </div>
          </div>

           {/* Vehicle details dropdown */}
              <div className="relative w-190 px-10">
                <button
                  onClick={() => setShowVehicleDetails(!showVehicleDetails)}
                  className="w-full p-4 bg-gradient-to-r from-gray-200 to-blue-400/60 hover:from-gray-100/60 hover:to-blue-100/60 border-2 border-gray-200 hover:border-blue-300/60 rounded-xl transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-700">Vehicle Information</span>
                  </div>
                  {showVehicleDetails ? 
                    <ChevronDown className="w-5 h-5 text-gray-600" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  }
                </button>

                {showVehicleDetails && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-10 overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="px-4 py-4">
                      {/* Header with gradient */}
                      <div className="text-center mb-2">
                        <div className="flex items-center gap-2 justify-center">
  <h3 className="text-[16px] font-bold text-gray-800">Vehicle Details</h3>
</div>

                        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            {/* Vehicle Model Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-2 border border-blue-200/50">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="px-2 py-1 bg-blue-100 rounded-lg">
                                  <Car className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-blue-700">Vehicle Model</span>
                              </div>
                              <p className="text-gray-800 font-bold text-sx px-11">{vehicleInfo?.vehicle}</p>
                            </div>
                            
                            {/* Customer Name Card */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-2 border border-purple-200/50">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="px-2 py-1 bg-purple-100 rounded-lg">
                                  <User className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-purple-700">Customer Name</span>
                              </div>
                              <p className="text-gray-800 font-bold text-sx px-11">{vehicleInfo?.owner}</p>
                            </div>
                            
                            {/* Phone Card */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-2 border border-orange-200/50 mb-2">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="px-2 py-1 bg-orange-100 rounded-lg">
                                  <Phone className="w-4 h-4 text-orange-600" />
                                </div>
                                <span className="text-sm font-medium text-orange-700">Phone Number</span>
                              </div>
                              <p className="text-gray-800 font-bold text-sx px-11">{vehicleInfo?.phone}</p>                   
                            </div>
                          </div>
                          <div className="space-y-3">
                            {/* License Plate Card */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-2 border border-green-200/50">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="px-2 py-1 bg-green-100 rounded-lg">
                                  <Hash className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-green-700">License Plate</span>
                              </div>
                              <p className="text-gray-800 font-bold text-sx px-11">{vehicleInfo?.licensePlate}</p>
                            </div>

                            {/* Issues Card */}
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-2 border border-yellow-200/50 mb-6">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="px-2 py-1 bg-yellow-100 rounded-lg">
                                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                </div>
                                <span className="text-sm font-semibold text-yellow-700">Reported Issues</span>
                              </div>
                              <p className="text-gray-800 font-bold text-sx px-11">{vehicleInfo?.issue}</p>
                            </div>                
                          </div>
                        </div>

                        {/* Description Card */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-1 border border-slate-200/50 mb-2">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-slate-100 rounded-lg">
                              <Info className="w-5 h-5 text-slate-600" />
                            </div>
                            <span className="text-[18px] font-semibold text-slate-700">Vehicle Condition Description</span>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-base">
                              {vehicleInfo.description}
                            </p>
                          </div>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-center">
                          <button
                            onClick={() => setShowVehicleDetails(false)}
                            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
                          >
                            Close Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>   
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="mb-1">         
        </div>
        {/* Inspection Checklist */}
        <div className="space-y-3 max-h-[73vh] overflow-y-auto rounded-xl rounded-scroll rounded-xl bg-white/70 px-8 py-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className=" rounded-xl shadow-lg border border-gray-200 overflow-hidden bg-gradient-to-r from-purple-100 to-blue-100 ">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-400/70 px-6 py-2 ">
                <h3 className="text-xl font-bold text-white">{category}</h3>
              </div>
              <div className="px-10 py-2 border-2 border-gray-300">
                <div className="space-y-2 ">
                  {items.map((item) => (
                   <div key={item.id} className="border-2 border-gray-200 rounded-lg px-5 py-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{item.item}</h4>
                      <div className="flex space-x-2">
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <button
                            key={status}
                            onClick={() => updateInspectionItem(item.id, "status", status)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all duration-200 ${
                              item.status === status
                                ? config.color
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {config.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Spare Parts Suggestions - Positioned between item name and status buttons */}
                    {item.status === "replace" && sparePartsDatabase[item.item] && (
                      <div className="mt-3 mb-2 bg-white rounded-lg border border-red-200">
                        <button
                          onClick={() => toggleSparePartsExpanded(item.id)}
                          className="w-full p-2 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-b border-red-200 rounded-t-lg transition-all duration-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-700">
                              {getSelectedSparePartName(item) || "Spare Parts Suggestions"}
                            </span>
                            {item.selectedSpareParts && item.selectedSpareParts.length > 0 && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          {expandedSpareParts[item.id] ? 
                            <ChevronDown className="w-4 h-4 text-red-600" /> : 
                            <ChevronRight className="w-4 h-4 text-red-600" />
                          }
                        </button>

                        {expandedSpareParts[item.id] && (
                          <div className="p-4 space-y-3">
                            {sparePartsDatabase[item.item].map((sparePart) => (
                              <div 
                                key={sparePart.id} 
                                className={`p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                                  item.selectedSpareParts?.includes(sparePart.id) 
                                    ? "border-red-300 bg-red-50" 
                                    : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                                }`}
                                onClick={() => toggleSparePartSelection(item.id, sparePart.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Package className="w-4 h-4 text-gray-600" />
                                      <span className="font-semibold text-gray-900">{sparePart.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Code: {sparePart.code}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                      <span className="font-bold text-green-600">
                                        {sparePart.price.toLocaleString('vi-VN')} VND
                                      </span>
                                      <span className={`text-xs px-2 py-1 rounded-full ${getAvailabilityColor(sparePart.availability)}`}>
                                        {getAvailabilityLabel(sparePart.availability)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="relative">
                                      {item.selectedSpareParts?.includes(sparePart.id) ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                      ) : (
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* General Notes Section */}
          <div className="bg-white/90 rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900">General Inspection Notes</h3>
            </div>
            <textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Add general notes about the vehicle condition..."
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={9}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pb-4">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveInspection}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Save Inspection Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}