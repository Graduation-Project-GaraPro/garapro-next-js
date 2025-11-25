"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaCar, FaSearch, FaChevronDown, FaChevronUp, 
  FaRuler, FaCog, FaRoad, FaShieldAlt, FaTachometerAlt,
  FaWrench, FaEye, FaTimes, FaSpinner, FaExclamationTriangle
} from "react-icons/fa";
import { IconType } from "react-icons";
import { getAllSpecifications, VehicleSpecificationDto } from "@/services/technician/specificationService";

interface VehicleSection {
  id: string;
  title: string;
  icon: IconType;
  color: string;
  iconBg: string;
  data: Record<string, string>;
}

interface Vehicle {
  id: string;
  name: string;
  make: string;
  sections: VehicleSection[];
}

// Icon mapping for categories
const getCategoryIcon = (categoryName: string): IconType => {
  const lowerCategory = categoryName.toLowerCase();
  if (lowerCategory.includes("dimension") || lowerCategory.includes("weight")) return FaRuler;
  if (lowerCategory.includes("engine")) return FaCog;
  if (lowerCategory.includes("drivetrain") || lowerCategory.includes("transmission")) return FaRoad;
  if (lowerCategory.includes("chassis") || lowerCategory.includes("suspension")) return FaWrench;
  if (lowerCategory.includes("performance")) return FaTachometerAlt;
  if (lowerCategory.includes("wheel") || lowerCategory.includes("tire")) return FaRoad;
  if (lowerCategory.includes("exterior") || lowerCategory.includes("interior")) return FaEye;
  if (lowerCategory.includes("safety")) return FaShieldAlt;
  return FaCog;
};

// Color mapping for categories
const getCategoryColor = (index: number): { color: string; iconBg: string } => {
  const colors = [
    { color: "bg-blue-50 border-blue-200", iconBg: "bg-blue-600" },
    { color: "bg-orange-50 border-orange-200", iconBg: "bg-orange-600" },
    { color: "bg-green-50 border-green-200", iconBg: "bg-green-600" },
    { color: "bg-purple-50 border-purple-200", iconBg: "bg-purple-600" },
    { color: "bg-red-50 border-red-200", iconBg: "bg-red-600" },
    { color: "bg-gray-50 border-gray-200", iconBg: "bg-gray-600" },
    { color: "bg-indigo-50 border-indigo-200", iconBg: "bg-indigo-600" },
    { color: "bg-emerald-50 border-emerald-200", iconBg: "bg-emerald-600" },
  ];
  return colors[index % colors.length];
};

export default function VehicleInformation() {
  const router = useRouter();
  const [vehicleSearch, setVehicleSearch] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [vehicleData, setVehicleData] = useState<Vehicle[]>([]);

  useEffect(() => {
    fetchSpecifications();
  }, []);

  const fetchSpecifications = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowErrorModal(false);

      const data = await getAllSpecifications();
      
      // Transform API data to UI format
      const transformedData: Vehicle[] = data.map((vehicle: VehicleSpecificationDto) => ({
        id: vehicle.lookupID,
        name: vehicle.nameCar,
        make: vehicle.automaker,
        sections: vehicle.categories.map((category, index) => {
          const colorScheme = getCategoryColor(index);
          const sectionData: Record<string, string> = {};
          
          category.fields.forEach(field => {
            sectionData[field.label] = field.value;
          });

          return {
            id: category.category.toLowerCase().replace(/\s+/g, '-'),
            title: `${index + 1}. ${category.category}`,
            icon: getCategoryIcon(category.category),
            color: colorScheme.color,
            iconBg: colorScheme.iconBg,
            data: sectionData
          };
        })
      }));

      setVehicleData(transformedData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading vehicle specifications';
      setError(errorMessage);
      setShowErrorModal(true);
      
      if (errorMessage.includes("authentication") || errorMessage.includes("token")) {
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle dropdown
  const toggleSection = (vehicleId: string, sectionId: string): void => {
    const key = `${vehicleId}-${sectionId}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Open modal with vehicle details
  const openVehicleModal = (vehicle: Vehicle): void => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
    setExpandedSections({});
  };

  // Close modal
  const closeModal = (): void => {
    setShowModal(false);
    setSelectedVehicle(null);
    setExpandedSections({});
  };

  // Search vehicles
  const getFilteredVehicles = (): Vehicle[] => {
    if (!vehicleSearch.trim()) return vehicleData;
    const searchTerm = vehicleSearch.toLowerCase().trim();
    return vehicleData.filter(vehicle => 
      vehicle.name.toLowerCase().includes(searchTerm) ||
      vehicle.make.toLowerCase().includes(searchTerm) ||
      `${vehicle.make} ${vehicle.name}`.toLowerCase().includes(searchTerm)
    );
  };

  const filteredVehicles = getFilteredVehicles();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-200">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading vehicle specifications...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Error Modal */}
      {showErrorModal && error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Error</h3>
              </div>
              <button
                onClick={() => setShowErrorModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">{error}</p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  fetchSpecifications();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-col h-full bg-gradient-to-br from-blue-400 via-white to-indigo-400 rounded-xl">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
            <div className="relative flex items-center gap-2 px-4 py-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <FaCar className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[28px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                  Vehicle Information Lookup
                </h2>
                <p className="text-gray-700 italic">Find detailed information about the car</p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 py-6 mb-3 border border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter vehicle name or brand to search..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-100"
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
              />
            </div>
            
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Found {filteredVehicles.length} vehicles
                {vehicleSearch.trim() && ` for "${vehicleSearch}"`}
              </span>
              <span className="text-gray-400">Total: {vehicleData.length} in the database</span>
            </div>
          </div>

          {/* Vehicle List */}
          {filteredVehicles.length > 0 ? (
            <div className="px-8 max-h-[45vh] overflow-y-auto bg-white/30 rounded-2xl shadow-inner space-y-4 p-6 rounded-scroll">
              {filteredVehicles.map((vehicle: Vehicle) => (
                <div 
                  key={vehicle.id} 
                  className="bg-gray-100 py-4 rounded-2xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.01]"
                  onClick={() => openVehicleModal(vehicle)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-xl">
                        <FaCar className="w-15 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{vehicle.name}</h3>
                        <p className="text-gray-600">Automaker: <span className="font-semibold">{vehicle.make}</span></p>
                      </div>
                    </div>
                    <div className="text-blue-600">
                      <FaChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (          
            <div className="flex flex-col items-center justify-center py-10 px-6 bg-white rounded-xl shadow-md text-center max-w-md mx-auto">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <FaSearch className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No vehicles found
              </h3>
              <p className="text-gray-500 text-xm mb-4">
                No vehicles match your search criteria &quot;
                <span className="font-medium">{vehicleSearch}</span>
                &quot;
              </p>
              <button
                onClick={() => setVehicleSearch("")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-bold"
              >
                Clear search
              </button>
            </div> 
          )}
        </div>

        {/* Modal */}
        {showModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaCar className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedVehicle.name}</h2>
                    <p className="text-blue-100">Automaker: {selectedVehicle.make}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <FaTimes className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVehicle.sections.map((section: VehicleSection) => {
                    const isExpanded = expandedSections[`${selectedVehicle.id}-${section.id}`];
                    const IconComponent = section.icon;

                    return (
                      <div
                        key={section.id}
                        className={`border-2 rounded-xl ${section.color} self-start`}
                      >
                        {/* Section Header */}
                        <button
                          onClick={() => toggleSection(selectedVehicle.id, section.id)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-opacity-70 transition-all duration-200"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-10 h-10 ${section.iconBg} rounded-lg flex items-center justify-center mr-4`}
                            >
                              <IconComponent className="text-white text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700">
                              {section.title}
                            </h3>
                          </div>
                          <div className="text-gray-500">
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </div>
                        </button>

                        {/* Section Content */}
                        {isExpanded && (
                          <div className="px-6 pb-6 bg-white bg-opacity-50">
                            <div className="space-y-3">
                              {Object.entries(section.data).map(([key, value]: [string, string]) => (
                                <div
                                  key={key}
                                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                                >
                                  <span className="font-medium text-gray-700">{key}:</span>
                                  <span className="text-gray-800 font-semibold text-right ml-4">
                                    {value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}