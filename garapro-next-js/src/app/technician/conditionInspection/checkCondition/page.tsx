"use client";

import { useState } from "react";
import {
//   CheckCircle,
//   AlertTriangle,
//   X,
  Car,
//   Calendar,
//   User,
//   Phone,
  FileText,
//   Camera,
  Save,
  ArrowLeft,
  ClipboardCheck,
  ChevronDown,
  ChevronRight
} from "lucide-react";

// Define inspection item type
interface InspectionItem {
  id: number;
  category: string;
  item: string;
  status: "good" | "needs-attention" | "replace" | "not-checked";
  notes: string;
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

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { id: 1, category: "Engine", item: "Engine Oil Level", status: "not-checked", notes: "" },
    { id: 2, category: "Engine", item: "Coolant Level", status: "not-checked", notes: "" },
    { id: 3, category: "Engine", item: "Air Filter", status: "not-checked", notes: "" },
    { id: 4, category: "Engine", item: "Spark Plugs", status: "not-checked", notes: "" },
    { id: 5, category: "Brakes", item: "Brake Pads", status: "not-checked", notes: "" },
    { id: 6, category: "Brakes", item: "Brake Fluid", status: "not-checked", notes: "" },
    { id: 7, category: "Brakes", item: "Brake Lines", status: "not-checked", notes: "" },
    { id: 8, category: "Suspension", item: "Shock Absorbers", status: "not-checked", notes: "" },
    { id: 9, category: "Suspension", item: "Ball Joints", status: "not-checked", notes: "" },
    { id: 10, category: "Tires", item: "Tire Pressure", status: "not-checked", notes: "" },
    { id: 11, category: "Tires", item: "Tire Tread Depth", status: "not-checked", notes: "" },
    { id: 12, category: "Electrical", item: "Battery", status: "not-checked", notes: "" },
    { id: 13, category: "Electrical", item: "Lights", status: "not-checked", notes: "" }
  ]);

  const [generalNotes, setGeneralNotes] = useState("");
   const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const statusConfig = {
    "good": { color: "bg-green-200 text-green-800 border-green-300", label: "Good" },
    "needs-attention": { color: "bg-yellow-200 text-yellow-800 border-yellow-300", label: "Needs Attention" },
    "replace": { color: "bg-red-200 text-red-800 border-red-300", label: "Replace" },
    "not-checked": { color: "bg-gray-400 text-gray-600 border-gray-600", label: "Not Checked" }
  };

  const updateInspectionItem = (id: number, field: keyof InspectionItem, value: string) => {
    setInspectionItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
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
    <div className="bg-[url('/images/image9.png')] bg-cover bg-no-repeat h-[641px] p-4 rounded-lg shadow-md ">
      <div className="relative inline-block mb-3">
            <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
            <div className="relative flex items-center gap-2 px-4 py-2">
              <button
                onClick={() => window.history.back()}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 mr-2"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                <ClipboardCheck className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[29px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                  Vehicle Inspection
                </h2>
                <p className="text-gray-700 italic">Comprehensive vehicle condition check</p>
              </div>
            </div>
          </div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          

          {/* Vehicle details dropdown */}
              <div className="relative">
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
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-10 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Vehicle Model</p>
                            <p className="text-gray-800 font-semibold">{vehicleInfo?.vehicle}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Customer Name</p>
                            <p className="text-gray-800 font-semibold">{vehicleInfo?.owner}</p>
                          </div>
                           <div>
                            <p className="text-sm font-medium text-gray-600">Phone</p>
                            <p className="text-gray-800 font-semibold">{vehicleInfo?.phone}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-600">License Plate</p>
                            <p className="text-gray-800 font-semibold">{vehicleInfo?.licensePlate}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Issues</p>
                            <p className="text-gray-800 font-semibold">{vehicleInfo?.vehicle}</p>
                          </div>
                         
                        </div>
                        
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                        <h6 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-gray-600" />
                        Describe Vehicle Condition
                        </h6>
                        <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                          {vehicleInfo.description}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowVehicleDetails(false)}
                        className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                      >
                        Close Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
        </div>

        {/* Inspection Checklist */}
        <div className="space-y-3 max-h-[59vh] overflow-y-auto rounded-xl rounded-scroll rounded-xl bg-white/70">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className=" rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-400/70 px-6 py-2 ">
                <h3 className="text-xl font-bold text-white">{category}</h3>
              </div>
              <div className="px-10 py-2 border-2 border-gray-300">
                <div className="space-y-2 ">
                  {items.map((item) => (
                   <div key={item.id} className="border-2 border-gray-200 rounded-lg px-5 py-3 bg-gray-50">
                    <div className="flex items-center justify-between">
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