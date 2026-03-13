"use client";
import React, { useState } from "react";
import {
  Search, Plus, Bell, X, Calendar, Tag, Users,
  DollarSign, FileText, User, LogOut, Settings,
  CheckCircle, AlertCircle, MessageSquare, MenuIcon
} from "lucide-react";

interface TopbarProps {
  toggleSidebar: () => void;
}

export default function Topbar({ toggleSidebar }: TopbarProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 relative z-40">

        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1">
          {/* Hamburger - mobile only */}
          <button className="md:hidden p-1" onClick={toggleSidebar}>
            <MenuIcon className="text-gray-600" size={22} />
          </button>

          {/* Search - hidden on small screens */}
          <div className="relative hidden sm:block w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search events, tasks, or team members..."
              // ADDED: text-gray-900, placeholder-gray-500, and bg-gray-50
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 placeholder-gray-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">

          {/* Create Event Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Create New Event</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 hover:bg-gray-100 rounded-full transition relative"
            >
              <Bell className="text-gray-600" size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">Mark all as read</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition flex gap-3">
                    <div className="mt-0.5 text-indigo-500 bg-indigo-50 p-1.5 rounded-full shrink-0">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">New message from David</p>
                      <p className="text-xs text-gray-500 mt-0.5">"Can we update the catering budget?"</p>
                      <p className="text-xs text-gray-400 mt-1">10 min ago</p>
                    </div>
                  </div>
                  <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition flex gap-3">
                    <div className="mt-0.5 text-green-500 bg-green-50 p-1.5 rounded-full shrink-0">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">Task Completed</p>
                      <p className="text-xs text-gray-500 mt-0.5">Venue booking confirmed for Tech Summit.</p>
                      <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer transition flex gap-3">
                    <div className="mt-0.5 text-orange-500 bg-orange-50 p-1.5 rounded-full shrink-0">
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">Budget Alert</p>
                      <p className="text-xs text-gray-500 mt-0.5">You have used 80% of the allocated budget.</p>
                      <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-100 text-center">
                  <button className="text-sm text-indigo-600 font-medium hover:underline">View All Notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative border-l pl-3 md:pl-4 border-gray-200">
            <button
              onClick={toggleProfile}
              className="flex items-center gap-3 hover:opacity-80 transition text-left"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Sarah Mitchell</p>
                <p className="text-xs text-gray-500">Chairperson</p>
              </div>
              <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm">
                SM
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                {/* Show name in dropdown on mobile since it's hidden in header */}
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-medium text-gray-900">Sarah Mitchell</p>
                  <p className="text-xs text-gray-500">Chairperson</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition flex items-center gap-2">
                  <User size={16} /> View Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition flex items-center gap-2">
                  <Settings size={16} /> Settings
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2 font-medium">
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Overlay to close dropdowns on outside click */}
      {(isNotificationOpen || isProfileOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsNotificationOpen(false);
            setIsProfileOpen(false);
          }}
        />
      )}

      {/* CREATE NEW EVENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-medium text-gray-800">Create New Event</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">

              {/* Event Title */}
              <div>
                <label className="block text-gray-700 mb-2">Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Annual Tech Summit 2025"
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Calendar size={18} className="text-gray-500" /> Event Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Tag size={18} className="text-gray-500" /> Event Category *
                  </label>
                  <select
                    defaultValue=""
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="Workshops & Training">Workshops & Training</option>
                    <option value="Competitions & Hackathons">Competitions & Hackathons</option>
                    <option value="Career & Networking">Career & Networking</option>
                    <option value="Conferences & Expos">Conferences & Expos</option>
                    <option value="Meetups & Community">Meetups & Community</option>
                    <option value="Talks & Panels">Talks & Panels</option>
                    <option value="Tech Experiences">Tech Experiences</option>
                  </select>
                </div>
              </div>

              {/* Attendees & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Users size={18} className="text-gray-500" /> Expected Attendees *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 200"
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-700 mb-2">
                    <DollarSign size={18} className="text-gray-500" /> Budget ($) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 50000"
                    className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <FileText size={18} className="text-gray-500" /> Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Brief description of the event..."
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 resize-none placeholder:text-gray-400"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex items-center gap-4 shrink-0 bg-white">
              <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition">
                Create Event
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}