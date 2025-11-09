"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Wrench, 
  Car, 
  Calendar,
  User,
  IdCard,
  Activity,
  Clock,
  CheckCircle, 
  Filter,
  Search,
  Eye, 
  Sparkles, 
  ClipboardList,
  Loader,
  AlertTriangle,
  Play,
  PauseCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { getMyJobs } from "@/services/technician/jobTechnicianService";

interface Vehicle {
  id: string;
  vehicle: string;
  licensePlate: string;
  customer: string;
  assignedDate: string;
  status: string;
  jobName: string;
}

type TaskStatus = "New" | "Completed" | "InProgress" | "OnHold";

// API Response interfaces
interface BrandResp { brandId?: string; brandName?: string; country?: string; }
interface ModelResp { modelId?: string; modelName?: string; manufacturingYear?: number; }
interface ColorResp { colorId?: string; colorName?: string; hexCode?: string; }

interface VehicleResp {
  vehicleId?: string;
  licensePlate?: string;
  brand?: BrandResp;
  model?: ModelResp;
  color?: ColorResp;
}

interface CustomerResp {
  customerId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

interface JobResponse {
  jobId?: string;
  jobName?: string;
  status?: string;
  deadline?: string;
  totalAmount?: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string | null;
  level?: string;
  serviceName?: string;
  repairOrderId?: string;
  vehicle?: VehicleResp;
  customer?: CustomerResp;
}

export default function ConditionInspection() {
  const [assignedVehicles, setAssignedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const router = useRouter();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % placeholderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch jobs from API
  useEffect(() => {
    fetchJobs();
  }, [currentPage, pageSize]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const data: JobResponse[] = await getMyJobs();

      if (!data || !Array.isArray(data) || data.length === 0) {
        setAssignedVehicles([]);
        setTotalCount(0);
        setTotalPages(0);
        return;
      }

      // Mock pagination for frontend
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = data.slice(startIndex, endIndex);

      const mappedVehicles: Vehicle[] = paginatedData.map((item) => {
        // Build vehicle name
        const vehicleName = item.vehicle
          ? `${item.vehicle.brand?.brandName || ""} ${item.vehicle.model?.modelName || ""} ${item.vehicle.model?.manufacturingYear || ""}`.trim() || "Unknown"
          : "Unknown";

        // Map status from API to UI format
        let uiStatus = "New";
        const apiStatus = item.status?.toLowerCase() || "";
        
        if (apiStatus === "inprogress" || apiStatus === "in-progress") {
          uiStatus = "InProgress";
        } else if (apiStatus === "onhold") {
          uiStatus = "OnHold";
        } else if (apiStatus === "completed") {
          uiStatus = "Completed";
        } else if (apiStatus === "new") {
          uiStatus = "New";
        }

        // Format deadline
        const deadlineStr = item.deadline 
          ? new Date(item.deadline).toLocaleDateString("en-GB") 
          : "N/A";

        return {
          id: item.jobId || item.repairOrderId || `temp-${Math.random()}`,
          vehicle: vehicleName,
          licensePlate: item.vehicle?.licensePlate || "N/A",
          customer: item.customer?.fullName || "Unknown",
          assignedDate: deadlineStr,
          status: uiStatus,
          jobName: item.jobName || "N/A",
        };
      });

      setAssignedVehicles(mappedVehicles);
      
      // Set pagination info
      setTotalCount(data.length);
      setTotalPages(Math.ceil(data.length / pageSize));
      setHasPreviousPage(currentPage > 1);
      setHasNextPage(currentPage < Math.ceil(data.length / pageSize));
      
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("authentication")) {
        setError("Missing authentication token. Please login again.");
      } else {
        setError("Failed to load job list");
      }
    } finally {
      setLoading(false);
    }
  };

  const placeholderImages = useMemo(() => [
    "/images/image6.png",
    "/images/image18.jpg",
    "/images/image7.png",
    "/images/image17.jpg"
  ], []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "New":
        return "from-blue-400/70 to-cyan-500/70";
      case "Completed":
        return "from-emerald-400/70 to-green-500/70";
      case "InProgress":
        return "from-amber-300/70 to-orange-300/70";
      case "OnHold":
         return "from-red-400/70 to-pink-500/70";
      default:
        return "from-blue-400/70 to-purple-500/70";
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "New":
        return <Sparkles className="w-5 h-5" />;
      case "Completed":
        return <CheckCircle className="w-5 h-5" />;
      case "InProgress":
        return <Activity className="w-5 h-5" />;
      case "OnHold":
        return <PauseCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  }, []);

  const getStatusDisplayText = useCallback((status: string) => {
    return status === "InProgress" ? "In Progress" : status;
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  const getPageNumbers = useCallback(() => {
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
  }, [currentPage, totalPages]);

  // Optimized filtering with useMemo
  const searchedVehicles = useMemo(() => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    const filtered = (filter === "all" ? assignedVehicles : assignedVehicles.filter(vehicle => vehicle.status === filter))
      .filter(vehicle => 
        vehicle.vehicle.toLowerCase().includes(searchLower) ||
        vehicle.customer.toLowerCase().includes(searchLower) ||
        vehicle.licensePlate.toLowerCase().includes(searchLower)
      );

    return filtered;
  }, [assignedVehicles, filter, debouncedSearchTerm]);

  // Memoized stats for the stats panel
  const vehicleStats = useMemo(() => {
    return {
      new: assignedVehicles.filter(v => v.status === "New").length,
      completed: assignedVehicles.filter(v => v.status === "Completed").length,
      inProgress: assignedVehicles.filter(v => v.status === "InProgress").length,
      onHold: assignedVehicles.filter(v => v.status === "OnHold").length,
    };
  }, [assignedVehicles]);

  const handleRepairAction = useCallback((jobId: string) => {
    router.push(`/technician/inspectionAndRepair/repair/repairProgress?id=${jobId}`);
  }, [router]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleImageDotClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  // Optimized Vehicle Card Component
  const VehicleCard = useCallback(({ vehicle }: { vehicle: Vehicle }) => {
    const handleClick = () => handleRepairAction(vehicle.id);

    return (
      <div
        key={vehicle.id}
        className="w-205 h-52 relative bg-[url('/images/image13.png')] bg-cover bg-no-repeat before:absolute before:inset-0 before:bg-black before:opacity-30 before:rounded-lg group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>                 
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="bg-white/80 p-1 rounded-lg inline-block">
                  <h3 className="text-xl font-semibold text-black group-hover:text-blue-600 transition-colors">
                    {vehicle.vehicle}
                  </h3>
                  <p className="text-gray-900 flex items-center gap-2 mt-1">
                    <ClipboardList className="w-4 h-4" />
                    {vehicle.jobName}
                  </p>
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor(vehicle.status)} text-white font-medium flex items-center gap-2 shadow-lg`}>
              {getStatusIcon(vehicle.status)}
              {getStatusDisplayText(vehicle.status)}
            </div>
          </div>
         
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-black/40 flex items-center font-bold gap-2 text-white rounded">
              <User className="w-4 h-4" />
              <span className="text-sm">Customer: {vehicle.customer}</span>
            </div>
            <div className="bg-black/40 flex items-center font-bold gap-2 text-white rounded">
              <IdCard className="w-4 h-4" />
              <span className="text-sm">License Plate: {vehicle.licensePlate}</span>
            </div>
            <div className="bg-black/40 flex items-center font-bold gap-2 text-white rounded">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Deadline: {vehicle.assignedDate}</span>
            </div>
          </div>

          {vehicle.status === "New" ? (
            <div className="flex items-center justify-between mb-4 gap-4">           
              <button 
                onClick={handleClick}
                className="w-full py-3 bg-gradient-to-r from-blue-600/70 to-cyan-600 hover:from-blue-700/70 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                 <Play className="w-5 h-5" />
                Start Repair
              </button>
            </div>                      
          ) : vehicle.status === "Completed" ? (
            <div className="flex items-center justify-between mb-4 gap-4">
              <button
                onClick={handleClick}
                className="w-full py-3 bg-gradient-to-r from-emerald-500/70 to-green-700 hover:from-emerald-700/70 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                View Repair
              </button>
            </div>
          ) : vehicle.status === "OnHold" ? (
            <div className="flex items-center justify-between mb-4 gap-4">
              <button
                onClick={handleClick}
               className="w-full py-3 bg-gradient-to-r from-red-500 to-red-800 hover:from-red-500 hover:to-red-900 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <PauseCircle className="w-5 h-5" />
                Continue Repair
              </button>
            </div>
          ) : vehicle.status === "InProgress" ? ( 
            <div className="flex items-center justify-between mb-4 gap-4">
              <button
                onClick={handleClick}
                className="w-full py-3 bg-gradient-to-r from-amber-300/70 to-orange-300/70 hover:from-amber-400/70 hover:to-orange-400/70 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Wrench className="w-5 h-5" />
                Continue Repair
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }, [getStatusColor, getStatusIcon, getStatusDisplayText, handleRepairAction]);

  return (
    <div className="flex gap-6 bg-gradient-to-br from-slate-100 via-blue-300 to-indigo-100 p-5 rounded-lg h-full">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-1 gap-4">
          {/* Animated Header */}
          <div className="relative inline-block mb-1">
            <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
            <div className="relative flex items-center gap-2 px-3 py-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Wrench className="w-7 h-7 text-white"/>
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[27px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                  Vehicle Repair Progress
                </h2>
                <p className="text-gray-600 italic">Your Repair Journey, Made Visible.</p>
              </div>
            </div>
          </div>
          {/* Search */}
          <div className="px-6 mb-2 flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by vehicle, license plate or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-[16px] pl-12 pr-4 py-3 border-3 border-gray-300 rounded-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2 gap-4">
          <h2 className="text-[16px] font-semibold text-gray-800 flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            Assigned Vehicles ({totalCount})
          </h2>
          {/* Filter Section */}
          <div className="flex items-center space-x-2 bg-white/40 rounded-xl p-2 shadow-sm border border-gray-200">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Filter:</span>
            <div className="flex space-x-2">
              {(["all", "New", "InProgress", "OnHold","Completed"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-1.5 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                    filter === status
                      ? "bg-blue-500 text-white hover:bg-blue-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-400"
                  }`}
                >
                  {status === "all" ? "All" : status === "InProgress" ? "In Progress" : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-700">Loading vehicles...</h3>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Vehicles</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && assignedVehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Car className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Vehicles Assigned</h3>
            <p className="text-gray-500">You have not been assigned any vehicles yet.</p>
          </div>
        )}

        {/* Vehicle List */}
        {!loading && !error && assignedVehicles.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto rounded-xl rounded-scroll">              
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">              
                {searchedVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}

                {searchedVehicles.length === 0 && !loading && (
                  <div className="text-center py-20 absolute left-130">
                    <div className="bg-white/80 rounded-2xl p-8 shadow-lg">
                      <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No vehicles found</h3>
                      <p className="text-gray-500">No vehicles match your search criteria.</p>
                      <button
                        onClick={handleClearSearch}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-bold"
                      >
                        Clear search
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="sticky bottom-0 left-0 right-0 mt-4 flex items-center justify-between bg-white/80 backdrop-blur-md rounded-xl py-1 px-6 shadow-md border-t border-gray-300 z-10">
                {/* Pagination info */}
                <div className="text-sm text-gray-700 font-medium">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of{" "}
                  {totalCount} vehicles
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-2">
                  {/* First page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={!hasPreviousPage}
                    className={`p-1 rounded-lg transition-all duration-200 ${
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
                    className={`p-1 rounded-lg transition-all duration-200 ${
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
                        className={`px-2 rounded-lg font-medium transition-all duration-200 ${
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
                    className={`p-1 rounded-lg transition-all duration-200 ${
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
                    className={`p-1 rounded-lg transition-all duration-200 ${
                      hasNextPage
                        ? "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Slideshow */}
      <div className="lg:col-span1">
        <div className="">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative h-135 w-85 overflow-hidden">
              <div className="relative h-full">
                <Image
                  src={placeholderImages[currentImageIndex]}
                  alt={`Professional inspection ${currentImageIndex + 1}`}
                  width={400}
                  height={256}
                  className="w-full h-full object-cover transition-all duration-1000 transform hover:scale-105"
                  priority={currentImageIndex === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <p className="text-lg opacity-90">Vehicle Inspection</p>
              </div>
              <div className="absolute bottom-4 right-6 flex space-x-2">
                {placeholderImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageDotClick(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
            {/* Stats panel */}
            <div className="p-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-sm">
              <div className="flex items-center justify-center gap-10 text-center">
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {vehicleStats.new}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">New</div>
                </div>

                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {vehicleStats.completed}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Completed</div>
                </div>

                <div>
                  <div className="text-xl font-bold text-cyan-600">
                    {vehicleStats.inProgress}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">InProgress</div>
                </div>

                <div>
                  <div className="text-xl font-bold text-red-600">
                    {vehicleStats.onHold}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">OnHold</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}