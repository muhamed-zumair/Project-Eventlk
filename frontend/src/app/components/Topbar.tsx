"use client";
import React, { useState } from "react";
import {
  Search, Plus, Bell, X, Calendar, Tag, Users,
  DollarSign, FileText, User, LogOut, Settings,
  CheckCircle, AlertCircle, MessageSquare, MenuIcon,
  SlidersHorizontal, Sparkles, Minus, MapPin
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface TopbarProps {
  toggleSidebar: () => void;
}

// Mock Data for AI Pie Chart
const aiBudgetData = [
  { name: 'Venue', value: 50000, percentage: '25.0%' },
  { name: 'Speakers', value: 58600, percentage: '29.3%' },
  { name: 'Food', value: 19800, percentage: '9.9%' },
  { name: 'AV', value: 29000, percentage: '14.5%' },
  { name: 'Marketing', value: 9800, percentage: '4.9%' },
  { name: 'Equipment', value: 30600, percentage: '15.3%' },
];
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f59e0b', '#06b6d4'];

export default function Topbar({ toggleSidebar }: TopbarProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Modal States
  const [createMode, setCreateMode] = useState<'manual' | 'ai'>('manual');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  
  // AI Form States
  const [aiHeadcount, setAiHeadcount] = useState<number>(400);
  const [aiBudget, setAiBudget] = useState<number>(200000);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
  };

  const costPerHead = aiHeadcount > 0 ? (aiBudget / aiHeadcount).toFixed(2) : "0.00";

  return (
    <>
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 relative z-40">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1">
          <button className="md:hidden p-1" onClick={toggleSidebar}>
            <MenuIcon className="text-gray-600" size={22} />
          </button>

          <div className="relative hidden sm:block w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search events, tasks, or team members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 placeholder-gray-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => {
              setIsCreateModalOpen(true);
              setCreateMode('manual');
              setIsAiGenerated(false);
            }}
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
                </div>
                <div className="p-3 border-t border-gray-100 text-center">
                  <button className="text-sm text-indigo-600 font-medium hover:underline">View All Notifications</button>
                </div>
              </div>
            )}
          </div>

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

      {/* Overlays */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div 
            className={`bg-white rounded-2xl shadow-2xl w-full transition-all duration-300 flex flex-col max-h-[95vh] ${
              createMode === 'ai' ? 'max-w-[1100px]' : 'max-w-4xl'
            }`}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-medium text-gray-900">Create New Event</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
                <button 
                  onClick={() => setCreateMode('manual')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-colors ${
                    createMode === 'manual' 
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <SlidersHorizontal size={18} /> Manual Creation
                </button>
                <button 
                  onClick={() => setCreateMode('ai')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-colors ${
                    createMode === 'ai' 
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Sparkles size={18} /> AI Assisted
                </button>
              </div>

              {/* === MANUAL CREATION VIEW === */}
              {createMode === 'manual' && (
                <div className="space-y-6 max-w-3xl mx-auto w-full pb-4">
                  {/* Event Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Annual Tech Summit 2025"
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {/* Date & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="text-gray-500" /> Event Date *
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Tag size={16} className="text-gray-500" /> Event Category *
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
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Users size={16} className="text-gray-500" /> Expected Attendees *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 200"
                        className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <DollarSign size={16} className="text-gray-500" /> Budget (LKR) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 50000"
                        className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FileText size={16} className="text-gray-500" /> Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Brief description of the event..."
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 resize-none placeholder-gray-400"
                    />
                  </div>
                  
                  {/* Actions for Manual */}
                  <div className="pt-4 flex items-center gap-4">
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition">
                      Create Event
                    </button>
                    <button
                      onClick={() => setIsCreateModalOpen(false)}
                      className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* === AI ASSISTED VIEW === */}
              {createMode === 'ai' && (
                <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">
                  
                  {/* Left Sidebar - Inputs */}
                  <div className="w-full lg:w-[380px] shrink-0 space-y-6 flex flex-col">
                    
                    {/* Event Details Card */}
                    <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-5 space-y-5">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Sparkles size={18} className="text-indigo-600" /> Event Details
                      </h3>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1.5">Event Title *</label>
                        <input type="text" placeholder="e.g., Tech Conference 2025" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 text-sm text-gray-900 placeholder-gray-400" />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-700 mb-1.5">Event Date *</label>
                        <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 text-sm text-gray-900" />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2 flex justify-between">
                          <span className="flex items-center gap-1.5"><Users size={16} /> Headcount: {aiHeadcount}</span>
                        </label>
                        <input 
                          type="range" 
                          min="50" max="1000" step="10" 
                          value={aiHeadcount} 
                          onChange={(e) => setAiHeadcount(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>50</span>
                          <span>1000</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-1.5 flex items-center gap-1.5">
                          <DollarSign size={16} /> Total Budget (LKR)
                        </label>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setAiBudget(Math.max(0, aiBudget - 10000))} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600"><Minus size={16} /></button>
                          <input 
                            type="number" 
                            value={aiBudget}
                            onChange={(e) => setAiBudget(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 text-sm text-gray-900 text-center font-medium" 
                          />
                          <button onClick={() => setAiBudget(aiBudget + 10000)} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600"><Plus size={16} /></button>
                        </div>
                      </div>
                    </div>

                    {/* Preferences Card */}
                    <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-5">
                        <h3 className="font-semibold text-gray-900">Preferences</h3>
                        
                        <div>
                          <label className="block text-sm text-gray-700 mb-1.5">Event Category</label>
                          <select defaultValue="" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 text-sm text-gray-900 bg-white">
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
                        
                        <div>
                          <label className="block text-sm text-gray-700 mb-1.5">Venue Style</label>
                          <select className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 text-sm text-gray-900 bg-white">
                            <option>Any</option>
                            <option>Modern / High-Tech</option>
                            <option>Classic / Formal</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className="text-sm text-gray-500 mb-1">Calculated Cost Per Head</p>
                        <p className="text-2xl font-bold text-gray-900 mb-4">LKR {costPerHead}</p>
                        <button 
                          onClick={() => setIsAiGenerated(true)}
                          className="w-full bg-[#ef4444] text-white py-3.5 rounded-xl font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                        >
                          <Sparkles size={18} /> Generate Plan
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Right Content Area - Results or Placeholder */}
                  <div className="flex-1 border border-gray-200 rounded-2xl bg-gray-50/30 overflow-hidden flex flex-col">
                    
                    {!isAiGenerated ? (
                      /* Idle State */
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="text-gray-300 mb-4">
                          <Sparkles size={64} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Event Planner</h3>
                        <p className="text-gray-500 max-w-sm">Fill in the event details and click "Generate Plan" to get AI-powered recommendations.</p>
                      </div>
                    ) : (
                      /* Generated State */
                      <div className="flex flex-col h-full bg-white">
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                          <h3 className="text-lg font-medium text-gray-500 mb-6">Intelligent Venue & Budget Recommendation System</h3>
                          
                          {/* Top Highlight Cards */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-5">
                              <p className="flex items-center gap-2 text-sm font-semibold text-[#166534] mb-2">
                                <MapPin size={16} /> Recommended Venue
                              </p>
                              <h4 className="text-xl font-bold text-[#15803d] mb-1">NSBM</h4>
                              <p className="text-sm text-[#16a34a]">Based on {aiHeadcount} people and LKR {costPerHead}/head budget.</p>
                            </div>
                            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-5">
                              <p className="flex items-center gap-2 text-sm font-semibold text-[#1e40af] mb-2">
                                <DollarSign size={16} /> Est. Total Cost
                              </p>
                              <h4 className="text-2xl font-bold text-[#1d4ed8]">LKR {aiBudget.toLocaleString()}</h4>
                            </div>
                          </div>

                          {/* Budget Breakdown Section */}
                          <div className="border border-gray-200 rounded-2xl p-6">
                            <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-6">
                              <div className="w-5 h-5 rounded bg-gradient-to-br from-pink-500 to-orange-400"></div>
                              Suggested Budget Allocation
                            </h4>
                            
                            <div className="flex flex-col xl:flex-row gap-8 items-center">
                              {/* Table */}
                              <div className="flex-1 w-full">
                                <table className="w-full text-sm text-left">
                                  <thead>
                                    <tr className="border-b border-gray-100 text-gray-500">
                                      <th className="pb-3 font-medium"># Category</th>
                                      <th className="pb-3 font-medium text-right">Amount (LKR)</th>
                                      <th className="pb-3 font-medium text-right">Percentage</th>
                                    </tr>
                                  </thead>
                                  <tbody className="text-gray-700">
                                    {aiBudgetData.map((item, index) => (
                                      <tr key={index} className="border-b border-gray-50 last:border-0">
                                        <td className="py-3 font-medium">{index} {item.name}</td>
                                        <td className="py-3 text-right">{item.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className="py-3 text-right text-gray-500">{item.percentage}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              
                              {/* Pie Chart */}
                              <div className="w-[240px] h-[240px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={aiBudgetData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={0}
                                      outerRadius={100}
                                      paddingAngle={2}
                                      dataKey="value"
                                      stroke="none"
                                    >
                                      {aiBudgetData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => `LKR ${value.toLocaleString()}`} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>

                        </div>
                        
                        {/* Right Panel Footer (Actions) */}
                        <div className="p-5 border-t border-gray-200 bg-white flex items-center gap-3 shrink-0 rounded-b-2xl">
                          <button className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">
                            Create Event with AI Plan
                          </button>
                          <button onClick={() => setIsCreateModalOpen(false)} className="bg-white border border-transparent text-gray-500 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 hover:text-gray-700 transition text-sm ml-auto">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}