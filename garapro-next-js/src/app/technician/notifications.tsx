"use client";

import { FaBell } from "react-icons/fa";

export default function Notifications() {
  const notifications = [
    { id: 1, message: "New repair task assigned", time: "10 mins ago", type: "task" },
    { id: 2, message: "Spare part arrived", time: "30 mins ago", type: "parts" },
    { id: 3, message: "Customer approval required", time: "1 hour ago", type: "approval" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      
      {/* Khối nền có cắt chéo góc */}
    <div className="relative inline-block mb-6">
      <div className="absolute inset-0 w-full max-w-md bg-gray-300 shadow-md rounded-lg clip-diagonal"></div>
      <div className="relative flex items-center gap-2 px-6 py-3">
        <h2 className="text-[29px] font-bold flex items-center text-gray-800 text-center italic font-serif">
          <FaBell className="mr-3 text-gray-600" />
          Notifications
        </h2>
      </div>
    </div>


      {/* Danh sách thông báo */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start p-3 bg-gray-50 rounded text-gray-600"
          >
            <FaBell className="text-blue-600 mr-3 mt-1 text-gray-700" />
            <div>
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
