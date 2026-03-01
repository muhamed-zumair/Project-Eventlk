"use client";
import React, { useState } from 'react';
import { 
  Sparkles, Calendar, MapPin, Users, DollarSign, 
  CheckCircle, Clock, AlertCircle, Pencil, X, Trash2, Plus,
  FileText, Mail, Phone, User, Check
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

// --- MOCK DATA (Replace with API call) ---
const chartData = [
  { day: 'Mon', registration: 450, actual: 40 },
  { day: 'Tue', registration: 52, actual: 48 },
  { day: 'Wed', registration: 60, actual: 58 },
  { day: 'Thu', registration: 55, actual: 52 },
  { day: 'Fri', registration: 70, actual: 65 },
  { day: 'Sat', registration: 85, actual: 80 },
  { day: 'Sun', registration: 90, actual: 88 },
];

export default function DashboardHome() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* HERO SECTION - Annual Tech Summit */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/50 rounded-full text-xs font-medium">Currently Planning</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">In Progress</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Annual Tech Summit 2025</h1>
            <p className="text-indigo-200 text-sm max-w-2xl">
              Annual technology summit featuring keynote speakers, workshops, and networking sessions for students and industry professionals.
            </p>
          </div>
          <div className="bg-indigo-700/50 p-4 rounded-xl text-center min-w-[100px]">
            <span className="block text-3xl font-bold">12</span>
            <span className="text-xs text-indigo-200">Days to go</span>
          </div>
        </div>

        {/* Stats Grid inside Hero */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs">
              <Calendar size={14} /> Event Date
            </div>
            <p className="font-semibold">December 25, 2024</p>
          </div>
          <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs">
              <MapPin size={14} /> Venue
            </div>
            <p className="font-semibold">Main Hall, University Campus</p>
          </div>
          <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs">
              <Users size={14} /> Registrations
            </div>
            <div className="flex justify-between items-end">
              <p className="font-semibold">168 / 200</p>
            </div>
            <div className="w-full bg-indigo-900/50 h-1.5 rounded-full mt-2">
              <div className="bg-white h-1.5 rounded-full" style={{ width: '84%' }}></div>
            </div>
          </div>
          <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs">
              <DollarSign size={14} /> Budget Used
            </div>
            <p className="font-semibold">$45,200 / $60,000</p>
            <div className="w-full bg-indigo-900/50 h-1.5 rounded-full mt-2">
              <div className="bg-white h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        {/* Progress Bar Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-800/40 p-4 rounded-xl flex flex-col justify-center">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-indigo-200"/>
                        <span className="text-sm font-medium text-white">Overall Progress</span>
                    </div>
                    <span className="text-sm font-bold text-white">75%</span>
                </div>
                <div className="w-full bg-indigo-900/50 h-1.5 rounded-full">
                    <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
            </div>
             <div className="bg-indigo-800/40 p-4 rounded-xl flex items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/30 p-1.5 rounded-full text-indigo-200"><Clock size={16}/></div>
                     <div className="flex flex-col">
                        <span className="text-xs text-indigo-200">Tasks Completed</span>
                        <span className="text-sm font-bold mt-0.5">16 / 24</span>
                     </div>
                </div>
            </div>
             <div className="bg-indigo-800/40 p-4 rounded-xl flex items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/30 p-1.5 rounded-full text-indigo-200"><AlertCircle size={16}/></div>
                     <div className="flex flex-col">
                        <span className="text-xs text-indigo-200">Pending Tasks</span>
                        <span className="text-sm font-bold mt-0.5">8 High Priority</span>
                     </div>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-4">
          <button 
            onClick={() => setIsDetailsModalOpen(true)}
            className="bg-white text-indigo-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            View Full Details
          </button>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="bg-indigo-500/20 border border-indigo-400/30 text-white p-2.5 rounded-lg hover:bg-indigo-500/40 transition-colors flex items-center justify-center"
            title="Edit Event"
          >
            <Pencil size={20} />
          </button>
        </div>
      </div>

      {/* QUICK STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
            { label: 'Total Attendees', val: '1,248', icon: Users, color: 'bg-blue-100 text-blue-600', change: '+12.5%', isPos: true },
            { label: 'Budget Status', val: '$45,200', sub: 'of $60,000', icon: DollarSign, color: 'bg-green-100 text-green-600', progress: 75 },
            { label: 'Pending Tasks', val: '8', sub: 'High Priority', icon: CheckCircle, color: 'bg-orange-100 text-orange-600' },
            { label: 'Days Until Next Event', val: '12', sub: 'Annual Tech Summit', icon: Clock, color: 'bg-indigo-100 text-indigo-600' }
        ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                        <stat.icon size={20} />
                    </div>
                    {stat.change && (
                        <span className={`text-xs font-medium ${stat.isPos ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                        </span>
                    )}
                </div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.val}</p>
                {stat.sub && <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>}
                {stat.progress && (
                     <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${stat.progress}%` }}></div>
                     </div>
                )}
            </div>
        ))}
      </div>

      {/* CHARTS & RECOMMENDATIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Real-time Attendance Trends</h3>
            <p className="text-sm text-gray-400 mb-6">Registration vs. Actual Attendance (Last 7 Days)</p>
            
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <Tooltip />
                        <Line type="monotone" dataKey="registration" stroke="#818cf8" strokeWidth={2} dot={{r: 4, fill: '#818cf8'}} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="actual" stroke="#34d399" strokeWidth={2} dot={{r: 4, fill: '#34d399'}} activeDot={{r: 6}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Right: AI Suggestions */}
        <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} />
                <h3 className="font-bold">AI Suggestions</h3>
            </div>
            
            <div className="space-y-4 flex-1">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/20 transition cursor-pointer">
                    <div className="flex items-start gap-3">
                         <div className="bg-indigo-500/50 p-1.5 rounded-md"><MapPin size={14}/></div>
                         <div>
                            <p className="text-xs text-indigo-200 mb-1">Venue Recommendation</p>
                            <p className="text-sm font-medium leading-snug">Venue "Main Hall" aligns best with your current headcount.</p>
                         </div>
                    </div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/20 transition cursor-pointer">
                    <div className="flex items-start gap-3">
                         <div className="bg-indigo-500/50 p-1.5 rounded-md"><DollarSign size={14}/></div>
                         <div>
                            <p className="text-xs text-indigo-200 mb-1">Budget Optimization</p>
                            <p className="text-sm font-medium leading-snug">You can save ~$2,400 by booking catering before Friday.</p>
                         </div>
                    </div>
                </div>
            </div>
            
            <button className="w-full bg-white text-indigo-600 py-3 rounded-lg text-sm font-bold mt-6 hover:bg-indigo-50 transition">
                View All Recommendations
            </button>
        </div>
      </div>

      {/* VIEW FULL DETAILS MODAL */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#4f46e5] p-6 text-white flex justify-between items-start shrink-0">
               <div>
                  <h2 className="text-2xl font-medium mb-2">Annual Tech Summit 2025</h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Currently Planning</span>
                    <span className="px-3 py-1 bg-[#10b981] rounded-full text-xs font-medium">In Progress</span>
                  </div>
               </div>
               <button onClick={() => setIsDetailsModalOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <X size={24} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar bg-white">
               
               {/* Event Information */}
               <section>
                  <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Information</h3>
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6 space-y-6">
                    <div className="flex gap-4">
                      <Calendar className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-medium text-gray-900">Date & Time</h4>
                        <p className="text-gray-600 text-sm mt-1">December 25, 2024 • 9:00 AM - 5:00 PM</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <MapPin className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-medium text-gray-900">Venue</h4>
                        <p className="text-gray-600 text-sm mt-1">Main Hall, University Campus</p>
                        <p className="text-gray-500 text-sm mt-0.5">123 University Ave, Campus Building A, Room 101</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <FileText className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-medium text-gray-900">Description</h4>
                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                          Annual technology summit featuring keynote speakers, workshops, and networking sessions for students and industry professionals. This flagship event brings together the brightest minds in technology to share insights, network, and collaborate on innovative solutions.
                        </p>
                      </div>
                    </div>
                  </div>
               </section>

               {/* Event Statistics */}
               <section>
                  <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#eff6ff] border border-blue-100 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-blue-600 mb-3">
                        <Users size={18} />
                        <span className="font-medium text-sm">Attendance</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">168</p>
                      <p className="text-sm text-gray-600">of 200 expected</p>
                    </div>
                    <div className="bg-[#f0fdf4] border border-green-100 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-green-600 mb-3">
                        <DollarSign size={18} />
                        <span className="font-medium text-sm">Budget Spent</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">$45.2K</p>
                      <p className="text-sm text-gray-600">$14.8K remaining</p>
                    </div>
                    <div className="bg-[#fdf4ff] border border-fuchsia-100 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-fuchsia-600 mb-3">
                        <CheckCircle size={18} />
                        <span className="font-medium text-sm">Progress</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">75%</p>
                      <p className="text-sm text-gray-600">Overall completion</p>
                    </div>
                  </div>
               </section>

               {/* Event Organizer */}
               <section>
                  <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Organizer</h3>
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <User size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900 text-lg">Sarah Mitchell</h4>
                      <p className="text-gray-500 text-sm">Chairperson</p>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                        <Mail size={14} /> sarah.mitchell@eventlk.com
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Phone size={14} /> +1 (555) 123-4567
                      </div>
                    </div>
                  </div>
               </section>

               {/* Event Agenda */}
               <section>
                  <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Agenda</h3>
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden">
                    {[
                      { time: "9:00 AM - 9:30 AM", title: "Registration & Welcome Coffee" },
                      { time: "9:30 AM - 10:00 AM", title: "Opening Ceremony" },
                      { time: "10:00 AM - 11:30 AM", title: "Keynote: Future of AI" },
                      { time: "11:30 AM - 12:30 PM", title: "Workshop Session 1" },
                      { time: "12:30 PM - 1:30 PM", title: "Lunch Break" },
                      { time: "1:30 PM - 3:00 PM", title: "Panel Discussion" },
                      { time: "3:00 PM - 4:30 PM", title: "Workshop Session 2" },
                      { time: "4:30 PM - 5:00 PM", title: "Closing Remarks" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-6 p-4 border-b border-gray-100 last:border-0 items-center">
                        <div className="flex items-center gap-2 text-indigo-500 w-48 shrink-0 text-sm font-medium">
                          <Clock size={16} /> {item.time}
                        </div>
                        <p className="text-gray-800 font-medium">{item.title}</p>
                      </div>
                    ))}
                  </div>
               </section>

               {/* Featured Speakers */}
               <section>
                  <h3 className="text-lg text-gray-800 mb-4 font-medium">Featured Speakers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Dr. Emily Chen", role: "AI Research Lead, Tech Corp" },
                      { name: "Marcus Johnson", role: "CTO, StartupX" },
                      { name: "Prof. Amelia Rodriguez", role: "Computer Science Dept" },
                      { name: "David Kim", role: "Product Manager, Innovation Labs" },
                    ].map((speaker, idx) => (
                      <div key={idx} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{speaker.name}</h4>
                          <p className="text-gray-500 text-sm">{speaker.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </section>

               {/* Sponsors */}
               <section>
                  <h3 className="text-lg text-gray-800 mb-4 font-medium">Sponsors</h3>
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden">
                    {[
                      { name: "TechCorp", tier: "Platinum Sponsor", tierColor: "bg-fuchsia-100 text-fuchsia-700", amount: "$15,000" },
                      { name: "Innovation Labs", tier: "Gold Sponsor", tierColor: "bg-amber-100 text-amber-700", amount: "$10,000" },
                      { name: "StartupX", tier: "Silver Sponsor", tierColor: "bg-gray-200 text-gray-700", amount: "$5,000" },
                    ].map((sponsor, idx) => (
                      <div key={idx} className="flex justify-between items-center p-5 border-b border-gray-100 last:border-0">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{sponsor.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${sponsor.tierColor}`}>
                            {sponsor.tier}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">{sponsor.amount}</p>
                      </div>
                    ))}
                  </div>
               </section>

               {/* Event Requirements */}
               <section>
                  <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Requirements</h3>
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">
                    <ul className="space-y-4">
                      {[
                        "AV Equipment: Projector, Microphones, Speakers",
                        "Catering: Breakfast, Lunch, Refreshments for 200",
                        "Seating: Auditorium style for 200",
                        "WiFi: High-speed internet access",
                        "Registration Desk: 2 staff members",
                        "Security: 3 personnel",
                      ].map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="text-green-500 mt-0.5 shrink-0" size={18} />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
               </section>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center gap-3 shrink-0 bg-white">
               <button className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">
                 Download PDF
               </button>
               <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                 Share Event
               </button>
               <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                 Print
               </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#4f46e5] p-6 text-white flex justify-between items-start shrink-0">
               <div>
                  <h2 className="text-2xl font-medium">Edit Event</h2>
                  <p className="text-indigo-200 mt-1 text-sm">Update event details and information</p>
               </div>
               <button onClick={() => setIsEditModalOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full transition">
                  <X size={24} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
               
               {/* Basic Information */}
               <section>
                  <h3 className="text-lg text-gray-800 mb-4 font-medium">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Event Title</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Event Date</label>
                        <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                        <input type="time" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">End Time</label>
                        <input type="time" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Venue</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Venue Address</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Expected Attendees</label>
                        <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Budget ($)</label>
                        <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Description</label>
                      <textarea rows={4} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] resize-none text-gray-900"></textarea>
                    </div>
                  </div>
               </section>

               <hr className="border-gray-100" />

               {/* Organizer Information */}
               <section>
                  <h3 className="text-lg text-gray-800 mb-4 font-medium">Organizer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Organizer Name</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Role</label>
                      <input type="text" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email</label>
                      <input type="email" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Phone</label>
                      <input type="tel" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>
                  </div>
               </section>

               <hr className="border-gray-100" />

               {/* Event Agenda */}
               <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg text-gray-800 font-medium">Event Agenda</h3>
                    <button className="flex items-center gap-1 bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                      <Plus size={16} /> Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex gap-4 items-center">
                        <input type="text" className="w-1/3 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                        <input type="text" className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                        <button className="text-red-500 hover:text-red-700 p-2">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
               </section>

               <hr className="border-gray-100" />

               {/* Speakers */}
               <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg text-gray-800 font-medium">Speakers</h3>
                    <button className="flex items-center gap-1 bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                      <Plus size={16} /> Add Speaker
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex gap-4 items-center">
                        <input type="text" className="w-1/2 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                        <input type="text" className="w-1/2 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                        <button className="text-red-500 hover:text-red-700 p-2">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
               </section>

               <hr className="border-gray-100" />

               {/* Sponsors */}
               <section>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg text-gray-800 font-medium">Sponsors</h3>
                    <button className="flex items-center gap-1 bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                      <Plus size={16} /> Add Sponsor
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex gap-4 items-center">
                        <input type="text" className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                        <input type="text" className="w-32 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                        <input type="text" className="w-32 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                        <button className="text-red-500 hover:text-red-700 p-2">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
               </section>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center gap-3 shrink-0 bg-white">
               <button className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">
                 Save Changes
               </button>
               <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
               >
                 Cancel
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}