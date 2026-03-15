"use client";

import { useState } from "react";
import { Mail, X, CalendarDays, User } from "lucide-react";

// --- Types ---
// Notice how clean this is now! This perfectly matches what the database will send.
interface TeamMember {
  id: string;
  eventId: string;
  name: string;
  role: string;
  email: string;
}

// --- Mock Events ---
const myEvents = [
  { id: 'evt_1', name: "Annual Tech Summit 2026" },
  { id: 'evt_2', name: "Spring Conference" },
];

// --- Mock Data ---
const initialTeamMembers: TeamMember[] = [
  { id: "1", eventId: "evt_1", name: "Sarah Mitchell", role: "President", email: "sarah.mitchell@eventlk.com" },
  { id: "2", eventId: "evt_1", name: "John Davis", role: "Secretary", email: "john.davis@eventlk.com" },
  { id: "3", eventId: "evt_1", name: "Emily Chen", role: "Treasurer", email: "emily.chen@eventlk.com" },
  { id: "4", eventId: "evt_1", name: "Michael Brown", role: "Team Lead", email: "michael.brown@eventlk.com" },
  
  { id: "5", eventId: "evt_2", name: "Sarah Mitchell", role: "Volunteer", email: "sarah.mitchell@eventlk.com" },
  { id: "6", eventId: "evt_2", name: "Lisa Anderson", role: "President", email: "lisa.anderson@eventlk.com" },
  { id: "7", eventId: "evt_2", name: "David Wilson", role: "Team Lead", email: "david.wilson@eventlk.com" },
];

// --- Helper Functions ---
// 1. Automatically grab the first letters of their names
const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

// 2. Automatically assign a consistent color based on their email
const getColorClass = (email: string) => {
  const colors = [
    'bg-indigo-600', 'bg-blue-600', 'bg-purple-600', 
    'bg-green-600', 'bg-pink-600', 'bg-orange-600', 'bg-teal-600'
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function TeamPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>(myEvents[0].id);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>(initialTeamMembers);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  const currentEventTeam = members.filter(m => m.eventId === selectedEventId);

  const handleSendInvite = () => {
    if (!inviteEmail || !inviteRole) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      eventId: selectedEventId,
      name: inviteEmail.split('@')[0].replace('.', ' '), // Temporary fake name until they sign up
      role: inviteRole,
      email: inviteEmail,
    };

    setMembers([...members, newMember]);
    setIsInviteModalOpen(false);
    setInviteEmail("");
    setInviteRole("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Team</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your event planning team</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 border border-indigo-100 p-1.5 rounded-lg flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-md text-indigo-600 shadow-sm">
              <CalendarDays size={18} />
            </div>
            <select 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-sm font-bold text-indigo-900 outline-none pr-4 cursor-pointer"
            >
              {myEvents.map(evt => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
          >
            Invite Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEventTeam.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${getColorClass(member.email)}`}>
                {getInitials(member.name)}
              </div>
            </div>

            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-800 capitalize">{member.name}</h3>
              <p className="text-sm font-medium text-indigo-600 mb-4">{member.role}</p>

              <div className="space-y-2 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {currentEventTeam.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
               <User size={32} />
            </div>
            <p className="text-gray-500 font-medium">No team members assigned to this event yet.</p>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              Click here to invite someone
            </button>
          </div>
        )}
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-medium text-gray-800">Invite Team Member</h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><X size={24} /></button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg text-sm flex items-center gap-2 font-medium">
                <CalendarDays size={16} />
                Inviting to: {myEvents.find(e => e.id === selectedEventId)?.name}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g., student@university.edu"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Role *</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  <option value="" disabled>Select a role...</option>
                  <option value="President">President</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center gap-3 bg-gray-50/50 shrink-0">
              <button onClick={handleSendInvite} disabled={!inviteEmail || !inviteRole} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Send Invite</button>
              <button onClick={() => setIsInviteModalOpen(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}