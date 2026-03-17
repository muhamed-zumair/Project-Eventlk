"use client";
import { fetchAPI } from '../../../utils/api';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Calendar, MapPin, Users, DollarSign,
  CheckCircle, Clock, AlertCircle, Pencil, X, Trash2, Plus,
  FileText, Mail, Phone, User, Check, Lock
} from "lucide-react";
import { start } from 'repl';

export default function DashboardHome() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [greetingPrefix, setGreetingPrefix] = useState("Welcome");
  const [userName, setUserName] = useState("");

  const [eventsList, setEventsList] = useState<any[]>([]);
  // Placeholder for event details - in a real app, this would come from an API
  const [eventDetails, setEventDetails] = useState<any>(null);


  const [isLoading, setIsLoading] = useState(true);

  const [editForm, setEditForm] = useState(eventDetails);

  const [agendaItems, setAgendaItems] = useState<any[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);

  const [sponsors, setSponsors] = useState<any[]>([]);

  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  // --- UPDATED: Event Files State to include confidentiality ---
  const [eventFiles, setEventFiles] = useState([
    { id: '1', name: "Venue_Contract_Final.pdf", size: "2.4 MB", date: "Oct 12, 2024", isConfidential: true },
    { id: '2', name: "Sponsor_Packages_v2.pdf", size: "1.1 MB", date: "Oct 15, 2024", isConfidential: false }
  ]);

  // NEW: State for the checkbox when uploading
  const [isUploadConfidential, setIsUploadConfidential] = useState(false);

  const [editErrorMessage, setEditErrorMessage] = useState(""); 
  const todayString = new Date().toISOString().split('T')[0];



  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // --- UPDATED: Attach the checkbox state to the new file ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);

      const newFile = {
        id: Date.now().toString(),
        name: selectedFile.name,
        size: `${sizeInMB} MB`,
        date: "Just now",
        isConfidential: isUploadConfidential // Uses the checkbox value
      };

      setEventFiles([newFile, ...eventFiles]);
      setIsUploadConfidential(false); // Reset checkbox after upload
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setEventFiles(eventFiles.filter(f => f.id !== fileId));
  };

  const handlePrint = () => {
    window.print();
  };

  // FIX 1: Safely format date only if eventDetails is not null
  const formattedDate = eventDetails?.date ? new Date(eventDetails.date + "T00:00:00").toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : "";



  const fetchMyEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAPI('/events/', { method: 'GET' });
      if (response.success && response.events.length > 0) {

        // Map ALL events from the database into our list
        const allEvents = response.events.map((dbEvent: any) => {
          let eventStatus = "In Progress";
          let diffDays = 0;
          let cleanDate = "";
          let formattedDate = "";

          if (dbEvent.start_date) {
            // 1. Let Javascript automatically convert the UTC date back to your local Sri Lanka time!
            const dateObj = new Date(dbEvent.start_date);

            // 2. Format it safely for the UI (e.g., "March 18, 2026")
            formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

            // 3. Extract the exact local YYYY-MM-DD for the Edit Modal to read
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            cleanDate = `${year}-${month}-${day}`;

            // 4. Do the countdown math safely
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const mathDate = new Date(dateObj);
            mathDate.setHours(0, 0, 0, 0);

            eventStatus = mathDate < today ? "Done" : "In Progress";
            const diffTime = mathDate.getTime() - today.getTime();
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }

          return {
            id: dbEvent.id,
            title: dbEvent.title,
            date: cleanDate,
            formattedDate,
            eventStatus,
            diffDays,
            venue: dbEvent.venue || "TBA",
            expectedAttendees: dbEvent.expected_headcount,
            budget: Number(dbEvent.total_budget),
            description: dbEvent.description,
          };
        });


        setEventsList(allEvents);
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

        // Bundle everything up for the modals!
        const fullEventData = {
          id: fullEvent.id,
          title: fullEvent.title,
          date: cleanDate, // Safely use the local timezone date here!
          startTime: fullEvent.start_time ? String(fullEvent.start_time).substring(0, 5) : "",
          endTime: fullEvent.end_time ? String(fullEvent.end_time).substring(0, 5) : "",
          venue: fullEvent.venue || "",
          venueAddress: fullEvent.venue_address || "",
          expectedAttendees: fullEvent.expected_headcount,
          budget: Number(fullEvent.total_budget),
          description: fullEvent.description,
          organizerName: fullEvent.team[0]?.first_name ? fullEvent.team[0].first_name + " " + fullEvent.team[0].last_name : "Sahan Perera",
          organizerRole: fullEvent.my_role,
          organizerEmail: fullEvent.team[0]?.email || "example@example.com",

        };

        setEventDetails(fullEventData);
        setEditForm(fullEventData);

        setAgendaItems(fullEvent.agenda.map((a: any) => {
          const dbStartTime = a.start_time || a.startTime;
          const dbEndTime = a.end_time || a.endTime;
          return {
            startTime: dbStartTime ? String(dbStartTime).substring(0, 5) : "",
            endTime: dbEndTime ? String(dbEndTime).substring(0, 5) : "",
            title: a.title
          };
        }));

        setSpeakers(fullEvent.speakers.map((s: any) => ({ name: s.name, role: s.designation })));
        setSponsors(fullEvent.sponsors.map((s: any) => ({ name: s.name, tier: s.tier, amount: s.contribution_amount })));

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
    if(editForm.date){
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
        title: editForm.title,
        date: editForm.date,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        venue: editForm.venue,
        venueAddress: editForm.venueAddress,
        expectedAttendees: Number(editForm.expectedAttendees),
        budget: Number(editForm.budget),
        description: editForm.description,
        organizerRole: editForm.organizerRole,
        agenda: agendaItems.map(item => ({ startTime: item.startTime || "00:00", endTime: item.endTime || "00:00", title: item.title || "Untitled Session" })),
        speakers: speakers.map(speaker => ({ name: speaker.name || "TBA", designation: speaker.role || "TBA" })),
        sponsors: sponsors.map(sponsor => ({ name: sponsor.name || "TBA", tier: sponsor.tier || "Standard", amount: Number(sponsor.amount) || 0 }))
      };

      // USE editForm.id SO IT UPDATES THE CORRECT EVENT!
      const response = await fetchAPI(`/events/${editForm.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        setIsEditModalOpen(false);
        window.dispatchEvent(new Event('eventCreated'));
      }
    } catch (error) {
      console.error("Failed to update event:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    const isNewUser = localStorage.getItem('isNewUser');
    const storedUser = localStorage.getItem('user');

    if (!token || token === "undefined") {
      window.location.href = '/signin';
      return;
    }

    fetchMyEvents(); // Fetch event details when the component mounts

    const handleEventCreated = (event: any) => {
      console.log('Walkie Talkie Event Received! Fetcching event!!!');
      fetchMyEvents();
    };

    window.addEventListener('eventCreated', handleEventCreated);

    return () => {
      window.removeEventListener('eventCreated', handleEventCreated);
    };
  }, []);

  

// --- Replace your loose localStorage logic with this safe useEffect ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const isNewUser = localStorage.getItem('isNewUser');

      if (storedUser && storedUser !== "undefined") {
        try {
          const userObj = JSON.parse(storedUser);
          const name = userObj.firstName || "User";

          if (isNewUser === 'true') {
            setGreetingPrefix("Welcome to EventLK,");
            setUserName(name);
            setTimeout(() => localStorage.removeItem('isNewUser'), 1000);
          } else {
            setGreetingPrefix("Welcome back,");
            setUserName(name);
          }
        } catch (error) {
          setGreetingPrefix("Welcome back,");
          setUserName("User");
        }
      } else {
        setGreetingPrefix("Welcome back,");
        setUserName("User");
      }
    }
  }, []); // The empty [] ensures this ONLY runs once when the page loads!
  // ---------------------------------------------------------------------

  // FIX 3: Safely calculate dates only if an event actually exists
  let eventStatus = "In Progress";
  let diffDays = 0;
  // ... (keep the rest of your code exactly the same below this)

  if (eventDetails?.date) {
    const eventDateObj = new Date(eventDetails.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDateObj.setHours(0, 0, 0, 0);

    eventStatus = eventDateObj < today ? "Done" : "In Progress";
    const diffTime = eventDateObj.getTime() - today.getTime();
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // FIX 4: Cleaned up the nested ternary rendering and removed duplicated UI code
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
        {greetingPrefix}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
          {userName}
        </span>
        <span className="inline-block hover:animate-pulse cursor-default">👋</span>
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-indigo-600">
          <span className="animate-pulse font-medium">Loading your events...</span>
        </div>
      ) : eventsList.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm min-h-[500px]">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
            <Sparkles size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">All caught up!</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
            You have no events currently in progress. Create one to get started!
          </p>
          <button 
            onClick={() => window.dispatchEvent(new Event('openCreateModal'))}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
          >
            <Plus size={20} /> Create New Event
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* MAP THROUGH ALL EVENTS HERE */}
          {eventsList.map((event) => (
            <div key={event.id} className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-300 border-green-500/30">
                      {event.eventStatus}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                  <p className="text-indigo-200 text-sm max-w-2xl line-clamp-2">
                    {event.description}
                  </p>
                </div>
                <div className="bg-indigo-700/50 p-4 rounded-xl text-center min-w-[100px]">
                  <span className="block text-3xl font-bold">{event.diffDays > 0 ? event.diffDays : 0}</span>
                  <span className="text-xs text-indigo-200">Days to go</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs">
                    <Calendar size={14} /> Event Date
                  </div>
                  <p className="font-semibold">{event.formattedDate}</p>
                </div>
                <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs">
                    <MapPin size={14} /> Venue
                  </div>
                  <p className="font-semibold truncate pr-2">{event.venue}</p>
                </div>
                <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs">
                    <Users size={14} /> Registrations
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="font-semibold">168 / {event.expectedAttendees}</p>
                  </div>
                  <div className="w-full bg-indigo-900/50 h-1.5 rounded-full mt-2">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: `${(168 / event.expectedAttendees) * 100}%` }}></div>
                  </div>
                </div>
                <div className="bg-indigo-700/30 p-4 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-indigo-200 mb-1 text-xs">
                    <DollarSign size={14} /> Budget Used
                  </div>
                  <p className="font-semibold">$45,200 / ${event.budget.toLocaleString()}</p>
                  <div className="w-full bg-indigo-900/50 h-1.5 rounded-full mt-2">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: `${(45200 / event.budget) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-800/40 p-4 rounded-xl flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-indigo-200" />
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
                    <div className="bg-indigo-500/30 p-1.5 rounded-full text-indigo-200"><Clock size={16} /></div>
                    <div className="flex flex-col">
                      <span className="text-xs text-indigo-200">Tasks Completed</span>
                      <span className="text-sm font-bold mt-0.5">16 / 24</span>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-800/40 p-4 rounded-xl flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/30 p-1.5 rounded-full text-indigo-200"><AlertCircle size={16} /></div>
                    <div className="flex flex-col">
                      <span className="text-xs text-indigo-200">Pending Tasks</span>
                      <span className="text-sm font-bold mt-0.5">8 High Priority</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => fetchFullEventDetails(event.id, 'details')}
                  disabled={isFetchingDetails}
                  className="bg-white text-indigo-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isFetchingDetails ? "Loading..." : "View Full Details"}
                </button>
                <button
                  onClick={() => fetchFullEventDetails(event.id, 'edit')}
                  disabled={isFetchingDetails}
                  className="bg-indigo-500/20 border border-indigo-400/30 text-white p-2.5 rounded-lg hover:bg-indigo-500/40 transition-colors flex items-center justify-center disabled:opacity-50"
                  title="Edit Event"
                >
                  <Pencil size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW FULL DETAILS MODAL */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

            <div className="bg-[#4f46e5] p-6 text-white flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-2xl font-medium mb-2">{eventDetails.title}</h2>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar bg-white">

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Information</h3>
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6 space-y-6">
                  <div className="flex gap-4">
                    <Calendar className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-gray-900">Date & Time</h4>
                      <p className="text-gray-600 text-sm mt-1">{formattedDate} • {eventDetails.startTime} - {eventDetails.endTime}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <MapPin className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Venue</h4>
                      {eventDetails.venue ? (
                        <>
                          <p className="text-gray-600 text-sm mt-1">{eventDetails.venue}</p>
                          <p className="text-gray-500 text-sm mt-0.5">{eventDetails.venueAddress}</p>
                        </>
                      ) : (
                        <p className="text-gray-400 text-sm mt-1 italic">Venue TBA</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <FileText className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-gray-900">Description</h4>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                        {eventDetails.description}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#eff6ff] border border-blue-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-blue-600 mb-3">
                      <Users size={18} />
                      <span className="font-medium text-sm">Attendance</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">168</p>
                    <p className="text-sm text-gray-600">of {eventDetails.expectedAttendees} expected</p>
                  </div>
                  <div className="bg-[#f0fdf4] border border-green-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-green-600 mb-3">
                      <DollarSign size={18} />
                      <span className="font-medium text-sm">Budget Spent</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">$45.2K</p>
                    <p className="text-sm text-gray-600">${((eventDetails.budget - 45200) / 1000).toFixed(1)}K remaining</p>
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

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Organizer</h3>
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <User size={24} />
                  </div>
                  <div className="space-y-1">
                    {/* Dynamically showing real DB data! */}
                    <h4 className="font-medium text-gray-900 text-lg">{eventDetails.organizerName}</h4>
                    <p className="text-gray-500 text-sm">{eventDetails.organizerRole ? eventDetails.organizerRole.replace('_', ' ') : "Organizer"}</p>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                      <Mail size={14} /> {eventDetails.organizerEmail}
                    </div>
                    {/* Phone number row completely removed based on your schema! */}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Agenda</h3>
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden">
                  {agendaItems.map((item, idx) => (
                    <div key={idx} className="flex gap-6 p-4 border-b border-gray-100 last:border-0 items-center">
                      <div className="flex items-center gap-2 text-indigo-500 w -48 shrink-0 text-sm font-medium">
                        <Clock size={16} /> {item.startTime || "TBA"} - {item.endTime || "TBA"}
                      </div>
                      <p className="text-gray-800 font-medium">{item.title}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Featured Speakers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {speakers.map((speaker, idx) => (
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

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Sponsors</h3>
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl overflow-hidden">
                  {sponsors.map((sponsor, idx) => (
                    <div key={idx} className="flex justify-between items-center p-5 border-b border-gray-100 last:border-0">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{sponsor.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700`}>
                          {sponsor.tier}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">LKR {Number(sponsor.amount).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* --- UPDATED: Event Documents Section --- */}
              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Event Documents</h3>
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">

                  {/* Checkbox added above the dropzone */}
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="confidential-check"
                      checked={isUploadConfidential}
                      onChange={(e) => setIsUploadConfidential(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="confidential-check" className="text-sm text-gray-700 cursor-pointer font-medium">
                      Restrict uploaded file to Executive Committee only
                    </label>
                  </div>

                  <div
                    onClick={handleUploadClick}
                    className="border-2 border-dashed border-indigo-200 bg-white rounded-xl p-8 text-center hover:bg-indigo-50/50 transition cursor-pointer mb-4"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      multiple
                      accept=".pdf,.docx,.xlsx"
                    />
                    <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                      <Plus size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Click to upload documents</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, XLSX (Saved securely to AWS S3)</p>
                  </div>

                  <div className="space-y-3">
                    {eventFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <FileText size={16} />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-800">{file.name}</p>
                              {/* Render badge if file is restricted */}
                              {file.isConfidential && (
                                <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-bold">
                                  <Lock size={10} /> Restricted
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{file.size} • Uploaded {file.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            className="text-sm text-gray-400 cursor-not-allowed font-medium transition"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-gray-400 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center gap-3 shrink-0 bg-white">
              <button onClick={handlePrint} className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm">
                Download PDF
              </button>
              <button onClick={handlePrint} className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
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

            <div className="bg-[#4f46e5] p-6 text-white flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-2xl font-medium">Edit Event</h2>
                <p className="text-indigo-200 mt-1 text-sm">Update event details and information</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              {editErrorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={20} className="text-red-500 shrink-0" />
                  <p className="text-sm font-medium">{editErrorMessage}</p>
                  <button onClick={() => setEditErrorMessage("")} className="ml-auto text-red-400 hover:text-red-600">
                    <X size={16} />
                  </button>
                </div>
              )}
              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Event Title</label>
                    <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Event Date</label>
                      <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                      <input type="time" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">End Time</label>
                      <input type="time" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Venue</label>
                    <input type="text" value={editForm.venue} onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Venue Address</label>
                    <input type="text" value={editForm.venueAddress} onChange={(e) => setEditForm({ ...editForm, venueAddress: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Expected Attendees</label>
                      <input type="number" value={editForm.expectedAttendees} onChange={(e) => setEditForm({ ...editForm, expectedAttendees: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Budget ($)</label>
                      <input type="number" value={editForm.budget} onChange={(e) => setEditForm({ ...editForm, budget: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <textarea rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] resize-none text-gray-900"></textarea>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              <section>
                <h3 className="text-lg text-gray-800 mb-4 font-medium">Organizer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Organizer Name</label>
                    {/* Read-only because it's their real account name */}
                    <input type="text" value={editForm.organizerName} readOnly className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 outline-none text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Your Event Role</label>
                    {/* Dropdown mapping perfectly to your Database Enums! */}
                    <select
                      value={editForm.organizerRole}
                      onChange={(e) => setEditForm({ ...editForm, organizerRole: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900 bg-white"
                    >
                      <option value="President">President</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                      <option value="Team_Lead">Team Lead</option>
                      <option value="Volunteer">Volunteer</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    {/* Read-only account email */}
                    <input type="email" value={editForm.organizerEmail} readOnly className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 outline-none text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg text-gray-800 font-medium">Event Agenda</h3>
                  <button onClick={() => setAgendaItems([...agendaItems, { startTime: "", endTime: "", title: "" }])} className="flex items-center gap-1 bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                    <Plus size={16} /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {agendaItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <input
                        type="time"
                        value={item.startTime || ""}
                        onChange={(e) => {
                          const newArr = [...agendaItems];
                          newArr[idx] = { ...newArr[idx], startTime: e.target.value };
                          setAgendaItems(newArr);
                        }}
                        className="w-1/4 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900"
                      />
                      <input
                        type="time"
                        value={item.endTime || ""}
                        onChange={(e) => {
                          const newArr = [...agendaItems];
                          newArr[idx] = { ...newArr[idx], endTime: e.target.value };
                          setAgendaItems(newArr);
                        }}
                        className="w-1/4 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900"
                      />
                      <input
                        type="text"
                        placeholder="Session Title"
                        value={item.title || ""}
                        onChange={(e) => {
                          const newArr = [...agendaItems];
                          newArr[idx] = { ...newArr[idx], title: e.target.value };
                          setAgendaItems(newArr);
                        }}
                        className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900"
                      />
                      <button onClick={() => setAgendaItems(agendaItems.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg text-gray-800 font-medium">Speakers</h3>
                  <button onClick={() => setSpeakers([...speakers, { name: "", role: "" }])} className="flex items-center gap-1 bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                    <Plus size={16} /> Add Speaker
                  </button>
                </div>
                <div className="space-y-3">
                  {speakers.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <input type="text" placeholder="Name" value={item.name || ""} onChange={(e) => { const newArr = [...speakers]; newArr[idx].name = e.target.value; setSpeakers(newArr); }} className="w-1/2 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <input type="text" placeholder="Role/Designation" value={item.role || ""} onChange={(e) => { const newArr = [...speakers]; newArr[idx].role = e.target.value; setSpeakers(newArr); }} className="w-1/2 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <button onClick={() => setSpeakers(speakers.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg text-gray-800 font-medium">Sponsors</h3>
                  <button onClick={() => setSponsors([...sponsors, { name: "", tier: "", amount: "" }])} className="flex items-center gap-1 bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                    <Plus size={16} /> Add Sponsor
                  </button>
                </div>
                <div className="space-y-3">
                  {sponsors.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <input type="text" placeholder="Company Name" value={item.name || ""} onChange={(e) => { const newArr = [...sponsors]; newArr[idx].name = e.target.value; setSponsors(newArr); }} className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <input type="text" placeholder="Tier (e.g. Gold)" value={item.tier || ""} onChange={(e) => { const newArr = [...sponsors]; newArr[idx].tier = e.target.value; setSponsors(newArr); }} className="w-32 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <input type="number" placeholder="Amount" value={item.amount || ""} onChange={(e) => { const newArr = [...sponsors]; newArr[idx].amount = e.target.value; setSponsors(newArr); }} className="w-32 border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#4f46e5] text-gray-900" />
                      <button onClick={() => setSponsors(sponsors.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            <div className="p-4 border-t border-gray-200 flex items-center gap-3 shrink-0 bg-white">
              {/* NEW: Connect the handleUpdateEvent function here */}
              <button
                onClick={handleUpdateEvent}
                disabled={isSaving}
                className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition text-sm disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
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