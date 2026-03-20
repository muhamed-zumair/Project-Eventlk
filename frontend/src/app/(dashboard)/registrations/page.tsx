"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "../../../utils/api";
import { io } from "socket.io-client";
import { 
  QrCode, Mail, Users, Search, CheckCircle, 
  Clock, CheckSquare, Square, Link as LinkIcon, Copy, CalendarDays
} from "lucide-react";

interface Attendee {
  id: string;
  name: string;
  email: string;
  date: string;
  status: 'Pending QR' | 'QR Sent' | 'Checked In';
}

export default function RegistrationsPage() {
  const [eventsList, setEventsList] = useState<{id: string, name: string}[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch "In Progress" Events
  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        const response = await fetchAPI('/events', { method: 'GET' });
        if (response.success && response.events) {
          const activeEvents = response.events.map((evt: any) => ({ id: evt.id, name: evt.title }));
          setEventsList(activeEvents);
          if (activeEvents.length > 0) setSelectedEventId(activeEvents[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };
    fetchActiveEvents();
  }, []);

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
    const socket = io('http://localhost:5000');
    socket.on('NEW_REGISTRATION', (data: any) => {
      // If the incoming registration is for the event we are currently looking at, fetch fresh data!
      if (data.eventId === selectedEventId) {
        getAttendees();
      }
    });

    return () => { socket.disconnect(); };
  }, [selectedEventId]);

  // Dynamic Webhook URL
  const webhookUrl = `http://localhost:5000/api/v1/webhooks/reg_${selectedEventId}`;

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
        // Because we fire a WebSocket event from the backend, we don't even need to 
        // manually update the state here. The useEffect listener will handle fetching the fresh data!
        setSelectedIds([]);
        alert(`Successfully dispatched ${selectedIds.length} QR code tickets via email!`);
      }
    } catch (error) {
      console.error("Error issuing tickets", error);
      alert("Failed to issue tickets. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const pendingCount = attendees.filter(a => a.status === "Pending QR").length;
  const sentCount = attendees.filter(a => a.status === "QR Sent" || a.status === "Checked In").length;

  if (eventsList.length === 0) {
    return (
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center p-10 text-center shadow-sm min-h-[60vh]">
        <Users size={48} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Events</h3>
        <p className="text-gray-500 max-w-sm">Create an active event to start collecting registrations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Registrations & Tickets</h2>
          <p className="text-gray-500 text-sm mt-1">Manage confirmed attendees and issue calendar invites</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-1.5 rounded-lg flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-md text-indigo-600 shadow-sm"><CalendarDays size={18} /></div>
          <select 
            value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-transparent text-sm font-bold text-indigo-900 outline-none pr-4 cursor-pointer max-w-[200px] truncate"
          >
            {eventsList.map(evt => <option key={evt.id} value={evt.id}>{evt.name}</option>)}
          </select>
        </div>
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${selectedIds.length > 0 ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {isSending ? <span className="animate-pulse">Dispatching...</span> : <><Mail size={16} /> Issue Tickets & Calendar Invites {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}</>}
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
                        {attendee.status === "QR Sent" ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"><CheckCircle size={12} /> Ticket Sent</span> :
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
    </div>
  );
}