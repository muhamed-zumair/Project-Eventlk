"use client";

import { fetchAPI } from "../../../utils/api";
import React, { useState, useEffect } from "react";
import {
  Mail, X, CalendarDays, User, MoreVertical,
  Shield, UserMinus, AlertCircle, CheckCircle, Rocket, AlertTriangle,
  Loader2, Users,UserPlus
} from "lucide-react";
import { useEventContext } from "../../../context/EventContext"; // 🚀 1. Import the Brain

// --- Types ---
interface EventItem {
  id: string;
  title: string;
  status: string;
}

interface TeamMember {
  id: string; // user_id or invite_id
  name?: string; // Might be null if pending
  email: string;
  role: string;
  status: 'Active' | 'Pending';
}

// --- Helper Functions ---
const getInitials = (name: string, email: string) => {
  if (name && name !== "TBA") {
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
  // Fallback to first letter of email if no name
  return email.substring(0, 2).toUpperCase();
};

const getColorClass = (email: string) => {
  const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-pink-600', 'bg-orange-600', 'bg-teal-600'];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function TeamPage() {
  // 🚀 1. Hook into the Global Selector Brain
  const { myRole, selectedEventId, setSelectedEventId } = useEventContext(); 

  // --- States ---
  const [activeEvents, setActiveEvents] = useState<EventItem[]>([]);
  const [pastEvents, setPastEvents] = useState<EventItem[]>([]);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  // Invite Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  // --- NEW: Management Modal States ---
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [memberToManage, setMemberToManage] = useState<TeamMember | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- Fetch Initial Events ---
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const [activeRes, pastRes] = await Promise.all([
          fetchAPI('/events', { method: 'GET' }),
          fetchAPI('/events/past', { method: 'GET' })
        ]);

        if (activeRes.success) setActiveEvents(activeRes.events || []);
        if (pastRes.success) setPastEvents(pastRes.events || []);

        // 🚀 Only set the global ID if the Topbar hasn't initialized one yet
        if (!selectedEventId) {
          if (activeRes.events && activeRes.events.length > 0) {
            setSelectedEventId(activeRes.events[0].id);
          } else if (pastRes.events && pastRes.events.length > 0) {
            setSelectedEventId(pastRes.events[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load events for team page", error);
      }
    };
    loadEvents();
  }, []);

  // --- Fetch Team Members when Event changes ---
  useEffect(() => {
    const loadTeam = async () => {
      if (!selectedEventId) return;
      setIsLoadingTeam(true);
      try {
        const response = await fetchAPI(`/events/${selectedEventId}`, { method: 'GET' });
        if (response.success && response.event.team) {
          const formattedTeam = response.event.team.map((m: any) => ({
            id: m.id,
            name: m.first_name ? `${m.first_name} ${m.last_name || ''}` : "TBA",
            email: m.email,
            role: m.role,
            status: m.status
          }));
          setMembers(formattedTeam);
        }
      } catch (error) {
        console.error("Failed to load team members", error);
      } finally {
        setIsLoadingTeam(false);
      }
    };
    loadTeam();
  }, [selectedEventId, refreshTrigger]);
  
  // --- NEW: Listen for Global WebSocket Refreshes ---
  useEffect(() => {
    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

    window.addEventListener("teamRefresh", handleRefresh);
    window.addEventListener("eventCreated", handleRefresh);

    return () => {
      window.removeEventListener("teamRefresh", handleRefresh);
      window.removeEventListener("eventCreated", handleRefresh);
    };
  }, []);

  // --- Handle Invite Submission ---
  const handleSendInvite = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!inviteEmail || !inviteRole) {
      setErrorMessage("Please provide both an email address and a role.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchAPI(`/events/${selectedEventId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });

      if (response.success) {
        setSuccessMessage("Invitation sent successfully!");
        setInviteEmail("");
        setInviteRole("");

        setMembers([...members, {
          id: Date.now().toString(),
          email: inviteEmail,
          role: inviteRole,
          status: 'Pending'
        }]);

        setTimeout(() => {
          setIsInviteModalOpen(false);
          setSuccessMessage("");
        }, 2000);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to send invite. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: Triggers for the beautiful Modals ---
  const openRemoveModal = (member: TeamMember) => {
    setMemberToManage(member);
    setIsRemoveModalOpen(true);
    setOpenMenuId(null);
  };

  const openRoleModal = (member: TeamMember) => {
    setMemberToManage(member);
    setNewSelectedRole(member.role); // Set the default to their current role
    setIsRoleModalOpen(true);
    setOpenMenuId(null);
  };

  // --- NEW: Actual API Handlers (Connected to Modals) ---
  const confirmRemoveMember = async () => {
    if (!memberToManage) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetchAPI(`/events/${selectedEventId}/team/${memberToManage.id}`, {
        method: 'DELETE'
      });
      if (response.success) {
        setMembers(prev => prev.filter(m => m.id !== memberToManage.id));
        setIsRemoveModalOpen(false);
        setSuccessMessage(`${memberToManage.name || memberToManage.email} has been removed.`);
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (error) {
      setErrorMessage("Failed to remove member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmChangeRole = async () => {
    if (!memberToManage || !newSelectedRole || newSelectedRole === memberToManage.role) {
      setIsRoleModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetchAPI(`/events/${selectedEventId}/team/${memberToManage.id}`, {
        method: 'PUT',
        body: JSON.stringify({ newRole: newSelectedRole })
      });
      if (response.success) {
        setMembers(prev => prev.map(m => m.id === memberToManage.id ? { ...m, role: newSelectedRole } : m));
        setIsRoleModalOpen(false);
        setSuccessMessage(`Role successfully updated to ${newSelectedRole}.`);
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (error) {
      setErrorMessage("Failed to update role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSelectedEventPast = pastEvents.some(e => e.id === selectedEventId);
  const selectedEventName = [...activeEvents, ...pastEvents].find(e => e.id === selectedEventId)?.title;

  return (
    <div className="space-y-6">
      {successMessage && !isInviteModalOpen && (
        <div className="fixed bottom-10 right-10 z-[100] bg-white border shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 border-l-4 border-l-emerald-500 overflow-hidden">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={20} />
          </div>
          <div className="pr-8">
            <h4 className="text-sm font-black text-gray-900">Success</h4>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage("")} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
          <div className="absolute bottom-0 left-0 h-1 bg-emerald-500" style={{ width: '100%', animation: 'progress 4s linear forwards' }}></div>
        </div>
      )}

      {/* Add this CSS anywhere in the component return or global CSS */}
      <style jsx>{` @keyframes progress { from { width: 100%; } to { width: 0%; } } `}</style>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Team Management</h2>
          <p className="text-gray-500 text-sm mt-1">Build and manage your event organizing committee</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Local selector removed. Global switching happens in the Topbar! */}

          {/* 🚀 ROLE CHECK: Hide Invite from Volunteers */}
          {!isSelectedEventPast && myRole !== 'Volunteer' && (
            <button
              onClick={() => {
                setErrorMessage("");
                setSuccessMessage("");
                setIsInviteModalOpen(true);
              }}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
            >
              Invite Member
            </button>
          )}
        </div>
      </div>

      {isLoadingTeam ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-64 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                <div className="w-20 h-6 bg-gray-100 rounded-full"></div>
              </div>
              <div className="space-y-3 pt-4">
                <div className="h-6 w-3/4 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-1/2 bg-gray-100 rounded-lg"></div>
              </div>
              <div className="pt-6 border-t border-gray-50 flex gap-3">
                <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                <div className="h-4 w-full bg-gray-50 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">

          {/* Team Cards */}
          {members.map((member) => (
            <div key={member.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative group">

              {/* 🚀 ROLE CHECK: Only allow certain roles to manage team members */}
              {myRole !== 'Volunteer' && myRole !== 'Team_Lead' && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {/* Dropdown Menu - WIRED TO BEAUTIFUL MODALS */}
                  {openMenuId === member.id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-10 animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => openRoleModal(member)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center gap-2"
                      >
                        <Shield size={16} /> Change Role
                      </button>
                      {member.role !== 'President' ? (
                        <button
                          onClick={() => openRemoveModal(member)}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2 border-t border-gray-50"
                        >
                          <UserMinus size={16} /> Remove Member
                        </button>
                      ) : (
                        <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-50 bg-gray-50 italic">Creator cannot be removed</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Card Header: Avatar & Badge */}
              <div className="flex justify-between items-start mb-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm ${getColorClass(member.email)}`}>
                  {getInitials(member.name || "", member.email)}
                </div>
                {member.status === 'Pending' && (
                  <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-1 mr-8">
                    Pending
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-900 capitalize truncate">
                  {member.status === 'Pending' ? member.email.split('@')[0] : member.name}
                </h3>
                <p className="text-sm font-semibold text-indigo-600 mb-4">{member.role}</p>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-3 text-sm text-gray-500">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            </div>
          ))}

          {/* 🚀 WELCOMING EMPTY STATE: For users with no team yet */}
          {members.length <= 1 && (
            <div className="col-span-full max-w-4xl mx-auto py-16 px-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner rotate-3 ring-8 ring-indigo-50/50">
                <Users size={48} strokeWidth={1.5} />
              </div>
              
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Committee Command Center</h2>
              <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed mb-10">
                Great events aren't built alone. Invite your committee members to share the workload, assign specialized roles, and maintain a secure, real-time synchronization across your entire organization.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                {[
                  { icon: Shield, title: "Role Security", desc: "Granular permissions for every committee member." },
                  { icon: Mail, title: "Smart Invites", desc: "Automated onboarding via university emails." },
                  { icon: Rocket, title: "Live Sync", desc: "Real-time updates across all staff devices." }
                ].map((feature, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center group hover:border-indigo-200 transition-colors">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-3 group-hover:scale-110 transition-transform"><feature.icon size={24} /></div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-500 font-medium">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {!isSelectedEventPast && myRole !== 'Volunteer' && (
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 active:scale-95 flex items-center gap-3"
                >
                  <UserPlus size={20} strokeWidth={3} /> Build Your Dream Team
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- 1. INVITE MODAL --- */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{errorMessage}</p>
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle size={20} className="shrink-0" />
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              )}
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 p-3.5 rounded-xl text-sm flex items-center gap-2.5 font-medium">
                <CalendarDays size={18} className="opacity-70" />
                Inviting to: {selectedEventName}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="e.g., student@university.edu" className="w-full border border-gray-300 rounded-xl p-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow text-gray-900 placeholder-gray-400" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assign Role *</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow text-gray-900 bg-white appearance-none">
                  <option value="" disabled>Select a role...</option>
                  <option value="President">President</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Team_Lead">Team Lead</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center gap-3 bg-gray-50 shrink-0">
              <button onClick={handleSendInvite} disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-70 disabled:cursor-wait flex justify-center items-center gap-2">
                {isSubmitting ? "Sending..." : "Send Invite"}
              </button>
              <button onClick={() => setIsInviteModalOpen(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. BEAUTIFUL REMOVE MEMBER MODAL --- */}
      {isRemoveModalOpen && memberToManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 border border-white/20">
            <div className="p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 rotate-3 shadow-inner">
                <UserMinus size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Remove Member?</h2>
              <p className="text-gray-500 font-medium leading-relaxed px-2">
                Access will be instantly revoked for <span className="text-gray-900 font-bold">{memberToManage.name === "TBA" ? memberToManage.email : memberToManage.name}</span>.
              </p>
            </div>
            <div className="p-6 pt-0 flex flex-col gap-3 bg-white">
              <button onClick={confirmRemoveMember} disabled={isSubmitting} className="w-full bg-rose-600 text-white py-4 rounded-2xl text-sm font-black hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all active:scale-95 flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Remove Permanently"}
              </button>
              <button onClick={() => setIsRemoveModalOpen(false)} className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl text-sm font-black hover:bg-gray-100 transition-all active:scale-95">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 3. BEAUTIFUL CHANGE ROLE MODAL --- */}
      {isRoleModalOpen && memberToManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield size={20} className="text-indigo-600" /> Change Role
              </h2>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${getColorClass(memberToManage.email)}`}>
                  {getInitials(memberToManage.name || "", memberToManage.email)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    {memberToManage.name === "TBA" ? memberToManage.email.split('@')[0] : memberToManage.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate w-48">{memberToManage.email}</p>
                </div>
              </div>

              {errorMessage && <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded-lg">{errorMessage}</p>}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Role</label>
                <select
                  value={newSelectedRole}
                  onChange={(e) => setNewSelectedRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow text-gray-900 bg-white appearance-none"
                >
                  <option value="President">President</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Team_Lead">Team Lead</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex items-center gap-3 bg-gray-50 shrink-0">
              <button
                onClick={confirmChangeRole}
                disabled={isSubmitting || newSelectedRole === memberToManage.role}
                className="w-full bg-indigo-600 text-white px-4 py-3.5 rounded-2xl text-sm font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Save New Permission Level"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}