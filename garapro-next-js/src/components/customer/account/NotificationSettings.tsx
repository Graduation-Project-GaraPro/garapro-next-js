"use client";

import { useState } from "react";

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: {
      repairs: true,
      promotions: false,
      news: true,
      reminders: true,
    },
    sms: {
      repairs: true,
      promotions: false,
      reminders: true,
    },
    push: {
      repairs: true,
      chat: true,
      promotions: false,
      reminders: true,
    },
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = (channel: "email" | "sms" | "push", type: string) => {
    setSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type as keyof typeof prev[typeof channel]],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Notification settings updated successfully!");
    } catch (error) {
      console.error("Error updating notification settings:", error);
      alert("An error occurred while updating notification settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Email Notifications */}
          <div>
            <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="email-repairs" className="text-sm">
                  Repair status updates
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="email-repairs"
                    checked={settings.email.repairs}
                    onChange={() => handleToggle("email", "repairs")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="email-repairs"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.email.repairs ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="email-promotions" className="text-sm">
                  Promotions and offers
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="email-promotions"
                    checked={settings.email.promotions}
                    onChange={() => handleToggle("email", "promotions")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="email-promotions"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.email.promotions ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="email-news" className="text-sm">
                  News and updates
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="email-news"
                    checked={settings.email.news}
                    onChange={() => handleToggle("email", "news")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="email-news"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.email.news ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="email-reminders" className="text-sm">
                  Maintenance reminders
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="email-reminders"
                    checked={settings.email.reminders}
                    onChange={() => handleToggle("email", "reminders")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="email-reminders"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.email.reminders ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          {/* SMS Notifications */}
          <div>
            <h3 className="text-lg font-medium mb-3">SMS Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="sms-repairs" className="text-sm">
                  Repair status updates
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="sms-repairs"
                    checked={settings.sms.repairs}
                    onChange={() => handleToggle("sms", "repairs")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="sms-repairs"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.sms.repairs ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="sms-promotions" className="text-sm">
                  Promotions and offers
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="sms-promotions"
                    checked={settings.sms.promotions}
                    onChange={() => handleToggle("sms", "promotions")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="sms-promotions"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.sms.promotions ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="sms-reminders" className="text-sm">
                  Maintenance reminders
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="sms-reminders"
                    checked={settings.sms.reminders}
                    onChange={() => handleToggle("sms", "reminders")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="sms-reminders"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.sms.reminders ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Push Notifications */}
          <div>
            <h3 className="text-lg font-medium mb-3">Push Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="push-repairs" className="text-sm">
                  Repair status updates
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="push-repairs"
                    checked={settings.push.repairs}
                    onChange={() => handleToggle("push", "repairs")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="push-repairs"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.push.repairs ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="push-chat" className="text-sm">
                  New messages
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="push-chat"
                    checked={settings.push.chat}
                    onChange={() => handleToggle("push", "chat")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="push-chat"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.push.chat ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="push-promotions" className="text-sm">
                  Promotions and offers
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="push-promotions"
                    checked={settings.push.promotions}
                    onChange={() => handleToggle("push", "promotions")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="push-promotions"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.push.promotions ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="push-reminders" className="text-sm">
                  Maintenance reminders
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="push-reminders"
                    checked={settings.push.reminders}
                    onChange={() => handleToggle("push", "reminders")}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="push-reminders"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.push.reminders ? 'bg-blue-500' : 'bg-gray-300'}`}
                  ></label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}