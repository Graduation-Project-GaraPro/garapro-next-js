"use client";

import { useState } from "react";

export function SecuritySettings() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setError(""); // Clear error message when user changes input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if new password and confirm password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form after success
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      alert("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      setError("An error occurred while changing password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters long, including uppercase letters, lowercase letters, and numbers.
          </p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Change Password'}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Login Sessions</h3>
        <p className="mb-4">You are currently logged in on the following devices:</p>
        
        <div className="space-y-3">
          <div className="p-3 border rounded-md flex justify-between items-center">
            <div>
              <p className="font-medium">Chrome on Windows</p>
              <p className="text-sm text-gray-500">Ho Chi Minh City, Vietnam · Recent activity</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Current
            </span>
          </div>
          
          <div className="p-3 border rounded-md flex justify-between items-center">
            <div>
              <p className="font-medium">Safari on iPhone</p>
              <p className="text-sm text-gray-500">Ho Chi Minh City, Vietnam · 2 days ago</p>
            </div>
            <button className="text-sm text-red-600 hover:text-red-800">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}