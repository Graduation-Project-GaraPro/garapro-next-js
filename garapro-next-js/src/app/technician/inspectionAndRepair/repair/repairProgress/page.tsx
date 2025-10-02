"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Play,
  Pause,
  ArrowLeft,
  Car,
  FileText,
  Save,
  Settings,
  Plus,
  Edit
} from "lucide-react";

// Define repair step type
interface RepairStep {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  startTime?: string;
  endTime?: string;
  notes: string;
  estimatedHours: number; // hours part of estimated time
  estimatedMinutes: number; // minutes part of estimated time
  actualTime?: number; // in minutes
}

// Define vehicle info type
interface VehicleInfo {
  id: number;
  vehicle: string;
  licensePlate: string;
  owner: string;
  phone: string;
  issue: string;
  result: string;
}

export default function RepairProgressPage() {
  // Sample vehicle info
  const vehicleInfo: VehicleInfo = {
    id: 3,
    vehicle: "Toyota Camry 2020",
    licensePlate: "30A-12345",
    owner: "Nguyễn Văn An",
    phone: "0901234567",
    issue: "Engine Check",
    result: "Hư phanh, ngập nước, vỡ kính chắn gió"
  };

  const [repairSteps, setRepairSteps] = useState<RepairStep[]>([
    {
      id: 1,
      title: "Initial Diagnosis",
      description: null,
      status: "pending",
      notes: "",
      estimatedHours: 0,
      estimatedMinutes: 0
    },
    {
      id: 3,
      title: "Inspect Air Filter",
      description: null,
      status: "pending",
      notes: "",
      estimatedHours: 0,
      estimatedMinutes: 0
    },
    {
      id: 3,
      title: "Check Fuel System",
      description: null,
      status: "pending",
      notes: "",
      estimatedHours: 0,
      estimatedMinutes: 0
    },
    {
      id: 4,
      title: "Test Drive",
      description: null,
      status: "pending",
      notes: "",
      estimatedHours: 0,
      estimatedMinutes: 0
    },
    {
      id: 5,
      title: "Final Inspection",
      description: null,
      status: "pending",
      notes: "",
      estimatedHours: 0,
      estimatedMinutes: 0
    }
  ]);

  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ 
    description: "", 
    estimatedHours: 0, 
    estimatedMinutes: 30 
  });
  const [generalNotes, setGeneralNotes] = useState("Customer reported engine hesitation during acceleration. Initial inspection shows possible air/fuel mixture issue.");

  // Assume current technician is assigned to step id 3 (replace with dynamic logic)
  const assignedStepId = 3;

  const statusConfig = {
    "pending": { 
      color: "bg-gray-300 text-gray-700 border-gray-200", 
      bgColor: "bg-gray-300",
      icon: Clock,
      label: "Pending" 
    },
    "in-progress": { 
      color: "bg-blue-100 text-blue-800 border-blue-200", 
      bgColor: "bg-blue-50",
      icon: Play,
      label: "In Progress" 
    },
    "completed": { 
      color: "bg-green-100 text-green-800 border-green-200", 
      bgColor: "bg-green-50",
      icon: CheckCircle,
      label: "Completed" 
    },
    "on-hold": { 
      color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      bgColor: "bg-yellow-50",
      icon: Pause,
      label: "On Hold" 
    }
  };

  // Function to calculate actual working time in minutes, considering working hours
  const calculateActualTime = (startTime: string, endTime: string): number => {
    const parseTime = (time: string): Date => new Date(`1970-01-01T${time}:00`);

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    // If end is before start, assume it spans to the next day
    const adjustedEnd = end < start ? new Date(end.getTime() + 24 * 60 * 60 * 1000) : end;

    let totalMinutes = 0;
    let current = new Date(start);

    while (current < adjustedEnd) {
      const currentHour = current.getHours();
      const currentMinute = current.getMinutes();

      // Morning shift: 7:00 - 11:30
      if ((currentHour >= 7 && currentHour < 11) || (currentHour === 11 && currentMinute <= 30)) {
        const shiftEnd = new Date(current);
        shiftEnd.setHours(11, 30, 0);
        const minutesToAdd = Math.min(
          (adjustedEnd.getTime() - current.getTime()) / 60000,
          (shiftEnd.getTime() - current.getTime()) / 60000
        );
        totalMinutes += minutesToAdd;
        current = new Date(current.getTime() + minutesToAdd * 60000);
      }
      // Afternoon shift: 14:00 - 17:30
      else if ((currentHour >= 14 && currentHour < 17) || (currentHour === 17 && currentMinute <= 30)) {
        const shiftEnd = new Date(current);
        shiftEnd.setHours(17, 30, 0);
        const minutesToAdd = Math.min(
          (adjustedEnd.getTime() - current.getTime()) / 60000,
          (shiftEnd.getTime() - current.getTime()) / 60000
        );
        totalMinutes += minutesToAdd;
        current = new Date(current.getTime() + minutesToAdd * 60000);
      }
      // Skip non-working hours by jumping to next shift
      else {
        if (currentHour < 7) {
          current.setHours(7, 0, 0);
        } else if (currentHour >= 11 && currentHour < 14) {
          current.setHours(14, 0, 0);
        } else {
          // After 17:30, jump to next day 7:00
          current.setDate(current.getDate() + 1);
          current.setHours(7, 0, 0);
        }
      }
    }

    return Math.round(totalMinutes);
  };

  const updateStepStatus = (id: number, newStatus: RepairStep["status"]) => {
    const currentTime = new Date().toLocaleTimeString("en-US", { 
      hour12: false, 
      hour: "2-digit", 
      minute: "2-digit" 
    });

    setRepairSteps(prev =>
      prev.map(step => {
        if (step.id === id) {
          const updatedStep = { ...step, status: newStatus };
          
          if (newStatus === "in-progress" && !step.startTime) {
            updatedStep.startTime = currentTime;
          } 
          
          if (newStatus === "completed" && step.startTime && !step.endTime) {
            updatedStep.endTime = currentTime;
            updatedStep.actualTime = calculateActualTime(step.startTime, currentTime);
          } 
          
          // If changing from completed to another status, reset endTime and actualTime, keep startTime
          if (step.status === "completed" && newStatus !== "completed") {
            updatedStep.endTime = undefined;
            updatedStep.actualTime = undefined;
          }
          
          return updatedStep;
        }
        return step;
      })
    );
  };

  const updateStepNotes = (id: number, notes: string) => {
    setRepairSteps(prev =>
      prev.map(step =>
        step.id === id ? { ...step, notes } : step
      )
    );
  };

  const startRepair = (id: number) => {
    setEditingStepId(id);
    const step = repairSteps.find(s => s.id === id);
    if (step) {
      setEditForm({
        description: step.description || "",
        estimatedHours: step.estimatedHours,
        estimatedMinutes: step.estimatedMinutes
      });
    }
  };

  const updateStepDescription = () => {
    if (!editForm.description) {
      alert("Description cannot be empty.");
      return;
    }

    setRepairSteps(prev =>
      prev.map(step =>
        step.id === editingStepId ? { 
          ...step, 
          description: editForm.description
        } : step
      )
    );
    setEditingStepId(null);
  };

  const createStepDetails = () => {
    if (!editForm.description) {
      alert("Description cannot be empty.");
      return;
    }
    if (editForm.estimatedHours === 0 && editForm.estimatedMinutes === 0) {
      alert("Estimated time must be greater than 0.");
      return;
    }

    setRepairSteps(prev =>
      prev.map(step =>
        step.id === editingStepId ? { 
          ...step, 
          description: editForm.description, 
          estimatedHours: editForm.estimatedHours,
          estimatedMinutes: editForm.estimatedMinutes,
          status: "pending"
        } : step
      )
    );
    setEditingStepId(null);
  };

  const completedSteps = repairSteps.filter(step => step.status === "completed").length;
  const totalSteps = repairSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const handleSaveProgress = () => {
    console.log("Saving repair progress:", { vehicleInfo, repairSteps, generalNotes });
    alert("Repair progress saved successfully!");
  };

  return (
    <div className="bg-[url('/images/image9.png')] bg-cover bg-no-repeat h-[641px] p-4 rounded-lg shadow-md ">
      {/* Header */}
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
        <div className="relative flex items-center gap-2 px-6 py-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 mr-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <h2 className="text-[24px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
              {vehicleInfo.vehicle}
            </h2>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto max-h-[70vh] overflow-y-auto rounded-xl rounded-scroll">
        <div className="mb-6">
          {/* Vehicle Info Card */}
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-3 rounded-xl border border-green-200">
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
          {/* Diagnostic Results */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl p-4 border border-gray-200 mb-2">
              <h6 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Vehicle Diagnostic Results
              </h6>
              <p className="text-gray-800 leading-relaxed bg-white p-4 rounded-lg border border-gray-200 font-medium">
                {vehicleInfo.result}
              </p>
            </div>
            {/* Enhanced Progress Section */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl px-5 py-2 border-2 border-blue-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-gray-900">Repair Progress</h4>
                <div className="flex items-center space-x-4 text-sm font-semibold">
                  <span className="text-green-600">✓ {completedSteps} completed</span>
                  <span className="text-orange-600">⏳ {totalSteps - completedSteps} remaining</span>
                </div>
              </div>
              
              {/* Progress Track with Car Icon */}
              <div className="relative">
                <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-md"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                
                {/* Car Icon positioned based on progress */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-1000 ease-out"
                  style={{ 
                    left: progressPercentage >= 95 
                      ? 'calc(100% - 24px)' 
                      : `calc(${progressPercentage}% - 12px)`
                  }}
                >
                  <div className="bg-white rounded-full p-2 shadow-lg border-2 border-blue-500">
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
              
              {/* Progress Steps Indicators */}
              <div className="flex justify-between mt-4">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      index < completedSteps 
                        ? 'bg-green-500 border-green-500' 
                        : index === completedSteps 
                        ? 'bg-blue-500 border-blue-500 animate-pulse' 
                        : 'bg-gray-300 border-gray-400'
                    }`} />
                    <span className="text-xs text-gray-600 mt-1 font-medium">
                      Step {index + 1}
                    </span>
                  </div>
                ))}
              </div>             
            </div>
            
            {/* <div className="flex justify-between text-sm text-gray-900 mt-1">
              <span>{completedSteps} of {totalSteps} steps completed</span>
              <span>{totalSteps - completedSteps} remaining</span>
            </div> */}
          </div>  
        </div>

        {/* Repair Steps */}
        <div className="space-y-2 mb-5">
          {repairSteps.map((step, index) => {
            const StatusIcon = statusConfig[step.status].icon;
            const isAssigned = step.id === assignedStepId;
            const isEditable = !step.description && isAssigned && !editingStepId;
            const isUpdatable = step.description && isAssigned && !editingStepId;
            const estimatedTotalMinutes = step.estimatedHours * 60 + step.estimatedMinutes;

            return (
              <div key={step.id} className={`bg-white/90 rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden ${statusConfig[step.status].bgColor}/30 ${!isAssigned ? "opacity-50 cursor-not-allowed" : ""}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                        {step.description && <p className="text-gray-900 mb-3">{step.description}</p>}
                        <div className="flex items-center space-x-4 text-sm text-gray-700 mb-3 font-bold">
                          {estimatedTotalMinutes > 0 && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Est: {step.estimatedHours}h {step.estimatedMinutes}m</span>
                            </div>
                          )}
                          {step.actualTime !== undefined && (
                            <div className="flex items-center space-x-1">
                              <span>Actual: {Math.floor(step.actualTime / 60)}h {step.actualTime % 60}m</span>
                            </div>
                          )}
                          {step.startTime && (
                            <div>Started: {step.startTime}</div>
                          )}
                          {step.endTime && (
                            <div>Completed: {step.endTime}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {isEditable && (
                        <button
                          onClick={() => startRepair(step.id)}
                          className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                          disabled={!isAssigned}
                        >
                          <div className="flex items-center justify-between space-x-2">
                            <Plus className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">Start Repair</span>
                          </div>
                        </button>
                      )}
                      <div className="flex items-center justify-between space-x-2">
                      {isUpdatable && (
                        <button
                          onClick={() => startRepair(step.id)}
                          className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200"
                          disabled={!isAssigned}
                        >
                          <div className="flex items-center justify-between space-x-2">
                            <Edit className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Update</span>
                          </div>
                        </button>
                      )}
                      {step.description && (
                        <div className={`px-3 py-1 rounded-lg text-sm font-medium border flex items-center space-x-1 ${statusConfig[step.status].color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span>{statusConfig[step.status].label}</span>
                        </div>
                      )}
                      </div>
                      {step.description && (
                        <div className="flex space-x-1">
                          {Object.entries(statusConfig).map(([status, config]) => (
                            <button
                              key={status}
                              onClick={() => updateStepStatus(step.id, status as RepairStep["status"])}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                step.status === status 
                                  ? config.color 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title={config.label}
                              disabled={!isAssigned}
                            >
                              <config.icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      )}
                      
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800 mb-2 block">Progress Notes:</label>
                    <textarea
                      value={step.notes}
                      onChange={(e) => updateStepNotes(step.id, e.target.value)}
                      placeholder="Add notes about this repair step..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      disabled={!isAssigned}
                    />
                  </div>

                  {editingStepId === step.id && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">Description:</label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe what needs to be done in this step"
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                      </div>
                      {!step.description && (
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Estimated Hours:</label>
                            <input
                              type="number"
                              value={editForm.estimatedHours}
                              onChange={(e) => setEditForm(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                              min="0"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-600 mb-2 block">Estimated Minutes:</label>
                            <input
                              type="number"
                              value={editForm.estimatedMinutes}
                              onChange={(e) => setEditForm(prev => ({ ...prev, estimatedMinutes: parseInt(e.target.value) || 0 }))}
                              min="0"
                              max="59"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setEditingStepId(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={step.description ? updateStepDescription : createStepDetails}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                        >
                          {step.description ? "Update" : "Create"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* General Notes Section */}
        <div className="bg-white/90 rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900">General Repair Notes</h3>
          </div>
          <textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Add general notes about the repair process..."
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={6}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pb-6">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProgress}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}