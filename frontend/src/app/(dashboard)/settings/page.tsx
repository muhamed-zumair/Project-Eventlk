"use client";

import { useState } from "react";
import { User, Bell, Lock } from "lucide-react";

// Reusable Toggle Component
const Toggle = ({ defaultChecked }: { defaultChecked: boolean }) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);
  return (
    <button
      type="button"
      onClick={() => setIsChecked(!isChecked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        isChecked ? "bg-indigo-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isChecked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile"); 

  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },    
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account preferences and security
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Internal Settings Sidebar */}
        <div className="w-full lg:w-64 space-y-1 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
               <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id)}
                 className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                   isActive
                     ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                     : "text-gray-600 hover:bg-gray-50"
                 }`}
               >
                 <Icon size={18} />
                 {item.label}
               </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          
          {/* --- PROFILE TAB --- */}
          {activeTab === "profile" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Profile Settings
              </h3>

              <form className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      defaultValue="Sarah"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Mitchell"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    defaultValue="sarah.mitchell@eventlk.com"
                    className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact an administrator to change your email address.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Committee Role (Read Only)</label>
                    <input
                      type="text"
                      disabled
                      defaultValue="Chairperson"
                      className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4 border-t border-gray-100">
                  <button
                    type="button"
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* --- NOTIFICATIONS TAB --- */}
          {activeTab === "notifications" && (
            <div className="space-y-8 max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Email Notification Preferences
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Task Assignments</p>
                    <p className="text-sm text-gray-500 mt-1">Email me when I am assigned a new task</p>
                  </div>
                  <Toggle defaultChecked={true} />
                </div>
                
                <div className="border-t border-gray-50"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Event Updates</p>
                    <p className="text-sm text-gray-500 mt-1">Email me when event details (date, time, venue) change</p>
                  </div>
                  <Toggle defaultChecked={true} />
                </div>

                <div className="border-t border-gray-50"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Internal Messages</p>
                    <p className="text-sm text-gray-500 mt-1">Email me when someone sends a message in the Communications center</p>
                  </div>
                  <Toggle defaultChecked={false} />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* --- SECURITY TAB --- */}
          {activeTab === "security" && (
            <div className="space-y-8 max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Security Settings
              </h3>

              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-800">Change Password</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Ensure your account is using a long, random password to stay secure.
                </p>
                
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}