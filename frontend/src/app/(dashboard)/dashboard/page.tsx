"use client";
import { useEventContext } from "../../../context/EventContext";
import { fetchAPI } from '../../../utils/api';
import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Calendar, MapPin, Users, DollarSign,
  CheckCircle, Clock, AlertCircle, Pencil, X, Trash2, Plus,
  FileText, Mail, User, Check, Lock, Palette, ListChecks, ShieldAlert,
  CalendarPlus, Mic, Handshake, FileUp, DownloadCloud, Loader2, Info
} from "lucide-react";

export default function DashboardHome() {
  const { myRole } = useEventContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [greetingPrefix, setGreetingPrefix] = useState("Welcome");
  const [userName, setUserName] = useState("");

  const [eventsList, setEventsList] = useState<any[]>([]);
  const [eventDetails, setEventDetails] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState(eventDetails);

  const [agendaItems, setAgendaItems] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);

  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // 🚀 NEW: UI States for Toasts & Event Deletion
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const [eventToDelete, setEventToDelete] = useState<{ id: string, title: string } | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Start with an empty list!
  const [eventFiles, setEventFiles] = useState<any[]>([]);

  const [isUploadConfidential, setIsUploadConfidential] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && eventDetails?.id) {
      const selectedFile = files[0];

      // Package the file for transit
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('isConfidential', String(isUploadConfidential));

      try {
        // 1. Grab your auth token
        const token = localStorage.getItem('token');

        // 2. Use native fetch to bypass the forced JSON headers in fetchAPI
        // NOTE: Make sure to change 'http://localhost:5000/api' to match your actual backend URL!
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events/${eventDetails.id}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // 🚨 CRITICAL: Do NOT type 'Content-Type' here! 
            // The browser must automatically generate the multipart/form-data boundary.
          },
          body: formData,
        });

        const response = await res.json();

        if (response.success) {
          // Add the newly saved DB record to the UI instantly
          setEventFiles(prev => [...prev, {
            id: response.document.id,
            name: response.document.file_name,
            size: response.document.file_size,
            date: "Just now",
            isConfidential: response.document.is_confidential
          }]);
          setIsUploadConfidential(false);
          showToast("Document uploaded successfully!", "success");
        } else {
          showToast("Upload failed: " + response.message, "error");
        }
      } catch (error) {
        console.error("Upload error:", error);
        showToast("Upload failed. Please try again.", "error");
      }
    }
  };

  // This just opens the popup
  const handleDeleteClick = (id: string, name: string) => {
    setDocumentToDelete({ id, name });
  };

  // This actually talks to the backend to delete it
  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetchAPI(`/events/documents/${documentToDelete.id}`, { method: 'DELETE' });
      if (response.success) {
        setEventFiles(eventFiles.filter(f => f.id !== documentToDelete.id));
        setDocumentToDelete(null);
      }
    } catch (error) {
      showToast("Failed to delete the document.", "error");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDownloadFile = async (docId: string) => {
    try {
      const response = await fetchAPI(`/events/documents/${docId}/download`, { method: 'GET' });
      if (response.success && response.downloadUrl) {
        // This opens the secure AWS link in a new invisible tab, triggering the download instantly!
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      showToast("Failed to download file.", "error");
    }
  };
  const handlePrint = () => window.print();

  const formattedDate = eventDetails?.date ? new Date(eventDetails.date + "T00:00:00").toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }) : "";

  const fetchMyEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAPI('/events/', { method: 'GET' });
      
      if (response.success && response.events.length > 0) {
        // 🚀 FIX: Just trust the database! No more tricky date math or frontend auto-archiving.
        const activeEvents = response.events
          .filter((dbEvent: any) => dbEvent.status !== 'Done') // Only hide it if the DB officially says 'Done'
          .map((dbEvent: any) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let cleanDate = "";
            let formattedDate = "";

            if (dbEvent.start_date) {
              const dateObj = new Date(dbEvent.start_date);
              formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              cleanDate = dbEvent.start_date.split('T')[0];
            }

            const totalTasks = Number(dbEvent.total_tasks) || 0;
            const completedTasks = Number(dbEvent.completed_tasks) || 0;

            return {
              id: dbEvent.id,
              title: dbEvent.title,
              date: cleanDate,
              formattedDate,
              eventStatus: "In Progress",
              // DiffDays can just be basic math now
              diffDays: Math.max(0, Math.ceil((new Date(dbEvent.start_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
              venue: dbEvent.venue || "TBA",
              expectedAttendees: dbEvent.expected_headcount,
              budget: Number(dbEvent.total_budget),
              description: dbEvent.description,
              isAiAssisted: dbEvent.is_ai_assisted,
              totalSpent: Number(dbEvent.total_spent) || 0,
              totalTasks: totalTasks,
              completedTasks: completedTasks,
              pendingHighTasks: Number(dbEvent.pending_high_tasks) || 0,
              progressPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
              checkedInCount: Number(dbEvent.checked_in_count) || 0
            };
          });
        setEventsList(activeEvents);
      } else {
        setEventsList([]);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchFullEventDetails = async (eventId: string, modalType: 'edit' | 'details') => {
    setIsFetchingDetails(true);
    try {
      const response = await fetchAPI(`/events/${eventId}`, { method: 'GET' });

      if (response.success) {
        const fullEvent = response.event;
        let cleanDate = "";
        if (fullEvent.start_date) {
          const dateObj = new Date(fullEvent.start_date);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          cleanDate = `${year}-${month}-${day}`;
        }

        const totalTasks = Number(fullEvent.total_tasks) || 0;
        const completedTasks = Number(fullEvent.completed_tasks) || 0;

        const hasTeam = fullEvent.team && fullEvent.team.length > 0;

        const fullEventData = {
          id: fullEvent.id, title: fullEvent.title, date: cleanDate,
          startTime: fullEvent.start_time ? String(fullEvent.start_time).substring(0, 5) : "",
          endTime: fullEvent.end_time ? String(fullEvent.end_time).substring(0, 5) : "",
          venue: fullEvent.venue || "", venueAddress: fullEvent.venue_address || "",
          expectedAttendees: fullEvent.expected_headcount, budget: Number(fullEvent.total_budget),
          organizerName: hasTeam ? `${fullEvent.team[0].first_name} ${fullEvent.team[0].last_name}` : "Organizer",
          organizerRole: fullEvent.my_role || "Admin", 
          organizerEmail: hasTeam ? fullEvent.team[0].email : "contact@eventlk.com",
          isAiAssisted: fullEvent.is_ai_assisted, theme: fullEvent.theme_colors, plan: fullEvent.ai_recommended_plan,
          totalSpent: Number(fullEvent.total_spent) || 0,
          progressPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          checkedInCount: Number(fullEvent.checked_in_count) || 0
        };

        setEventDetails(fullEventData);
        setEditForm(fullEventData);

        setAgendaItems(fullEvent.agenda.map((a: any) => ({
          startTime: (a.start_time || a.startTime) ? String(a.start_time || a.startTime).substring(0, 5) : "",
          endTime: (a.end_time || a.endTime) ? String(a.end_time || a.endTime).substring(0, 5) : "",
          title: a.title
        })));

        setSpeakers(fullEvent.speakers.map((s: any) => ({ name: s.name, role: s.designation })));
        // Find this line:
        setSponsors(fullEvent.sponsors.map((s: any) => ({ name: s.name, tier: s.tier, amount: s.contribution_amount })));

        // 🚀 PASTE THIS RIGHT BELOW IT:
        if (fullEvent.documents) {
          setEventFiles(fullEvent.documents.map((doc: any) => ({
            id: doc.id,
            name: doc.file_name,
            size: doc.file_size,
            date: "Uploaded", // We keep this simple since we didn't fetch created_at
            isConfidential: doc.is_confidential
          })));
        } else {
          setEventFiles([]);
        }

        if (modalType === 'edit') setIsEditModalOpen(true);
        if (modalType === 'details') setIsDetailsModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch full event details:", error);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateEvent = async () => {
    setEditErrorMessage("");
    if (editForm.date) {
      const inputDate = new Date(editForm.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (inputDate < today) {
        setEditErrorMessage("Event date cannot be rescheduled in the past.");
        return;
      }
    }
    setIsSaving(true);
    try {
      const payload = {
        title: editForm.title, date: editForm.date, startTime: editForm.startTime, endTime: editForm.endTime,
        venue: editForm.venue, venueAddress: editForm.venueAddress, expectedAttendees: Number(editForm.expectedAttendees),
        budget: Number(editForm.budget), description: editForm.description, organizerRole: editForm.organizerRole,
        agenda: agendaItems.map(item => ({ startTime: item.startTime || "00:00", endTime: item.endTime || "00:00", title: item.title || "Untitled Session" })),
        speakers: speakers.map(speaker => ({ name: speaker.name || "TBA", designation: speaker.role || "TBA" })),
        sponsors: sponsors.map(sponsor => ({ name: sponsor.name || "TBA", tier: sponsor.tier || "Standard", amount: Number(sponsor.amount) || 0 }))
      };

      const response = await fetchAPI(`/events/${editForm.id}`, { method: 'PUT', body: JSON.stringify(payload) });

      if (response.success) {
        setIsEditModalOpen(false);
        window.dispatchEvent(new Event('eventCreated'));
      }
    } catch (error) {
      console.error("Failed to update event:", error);
      showToast("Failed to save changes. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };
  

  // 🚀 REPLACED window.confirm WITH CUSTOM MODAL LOGIC
  const handleDeleteEventClick = (eventId: string, eventTitle: string) => {
    setEventToDelete({ id: eventId, title: eventTitle });
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeletingEvent(true);
    try {
      const response = await fetchAPI(`/events/${eventToDelete.id}`, { method: 'DELETE' });
      if (response.success) {
        fetchMyEvents();
        setEventToDelete(null);
        showToast("Event deleted successfully!", "success");
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      showToast("Failed to delete the event. Please try again.", "error");
    } finally {
      setIsDeletingEvent(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token === "undefined") {
      window.location.href = '/signin';
      return;
    }
    fetchMyEvents();
    const handleEventCreated = () => fetchMyEvents();
    window.addEventListener('eventCreated', handleEventCreated);
    return () => window.removeEventListener('eventCreated', handleEventCreated);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const isNewUser = localStorage.getItem('isNewUser');
      if (storedUser && storedUser !== "undefined") {
      try {
        const userObj = JSON.parse(storedUser);
        // Google uses 'first_name', manual login uses 'firstName'
        const name = userObj.firstName || userObj.first_name || "User"; 
        
        if (isNewUser === 'true') {
          setGreetingPrefix("Welcome to EventLK,"); 
          setUserName(name);
          setTimeout(() => localStorage.removeItem('isNewUser'), 2000);
        } else {
          setGreetingPrefix("Welcome back,"); 
          setUserName(name);
        }
      } catch (error) {
        console.error("Dashboard greeting error:", error);
        setGreetingPrefix("Welcome back,"); 
        setUserName("User");
      }
    }
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
        {greetingPrefix}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{userName}</span>
        <span className="inline-block hover:animate-pulse cursor-default">👋</span>
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-indigo-600">
          <Loader2 className="animate-spin mr-2" />
          <span className="animate-pulse font-medium">Synchronizing your dashboard...</span>
        </div>
      ) : eventsList.length === 0 ? (
        <div className="max-w-6xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-700">
          {/* Hero Welcome Section */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-12 text-center shadow-sm relative overflow-hidden mb-8">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
             
             <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3 ring-8 ring-indigo-50/50">
               <Sparkles size={48} strokeWidth={1.5} />
             </div>
             
             <h3 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Your Event Excellence Starts Here</h3>
             <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed mb-10">
               Welcome to EventLK. Whether you're planning a local meetup or a global summit, our AI-powered tools and real-time coordination engine are ready to bring your vision to life.
             </p>
             
             <button 
               onClick={() => window.dispatchEvent(new Event('openCreateModal'))} 
               className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 active:scale-95 flex items-center gap-3 mx-auto"
             >
               <Plus size={24} strokeWidth={3} /> Create Your First Event
             </button>
          </div>

          {/* Feature Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm group hover:border-indigo-200 transition-colors">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Palette size={24} /></div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">AI-Driven Strategy</h4>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Generate complete venue matches, budget allocations, and execution roadmaps in seconds.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm group hover:border-indigo-200 transition-colors">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Users size={24} /></div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Real-time Coordination</h4>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Manage your team with role-based permissions, instant messaging, and live task tracking.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm group hover:border-indigo-200 transition-colors">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><ListChecks size={24} /></div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Live Execution</h4>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Track guest check-ins with our live scanner and monitor budget spending as it happens.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {eventsList.map((event) => {
            const budgetPercent = event.budget > 0 ? Math.min((event.totalSpent / event.budget) * 100, 100) : 0;
            return (
              <div key={event.id} className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex gap-2 mb-2 items-center">
                      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-300 border-green-500/30">{event.eventStatus}</span>
                      {event.isAiAssisted && (
                        <span className="flex items-center gap-1.5 bg-indigo-500/40 border border-indigo-400/50 px-3 py-1 rounded-full text-xs font-bold text-indigo-50 backdrop-blur-sm shadow-inner">
                          <Sparkles size={14} className="text-indigo-200" /> AI Assisted
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                    <p className="text-indigo-200 text-sm max-w-2xl line-clamp-2">{event.description}</p>
                  </div>
                  <div className="bg-indigo-700/50 p-4 rounded-xl text-center min-w-[100px] shrink-0 ml-4">
                    <span className="block text-3xl font-bold">{event.diffDays > 0 ? event.diffDays : 0}</span>
                    <span className="text-xs text-indigo-200">Days to go</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs"><Calendar size={14} /> Event Date</div>
                    <p className="font-semibold">{event.formattedDate}</p>
                  </div>
                  <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs"><MapPin size={14} /> Venue</div>
                    <p className="font-semibold truncate pr-2">{event.venue}</p>
                  </div>
                  <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs"><Users size={14} /> Checked In</div>
                    <div className="flex justify-between items-end"><p className="font-semibold">{event.checkedInCount} / {event.expectedAttendees}</p></div>
                    <div className="w-full bg-indigo-900/50 h-1.5 rounded-full mt-2">
                      <div className="bg-white h-1.5 rounded-full transition-all duration-500" style={{ width: `${event.expectedAttendees > 0 ? (event.checkedInCount / event.expectedAttendees) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs"><DollarSign size={14} /> Budget Used</div>
                    {/* --- 🚀 REALTIME BUDGET RENDERING --- */}
                    <p className="font-semibold">LKR {event.totalSpent.toLocaleString()} / {event.budget >= 1000 ? (event.budget / 1000).toFixed(0) + 'K' : event.budget}</p>
                    <div className="w-full bg-indigo-900/50 h-1.5 rounded-full mt-2">
                      <div className="bg-white h-1.5 rounded-full" style={{ width: `${budgetPercent}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-800/40 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><CheckCircle size={16} className="text-indigo-200" /><span className="text-sm font-medium text-white">Overall Progress</span></div>
                      <span className="text-sm font-bold text-white">{event.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-indigo-900/50 h-1.5 rounded-full"><div className="bg-green-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${event.progressPercentage}%` }}></div></div>
                  </div>
                  <div className="bg-indigo-800/40 p-4 rounded-xl flex items-center gap-3">
                    <div className="bg-indigo-500/30 p-1.5 rounded-full text-indigo-200"><Clock size={16} /></div>
                    <div className="flex flex-col"><span className="text-xs text-indigo-200">Tasks Completed</span><span className="text-sm font-bold mt-0.5">{event.completedTasks} / {event.totalTasks}</span></div>
                  </div>
                  <div className="bg-indigo-800/40 p-4 rounded-xl flex items-center gap-3">
                    <div className="bg-indigo-500/30 p-1.5 rounded-full text-indigo-200"><AlertCircle size={16} /></div>
                    <div className="flex flex-col"><span className="text-xs text-indigo-200">Pending Tasks</span><span className="text-sm font-bold mt-0.5">{event.pendingHighTasks} High Priority</span></div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <button onClick={() => fetchFullEventDetails(event.id, 'details')} disabled={isFetchingDetails} className="bg-white text-indigo-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
                    {isFetchingDetails ? "Loading..." : "View Full Details"}
                  </button>
                  {/* 🚀 NEW: Completion Button */}
                  

                  {/* 🚀 ROLE CHECK: Hide Edit & Delete from Volunteers */}
                  {myRole !== 'Volunteer' && (
                    <>
                      <button onClick={() => fetchFullEventDetails(event.id, 'edit')} disabled={isFetchingDetails} className="bg-indigo-500/20 border border-indigo-400/30 text-white p-2.5 rounded-lg hover:bg-indigo-500/40 transition-colors flex items-center justify-center disabled:opacity-50" title="Edit Event"><Pencil size={20} /></button>
                      <button onClick={() => handleDeleteEventClick(event.id, event.title)} className="bg-red-500/20 border border-red-400/30 text-red-100 p-2.5 rounded-lg hover:bg-red-500/40 hover:text-white transition-colors flex items-center justify-center ml-auto" title="Delete Event"><Trash2 size={20} /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW FULL DETAILS MODAL */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className={`p-6 text-white flex justify-between items-start shrink-0 ${eventDetails?.isAiAssisted ? 'bg-gradient-to-r from-indigo-900 to-purple-900' : 'bg-[#4f46e5]'}`}>
              <div>
                <h2 className="text-2xl font-medium mb-2">{eventDetails.title}</h2>
                {eventDetails?.isAiAssisted && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-semibold backdrop-blur-sm">
                    <Sparkles size={14} /> AI Generated Strategy
                  </div>
                )}
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full transition"><X size={24} /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar bg-white">
              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Information</h3>
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6 space-y-6">
                  <div className="flex gap-4">
                    <Calendar className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                    <div><h4 className="font-medium text-gray-900">Date & Time</h4><p className="text-gray-600 text-sm mt-1">{formattedDate} • {eventDetails.startTime || "TBA"} - {eventDetails.endTime || "TBA"}</p></div>
                  </div>
                  <div className="flex gap-4">
                    <MapPin className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Venue</h4>
                      {eventDetails.venue ? (<><p className="text-gray-600 text-sm mt-1">{eventDetails.venue}</p><p className="text-gray-500 text-sm mt-0.5">{eventDetails.venueAddress}</p></>) : (<p className="text-gray-400 text-sm mt-1 italic">Venue TBA</p>)}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <FileText className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                    <div><h4 className="font-medium text-gray-900">Description</h4><p className="text-gray-600 text-sm mt-1 leading-relaxed">{eventDetails.description}</p></div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#eff6ff] border border-blue-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-blue-600 mb-3"><Users size={18} /><span className="font-medium text-sm">Checked In</span></div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{eventDetails.checkedInCount}</p>
                    <p className="text-sm text-gray-600">of {eventDetails.expectedAttendees} expected</p>
                  </div>
                  <div className="bg-[#f0fdf4] border border-green-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-green-600 mb-3"><DollarSign size={18} /><span className="font-medium text-sm">Budget Spent</span></div>
                    {/* --- 🚀 REALTIME MODAL STATS --- */}
                    <p className="text-3xl font-bold text-gray-900 mb-1">LKR {eventDetails.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">LKR {(eventDetails.budget - eventDetails.totalSpent).toLocaleString()} remaining</p>
                  </div>
                  <div className="bg-[#fdf4ff] border border-fuchsia-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-fuchsia-600 mb-3"><CheckCircle size={18} /><span className="font-medium text-sm">Progress</span></div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{eventDetails.progressPercentage}%</p><p className="text-sm text-gray-600">Overall completion</p>
                  </div>
                </div>
              </section>

              {eventDetails?.isAiAssisted && eventDetails?.plan && (
                <>
                  <section>
                    <h3 className="text-lg text-gray-800 mb-4 font-medium flex items-center gap-2"><Palette className="text-orange-500" size={20} /> Brand Intelligence</h3>
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                      <p className="font-bold text-gray-800 mb-5">{eventDetails.theme?.name || "Event Theme"}</p>
                      <div className="flex gap-5">
                        {[eventDetails.theme?.primary, eventDetails.theme?.secondary, eventDetails.theme?.accent].map((color, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-12 h-12 rounded-full shadow-md border-4 border-white ring-1 ring-gray-100 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: color || '#ccc' }}></div>
                            <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-indigo-600 transition-colors uppercase">{color || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                  <section>
                    <h3 className="text-lg text-gray-800 mb-4 font-medium flex items-center gap-2"><ListChecks className="text-purple-500" size={20} /> AI Execution Roadmap</h3>
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                      <div className="relative ml-4 md:ml-6 space-y-8 pb-4">
                        <div className="absolute top-2 bottom-2 left-0 w-0.5 border-l-2 border-dashed border-indigo-200"></div>
                        {eventDetails.plan.map((step: string, i: number) => {
                          if (i === 0 && !step.includes(':') && !step.match(/^\d/)) return null;
                          const splitIndex = step.indexOf(':');
                          let title = splitIndex !== -1 && splitIndex < 100 ? step.substring(0, splitIndex).trim() : `Phase ${i + 1}`;
                          let desc = splitIndex !== -1 && splitIndex < 100 ? step.substring(splitIndex + 1).trim() : step;
                          title = title.replace(/^\d+\.\s*/, '');
                          return (
                            <div key={i} className="relative pl-10 group">
                              <div className="absolute -left-[9px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.0)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-shadow duration-300 z-10"></div>
                              <div className="bg-gray-50 hover:bg-indigo-50/40 transition-colors duration-300 border border-gray-100 rounded-2xl p-5 shadow-sm">
                                <h4 className="text-base font-extrabold text-gray-900 mb-1">{title}</h4>
                                <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </section>
                </>
              )}

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Organizer</h3>
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0"><User size={24} /></div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-900 text-lg">{eventDetails.organizerName}</h4>
                    <p className="text-gray-500 text-sm">{eventDetails.organizerRole ? eventDetails.organizerRole.replace('_', ' ') : "Organizer"}</p>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-2"><Mail size={14} /> {eventDetails.organizerEmail}</div>
                  </div>
                </div>
              </section>

              {/* --- 🚀 BEAUTIFUL EMPTY STATES ADDED HERE --- */}
              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Agenda</h3>
                {agendaItems.length === 0 ? (
                  <div className="bg-gray-50/80 border border-gray-100 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-indigo-50 text-indigo-400 rounded-full mb-3"><CalendarPlus size={24} /></div>
                    <h4 className="text-gray-800 font-medium mb-1">No schedule set yet</h4>
                    <p className="text-gray-500 text-sm max-w-sm">Click the Edit button below to start building your event's timeline and sessions.</p>
                  </div>
                ) : (
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden">
                    {agendaItems.map((item, idx) => (
                      <div key={idx} className="flex gap-6 p-4 border-b border-gray-100 last:border-0 items-center">
                        <div className="flex items-center gap-2 text-indigo-500 w -48 shrink-0 text-sm font-medium"><Clock size={16} /> {item.startTime || "TBA"} - {item.endTime || "TBA"}</div>
                        <p className="text-gray-800 font-medium">{item.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Featured Speakers</h3>
                {speakers.length === 0 ? (
                  <div className="bg-gray-50/80 border border-gray-100 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-indigo-50 text-indigo-400 rounded-full mb-3"><Mic size={24} /></div>
                    <h4 className="text-gray-800 font-medium mb-1">No speakers announced</h4>
                    <p className="text-gray-500 text-sm max-w-sm">Click the Edit button to add keynote speakers or panelists to your lineup.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {speakers.map((speaker, idx) => (
                      <div key={idx} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0"><User size={20} /></div>
                        <div><h4 className="font-medium text-gray-900">{speaker.name}</h4><p className="text-gray-500 text-sm">{speaker.role}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Sponsors</h3>
                {sponsors.length === 0 ? (
                  <div className="bg-gray-50/80 border border-gray-100 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-indigo-50 text-indigo-400 rounded-full mb-3"><Handshake size={24} /></div>
                    <h4 className="text-gray-800 font-medium mb-1">No sponsors yet</h4>
                    <p className="text-gray-500 text-sm max-w-sm">Click the Edit button to officially log your financial partners and tiers.</p>
                  </div>
                ) : (
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden">
                    {sponsors.map((sponsor, idx) => (
                      <div key={idx} className="flex justify-between items-center p-5 border-b border-gray-100 last:border-0">
                        <div><h4 className="font-medium text-gray-900 mb-1">{sponsor.name}</h4><span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">{sponsor.tier}</span></div>
                        <p className="font-medium text-gray-900">LKR {Number(sponsor.amount).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Documents</h3>
                {eventFiles.length === 0 ? (
                  <div className="bg-gray-50/80 border border-gray-100 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-indigo-50 text-indigo-400 rounded-full mb-3"><FileText size={24} /></div>
                    <h4 className="text-gray-800 font-medium mb-1">No documents uploaded</h4>
                    <p className="text-gray-500 text-sm max-w-sm">Securely store contracts and resources. Click the Edit button to upload.</p>
                  </div>
                ) : (
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">
                    <div className="space-y-3">
                      {eventFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={16} /></div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                {file.isConfidential && (<span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-bold"><Lock size={10} /> Restricted</span>)}
                              </div>
                              <p className="text-xs text-gray-500">{file.size} • Uploaded {file.date}</p>
                            </div>
                          </div>
                          {/* 🚀 REMOVED DELETE BUTTON FROM READ-ONLY VIEW! */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDownloadFile(file.id)}
                              className="text-sm text-indigo-600 font-bold hover:text-indigo-800 transition flex items-center gap-1"
                            >
                              <DownloadCloud size={16} /> Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* 🚀 ROLE CHECK: Hide the entire footer from Volunteers so they can't Edit or Print */}
            {myRole !== 'Volunteer' && (
              <div className="p-4 border-t border-gray-200 flex items-center gap-3 shrink-0 bg-white">
                <button onClick={() => { setIsDetailsModalOpen(false); setIsEditModalOpen(true); }} className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm flex items-center gap-2"><Pencil size={16} /> Edit Details</button>
                <button onClick={handlePrint} className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition text-sm ml-auto">Print Overview</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#4f46e5] p-6 text-white flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-2xl font-medium">Edit Event</h2>
                <p className="text-indigo-200 mt-1 text-sm">Update event details and information</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full transition"><X size={24} /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">

              {editForm.isAiAssisted && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-4 rounded-xl flex items-start gap-3">
                  <ShieldAlert size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">AI Managed Event</p>
                    <p className="text-xs mt-1 text-indigo-600/80">Core metrics (Headcount, Budget, and Venue) are locked by the EventLK Intelligence Engine to maintain mathematical and strategic integrity.</p>
                  </div>
                </div>
              )}

              {editErrorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-500 shrink-0" />
                  <p className="text-sm font-medium">{editErrorMessage}</p>
                  <button onClick={() => setEditErrorMessage("")} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
              )}

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Basic Information</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm text-gray-600 mb-1">Event Title</label><input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-sm text-gray-600 mb-1">Event Date</label><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" /></div>
                    <div><label className="block text-sm text-gray-600 mb-1">Start Time</label><input type="time" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" /></div>
                    <div><label className="block text-sm text-gray-600 mb-1">End Time</label><input type="time" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="flex items-center gap-2 text-sm text-gray-600 mb-1">Venue {editForm.isAiAssisted && <Lock size={12} className="text-indigo-400" />}</label><input type="text" value={editForm.venue} onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })} disabled={editForm.isAiAssisted} className={`w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900 ${editForm.isAiAssisted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} /></div>
                    <div><label className="flex items-center gap-2 text-sm text-gray-600 mb-1">Venue Address {editForm.isAiAssisted && <Lock size={12} className="text-indigo-400" />}</label><input type="text" value={editForm.venueAddress} onChange={(e) => setEditForm({ ...editForm, venueAddress: e.target.value })} disabled={editForm.isAiAssisted} className={`w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900 ${editForm.isAiAssisted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="flex items-center gap-2 text-sm text-gray-600 mb-1">Expected Attendees {editForm.isAiAssisted && <Lock size={12} className="text-indigo-400" />}</label><input type="number" value={editForm.expectedAttendees} onChange={(e) => setEditForm({ ...editForm, expectedAttendees: Number(e.target.value) })} disabled={editForm.isAiAssisted} className={`w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900 ${editForm.isAiAssisted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} /></div>
                    <div><label className="flex items-center gap-2 text-sm text-gray-600 mb-1">Budget (LKR) {editForm.isAiAssisted && <Lock size={12} className="text-indigo-400" />}</label><input type="number" value={editForm.budget} onChange={(e) => setEditForm({ ...editForm, budget: Number(e.target.value) })} disabled={editForm.isAiAssisted} className={`w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900 ${editForm.isAiAssisted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} /></div>
                  </div>
                  <div><label className="block text-sm text-gray-600 mb-1">Description</label><textarea rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] resize-none text-gray-900"></textarea></div>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Organizer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-gray-600 mb-1">Organizer Name</label><input type="text" value={editForm.organizerName} readOnly className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 outline-none text-gray-500 cursor-not-allowed" /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Your Event Role</label><select value={editForm.organizerRole} onChange={(e) => setEditForm({ ...editForm, organizerRole: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900 bg-white"><option value="President">President</option><option value="Secretary">Secretary</option><option value="Treasurer">Treasurer</option><option value="Team_Lead">Team Lead</option><option value="Volunteer">Volunteer</option></select></div>
                  <div className="md:col-span-2"><label className="block text-sm text-gray-600 mb-1">Email</label><input type="email" value={editForm.organizerEmail} readOnly className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 outline-none text-gray-500 cursor-not-allowed" /></div>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section>
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg text-gray-800 font-medium">Event Agenda</h3><button onClick={() => setAgendaItems([...agendaItems, { startTime: "", endTime: "", title: "" }])} className="flex items-center gap-1 bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"><Plus size={16} /> Add Item</button></div>
                <div className="space-y-3">
                  {agendaItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <input type="time" value={item.startTime || ""} onChange={(e) => { const newArr = [...agendaItems]; newArr[idx] = { ...newArr[idx], startTime: e.target.value }; setAgendaItems(newArr); }} className="w-1/4 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <input type="time" value={item.endTime || ""} onChange={(e) => { const newArr = [...agendaItems]; newArr[idx] = { ...newArr[idx], endTime: e.target.value }; setAgendaItems(newArr); }} className="w-1/4 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <input type="text" placeholder="Session Title" value={item.title || ""} onChange={(e) => { const newArr = [...agendaItems]; newArr[idx] = { ...newArr[idx], title: e.target.value }; setAgendaItems(newArr); }} className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <button onClick={() => setAgendaItems(agendaItems.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg text-gray-800 font-medium">Speakers</h3><button onClick={() => setSpeakers([...speakers, { name: "", role: "" }])} className="flex items-center gap-1 bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"><Plus size={16} /> Add Speaker</button></div>
                <div className="space-y-3">
                  {speakers.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <input type="text" placeholder="Name" value={item.name || ""} onChange={(e) => { const newArr = [...speakers]; newArr[idx].name = e.target.value; setSpeakers(newArr); }} className="w-1/2 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <input type="text" placeholder="Role/Designation" value={item.role || ""} onChange={(e) => { const newArr = [...speakers]; newArr[idx].role = e.target.value; setSpeakers(newArr); }} className="w-1/2 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <button onClick={() => setSpeakers(speakers.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg text-gray-800 font-medium">Sponsors</h3><button onClick={() => setSponsors([...sponsors, { name: "", tier: "", amount: "" }])} className="flex items-center gap-1 bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"><Plus size={16} /> Add Sponsor</button></div>
                <div className="space-y-3">
                  {sponsors.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <input type="text" placeholder="Company Name" value={item.name || ""} onChange={(e) => { const newArr = [...sponsors]; newArr[idx].name = e.target.value; setSponsors(newArr); }} className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <input type="text" placeholder="Tier (e.g. Gold)" value={item.tier || ""} onChange={(e) => { const newArr = [...sponsors]; newArr[idx].tier = e.target.value; setSponsors(newArr); }} className="w-32 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <input type="number" placeholder="Amount" value={item.amount || ""} onChange={(e) => { const newArr = [...sponsors]; newArr[idx].amount = e.target.value; setSponsors(newArr); }} className="w-32 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <button onClick={() => setSponsors(sponsors.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* --- 🚀 UPLOAD MOVED TO EDIT MODAL --- */}
              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Manage Documents</h3>
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <input type="checkbox" id="confidential-check" checked={isUploadConfidential} onChange={(e) => setIsUploadConfidential(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                    <label htmlFor="confidential-check" className="text-sm text-gray-700 cursor-pointer font-medium">Restrict uploaded file to Executive Committee only</label>
                  </div>

                  <div onClick={handleUploadClick} className="border-2 border-dashed border-indigo-200 bg-white rounded-xl p-8 text-center hover:bg-indigo-50/50 transition cursor-pointer mb-6">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept=".pdf,.docx,.xlsx" />
                    <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3"><FileUp size={24} /></div>
                    <p className="text-sm font-bold text-gray-900">Click to upload documents</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, XLSX (Saved securely to AWS S3)</p>
                  </div>

                  {eventFiles.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-gray-800 mb-2">Uploaded Files:</p>
                      {eventFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={16} /></div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                {file.isConfidential && (<span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-bold"><Lock size={10} /> Restricted</span>)}
                              </div>
                              <p className="text-xs text-gray-500">{file.size} • Uploaded {file.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDeleteClick(file.id, file.name)}
                              className="text-red-400 hover:text-red-600 transition bg-red-50 p-2 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

            </div>

            <div className="p-4 border-t border-gray-200 flex items-center gap-3 shrink-0 bg-white">
              <button onClick={handleUpdateEvent} disabled={isSaving} className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm disabled:opacity-50">
                {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Changes"}
              </button>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DELETE DOCUMENT CONFIRMATION MODAL */}
      {documentToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Document?</h3>
              <p className="text-sm text-gray-500 mb-1">Are you sure you want to delete:</p>
              <p className="text-sm font-semibold text-gray-800 mb-6 truncate px-4">"{documentToDelete.name}"</p>
              <p className="text-xs text-red-500 font-medium bg-red-50 py-2 rounded-lg mb-6">This action cannot be undone.</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDocumentToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteDocument}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {isDeleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 🚀 NEW: Event Deletion Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4 mt-2">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border-4 border-red-100 shadow-sm">
                <Trash2 size={28} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Event?</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-2">
                Are you sure you want to permanently delete <strong className="text-gray-800">"{eventToDelete.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setEventToDelete(null)}
                disabled={isDeletingEvent}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEvent}
                disabled={isDeletingEvent}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isDeletingEvent ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeletingEvent ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 NEW: Beautiful Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[250] bg-white border shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success' ? 'border-green-100' : 'border-red-100'}`}>
          <div className={`p-2.5 rounded-full border shadow-sm ${toast.type === 'success' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
          </div>
          <div className="pr-5">
            <h4 className="text-sm font-bold text-gray-900">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className={`p-1.5 rounded-lg transition ${toast.type === 'success' ? 'text-green-400 hover:bg-green-50 hover:text-green-600' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}