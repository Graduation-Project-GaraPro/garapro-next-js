"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Car, 
  Calendar,
  User,
  CreditCard,
  Zap,
  Activity,
  Clock,
  CheckCircle, 
  Filter,
  Search,
  Eye, 
  Sparkles,
  ClipboardCheck, 
  AlertTriangle, 
  Loader,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

import { getMyInspections, startInspection } from "@/services/technician/inspectionTechnicianService"; 
import inspectionSignalRService, { InspectionAssignedEvent } from "@/services/technician/inspectionSignalRService";
import { getTechnicianId } from "@/services/technician/inspectionTechnicianService";
type TaskStatus = "New" | "Pending" | "InProgress" | "Completed";

interface InspectionJob {
  id: string;
  vehicle: string;
  licensePlate: string;
  customer: string;
  assignedDate: string;
  status: TaskStatus;
}

interface ApiInspection {
  inspectionId: string;
  statusText: string;
  createdAt: string;
  
  repairOrder?: {
    vehicle?: {
      licensePlate?: string;
      brand?: { brandName?: string };
      model?: { modelName?: string };
    };
    customer?: {
      fullName?: string;
    };
  };
}

export default function VehicleInspection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [inspections, setInspections] = useState<InspectionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [technicianId, setTechnicianId] = useState<string | null>(null);
  const [signalRConnected, setSignalRConnected] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const router = useRouter();

  const inspectionImages = [
    {
      url: "/images/image16.png",
      title: "Professional Engine Inspection",
      description: "Comprehensive engine diagnostics and performance analysis"
    },
    {
      url: "/images/image21.png",
      title: "Brake System Analysis",
      description: "Advanced brake pad and rotor condition assessment"
    },
    {
      url: "/images/image23.png",
      title: "Suspension & Alignment Check",
      description: "Precision suspension system evaluation"
    },
    {
      url: "/images/image22.png",
      title: "Exterior Condition Review",
      description: "Detailed bodywork and paint condition inspection"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % inspectionImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [inspectionImages.length]);

  useEffect(() => {
    fetchInspections();
  }, [currentPage, pageSize]);

  useEffect(() => {
  const setupSignalR = async () => {
    try {
      // Lấy technicianId
      const id = await getTechnicianId();
      if (!id) {
        console.warn("Could not get technician ID");
        return;
      }
      setTechnicianId(id);
      console.log("TechnicianId:", id);

      // Start SignalR connection
      await inspectionSignalRService.startConnection();
      setSignalRConnected(true);
      
      // Join group
      await inspectionSignalRService.joinTechnicianGroup(id);

      // Listen to InspectionAssigned event
      inspectionSignalRService.onInspectionAssigned(async (data: InspectionAssignedEvent) => {
        console.log("InspectionAssigned event:", data);

        // Fetch full inspection data từ API
        try {
          const fullData: ApiInspection[] = await getMyInspections();
          const newInspection = fullData.find((x) => x.inspectionId === data.inspectionId);

          if (newInspection) {
            const mapped: InspectionJob = {
              id: newInspection.inspectionId,
              vehicle: `${newInspection.repairOrder?.vehicle?.brand?.brandName || ""} ${newInspection.repairOrder?.vehicle?.model?.modelName || ""}`.trim() || "Unknown",
              licensePlate: newInspection.repairOrder?.vehicle?.licensePlate || "N/A",
              customer: newInspection.repairOrder?.customer?.fullName || "Unknown",
              assignedDate: newInspection.createdAt 
                ? new Date(newInspection.createdAt).toLocaleDateString("vi-VN") 
                : "N/A",
              status: (newInspection.statusText as TaskStatus) || "New",
            };

            setInspections((prev) => [mapped, ...prev]);
            setTotalCount((prev) => prev + 1);
            setTotalPages(Math.ceil((totalCount + 1) / pageSize));

           //alert(`You have been assigned a new inspection!\nVehicle: ${mapped.vehicle}`);
          }
        } catch (error) {
          console.error("Error fetching new inspection details:", error);
        }
      });

    } catch (error) {
      console.error("SignalR setup failed:", error);
      setSignalRConnected(false);
    }
  };

  setupSignalR();

  // Cleanup
  return () => {
    if (technicianId) {
      inspectionSignalRService.leaveTechnicianGroup(technicianId);
    }
    inspectionSignalRService.offInspectionAssigned();
  };
}, []);
  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data: ApiInspection[] = await getMyInspections();
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        setInspections([]);
        setTotalCount(0);
        setTotalPages(0);
        return;
      }
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = data.slice(startIndex, endIndex);

      const mapped: InspectionJob[] = paginatedData.map((x) => ({
        id: x.inspectionId,
        vehicle: `${x.repairOrder?.vehicle?.brand?.brandName || ""} ${x.repairOrder?.vehicle?.model?.modelName || ""}`.trim() || "Unknown",
        licensePlate: x.repairOrder?.vehicle?.licensePlate || "N/A",
        customer: x.repairOrder?.customer?.fullName || "Unknown",
        assignedDate: x.createdAt 
          ? new Date(x.createdAt).toLocaleDateString("vi-VN") 
          : "N/A",
        status: (x.statusText as TaskStatus) || "New",
      }));

      setInspections(mapped);
      
      setTotalCount(data.length);
      setTotalPages(Math.ceil(data.length / pageSize));
      setHasPreviousPage(currentPage > 1);
      setHasNextPage(currentPage < Math.ceil(data.length / pageSize));
      
    } catch (err: unknown) {
      console.error("Fetch error:", err);
      if (err instanceof Error && err.message.includes("authentication")) {
        setError("Missing authentication token. Please login again.");
      } else {
        setError("Failed to load inspections");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = async (id: string) => {
    try {
      setStartingId(id);
      await startInspection(id);

      setInspections(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status: "InProgress" } : item
        )
      );
      
      router.push(`/technician/inspectionAndRepair/inspection/checkVehicle?id=${id}`);
    } catch (err) {
      console.error("Failed to start inspection:", err);
      alert("The test could not be started. Please try again.");
    } finally {
      setStartingId(null);
    }
  };

  const handleNavigateToCheck = (id: string) => {
    router.push(`/technician/inspectionAndRepair/inspection/checkVehicle?id=${id}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "from-blue-400 to-indigo-500";       
      case "Pending":
        return "from-purple-400 to-purple-900";
      case "InProgress":
        return "from-amber-400 to-orange-500";  
      case "Completed":
        return "from-emerald-400 to-teal-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "New":
        return <Sparkles className="w-5 h-5" />;
      case "Pending":
        return <Clock className="w-5 h-5" />;
      case "InProgress":
        return <Activity className="w-5 h-5" />;  
      case "Completed":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };
  
  const searchedVehicles = (filter === "all"
    ? inspections
    : inspections.filter((vehicle) => vehicle.status === filter)
  ).filter(
    (vehicle) =>
      vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.licensePlate &&
        vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex gap-6 bg-gradient-to-br from-blue-200 via-slate-100 to-indigo-200 rounded-xl h-full">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-1 gap-4">
          <div className="relative inline-block mb-2">
            <div className="absolute inset-0 w-full max-w-xl bg-white/70 shadow-md rounded-lg"></div>
            <div className="relative flex items-center gap-2 px-6 py-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <ClipboardCheck className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                <h2 className="text-[27px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                  Vehicle Condition Inspection
                </h2>
                <div 
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    signalRConnected 
                      ? "bg-green-500 animate-pulse shadow-lg shadow-green-400" 
                      : "bg-red-500 shadow-lg shadow-red-400"
                  }`}
                  title={signalRConnected ? "Real-time Connected" : "Disconnected"}
                />
                 </div>
                <p className="text-gray-700 italic">Advanced automotive diagnostics & quality assurance</p>
              </div>
            </div>
          </div>

          <div className="px-5 mb-2 flex-1">
            <div className="relative mb-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by vehicle, license plate or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border-3 border-gray-300 rounded-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
              />
            </div>
            <div className="mb-6">          
              {/* Filter Section */}
              <div className="flex items-center space-x-2 bg-white/40 rounded-xl p-1 shadow-sm border border-gray-200">
                <h2 className="text-[16px] font-semibold text-gray-800 flex items-center gap-2">
                  <Car className="w-6 h-6 text-blue-600" />
                  Inspection Queue: ({totalCount})
                </h2>
                <div className="flex items-center gap-2 ml-auto">
                  <Filter className="w-5 h-5 text-gray-800" />
                  <span className="text-gray-900 font-medium text-[16px]">Filter: </span>
                  <div className="flex space-x-2">
                    {(["all", "New", "InProgress", "Completed"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                          filter === status
                            ? "bg-blue-500 text-white hover:bg-blue-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-400"
                        }`}
                      >
                        {status === "all" ? "All" : status.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div> 
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap">      
          {/* Vehicle List */}
          <div className="xl:col-span-3 max-h-[63vh] overflow-y-auto rounded-xl rounded-scroll">
             {/* Loading state */}
            {loading && (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                  </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading your inspections...</h3>
                    <p className="text-gray-500 mb-4">Please wait while we fetch your assigned inspections.</p>                 
              </div>
              </div>       
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="text-center py-16">
                      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading Inspections</h3>
                        <p className="text-gray-500 mb-4">{error}</p>                 
                      </div>
                    </div>        
            )}

          {!loading && !error && inspections.length === 0 && (
            <div className="text-center py-16">
                <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">You have not been assigned any inspections at this time.</h3>
                  <p className="text-gray-500 mb-4">  Check back later for new assignments.</p>                 
                </div>
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 mt">
              {searchedVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2"
                >
                  <div className="relative h-40 bg-gradient-to-br from-gray-900 to-gray-700 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                    <Image 
                      src="/images/image24.png"
                      alt="Vehicle"
                      width={400}
                      height={160}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(vehicle.status)} text-white font-medium flex items-center gap-2 shadow-lg text-sm`}>
                        {getStatusIcon(vehicle.status)}
                        {vehicle.status}
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="mb-2">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {vehicle.vehicle}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{vehicle.customer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-mono">{vehicle.licensePlate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{vehicle.assignedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {vehicle.status === "New" && (
                        <button 
                          onClick={() => handleStartInspection(vehicle.id)}
                          disabled={startingId === vehicle.id}
                           className="w-full py-3 bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                         
                        >
                          {startingId === vehicle.id ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <Zap className="w-5 h-5" />
                          )}
                          <span>{startingId === vehicle.id ? "Starting..." : "Start Inspection"}</span>
                        </button>
                      )}
                      
                      {vehicle.status === "Pending" && (
                        <button 
                          onClick={() => handleNavigateToCheck(vehicle.id)}
                          className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-800 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <Clock className="w-5 h-5" />
                          Update Inspection
                        </button>
                      )}

                      {vehicle.status === "InProgress" && (
                        <button 
                          onClick={() => handleNavigateToCheck(vehicle.id)}
                          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <Activity className="w-5 h-5" />
                          Continue Inspection
                        </button>
                      )}

                      {vehicle.status === "Completed" && (
                        <button 
                          onClick={() => handleNavigateToCheck(vehicle.id)}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Eye className="w-5 h-5" />
                          View Inspection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>



            {!loading && !error && inspections.length > 0 && searchedVehicles.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No vehicles found</h3>
                  <p className="text-gray-500 mb-4">No vehicles match your current search criteria.</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilter("all");
                    }}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

                       {/* Pagination Controls - STICKY BOTTOM */}
            {totalPages > 1 && (
              <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md rounded-xl p-1 border-t border-gray-300 mt-4 z-10">
                <div className="flex items-center justify-between">
                  {/* Pagination info */}
                  <div className="text-sm text-gray-700 font-medium">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of{" "}
                    {totalCount} inspections
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-2">
                    {/* First page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={!hasPreviousPage}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        hasPreviousPage
                          ? "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Previous page */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPreviousPage}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        hasPreviousPage
                          ? "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === "number" && handlePageChange(page)}
                          disabled={page === "..."}
                          className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                            page === currentPage
                              ? "bg-blue-500 text-white shadow-md"
                              : page === "..."
                              ? "bg-transparent text-gray-400 cursor-default"
                              : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    {/* Next page */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        hasNextPage
                          ? "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Last page */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={!hasNextPage}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        hasNextPage
                          ? "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Panel */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-5">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={inspectionImages[currentImageIndex].url}
                    alt={inspectionImages[currentImageIndex].title}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold mb-1">
                      {inspectionImages[currentImageIndex].title}
                    </h3>
                    <p className="text-sm opacity-90">
                      {inspectionImages[currentImageIndex].description}
                    </p>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {inspectionImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex 
                            ? 'bg-white shadow-lg' 
                            : 'bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Inspection Statistics
                </h3>
                <div className="flex items-center justify-between">
                  {[
                    { label: "New", count: inspections.filter(v => v.status === "New").length,color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pending", count: inspections.filter(v => v.status === "Pending").length, color: "text-purple-600", bg: "bg-indigo-50" },
                    { label: "InProgress", count: inspections.filter(v => v.status === "InProgress").length, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Completed", count: inspections.filter(v => v.status === "Completed").length, color: "text-emerald-600", bg: "bg-emerald-50"  }   
                  ].map((stat, index) => (
                    <div key={index} className={`${stat.bg} rounded-xl text-center`}>
                      <div className={`text-[20px] font-bold ${stat.color}`}>
                        {stat.count}
                      </div>
                      <div className="text-[13px] text-gray-600 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}