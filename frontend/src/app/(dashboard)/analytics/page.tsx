"use client";

import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';

// --- MOCK DATA ---

// Top Stats
const stats = [
  { label: 'Total Events', value: '27', change: '+15% vs last period', icon: Calendar, color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Total Attendees', value: '2,860', change: '+22% vs last period', icon: Users, color: 'bg-green-50 text-green-600' },
  { label: 'Total Budget', value: '$298K', change: '94% utilized', icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
  { label: 'Avg Attendance', value: '106', change: '+8% vs last period', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
];

// Bar Chart Data (Monthly Attendance)
const barData = [
  { name: 'Jul', attendance: 380 },
  { name: 'Aug', attendance: 520 },
  { name: 'Sep', attendance: 290 },
  { name: 'Oct', attendance: 640 },
  { name: 'Nov', attendance: 450 },
  { name: 'Dec', attendance: 580 },
];

// Pie Chart Data (Event Type Distribution)
const pieData = [
  { name: 'Conferences', value: 35 },
  { name: 'Workshops', value: 25 },
  { name: 'Networking', value: 20 },
  { name: 'Social', value: 20 },
];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6']; // Indigo, Green, Amber, Violet

// Line Chart Data (Budget vs Spending)
const lineData = [
  { month: 'Jul', budget: 45000, spending: 42000 },
  { month: 'Aug', budget: 52000, spending: 49000 },
  { month: 'Sep', budget: 38000, spending: 36000 },
  { month: 'Oct', budget: 62000, spending: 60000 },
  { month: 'Nov', budget: 48000, spending: 45000 },
  { month: 'Dec', budget: 55000, spending: 51000 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header Text */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Detailed insights and performance metrics</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-xs text-green-600 font-medium">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Middle Row: Bar Chart & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Attendance Trends */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Monthly Attendance Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="attendance" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Type Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Event Type Distribution</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Line Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Budget vs Spending Trends</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{r: 4, fill: '#6366f1', strokeWidth: 0}} 
                activeDot={{r: 6}} 
              />
              <Line 
                type="monotone" 
                dataKey="spending" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{r: 4, fill: '#10b981', strokeWidth: 0}} 
                activeDot={{r: 6}} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}