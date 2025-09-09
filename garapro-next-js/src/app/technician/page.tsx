"use client";

import { useState, useEffect } from "react";
import {
  FaUserCircle,
  FaTachometerAlt,
  FaClipboardList,
  FaBox,
  FaBell,
  FaHistory,
  FaCar,
  FaWrench,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHome,
  FaArrowLeft,
  FaArrowRight,
  FaTools,
} from "react-icons/fa";
import TaskManagement from "./taskManagement";
import ConditionInspection from "./conditionInspection";
import RepairHistory from "./repairHistory";
import VehicleInformation from "./vehicleLookup";
import Notifications from "./notifications";

export default function Technician() {
  const [activeSection, setActiveSection] = useState("home");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    "/images/image1.jpg",
    "/images/image2.jpg",
    "/images/image3.jpg",
    "/images/image4.jpg",
  ];

  // Tự động chuyển ảnh mỗi 3 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Chuyển ảnh mỗi 3 giây

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, [images.length]);

  // Hàm điều hướng ảnh
  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % images.length
    );
  };

  const sidebarItems = [
    { id: "home", label: "Home", icon: FaHome },
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "task-management", label: "Task Management", icon: FaClipboardList },
    { id: "condition-inspection", label: "Condition Inspection", icon: FaTools },
    // { id: "repair-progress", label: "Repair Progress", icon: FaTools },
    // { id: "spare-parts", label: "Spare Parts Suggestion", icon: FaBox },
    // { id: "notes-logging", label: "Notes Logging", icon: FaNotesMedical },
    { id: "repair-history", label: "Repair History", icon: FaHistory },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "vehicle-lookup", label: "Information Lookup", icon: FaCar },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
        <div className="space-y-6">
          {/* <h2 className="text-3xl font-semibold mb-4 text-gray-700 text-center italic font-serif">Your Car, Our Care – GaragePro Technicians.</h2>  */}
          {/* <div className="bg-white p-6 rounded-lg shadow-md">        */}
          <div className="relative w-full h-[640px] overflow-hidden rounded-lg">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Slide ${index + 1}`}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          {/* Text overlay ở góc trên trái */}
        <div className="absolute top-30 left-15 z-20">
          <h2 className="text-4xl font-semibold text-white italic font-serif leading-tight">
            <div>Your Car, Our Care</div>
            <div className="ml-10">GaragePro Technicians</div>
          </h2>
        </div>
            {/* Nút điều hướng trái */}
            <button
              onClick={goToPreviousImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              <FaArrowLeft />
            </button>
            {/* Nút điều hướng phải */}
            <button
              onClick={goToNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              <FaArrowRight />
            </button>
            {/* Pagination dots đè lên ảnh */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? "bg-gray-900" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      // </div>
      );
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Tasks</p>
                    <p className="text-3xl font-bold text-blue-600">12</p>
                  </div>
                  <FaClipboardList className="text-3xl text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed Today</p>
                    <p className="text-3xl font-bold text-green-600">8</p>
                  </div>
                  <FaCheckCircle className="text-3xl text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Parts</p>
                    <p className="text-3xl font-bold text-orange-600">3</p>
                  </div>
                  <FaBox className="text-3xl text-orange-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Urgent Tasks</p>
                    <p className="text-3xl font-bold text-red-600">2</p>
                  </div>
                  <FaExclamationTriangle className="text-3xl text-red-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                  <FaClipboardList className="mr-2 text-blue-600" />
                  Recent Tasks
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-600">Task list available in Task Management</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                  <FaBell className="mr-2 text-blue-600" />
                  Recent Notifications
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-600">Full notifications available in Notifications section</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "task-management":
        return <TaskManagement />;
      case "condition-inspection":
        return <ConditionInspection />;
      case "repair-history":
        return <RepairHistory />;
      case "notifications":
        return <Notifications />;
      case "vehicle-lookup":
        return <VehicleInformation />;

      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{activeSection}</h2>
            <p className="text-gray-600">Content for {activeSection} section will be displayed here.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header - Full Width */}
      <header className="bg-gradient-to-r from-blue-100 to-teal-100 shadow-sm border-b border-teal-200 p-4 w-full text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-12">
            {/* Logo in Header */}
            <div className="flex items-center space-x-2">
              <img 
          src="/gr_logo.png" 
          alt="GaragePro Logo" 
          className="w-10 h-10 object-contain"
        />
              <span className="text-xl font-bold text-gray-800">GaragePro</span>
            </div>
            <div className="h-8 w-px bg-gray-300" style={{ marginLeft: "58px" }}></div>
            {/* <div>
              <h1 className="text-2xl font-bold text-gray-800 capitalize">
                {activeSection.replace("-", " ")}
              </h1>
              <p className="text-sm text-gray-600">
                Manage your repair tasks and vehicle diagnostics
              </p>
            </div> */}
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-800">
              <FaBell className="text-xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="h-8 w-px bg-gray-300"></div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              <FaUserCircle className="text-4xl text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Content Area with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-r from-gray-300 to-teal-100 shadow-lg">
          {/* Navigation */}
          <nav className="mt-6">
            <div className="px-4">
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center">
                 <FaWrench className="text-xl text-gray-500 mr-2" />
                TECHNICIAN
              </p>
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-1 transition-colors ${
                      activeSection === item.id
                        ? "bg-gradient-to-r from-blue-300 to-teal-300 text-blue-800 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="mr-3 text-lg" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <FaUserCircle className="text-3xl text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-800">John Technician</p>
                <p className="text-xs text-gray-500">Senior Mechanic</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-3">{renderContent()}</main>
      </div>
    </div>
  );
}