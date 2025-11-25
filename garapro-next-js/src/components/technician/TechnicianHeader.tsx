"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaUserCircle,  FaUser, FaCog, FaChartBar, FaSignOutAlt 
} from "react-icons/fa";

export default function TechnicianHeader() {
  const router = useRouter();
  const [showAccountMenu, setShowAccountMenu] = useState(false); 
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null); 

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) &&
        (accountRef.current && !accountRef.current.contains(event.target as Node))
      ) {
        setShowAccountMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
  };

  const handleLogout = () => {
    // Xóa token hoặc thông tin đăng nhập nếu có
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    
    // Đóng menu
    setShowAccountMenu(false);
    
    // Chuyển hướng đến trang login
    router.push("http://localhost:3000/login");
  };

  return (
    <header className="bg-gradient-to-r from-blue-100 to-teal-100 shadow-sm border-b border-teal-200 p-4 w-full text-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="GaragePro Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">GaragePro</span>
          </div>
          <div className="h-8 w-px bg-gray-300" style={{ marginLeft: "58px" }}></div>
        </div>

        <div className="flex items-center space-x-4 bg-white/70 rounded-xl px-5">
          {/* Account Menu */}
          <div className="relative" ref={accountRef}>
            <button
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              onClick={toggleAccountMenu}
            >
              <FaUserCircle className="text-4xl text-gray-500 hover:text-gray-700" />
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      JT
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">John Technician</h3>
                      <p className="text-xs text-gray-500">johntech@garapro.com</p>
                    </div>
                  </div>
                </div>

                <div className="py-2 px-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors duration-200 rounded-xl">
                    <FaUser className="text-gray-700" />
                    <span className="text-sm font-semibold">Profile</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-100 transition-colors duration-200 rounded-xl">
                    <FaCog className="text-gray-700" />
                    <span className="text-sm font-semibold">Settings</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-100 transition-colors duration-200 rounded-xl">
                    <FaChartBar className="text-gray-700" />
                    <span className="text-sm font-semibold">Analytics</span>
                  </button>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-xl"
                    >
                      <FaSignOutAlt className="text-red-700" />
                      <span className="text-sm font-bold">Log out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}