"use client";
import { Sparkles } from 'lucide-react';
import { 
  Calendar, MapPin, Users, DollarSign, CheckCircle, 
  Clock, AlertCircle 
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
            <div className="bg-indigo-800/40 p-3 rounded-lg flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/30 p-1.5 rounded-full"><CheckCircle size={16}/></div>
                    <span className="text-sm font-medium">Overall Progress</span>
                </div>
                <span className="font-bold">75%</span>
            </div>
             <div className="bg-indigo-800/40 p-3 rounded-lg flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/30 p-1.5 rounded-full"><Clock size={16}/></div>
                     <div className="flex flex-col">
                        <span className="text-xs text-indigo-300">Tasks Completed</span>
                        <span className="text-sm font-bold">16 / 24</span>
                     </div>
                </div>
            </div>
             <div className="bg-indigo-800/40 p-3 rounded-lg flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/30 p-1.5 rounded-full"><AlertCircle size={16}/></div>
                     <div className="flex flex-col">
                        <span className="text-xs text-indigo-300">Pending Tasks</span>
                        <span className="text-sm font-bold">8 High Priority</span>
                     </div>
                </div>
            </div>
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
    </div>
  );
}