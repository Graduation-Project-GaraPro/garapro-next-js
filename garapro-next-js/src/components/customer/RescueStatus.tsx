'use client';

import React from 'react';

type RescueStatusType =
  | 'pending'
  | 'accepted'
  | 'dispatched'
  | 'on-the-way'
  | 'arrived'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

interface RescueStatusProps {
  status: RescueStatusType;
  estimatedArrival: string | null; // ISO date string
  requestTime: string | null;      // ISO date string
  updateStatus: (newStatus: RescueStatusType) => void;
  generatePdf: () => void;
}

const RescueStatus: React.FC<RescueStatusProps> = ({
  status,
  estimatedArrival,
  requestTime,
  updateStatus,
  generatePdf,
}) => {
  // Map status to display text
  const getStatusText = (status: RescueStatusType) => {
    const statusMap: Record<RescueStatusType, string> = {
      pending: 'Pending',
      accepted: 'Accepted',
      dispatched: 'Dispatched',
      'on-the-way': 'On the way',
      arrived: 'Arrived',
      'in-progress': 'In progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  // Colors based on status
  const getStatusColor = (status: RescueStatusType) => {
    const colorMap: Record<RescueStatusType, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      dispatched: 'bg-purple-100 text-purple-800',
      'on-the-way': 'bg-indigo-100 text-indigo-800',
      arrived: 'bg-green-100 text-green-800',
      'in-progress': 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Format ISO time
  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'No information';

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid time';

    return (
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) +
      ' - ' +
      date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    );
  };

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!estimatedArrival) return 'Unknown';
    const now = new Date();
    const arrival = new Date(estimatedArrival);
    const diffMs = arrival.getTime() - now.getTime();

    if (diffMs <= 0) return 'Arrived';

    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} minutes`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600 text-white font-semibold">
        Rescue Status
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm text-gray-500">Status:</span>
            <span
              className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                status
              )}`}
            >
              {getStatusText(status)}
            </span>
          </div>

          <button
            onClick={generatePdf}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
          >
            Generate PDF
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Request time:</span>
            <span className="text-sm font-medium">{formatTime(requestTime)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Estimated arrival:</span>
            <span className="text-sm font-medium">{formatTime(estimatedArrival)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Time remaining:</span>
            <span className="text-sm font-medium text-blue-600">
              {getRemainingTime()}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Update status:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(['dispatched', 'on-the-way', 'arrived', 'in-progress', 'completed'] as RescueStatusType[]).map(
              (statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => updateStatus(statusOption)}
                  disabled={statusOption === status}
                  className={`py-2 px-3 rounded-md text-sm transition-colors ${
                    statusOption === status
                      ? 'bg-blue-600 text-white cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getStatusText(statusOption)}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescueStatus;
