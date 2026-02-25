"use client";

import { Mail, Phone, MoreVertical } from "lucide-react";

// --- Types ---
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  tasksDone: number;
  activeEvents: number;
  initials: string;
  colorClass: string; // To match the specific avatar colors in the screenshot
}

// --- Mock Data ---
const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Chairperson",
    email: "sarah.mitchell@eventlk.com",
    phone: "+1 (555) 123-4567",
    tasksDone: 24,
    activeEvents: 3,
    initials: "SM",
    colorClass: "bg-indigo-600",
  },
  {
    id: "2",
    name: "John Davis",
    role: "Event Coordinator",
    email: "john.davis@eventlk.com",
    phone: "+1 (555) 234-5678",
    tasksDone: 18,
    activeEvents: 2,
    initials: "JD",
    colorClass: "bg-blue-600",
  },
  {
    id: "3",
    name: "Emily Chen",
    role: "Budget Manager",
    email: "emily.chen@eventlk.com",
    phone: "+1 (555) 345-6789",
    tasksDone: 31,
    activeEvents: 4,
    initials: "EC",
    colorClass: "bg-purple-600",
  },
  {
    id: "4",
    name: "Michael Brown",
    role: "Marketing Lead",
    email: "michael.brown@eventlk.com",
    phone: "+1 (555) 456-7890",
    tasksDone: 15,
    activeEvents: 2,
    initials: "MB",
    colorClass: "bg-green-600",
  },
  {
    id: "5",
    name: "Lisa Anderson",
    role: "Logistics Manager",
    email: "lisa.anderson@eventlk.com",
    phone: "+1 (555) 567-8901",
    tasksDone: 22,
    activeEvents: 3,
    initials: "LA",
    colorClass: "bg-pink-600",
  },
  {
    id: "6",
    name: "David Wilson",
    role: "Technical Support",
    email: "david.wilson@eventlk.com",
    phone: "+1 (555) 678-9012",
    tasksDone: 12,
    activeEvents: 1,
    initials: "DW",
    colorClass: "bg-orange-600",
  },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Team</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your event planning team</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
          Invite Member
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Card Header: Avatar & Menu */}
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${member.colorClass}`}
              >
                {member.initials}
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Member Info */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{member.role}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  <span>{member.phone}</span>
                </div>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Tasks Done</p>
                <p className="text-lg font-bold text-gray-800">{member.tasksDone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Active Events</p>
                <p className="text-lg font-bold text-gray-800">{member.activeEvents}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}