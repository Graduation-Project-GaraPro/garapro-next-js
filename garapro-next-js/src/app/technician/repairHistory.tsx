"use client";

import { useState } from "react";
import { FaSearch,FaHistory} from "react-icons/fa";
interface RepairEntry {
  date: string;
  service: string;
  replacedParts: string;
  issues: string;
}

interface VehicleHistory {
  id: number;
  vehicle: string;
  owner: string;
  price: string;
  history: RepairEntry[];
}

export default function RepairHistory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleHistory | null>(null);

  // Dữ liệu cứng cho list xe và lịch sử sửa chữa
  const vehicleHistories: VehicleHistory[] = [
    {
      id: 1,
      vehicle: "Porsche 911",
      owner: "John Smith",
      price:"10.100.000 VND",
      history: [
        {
          date: "2025-08-15",
          service: "Engine Tune-Up",
          replacedParts: "Spark Plugs, Air Filter",
          issues: "Overheating during high speed Spark Plugs, Air Filter Spark Plugs, Air Filter Spark Plugs, Air Filter Spark Plugs, Air Filter Spark Plugs, Air Filter",
        },
        {
          date: "2025-07-20",
          service: "Brake System Overhaul",
          replacedParts: "Brake Pads, Rotors",
          issues: "Squeaking noise, reduced braking efficiency",
        },
      ],
    },
    {
      id: 2,
      vehicle: "Toyota Camry 2020",
      owner: "Jane Doe",
       price:"2.350.000 VND",
      history: [
        {
          date: "2025-06-10",
          service: "Oil Change",
          replacedParts: "Engine Oil, Oil Filter",
          issues: "None reported",
        },
      ],
    },
    {
      id: 3,
      vehicle: "Ford F-150 2021",
      owner: "Mike Johnson",
       price:"8.180.000 VND",
      history: [
        {
          date: "2025-05-05",
          service: "Tire Rotation and Alignment",
          replacedParts: "None",
          issues: "Uneven tire wear, vibration at high speeds",
        },
      ],
    },
    
  ];

  const openModal = (vehicle: VehicleHistory) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
    // Restore body scroll when modal is closed
    document.body.style.overflow = 'unset';
  };
  

  return (
    <>
      <div className="bg-gray p-6 rounded-lg shadow-md h-full flex flex-col">
        <div className="relative inline-block mb-6">
              <div className="absolute inset-0 w-full max-w-md bg-gray-300 shadow-md rounded-lg clip-diagonal"></div>
              <div className="relative flex items-center gap-2 px-6 py-3">
                <h2 className="text-[29px] font-bold flex items-center text-gray-800 text-center italic font-serif">
                 <FaHistory className="mr-3 text-gray-600" />
                   Repair History
                </h2>
              </div>
            </div>
        <div className="space-y-4 px-8">
          <p className="text-gray-600">
            Select a vehicle to view its repair history.
          </p>
          {vehicleHistories.map((vehicle) => (
            <div
              key={vehicle.id}
              className="border-2 border-gray-300 rounded-lg p-4 hover:bg-gray-300 cursor-pointer transition-colors"
              onClick={() => openModal(vehicle)}
            >
             <div className="flex items-start space-x-4">
                {/* Vehicle Image */}
                <div className="flex-shrink-0">
                  <img
                    src="images/image9.png"
                    alt={vehicle.vehicle}
                    className="w-38 h-27 object-cover rounded-lg shadow-sm"
                  />
                </div>
                
                {/* Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-800 truncate">{vehicle.vehicle}</h3>
                  <p className="text-gray-600 text-sm">Owner: {vehicle.owner}</p>
                  <p className="text-sm text-gray-500">Repairs: {vehicle.history.length}</p>
                  <div className="flex space-x-2  absolute left-300">
                    <span className="font-bold italic text-black">Price:</span>
                    <span className="px-3 py-1 text-sm rounded bg-green-200 text-green-800">
                     {vehicle.price}
                    </span>
                  </div>
                </div>
              </div>
            
            </div>
          ))}
        </div>
      </div>

      {/* Modal - No backdrop, just overlay on existing page */}
      {isModalOpen && selectedVehicle && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none bg-white/80 shadow-lg"
          style={{ zIndex: 9999 }}
        >
          <div 
            className="bg-gray-300 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto"
          >
            {/* Modal Header */}
            <div className="border border-gray-200 rounded-lg p-4 relative bg-[url('/images/image10.png')] bg-cover bg-no-repeat before:absolute before:inset-0 before:rounded-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <FaHistory className="mr-3 text-white" />
                  Repair History - {selectedVehicle.vehicle}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                </button>
              </div>
              <p className="mt-2 text-blue-100">
                <strong>Owner:</strong> {selectedVehicle.owner}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] border-2 border-gray-400 rounded-xl">
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold italic text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold italic text-gray-600 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-bold italic text-gray-600 uppercase tracking-wider">Replaced Parts</th>
                      <th className="px-6 py-3 text-left text-xs font-bold italic text-gray-600 uppercase tracking-wider">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedVehicle.history.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.service}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.replacedParts}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{entry.issues}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {selectedVehicle.history.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No repair history found for this vehicle.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-xl">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}