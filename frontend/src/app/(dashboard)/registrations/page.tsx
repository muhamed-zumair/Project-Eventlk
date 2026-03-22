"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "../../../utils/api";
import { io } from "socket.io-client";
import {
  QrCode, Mail, Users, Search, CheckCircle,
  Clock, CheckSquare, Square, Link as LinkIcon, Copy, CalendarDays,
  Loader2, X, Info, ShieldAlert ,Plus// 🚀 ADDED NEW ICONS HERE
} from "lucide-react";
import { useEventContext } from "../../../context/EventContext"; // 🚀 Import the Brain

interface Attendee {
  id: string;
  name: string;
  email: string;
  date: string;
  status: 'Pending QR' | 'Sent' | 'Checked In';
}

export default function RegistrationsPage() {
  // 🚀 1. Hook into the Global Selector Brain
  const { myRole, isLoadingContext, selectedEventId, setSelectedEventId } = useEventContext(); 
  
  const [eventsList, setEventsList] = useState<{ id: string, name: string }[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 NEW: UI State for Toasts
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // 1. Sync with the Global Topbar Selector
  useEffect(() => {
    const syncWithGlobal = async () => {
      try {
        const response = await fetchAPI('/events', { method: 'GET' });
        if (response.success && response.events) {
          const activeEvents = response.events.map((evt: any) => ({ id: evt.id, name: evt.title }));
          setEventsList(activeEvents);
          
          // Only set the global ID if the Topbar hasn't initialized one yet
          if (!selectedEventId && activeEvents.length > 0) {
            setSelectedEventId(activeEvents[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to sync global state:", error);
      }
    };
    syncWithGlobal();
  }, [selectedEventId]);

  // 2. Fetch Attendees & Connect WebSocket whenever selected event changes
  useEffect(() => {
    if (!selectedEventId) return;

    const getAttendees = async () => {
      setIsLoading(true);
      try {
        const res = await fetchAPI(`/registrations/${selectedEventId}`, { method: 'GET' });
        if (res.success) setAttendees(res.attendees);
      } catch (error) {
        console.error("Failed to fetch attendees");
      } finally {
        setIsLoading(false);
      }
    };

    getAttendees();
    setSelectedIds([]); // Clear selections on event change

    // 🚀 WEBSOCKET CONNECTION FOR LIVE REGISTRATIONS
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    socket.on('NEW_REGISTRATION', (data: any) => {
      if (data.eventId === selectedEventId) getAttendees();
    });

    // --- ADD THIS NEW LISTENER ---
    socket.on('ATTENDEE_CHECKED_IN', (data: any) => {
      if (data.eventId === selectedEventId) getAttendees();
    });

    return () => { socket.disconnect(); };
  }, [selectedEventId]);

  // Dynamic Webhook URL
  const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/webhooks/reg_${selectedEventId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const pendingIds = attendees.filter(a => a.status === "Pending QR").map(a => a.id);
    if (selectedIds.length === pendingIds.length && pendingIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const handleBulkSend = async () => {
    setIsSending(true);
    try {
      const response = await fetchAPI(`/registrations/${selectedEventId}/issue-tickets`, {
        method: 'POST',
        body: JSON.stringify({ attendeeIds: selectedIds })
      });

      if (response.success) {
        setAttendees(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, status: 'Sent' } : a));
        showToast(`Successfully dispatched ${selectedIds.length} QR code tickets via email!`, "success"); // 🚀 REPLACED ALERT
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Error issuing tickets", error);
      showToast("Failed to issue tickets. Please try again.", "error"); // 🚀 REPLACED ALERT
    } finally {
      setIsSending(false);
    }
  };
  const pendingCount = attendees.filter(a => a.status === "Pending QR").length;
  const sentCount = attendees.filter(a => a.status === "Sent" || a.status === "Checked In").length;

  // 🚀 THE SECURITY GATE
  if (isLoadingContext) {
    return <div className="flex justify-center items-center h-[80vh]"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
  }

  // Lock out Volunteers entirely
  if (myRole === 'Volunteer') {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm rotate-3">
          <ShieldAlert size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-500 font-medium text-center max-w-md">
          Volunteers do not have permission to view or manage event registrations.
        </p>
        <button onClick={() => window.location.href = '/dashboard'} className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // 🚀 WELCOMING EMPTY STATE: For users with no events yet
  if (eventsList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner rotate-3 ring-8 ring-blue-50/50">
          <QrCode size={48} strokeWidth={1.5} />
        </div>
        
        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Automated Attendee Management</h2>
        <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed mb-10">
          Streamline your guest list from signup to check-in. Once you start an event, you'll be able to sync external forms via webhooks, dispatch branded QR tickets, and track live arrivals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12 text-left">
          {[
            { icon: LinkIcon, title: "Universal Sync", desc: "Connect Google Forms or Typeform instantly." },
            { icon: Mail, title: "Smart Dispatch", desc: "Bulk issue tickets and calendar invites." },
            { icon: CheckCircle, title: "Live Gate", desc: "Real-time arrival tracking and analytics." }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-blue-200 transition-colors">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-3 group-hover:scale-110 transition-transform"><feature.icon size={24} /></div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">{feature.title}</h4>
              <p className="text-xs text-gray-500 font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => window.dispatchEvent(new Event('openCreateModal'))}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 active:scale-95 flex items-center gap-3"
        >
          <Plus size={20} strokeWidth={3} /> Launch Your First Event
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - 🚀 Cleaned: Event switching now happens in the Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Registrations & Tickets</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage confirmed attendees and issue calendar invites</p>
        </div>
        
        {/* Local selector removed. Switch events in the Topbar! */}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        <div>
          <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-1">
            <LinkIcon size={18} className="text-indigo-600" /> Connect External Form
          </h3>
          <p className="text-sm text-indigo-700 max-w-3xl">
            Using Google Forms or Typeform? Paste this unique Webhook URL into your form settings or Zapier to automatically sync new signups instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <code className="bg-white border border-indigo-200 text-indigo-800 px-3 py-2 rounded-lg text-sm truncate w-full lg:w-72 shadow-inner">
            {webhookUrl}
          </code>
          <button onClick={handleCopy} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shrink-0">
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}{copied ? "Copied!" : "Copy URL"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Confirmed</p><p className="text-2xl font-bold text-gray-800">{attendees.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Clock size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Pending Tickets</p><p className="text-2xl font-bold text-gray-800">{pendingCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl"><QrCode size={24} /></div>
          <div><p className="text-sm text-gray-500 font-medium">Tickets Sent</p><p className="text-2xl font-bold text-gray-800">{sentCount}</p></div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search attendees..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>

          <button
            onClick={handleBulkSend} disabled={selectedIds.length === 0 || isSending}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed ${selectedIds.length > 0 ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "bg-gray-100 text-gray-400"}`}
          >
            {isSending ? (
              <><Loader2 size={16} className="animate-spin" /> Dispatching...</>
            ) : (
              <><Mail size={16} /> Issue Tickets & Calendar Invites {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}</>
            )}
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-indigo-600 font-medium animate-pulse">Loading attendees...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500">
                  <th className="p-4 font-medium w-12"><button onClick={toggleSelectAll} className="text-gray-400 hover:text-indigo-600 transition">{selectedIds.length > 0 && selectedIds.length === pendingCount ? <CheckSquare size={18} /> : <Square size={18} />}</button></th>
                  <th className="p-4 font-medium">Attendee Name</th>
                  <th className="p-4 font-medium">Email Address</th>
                  <th className="p-4 font-medium">Registration Date</th>
                  <th className="p-4 font-medium">Ticket Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendees.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No attendees registered for this event yet.</td></tr>
                ) : (
                  attendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        {attendee.status === "Pending QR" ? (
                          <button onClick={() => toggleSelect(attendee.id)} className="text-gray-400 hover:text-indigo-600 transition">{selectedIds.includes(attendee.id) ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}</button>
                        ) : <div className="w-[18px]" />}
                      </td>
                      <td className="p-4 font-medium text-gray-800">{attendee.name}</td>
                      <td className="p-4 text-gray-500 text-sm">{attendee.email}</td>
                      <td className="p-4 text-gray-500 text-sm">{attendee.date}</td>
                      <td className="p-4">
                        {attendee.status === "Sent" ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"><CheckCircle size={12} /> Ticket Sent</span> :
                          attendee.status === "Checked In" ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100"><CheckCircle size={12} /> Checked In</span> :
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100"><Clock size={12} /> Pending QR</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
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