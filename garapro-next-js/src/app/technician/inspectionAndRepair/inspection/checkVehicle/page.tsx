"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Car, FileText, ArrowLeft, ClipboardCheck, ChevronDown, ChevronRight,
  Settings, Package, CheckCircle, Info, Phone, User, Hash, Trash2, Loader, AlertTriangle
} from "lucide-react";
import {
  getInspectionById, updateInspection, removePartFromInspection
} from "@/services/technician/inspectionTechnicianService";

enum ConditionStatus {
  Good = 0,
  Needs_Attention = 1,
  Replace = 2,
  Not_Checked = 3
}

interface SparePart {
  partId: string;
  partName: string;
  partInspectionId?: string;
  price?: number;
}

interface InspectionItem {
  serviceInspectionId?: string;
  serviceId: string;
  serviceName: string;
  status: "good" | "needs-attention" | "replace" | "not-checked";
  notes: string;
  selectedSpareParts: SparePart[];
  availableParts: SparePart[];
  isAdvanced: boolean;
}

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

function SuccessModal({ isOpen, message, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

function ErrorModal({ isOpen, message, onClose }: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Error!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface VehicleInfo {
  vehicle: string;
  licensePlate: string;
  vin: string;
  owner: string;
  phone: string;
  email: string;
  brand: string;
  model: string;
  color: string;
  customerConcern?: string;
}

export default function CheckConditionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectionId = searchParams.get("id");

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [expandedSpareParts, setExpandedSpareParts] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectionStatus, setInspectionStatus] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!inspectionId) {
        setError("Missing inspection ID");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await getInspectionById(inspectionId);
        const vehicle = data.repairOrder?.vehicle;
        const customer = data.repairOrder?.customer;

        setVehicleInfo({
          vehicle: `${vehicle?.brand?.brandName || ""} ${vehicle?.model?.modelName || ""}`.trim(),
          licensePlate: vehicle?.licensePlate || "N/A",
          vin: vehicle?.vin || "N/A",
          owner: customer?.fullName || "Unknown",
          phone: customer?.phoneNumber || "N/A",
          email: customer?.email || "N/A",
          brand: vehicle?.brand?.brandName || "N/A",
          model: vehicle?.model?.modelName || "N/A",
          color: vehicle?.color?.colorName || "N/A",
          customerConcern: data.customerConcern || "",
        });

        const services = data.repairOrder?.services || [];
        const serviceInspections = data.serviceInspections || [];

        interface ServiceType {
          serviceId: string;
          serviceName?: string;
          isAdvanced?: boolean;
          notes?: string;
          allServiceParts?: Array<{
            partId: string;
            partName?: string;
            unitPrice?: number;
            quantity?: number;
          }>;
        }

        interface ServiceInspectionType {
          serviceId: string;
          serviceInspectionId?: string;
          conditionStatus?: number;
          suggestedParts?: Array<{
            partId: string;
            partName?: string;
            partInspectionId?: string;
            price?: number;
            quantity?: number;
          }>;
        }

        interface SuggestedPartType {
          partId: string;
          partName?: string;
          partInspectionId?: string;
          price?: number;
          quantity?: number;
        }

        interface PartType {
          partId: string;
          partName?: string;
          unitPrice?: number;
          quantity?: number;
        }

        const mappedItems: InspectionItem[] = services.map((service: ServiceType) => {
          const existingInspection = serviceInspections.find(
            (si: ServiceInspectionType) => si.serviceId === service.serviceId
          );

          const availableParts: SparePart[] = (service.allServiceParts || []).map((part: PartType) => ({
            partId: part.partId,
            partName: part.partName || "Unknown Part",
            price: part.unitPrice || 0,
            quantity: part.quantity || 1,
          }));

          const selectedParts: SparePart[] = (existingInspection?.suggestedParts || []).map(
            (part: SuggestedPartType) => ({
              partId: part.partId,
              partName: part.partName || "Unknown Part",
              partInspectionId: part.partInspectionId,
              price: part.price || 0,
              quantity: part.quantity || 1,
            })
          );

          let status: "good" | "needs-attention" | "replace" | "not-checked" = "not-checked";
          if (existingInspection) {
            switch (existingInspection.conditionStatus) {
              case 0: status = "good"; break;
              case 1: status = "needs-attention"; break;
              case 2: status = "replace"; break;
              default: status = "not-checked";
            }
          }

          return {
            serviceInspectionId: existingInspection?.serviceInspectionId,
            serviceId: service.serviceId,
            serviceName: service.serviceName || "Unknown Service",
            status,
            notes: service.notes || "",
            selectedSpareParts: selectedParts,
            availableParts,
            isAdvanced: service.isAdvanced || false,
          };
        });

        setInspectionItems(mappedItems);
        setGeneralNotes(data.finding || "");
        setInspectionStatus(data.statusText || "");
        
        const completed = data.statusText === "Completed" || data.status === 3;
        setIsCompleted(completed);
      
      } catch (err) {
        console.error("Error fetching inspection:", err);
        setError("Failed to load inspection data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [inspectionId]);

  const statusConfig = {
    good: { color: "bg-green-200 text-green-800 border-green-300", label: "Good" },
    "needs-attention": { color: "bg-yellow-200 text-yellow-800 border-yellow-300", label: "Needs Attention" },
    replace: { color: "bg-red-200 text-red-800 border-red-300", label: "Replace" },
    "not-checked": { color: "bg-gray-400 text-gray-600 border-gray-600", label: "Not Checked" },
  };

  const updateInspectionItem = (serviceId: string, field: keyof InspectionItem, value: string | SparePart[] | boolean) => {
    setInspectionItems((prev) =>
      prev.map((item) => (item.serviceId === serviceId ? { ...item, [field]: value } : item))
    );
  };

  const toggleSparePartSelection = (serviceId: string, sparePartId: string) => {
    setInspectionItems((prev) =>
      prev.map((item) => {
        if (item.serviceId === serviceId) {
          const currentSelection = item.selectedSpareParts;
          const isMultiSelect = item.isAdvanced;
          let newSelection: SparePart[];

          const partToAdd = item.availableParts.find((p) => p.partId === sparePartId);
          if (!partToAdd) return item;

          const partWithQuantity: SparePart = {
            ...partToAdd,
            price: partToAdd.price || 0,
          };

          if (isMultiSelect) {
            const exists = currentSelection.find((p) => p.partId === sparePartId);
            if (exists) {
              newSelection = currentSelection.filter((p) => p.partId !== sparePartId);
            } else {
              newSelection = [...currentSelection, partWithQuantity];
            }
          } else {
            const exists = currentSelection.find((p) => p.partId === sparePartId);
            newSelection = exists ? [] : [partWithQuantity];
          }

          return { ...item, selectedSpareParts: newSelection };
        }
        return item;
      })
    );

    const item = inspectionItems.find((i) => i.serviceId === serviceId);
    if (item && !item.isAdvanced) {
      setExpandedSpareParts((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const clearSparePartSelection = async (serviceId: string, partId?: string, partInspectionId?: string) => {
    if (partInspectionId && inspectionId) {
      try {
        await removePartFromInspection(inspectionId, serviceId, partInspectionId);
      } catch (err) {
        console.error("Failed to remove part:", err);
        setErrorMessage("Unable to remove spare part. Please try again.");
        setShowErrorModal(true);
        return;
      }
    }

    setInspectionItems((prev) =>
      prev.map((item) => {
        if (item.serviceId === serviceId) {
          if (partId) {
            return { ...item, selectedSpareParts: item.selectedSpareParts.filter((p) => p.partId !== partId) };
          } else {
            return { ...item, selectedSpareParts: [] };
          }
        }
        return item;
      })
    );
  };

  const toggleSparePartsExpanded = (serviceId: string) => {
    setExpandedSpareParts((prev) => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  const getSelectedSparePartTags = (item: InspectionItem) => {
    if (!item.selectedSpareParts || item.selectedSpareParts.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {item.selectedSpareParts.map((part) => (
          <div key={part.partId} className="flex items-center gap-2 bg-red-100 text-red-700 px-2 py-1 rounded-lg text-sm font-medium border border-red-300">
            <Package className="w-4 h-4 text-red-600" />
            <span>{part.partName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSparePartSelection(item.serviceId, part.partId, part.partInspectionId);
              }}
              className="p-1 bg-red-200 rounded-full hover:bg-red-300 transition-colors duration-200"
            >
              <Trash2 className="w-3 h-3 text-red-700" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const handleSaveInspection = async () => {
  if (!inspectionId) return;

  try {
    setSaving(true);

    // 🔹 Tạo danh sách service cập nhật
    const serviceUpdates = inspectionItems
      .filter((item) => {
        const hasStatusChange = item.status !== "not-checked";
        const hasPartsSelected = item.selectedSpareParts.length > 0;
        return hasStatusChange || hasPartsSelected;
      })
      .map((item) => ({
        ServiceId: item.serviceId,
        ConditionStatus:
          item.status === "good"
            ? ConditionStatus.Good
            : item.status === "needs-attention"
            ? ConditionStatus.Needs_Attention
            : item.status === "replace"
            ? ConditionStatus.Replace
            : ConditionStatus.Not_Checked,
        SuggestedPartIds:
          item.selectedSpareParts.length > 0
            ? item.selectedSpareParts.map((p) => p.partId)
            : [],
      }));

    // Kiểm tra điều kiện trước khi hoàn tất inspection
    const invalidItem = inspectionItems.find(
      (item) =>
        (item.status === "replace" || item.status === "needs-attention") &&
        (item.selectedSpareParts.length === 0 || !generalNotes.trim())
    );

    if (invalidItem) {
      setErrorMessage(
        "Please select at least one part and fill in the finding before completing the inspection."
      );
      setShowErrorModal(true);
      setSaving(false);
      return; //Dừng lại, không gọi API
    }

    //Kiểm tra nếu chưa có gì thay đổi
    if (serviceUpdates.length === 0 && !generalNotes.trim()) {
      setErrorMessage(
        "Please update at least one service or add inspection notes before saving."
      );
      setShowErrorModal(true);
      setSaving(false);
      return;
    }

    // Chuẩn bị dữ liệu gửi lên API
    const request = {
      Finding: generalNotes.trim() || "",
      ServiceUpdates: serviceUpdates,
      IsCompleted: true,
    };

    console.log("Update request:", JSON.stringify(request, null, 2));

    await updateInspection(inspectionId, request);

    setSuccessMessage("Inspection completed and sent to Manager for review!");
    setShowSuccessModal(true);
  } catch (err) {
    console.error("Error saving inspection:", err);

    let errorMsg = "Failed to save inspection. Please try again.";

    if (err && typeof err === "object") {
      const error = err as {
        response?: { data?: { Message?: string; message?: string } };
        message?: string;
      };
      errorMsg =
        error.response?.data?.Message ||
        error.response?.data?.message ||
        error.message ||
        errorMsg;
    }

    setErrorMessage(errorMsg);
    setShowErrorModal(true);
  } finally {
    setSaving(false);
  }
};


  const handleModalClose = () => {
    setShowSuccessModal(false);
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-slate-100 to-indigo-200">
  //       <div className="bg-white rounded-2xl p-8 shadow-lg">
  //         <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
  //         <p className="text-gray-700 font-medium">Loading inspection data...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-slate-100 to-indigo-200">
  //       <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
  //         <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
  //         <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
  //         <p className="text-gray-700">{error}</p>
  //         <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  //           Go Back
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-[url('/images/image9.png')] bg-cover bg-no-repeat h-[640px] p-4 rounded-lg shadow-md">
      {loading && (
  <div className="flex items-center justify-center min-h-[640px]">
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-700 font-medium">Loading inspection data...</p>
    </div>
  </div>
)}

{error && (
  <div className="flex items-center justify-center min-h-[640px]">
    <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
      <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
      <p className="text-gray-700">{error}</p>
      <button
        onClick={() => router.back()}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Go Back
      </button>
    </div>
  </div>
)}

      <div className="flex items-center justify-between mb-2 gap-4">
        <div className="relative inline-block mb-3">
          <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
          <div className="relative flex items-center gap-2 px-4 py-2">
            <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 mr-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-[24px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                {vehicleInfo?.vehicle || "Vehicle Inspection"}
              </h2>
              <p className="text-sm text-gray-600">Status: {inspectionStatus}</p>
            </div>
          </div>
        </div>

        <div className="relative w-190 px-10">
          <button
            onClick={() => setShowVehicleDetails(!showVehicleDetails)}
            className="w-full p-4 bg-gradient-to-r from-gray-200 to-blue-400/60 hover:from-gray-100/60 hover:to-blue-100/60 border-2 border-gray-200 hover:border-blue-300/60 rounded-xl transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-700">Vehicle Information</span>
            </div>
            {showVehicleDetails ? <ChevronDown className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
          </button>

          {showVehicleDetails && vehicleInfo && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-10 overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="px-4 py-4">
                <div className="text-center mb-2">
                  <h3 className="text-[16px] font-bold text-gray-800">Vehicle Details</h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-2 border border-blue-200/50">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="px-2 py-1 bg-blue-100 rounded-lg"><Car className="w-4 h-4 text-blue-600" /></div>
                          <span className="text-sm font-medium text-blue-700">Vehicle Model</span>
                        </div>
                        <p className="text-gray-800 font-bold text-sx px-11">{vehicleInfo.vehicle}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-2 border border-purple-200/50">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="px-2 py-1 bg-purple-100 rounded-lg"><User className="w-4 h-4 text-purple-600" /></div>
                          <span className="text-sm font-medium text-purple-700">Customer Name</span>
                        </div>
                        <p className="text-gray-800 font-bold text-sx px-11">{vehicleInfo.owner}</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-2 border border-orange-200/50">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="px-2 py-1 bg-orange-100 rounded-lg"><Phone className="w-4 h-4 text-orange-600" /></div>
                          <span className="text-sm font-medium text-orange-700">Phone Number</span>
                        </div>
                        <p className="text-gray-800 font-bold text-sx px-11">{vehicleInfo.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-2 border border-green-200/50">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="px-2 py-1 bg-green-100 rounded-lg"><Hash className="w-4 h-4 text-green-600" /></div>
                          <span className="text-sm font-medium text-green-700">License Plate</span>
                        </div>
                        <p className="text-gray-800 font-bold text-sx px-11">{vehicleInfo.licensePlate}</p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-2 border border-yellow-200/50">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="px-2 py-1 bg-yellow-100 rounded-lg"><Info className="w-5 h-5 text-yellow-600" /></div>
                          <span className="text-sm font-semibold text-yellow-700">VIN</span>
                        </div>
                        <p className="text-gray-800 font-bold text-sx px-11">{vehicleInfo.vin}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-2 border border-slate-200/50 mt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="px-2 py-1 bg-slate-100 rounded-lg">
                        <Info className="w-5 h-5 text-slate-600" />
                      </div>
                      <span className="text-[18px] font-semibold text-slate-700">Customer Concern</span>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <p className="text-gray-700 leading-relaxed text-base">
                        {vehicleInfo.customerConcern || "No concerns reported"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-4">
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
        <div className="space-y-3 max-h-[73vh] overflow-y-auto rounded-xl bg-white/70 px-8 py-4">
          {inspectionItems.map((item) => (
            <div key={item.serviceId} className="rounded-xl shadow-lg border border-gray-200 overflow-hidden bg-gradient-to-r from-purple-100 to-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-400/70 px-6 py-2">
                <h3 className="text-xl font-bold text-white">{item.serviceName}</h3>
              </div>
              <div className="px-10 py-2 border-2 border-gray-300">
                <div className="border-2 border-gray-200 rounded-lg px-5 py-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{item.serviceName}</h4>
                    <div className="flex space-x-2">
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <button
                          key={status}
                          onClick={() => updateInspectionItem(item.serviceId, "status", status)}
                          disabled={isCompleted}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border transition-all duration-200 ${
                            item.status === status ? config.color : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                          } ${isCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(item.status === "replace" || item.status === "needs-attention") && item.availableParts.length > 0 && (
                    <div className="mt-3 mb-2 bg-white rounded-lg border border-red-200">
                      <button
                        onClick={() => toggleSparePartsExpanded(item.serviceId)}
                        disabled={isCompleted}
                        className="w-full p-2 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-b border-red-200 rounded-t-lg transition-all duration-200 flex items-center justify-between disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-700">
                            {getSelectedSparePartTags(item) || "Spare Parts Suggestions"}
                          </span>
                          {item.selectedSpareParts.length > 0 && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedSpareParts[item.serviceId] ? <ChevronDown className="w-4 h-4 text-red-600" /> : <ChevronRight className="w-4 h-4 text-red-600" />}
                        </div>
                      </button>

                      {expandedSpareParts[item.serviceId] && (
                        <div className="p-4 space-y-3">
                          {item.availableParts.map((sparePart) => (
                            <div
                              key={sparePart.partId}
                              className={`p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                                item.selectedSpareParts.find((p) => p.partId === sparePart.partId)
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                              } ${isCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
                              onClick={() =>
                                !isCompleted && toggleSparePartSelection(item.serviceId, sparePart.partId)
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray-600" />
                                    <span className="font-semibold text-gray-900">{sparePart.partName}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="font-bold text-green-600">
                                      {(sparePart.price || 0).toLocaleString("vi-VN")} VND
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4 flex items-center gap-2">
                                  {item.selectedSpareParts.find((p) => p.partId === sparePart.partId) ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <div className={`w-5 h-5 border-2 border-gray-300 ${item.isAdvanced ? "rounded-sm" : "rounded-full"}`}></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white/90 rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900">General Inspection Finding</h3>
            </div>
            <textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Add general notes about the vehicle condition..."
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={5}
              disabled={isCompleted}
            />
          </div>

          <div className="flex justify-end space-x-4 pb-4">
            <button onClick={() => router.back()} className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200">
              Cancel
            </button>
            {!isCompleted && (
              <>
                {/* <button
                  onClick={() => handleSaveInspection(false)}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>{saving ? "Saving..." : "Save Progress"}</span>
                </button> */}
                <button
                  onClick={handleSaveInspection}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  <span>{saving ? "Completing..." : "Complete Inspection"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <SuccessModal 
        isOpen={showSuccessModal} 
        message={successMessage} 
        onClose={handleModalClose} 
      />
      
      <ErrorModal 
        isOpen={showErrorModal} 
        message={errorMessage} 
        onClose={() => setShowErrorModal(false)} 
      />
    </div>
  );
}