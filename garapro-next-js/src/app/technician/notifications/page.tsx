"use client";

import { useState } from "react";
import { FaBell, FaExclamationTriangle, FaCheckCircle, FaClock, FaSearch, FaFilter,FaInfoCircle } from "react-icons/fa";

type NotificationType = "normal" | "warning";
type NotificationCategory = "Task" | "Approval" | "Parts" | "Deadline" | "Feedback";

interface Notification {
  id: number;
  message: string;
  time: string;
  type: NotificationType;
  category: NotificationCategory;
}

export default function Notifications() {
  const notifications: Notification[] = [
    { id: 1, message: "New Task: Toyota Camrry", time: "2 minuetes ago", type: "normal", category: "Task" },
    { id: 2, message: "Tesla vehicle status accepted", time: "15 minuetes ago", type: "normal", category: "Approval" },
    { id: 3, message: "Windshield is available in stock", time: "45 minuetes ago", type: "normal", category: "Parts" },
    { id: 4, message: "WARNING: You missed the deadline for the Porsche task.", time: "1 hour ago", type: "warning", category: "Deadline" },
    { id: 5, message: "Customer feedback is not satisfied with the repair quality.", time: "3 hours ago", type: "warning", category: "Feedback" },
    { id: 6, message: "Tesla vehicle status accepted", time: "1 ngày trước", type: "normal", category: "Approval" },
    { id: 7, message: "WARNING: BMW Task is about to expire in 2 hours", time: "2 days ago", type: "warning", category: "Deadline" }
  ];

  const getNotificationIcon = (type: NotificationType, category: NotificationCategory) => {
    if (type === "warning") {
      return <FaExclamationTriangle className="text-red-500 text-lg" />;
    }
    switch (category) {
      case "Approval":
        return <FaCheckCircle className="text-green-500 text-lg" />;
      case "Parts":
        return <FaBell className="text-blue-500 text-lg" />;
      case "Task":
        return <FaClock className="text-purple-500 text-lg" />;
      default:
        return <FaBell className="text-gray-500 text-lg" />;
    }
  };

  const getNotificationStyle = (type: NotificationType) => {
    if (type === "warning") {
      return "bg-red-100 border-l-4 border-red-400 hover:bg-red-200";
    }
    return "bg-blue-100 border-l-4 border-blue-400 hover:bg-blue-300";
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<NotificationCategory | "all">("all");
  const filterNotifications = filter === "all"
    ?  notifications
    :  notifications.filter((task) => task.category === filter);

  return (
    <div className="bg-gradient-to-r from-blue-200 to-purple-100 p-6 rounded-xl shadow-lg flex flex-col h-full">  
      <div className="flex items-center justify-between gap-4">
       {/* Header Section */}
      <div className="relative inline-block mb-4">
            <div className="absolute inset-0 w-full max-w-md bg-white/70 shadow-md rounded-lg"></div>
              <div className="relative flex items-center gap-2 px-6 py-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <FaBell className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col items-start">
                 <h2 className="text-[29px] font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent italic">
                   Notifications
                 </h2>
                   <p className="text-gray-700 italic">Timely reminders – on-time car repairs</p>
                </div>
            </div>
            </div>
            <div className="px-12 mb-4 flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                  type="text"
                  placeholder="Search by messege..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-3 border-gray-300 rounded-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
                  />
            </div>
          </div>
         </div>
         <div className="space-y-4 px-12">
            <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-[18px] font-semibold text-gray-800 flex items-center gap-2">
              <FaInfoCircle className="w-6 h-6 text-blue-600" />
              Notifications ({filterNotifications.length})
            </h2>
            {/* Filter Section */}
            <div className="flex items-center space-x-2 bg-white/40 rounded-xl p-2 shadow-sm border border-gray-200">
              <FaFilter className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Filter:</span>
              <div className="flex space-x-2">
                {(["all", "Task", "Approval","Parts","Deadline","Feedback"] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-1.5 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                      filter === category
                        ? "bg-blue-500 text-white hover:bg-blue-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-400"
                    }`}
                  >
                    {category === "all" ? "All Tasks" : category.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>
            
      {/* <div className="space-y-4 px-8 max-h-[47vh] overflow-y-auto rounded-scroll"> */}
       <div className="px-8 max-h-[47vh] overflow-y-auto bg-white/30 rounded-2xl shadow-inner space-y-4 p-4 rounded-scroll">
      {/* Danh sách thông báo */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filterNotifications
         .filter(
            (vehicle) =>
              vehicle.message.toLowerCase().includes(searchTerm.toLowerCase())             
          )
        .map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start p-4 rounded-lg transition-all duration-200 cursor-pointer ${getNotificationStyle(notification.type)}`}
          >
            <div className="mr-4 mt-1">
              {getNotificationIcon(notification.type, notification.category)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={`text-[16px] font-medium ${
                notification.type === "warning" ? "text-red-800" : "text-gray-800"
              }`}>
                {notification.message}
              </p>
              
              <div className="flex items-center mt-2">
                <p className="text-xs text-gray-500 flex items-center">
                  <FaClock className="mr-1 text-xs" />
                  {notification.time}
                </p>
                
                {notification.type === "warning" && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold text-red-700 bg-red-200 rounded-full">
                    Warning
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
</div>
      {/* Footer */}
      <div className="mt-4 py-3 border-t border-gray-200 bg-white rounded-xl flex justify-center">
        <p className="text-[15px] text-gray-500 font-bold">
        Total {notifications.length} notifications
        </p>
      </div>
    </div>
  );
}
