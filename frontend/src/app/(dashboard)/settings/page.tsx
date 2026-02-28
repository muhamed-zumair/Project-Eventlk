"use client";

import { useState } from "react";
import { User, Bell, Lock, Globe, Moon, Shield, Laptop, Smartphone } from "lucide-react";

// Reusable Toggle Component
const Toggle = ({ defaultChecked }) => {
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
  // Changed default to 'language' so you can see the new tabs, feel free to change back to 'profile'
  const [activeTab, setActiveTab] = useState("language"); 
  const [selectedTheme, setSelectedTheme] = useState("light");

  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "language", label: "Language", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "privacy", label: "Data & Privacy", icon: Shield },
  ];

  // Mock data for Active Sessions
  const activeSessions = [
    {
      id: 1,
      device: "MacBook Pro - Chrome",
      location: "Colombo, Sri Lanka",
      ip: "192.168.1.105",
      time: "Current session",
      isCurrent: true,
      icon: Laptop,
    },
    {
      id: 2,
      device: "iPhone 14 - Safari",
      location: "Kandy, Sri Lanka",
      ip: "112.134.78.22",
      time: "Last active 2 hours ago",
      isCurrent: false,
      icon: Smartphone,
    }
  ];

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Internal Settings Sidebar */}
        <div className="w-full lg:w-64 space-y-1">
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

              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  SM
                </div>
                <div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                    Change Photo
                  </button>
                  <p className="text-xs text-gray-400 mt-2">JPG, PNG. Max 5MB</p>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      defaultValue="Your firstname"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Your surname"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue="yourmail@gmail.com"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <input
                    type="text"
                    defaultValue="Your role"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    defaultValue="Mobile number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  ></textarea>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    type="button"
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* --- NOTIFICATIONS TAB --- */}
          {activeTab === "notifications" && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Notification Preferences
              </h3>

              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-800">Notification Channels</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email Notifications</p>
                    <p className="text-sm text-gray-500 mt-1">Receive updates via email</p>
                  </div>
                  <Toggle defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Push Notifications</p>
                    <p className="text-sm text-gray-500 mt-1">Receive push notifications in browser</p>
                  </div>
                  <Toggle defaultChecked={true} />
                </div>
              </div>

              <div className="border-t border-gray-100"></div>

              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-800">Notification Types</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Event Updates</p>
                    <p className="text-sm text-gray-500 mt-1">Get notified about event changes</p>
                  </div>
                  <Toggle defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Task Reminders</p>
                    <p className="text-sm text-gray-500 mt-1">Reminders for upcoming tasks</p>
                  </div>
                  <Toggle defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Team Activity</p>
                    <p className="text-sm text-gray-500 mt-1">Updates from team members</p>
                  </div>
                  <Toggle defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">AI Insights</p>
                    <p className="text-sm text-gray-500 mt-1">AI-powered recommendations</p>
                  </div>
                  <Toggle defaultChecked={true} />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* --- SECURITY TAB --- */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Security Settings
              </h3>

              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-800">Change Password</h4>
                <form className="space-y-4 max-w-2xl">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-100"></div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg max-w-2xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">2FA Status</p>
                    <p className="text-sm text-gray-500">Not enabled</p>
                  </div>
                  <button
                    type="button"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    Enable 2FA
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security by enabling two-factor authentication.
                </p>
              </div>

              <div className="border-t border-gray-100"></div>

              <div className="space-y-4 max-w-2xl">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Active Sessions</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage and log out your active sessions on other browsers and devices.
                  </p>
                </div>
                <div className="space-y-4 mt-4">
                  {activeSessions.map((session) => {
                    const SessionIcon = session.icon;
                    return (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                            <SessionIcon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                              {session.device} 
                              {session.isCurrent && (
                                <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {session.location} • {session.ip}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{session.time}</p>
                          </div>
                        </div>
                        {!session.isCurrent && (
                          <button className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
                            Revoke
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button className="text-sm font-medium text-red-600 hover:text-red-700 mt-4 transition-colors">
                  Log out of all other sessions
                </button>
              </div>
            </div>
          )}

          {/* --- LANGUAGE TAB --- */}
          {activeTab === "language" && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Language & Region
              </h3>

              <div className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800">Display Language</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option>English (English)</option>
                    <option>Spanish (Español)</option>
                    <option>French (Français)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select your preferred language for the interface</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800">Timezone</label>
                  <select className="w-full px-4 py-2 border border-gray-200 border-indigo-500 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option>Eastern Time (ET)</option>
                    <option>Pacific Time (PT)</option>
                    <option>Central Time (CT)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Your timezone is used for event scheduling and reminders</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800">Date Format</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-800">Time Format</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                    <option>12-hour (AM/PM)</option>
                    <option>24-hour</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- APPEARANCE TAB --- */}
          {activeTab === "appearance" && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Appearance
              </h3>

              {/* Theme Selection */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-800">Theme</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                  {/* Light Theme */}
                  <button 
                    onClick={() => setSelectedTheme('light')}
                    className={`flex flex-col items-center p-4 border-2 rounded-xl transition-all ${selectedTheme === 'light' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="w-full h-20 bg-[#F8FAFC] rounded-lg border border-gray-200 mb-3 flex items-center justify-center shadow-sm">
                      <div className="w-3/4 h-12 bg-white rounded shadow-sm border border-gray-100"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Light</span>
                  </button>

                  {/* Dark Theme */}
                  <button 
                    onClick={() => setSelectedTheme('dark')}
                    className={`flex flex-col items-center p-4 border-2 rounded-xl transition-all ${selectedTheme === 'dark' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="w-full h-20 bg-[#0F172A] rounded-lg border border-gray-800 mb-3"></div>
                    <span className="text-sm font-medium text-gray-700">Dark</span>
                  </button>

                  {/* Auto Theme */}
                  <button 
                    onClick={() => setSelectedTheme('auto')}
                    className={`flex flex-col items-center p-4 border-2 rounded-xl transition-all ${selectedTheme === 'auto' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="w-full h-20 bg-gradient-to-r from-gray-100 to-gray-800 rounded-lg border border-gray-200 mb-3"></div>
                    <span className="text-sm font-medium text-gray-700">Auto</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100"></div>

              {/* Display Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-800">Display Options</h4>
                <div className="flex items-center justify-between max-w-3xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Compact Mode</p>
                    <p className="text-sm text-gray-500 mt-1">Reduce spacing and padding</p>
                  </div>
                  <Toggle defaultChecked={false} />
                </div>
              </div>

              <div className="border-t border-gray-100"></div>

              {/* Accent Color */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-800">Accent Color</h4>
                <div className="flex items-center gap-4">
                  <button className="w-10 h-10 rounded-lg bg-indigo-600 ring-2 ring-offset-2 ring-indigo-600 transition-all"></button>
                  <button className="w-10 h-10 rounded-lg bg-blue-600 hover:scale-105 transition-all"></button>
                  <button className="w-10 h-10 rounded-lg bg-purple-600 hover:scale-105 transition-all"></button>
                  <button className="w-10 h-10 rounded-lg bg-pink-600 hover:scale-105 transition-all"></button>
                  <button className="w-10 h-10 rounded-lg bg-green-600 hover:scale-105 transition-all"></button>
                  <button className="w-10 h-10 rounded-lg bg-orange-500 hover:scale-105 transition-all"></button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Save Appearance
                </button>
              </div>
            </div>
          )}

          {/* --- DATA & PRIVACY TAB --- */}
          {activeTab === "privacy" && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Data & Privacy
              </h3>

              {/* Privacy Controls */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-800">Privacy Controls</h4>
                
                <div className="flex items-center justify-between max-w-3xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Usage Data Collection</p>
                    <p className="text-sm text-gray-500 mt-1">Help improve EventLK by sharing usage data</p>
                  </div>
                  <Toggle defaultChecked={true} />
                </div>

                <div className="flex items-center justify-between max-w-3xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Analytics & Performance</p>
                    <p className="text-sm text-gray-500 mt-1">Allow analytics to improve performance</p>
                  </div>
                  <Toggle defaultChecked={true} />
                </div>
              </div>

              <div className="border-t border-gray-100"></div>

              {/* Data Management */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">Data Management</h4>
                
                <div className="max-w-3xl space-y-3">
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <p className="text-sm font-medium text-gray-800">Download Your Data</p>
                    <p className="text-sm text-gray-500 mt-1">Export all your data in JSON format</p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                    <p className="text-sm font-medium text-gray-800">Data Retention Settings</p>
                    <p className="text-sm text-gray-500 mt-1">Manage how long we keep your data</p>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-semibold text-red-600">Danger Zone</h4>
                
                <div className="p-6 border border-red-100 bg-red-50/50 rounded-xl max-w-3xl">
                  <p className="text-sm font-medium text-gray-800">Delete Account</p>
                  <p className="text-sm text-gray-600 mt-1 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                  >
                    Delete Account
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Save Privacy Settings
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}