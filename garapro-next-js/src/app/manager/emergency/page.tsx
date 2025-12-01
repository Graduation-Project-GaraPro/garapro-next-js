/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/services/manager/api-client";

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

  // ❗ Mock list tech – bạn sẽ thay bằng fetch API
  //   const technicians = [
  //     { id: "tech-1", name: "Nguyễn Văn A" },
  //     { id: "tech-2", name: "Trần Văn B" },
  //     { id: "tech-3", name: "Lê Văn C" },
  //   ];

  useEffect(() => {
    const load = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:7113/api";
        const res = await fetch(`${apiBase}/EmergencyRequest/getAll`, {
          cache: "no-store",
        });

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);
  const loadTechnicians = async (branchId?: string) => {
    if (!branchId) {
      setTechnicians([]);
      return;
    }

    try {
      const res = await apiClient.get(`/Branch/${branchId}/technicians`);

      if (res.success) {
        const json = res.data;
        setTechnicians(json);
      } else {
        console.error("Không load được danh sách kỹ thuật viên");
        setTechnicians([]);
      }
    } catch (err) {
      console.error(err);
      setTechnicians([]);
    }
  };

  // ===== HANDLE ASSIGN TECH =====
  const handleAssignTech = async () => {
    if (!selectedTech || !selectedEmergencyId) return;

    const response = await apiClient.post(`/EmergencyRequest/asign-tech`, {
      emergencyId: selectedEmergencyId,
      technicianUserId: selectedTech,
    });

    if (response.success) {
      alert("Gán kỹ thuật viên thành công!");
      setOpenAssignModal(false);
      setSelectedTech(null);

      // reload
      const res = await apiClient.get(`/EmergencyRequest/getAll`);
      setData(res.data);
    } else {
      alert("Gán thất bại!");
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

              const allowAccept = (r.status ?? 0) === 0; // Pending
              const allowCancel = [0, 1].includes(r.status ?? 0);
              const allowAssign = r.status === 1; // Accepted

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
                          {r.issueDescription ?? r.address ?? "Không có mô tả"}
                        </p>

                        <div className="mt-2 text-xs text-gray-500 flex gap-2">
                          <span>Xe: {r.vehicle?.licensePlate ?? "—"}</span>|
                          <span>
                            Khách: {r.customer?.userName ?? r.customerId}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 items-end">
                        <Link
                          href={`/manager/test?erId=${r.emergencyRequestId}`}
                          className="text-sky-600 text-sm hover:underline"
                        >
                          Xem chi tiết
                        </Link>

                        <div className="flex gap-2">
                          {/* ACCEPT BUTTON */}
                          <button
                            disabled={!allowAccept}
                            className={`px-3 py-1 text-sm rounded text-white ${
                              allowAccept
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Chấp nhận
                          </button>

                          {/* CANCEL BUTTON */}
                          <button
                            disabled={!allowCancel}
                            className={`px-3 py-1 text-sm rounded text-white ${
                              allowCancel
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            Huỷ
                          </button>

                          {/* ASSIGN TECH BUTTON */}
                          {allowAssign && (
                            <button
                              onClick={() => {
                                setSelectedEmergencyId(r.emergencyRequestId);
                                loadTechnicians(r.branchId);
                                setOpenAssignModal(true);
                              }}
                              className="px-3 py-1 text-sm rounded text-white bg-purple-600 hover:bg-purple-700"
                            >
                              Gán kỹ thuật viên
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

      {/* =============== MODAL =============== */}
      {openAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-medium">Chọn kỹ thuật viên</h2>

            <select
              className="mt-4 w-full border rounded px-3 py-2"
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              <option value="">-- Chọn kỹ thuật viên --</option>
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
                Hủy
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
                Gán
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
