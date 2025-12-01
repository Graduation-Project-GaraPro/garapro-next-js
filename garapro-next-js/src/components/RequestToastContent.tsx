/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";

type Props = {
  data: any;
  onAccept: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onView: (id: string) => void;
  toastId?: string;
};

export default function RequestToastContent({
  data,
  onAccept,
  onCancel,
  onView,
}: Props) {
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const shortDate = (iso?: string | Date | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const id = data.emergencyRequestId;

  return (
    <div className="w-[360px] max-w-full bg-white rounded-xl shadow-lg p-4 ring-1 ring-gray-100">
      <div className="flex items-start gap-3">
        {/* Left: icon */}
        <div className="flex-none">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 text-white">
            {/* svg alert icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4"
              />
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 17h.01"
              />
            </svg>
          </div>
        </div>

        {/* Middle: content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">
              {data.message ?? "Yêu cầu cứu hộ mới"}
            </h4>
            <span className="text-xs text-gray-500">
              {shortDate(data.timestamp ?? data.requestTime)}
            </span>
          </div>

          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Garage:</span>
              <span className="font-medium">{data.branchName ?? "—"}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Khách:</span>
              <span className="truncate">
                {data.customerName ?? data.customerPhone ?? "—"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Địa chỉ:</span>
              <span className="text-sm text-gray-600 truncate">
                {data.address ?? "Không rõ"}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <div>
                Khoảng cách:{" "}
                <span className="font-medium text-gray-700">
                  {(data.distanceToGarageKm ?? 0).toFixed(2)} km
                </span>
              </div>
              <div>
                ETA:{" "}
                <span className="font-medium text-gray-700">
                  {data.estimatedArrivalMinutes ?? "—"} phút
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={async () => {
                setLoadingAccept(true);
                try {
                  await onAccept(id);
                } finally {
                  setLoadingAccept(false);
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md shadow-sm text-sm hover:bg-green-700 transition"
            >
              {loadingAccept ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="31.4"
                  />
                </svg>
              ) : null}
              Chấp nhận
            </button>

            <button
              onClick={async () => {
                setLoadingCancel(true);
                try {
                  await onCancel(id);
                } finally {
                  setLoadingCancel(false);
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-md shadow-sm text-sm hover:bg-red-600 transition"
            >
              {loadingCancel ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="31.4"
                  />
                </svg>
              ) : null}
              Huỷ
            </button>

            <div className="ml-auto">
              <button
                onClick={() => onView(id)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-100 text-sky-800 rounded-md text-sm hover:bg-sky-200 transition"
              >
                Xem Emergency Request
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
