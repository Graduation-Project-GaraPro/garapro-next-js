"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Play,
  Pause,
  ArrowLeft,
  Car,
//   Calendar,
//   User,
//   Phone,
  FileText,
//   Camera,
  Save,
  Settings,
//   AlertTriangle,
  Plus,
  X
} from "lucide-react";

// Define repair step type
interface RepairStep {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  startTime?: string;
  endTime?: string;
  notes: string;
  estimatedTime: number; // in minutes
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
      description: "Run diagnostic scan and identify engine issues",
      status: "completed",
      startTime: "09:00",
      endTime: "09:30",
      notes: "Found error codes P0171 and P0174 - lean condition detected",
      estimatedTime: 30,
      actualTime: 30
    },
    {
      id: 2,
      title: "Inspect Air Filter",
      description: "Check air filter condition and replace if necessary",
      status: "completed",
      startTime: "09:30",
      endTime: "09:45",
      notes: "Air filter heavily clogged, replaced with new OEM filter",
      estimatedTime: 15,
      actualTime: 15
    },
    {
      id: 3,
      title: "Check Fuel System",
      description: "Inspect fuel injectors and fuel pressure",
      status: "in-progress",
      startTime: "09:45",
      notes: "Currently testing fuel pressure - within normal range",
      estimatedTime: 45,
      actualTime: undefined
    },
    {
      id: 4,
      title: "Test Drive",
      description: "Road test vehicle to verify repairs",
      status: "pending",
      notes: "",
      estimatedTime: 20
    },
    {
      id: 5,
      title: "Final Inspection",
      description: "Complete final quality check and documentation",
      status: "pending",
      notes: "",
      estimatedTime: 15
    }
  ]);

  const [showAddStep, setShowAddStep] = useState(false);
  const [newStep, setNewStep] = useState({
    title: "",
    description: "",
    estimatedTime: 30
  });
  const [generalNotes, setGeneralNotes] = useState("Customer reported engine hesitation during acceleration. Initial inspection shows possible air/fuel mixture issue.");

  const statusConfig = {
    "pending": { 
      color: "bg-gray-100 text-gray-700 border-gray-200", 
      bgColor: "bg-gray-50",
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

const updateStepStatus = (id: number, status: RepairStep["status"]) => {
  const currentTime = new Date().toLocaleTimeString("en-US", { 
    hour12: false, 
    hour: "2-digit", 
    minute: "2-digit" 
  });

  setRepairSteps(prev =>
    prev.map(step => {
      if (step.id === id) {
        const updatedStep = { ...step, status };
        
        if (status === "in-progress" && !step.startTime) {
          updatedStep.startTime = currentTime;
        } else if (status === "completed" && step.startTime && !step.endTime) {
          updatedStep.endTime = currentTime;
          // Calculate actual time (simplified - you'd want better time calculation)
          const start = new Date(`1970-01-01T${step.startTime}:00`);
          const end = new Date(`1970-01-01T${currentTime}:00`);
          updatedStep.actualTime = Math.round((end.getTime() - start.getTime()) / 60000);
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

  const addNewStep = () => {
    if (!newStep.title || !newStep.description) return;

    const newId = Math.max(...repairSteps.map(s => s.id)) + 1;
    setRepairSteps(prev => [...prev, {
      id: newId,
      title: newStep.title,
      description: newStep.description,
      status: "pending",
      notes: "",
      estimatedTime: newStep.estimatedTime
    }]);

    setNewStep({ title: "", description: "", estimatedTime: 30 });
    setShowAddStep(false);
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
                <h2 className="text-[29px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                  Repair Progress
                </h2>
                <p className="text-gray-700 italic">Track and manage repair workflow</p>
              </div>
            </div>
          </div>
        <div className="max-w-6xl mx-auto  max-h-[70vh] overflow-y-auto rounded-xl rounded-scroll rounded-xl">
       
        <div className="mb-6">
          {/* Vehicle Info Card */}
          <div className="bg-white/70 rounded-xl p-4 shadow-lg border border-gray-200 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Car className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Vehicle Information</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-900 font-bold">Complete</div>
              </div>
            </div>
             <div className="flex items-center justify-between mb-4 gap-4">
            
              <div className="bg-blue-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Vehicle</span>
                <p className="text-[15px] font-semibold text-gray-900">{vehicleInfo.vehicle}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600">License Plate</span>
                <p className="text-[15px] font-bold text-blue-600">{vehicleInfo.licensePlate}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Issues</span>
                <p className="text-[15px] font-semibold text-gray-900">{vehicleInfo.issue}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Phone</span>
                <p className="text-[15px] font-semibold text-gray-900">{vehicleInfo.phone}</p>
              </div>
               <div className="bg-amber-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Owner</span>
                <p className="text-[15px] font-semibold text-gray-900">{vehicleInfo.owner}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-100 mb-2">
              <h6 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Vehicle Diagnostic Results
              </h6>
                <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                {vehicleInfo.result}
                </p>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-900 mt-1">
              <span>{completedSteps} of {totalSteps} steps completed</span>
              <span>{totalSteps - completedSteps} remaining</span>
            </div>
          </div>
        </div>

        {/* Repair Steps */}
        <div className="space-y-2 mb-5">
          {repairSteps.map((step, index) => {
            const StatusIcon = statusConfig[step.status].icon;
            return (
              <div key={step.id} className={`bg-white/90 rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden ${statusConfig[step.status].bgColor}/30`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-900 mb-3">{step.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-700 mb-3 font-bold">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Est: {step.estimatedTime}min</span>
                          </div>
                          {step.actualTime && (
                            <div className="flex items-center space-x-1">
                              <span>Actual: {step.actualTime}min</span>
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
                      <div className={`px-3 py-1 rounded-lg text-sm font-medium border flex items-center space-x-1 ${statusConfig[step.status].color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusConfig[step.status].label}</span>
                      </div>
                      
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
                          >
                            <config.icon className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
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
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Step */}
        <div className="bg-white/90 rounded-xl shadow-lg border border-gray-200 p-4 mb-4 bg-gradient-to-r from-blue-200 to-indigo-400 text-white font-semibold rounded-lg hover:from-blue-300 hover:to-indigo-600 transition-all">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold text-gray-900">Add New Repair Step</h3>
            <button
              onClick={() => setShowAddStep(!showAddStep)}
              className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
            >
              {showAddStep ? <X className="w-5 h-5 text-blue-600" /> : <Plus className="w-7 h-7 text-blue-600" />}
            </button>
          </div>
          
          {showAddStep && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Step Title:</label>
                  <input
                    type="text"
                    value={newStep.title}
                    onChange={(e) => setNewStep(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter repair step title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Estimated Time (minutes):</label>
                  <input
                    type="number"
                    value={newStep.estimatedTime}
                    onChange={(e) => setNewStep(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 30 }))}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Description:</label>
                <textarea
                  value={newStep.description}
                  onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what needs to be done in this step"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddStep(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewStep}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                >
                  Add Step
                </button>
              </div>
            </div>
          )}
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