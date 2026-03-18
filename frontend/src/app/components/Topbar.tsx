"use client";
import { fetchAPI } from "../../utils/api";
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"; // <-- NEW: WEBSOCKET CLIENT
import {
  Search, Plus, Bell, X, Calendar, Tag, Users,
  DollarSign, FileText, User, LogOut, Settings,
  CheckCircle, AlertCircle, MessageSquare, MenuIcon,
  SlidersHorizontal, Sparkles, Minus, MapPin, Check
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface TopbarProps {
  toggleSidebar: () => void;
}

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

  const [createMode, setCreateMode] = useState<'manual' | 'ai'>('manual');
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // --- AI Planner States ---
  const [aiHeadcount, setAiHeadcount] = useState<number>(400);
  const [aiBudget, setAiBudget] = useState<number>(200000);
  const [aiCategory, setAiCategory] = useState<string>("Workshop / Training");
  const [aiVenueStyle, setAiVenueStyle] = useState<string>("Any");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiResponseData, setAiResponseData] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [expectedAttendees, setExpectedAttendees] = useState(0);
  const [budget, setBudget] = useState(0);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [invitations, setInvitations] = useState<any[]>([]);

  // --- NEW: WEBSOCKET ALERT STATE ---
  const [socketAlert, setSocketAlert] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const fetchInvitations = async () => {
    try {
      const response = await fetchAPI('/events/invitations/me');
      if (response.success) {
        setInvitations(response.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
    }
  };

  useEffect(() => {
    fetchInvitations();

    const handleOpenCreateModal = () => {
      setIsCreateModalOpen(true);
      setCreateMode('manual');
    };
    window.addEventListener('openCreateModal', handleOpenCreateModal);

    // --- 🚀 NEW: WEBSOCKET CONNECTION AND LISTENERS ---
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let userId = null;

    // Decode the JWT token to secretly get the User ID
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId;
      } catch (e) {
        console.error("Could not parse token for socket");
      }
    }

    let socket: any;

    if (userId) {
      socket = io('http://localhost:5000'); // Connect to your Node switchboard

      socket.on('connect', () => {
        socket.emit('register', userId); // Tell the server who we are!
      });

      // LISTENER 1: Instant Invite
      socket.on('NEW_INVITE', (data: any) => {
        fetchInvitations(); // Fetch the new invite immediately
        setSocketAlert({ message: data.message, type: 'info' });
        setTimeout(() => setSocketAlert(null), 6000);
      });

      // LISTENER 2: Instant Role Change
      socket.on('ROLE_CHANGED', (data: any) => {
        setSocketAlert({ message: data.message, type: 'success' });
        window.dispatchEvent(new Event("eventCreated")); // Triggers Team page to refresh data
        setTimeout(() => setSocketAlert(null), 6000);
      });

      // LISTENER 3: Instant Removal (Kicks them out)
      socket.on('MEMBER_REMOVED', (data: any) => {
        setSocketAlert({ message: data.message, type: 'error' });
        window.dispatchEvent(new Event("eventCreated"));

        // Give them 4 seconds to read the bad news, then boot them to the main dashboard
        setTimeout(() => {
          setSocketAlert(null);
          window.location.href = '/dashboard';
        }, 4000);
      });

      // LISTENER 4: Organizer gets notified when someone accepts/declines
      socket.on('TEAM_UPDATED', (data: any) => {
        setSocketAlert({ message: data.message, type: 'info' });
        window.dispatchEvent(new Event("teamRefresh")); // Yells at the Team Page to refresh!
        setTimeout(() => setSocketAlert(null), 6000);
      });
    }

    return () => {
      window.removeEventListener('openCreateModal', handleOpenCreateModal);
      if (socket) socket.disconnect(); // Hang up the phone when they leave
    };
  }, []);

  const handleInvitationResponse = async (inviteId: string, action: 'accept' | 'decline') => {
    setInvitations(prev => prev.filter(inv => inv.notification_id !== inviteId));

    try {
      const response = await fetchAPI('/events/invitations/respond', {
        method: 'POST',
        body: JSON.stringify({ inviteId, action })
      });

      if (response.success && action === 'accept') {
        window.dispatchEvent(new Event("eventCreated"));
      }
    } catch (error) {
      fetchInvitations();
    }
  };

  const handleDismissAlert = async (notificationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.notification_id !== notificationId));
    try {
      await fetchAPI('/events/notifications/dismiss', {
        method: 'POST',
        body: JSON.stringify({ notificationId })
      });
      window.dispatchEvent(new Event("eventCreated"));
    } catch (error) {
      fetchInvitations();
    }
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
    if (!isNotificationOpen) fetchInvitations();
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
  };

  const costPerHead = aiHeadcount > 0 ? (aiBudget / aiHeadcount).toFixed(2) : "0.00";
  const todayString = new Date().toISOString().split('T')[0];

  const handleCreateManualEvent = async () => {
    setErrorMessage("");
    if (!title || !date || !category || expectedAttendees <= 0 || budget <= 0) {
      setErrorMessage("Please fill in all required fields with valid values.");
      return;
    }

    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate < today) {
      setErrorMessage("You cannot select a past date for the event..Please select a valid date.");
      return;
    }

    setIsSubmitting(true);

    try {
      await fetchAPI("/events", {
        method: "POST",
        body: JSON.stringify({
          title, date, category, expectedAttendees: Number(expectedAttendees), budget: Number(budget), description
        })
      });
      setIsCreateModalOpen(false);
      window.dispatchEvent(new Event("eventCreated"));

      setTitle(""); setDate(""); setCategory(""); setExpectedAttendees(0); setBudget(0); setDescription("");
    } catch (error) {
      setErrorMessage("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: CALL HUSSAIN'S AI API ---
  const handleGenerateAIPlan = async () => {
    setIsGeneratingAI(true);
    setErrorMessage("");

    // This perfectly matches the JSON format Hussain requested
    const payload = {
      headcount: aiHeadcount,
      budget: aiBudget,
      event_type_display: aiCategory,
      venue_pref_display: aiVenueStyle
    };

    console.log("Sending payload to AI:", payload);

    try {
      const response = await fetch("https://hussainmuffallal-eventlk-ai-api.hf.space/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("AI Backend failed to respond.");

      const data = await response.json();
      console.log("🔥 AI RESPONSE RECEIVED:", data);

      // Save it and show the next screen!
      setAiResponseData(data);
      setIsAiGenerated(true);

    } catch (error) {
      console.error("AI Generation Error:", error);
      setErrorMessage("Failed to generate AI plan. Check console.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <>
      {/* --- 🚀 NEW: GLOBAL WEBSOCKET ALERT BANNER --- */}
      {socketAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${socketAlert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            socketAlert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}>
            <div className={`p-2 rounded-full shrink-0 ${socketAlert.type === 'error' ? 'bg-red-100' :
              socketAlert.type === 'success' ? 'bg-green-100' : 'bg-indigo-100'
              }`}>
              {socketAlert.type === 'error' && <AlertCircle size={20} className="text-red-600" />}
              {socketAlert.type === 'success' && <CheckCircle size={20} className="text-green-600" />}
              {socketAlert.type === 'info' && <Bell size={20} className="text-indigo-600" />}
            </div>
            <p className="font-semibold text-sm leading-snug flex-1">{socketAlert.message}</p>
            <button onClick={() => setSocketAlert(null)} className="opacity-50 hover:opacity-100 transition p-1">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 relative z-40">
        <div className="flex items-center gap-3 flex-1">
          <button className="md:hidden p-1" onClick={toggleSidebar}>
            <MenuIcon className="text-gray-600" size={22} />
          </button>
          <div className="relative hidden sm:block w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search events, tasks, or team members..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 placeholder-gray-500 bg-gray-50" />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={() => { setIsCreateModalOpen(true); setCreateMode('manual'); setIsAiGenerated(false); }} className="flex items-center gap-2 bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
            <Plus size={16} />
            <span className="hidden md:inline">Create New Event</span>
          </button>

          <div className="relative">
            <button onClick={toggleNotifications} className="p-2 hover:bg-gray-100 rounded-full transition relative">
              <Bell className="text-gray-600" size={20} />
              {invitations.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {invitations.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500">You're all caught up!</div>
                  ) : (
                    invitations.map((notification) => (
                      <div key={notification.notification_id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition flex flex-col gap-3">

                        {notification.type === 'invite' && (
                          <>
                            <div className="flex gap-3">
                              <div className="mt-0.5 text-indigo-600 bg-indigo-50 p-1.5 rounded-full shrink-0 h-fit">
                                <Users size={16} />
                              </div>
                              <div>
                                <p className="text-sm text-gray-800 font-medium">Team Invitation</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                  You've been invited to join <strong>{notification.event_title}</strong> as a <strong>{notification.role}</strong>.
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 pl-9 mt-1">
                              <button
                                onClick={() => handleInvitationResponse(notification.notification_id, 'accept')}
                                className="flex-1 bg-indigo-600 text-white py-1.5 rounded-md text-xs font-bold hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-1.5"
                              >
                                <Check size={14} /> Accept
                              </button>
                              <button
                                onClick={() => handleInvitationResponse(notification.notification_id, 'decline')}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 py-1.5 rounded-md text-xs font-bold hover:bg-gray-50 transition flex items-center justify-center gap-1.5"
                              >
                                <X size={14} /> Decline
                              </button>
                            </div>
                          </>
                        )}

                        {notification.type === 'declined_alert' && (
                          <>
                            <div className="flex gap-3">
                              <div className="mt-0.5 text-red-600 bg-red-50 p-1.5 rounded-full shrink-0 h-fit">
                                <AlertCircle size={16} />
                              </div>
                              <div>
                                <p className="text-sm text-gray-800 font-medium">Invitation Declined</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                  <strong>{notification.target_email}</strong> has declined to join <strong>{notification.event_title}</strong>.
                                </p>
                              </div>
                            </div>
                            <div className="flex pl-9 mt-1">
                              <button
                                onClick={() => handleDismissAlert(notification.notification_id)}
                                className="w-full bg-gray-100 text-gray-700 py-1.5 rounded-md text-xs font-bold hover:bg-gray-200 transition flex items-center justify-center gap-1.5"
                              >
                                Dismiss
                              </button>
                            </div>
                          </>
                        )}

                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative border-l pl-3 md:pl-4 border-gray-200">
            <button onClick={toggleProfile} className="flex items-center gap-3 hover:opacity-80 transition text-left">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">Organizer</p>
                <p className="text-xs text-gray-500">EventLK</p>
              </div>
              <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm">
                ME
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2 font-medium">
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {(isNotificationOpen || isProfileOpen) && (
        <div className="fixed inset-0 z-30" onClick={() => { setIsNotificationOpen(false); setIsProfileOpen(false); }} />
      )}

      {/* CREATE NEW EVENT MODAL (Unchanged) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className={`bg-white rounded-2xl shadow-2xl w-full transition-all duration-300 flex flex-col max-h-[95vh] ${createMode === 'ai' ? 'max-w-[1200px]' : 'max-w-4xl'}`}>
            <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-medium text-gray-900">Create New Event</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"><X size={24} /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
              <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
                <button onClick={() => setCreateMode('manual')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-colors ${createMode === 'manual' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}><SlidersHorizontal size={18} /> Manual Creation</button>
                <button onClick={() => setCreateMode('ai')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-colors ${createMode === 'ai' ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Sparkles size={18} /> AI Assisted</button>
              </div>

              {createMode === 'manual' && (
                <div className="space-y-6 max-w-3xl mx-auto w-full pb-4">
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle size={20} className="text-red-500 shrink-0" />
                      <p className="text-sm font-medium">{errorMessage}</p>
                      <button onClick={() => setErrorMessage("")} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
                    </div>
                  )}
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Annual Tech Summit 2025" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder-gray-400" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Calendar size={16} className="text-gray-500" /> Event Date *</label><input type="date" min={todayString} value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900" /></div>
                    <div><label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Tag size={16} className="text-gray-500" /> Event Category *</label><select className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white" value={category} onChange={(e) => setCategory(e.target.value)}><option value="" disabled>Select a category</option><option value="Workshops & Training">Workshops & Training</option><option value="Competitions & Hackathons">Competitions & Hackathons</option><option value="Career & Networking">Career & Networking</option><option value="Conferences & Expos">Conferences & Expos</option><option value="Meetups & Community">Meetups & Community</option><option value="Talks & Panels">Talks & Panels</option><option value="Tech Experiences">Tech Experiences</option></select></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Users size={16} className="text-gray-500" /> Expected Attendees *</label><input type="number" min="0" value={expectedAttendees} onChange={(e) => setExpectedAttendees(Number(e.target.value))} placeholder="e.g., 200" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder-gray-400" /></div>
                    <div><label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><DollarSign size={16} className="text-gray-500" /> Budget (LKR) *</label><input type="number" min="0" value={budget} onChange={(e) => setBudget(Number(e.target.value))} placeholder="e.g., 50000" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder-gray-400" /></div>
                  </div>
                  <div><label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><FileText size={16} className="text-gray-500" /> Description</label><textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the event..." className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 resize-none placeholder-gray-400" /></div>
                  <div className="pt-4 flex items-center gap-4"><button onClick={handleCreateManualEvent} disabled={isSubmitting} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition">{isSubmitting ? "Creating..." : "Create Event"}</button><button onClick={() => setIsCreateModalOpen(false)} className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition">Cancel</button></div>
                </div>
              )}

              {createMode === 'ai' && (
                <div className="flex flex-col lg:flex-row items-stretch gap-6 h-full min-h-[550px]">
                  <div className="w-full lg:w-[380px] shrink-0 space-y-6 flex flex-col">
                    <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-5 space-y-5">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Sparkles size={18} className="text-indigo-600" /> Event Details</h3>
                      <div><label className="block text-sm text-gray-700 mb-1.5">Event Title *</label><input type="text" placeholder="e.g., Tech Conference 2025" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 text-sm text-gray-900 placeholder-gray-400" /></div>
                      <div><label className="block text-sm text-gray-700 mb-1.5">Event Date *</label><input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 text-sm text-gray-900" /></div>
                      <div><label className="block text-sm text-gray-700 mb-2 flex justify-between"><span className="flex items-center gap-1.5"><Users size={16} /> Headcount: {aiHeadcount}</span></label><input type="range" min="50" max="1000" step="10" value={aiHeadcount} onChange={(e) => setAiHeadcount(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" /><div className="flex justify-between text-xs text-gray-500 mt-2"><span>50</span><span>1000</span></div></div>
                      <div><label className="block text-sm text-gray-700 mb-1.5 flex items-center gap-1.5"><DollarSign size={16} /> Total Budget (LKR)</label><div className="flex items-center gap-2"><button onClick={() => setAiBudget(Math.max(0, aiBudget - 10000))} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600"><Minus size={16} /></button><input type="number" value={aiBudget} onChange={(e) => setAiBudget(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 text-sm text-gray-900 text-center font-medium" /><button onClick={() => setAiBudget(aiBudget + 10000)} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600"><Plus size={16} /></button></div></div>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-5">
                        <h3 className="font-semibold text-gray-900">Preferences</h3>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1.5">Event Category</label>
                          <select
                            value={aiCategory}
                            onChange={(e) => setAiCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 text-sm text-gray-900 bg-white"
                          >
                            <option value="Workshop / Training">Workshops & Training</option>
                            <option value="Competition / Hackathon">Competitions & Hackathons</option>
                            <option value="Networking / Career">Career & Networking</option>
                            <option value="Conference / Expo">Conferences & Expos</option>
                            <option value="Meetup / Community">Meetups & Community</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1.5">Venue Style</label>
                          <select
                            value={aiVenueStyle}
                            onChange={(e) => setAiVenueStyle(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 text-sm text-gray-900 bg-white"
                          >
                            <option value="Any">Any</option>
                            <option value="Auditorium">Auditorium</option>
                            <option value="Coworking Space">Coworking Space</option>
                            <option value="Exhibition Hall">Exhibition Hall</option>
                            <option value="Studio">Studio</option>
                            <option value="Open Space">Open Space</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={handleGenerateAIPlan}
                          disabled={isGeneratingAI}
                          className="w-full bg-[#ef4444] text-white py-3.5 rounded-xl font-medium hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                        >
                          <Sparkles size={18} />
                          {isGeneratingAI ? "AI is thinking..." : "Generate Plan"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col sticky top-0 h-full">
                    {!isAiGenerated ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/30"><div className="text-gray-300 mb-4"><Sparkles size={64} strokeWidth={1.5} /></div><h3 className="text-xl font-semibold text-gray-900 mb-2">AI Event Planner</h3><p className="text-gray-500 max-w-sm">Fill in the event details and click "Generate Plan" to get AI-powered recommendations.</p></div>
                    ) : (
                      <div className="flex flex-col h-full bg-white">
                        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                          <div className="border-b border-gray-100 pb-4"><h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Sparkles className="text-indigo-600" size={24} /> AI Recommendations</h3><p className="text-sm text-gray-500 mt-1">Based on {aiHeadcount} attendees and LKR {aiBudget.toLocaleString()} budget.</p></div>
                          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden shadow-sm"><div className="absolute -top-6 -right-6 text-indigo-500 opacity-10"><MapPin size={160} /></div><div className="relative z-10"><p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Top Venue Match</p><h4 className="text-3xl font-extrabold text-gray-900 mb-2">NSBM Green University</h4><p className="text-sm text-gray-700 max-w-md font-medium leading-relaxed">Perfectly matches your event category and headcount. Estimated at LKR {costPerHead}/head, fitting comfortably within your total budget.</p></div></div>
                          <div className="border border-gray-200 rounded-2xl p-6 md:p-8 bg-white shadow-sm">
                            <div className="mb-6"><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Financial Strategy</p><h4 className="text-xl font-bold text-gray-900">Suggested Budget Allocation</h4></div>
                            <div className="flex flex-col xl:flex-row gap-8 items-center justify-center">
                              <div className="w-56 h-56 shrink-0 relative">
                                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={aiBudgetData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">{aiBudgetData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><RechartsTooltip formatter={(value: any) => `LKR ${value.toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} /></PieChart></ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total</span><span className="text-sm font-bold text-gray-800">100%</span></div>
                              </div>
                              <div className="flex-1 w-full flex flex-col justify-center space-y-4 pl-0 xl:pl-8 pr-2 md:pr-6">
                                {aiBudgetData.map((item, index) => (
                                  <div key={index} className="flex items-center w-full group"><div className="w-3 h-3 rounded-full shrink-0 shadow-sm mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div><p className="text-sm font-bold text-gray-700 shrink-0">{item.name}</p><div className="flex-1 border-b-2 border-dotted border-gray-200 mx-4 opacity-50 group-hover:border-gray-400 transition-colors"></div><p className="text-sm font-semibold text-gray-500 shrink-0 w-12 text-right">{item.percentage}</p><p className="text-sm font-bold text-gray-900 shrink-0 w-28 text-right">LKR {item.value.toLocaleString()}</p></div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-5 border-t border-gray-200 bg-white flex items-center gap-3 shrink-0 rounded-b-2xl">
                          <button onClick={() => { localStorage.setItem("aiDraft", JSON.stringify({ title: title || "New Tech Event", date: date, headcount: Number(aiHeadcount), totalBudget: Number(aiBudget), category: category || "Workshops & Training", venue: "SLIIT - Computing Faculty", theme: { name: "Synergy Spectrum", primary: "#007AFF", secondary: "#F0A040", accent: "#34C759" }, budgetAllocation: aiBudgetData, plan: ["Confirm Venue", "Detailed Agenda", "Registration", "Procure Materials"] })); setIsCreateModalOpen(false); window.location.href = "/ai-recommendations"; }} className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">Preview and Confirm</button>
                          <button onClick={() => setIsCreateModalOpen(false)} className="bg-white border border-transparent text-gray-500 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 hover:text-gray-700 transition text-sm ml-auto">Cancel</button>
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