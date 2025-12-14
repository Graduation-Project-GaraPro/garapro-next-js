/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/services/manager/api-client";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  User, 
  Car, 
  Clock,
  CheckCircle,
  UserCheck,
  Wrench,
  Truck,
  XIcon,
  HelpCircle
} from "lucide-react";

type EmergencyRequest = {
  emergencyRequestId: string;
  branch?: { branchName?: string } | null;
  customer?: any;
  vehicle?: any;
  issueDescription?: string;
  address?: string | null;
  status?: number | string;
  distanceToGarageKm?: number | null;
  requestTime?: string | null;
  branchId?: string;
  [k: string]: any;
};

// ===== STATUS HELPERS =====
function normalizeStatusToNumber(status?: number | string | null): number {
  if (typeof status === 'number') return status;
  if (typeof status === 'string') {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'assigned': return 2;
      case 'in progress':
      case 'inprogress': return 3;
      case 'towing': return 4;
      case 'completed': return 5;
      case 'canceled':
      case 'cancelled': return 6;
      default: return -1; // Unknown
    }
  }
  return 0; // Default to pending for null/undefined
}

function statusLabel(status?: number | string | null) {
  // Handle both string and numeric status values
  const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
  
  switch (normalizedStatus) {
    case 0:
    case 'pending':
      return { text: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock };
    case 1:
    case 'accepted':
      return { text: "Accepted", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle };
    case 2:
    case 'assigned':
      return { text: "Assigned", color: "bg-purple-100 text-purple-800 border-purple-200", icon: UserCheck };
    case 3:
    case 'in progress':
    case 'inprogress':
      return { text: "In Progress", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Wrench };
    case 4:
    case 'towing':
      return { text: "Towing", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Truck };
    case 5:
    case 'completed':
      return { text: "Completed", color: "bg-gray-100 text-gray-800 border-gray-200", icon: CheckCircle };
    case 6:
    case 'canceled':
    case 'cancelled':
      return { text: "Canceled", color: "bg-red-100 text-red-800 border-red-200", icon: XIcon };
    default:
      return { text: "Unknown", color: "bg-gray-100 text-gray-800 border-gray-200", icon: HelpCircle };
  }
}

export default function EmergencyList() {
  const [data, setData] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(
    null
  );
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [detailData, setDetailData] = useState<EmergencyRequest | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

  // ===== LOAD EMERGENCY REQUESTS =====
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/EmergencyRequest/getAll`, {
          cache: "no-store",
        });

        const json = (await res.json()) as EmergencyRequest[];
        setData(json);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load emergency requests.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [apiBase]);

  // ===== LOAD TECHNICIANS =====
  const loadTechnicians = async (branchId?: string) => {
    if (!branchId) {
      setTechnicians([]);
      return;
    }

    try {
      const res = await apiClient.get(`/Branch/${branchId}/technicians`);

      if (res.success) {
        const json = res.data as any[];
        setTechnicians(json);
      } else {
        console.error("Failed to load technicians");
        setTechnicians([]);
        toast.error("Failed to load technicians.");
      }
    } catch (err) {
      console.error(err);
      setTechnicians([]);
      toast.error("Failed to load technicians.");
    }
  };

  // ===== ACCEPT REQUEST =====
  const handleAccept = async (emergencyId: string) => {
    setProcessingId(emergencyId);

    try {
      // Replace endpoint with your actual API path if different
      const response = await apiClient.post(
        `/EmergencyRequest/approve/${emergencyId}`
      );

      if (response.success) {
        // optimistic update: update local data statuses
        setData((prev) =>
          prev.map((r) =>
            r.emergencyRequestId === emergencyId ? { ...r, status: 1 } : r
          )
        );
        toast.success("Request accepted");
      } else {
        console.error(response);
        toast.error("Failed to accept request");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while accepting the request");
    } finally {
      setProcessingId(null);
      // refresh full list to ensure consistency
      try {
        const updated = await apiClient.get(`/EmergencyRequest/getAll`);
        setData(updated.data as EmergencyRequest[]);
      } catch (err) {
        // ignore
      }
    }
  };

  // ===== CANCEL REQUEST =====
  const handleCancel = async (emergencyId: string) => {
    setProcessingId(emergencyId);

    try {
      // Replace endpoint with your actual API path if different
      const response = await apiClient.put(
        `/EmergencyRequest/reject/${emergencyId}`
      );

      if (response.success) {
        // optimistic update: set status to canceled (6)
        setData((prev) =>
          prev.map((r) =>
            r.emergencyRequestId === emergencyId ? { ...r, status: 6 } : r
          )
        );
        toast.success("Request canceled");
      } else {
        console.error(response);
        toast.error("Failed to cancel request");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while canceling the request");
    } finally {
      setProcessingId(null);
      // refresh full list to ensure consistency
      try {
        const updated = await apiClient.get(`/EmergencyRequest/getAll`);
        setData(updated.data as EmergencyRequest[]);
      } catch (err) {
        // ignore
      }
    }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      const res = await apiClient.get(`/EmergencyRequest/${id}`);

      if (res.success) {
        setDetailData(res.data as EmergencyRequest);
        setOpenDetailModal(true);
      } else {
        toast.error("Failed to load details");
      }
    } catch {
      toast.error("Failed to load details");
    }
  };

  // ===== ASSIGN TECHNICIAN =====
  const handleAssignTech = async () => {
    if (!selectedTech || !selectedEmergencyId) return;

    try {
      const response = await apiClient.post(`/EmergencyRequest/assign-tech`, {
        emergencyId: selectedEmergencyId,
        technicianUserId: selectedTech,
      });

      if (response.success) {
        toast.success("Technician assigned");
        setOpenAssignModal(false);
        setSelectedTech(null);

        const updated = await apiClient.get(`/EmergencyRequest/getAll`);
        setData(updated.data as EmergencyRequest[]);
      } else {
        toast.error("Assign failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while assigning the technician");
    }
  };

  // ========== UI ==========
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency Requests</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">

        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <div className="border border-dashed rounded p-6 text-gray-500 text-center">
            No emergency requests found.
          </div>
        ) : (
          <ul className="space-y-4">
            {data.map((r) => {
              const s = statusLabel(r.status);
              const statusNum = normalizeStatusToNumber(r.status);

              const allowAccept = statusNum === 0;
              const allowCancel = [0, 1].includes(statusNum);
              const allowAssign = statusNum === 1;
              const isProcessing = processingId === r.emergencyRequestId;

              return (
                <li
                  key={r.emergencyRequestId}
                  className="bg-white shadow-sm rounded-lg p-4 flex gap-4 hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-sm font-medium text-gray-900">
                            {r.branch?.branchName ?? "—"}
                          </h2>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${s.color}`}
                          >
                            {s.text}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-600">
                          {r.issueDescription ??
                            r.address ??
                            "No description provided"}
                        </p>

                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-4 font-bold">
                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4 text-gray-400" />
                            <span>Vehicle: {r.vehicle?.licensePlate ?? "—"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>Customer: {r.customer?.userName ?? r.customerId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={() => handleOpenDetail(r.emergencyRequestId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          View Details
                        </button>

                        <div className="flex gap-2">
                          {/* ACCEPT */}
                          <button
                            disabled={!allowAccept || isProcessing}
                            onClick={() => handleAccept(r.emergencyRequestId)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-200 ${
                              allowAccept
                                ? isProcessing
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200 cursor-wait"
                                  : "bg-green-100 text-green-700 border-green-200 hover:bg-green-300 hover:text-green-800"
                                : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                            }`}
                          >
                            {isProcessing ? (
                              <>
                                <Clock className="h-3 w-3 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Accept
                              </>
                            )}
                          </button>

                          {/* CANCEL */}
                          <button
                            disabled={!allowCancel || isProcessing}
                            onClick={() => handleCancel(r.emergencyRequestId)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-200 ${
                              allowCancel
                                ? isProcessing
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200 cursor-wait"
                                  : "bg-red-100 text-red-700 border-red-200 hover:bg-red-300 hover:text-red-800"
                                : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                            }`}
                          >
                            {isProcessing ? (
                              <>
                                <Clock className="h-3 w-3 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <XIcon className="h-4 w-4" />
                                Cancel
                              </>
                            )}
                          </button>

                          {/* ASSIGN */}
                          {allowAssign && (
                            <button
                              onClick={() => {
                                setSelectedEmergencyId(r.emergencyRequestId);
                                loadTechnicians(r.branchId);
                                setOpenAssignModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 border border-purple-200 rounded-md hover:bg-purple-300 hover:text-purple-800 transition-colors duration-200"
                            >
                              <UserCheck className="h-4 w-4" />
                              Assign Technician
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        </div>
      </main>

      {/* ASSIGN TECHNICIAN MODAL */}
      {openAssignModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Assign Technician</h2>
                    <p className="text-sm text-gray-600">Select a technician for this emergency request</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenAssignModal(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Technicians
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 appearance-none bg-white"
                      onChange={(e) => setSelectedTech(e.target.value)}
                      value={selectedTech || ""}
                    >
                      <option value="">Choose a technician...</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {technicians.length === 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">No technicians available for this branch</span>
                  </div>
                )}

                {selectedTech && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      Technician selected: {technicians.find(t => t.id === selectedTech)?.fullName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setOpenAssignModal(false)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <XIcon className="h-4 w-4" />
                Cancel
              </button>

              <button
                onClick={handleAssignTech}
                disabled={!selectedTech}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-offset-2 ${
                  selectedTech
                    ? "text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 border border-purple-600"
                    : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                }`}
              >
                <UserCheck className="h-4 w-4" />
                Assign Technician
              </button>
            </div>
          </div>
        </div>
      )}
      {/* EMERGENCY DETAILS MODAL */}
      {openDetailModal && detailData && (
        <div className="fixed inset-0 bg-gray-900/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Emergency Request Details</h2>
                    <p className="text-sm text-gray-600">Complete information about this service request</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Issue Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {detailData.issueDescription || "No description provided"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Address</label>
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{detailData.address || "Address not specified"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const status = statusLabel(detailData.status);
                        const StatusIcon = status.icon;
                        return (
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1.5" />
                            {status.text}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Customer & Vehicle Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Information</label>
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{detailData.customerName || detailData.customerPhone || "Customer information unavailable"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Details</label>
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span>{detailData.vehicleName || "Vehicle information unavailable"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Request Timestamp</label>
                    <div className="flex items-center space-x-2 text-sm text-gray-900">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {detailData.requestTime
                          ? new Date(detailData.requestTime).toLocaleString()
                          : "Time not recorded"}
                      </span>
                    </div>
                  </div>

                  {detailData.distanceToGarageKm && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Distance to Garage</label>
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{detailData.distanceToGarageKm.toFixed(1)} kilometers</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setOpenDetailModal(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}