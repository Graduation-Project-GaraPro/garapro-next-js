"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getMyJobs } from "@/services/technician/jobTechnicianService";
import { useRouter } from "next/navigation";
import jobSignalRService, { JobAssignedEvent } from "@/services/technician/jobSignalRService";
import { getTechnicianId } from "@/services/technician/jobTechnicianService";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Car,
  Calendar,
  Play,
  Eye,
  Filter,
  User, 
  X,
  Phone,
  FileText, 
  Search,
  CreditCard, 
  ClipboardList,
  PauseCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { LucideIcon } from "lucide-react";

type TaskStatus = "new" | "in-progress" | "completed" | "on-hold";

interface Task {
  id: string | number;
  vehicle: string;
  issue: string;
  jobName: string;
  time: string;
  status: TaskStatus;
  progress: number;
  technician: string;
  licensePlate: string;
  owner: string;
  phone: string;
  description: string;
}

interface BrandResp { brandId?: string; brandName?: string; country?: string; }
interface ModelResp { modelId?: string; modelName?: string; manufacturingYear?: number; }
interface ColorResp { colorId?: string; colorName?: string; hexCode?: string; }

interface VehicleResp {
  vehicleId?: string;
  licensePlate?: string;
  vin?: string;
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

interface TechnicianResp {
  technicianId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

interface RepairResp {
  repairId?: string;
  description?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
  actualTime?: string;
  estimatedTime?: string;
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
  repair?: RepairResp | null;
  technicians?: TechnicianResp[];
}

interface StatusConfig {
  color: string;
  icon: LucideIcon;
  bgGradient: string;
}

interface StatusConfigMap { [key: string]: StatusConfig; }
interface PriorityConfigMap { [key: string]: string; }

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const shouldHideCompletedTask = useCallback((task: Task): boolean => {
    if (task.status !== "completed") return false;
    const today = new Date();
    try {
      const [d, m, y] = task.time.split("/");
      const taskDate = new Date(Number(y), Number(m) - 1, Number(d));
      return today > taskDate;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const data: JobResponse[] = await getMyJobs();

        if (!data || !Array.isArray(data) || data.length === 0) {
          setTasks([]);
          setTotalCount(0);
          setTotalPages(0);
          return;
        }

        // Mock pagination for frontend
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = data.slice(startIndex, endIndex);

        const mappedTasks: Task[] = paginatedData.map((item) => {
          const vehicleName = item.vehicle
            ? `${item.vehicle.brand?.brandName || ""} ${item.vehicle.model?.modelName || ""}`.trim() || "Unknown"
            : "Unknown";

          let normalizedStatus: TaskStatus = "new";
          if (item.status) {
            const statusLower = item.status.toLowerCase();
            if (statusLower === "inprogress" || statusLower === "in-progress") {
              normalizedStatus = "in-progress";
            } else if (statusLower === "onhold" || statusLower === "on-hold") {
              normalizedStatus = "on-hold";
            } else if (statusLower === "completed") {
              normalizedStatus = "completed";
            } else if (statusLower === "new") {
              normalizedStatus = "new";
            }
          }

          let progress = 0;
          switch (normalizedStatus) {
            case "in-progress":
              progress = 50;
              break;
            case "completed":
              progress = 100;
              break;
            case "on-hold":
              progress = 30;
              break;
            default:
              progress = 0;
          }

          const deadlineStr = item.deadline ? new Date(item.deadline).toLocaleDateString("en-GB") : "N/A";

          return {
            id: item.jobId || (item.repairOrderId ?? Math.random()),
            vehicle: vehicleName,
            issue: item.note || "N/A",
            jobName: item.jobName || "N/A",
            time: deadlineStr,
            status: normalizedStatus,
            progress,
            priority: "medium",
            technician:
              item.technicians && item.technicians.length > 0
                ? item.technicians[0].fullName || "Technician"
                : "Technician",
            licensePlate: item.vehicle?.licensePlate || "N/A",
            owner: item.customer?.fullName || "Unknown",
            phone: item.customer?.phoneNumber || "N/A",
            description: item.repair?.description || item.note || "No description",
          } as Task;
        });

        setTasks(mappedTasks);
        
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

    fetchJobs();
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
      await jobSignalRService.startConnection();
      setSignalRConnected(true);
      
      // Join group
      await jobSignalRService.joinTechnicianGroup(id);

      // Event 1: JobAssigned - Khi Manager assign job mới
      jobSignalRService.onJobAssigned(async (data: JobAssignedEvent) => {
        console.log("JobAssigned event:", data);

        // Fetch full job list để lấy data đầy đủ
        try {
          const fullData: JobResponse[] = await getMyJobs();
          const newJob = fullData.find((x) => x.jobId === data.jobId);

          if (newJob) {
            const vehicleName = newJob.vehicle
              ? `${newJob.vehicle.brand?.brandName || ""} ${newJob.vehicle.model?.modelName || ""}`.trim() || "Unknown"
              : "Unknown";

            let normalizedStatus: TaskStatus = "new";
            if (newJob.status) {
              const statusLower = newJob.status.toLowerCase();
              if (statusLower === "inprogress" || statusLower === "in-progress") {
                normalizedStatus = "in-progress";
              } else if (statusLower === "onhold" || statusLower === "on-hold") {
                normalizedStatus = "on-hold";
              } else if (statusLower === "completed") {
                normalizedStatus = "completed";
              } else if (statusLower === "new") {
                normalizedStatus = "new";
              }
            }

            let progress = 0;
            switch (normalizedStatus) {
              case "in-progress":
                progress = 50;
                break;
              case "completed":
                progress = 100;
                break;
              case "on-hold":
                progress = 30;
                break;
              default:
                progress = 0;
            }

            const deadlineStr = newJob.deadline ? new Date(newJob.deadline).toLocaleDateString("en-GB") : "N/A";

            const mappedTask: Task = {
              id: newJob.jobId || (newJob.repairOrderId ?? Math.random()),
              vehicle: vehicleName,
              issue: newJob.note || "N/A",
              jobName: newJob.jobName || "N/A",
              time: deadlineStr,
              status: normalizedStatus,
              progress,
              technician:
                newJob.technicians && newJob.technicians.length > 0
                  ? newJob.technicians[0].fullName || "Technician"
                  : "Technician",
              licensePlate: newJob.vehicle?.licensePlate || "N/A",
              owner: newJob.customer?.fullName || "Unknown",
              phone: newJob.customer?.phoneNumber || "N/A",
              description: newJob.repair?.description || newJob.note || "No description",
            };

            // Thêm vào đầu danh sách
            setTasks((prev) => [mappedTask, ...prev]);
            setTotalCount((prev) => prev + 1);
            setTotalPages(Math.ceil((totalCount + 1) / pageSize));

          }
        } catch (error) {
          console.error("Error fetching new job details:", error);
        }
      });     

    } catch (error) {
      console.error("SignalR setup failed:", error);
      setSignalRConnected(false);
    }
  };

  setupSignalR();
  return () => {
    if (technicianId) {
      jobSignalRService.leaveTechnicianGroup(technicianId);
    }
    jobSignalRService.offAllEvents();
  };
}, []);

  // Memoized status configuration
  const statusConfig: StatusConfigMap = useMemo(() => ({
    new: {
      color: "bg-blue-100/70 text-blue-900 border-blue-200/70",
      icon: Play,
      bgGradient: "from-blue-300/70 to-indigo-100/70",
    },
    "in-progress": {
      color: "bg-amber-100/70 text-amber-900 border-amber-200/70",
      icon: Clock,
      bgGradient: "from-amber-200/70 to-orange-100/70",
    },
    completed: {
      color: "bg-green-100/70 text-green-900 border-green-200/70",
      icon: CheckCircle,
      bgGradient: "from-green-300/70 to-emerald-100/70",
    },
    "on-hold": {
      color: "bg-red-100/70 text-red-900 border-red-200/70",
      icon: PauseCircle,
      bgGradient: "from-red-300/70 to-rose-100/70",
    },
  }), []);

  // Memoized priority configuration
  const priorityConfig: PriorityConfigMap = useMemo(() => ({
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  }), []);

  // Optimized filtering with useMemo
  const {filteredTasks } = useMemo(() => {
    const visible = tasks.filter(task => !shouldHideCompletedTask(task));
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    const filtered = (filter === "all" ? visible : visible.filter(task => task.status === filter))
      .filter(task => 
        task.vehicle.toLowerCase().includes(searchLower) ||
        task.owner.toLowerCase().includes(searchLower) ||
        task.licensePlate.toLowerCase().includes(searchLower)
      );

    return { visibleTasks: visible, filteredTasks: filtered };
  }, [tasks, filter, debouncedSearchTerm, shouldHideCompletedTask]);

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

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleStartWork = useCallback((task: Task) => {
    if (task.status !== "completed") {
      router.push(`inspectionAndRepair/repair/repairProgress?id=${task.id}`);
    }
  }, [router]);

  const handleCloseModal = useCallback(() => {
    setSelectedTask(null);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Optimized Task Card Component
  const TaskCard = useCallback(({ task }: { task: Task }) => {
    const StatusIcon = statusConfig[task.status]?.icon || Clock;
    const isCompleted = task.status === "completed";
    
    return (
      <div
        className={`flex flex-col justify-between bg-gradient-to-br ${
          statusConfig[task.status]?.bgGradient || "from-gray-50 to-gray-100"
        } rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
      >
        {/* Card Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Car className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{task.vehicle}</h3>
                <p className="text-gray-700 text-sm font-bold italic">{task.jobName}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-900">Progress</span>
              <span className="text-sm font-bold text-gray-900">{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>

          {/* Task Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-800 font-medium">
                <Calendar className="w-4 h-4" />
                <span>Deadline:</span>
              </div>
              <span className="text-sm font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                {task.time}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusIcon className="w-4 h-4" />
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold border ${
                    statusConfig[task.status]?.color || "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                >
                  {task.status.replace("-", " ").toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-800 font-medium">
                <User className="w-4 h-4" />
                <span className="font-medium">Customer: </span>
                <span className="text-gray-800">{task.owner}</span>
              </div>

              <div className="flex items-center font-bold gap-2 text-gray-800">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm text-gray-800">{task.licensePlate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 bg-white/50 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={() => handleStartWork(task)}
              disabled={isCompleted}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 font-semibold rounded-lg transition-all duration-300 shadow-md ${
                isCompleted
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105"
              }`}
            >
              <Play className="w-4 h-4" />
              <span>{isCompleted ? "Completed" : "Start Work"}</span>
            </button>

            <button
              onClick={() => handleTaskClick(task)}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-300 border border-gray-300"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }, [statusConfig, priorityConfig, handleStartWork, handleTaskClick]);

  return (
    <div className="bg-[url('/images/image5.jpg')] bg-cover bg-no-repeat h-full p-6 pb-2 rounded-lg shadow-md max-h-[86vh] overflow-y-auto rounded-xl rounded-scroll">
      <div className="flex items-center justify-between mb-2 gap-4">
        {/* Header Section */}
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
          <div className="relative flex items-center gap-2 px-6 py-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
              <h2 className="text-[29px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                Task Management
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
              
              <p className="text-gray-700 italic">Manage your vehicle service tasks efficiently</p>
            
          </div>
            
          </div>
        </div>

        <div className="px-12 mb-4 flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by vehicle, license plate or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-3 border-gray-300 rounded-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="mb-3">
          {/* Filter Section */}
          <div className="flex items-center space-x-2 bg-white/40 rounded-xl p-3 shadow-sm border border-gray-200">
            <h2 className="text-[18px] font-semibold text-gray-800 flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              Assigned Tasks ({totalCount})
            </h2>
            {/* Filter section */}
            <div className="flex items-center gap-2 ml-auto">
              <Filter className="w-5 h-5 text-gray-800" />
              <span className="text-gray-900 font-medium text-[18px]">Filter:</span>
              <div className="flex space-x-2">
                {(["all", "new", "in-progress", "on-hold", "completed"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                      filter === status
                        ? "bg-blue-500 text-white hover:bg-blue-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-400"
                    }`}
                  >
                    {status === "all" ? "All Tasks" : status.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 px-6 bg-white rounded-xl shadow-md text-center max-w-md mx-auto">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Loader className="w-8 h-8 text-gray-800 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Loading your jobs...</h3>
            <p className="text-gray-500 text-sm mb-4">
              Please wait while we fetch your assigned tasks.
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-10 px-6 bg-white rounded-xl shadow-md text-center max-w-md mx-auto">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-800" />
            </div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Error Loading Jobs</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-6 bg-white rounded-xl shadow-md text-center max-w-md mx-auto">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-800" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              You have not been assigned any tasks at this time.
            </h2>
            <p className="text-gray-500">Check back later for new assignments.</p>
          </div>
        )}

        {/* Tasks Grid */}
        {!loading && !error && tasks.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center min-h-[50vh]">
                  <div className="flex flex-col items-center justify-center py-6 px-18 bg-white/80 rounded-xl shadow-md text-center max-w-md">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <AlertTriangle className="w-8 h-8 text-gray-800" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No Vehicles Found</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      No vehicles match your search criteria &quot;
                      <span className="font-medium">{debouncedSearchTerm}</span>&quot;
                    </p>
                    <button
                      onClick={handleClearSearch}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-bold"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="sticky bottom-0 left-0 right-0 mt-4 flex items-center justify-between bg-white/80 backdrop-blur-md rounded-xl px-6 shadow-md border-t border-gray-300 z-10">
                {/* Pagination info */}
                <div className="text-sm text-gray-700 font-medium">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of{" "}
                  {totalCount} tasks
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
                        className={`px-2 py-1 rounded-lg font-medium transition-all duration-200 ${
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
          </>
        )}

        {/* Detail Modal */}
        {selectedTask && (
          <TaskDetailModal 
            task={selectedTask} 
            onClose={handleCloseModal}
            onStartWork={handleStartWork}
            statusConfig={statusConfig}
            priorityConfig={priorityConfig}
          />
        )}
      </div>
    </div>
  );
}

// Separate Modal Component for better performance
const TaskDetailModal = ({ 
  task, 
  onClose, 
  onStartWork,
  statusConfig,
}: { 
  task: Task;
  onClose: () => void;
  onStartWork: (task: Task) => void;
  statusConfig: StatusConfigMap;
  priorityConfig: PriorityConfigMap;
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-100 via-blue-300 to-indigo-100 rounded-2xl shadow-2xl max-w-3xl w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Vehicle Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Car className="w-5 h-5 mr-2 text-blue-600" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Vehicle:</span>
                <p className="text-lg font-semibold text-gray-900">{task.vehicle}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">License Plate:</span>
                <p className="text-lg font-bold text-blue-600">{task.licensePlate}</p>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Vehicle Owner Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Owner:</span>
                <p className="text-lg font-semibold text-gray-900">{task.owner}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Phone:</span>
                <p className="text-lg font-semibold text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-green-600" />
                  {task.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-amber-600" />
              Job Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Job Name:</span>
                <p className="text-lg font-semibold text-gray-900">{task.jobName}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Technician:</span>
                <p className="text-lg font-semibold text-gray-900">{task.technician}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Deadline:</span>
                <p className="text-lg font-semibold text-red-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {task.time}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${statusConfig[task.status]?.color}`}>
                  {task.status.replace("-", " ").toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Completion Progress</span>
                <span className="text-lg font-bold text-purple-600">{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              Describe Vehicle Condition
            </h3>
            <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
              {task.description}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Close
          </button>
          <button
            onClick={() => onStartWork(task)}
            disabled={task.status === "completed"}
            className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${
              task.status === "completed"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
            }`}
          >
            {task.status === "completed" ? "Completed" : "Start Work"}
          </button>
        </div>
      </div>
    </div>
  );
};