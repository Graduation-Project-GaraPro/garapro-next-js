"use client";

import { useState, useEffect } from "react";
import { FaTools, FaCar, FaArrowLeft, FaCheck } from "react-icons/fa";

interface Vehicle {
  id: number;
  vehicle: string;
  licensePlate: string;
  customer: string;
  assignedDate: string;
  status: string;
}

export default function ConditionInspection() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [repairProgress, setRepairProgress] = useState(50); // Thêm state cho tiến độ sửa chữa
  const [repairNotes, setRepairNotes] = useState(""); // Thêm state cho ghi chú sửa chữa
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Danh sách xe được giao
  const assignedVehicles = [
    {
      id: 1,
      vehicle: "Toyota Camry 2020",
      licensePlate: "29A-123.45",
      customer: "John Smith",
      assignedDate: "2024-08-28",
      status: "Pending Inspection"
    },
    {
      id: 2,
      vehicle: "Honda Civic 2019",
      licensePlate: "30B-678.90",
      customer: "Jane Doe",
      assignedDate: "2024-08-28",
      status: "Pending Inspection"
    },
    {
      id: 3,
      vehicle: "Ford F-150 2021",
      licensePlate: "31C-111.22",
      customer: "Mike Johnson",
      assignedDate: "2024-08-27",
      status: "Inspection Complete"
    }
  ];

  const images = [
    "/images/image6.png",
    "/images/image7.png"
  ];

  const handleSaveInspection = () => {
    if (!selectedVehicle) return;
    alert(`Inspection report saved for ${selectedVehicle.vehicle}`);
    setSelectedVehicle(null);
    setInspectionNotes("");
  };

  // Màn hình danh sách xe
  if (!selectedVehicle) { 
    return (
      <div className="flex gap-6">
        {/* Vehicle List - Left Side */}
        <div className="bg-gray-200 p-5 rounded-lg shadow-md flex-1">
          <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gray-300 shadow-md rounded-lg clip-diagonal"></div>

        <div className="relative flex items-center gap-2 px-6 py-3">
          <h2 className="text-[29px] font-bold flex items-center text-gray-800 text-center italic font-serif">
            <FaTools className="mr-3 text-gray-600" />
              Vehicle Condition Inspection
          </h2>
        </div>
    </div>
          <p className="text-gray-400 mb-2 font-bold italic">Select a vehicle to perform initial condition inspection</p>

          <div className="space-y-4">
            {assignedVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="border border-gray-200 rounded-lg p-4 relative bg-[url('/images/image8.png')] bg-cover bg-no-repeat before:absolute before:inset-0 before:bg-black before:opacity-50 before:rounded-lg"
                onClick={() => vehicle.status === "Pending Inspection" && setSelectedVehicle(vehicle)}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <FaCar className="text-2xl text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-lg text-white">{vehicle.vehicle}</h3>
                        <p className="text-gray-200">Customer: {vehicle.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 text-sm rounded ${
                          vehicle.status === "Inspection Complete"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                      {vehicle.status === "Inspection Complete" && (
                        <FaCheck className="text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3">
                    {vehicle.status === "Pending Inspection" ? (
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-400 to-teal-400 text-white font-bold rounded hover:from-blue-600 hover:to-teal-600 transition duration-300">
                        Start Inspection
                      </button>
                    ) : (
                      <button 
                        className="px-4 py-2 bg-gradient-to-r from-gray-400 to-teal-50 text-gray-700 font-bold rounded hover:from-gray-600 hover:to-teal-100 transition duration-300"
                        onClick={() => setSelectedVehicle(vehicle)}
                      >
                        View Inspection
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Slideshow - Right Side */}
        <div className="w-90 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-full">
            <img
              src={images[currentImageIndex]}
              alt={`Vehicle ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-1000"
              onError={(e) => {
                e.currentTarget.src = `https://via.placeholder.com/320x400/3B82F6/FFFFFF?text=Vehicle+${currentImageIndex + 1}`;
              }}
            />

            <div className="absolute top-130 left-2 z-20">
          <h2 className="text-xl font-semibold text-white italic font-serif leading-tight">
            <div>Professional</div>
            <div className="ml-10">Vehicle</div>
            <div className="ml-20">Inspection</div>
          </h2>
        </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          
          </div>
        </div>
      </div>
    );
  }

// Màn hình kiểm tra tình trạng xe
return (
  <div className="bg-white p-2 rounded-lg shadow-md">
    {/* Header với back button và title */}
    <div className="relative inline-block mb-6">
      <div className="absolute inset-0 w-full max-w-md bg-gray-300 shadow-md rounded-lg clip-diagonal"></div>
      <div className="relative flex items-center gap-2 px-4 py-1">
        <h2 className="text-[20px] font-bold flex items-center text-gray-800 text-center italic font-serif">
          <button
            onClick={() => setSelectedVehicle(null)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800">
            <FaArrowLeft className="text-xl" />
          </button>
          {selectedVehicle?.vehicle || 'Unknown Vehicle'}
        </h2>
      </div>
    </div>

    {/* Main Content - 2 Containers */}
    <div className="grid grid-cols-2 gap-8">
      {/* Container 1 - Repair Progress */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Repair Progress</h3>
        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-medium text-gray-800">Overall Progress</span>
            <span className="text-base font-bold text-blue-600">{repairProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${repairProgress}%` }}
            ></div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={repairProgress}
            onChange={(e) => setRepairProgress(parseInt(e.target.value))}
            className="w-full mt-3"
          />
        </div>

        {/* Notes Logging */}
        <div className="mb-6">
          <h4 className="text-base font-semibold mb-2 text-gray-600">Notes Logging</h4>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 text-sm"
            rows={12}
            value={repairNotes}
            onChange={(e) => setRepairNotes(e.target.value)}
            placeholder="Enter detailed repair notes, steps completed, issues encountered..."
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="w-70 py-3 bg-gradient-to-r from-blue-400 to-teal-400 text-white font-bold rounded hover:from-blue-600 hover:to-teal-600 transition duration-300"
           onClick={() => {
              setRepairProgress(100);
              alert(`Repair completed for ${selectedVehicle?.vehicle}`);
            }}>          
            Completed
          </button>
          <button className="w-70 bg-gradient-to-r from-gray-600 to-teal-200 text-gray-700 font-bold rounded hover:from-gray-600 hover:to-teal-100 transition duration-300" onClick={() => {
              setRepairProgress(100);
              alert(`Repair completed for ${selectedVehicle?.vehicle}`);
            }}> 
            Update Progress
          </button>
        </div>
      </div>

      {/* Container 2 - Inspection Notes */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Inspection Notes</h3>

        <div className="mb-6">
          <div className="flex justify-end mb-2 relative">
            <div 
              className="bg-gray-50 border-2 border-gray-300 p-4 rounded-lg w-146 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setShowVehicleDetails(!showVehicleDetails)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-600">Vehicle Information</h3>
                <span className="text-gray-600 text-sm">
                  {showVehicleDetails ? '▼' : '▶'}
                </span>
              </div>
              <div className="text-sm text-gray-700 space-y-1 mt-2">
                <p><strong>Vehicle:</strong> {selectedVehicle?.vehicle}</p>
                <p><strong>Customer:</strong> {selectedVehicle?.customer}</p>
              </div>
            </div>
            
            {/* Dropdown với thông tin đầy đủ */}
            {showVehicleDetails && (
              <div className="absolute top-full right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg w-146 z-10">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-600 mb-3 border-b border-gray-300 pb-2">
                    Complete Vehicle Information
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Vehicle Model:</p>
                      <p className="text-gray-800">{selectedVehicle?.vehicle || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">License Plate:</p>
                      <p className="text-gray-800">{selectedVehicle?.licensePlate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Customer Name:</p>
                      <p className="text-gray-800">{selectedVehicle?.customer || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Assigned Date:</p>
                      <p className="text-gray-800">{selectedVehicle?.assignedDate || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => setShowVehicleDetails(false)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={10}
          placeholder="Enter detailed inspection notes, observations, and any issues found..."
          value={inspectionNotes}
          onChange={(e) => setInspectionNotes(e.target.value)}
        />
         <div className="flex space-x-2">
          <button className="w-70 py-3 bg-gradient-to-r from-blue-400 to-teal-400 text-white font-bold rounded hover:from-blue-600 hover:to-teal-600 transition duration-300"
           onClick={handleSaveInspection}
           >          
           Save Inspection Report
          </button>
          <button className="w-70 bg-gradient-to-r from-gray-600 to-teal-200 text-gray-700 font-bold rounded hover:from-gray-600 hover:to-teal-100 transition duration-300"
          onClick={() => setSelectedVehicle(null)}
          > 
            Save Draft & Return
          </button>
          </div>
      </div>
    </div>
  </div>
);
}