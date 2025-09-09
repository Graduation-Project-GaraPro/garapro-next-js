"use client";
import { useState } from "react";
import { FaCar, FaSearch } from "react-icons/fa";

export default function VehicleInformation() {
  const [vehicleSearch, setVehicleSearch] = useState("");

  // Dữ liệu mẫu cho 2 xe
  const vehicleData = [
    {
      id: 1,
      make: "Toyota",
      model: "Camry",
      year: 2020,
      vin: "1HGBH41JXMN109186",
      licensePlate: "30A-12345",
      engine: "2.5L 4-Cylinder",
      mileage: "45,000 miles",
      lastService: "March 2024",
      owner: "Nguyễn Văn A",
      color: "White"
    },
    {
      id: 2,
      make: "Honda",
      model: "Civic",
      year: 2022,
      vin: "2HGFC2F59NH123456",
      licensePlate: "29B-67890",
      engine: "1.5L Turbo 4-Cylinder",
      mileage: "22,000 miles",
      lastService: "August 2024",
      owner: "Trần Thị B",
      color: "Blue"
    }
  ];

  // Hàm tìm kiếm xe
  const getFilteredVehicles = () => {
    if (!vehicleSearch.trim()) {
      return vehicleData; // Hiển thị tất cả xe nếu không có từ khóa tìm kiếm
    }
    
    const searchTerm = vehicleSearch.toLowerCase().trim();
    return vehicleData.filter(vehicle => 
      vehicle.make.toLowerCase().includes(searchTerm) ||
      vehicle.model.toLowerCase().includes(searchTerm) ||
      vehicle.vin.toLowerCase().includes(searchTerm) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm) ||
      vehicle.owner.toLowerCase().includes(searchTerm) ||
      `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm)
    );
  };

  const filteredVehicles = getFilteredVehicles();

  return (
    <div className="bg-white px-6 py-3 rounded-lg shadow-md h-full flex flex-col">      
      <div className="relative inline-block mb-6">
            <div className="absolute inset-0 w-full max-w-md bg-gray-300 shadow-md rounded-lg clip-diagonal"></div>
            <div className="relative flex items-center gap-2 px-6 py-3">
              <h2 className="text-[25px] font-bold flex items-center text-gray-800 text-center italic font-serif">
                <FaCar className="mr-3 text-gray-600" />
                 Vehicle Information Lookup
              </h2>
            </div>
        </div>
      <div className="space-y-6">
        <div className="flex space-x-4 text-gray-700">
          <input
            type="text"
            placeholder="Enter vehicle name, VIN, license plate or owner name to search..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={vehicleSearch}
            onChange={(e) => setVehicleSearch(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            <FaSearch />
          </button>
        </div>

        {/* Hiển thị kết quả */}
        <div className="space-y-3">
          {filteredVehicles.length > 0 ? (
            <>
              <div className="text-sm text-gray-600 mb-1">
                Found {filteredVehicles.length} cars {vehicleSearch.trim() ? `cho "${vehicleSearch}"` : ''}
              </div>
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="border-2 border-gray-300 rounded-lg p-5 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.color}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                    <div className="space-y-2">
                      <p><strong>Hãng xe:</strong> {vehicle.make}</p>
                      <p><strong>Mẫu xe:</strong> {vehicle.model}</p>
                      <p><strong>Năm sản xuất:</strong> {vehicle.year}</p>
                      <p><strong>VIN:</strong> {vehicle.vin}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>Biển số:</strong> {vehicle.licensePlate}</p>
                      <p><strong>Số km đã đi:</strong> {vehicle.mileage}</p>
                      <p><strong>Bảo dưỡng cuối:</strong> {vehicle.lastService}</p>
                      <p><strong>Chủ sở hữu:</strong> {vehicle.owner}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="border-2 border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-500">No vehicles found for &quot;{vehicleSearch}&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}