"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Car, FileText, ArrowLeft, ClipboardCheck, ChevronDown, ChevronRight,
  Settings, Package, CheckCircle, Info, Phone, User, Hash, Trash2, Loader, 
  AlertTriangle, Plus, X, Search, ChevronLeft, Image
} from "lucide-react";
import {
  getInspectionById, updateInspection, removePartFromInspection,
  getAllServices, addServiceToInspection, removeServiceFromInspection,
  removePartCategoryFromService
} from "@/services/technician/inspectionTechnicianService";

enum ConditionStatus {
  Good = 0,
  Needs_Attention = 1,
  Replace = 2,
  Not_Checked = 3
}

// Interfaces từ BE
interface PartDto {
  partId: string;
  partName: string;
  unitPrice: number;
}

interface PartCategoryDto {
  partCategoryId: string;
  categoryName: string;
  parts: PartDto[];
}

interface PartInspectionDto {
  partInspectionId: string;
  partId: string;
  partName: string;
  partCategoryId: string;
  categoryName: string;
  quantity: number;
}

interface ServiceInspectionDto {
  serviceInspectionId: string;
  serviceId: string;
  serviceName: string;
  conditionStatus: number;
  categoryName?: string;
  isAdvanced: boolean;
  allPartCategories: PartCategoryDto[];
  suggestedParts: PartInspectionDto[];
}

interface RepairOrderServiceDto {
  serviceId: string;
  serviceName: string;
  categoryName?: string;
  isAdvanced: boolean;
  allPartCategories: PartCategoryDto[];
}

interface VehicleDto {
  vehicleId: string;
  licensePlate: string;
  vin: string;
  brand?: {
    brandId: string;
    brandName: string;
  };
  model?: {
    modelId: string;
    modelName: string;
  };
}

interface CustomerDto {
  customerId: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
}

interface RepairImageDto {
  imageId: string;
  imageUrl: string;
}

interface RepairOrderDto {
  repairOrderId: string;
  vehicle?: VehicleDto;
  customer?: CustomerDto;
  services: RepairOrderServiceDto[];
  repairImages: RepairImageDto[];
}

interface InspectionResponse {
  inspectionId: string;
  repairOrderId: string;
  technicianId: string;
  statusText: string;
  customerConcern?: string;
  finding?: string;
  createdAt: string;
  updatedAt?: string;
  repairOrder?: RepairOrderDto;
  serviceInspections: ServiceInspectionDto[];
  status: number;
}

interface InspectionItem {
  serviceInspectionId?: string;
  serviceId: string;
  serviceName: string;
  categoryName?: string;
  status: "good" | "needs-attention" | "replace" | "not-checked";
  notes: string;
  isAdvanced: boolean;
  allPartCategories: PartCategoryDto[];
  suggestedParts: PartInspectionDto[];
  selectedPartCategories: string[];
  selectedPartsByCategory: { [key: string]: any[] };
}

interface ServiceOption {
  serviceId: string;
  serviceName: string;
  categoryName: string;
  price: number;
  isAdvanced: boolean;
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
  repairImages?: RepairImageDto[];
}

interface AddServiceModalProps {
  isOpen: boolean;
  services: ServiceOption[];
  onClose: () => void;
  onAdd: (selectedServiceIds: string[]) => void;
  loading: boolean;
}

interface SuccessModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

interface ImageModalProps {
  isOpen: boolean;
  images: RepairImageDto[];
  onClose: () => void;
}

interface PartCategorySelectionProps {
  category: PartCategoryDto;
  service: InspectionItem;
  isCompleted: boolean;
  onCategoryToggle: (categoryId: string, selected: boolean) => void;
  onPartToggle: (categoryId: string, partId: string, selected: boolean, quantity?: number) => void;
  onRemoveCategory: (categoryId: string) => void;
  onRemovePart: (categoryId: string, partId: string) => void;
  onQuantityChange: (categoryId: string, partId: string, quantity: number) => void;
}

// Component ImageModal
function ImageModal({ isOpen, images, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !images.length) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Vehicle Images</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative p-4">
          <div className="flex items-center justify-center mb-4">
            <img
              src={images[currentIndex].imageUrl}
              alt={`Vehicle image ${currentIndex + 1}`}
              className="max-h-96 max-w-full object-contain rounded-lg"
            />
          </div>
          
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-center mt-2 text-sm text-gray-600">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Component PartCategorySelection
function PartCategorySelection({
  category,
  service,
  isCompleted,
  onCategoryToggle,
  onPartToggle,
  onRemoveCategory,
  onRemovePart,
  onQuantityChange
}: PartCategorySelectionProps) {
  const [expanded, setExpanded] = useState(false);
  const isCategorySelected = service.selectedPartCategories.includes(category.partCategoryId);
  const selectedPartsInCategory = service.selectedPartsByCategory[category.partCategoryId] || [];

  const getPartQuantity = (partId: string): number => {
    const partWithQuantity = selectedPartsInCategory.find((p: any) => p.partId === partId);
    return partWithQuantity?.quantity || 1;
  };

  const handleQuantityChange = (partId: string, newQuantity: number) => {
    if (newQuantity >= 1 && !isCompleted) { // Chỉ cho phép thay đổi khi chưa completed
      onQuantityChange(category.partCategoryId, partId, newQuantity);
    }
  };

  return (
    <div className={`border rounded-lg transition-all duration-200 ${
      isCategorySelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Cho phép mở rộng để xem ngay cả khi completed, nhưng disable checkbox/radio */}
          {service.isAdvanced ? (
            <input
              type="checkbox"
              checked={isCategorySelected}
              onChange={(e) => !isCompleted && onCategoryToggle(category.partCategoryId, e.target.checked)}
              disabled={isCompleted}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          ) : (
            <input
              type="radio"
              checked={isCategorySelected}
              onChange={(e) => {
                if (e.target.checked && !isCompleted) {
                  onCategoryToggle(category.partCategoryId, true);
                }
              }}
              disabled={isCompleted}
              name={`category-${service.serviceId}`}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-900">{category.categoryName}</span>
              {isCompleted && isCategorySelected && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  Selected
                </span>
              )}
            </div>
            {selectedPartsInCategory.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedPartsInCategory.map((part: any) => {
                  const partData = category.parts.find(p => p.partId === part.partId);
                  return partData ? (
                    <div key={part.partId} className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      <span>{partData.partName} (x{part.quantity})</span>
                      {!isCompleted && ( // Chỉ hiển thị nút xóa khi chưa completed
                        <button
                          onClick={() => onRemovePart(category.partCategoryId, part.partId)}
                          disabled={isCompleted}
                          className="p-0.5 bg-green-200 rounded-full hover:bg-green-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCategorySelected && selectedPartsInCategory.length > 0 && !isCompleted && (
            <button
              onClick={() => onRemoveCategory(category.partCategoryId)}
              disabled={isCompleted}
              className="p-1 bg-red-500 hover:bg-red-600 rounded text-white transition-colors"
              title="Remove entire category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          
          {/* Luôn cho phép mở rộng để xem, ngay cả khi completed */}
          <button
            onClick={() => setExpanded(!expanded)}
            disabled={!isCategorySelected} // Chỉ disable khi category không được chọn
            className="p-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors disabled:opacity-50"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isCategorySelected && expanded && (
        <div className="border-t border-gray-200 p-3 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {category.parts.map((part) => {
              const isSelected = selectedPartsInCategory.some((p: any) => p.partId === part.partId);
              const quantity = getPartQuantity(part.partId);
              
              return (
                <div
                  key={part.partId}
                  className={`p-2 border rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  } ${isCompleted ? 'cursor-default' : 'cursor-pointer hover:border-gray-300'}`}
                  onClick={() => !isCompleted && onPartToggle( // Chỉ cho phép toggle khi chưa completed
                    category.partCategoryId, 
                    part.partId, 
                    !isSelected,
                    quantity
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">{part.partName}</span>
                        {isSelected && isCompleted && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className="font-bold text-green-600">
                          {part.unitPrice.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(part.partId, quantity - 1);
                              }}
                              disabled={quantity <= 1 || isCompleted}
                              className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center disabled:opacity-50"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value);
                                if (!isNaN(newQuantity) && newQuantity >= 1 && !isCompleted) {
                                  handleQuantityChange(part.partId, newQuantity);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              disabled={isCompleted}
                              min="1"
                              className="w-12 text-center border rounded py-1 text-sm"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(part.partId, quantity + 1);
                              }}
                              disabled={isCompleted}
                              className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {isSelected ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// AddServiceModal Component
function AddServiceModal({ isOpen, services, onClose, onAdd, loading }: AddServiceModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const groupedServices = services.reduce((acc, service) => {
    const category = service.categoryName || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, ServiceOption[]>);

  const filteredCategories = Object.entries(groupedServices).reduce((acc, [category, categoryServices]) => {
    const filtered = categoryServices.filter(
      (service) =>
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, ServiceOption[]>);

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAdd = () => {
    if (selectedServices.length > 0) {
      onAdd(selectedServices);
      setSelectedServices([]);
      setSearchTerm("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 ">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full  max-h-full overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Add Services</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services or categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-4">
            {Object.entries(filteredCategories).map(([category, categoryServices]) => (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3">
                  <h3 className="font-bold text-gray-800">{category}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {categoryServices.map((service) => (
                    <div
                      key={service.serviceId}
                      onClick={() => toggleServiceSelection(service.serviceId)}
                      className={`p-4 cursor-pointer transition-all duration-200 ${
                        selectedServices.includes(service.serviceId)
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {service.serviceName}
                            </span>
                            {service.isAdvanced && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                                Advanced
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-green-600">
                            {service.price.toLocaleString("vi-VN")} VND
                          </p>
                        </div>
                        <div className="ml-4">
                          {selectedServices.includes(service.serviceId) ? (
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {selectedServices.length} service(s) selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={selectedServices.length === 0 || loading}
              className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 ${
                selectedServices.length === 0 || loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Services</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// SuccessModal Component
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

// ErrorModal Component
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

// Main Component
export default function CheckConditionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectionId = searchParams.get("id");

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectionStatus, setInspectionStatus] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [availableServices, setAvailableServices] = useState<ServiceOption[]>([]);
  const [addingService, setAddingService] = useState(false);
  const [canAddService, setCanAddService] = useState(false);
  const [expandedPartCategories, setExpandedPartCategories] = useState<Record<string, boolean>>({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [vehicleImages, setVehicleImages] = useState<RepairImageDto[]>([]);

  const statusConfig = {
    good: { color: "bg-green-200 text-green-800 border-green-300", label: "Good" },
    "needs-attention": { color: "bg-yellow-200 text-yellow-800 border-yellow-300", label: "Needs Attention" },
    replace: { color: "bg-red-200 text-red-800 border-red-300", label: "Replace" },
    "not-checked": { color: "bg-gray-400 text-gray-600 border-gray-600", label: "Not Checked" },
  };

  useEffect(() => {
    const loadData = async () => {
      if (!inspectionId) {
        setError("Missing inspection ID");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data: InspectionResponse = await getInspectionById(inspectionId);
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
          color: "N/A",
          customerConcern: data.customerConcern || "",
          repairImages: data.repairOrder?.repairImages || []
        });

        setVehicleImages(data.repairOrder?.repairImages || []);

        const services = data.repairOrder?.services || [];
        const serviceInspections = data.serviceInspections || [];

        const hasRepairOrderServices = services.length > 0;
        setCanAddService(!hasRepairOrderServices);

        let mappedItems: InspectionItem[] = [];

        if (hasRepairOrderServices) {
          mappedItems = services.map((service: RepairOrderServiceDto) => {
            const existingInspection = serviceInspections.find(
              (si: ServiceInspectionDto) => si.serviceId === service.serviceId
            );

            const suggestedParts = existingInspection?.suggestedParts || [];
            const selectedPartsByCategory: { [key: string]: any[] } = {};
            const selectedPartCategories: string[] = [];

            suggestedParts.forEach((part: PartInspectionDto) => {
              if (!selectedPartsByCategory[part.partCategoryId]) {
                selectedPartsByCategory[part.partCategoryId] = [];
                selectedPartCategories.push(part.partCategoryId);
              }
              selectedPartsByCategory[part.partCategoryId].push({
                partId: part.partId,
                quantity: part.quantity || 1
              });
            });

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
              categoryName: service.categoryName || "Uncategorized",
              status,
              notes: "",
              isAdvanced: service.isAdvanced || false,
              allPartCategories: service.allPartCategories || [],
              suggestedParts: suggestedParts,
              selectedPartCategories,
              selectedPartsByCategory
            };
          });
        } else {
          mappedItems = serviceInspections.map((si: ServiceInspectionDto) => {
            const suggestedParts = si.suggestedParts || [];
            const selectedPartsByCategory: { [key: string]: any[] } = {};
            const selectedPartCategories: string[] = [];

            suggestedParts.forEach((part: PartInspectionDto) => {
              if (!selectedPartsByCategory[part.partCategoryId]) {
                selectedPartsByCategory[part.partCategoryId] = [];
                selectedPartCategories.push(part.partCategoryId);
              }
              selectedPartsByCategory[part.partCategoryId].push({
                partId: part.partId,
                quantity: part.quantity || 1
              });
            });

            let status: "good" | "needs-attention" | "replace" | "not-checked" = "not-checked";
            switch (si.conditionStatus) {
              case 0: status = "good"; break;
              case 1: status = "needs-attention"; break;
              case 2: status = "replace"; break;
              default: status = "not-checked";
            }

            return {
              serviceInspectionId: si.serviceInspectionId,
              serviceId: si.serviceId,
              serviceName: si.serviceName || "Unknown Service",
              categoryName: si.categoryName || "Uncategorized",
              status,
              notes: "",
              isAdvanced: si.isAdvanced || false,
              allPartCategories: si.allPartCategories || [],
              suggestedParts: suggestedParts,
              selectedPartCategories,
              selectedPartsByCategory
            };
          });
        }

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

  const loadAvailableServices = async () => {
    try {
      const services: ServiceOption[] = await getAllServices();
      setAvailableServices(services);
    } catch (err) {
      console.error("Error loading services:", err);
      setErrorMessage("Failed to load available services");
      setShowErrorModal(true);
    }
  };

  const handleOpenAddServiceModal = async () => {
    await loadAvailableServices();
    setShowAddServiceModal(true);
  };

  const handleAddServices = async (selectedServiceIds: string[]) => {
    if (!inspectionId) return;

    try {
      setAddingService(true);
      
      for (const serviceId of selectedServiceIds) {
        await addServiceToInspection(inspectionId, serviceId);
      }

      setSuccessMessage("Services added successfully!");
      setShowSuccessModal(true);
      setShowAddServiceModal(false);

      const data: InspectionResponse = await getInspectionById(inspectionId);
      const serviceInspections = data.serviceInspections || [];

      const mappedItems: InspectionItem[] = serviceInspections.map((si: ServiceInspectionDto) => {
        const suggestedParts = si.suggestedParts || [];
        const selectedPartsByCategory: { [key: string]: any[] } = {};
        const selectedPartCategories: string[] = [];

        suggestedParts.forEach((part: PartInspectionDto) => {
          if (!selectedPartsByCategory[part.partCategoryId]) {
            selectedPartsByCategory[part.partCategoryId] = [];
            selectedPartCategories.push(part.partCategoryId);
          }
          selectedPartsByCategory[part.partCategoryId].push({
            partId: part.partId,
            quantity: part.quantity || 1
          });
        });

        let status: "good" | "needs-attention" | "replace" | "not-checked" = "not-checked";
        switch (si.conditionStatus) {
          case 0: status = "good"; break;
          case 1: status = "needs-attention"; break;
          case 2: status = "replace"; break;
          default: status = "not-checked";
        }

        return {
          serviceInspectionId: si.serviceInspectionId,
          serviceId: si.serviceId,
          serviceName: si.serviceName || "Unknown Service",
          categoryName: si.categoryName || "Uncategorized",
          status,
          notes: "",
          isAdvanced: si.isAdvanced || false,
          allPartCategories: si.allPartCategories || [],
          suggestedParts: suggestedParts,
          selectedPartCategories,
          selectedPartsByCategory
        };
      });

      setInspectionItems(mappedItems);
    } catch (err) {
      console.error("Error adding services:", err);
      let errorMsg = "Failed to add services. Please try again.";
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
      setAddingService(false);
    }
  };

  const handleRemoveService = async (serviceInspectionId: string) => {
    if (!inspectionId) return;

    try {
      await removeServiceFromInspection(inspectionId, serviceInspectionId);
      
      setInspectionItems((prev) =>
        prev.filter((item) => item.serviceInspectionId !== serviceInspectionId)
      );

      setSuccessMessage("Service removed successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error removing service:", err);
      let errorMsg = "Failed to remove service. Please try again.";
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
    }
  };

  const updateInspectionItem = (serviceId: string, field: keyof InspectionItem, value: string | PartCategoryDto[] | PartInspectionDto[] | boolean) => {
    setInspectionItems((prev) =>
      prev.map((item) => (item.serviceId === serviceId ? { ...item, [field]: value } : item))
    );
  };

  const handleCategoryToggle = (serviceId: string, categoryId: string, selected: boolean) => {
    setInspectionItems(prev => prev.map(item => {
      if (item.serviceId === serviceId) {
        if (selected) {
          const newSelectedCategories = [...item.selectedPartCategories, categoryId];
          
          const finalSelectedCategories = item.isAdvanced 
            ? newSelectedCategories 
            : [categoryId];
            
          let newSelectedPartsByCategory = { ...item.selectedPartsByCategory };
          if (!item.isAdvanced) {
            newSelectedPartsByCategory = { 
              [categoryId]: newSelectedPartsByCategory[categoryId] || [] 
            };
          } else {
            if (!newSelectedPartsByCategory[categoryId]) {
              newSelectedPartsByCategory[categoryId] = [];
            }
          }
          
          return {
            ...item,
            selectedPartCategories: finalSelectedCategories,
            selectedPartsByCategory: newSelectedPartsByCategory
          };
        } else {
          const newSelectedPartsByCategory = { ...item.selectedPartsByCategory };
          delete newSelectedPartsByCategory[categoryId];
          
          return {
            ...item,
            selectedPartCategories: item.selectedPartCategories.filter(id => id !== categoryId),
            selectedPartsByCategory: newSelectedPartsByCategory
          };
        }
      }
      return item;
    }));
  };

  const handlePartToggle = (serviceId: string, categoryId: string, partId: string, selected: boolean, quantity: number = 1) => {
    setInspectionItems(prev => prev.map(item => {
      if (item.serviceId === serviceId) {
        const currentParts = item.selectedPartsByCategory[categoryId] || [];
        let newParts: any[];
        
        if (selected) {
          newParts = [...currentParts, { partId, quantity }];
        } else {
          newParts = currentParts.filter((p: any) => p.partId !== partId);
        }
        
        return {
          ...item,
          selectedPartsByCategory: {
            ...item.selectedPartsByCategory,
            [categoryId]: newParts
          }
        };
      }
      return item;
    }));
  };

  const handleQuantityChange = (serviceId: string, categoryId: string, partId: string, quantity: number) => {
    setInspectionItems(prev => prev.map(item => {
      if (item.serviceId === serviceId) {
        const updatedParts = item.selectedPartsByCategory[categoryId]?.map((part: any) => 
          part.partId === partId ? { ...part, quantity } : part
        ) || [];
        
        return {
          ...item,
          selectedPartsByCategory: {
            ...item.selectedPartsByCategory,
            [categoryId]: updatedParts
          }
        };
      }
      return item;
    }));
  };

  const handleRemoveCategory = async (serviceId: string, categoryId: string) => {
    const item = inspectionItems.find(i => i.serviceId === serviceId);
    if (!item || !inspectionId || !item.serviceInspectionId) return;

    try {
      await removePartCategoryFromService(inspectionId, item.serviceInspectionId, categoryId);
      
      setInspectionItems(prev => prev.map(prevItem => {
        if (prevItem.serviceId === serviceId) {
          const newSelectedPartsByCategory = { ...prevItem.selectedPartsByCategory };
          delete newSelectedPartsByCategory[categoryId];
          
          return {
            ...prevItem,
            selectedPartCategories: prevItem.selectedPartCategories.filter(id => id !== categoryId),
            selectedPartsByCategory: newSelectedPartsByCategory
          };
        }
        return prevItem;
      }));

      setSuccessMessage("Part category removed successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error removing part category:", err);
      setErrorMessage("Failed to remove part category");
      setShowErrorModal(true);
    }
  };

  const handleRemovePart = async (serviceId: string, categoryId: string, partId: string) => {
    const item = inspectionItems.find(i => i.serviceId === serviceId);
    if (!item || !inspectionId) return;

    const partInspection = item.suggestedParts?.find(
      p => p.partId === partId && p.partCategoryId === categoryId
    );

    if (partInspection?.partInspectionId) {
      try {
        await removePartFromInspection(inspectionId, serviceId, partInspection.partInspectionId);
      } catch (err) {
        console.error("Failed to remove part:", err);
        setErrorMessage("Unable to remove part. Please try again.");
        setShowErrorModal(true);
        return;
      }
    }

    setInspectionItems(prev => prev.map(prevItem => {
      if (prevItem.serviceId === serviceId) {
        const currentParts = prevItem.selectedPartsByCategory[categoryId] || [];
        const newParts = currentParts.filter((p: any) => p.partId !== partId);
        
        return {
          ...prevItem,
          selectedPartsByCategory: {
            ...prevItem.selectedPartsByCategory,
            [categoryId]: newParts
          }
        };
      }
      return prevItem;
    }));
  };

  const togglePartCategoriesExpanded = (serviceId: string) => {
    setExpandedPartCategories(prev => ({ 
      ...prev, 
      [serviceId]: !prev[serviceId] 
    }));
  };

  const handleSaveInspection = async () => {
    if (!inspectionId) return;

    try {
      setSaving(true);

      const serviceUpdates = inspectionItems.map((item) => ({
        ServiceId: item.serviceId,
        ConditionStatus: 
          item.status === "good" ? ConditionStatus.Good :
          item.status === "needs-attention" ? ConditionStatus.Needs_Attention :
          item.status === "replace" ? ConditionStatus.Replace :
          ConditionStatus.Not_Checked,
        SelectedPartCategoryIds: item.selectedPartCategories,
        SuggestedPartsByCategory: Object.entries(item.selectedPartsByCategory).reduce((acc, [categoryId, parts]) => {
          acc[categoryId] = parts.map((part: any) => ({
            partId: part.partId,
            quantity: part.quantity || 1
          }));
          return acc;
        }, {} as { [key: string]: any[] })
      }));

      const hasAnyChange = serviceUpdates.some(su => 
        su.ConditionStatus !== ConditionStatus.Not_Checked || 
        su.SelectedPartCategoryIds.length > 0
      );
      const hasNotes = generalNotes.trim().length > 0;

      if (!hasAnyChange && !hasNotes) {
        setErrorMessage("Please update at least one service or add inspection notes before saving.");
        setShowErrorModal(true);
        setSaving(false);
        return;
      }

      const hasCriticalStatus = inspectionItems.some(
        (item) => item.status === "replace" || item.status === "needs-attention"
      );

      if (hasCriticalStatus && !hasNotes) {
        setErrorMessage("Please fill in the General Inspection Finding when any service needs attention or replacement.");
        setShowErrorModal(true);
        setSaving(false);
        return;
      }

      const request = {
        Finding: generalNotes.trim() || "",
        ServiceUpdates: serviceUpdates,
        IsCompleted: true,
      };

      await updateInspection(inspectionId, request);
      setSuccessMessage("Inspection completed and sent to Manager!");
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

  const isSaveValid = () => {
    const hasAnyChange =
      inspectionItems.some(
        (item) =>
          item.status !== "not-checked" || item.selectedPartCategories.length > 0
      ) || generalNotes.trim().length > 0;

    if (!hasAnyChange) return false;

    const hasCriticalStatus = inspectionItems.some(
      (item) => item.status === "replace" || item.status === "needs-attention"
    );

    const hasNotes = generalNotes.trim().length > 0;

    if (hasCriticalStatus && !hasNotes) return false;

    return true;
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
  };

  const renderImageButton = () => {
    if (vehicleImages.length === 0) return null;
    
    return (
      <button
        onClick={() => setShowImageModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg"
      >
        <Image className="w-5 h-5" />
        <span>View Images ({vehicleImages.length})</span>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="bg-[url('/images/image9.png')] bg-cover bg-no-repeat h-full p-4 rounded-lg shadow-md ">
        <div className="flex items-center justify-center min-h-[640px]">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Loading inspection data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[url('/images/image9.png')] bg-cover bg-no-repeat h-full p-4 rounded-lg shadow-md">
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
      </div>
    );
  }

  return (
    <div className="bg-[url('/images/image9.png')] bg-cover bg-no-repeat h-full p-4 rounded-lg shadow-md max-h-[86vh] overflow-y-auto rounded-xl">
      <div className="flex items-center justify-between mb-2 gap-4 flex-nowrap">
        <div className="relative inline-block mb-3 flex-shrink-0">
          <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
          <div className="relative flex items-center gap-2 px-4 py-2">
            <button
              onClick={() => router.back()}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 mr-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg flex-shrink-0">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <h2 className="text-[24px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic truncate max-w-[300px]">
                {vehicleInfo?.vehicle || "Vehicle Inspection"}
              </h2>
              <p className="text-sm text-gray-600 truncate">Status: {inspectionStatus}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">         
          {canAddService && !isCompleted && (
            <button
              onClick={handleOpenAddServiceModal}
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Add Services</span>
            </button>
          )}

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
            
            {vehicleImages.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-2 border border-purple-200/50">
                <div className="flex justify-center mt-2">
                  <button
                    onClick={() => {
                      setShowImageModal(true);
                      setShowVehicleDetails(false);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg"
                  >
                    <Image className="w-4 h-4" />
                    <span>View Images ({vehicleImages.length})</span>
                  </button>
                </div>
              </div>
            )}
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
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="space-y-3 bg-white/70 px-8 py-4 rounded-xl">
          {Object.entries(
            inspectionItems.reduce((acc, item) => {
              const category = item.categoryName || "Uncategorized";
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(item);
              return acc;
            }, {} as Record<string, InspectionItem[]>)
          ).map(([categoryName, services]) => (
            <div key={categoryName} className="rounded-xl shadow-lg border border-gray-200 overflow-hidden bg-gradient-to-r from-purple-100 to-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-400/70 px-6 py-3">
                <h3 className="text-xl font-bold text-white">{categoryName}</h3>        
              </div>

              <div className="divide-y divide-gray-300">
                {services.map((item) => (
                  <div key={item.serviceId} className="px-10 py-4 bg-white/50">
                    <div className="border-2 border-gray-200 rounded-lg px-5 py-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-gray-900">{item.serviceName}</h4>
                          {item.isAdvanced && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                              Advanced
                            </span>
                          )}
                          {canAddService && !isCompleted && item.serviceInspectionId && (
                            <button
                              onClick={() => handleRemoveService(item.serviceInspectionId!)}
                              className="p-1 bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                              title="Remove Service"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
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

{((item.status === "replace" || item.status === "needs-attention") || 
  (isCompleted && item.selectedPartCategories.length > 0)) && 
  item.allPartCategories.length > 0 && (
  <div className="mt-3 mb-2 bg-white rounded-lg border border-red-200">
    <button
      onClick={() => togglePartCategoriesExpanded(item.serviceId)}     
      disabled={item.allPartCategories.length === 0}
      className="w-full p-2 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-b border-red-200 rounded-t-lg transition-all duration-200 flex items-center justify-between disabled:opacity-50 "
    >
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-red-600" />
        <span className="font-medium text-red-700">
          Part Categories Suggestions
          {item.selectedPartCategories.length > 0 && 
            ` (${item.selectedPartCategories.length} categories selected)`}
          {isCompleted && item.selectedPartCategories.length > 0 }
        </span>
      </div>
      {expandedPartCategories[item.serviceId] ? (
        <ChevronDown className="w-4 h-4 text-red-600" />
      ) : (
        <ChevronRight className="w-4 h-4 text-red-600" />
      )}
    </button>

    {expandedPartCategories[item.serviceId] && (
      <div className="p-4 space-y-4">
        {item.allPartCategories.map((category) => (
          <PartCategorySelection
            key={category.partCategoryId}
            category={category}
            service={item}
            isCompleted={isCompleted}
            onCategoryToggle={(categoryId, selected) => 
              !isCompleted && handleCategoryToggle(item.serviceId, categoryId, selected)
            }
            onPartToggle={(categoryId, partId, selected) => 
              !isCompleted && handlePartToggle(item.serviceId, categoryId, partId, selected)
            }
            onRemoveCategory={(categoryId) => 
              !isCompleted && handleRemoveCategory(item.serviceId, categoryId)
            }
            onRemovePart={(categoryId, partId) => 
              !isCompleted && handleRemovePart(item.serviceId, categoryId, partId)
            }
            onQuantityChange={(categoryId, partId, quantity) => 
              !isCompleted && handleQuantityChange(item.serviceId, categoryId, partId, quantity)
            }
          />
        ))}
      </div>
    )}
  </div>
)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-white/90 rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900">General Inspection Finding  <span className="text-red-500">*</span></h3>
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
              <button
                onClick={handleSaveInspection}
                disabled={saving || !isSaveValid()}
                className={`px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 ${
                  saving || !isSaveValid() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                <span>{saving ? "Completing..." : "Complete Inspection"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <AddServiceModal
        isOpen={showAddServiceModal}
        services={availableServices}
        onClose={() => setShowAddServiceModal(false)}
        onAdd={handleAddServices}
        loading={addingService}
      />

      <ImageModal 
        isOpen={showImageModal}
        images={vehicleImages}
        onClose={() => setShowImageModal(false)}
      />

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