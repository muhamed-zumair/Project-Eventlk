"use client";

import { fetchAPI } from "../../../utils/api";
import React, { useState, useEffect } from "react";
import {
  Mail, X, CalendarDays, User, MoreVertical,
  Shield, UserMinus, AlertCircle, CheckCircle, Rocket, AlertTriangle
} from "lucide-react";

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
  // --- States ---
  const [activeEvents, setActiveEvents] = useState<EventItem[]>([]);
  const [pastEvents, setPastEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

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

        // Default to the first active event if available
        if (activeRes.events && activeRes.events.length > 0) {
          setSelectedEventId(activeRes.events[0].id);
        } else if (pastRes.events && pastRes.events.length > 0) {
          setSelectedEventId(pastRes.events[0].id);
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
      
      {/* --- SUCCESS BANNER (Global for actions outside of invite modal) --- */}
      {successMessage && !isInviteModalOpen && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <CheckCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{successMessage}</p>
          <button onClick={() => setSuccessMessage("")} className="ml-auto text-green-500 hover:text-green-700"><X size={16} /></button>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Team Management</h2>
          <p className="text-gray-500 text-sm mt-1">Build and manage your event organizing committee</p>
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
              {activeEvents.length > 0 && (
                <optgroup label="Active Events">
                  {activeEvents.map(evt => <option key={evt.id} value={evt.id}>{evt.title}</option>)}
                </optgroup>
              )}
              {pastEvents.length > 0 && (
                <optgroup label="Past Events">
                  {pastEvents.map(evt => <option key={evt.id} value={evt.id}>{evt.title}</option>)}
                </optgroup>
              )}
            </select>
          </div>

          {!isSelectedEventPast && (
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

      {/* Main Content Area */}
      {isLoadingTeam ? (
        <div className="py-20 text-center text-indigo-500 font-medium animate-pulse">Loading team data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">

          {/* Team Cards */}
          {members.map((member) => (
            <div key={member.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative group">

              {/* 3-Dot Management Menu */}
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

          {members.length === 1 && (
            <div className="col-span-full py-20 px-4 text-center bg-indigo-50/40 rounded-3xl border border-dashed border-indigo-200 flex flex-col items-center">
              <div className="bg-indigo-100 p-4 rounded-full mb-5 text-indigo-500">
                <Rocket size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You're flying solo!</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">Building an amazing event takes a village. Invite members to your committee to share the workload.</p>
              {!isSelectedEventPast && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm"
                >
                  Build Your Dream Team
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Remove Member?</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to remove <strong>{memberToManage.name === "TBA" ? memberToManage.email : memberToManage.name}</strong> from <strong>{selectedEventName}</strong>? They will instantly lose access to the dashboard.
              </p>
              
              {errorMessage && <p className="text-sm text-red-600 font-medium">{errorMessage}</p>}
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center gap-3 bg-gray-50 shrink-0">
              <button onClick={() => setIsRemoveModalOpen(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={confirmRemoveMember} disabled={isSubmitting} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition shadow-sm disabled:opacity-70 disabled:cursor-wait">
                {isSubmitting ? "Removing..." : "Yes, Remove"}
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
              <button onClick={confirmChangeRole} disabled={isSubmitting || newSelectedRole === memberToManage.role} className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}