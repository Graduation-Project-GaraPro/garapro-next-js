"use client";

import { useState } from "react";
import {
  FaHistory,
  FaCar,
  FaPhone,
  FaUser,
  FaDollarSign,
  FaTools,
  FaCog,
  FaExclamationTriangle,
  FaCalendar,
  FaIdCard,
  FaStar,
  FaSearch
} from "react-icons/fa";

type TaskPriority = "high" | "medium" | "low";

interface RepairEntry {
  date: string;
  service: string;
  replacedParts: string;
  issues: string;
  description: string;
}

interface VehicleHistory {
  id: number;
  vehicle: string;
  owner: string;
  price: string;
  phone: string;
  priority: TaskPriority;
  licensePlate: string,
  history: RepairEntry[];
}

export default function RepairHistory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleHistory | null>(
    null
  );
 const [searchTerm, setSearchTerm] = useState("");

  const vehicleHistories: VehicleHistory[] = [
    {
      id: 1,
      vehicle: "Porsche 911",
      owner: "John Smith",
      price: "10,100,000 VND",
      phone: "+84 901 234 567",
      priority: "high",
      licensePlate: "30A-12345",
      history: [
        {
          date: "2025-08-15",
          service: "Engine Tune-Up",
          replacedParts: "Spark Plugs, Air Filter",
          issues: "Overheating during high speed",
          description:
            "Xe có tiếng kêu bất thường từ động cơ, đèn check engine bật sáng. Khách hàng phản ánh xe giật cục khi tăng tốc và nhiệt độ động cơ tăng cao bất thường khi chạy tốc độ cao.",
        },
        {
          date: "2025-07-20",
          service: "Brake System Overhaul",
          replacedParts: "Brake Pads, Rotors",
          issues: "Squeaking noise, reduced braking efficiency",
          description:
            "Hệ thống phanh có tiếng kêu và hiệu quả phanh giảm. Đã thay má phanh và đĩa phanh mới. Kiểm tra và bảo dưỡng toàn bộ hệ thống phanh.",
        },
      ],
    },
    {
      id: 2,
      vehicle: "Toyota Camry 2020",
      owner: "Jane Doe",
      price: "2,350,000 VND",
      phone: "+84 912 345 678",
      priority: "medium",
      licensePlate: "30A-12345",
      history: [
        {
          date: "2025-06-10",
          service: "Oil Change & Filter",
          replacedParts: "Engine Oil, Oil Filter",
          issues: "None reported",
          description:
            "Bảo dưỡng định kỳ thay dầu máy và lọc dầu. Xe hoạt động bình thường, không có vấn đề gì đặc biệt. Đã kiểm tra các hệ thống cơ bản.",
        },
      ],
    },
    {
      id: 3,
      vehicle: "Ford F-150 2021",
      owner: "Mike Johnson",
      price: "8,180,000 VND",
      phone: "+84 923 456 789",
      priority: "low",
      licensePlate: "30A-12345",
      history: [
        {
          date: "2025-05-05",
          service: "Tire Rotation and Alignment",
          replacedParts: "None",
          issues: "Uneven tire wear, vibration at high speeds",
          description:
            "Lốp xe bị mòn không đều và có rung lắc khi chạy tốc độ cao. Đã thực hiện cân chỉnh bánh xe và xoay vị trí lốp để đảm bảo độ bền và an toàn.",
        },
      ],
    },
    {
      id: 3,
      vehicle: "Ford F-150 2021",
      owner: "Mike Johnson",
      price: "8,180,000 VND",
      phone: "+84 923 456 789",
      priority: "low",
      licensePlate: "30A-12345",
      history: [
        {
          date: "2025-05-05",
          service: "Tire Rotation and Alignment",
          replacedParts: "None",
          issues: "Uneven tire wear, vibration at high speeds",
          description:
            "Lốp xe bị mòn không đều và có rung lắc khi chạy tốc độ cao. Đã thực hiện cân chỉnh bánh xe và xoay vị trí lốp để đảm bảo độ bền và an toàn.",
        },
      ],
    },
  ];

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityText = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Undetermined";
    }
  };

  const openModal = (vehicle: VehicleHistory) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
    document.body.style.overflow = "unset";
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-100 to-gray-200 p-6 rounded-lg shadow-md h-full flex flex-col"> 
        <div className="flex items-center justify-between mb-2 gap-4">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
          <div className="relative flex items-center gap-2 px-6 py-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <FaHistory className="text-3xl text-white" />
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-[29px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                Repair History
              </h2>
              <p className="text-gray-700 italic">
                Select a vehicle to view its repair history.
              </p>
            </div>
          </div>          
        </div>
        <div className="px-12 mb-4 flex-1">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
        {/* <div className="space-y-4 px-8 max-h-[65vh] overflow-y-auto rounded-xl rounded-scroll"> */}
        <div className="px-8 max-h-[64vh] overflow-y-auto bg-white/30 rounded-2xl shadow-inner space-y-4 p-4 rounded-scroll">
          {vehicleHistories
          .filter(
            (vehicle) =>
              vehicle.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
              vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (vehicle.licensePlate &&
                vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 w-280 hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-blue-300"
              onClick={() => openModal(vehicle)}
            >
              <div className="flex items-start space-x-4">
                {/* Vehicle Image */}
                <div className="flex-shrink-0">
                  <img
                    src="/images/image9.png"
                    alt={vehicle.vehicle}
                    className="w-38 h-27 object-cover rounded-lg shadow-sm"
                  />
                </div>

                {/* Vehicle Info */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-2 flex items-center">
                      <FaCar className="mr-2 text-blue-500" />
                      {vehicle.vehicle}
                    </h3>
                    <p className="text-gray-600 flex items-center mb-1">
                      <FaUser className="mr-2 text-green-500" />
                      {vehicle.owner}
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <FaPhone className="mr-2 text-orange-500" />
                      {vehicle.phone}
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <FaIdCard className="mr-2 text-orange-500" />
                      {vehicle.licensePlate}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="mb-3">
                      <span
                        className={`px-4 py-2 text-sm font-semibold rounded-full border ${getPriorityColor(
                          vehicle.priority
                        )}`}
                      >
                        {getPriorityText(vehicle.priority)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-bold text-lg text-green-600 flex items-center justify-end">
                        <FaDollarSign className="mr-1" />
                        {vehicle.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center justify-end">
                      <FaTools className="mr-2" />
                      {vehicle.history.length} repair times.
                    </p>
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
          className="fixed inset-0 flex items-center justify-center px-70 bg-white/40 bg-opacity-50 backdrop-blur-sm"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
           <div className="bg-[url('/images/image20.jpg')] bg-cover bg-no-repeat p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold flex items-center mb-1">
                    <FaHistory className="mr-3" />
                    {selectedVehicle.vehicle}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-blue-100">
                    <p className="bg-black/60 flex items-center rounded-xl p-1">
                      <FaUser className="mr-2" />
                      <strong>Owner:</strong>
                      <span className="ml-2">{selectedVehicle.owner}</span>
                    </p>
                    <p className="bg-black/60 flex items-center rounded-xl p-1">
                      <FaPhone className="mr-2" />
                      <strong>Phone:</strong>
                      <span className="ml-2">{selectedVehicle.phone}</span>
                    </p>
                    <p className="bg-black/60 flex items-center rounded-xl p-1">
                      <FaDollarSign className="mr-2" />
                      <strong>Price:</strong>
                      <span className="ml-2">{selectedVehicle.price}</span>
                    </p>
                     <p className="bg-black/60 flex items-center rounded-xl p-1">
                      <FaIdCard className="mr-2" />
                      <strong>License Plate:</strong>
                      <span className="ml-2">{selectedVehicle.licensePlate}</span>
                    </p>            
                  </div>
                   
                </div>
                <button
                  onClick={closeModal}
                  className="bg-gray-700 text-white hover:text-gray-200 transition-colors p-3 rounded-full hover:bg-white hover:bg-opacity-20 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
              {selectedVehicle.history.length > 0 ? (
                <div className="space-y-6">
                  {selectedVehicle.history.map((entry, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold text-lg text-gray-800 mb-2 flex items-center">
                            <FaCalendar className="mr-2 text-blue-500" />
                            {new Date(entry.date).toLocaleDateString("vi-VN")}
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <FaCog className="mr-2 text-green-500 mt-1" />
                              <div>
                                <strong className="text-gray-700">
                                  Service:
                                </strong>
                                <p className="text-gray-600">{entry.service}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <FaTools className="mr-2 text-orange-500 mt-1" />
                              <div>
                                <strong className="text-gray-700">
                                  Spare parts:
                                </strong>
                                <p className="text-gray-600">
                                  {entry.replacedParts}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <FaStar className="mr-2 text-orange-500 mt-1" />
                              <div>
                                <strong className="text-gray-700">
                                  Priority:
                                </strong>
                               <p className="flex items-center">
                              <span
                                  className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(
                                  selectedVehicle.priority
                                )} text-gray-800`}
                              >
                                {getPriorityText(selectedVehicle.priority)}
                              </span>
                            </p>
                              </div>
                            </div>                     

                          </div>
                        </div>

                        <div>
                          <div className="mb-4">
                            <div className="flex items-start">
                              <FaExclamationTriangle className="mr-2 text-red-500 mt-1" />
                              <div>
                                <strong className="text-gray-700">
                                  Issues:
                                </strong>
                                <p className="text-gray-600">{entry.issues}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <strong className="text-gray-700 block mb-2">
                              Detailed description:
                            </strong>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <p className="text-gray-600 leading-relaxed">
                                {entry.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">
                    There is no repair history for this vehicle.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200 rounded-b-3xl">
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
