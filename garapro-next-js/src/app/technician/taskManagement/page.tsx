"use client";

import { useState, useEffect } from "react";
import { getMyJobs } from "@/services/technician/jobTechnicianService";
import { useRouter } from "next/navigation";
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
  ClipboardList,PauseCircle,
  Loader
} from "lucide-react";
import { LucideIcon } from "lucide-react";

//Define types for task status and priority
type TaskStatus = "new" | "in-progress" | "completed" | "on-hold";;
type TaskPriority = "high" | "medium" | "low";

// // Define the structure of a task
interface Task {
  id: number;
  vehicle: string;
  issue: string;
  jobName: string;
  time: string;
  status: TaskStatus;
  progress: number;
  priority: TaskPriority;
  technician: string;
  licensePlate: string;
  owner: string;
  phone: string;
  description: string;
}
/** --- Types that match API JSON structure (camelCase) --- **/
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
  technicians?: TechnicianResp[]; // note: API returns technicians array
}

interface StatusConfig {
  color: string;
  icon: LucideIcon;
  bgGradient: string;
}
interface StatusConfigMap { [key: string]: StatusConfig; }
interface PriorityConfigMap { [key: string]: string; }


// Define the structure of statusConfig
interface StatusConfig {
  color: string;
  icon: LucideIcon;
  bgGradient: string;
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const shouldHideCompletedTask = (task: Task): boolean => {
    if (task.status !== "completed") return false;
    const today = new Date();
    // time stored as DD/MM/YYYY in your UI mapping; parse safely
    try {
      const [d, m, y] = task.time.split("/");
      const taskDate = new Date(Number(y), Number(m) - 1, Number(d));
      return today > taskDate;
    } catch {
      return false;
    }
  };
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const data: JobResponse[] = await getMyJobs();

        if (!data || !Array.isArray(data) || data.length === 0) {
        setTasks([]); // không có nhiệm vụ
        return;
      }

        const mappedTasks: Task[] = data.map((item) => {
          // build a display name for vehicle (brand + model) if available
          const vehicleName = item.vehicle
            ? `${item.vehicle.brand?.brandName || ""} ${item.vehicle.model?.modelName || ""}`.trim() || "Unknown"
            : "Unknown";

        //   // default status mapping from API statuses (e.g., "InProgress" -> "in-progress")
        //   const normalizedStatus = item.status
        //     ? item.status.toLowerCase() === "inprogress" || item.status.toLowerCase() === "in-progress"
        //       ? "in-progress"
        //       : item.status.toLowerCase()
        //     : "new";
        //     let progress = 0;
        // switch (normalizedStatus) {
        //   case "in-progress":
        //     progress = 50;
        //     break;
        //   case "completed":
        //     progress = 100;
        //     break;
        //   default:
        //     progress = 0;
        // }
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

          // convert deadline to dd/mm/yyyy for UI (if exists)
          const deadlineStr = item.deadline ? new Date(item.deadline).toLocaleDateString("en-GB") : "N/A";

          return {
            id: item.jobId || (item.repairOrderId ?? Math.random()), // fallback id
            vehicle: vehicleName,
            issue: item.note || "N/A",
            jobName: item.jobName|| "N/A",
            time: deadlineStr,
            status: (normalizedStatus as TaskStatus) || "new",
            progress, // API doesn't return progress in your sample; set 0 or adapt if exists
            priority: "medium", // API sample doesn't include priority
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
  }, []);
  // Enhanced status configuration with explicit typing
  const statusConfig: StatusConfigMap = {
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
    
  };

  // Priority configuration with explicit typing
  const priorityConfig: PriorityConfigMap = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  // Filter tasks to hide completed tasks that are past their deadline
  const visibleTasks = tasks.filter(task => !shouldHideCompletedTask(task));

  const filteredTasks = (filter === "all"
    ? visibleTasks
    : visibleTasks.filter((task) => task.status === filter))
    .filter(
  (vehicle) =>
    vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.licensePlate &&
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())));     

  return (
    <div className="bg-[url('/images/image5.jpg')] bg-cover bg-no-repeat h-[640px] p-6 rounded-lg shadow-md ">
      <div className="flex items-center justify-between mb-2 gap-4">
       {/* Header Section */}
      <div className="relative inline-block mb-4">
            <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
              <div className="relative flex items-center gap-2 px-6 py-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col items-start">
                 <h2 className="text-[29px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                   Task Management
                 </h2>
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
              Assigned Tasks ({filteredTasks.length})
            </h2>
            {/* Filter section */}
            <div className="flex items-center gap-2 ml-auto">
              <Filter className="w-5 h-5 text-gray-800" />
              <span className="text-gray-900 font-medium text-[18px]">Filter:</span>
              <div className="flex space-x-2">
                {(["all", "new", "in-progress",  "on-hold","completed"] as const).map((status) => (
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
              <p className="text-gray-500">
                Check back later for new assignments.
              </p>
            </div>
      )}


        {/* Tasks Grid */}
        {!loading && !error && tasks.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-h-[55vh] overflow-y-auto rounded-xl rounded-scroll">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const StatusIcon = statusConfig[task.status]?.icon || Clock;
                const isCompleted = task.status === "completed";
            return (
              <div
                key={task.id}
                className={`bg-gradient-to-br ${statusConfig[task.status]?.bgGradient || "from-gray-50 to-gray-100"} rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
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
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${priorityConfig[task.priority]}`}
                    >
                      {task.priority.toUpperCase()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 ">Progress</span>
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
                      <div className="flex items-center space-x-2 text-sm text-gray-800 font-medium ">
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
                          className={`px-3 py-1 rounded-lg text-sm font-semibold border ${statusConfig[task.status]?.color || "bg-gray-100 text-gray-800 border-gray-200"}`}
                        >
                          {task.status.replace("-", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-800 font-medium ">
                         <User className="w-4 h-4" />
                          <span className="font-medium">Customer: </span>
                          <span className="text-gray-800">{task.owner}</span>
                      </div>
                         
                      <div className="flex items-center font-bold gap-2 text-gray-800 ">
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
                      onClick={() => !isCompleted && router.push(`inspectionAndRepair/repair/repairProgress?id=${task.id}`)}                   
                      disabled={isCompleted}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 font-semibold rounded-lg transition-all duration-300 shadow-md ${
                        isCompleted 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-800 transform hover:scale-105'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      <span>{isCompleted ? 'Completed' : 'Start Work'}</span>
                    </button>

                    <button 
                      onClick={() => setSelectedTask(task)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-300 border border-gray-300">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
         })
            ) : (
              <div className="col-span-full flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center justify-center py-6 px-18 bg-white/80 rounded-xl shadow-md text-center max-w-md">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <AlertTriangle className="w-8 h-8 text-gray-800" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No Vehicles Found</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    No vehicles match your search criteria &quot;
                    <span className="font-medium">{searchTerm}</span>&quot;
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-bold"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Detail Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-100 via-blue-300 to-indigo-100 rounded-2xl shadow-2xl max-w-3xl w-full ">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div >
                    <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>                    
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
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
                  <div className="grid grid-cols-2 gap-50">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Vehicle:</span>
                      <p className="text-lg font-semibold text-gray-900">{selectedTask.vehicle}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">License Plate:</span>
                      <p className="text-lg font-bold text-blue-600">{selectedTask.licensePlate}</p>
                    </div>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-green-600" />
                    Vehicle Owner Information
                  </h3>
                  <div className="grid grid-cols-2 gap-50">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Owner:</span>
                      <p className="text-lg font-semibold text-gray-900">{selectedTask.owner}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Phone:</span>
                      <p className="text-lg font-semibold text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-green-600" />
                        {selectedTask.phone}
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
                      <span className="text-sm font-medium text-gray-600">Issues:</span>
                      <p className="text-lg font-semibold text-gray-900">{selectedTask.issue}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Technician:</span>
                      <p className="text-lg font-semibold text-gray-900">{selectedTask.technician}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Dealine:</span>
                      <p className="text-lg font-semibold text-red-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {selectedTask.time}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Priority Level:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${priorityConfig[selectedTask.priority]}`}>
                        {selectedTask.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${statusConfig[selectedTask.status]?.color}`}>
                        {selectedTask.status.replace("-", " ").toUpperCase()}
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
                      <span className="text-lg font-bold text-purple-600">{selectedTask.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${selectedTask.progress}%` }}
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
                    {selectedTask.description}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-lg">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => selectedTask.status !== "completed" && router.push(`inspectionAndRepair/repair/repairProgress?id=${selectedTask.id}`)}  
                  disabled={selectedTask.status === "completed"}
                  className={`px-6 py-2 font-semibold rounded-lg transition-all duration-200 ${
                    selectedTask.status === "completed"
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  {selectedTask.status === "completed" ? "Completed" : "Start Work"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}