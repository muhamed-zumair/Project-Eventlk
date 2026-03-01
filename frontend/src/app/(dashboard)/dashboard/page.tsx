"use client";
import { useState } from 'react';
import { 
  Sparkles, ArrowRight, X, AlignLeft, Mail, Phone, User
} from 'lucide-react';
import { 
  Calendar, MapPin, Users, DollarSign, CheckCircle, 
  Clock, AlertCircle, TrendingUp
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

// --- MOCK DATA ---
const chartData = [
  { day: 'Mon', registration: 450, actual: 40 },
  { day: 'Tue', registration: 52, actual: 48 },
  { day: 'Wed', registration: 60, actual: 58 },
  { day: 'Thu', registration: 55, actual: 52 },
  { day: 'Fri', registration: 70, actual: 65 },
  { day: 'Sat', registration: 85, actual: 80 },
  { day: 'Sun', registration: 90, actual: 88 },
];

// Custom Tooltip for the Chart to make it look premium
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100">
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm mt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 capitalize">{entry.name}:</span>
            <span className="font-bold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h2>
      </div>

      {/* HERO SECTION - Annual Tech Summit */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200/50">
        {/* Decorative background blur elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-xs font-semibold tracking-wide">
                Currently Planning
              </span>
              <span className="px-3 py-1 bg-emerald-400/20 backdrop-blur-md border border-emerald-400/20 text-emerald-200 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                In Progress
              </span>
            </div>
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Annual Tech Summit 2025</h1>
            <p className="text-indigo-100/80 text-sm max-w-2xl leading-relaxed">
              Annual technology summit featuring keynote speakers, workshops, and networking sessions for students and industry professionals.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center min-w-[120px] shadow-lg shrink-0">
            <span className="block text-4xl font-black mb-1">12</span>
            <span className="text-xs font-medium text-indigo-100 uppercase tracking-wider">Days to go</span>
          </div>
        </div>

        {/* Stats Grid inside Hero */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Event Date', val: 'Dec 25, 2024', icon: Calendar },
            { label: 'Venue', val: 'Main Hall, Campus', icon: MapPin },
            { label: 'Registrations', val: '168 / 200', icon: Users, progress: 84 },
            { label: 'Budget Used', val: '$45.2k / $60k', icon: DollarSign, progress: 75 },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-2 text-indigo-100 mb-2 text-xs font-medium uppercase tracking-wider">
                <stat.icon size={14} className="text-indigo-300" /> {stat.label}
              </div>
              <p className="font-bold text-lg">{stat.val}</p>
              {stat.progress && (
                <div className="w-full bg-indigo-950/40 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-300 to-white h-full rounded-full" style={{ width: `${stat.progress}%` }}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar Row */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-indigo-950/30 backdrop-blur-sm border border-white/5 p-4 rounded-2xl flex flex-col justify-center">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-400"/>
                        <span className="text-sm font-semibold text-white">Overall Progress</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">75%</span>
                </div>
                <div className="w-full bg-indigo-950/50 h-2 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-full rounded-full" style={{ width: '75%' }}></div>
                </div>
            </div>
             <div className="bg-indigo-950/30 backdrop-blur-sm border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl text-indigo-200">
                  <Clock size={20}/>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-indigo-200/80 uppercase tracking-wider">Tasks Completed</span>
                  <span className="text-lg font-bold mt-0.5">16 <span className="text-indigo-300 text-sm font-medium">/ 24</span></span>
                </div>
            </div>
             <div className="bg-indigo-950/30 backdrop-blur-sm border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                <div className="bg-rose-500/20 p-2.5 rounded-xl text-rose-300">
                  <AlertCircle size={20}/>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-indigo-200/80 uppercase tracking-wider">Pending Tasks</span>
                  <span className="text-lg font-bold mt-0.5">8 <span className="text-rose-300 text-sm font-medium">High Priority</span></span>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 mt-8 flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-indigo-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-50 hover:shadow-lg hover:shadow-white/20 transition-all active:scale-95 flex items-center gap-2"
          >
            View Full Details <ArrowRight size={16} />
          </button>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/20 transition-all active:scale-95">
            Edit Event
          </button>
        </div>
      </div>

      {/* QUICK STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'Total Attendees', val: '1,248', icon: Users, color: 'bg-blue-50 text-blue-600', change: '+12.5%', isPos: true },
            { label: 'Budget Status', val: '$45,200', sub: 'of $60,000', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', progress: 75 },
            { label: 'Pending Tasks', val: '8', sub: 'High Priority', icon: CheckCircle, color: 'bg-orange-50 text-orange-600' },
            { label: 'Next Event In', val: '12 Days', sub: 'Annual Tech Summit', icon: Clock, color: 'bg-indigo-50 text-indigo-600' }
        ].map((stat, i) => (
            <div key={i} className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 cursor-default">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                        <stat.icon size={22} strokeWidth={2.5} />
                    </div>
                    {stat.change && (
                        <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.isPos ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {stat.isPos && <TrendingUp size={12} />}
                            {stat.change}
                        </span>
                    )}
                </div>
                <h3 className="text-gray-500 text-sm font-semibold mb-1">{stat.label}</h3>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.val}</p>
                {stat.sub && <p className="text-sm font-medium text-gray-400 mt-1">{stat.sub}</p>}
                {stat.progress && (
                     <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stat.progress}%` }}></div>
                     </div>
                )}
            </div>
        ))}
      </div>

      {/* CHARTS & RECOMMENDATIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Real-time Attendance Trends</h3>
                <p className="text-sm font-medium text-gray-500">Registration vs. Actual Attendance (Last 7 Days)</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500"></div>Registration</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400"></div>Actual</div>
              </div>
            </div>
            
            <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="registration" name="Registrations" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" activeDot={{r: 6, strokeWidth: 0, fill: '#6366f1'}} />
                        <Area type="monotone" dataKey="actual" name="Actual Attendance" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" activeDot={{r: 6, strokeWidth: 0, fill: '#34d399'}} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Right: AI Suggestions */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col border border-indigo-900/50">
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">AI Insights</h3>
            </div>
            
            <div className="relative z-10 space-y-4 flex-1">
                <div className="group bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                         <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-300 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                           <MapPin size={18}/>
                         </div>
                         <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5">Venue Match</p>
                            <p className="text-sm font-medium leading-relaxed text-indigo-50/90">Venue "Main Hall" aligns perfectly with your current 168 projected headcount.</p>
                         </div>
                    </div>
                </div>
                
                <div className="group bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                         <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                           <DollarSign size={18}/>
                         </div>
                         <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">Budget Optimization</p>
                            <p className="text-sm font-medium leading-relaxed text-indigo-50/90">You can save roughly <span className="text-emerald-300 font-bold">$2,400</span> by finalizing catering before Friday.</p>
                         </div>
                    </div>
                </div>
            </div>
            
            <button className="relative z-10 w-full mt-8 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 py-3.5 rounded-xl text-sm font-bold hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-lg">
                View All Recommendations
            </button>
        </div>
      </div>

      {/* --- MODAL POPUP --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-start text-white shrink-0">
              <div>
                <h2 className="text-xl font-bold mb-2">Annual Tech Summit 2025</h2>
                <div className="flex gap-2">
                  <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[11px] font-medium tracking-wide">
                    Currently Planning
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500 text-white rounded-full text-[11px] font-medium tracking-wide">
                    In Progress
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white">
              
              {/* Event Information */}
              <div className="space-y-4">
                <h3 className="text-gray-800 font-semibold flex items-center gap-2">
                  Event Information
                </h3>
                <div className="grid gap-4 ml-1">
                  <div className="flex gap-3">
                    <Calendar size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Date & Time</p>
                      <p className="text-sm text-gray-600 mt-0.5">December 25, 2024 • 9:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Venue</p>
                      <p className="text-sm text-gray-600 mt-0.5">Main Hall, University Campus</p>
                      <p className="text-sm text-gray-500">123 University Ave, Campus Building A, Room 101</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <AlignLeft size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Description</p>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                        Annual technology summit featuring keynote speakers, workshops, and networking sessions for students and industry professionals. This flagship event brings together the brightest minds in technology to share insights, network, and collaborate on innovative solutions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Statistics */}
              <div className="space-y-4">
                <h3 className="text-gray-800 font-semibold">Event Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                      <Users size={16} /> <span className="text-sm font-medium">Attendance</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">168</p>
                    <p className="text-xs text-gray-500 mt-1">of 200 expected</p>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <DollarSign size={16} /> <span className="text-sm font-medium">Budget Spent</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$45.2K</p>
                    <p className="text-xs text-gray-500 mt-1">$14.8K remaining</p>
                  </div>
                  <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <CheckCircle size={16} /> <span className="text-sm font-medium">Progress</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">75%</p>
                    <p className="text-xs text-gray-500 mt-1">Overall completion</p>
                  </div>
                </div>
              </div>

              {/* Event Organizer */}
              <div className="space-y-4">
                <h3 className="text-gray-800 font-semibold">Event Organizer</h3>
                <div className="flex items-center gap-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Mitchell</p>
                    <p className="text-sm text-gray-500">Chairperson</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                      <p className="text-xs text-gray-600 flex items-center gap-1.5"><Mail size={14} className="text-gray-400"/> sarah.mitchell@eventlk.com</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1.5"><Phone size={14} className="text-gray-400"/> +1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Agenda */}
              <div className="space-y-4">
                <h3 className="text-gray-800 font-semibold">Event Agenda</h3>
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 bg-white">
                  {[
                    { time: '9:00 AM - 9:30 AM', title: 'Registration & Welcome Coffee' },
                    { time: '9:30 AM - 10:00 AM', title: 'Opening Ceremony' },
                    { time: '10:00 AM - 11:30 AM', title: 'Keynote: Future of AI' },
                    { time: '11:30 AM - 12:30 PM', title: 'Workshop Session 1' },
                    { time: '12:30 PM - 1:30 PM', title: 'Lunch Break' },
                    { time: '1:30 PM - 3:00 PM', title: 'Panel Discussion' },
                    { time: '3:00 PM - 4:30 PM', title: 'Workshop Session 2' },
                    { time: '4:30 PM - 5:00 PM', title: 'Closing Remarks' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                      <div className="w-48 shrink-0 flex items-center gap-2 text-indigo-600">
                        <Clock size={16} />
                        <span className="text-sm font-medium">{item.time}</span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Speakers */}
              <div className="space-y-4">
                <h3 className="text-gray-800 font-semibold">Featured Speakers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Dr. Emily Chen', role: 'AI Research Lead, Tech Corp' },
                    { name: 'Marcus Johnson', role: 'CTO, StartupX' },
                    { name: 'Prof. Amelia Rodriguez', role: 'Computer Science Dept' },
                    { name: 'David Kim', role: 'Product Manager, Innovation Labs' },
                  ].map((speaker, i) => (
                    <div key={i} className="flex items-center gap-3 border border-gray-100 rounded-xl p-4 hover:border-indigo-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{speaker.name}</p>
                        <p className="text-xs text-gray-500">{speaker.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sponsors */}
              <div className="space-y-4">
                <h3 className="text-gray-800 font-semibold">Sponsors</h3>
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 bg-white">
                  {[
                    { name: 'TechCorp', tier: 'Platinum Sponsor', amount: '$15,000', badgeClass: 'bg-purple-100 text-purple-700' },
                    { name: 'Innovation Labs', tier: 'Gold Sponsor', amount: '$10,000', badgeClass: 'bg-amber-100 text-amber-700' },
                    { name: 'StartupX', tier: 'Silver Sponsor', amount: '$5,000', badgeClass: 'bg-gray-100 text-gray-700' },
                  ].map((sponsor, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm mb-1">{sponsor.name}</p>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${sponsor.badgeClass}`}>
                          {sponsor.tier}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900">{sponsor.amount}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Requirements */}
              <div className="space-y-4">
                <h3 className="text-gray-800 font-semibold">Event Requirements</h3>
                <div className="space-y-3 pl-1">
                  {[
                    'AV Equipment: Projector, Microphones, Speakers',
                    'Catering: Breakfast, Lunch, Refreshments for 200',
                    'Seating: Auditorium style for 200',
                    'WiFi: High-speed internet access',
                    'Registration Desk: 2 staff members',
                    'Security: 3 personnel'
                  ].map((req, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{req}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center gap-4">
                <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                  Download PDF
                </button>
                <button className="bg-white text-indigo-600 border border-indigo-200 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors">
                  Share Event
                </button>
                <button className="bg-white text-gray-600 border border-gray-200 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Print
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}