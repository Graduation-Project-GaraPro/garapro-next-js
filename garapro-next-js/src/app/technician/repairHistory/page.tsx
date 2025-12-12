"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaHistory,
  FaCar,
  FaPhone,
  FaUser,
  FaMoneyBill,
  FaTools,
  FaCog,
  FaExclamationTriangle,
  FaCalendar,
  FaIdCard,
  FaSearch,
  FaExclamationCircle,
  FaSort,
  FaSpinner,
  FaTimes,
  FaClipboardList,
  FaWrench, 
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft, 
  FaAngleDoubleRight
} from "react-icons/fa";
import { getMyRepairHistory} from "@/services/technician/repairHistoryService";

interface VehicleHistory {
  id: string;
  vehicle: string;
  owner: string;
  phone: string;
  email: string;
  licensePlate: string;
  repairCount: number;
  totalVehicleAmount: number;
  customerIssue: string;
  history: RepairEntry[];
}

interface RepairEntry {
  date: string;
  jobName: string;
  note: string;
  service: string;
  replacedParts: string;
  repairDescription: string;
  totalAmount: number;
  level: number;
}

export default function RepairHistory() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSorted, setIsSorted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [vehicleHistories, setVehicleHistories] = useState<VehicleHistory[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchRepairHistory();
  }, [currentPage, pageSize]);

  const fetchRepairHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowErrorModal(false);

      const data = await getMyRepairHistory();
      
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = data.slice(startIndex, endIndex);


      const transformedData: VehicleHistory[] = paginatedData.map((item) => ({
        id: item.vehicle.vehicleId,
        vehicle: `${item.vehicle.brand?.brandName || 'Unknown'} ${item.vehicle.model?.modelName || ''}`.trim(),
        owner: item.owner.fullName,
        phone: item.owner.phoneNumber || "N/A",
        email: item.owner.email || "N/A",
        licensePlate: item.vehicle.licensePlate,
        repairCount: item.repairCount,
        totalVehicleAmount: item.totalVehicleAmount,
        customerIssue: item.customerIssue || "No issues reported",        
        history: item.completedJobs.map((job) => ({
          date: job.deadline || new Date().toISOString(),
          jobName: job.jobName,
          note: job.note || "No additional notes",
          service: job.services.map(s => s.serviceName).join(", ") || "N/A",
          replacedParts: job.jobParts.map(p => `${p.partName} (x${p.quantity})`).join(", ") || "None",
          repairDescription: job.repairDescription || "No repair description",
          totalAmount: job.totalAmount,
          level: job.level
        }))
      }));

      setVehicleHistories(transformedData);
      
      setTotalCount(data.length);
      setTotalPages(Math.ceil(data.length / pageSize));
      setHasPreviousPage(currentPage > 1);
      setHasNextPage(currentPage < Math.ceil(data.length / pageSize));
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading repair history';
      setError(errorMessage);
      setShowErrorModal(true);
      
      if (errorMessage.includes("authentication") || errorMessage.includes("token")) {
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const sortByDate = (vehicles: VehicleHistory[]) => {
    return [...vehicles].sort((a, b) => {
      const latestDateA = a.history.length > 0 ? new Date(a.history[0].date) : new Date(0);
      const latestDateB = b.history.length > 0 ? new Date(b.history[0].date) : new Date(0);
      return latestDateB.getTime() - latestDateA.getTime();
    });
  };

  const sortHistoryByDate = (history: RepairEntry[]) => {
    return [...history].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

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
  const filteredVehicles = useMemo(() => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    const filtered = (isSorted ? sortByDate(vehicleHistories) : vehicleHistories)
      .filter(vehicle => 
        vehicle.vehicle.toLowerCase().includes(searchLower) ||
        vehicle.owner.toLowerCase().includes(searchLower) ||
        vehicle.licensePlate.toLowerCase().includes(searchLower)
      );

    return filtered;
  }, [vehicleHistories, isSorted, debouncedSearchTerm]);

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

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-200">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading repair history...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Error Modal */}
      {showErrorModal && error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Error</h3>
              </div>
              <button
                onClick={() => setShowErrorModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-6">{error}</p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  fetchRepairHistory();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

     <div className="bg-gradient-to-br from-blue-100 to-gray-200 p-4 md:p-6 rounded-lg shadow-md h-full flex flex-col">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-2 gap-4">
          {/* Header Section */}
          <div className="relative inline-block w-full md:w-auto">
            <div className="absolute inset-0 w-full bg-white/70 shadow-md rounded-lg"></div>
            <div className="relative flex items-center gap-2 px-4 md:px-6 py-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <FaHistory className="text-2xl md:text-3xl text-white" />
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-xl md:text-2xl lg:text-[29px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                  Repair History
                </h2>
                <p className="text-gray-700 italic text-sm md:text-base">
                  Select a vehicle to view its repair history.
                </p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="w-full md:px-12 md:flex-1">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search by vehicle, license plate or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 border-2 md:border-3 border-gray-300 rounded-full focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-blue-400 bg-white/80 text-sm md:text-base"
              />
            </div>
          </div>

          {/* Sort Button */}
          <button
            onClick={() => setIsSorted(!isSorted)}
            className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm md:text-base w-full md:w-auto justify-center"
          >
            <FaSort className="mr-2" />
            {isSorted ? "Unsort" : "Sort by Date"}
          </button>
        </div>

        <div className="px-4 md:px-8 max-h-[64vh] overflow-y-auto bg-white/30 rounded-2xl shadow-inner space-y-4 p-3 md:p-4">
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-4 md:p-6 hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.01] md:hover:scale-[1.02] hover:border-blue-300"
                onClick={() => openModal(vehicle)}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  {/* Vehicle Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/image9.png"
                      width={400}
                      height={256}
                      alt={vehicle.vehicle}
                      className="w-full md:w-38 h-32 md:h-27 object-cover rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                     <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2 flex items-center">
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
                        <FaIdCard className="mr-2 text-purple-500" />
                        {vehicle.licensePlate}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500 flex items-center justify-end mb-2">
                        <FaTools className="mr-2" />
                        {vehicle.repairCount} repair times
                      </p>
                      
                     <p className="text-base md:text-[18px] font-bold text-green-600 flex items-center justify-end">
                        <FaMoneyBill className="mr-1" />
                        {vehicle.totalVehicleAmount.toLocaleString()} VND
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-6 bg-white rounded-xl shadow-md text-center max-w-md mx-auto">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <FaExclamationCircle className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No vehicles found
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                No vehicles match your search criteria &quot;
                <span className="font-medium">{searchTerm}</span>
                &quot;
              </p>
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-bold"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="sticky bottom-0 left-0 right-0 mt-4 flex flex-col md:flex-row items-center justify-between bg-white/80 backdrop-blur-md rounded-xl px-4 md:px-6 py-3 shadow-md border-t border-gray-300 z-10 gap-3 md:gap-0">
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
                <FaAngleDoubleLeft className="w-4 h-4" />
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
                <FaChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && handlePageChange(page)}
                    disabled={page === "..."}
                    className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
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
                <FaChevronRight className="w-4 h-4" />
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
                <FaAngleDoubleRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedVehicle && (
        <div
        className="fixed inset-0 flex items-start md:items-center justify-center p-2 md:p-4 bg-black/40 bg-opacity-50 backdrop-blur-sm"
        style={{ zIndex: 9999 }}
      >
        <div className="bg-white rounded-xl md:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden my-4 md:my-0">
            <div className="bg-[url('/images/image20.jpg')] bg-cover bg-no-repeat p-4 md:p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                 <h2 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center mb-1">
                    <FaHistory className="mr-3" />
                    {selectedVehicle.vehicle}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-blue-100">
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
                      <FaTools className="mr-2" />
                      <strong>Repairs:</strong>
                      <span className="ml-2">{selectedVehicle.repairCount} times</span>
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

            <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
              {selectedVehicle.history.length > 0 ? (
                <>
                  {/* Common Issue Section */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-3 mb-4 border-2 border-red-200 shadow-sm">
                   <h3 className="text-base md:text-[18px] font-bold text-gray-800 mb-2 flex items-center">
                      <FaExclamationTriangle className="mr-2 text-red-600" />
                      Customer Reported Issues
                    </h3>
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                      <p className="text-gray-600 leading-relaxed">{selectedVehicle.customerIssue}</p>
                    </div>
                  </div>

                  {/* Jobs History */}
                 <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaTools className="mr-2 text-orange-600" />
                    Completed Jobs
                  </h3>
                  <div className="space-y-6">
                    {sortHistoryByDate(selectedVehicle.history).map((entry, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        {/* Header with Date */}
                        <h4 className="font-bold text-base md:text-lg text-gray-800 mb-4 flex items-center border-b pb-3 border-gray-300">
                          <FaCalendar className="mr-2 text-blue-500" />
                          {new Date(entry.date).toLocaleDateString("en-US")}
                        </h4>

                        {/* Two Columns Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4">
                          {/* Column 1: Job Name, Service, Spare parts */}
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <FaWrench className="mr-2 text-purple-500 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <strong className="text-gray-700">Job Name:</strong>
                                <p className="text-gray-600">{entry.jobName}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <FaCog className="mr-2 text-green-500 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <strong className="text-gray-700">Service:</strong>
                                <p className="text-gray-600">{entry.service}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <FaTools className="mr-2 text-orange-500 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <strong className="text-gray-700">Spare parts:</strong>
                                <p className="text-gray-600">{entry.replacedParts}</p>
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Total Amount, Priority, Job Notes */}
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <FaMoneyBill className="mr-2 text-green-600 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <strong className="text-gray-700">Total Amount:</strong>
                                <p className="text-gray-600 font-semibold">{entry.totalAmount.toLocaleString()} VND</p>
                              </div>
                            </div>                            
                            <div className="flex items-start">
                              <FaClipboardList className="mr-2 text-blue-500 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <strong className="text-gray-700">Job Notes:</strong>
                                <p className="text-gray-600">{entry.note}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Full Width: Repair Description */}
                       <div className="bg-white p-3 md:p-4 rounded-lg border border-indigo-200 mt-4">
                          <strong className="text-gray-700 block mb-2 flex items-center">
                            <FaFileAlt className="mr-2 text-indigo-500" />
                            Repair Description:
                          </strong>
                          <p className="text-gray-600 leading-relaxed">
                            {entry.repairDescription}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">
                    There is no repair history for this vehicle.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 md:px-6 py-4 flex justify-end border-t border-gray-200 rounded-b-xl md:rounded-b-3xl">
              <button
                onClick={closeModal}
                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg md:rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
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