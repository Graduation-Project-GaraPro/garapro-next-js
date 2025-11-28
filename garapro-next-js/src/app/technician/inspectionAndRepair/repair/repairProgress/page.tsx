"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle, Clock, Play, Pause, ArrowLeft, Car, FileText,
  Save,Settings,Plus,Edit,X,Loader, AlertTriangle, ChevronDown, ChevronUp,  Package  
} from "lucide-react";
import {
  getRepairOrderDetails,
  createRepair,
  updateRepair,
  RepairCreateDto,
  RepairUpdateDto,
  RepairDetailDto,
   PartCategoryRepairDto,    
  JobDetailDto
} from "@/services/technician/repairService";

import { authService } from "@/services/authService";
import { updateJobStatus } from "@/services/technician/jobTechnicianService";
import signalRService, { 
  RepairCreatedEvent, 
  RepairUpdatedEvent
} from "@/services/technician/signalRService";
import jobSignalRService, { JobStatusUpdatedEvent } from "@/services/technician/jobSignalRService";
interface RepairStep {
  jobId: string;
  title: string;
  description: string | null;
  status: "New" | "InProgress" | "Completed" | "OnHold";
  startTime?: string;
  endTime?: string;
  notes: string;
  estimatedHours: number;
  estimatedMinutes: number;
  actualTimeShort?: string; 
  estimatedTimeShort?: string; 
  repairId?: string;
  serviceName?: string;
  parts?: PartCategoryRepairDto[];
}
interface VehicleInfo {
  repairOrderId: string;
  vehicle: string;
  licensePlate: string;
  owner: string;
  phone: string;
  issue: string;
  result: string;
}

interface JobResponseDto {
  jobId: string;
  repairOrderId: string;
  jobName: string;
  status: string;
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
// Error Modal
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

export default function RepairProgressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [repairSteps, setRepairSteps] = useState<RepairStep[]>([]);
  const [openPartDropdown, setOpenPartDropdown] = useState<string | null>(null);
  const [myJobIds, setMyJobIds] = useState<string[]>([]);
  const [signalRConnected, setSignalRConnected] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    notes: "",
    estimatedHours: 0,
    estimatedMinutes: 30,
    status: "New" as RepairStep["status"]
  });

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const showSuccessToastMessage = (msg: string) => {
    setSuccessToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  useEffect(() => {
    const fetchRepairDetails = async () => {
      if (!jobId) {
        setError("Job ID is missing");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        
        const authToken = typeof window !== "undefined" ?  authService.getToken() : "";
        
        console.log("sadasdasd token",authToken)
  
        const jobResponse = await fetch(`https://localhost:7113/odata/JobTechnician/my-jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!jobResponse.ok) {
          throw new Error("Failed to fetch job details");
        }
        const jobData = await jobResponse.json();
        const repairOrderId = jobData.repairOrderId;
        if (!repairOrderId) {
          throw new Error("Repair order ID not found in job details");
        }
        
        try {
          const myJobsResponse = await fetch(`https://localhost:7113/odata/JobTechnician/my-jobs`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          if (myJobsResponse.ok) {
            const myJobsData: JobResponseDto[] = await myJobsResponse.json();
            const jobsInSameOrder = myJobsData.filter((job: JobResponseDto) => job.repairOrderId === repairOrderId);
            const jobIdsArray = jobsInSameOrder.map((job: JobResponseDto) => job.jobId);
            console.log("My job IDs in this repair order:", jobIdsArray);
            setMyJobIds(jobIdsArray);
          }
        } catch (err) {
          console.warn("Could not fetch all jobs, using current job only:", err);
          setMyJobIds([jobId]);
        }
        const data: RepairDetailDto = await getRepairOrderDetails(repairOrderId);
        const vehicleName = data.vehicle?.brand?.brandName && data.vehicle?.model?.modelName
          ? `${data.vehicle.brand.brandName} ${data.vehicle.model.modelName} ${data.vehicle.model.manufacturingYear || ''}`
          : data.vin || "Unknown Vehicle";
        
        setVehicleInfo({
          repairOrderId: data.repairOrderId,
          vehicle: vehicleName.trim(),
          licensePlate: data.vehicleLicensePlate || "N/A",
          owner: data.customerName || "Unknown",
          phone: data.customerPhone || "N/A",
          issue: data.jobs.map(j => j.jobName).join(", ") || "N/A",
          result: data.note || "No diagnostic results available"
        });
        
        const steps: RepairStep[] = data.jobs.map((job: JobDetailDto) => {
  const repair = job.repairs;
  let estimatedHours = 0;
  let estimatedMinutes = 0;
  
  if (repair?.estimatedTimeShort) {
    const match = repair.estimatedTimeShort.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      estimatedHours = parseInt(match[1]) || 0;
      estimatedMinutes = parseInt(match[2]) || 0;
    }
  }

  return {
    jobId: job.jobId,
    title: job.jobName,
    description: repair?.description || null,
    status: job.status as RepairStep["status"],
    startTime: repair?.startTime,
    endTime: repair?.endTime,
    notes: repair?.notes || "",
    estimatedHours,
    estimatedMinutes,
    actualTimeShort: repair?.actualTimeShort, 
    estimatedTimeShort: repair?.estimatedTimeShort, 
    repairId: repair?.repairId,
    serviceName: job.serviceName,
    parts: job.parts || []
  };
});
        setRepairSteps(steps);
      } catch (err: unknown) {
        console.error("Error fetching repair details:", err);
        setError("Failed to load repair details");
      } finally {
        setLoading(false);
      }
    };
    fetchRepairDetails();
  }, [jobId]);
  
 useEffect(() => {
  if (!vehicleInfo?.repairOrderId) return;

  const setupJobSignalR = async () => {
    try {
      await jobSignalRService.startConnection();
      console.log("Job SignalR Connected");

      jobSignalRService.onJobStatusUpdated((data: JobStatusUpdatedEvent) => {
        console.log("JobStatusUpdated event:", data);

        const statusMap: Record<string, RepairStep["status"]> = {
          "New": "New",
          "InProgress": "InProgress",
          "Completed": "Completed",
          "OnHold": "OnHold"
        };

        const newStatus = statusMap[data.newStatus];
        if (!newStatus) return;

        setRepairSteps(prev => 
          prev.map(step => {
            if (step.jobId === data.jobId) {
              return {
                ...step,
                status: newStatus,
                endTime: newStatus === "Completed" ? new Date().toISOString() : step.endTime
              };
            }
            return step;
          })
        );
        showSuccessToastMessage(`Job status changed to ${data.newStatus}`);
      });

      const jobIds = repairSteps.map(step => step.jobId);
      for (const jobId of jobIds) {
        await jobSignalRService.joinJobGroup(jobId);
        console.log(`Joined Job_${jobId} group`);
      }

    } catch (error) {
      console.error("Job SignalR Setup failed:", error);
    }
  };

  if (repairSteps.length > 0) {
    setupJobSignalR();
  }

  // Cleanup
  return () => {
    const jobIds = repairSteps.map(step => step.jobId);
    for (const jobId of jobIds) {
      jobSignalRService.leaveJobGroup(jobId);
    }
    jobSignalRService.offAllEvents();
  };
}, [vehicleInfo?.repairOrderId, repairSteps.length]);


useEffect(() => {
  if (!vehicleInfo?.repairOrderId) return;

  const setupSignalR = async () => {
    try {
      await signalRService.startConnection();
      await signalRService.joinRepairOrderGroup(vehicleInfo.repairOrderId);
      
      const repairConnected = signalRService.getConnectionState() === "Connected";
      const jobConnected = jobSignalRService.getConnectionState() === "Connected";
      setSignalRConnected(repairConnected || jobConnected); 
      
      console.log("Repair SignalR Connected for RepairOrder:", vehicleInfo.repairOrderId);

      // Event: RepairCreated
      signalRService.onRepairCreated((data: RepairCreatedEvent) => {
        console.log("RepairCreated:", data);
        
        setRepairSteps(prev => 
          prev.map(step => {
            if (step.jobId === data.jobId) {
              const [hours, minutes] = data.estimatedTime.split(":").map(Number);
              return {
                ...step,
                repairId: data.repairId,
                description: data.description,
                notes: data.notes || "", 
                status: "InProgress" as const,
                startTime: data.startTime,
                estimatedHours: hours || 0,
                estimatedMinutes: minutes || 0,
                estimatedTimeShort: `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`
              };
            }
            return step;
          })
        );
        showSuccessToastMessage("New repair created!");
      });

      signalRService.onRepairUpdated((data: RepairUpdatedEvent) => {
        console.log("RepairUpdated:", data);
        
        setRepairSteps(prev => 
          prev.map(step => {
            if (step.repairId === data.repairId) {
              return {
                ...step,
                description: data.description,
                notes: data.notes
              };
            }
            return step;
          })
        );
        showSuccessToastMessage("Repair updated!");
      });    

    } catch (error) {
      console.error("Repair SignalR Setup failed:", error);
      setSignalRConnected(false);
    }
  };

  setupSignalR();

  return () => {
    if (vehicleInfo?.repairOrderId) {
      signalRService.leaveRepairOrderGroup(vehicleInfo.repairOrderId);
    }
    signalRService.offAllEvents();
    setSignalRConnected(false);
  };
}, [vehicleInfo?.repairOrderId]);


  const statusConfig = {
    New: {
      color: "bg-gray-300 text-gray-700 border-gray-200",
      bgColor: "bg-gray-300",
      icon: Clock,
      label: "New",
      apiValue: 1
    },
    InProgress: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      bgColor: "bg-blue-50",
      icon: Play,
      label: "In Progress",
      apiValue: 2
    },
    Completed: {
      color: "bg-green-100 text-green-800 border-green-200",
      bgColor: "bg-green-50",
      icon: CheckCircle,
      label: "Completed",
      apiValue: 3
    },
    OnHold: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      bgColor: "bg-yellow-50",
      icon: Pause,
      label: "On Hold",
      apiValue: 4
    }
  };

  const updateStepStatus = async (jobId: string, newStatus: RepairStep["status"]) => {
  try {
    const step = repairSteps.find(s => s.jobId === jobId);
    if (!step) return;
    const currentTime = new Date().toISOString();
    await updateJobStatus({
      JobId: jobId,
      JobStatus: statusConfig[newStatus].apiValue
    });
    

    if (step.description && step.repairId) {
      try {
        const updateData: RepairUpdateDto = {
          description: step.description,
          notes: step.notes
        };
        await updateRepair(step.repairId, updateData);
      } catch (repairError) {
        console.warn("Could not update repair details, but job status updated:", repairError);
      }
    }
    
    if (newStatus === "Completed" && vehicleInfo?.repairOrderId) {
      try {
        const updatedData: RepairDetailDto = await getRepairOrderDetails(vehicleInfo.repairOrderId);
        const updatedJob = updatedData.jobs.find(j => j.jobId === jobId);
        
        if (updatedJob?.repairs) {
          const repair = updatedJob.repairs;
          
          setRepairSteps(prev =>
            prev.map(s =>
              s.jobId === jobId
                ? {
                    ...s,
                    status: newStatus,
                    endTime: currentTime,
                    actualTimeShort: repair.actualTimeShort, 
                    estimatedTimeShort: repair.estimatedTimeShort 
                  }
                : s
            )
          );
          
          showSuccessToastMessage(`Job completed successfully!`);
          return;
        }
      } catch (error) {
        console.error("Error fetching updated repair data:", error);
      }
    }
    
    setRepairSteps(prev =>
      prev.map(step =>
        step.jobId === jobId && step.status !== "Completed"
          ? {
              ...step,
              status: newStatus,
              startTime: newStatus === "InProgress" && !step.startTime ? currentTime : step.startTime,
              endTime: newStatus === "Completed" && step.startTime && !step.endTime ? currentTime : step.endTime
            }
          : step
      )
    );
    
    showSuccessToastMessage(`Job status updated to ${statusConfig[newStatus].label} successfully!`);
   
  } catch (error) {
    console.error("Error updating job status:", error);
    setError("Failed to update job status");
    setErrorMessage("Failed to update job status. Please try again.");
    setShowErrorModal(true);
  }
};

  const updateStepNotes = (jobId: string, notes: string) => {
    setRepairSteps(prev =>
      prev.map(step =>
        step.jobId === jobId ? { ...step, notes } : step
      )
    );
  };

  const startRepair = (jobId: string) => {
    setEditingStepId(jobId);
    const step = repairSteps.find(s => s.jobId === jobId);
    if (step) {
      setEditForm({
        title: step.title,
        description: step.description || "",
        notes: step.notes || "",
        estimatedHours: step.estimatedHours,
        estimatedMinutes: step.estimatedMinutes,
        status: step.description ? step.status : "InProgress"
      });
      setIsUpdating(!!step.description);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStepId(null);
    setIsUpdating(false);
  };

const saveStepDetails = async () => {
  if (!editForm.description) {
    setErrorMessage("Description cannot be empty.");
    setShowErrorModal(true);
    return;
  }
  if (!isUpdating && editForm.estimatedHours === 0 && editForm.estimatedMinutes === 0) {
    setErrorMessage("Estimated time must be greater than 0.");
    setShowErrorModal(true);
    return;
  }
  
  const step = repairSteps.find(s => s.jobId === editingStepId);
  if (!step) return;
  
  try {
    const currentTime = new Date().toISOString();
    
    if (isUpdating && step.repairId) {
      const updateData: RepairUpdateDto = {
        description: editForm.description, 
        notes: editForm.notes 
      };
      await updateRepair(step.repairId, updateData);
      
      setRepairSteps(prev =>
        prev.map(s =>
          s.jobId === editingStepId
            ? {
                ...s,
                description: editForm.description,
                notes: editForm.notes,
                status: editForm.status
              }
            : s
        )
      );
      showSuccessToastMessage("Repair step updated successfully!");
      
    } else {
      const createData: RepairCreateDto = {
        jobId: step.jobId, 
        description: editForm.description, 
        notes: editForm.notes,
        estimatedTime: `${editForm.estimatedHours.toString().padStart(2, "0")}:${editForm.estimatedMinutes.toString().padStart(2, "0")}` // Format HH:mm
      };
      
      const response = await createRepair(createData);
      
      setRepairSteps(prev =>
        prev.map(s =>
          s.jobId === editingStepId
            ? {
                ...s,
                repairId: response.repairId,
                description: editForm.description,
                notes: editForm.notes,
                estimatedHours: editForm.estimatedHours,
                estimatedMinutes: editForm.estimatedMinutes,
                estimatedTimeShort: response.estimatedTimeShort,
                status: "InProgress",
                startTime: currentTime
              }
            : s
        )
      );
      
      await updateJobStatus({
        JobId: step.jobId,
        JobStatus: statusConfig.InProgress.apiValue
      });
      
      showSuccessToastMessage("Repair step created and started successfully!");
    }
    closeModal();
  } catch (error: any) {
    console.error("Error saving repair:", error);
    const errorMessage = error.message || "Failed to save repair details. Please try again.";
    setErrorMessage(errorMessage);
    setShowErrorModal(true);
  }
};

  const completedSteps = repairSteps.filter(step => step.status === "Completed").length;
  const totalSteps = repairSteps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

const handleSaveProgress = async () => {
  try {
    setLoading(true);

    const myJobsInOrder = repairSteps.filter(step => myJobIds.includes(step.jobId));
    const hasAnyRepairCreated = myJobsInOrder.some(step => step.description && step.repairId);

    if (!hasAnyRepairCreated) {
      setErrorMessage("You must create at least one repair step before saving progress.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    for (const step of myJobsInOrder) {
      if (step.description && step.repairId) {
        const updateData: RepairUpdateDto = {
          description: step.description, 
          notes: step.notes 
        };
        await updateRepair(step.repairId, updateData);
      }
    }

    setSuccessMessage("Repair progress saved successfully!");
    setShowSuccessModal(true);
  } catch (error) {
    console.error("Error saving repair progress:", error);
    setError("Failed to save repair progress");
    setErrorMessage("Failed to save repair progress. Please try again.");
    setShowErrorModal(true);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[url('/images/image9.png')] bg-cover bg-no-repeat p-4 rounded-lg shadow-md">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-700">Loading repair details...</h3>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[url('/images/image9.png')] bg-cover bg-no-repeat p-4 rounded-lg shadow-md">
        <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
        <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }
  if (!vehicleInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[url('/images/image9.png')] bg-cover bg-no-repeat p-4 rounded-lg shadow-md">
        <Car className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Vehicle Data</h3>
        <p className="text-gray-500">Unable to load vehicle information.</p>
      </div>
    );
  }

  return (
    <div className="bg-[url('/images/image9.png')] bg-cover bg-no-repeat h-full p-4 rounded-lg shadow-md">
      
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">{successToastMessage}</p>
            </div>
          </div>
        </div>
      )}

     <div className="relative inline-block mb-6">
  <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
  <div className="relative flex items-center gap-2 px-6 py-2">
    <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 mr-2">
      <ArrowLeft className="w-5 h-5 text-gray-600" />
    </button>
    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
      <Settings className="w-7 h-7 text-white" />
    </div>
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        <h2 className="text-[24px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
          {vehicleInfo.vehicle}
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
    </div>
  </div>
</div>

      <div className="max-w-6xl mx-auto max-h-[70vh] overflow-y-auto rounded-xl rounded-scroll">
        <div className="mb-6">
          <div className="bg-white/70 rounded-xl p-4 shadow-lg border border-gray-200 mb-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Vehicle Information</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-900 font-bold">Complete</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Vehicle</span>
                <p className="text-base font-bold text-gray-900 mt-1">{vehicleInfo.vehicle}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-2 rounded-xl border border-green-200">
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">License Plate</span>
                <p className="text-base font-bold text-gray-900 mt-1">{vehicleInfo.licensePlate}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-3 rounded-xl border border-amber-200">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Issues</span>
                <p className="text-base font-bold text-gray-900 mt-1">{vehicleInfo.issue}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-3 rounded-xl border border-purple-200">
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Owner</span>
                <p className="text-base font-bold text-gray-900 mt-1">{vehicleInfo.owner}</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-sky-100 p-3 rounded-xl border border-cyan-200">
                <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">Phone</span>
                <p className="text-base font-bold text-gray-900 mt-1">{vehicleInfo.phone}</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl p-4 border border-gray-200 mb-2">
              <h6 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Vehicle Diagnostic Results
              </h6>
              <p className="text-gray-800 leading-relaxed bg-white p-4 rounded-lg border border-gray-200 font-medium">
                {vehicleInfo.result}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl px-5 py-2 border-2 border-blue-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-900">Repair Progress</h4>
                <div className="flex items-center space-x-4 text-sm font-semibold">
                  <span className="text-green-600">Completed {completedSteps}</span>
                  <span className="text-orange-600">Remaining {totalSteps - completedSteps}</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-md"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
                  style={{
                    left: progressPercentage >= 95 ? "calc(100% - 24px)" : `calc(${progressPercentage}% - 12px)`
                  }}
                >
                  <div className="bg-white rounded-full p-2 shadow-lg border-2 border-blue-500">
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        index < completedSteps
                          ? "bg-green-500 border-green-500"
                          : index === completedSteps
                          ? "bg-blue-500 border-blue-500 animate-pulse"
                          : "bg-gray-300 border-gray-400"
                      }`}
                    />
                    <span className="text-xs text-gray-600 mt-1 font-medium">Step {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {repairSteps.map((step, index) => {
            const StatusIcon = statusConfig[step.status].icon;         
            const isMyJob = myJobIds.includes(step.jobId);
            const isEditable = !step.description && isMyJob;
            const isUpdatable = step.description && isMyJob && step.status !== "Completed";
            const isCompleted = step.status === "Completed";
            return (
              <div
                key={step.jobId}
                className={`bg-white/90 rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden ${statusConfig[step.status].bgColor}/30 ${!isMyJob ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="p-4">
                  <div className="flex flex-col md:flex-row items-start justify-between mb-2 min-h-[100px]">
 <div className="flex items-start space-x-4 flex-1">
  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
  </div>
  <div className="flex-1">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>

      {/* Parts Dropdown Wrapper */}
      {step.parts && step.parts.length > 0 && (
        <div className="relative inline-block text-left">
          {/* Dropdown Trigger Button */}
          <button
            onClick={() =>
              setOpenPartDropdown(openPartDropdown === step.jobId ? null : step.jobId)
            }
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-colors duration-200 border border-purple-300"
          >
            <Package className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">
              Parts Required (
              {step.parts.reduce((total, cat) => total + cat.parts.length, 0)})
            </span>
            {openPartDropdown === step.jobId ? (
              <ChevronUp className="w-4 h-4 text-purple-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-purple-600" />
            )}
          </button>

          {/* Dropdown Content */}
          {openPartDropdown === step.jobId && (
            <div className="absolute right-0 mt-1 w-[420px] bg-white rounded-lg shadow-lg border border-purple-200 z-20 animate-fadeIn">
              <div className="p-3 space-y-2 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100">
                {step.parts.map((category) => (
                  <div
                    key={category.partCategoryId}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200"
                  >
                    <h5 className="text-sm font-bold text-purple-900 mb-1 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      {category.categoryName}
                    </h5>
                    <div className="space-y-1.5 ml-3">
                      {category.parts.map((part) => (
                        <div
                          key={part.partId}
                          className="flex items-center justify-between bg-white p-2 rounded-lg border border-purple-200 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
                            <span className="text-sm font-medium text-gray-800">
                              {part.partName}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-purple-700 ml-8">
                            {part.unitPrice.toLocaleString("vi-VN")} VND
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Assigned to another technician warning */}
    {!isMyJob && (
      <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-lg mb-2">
        Assigned to another technician
      </div>
    )}

    {/* Repair Description */}
    {step.description && (
      <p className="text-gray-900 mb-3">
        Repair Description: {step.description}
      </p>
    )}

    {/* Time and Status Info */}
    <div className="flex items-center space-x-4 text-sm text-gray-700 mb-3 font-bold">
  {step.estimatedTimeShort && (
    <div className="flex items-center space-x-1">
      <Clock className="w-4 h-4" />
      <span>Est: {step.estimatedTimeShort}</span>
    </div>
  )}
  {step.actualTimeShort && (
    <div className="flex items-center space-x-1">
      <span>Actual: {step.actualTimeShort}</span>
    </div>
  )}
  {step.startTime && (
    <div>Started: {new Date(step.startTime).toLocaleString()}</div>
  )}
  {step.endTime && (
    <div>Completed: {new Date(step.endTime).toLocaleString()}</div>
  )}
</div>
  </div>
</div>
                    <div className="flex flex-col items-end space-y-2 mt-2 md:mt-0 md:ml-4">
                      {isEditable && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startRepair(step.jobId)}
                            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                            disabled={!isMyJob}
                          >
                            <div className="flex items-center justify-between space-x-2">
                              <Plus className="w-5 h-5 text-blue-600" />
                              <span className="font-medium">Start Repair</span>
                            </div>
                          </button>
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium border flex items-center space-x-1 ${statusConfig[step.status].color}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span>{statusConfig[step.status].label}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between space-x-2">
                       {(isUpdatable || isCompleted) && (
                            <button
                              onClick={() => step.status !== "Completed" && startRepair(step.jobId)}
                              className={`p-2 rounded-lg transition-colors duration-200 flex items-center justify-between space-x-2 ${
                                step.status === "Completed"
                                  ? "bg-green-100 opacity-50 cursor-not-allowed"
                                  : "bg-green-100 hover:bg-green-200"
                              }`}
                              disabled={!isMyJob || step.status === "Completed"}
                            >
                              <Edit className="w-5 h-5 text-green-600" />
                              <span className="font-medium">Update Repair</span>
                            </button>
                          )}
                        {step.description && (
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium border flex items-center space-x-1 ${statusConfig[step.status].color}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span>{statusConfig[step.status].label}</span>
                          </div>
                        )}
                      </div>
                     <div className="flex space-x-1">
                        {(["New", "InProgress", "OnHold", "Completed"] as const).map(status => {
                          const config = statusConfig[status];
                          const isNewLocked = step.status !== "New" && status === "New";
                          const isCompletedLocked = step.status === "Completed";
                          const isDisabled =
                            !step.description || !isMyJob || isNewLocked || isCompletedLocked;
                          return (
                            <button
                              key={status}
                              onClick={() => updateStepStatus(step.jobId, status)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                step.status === status
                                  ? config.color
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                              title={config.label}
                              disabled={isDisabled}
                            >
                              <config.icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-800 mb-2 block">Repair Notes:</label>
                    <textarea
                      value={step.notes}
                      onChange={(e) => updateStepNotes(step.jobId, e.target.value)}
                      placeholder={!step.description ? "Please create repair first to add notes..." : "Add notes about this repair step..."}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      disabled={!isMyJob || isCompleted || !step.description}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-200 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {isUpdating ? "Update Repair Step" : "Start Repair Step"}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Title:</label>
                  <input
                    type="text"
                    value={editForm.title}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Repair Descriptions: <span className="text-red-500">*</span></label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what needs to be done in this step"
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Repair Notes:</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add notes about this repair step..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                {!isUpdating && (
  <div className="flex space-x-4">
    <div className="flex-1">
      <label className="text-sm font-medium text-gray-600 mb-2 block">
        Estimated Hours:<span className="text-red-500">*</span>
      </label>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => 
            setEditForm(prev => ({ 
              ...prev, 
              estimatedHours: Math.max(0, prev.estimatedHours - 1) 
            }))
          }
          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          disabled={editForm.estimatedHours === 0}
        >
          <span className="text-gray-700 font-bold">-</span>
        </button>
        <input
          // type="number"
          value={editForm.estimatedHours}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            setEditForm(prev => ({ ...prev, estimatedHours: value }));
          }}
         min="0"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
        />
        <button
          type="button"
          onClick={() => 
            setEditForm(prev => ({ 
              ...prev, 
              estimatedHours: prev.estimatedHours + 1 
            }))
          }
          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          <span className="text-gray-700 font-bold">+</span>
        </button>
      </div>
    </div>
    
    <div className="flex-1">
      <label className="text-sm font-medium text-gray-600 mb-2 block">
        Estimated Minutes:
      </label>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => 
            setEditForm(prev => ({ 
              ...prev, 
              estimatedMinutes: prev.estimatedMinutes === 0 ? 59 : prev.estimatedMinutes - 1 
            }))
          }
          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          <span className="text-gray-700 font-bold">-</span>
        </button>
        <input
          value={editForm.estimatedMinutes}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            setEditForm(prev => ({ ...prev, estimatedMinutes: value }));
          }}
          min="0"
          max="59"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
        />
        <button
          type="button"
          onClick={() => 
            setEditForm(prev => ({ 
              ...prev, 
              estimatedMinutes: (prev.estimatedMinutes + 1) % 60 
            }))
          }
          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          <span className="text-gray-700 font-bold">+</span>
        </button>
      </div>
    </div>
  </div>
)}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveStepDetails}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                >
                  {isUpdating ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pb-6">
           <button onClick={() => router.back()} className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200">
              Cancel
            </button>
          <button
  onClick={handleSaveProgress}
  disabled={
    loading || 
    !repairSteps.some(step => myJobIds.includes(step.jobId) && step.description && step.repairId)||
    repairSteps.filter(step => myJobIds.includes(step.jobId)).every(step => step.status === "Completed")
  }
  className={`
    px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg 
    transition-all duration-200 flex items-center space-x-2
    ${
      loading || 
      !repairSteps.some(step => myJobIds.includes(step.jobId) && step.description && step.repairId)||
      repairSteps.filter(step => myJobIds.includes(step.jobId)).every(step => step.status === "Completed")
        ? "opacity-50 cursor-not-allowed"
        : "hover:from-blue-600 hover:to-indigo-700"
    }
  `}
>
  <Save className="w-5 h-5" />
  <span>Save Progress</span>
</button>
        </div>
      </div>

      {/* Success Modal - Centered (Save Progress) */}
      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Error Modal - Centered (Invalid & Save Progress Error) */}
      <ErrorModal
        isOpen={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
}