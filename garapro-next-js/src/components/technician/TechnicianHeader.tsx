"use client";

import { FaUserCircle, FaBell } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function TechnicianHeader() {
  const router = useRouter(); 
  return (
    <header className="bg-gradient-to-r from-blue-100 to-teal-100 shadow-sm border-b border-teal-200 p-4 w-full text-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-2">
            <img
              src="/gr_logo.png"
              alt="GaragePro Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">GaragePro</span>
          </div>
          <div className="h-8 w-px bg-gray-300" style={{ marginLeft: "58px" }}></div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-800"
          onClick={() => router.push(`notifications`)}>
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
  );
}