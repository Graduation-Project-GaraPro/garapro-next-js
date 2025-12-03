/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/services/manager/api-client";
import { toast } from "sonner";

type EmergencyRequest = {
  emergencyRequestId: string;
  branch?: { branchName?: string } | null;
  customer?: any;
  vehicle?: any;
  issueDescription?: string;
  address?: string | null;
  status?: number;
  distanceToGarageKm?: number | null;
  requestTime?: string | null;
  branchId?: string;
  [k: string]: any;
};

// ===== STATUS LABEL =====
function statusLabel(status?: number | null) {
  switch (status) {
    case 0:
      return { text: "Pending", color: "bg-yellow-100 text-yellow-800" };
    case 1:
      return { text: "Accepted", color: "bg-green-100 text-green-800" };
    case 2:
      return { text: "Assigned", color: "bg-purple-100 text-purple-800" };
    case 3:
      return { text: "In Progress", color: "bg-blue-100 text-blue-800" };
    case 4:
      return { text: "Towing", color: "bg-indigo-100 text-indigo-800" };
    case 5:
      return { text: "Completed", color: "bg-gray-100 text-gray-800" };
    case 6:
      return { text: "Canceled", color: "bg-red-100 text-red-800" };
    default:
      return { text: "Unknown", color: "bg-gray-100 text-gray-800" };
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

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

  // ===== LOAD EMERGENCY REQUESTS =====
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/EmergencyRequest/getAll`, {
          cache: "no-store",
        });

        const json = await res.json();
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
        setTechnicians(res.data as any[]);
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
    <main className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Emergency Requests</h1>
        </div>

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

              const allowAccept = (r.status ?? 0) === 0;
              const allowCancel = [0, 1].includes(r.status ?? 0);
              const allowAssign = r.status === 1;
              const isProcessing = processingId === r.emergencyRequestId;

              return (
                <li
                  key={r.emergencyRequestId}
                  className="bg-white shadow-sm rounded-lg p-4 flex gap-4"
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

                        <div className="mt-2 text-xs text-gray-500 flex gap-2">
                          <span>Vehicle: {r.vehicle?.licensePlate ?? "—"}</span>
                          |
                          <span>
                            Customer: {r.customer?.userName ?? r.customerId}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <Link
                          href={`/manager/test?erId=${r.emergencyRequestId}`}
                          className="text-sky-600 text-sm hover:underline"
                        >
                          View details
                        </Link>

                        <div className="flex gap-2">
                          {/* ACCEPT */}
                          <button
                            disabled={!allowAccept || isProcessing}
                            onClick={() => handleAccept(r.emergencyRequestId)}
                            className={`px-3 py-1 text-sm rounded text-white ${
                              allowAccept
                                ? isProcessing
                                  ? "bg-yellow-500"
                                  : "bg-green-600 hover:bg-green-700"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {isProcessing ? "Processing..." : "Accept"}
                          </button>

                          {/* CANCEL */}
                          <button
                            disabled={!allowCancel || isProcessing}
                            onClick={() => handleCancel(r.emergencyRequestId)}
                            className={`px-3 py-1 text-sm rounded text-white ${
                              allowCancel
                                ? isProcessing
                                  ? "bg-yellow-500"
                                  : "bg-red-500 hover:bg-red-600"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {isProcessing ? "Processing..." : "Cancel"}
                          </button>

                          {/* ASSIGN */}
                          {allowAssign && (
                            <button
                              onClick={() => {
                                setSelectedEmergencyId(r.emergencyRequestId);
                                loadTechnicians(r.branchId);
                                setOpenAssignModal(true);
                              }}
                              className="px-3 py-1 text-sm rounded text-white bg-purple-600 hover:bg-purple-700"
                            >
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

      {/* MODAL */}
      {openAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-medium">Select Technician</h2>

            <select
              className="mt-4 w-full border rounded px-3 py-2"
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              <option value="">-- Choose technician --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setOpenAssignModal(false)}
                className="px-4 py-1 rounded bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleAssignTech}
                disabled={!selectedTech}
                className={`px-4 py-1 rounded text-white ${
                  selectedTech
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
