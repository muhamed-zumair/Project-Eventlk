"use client";

import { useState } from "react";
import { 
  QrCode, Mail, Users, Search, CheckCircle, 
  Clock, CheckSquare, Square, Link as LinkIcon, Copy, CalendarDays
} from "lucide-react";

// --- Mock Data ---
const myEvents = [
  { id: 'evt_1', name: "Annual Tech Summit 2026" },
  { id: 'evt_2', name: "Spring Conference" },
];

export default function RegistrationsPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>(myEvents[0].id);

  // Mock data for attendees including the specific event they registered for
  const [attendees, setAttendees] = useState([
    { id: 1, eventId: 'evt_1', name: "Liam Anderson", email: "liam.a@example.com", date: "Mar 12, 2026", status: "Pending QR" },
    { id: 2, eventId: 'evt_1', name: "Emma Watson", email: "emma.w@example.com", date: "Mar 12, 2026", status: "QR Sent" },
    { id: 3, eventId: 'evt_1', name: "Noah Carter", email: "noah.c@example.com", date: "Mar 13, 2026", status: "Pending QR" },
    { id: 4, eventId: 'evt_2', name: "Olivia Martinez", email: "olivia.m@example.com", date: "Mar 13, 2026", status: "Pending QR" },
    { id: 5, eventId: 'evt_2', name: "William Davis", email: "will.d@example.com", date: "Mar 13, 2026", status: "QR Sent" },
  ]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Dynamic Filtering ---
  const currentAttendees = attendees.filter(a => a.eventId === selectedEventId);
  const currentEventName = myEvents.find(e => e.id === selectedEventId)?.name;

  // Dynamic Webhook URL so each event gets its own unique form link!
  const webhookUrl = `https://api.eventlk.com/v1/webhooks/reg_${selectedEventId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle individual selection
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle select all pending attendees (only for the CURRENT event)
  const toggleSelectAll = () => {
    const pendingIds = currentAttendees.filter(a => a.status === "Pending QR").map(a => a.id);
    if (selectedIds.length === pendingIds.length && pendingIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  // Bulk action to send QR codes
  const handleBulkSend = () => {
    setIsSending(true);

    // Tell the backend EXACTLY which event this is for, and who needs QRs!
    console.log(`TRIGGER BACKEND: Generating QRs for Event [${currentEventName}]`);
    console.log(`Sending to Attendee IDs:`, selectedIds);

    setTimeout(() => {
      setAttendees(prev => prev.map(a => 
        selectedIds.includes(a.id) ? { ...a, status: "QR Sent" } : a
      ));
      setSelectedIds([]);
      setIsSending(false);
      alert(`Successfully dispatched ${selectedIds.length} QR code tickets via email!`);
    }, 1500);
  };

  const pendingCount = currentAttendees.filter(a => a.status === "Pending QR").length;
  const sentCount = currentAttendees.filter(a => a.status === "QR Sent").length;

  return (
    <div className="space-y-6">
      {/* Page Header with Event Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Registrations & Tickets</h2>
          <p className="text-gray-500 text-sm mt-1">Manage confirmed attendees and issue bulk QR codes</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-1.5 rounded-lg flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-md text-indigo-600 shadow-sm">
            <CalendarDays size={18} />
          </div>
          <select 
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setSelectedIds([]); // Clear selection when switching events
            }}
            className="bg-transparent text-sm font-bold text-indigo-900 outline-none pr-4 cursor-pointer"
          >
            {myEvents.map(evt => (
              <option key={evt.id} value={evt.id}>{evt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Integration Section */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        <div>
          <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-1">
            <LinkIcon size={18} className="text-indigo-600" /> Connect External Form
          </h3>
          <p className="text-sm text-indigo-700 max-w-2xl">
            Using Google Forms or Typeform for registration? Paste this unique Webhook URL into your form settings or Zapier to automatically sync new signups directly into the table below.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <code className="bg-white border border-indigo-200 text-indigo-800 px-3 py-2 rounded-lg text-sm truncate w-full lg:w-64">
            {webhookUrl}
          </code>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shrink-0"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Confirmed</p>
            <p className="text-2xl font-bold text-gray-800">{currentAttendees.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Clock size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Tickets</p>
            <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl"><QrCode size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">QR Codes Sent</p>
            <p className="text-2xl font-bold text-gray-800">{sentCount}</p>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search registered attendees..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Bulk Action Button */}
          <button 
            onClick={handleBulkSend}
            disabled={selectedIds.length === 0 || isSending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedIds.length > 0
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSending ? (
              <span className="animate-pulse">Generating QRs...</span>
            ) : (
              <>
                <QrCode size={16} />
                Generate & Send {selectedIds.length > 0 ? `(${selectedIds.length})` : ""} QRs
              </>
            )}
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500">
                <th className="p-4 font-medium w-12">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-indigo-600 transition">
                    {selectedIds.length > 0 && selectedIds.length === pendingCount ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                </th>
                <th className="p-4 font-medium">Attendee Name</th>
                <th className="p-4 font-medium">Email Address</th>
                <th className="p-4 font-medium">Confirmation Date</th>
                <th className="p-4 font-medium">Ticket Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentAttendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    No attendees registered for this event yet.
                  </td>
                </tr>
              ) : (
                currentAttendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      {attendee.status === "Pending QR" ? (
                        <button onClick={() => toggleSelect(attendee.id)} className="text-gray-400 hover:text-indigo-600 transition">
                          {selectedIds.includes(attendee.id) ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} />}
                        </button>
                      ) : (
                        <div className="w-[18px]" /> // Placeholder for alignment
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{attendee.name}</td>
                    <td className="p-4 text-gray-500 text-sm">{attendee.email}</td>
                    <td className="p-4 text-gray-500 text-sm">{attendee.date}</td>
                    <td className="p-4">
                      {attendee.status === "QR Sent" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          <CheckCircle size={12} /> Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                          <Clock size={12} /> Pending QR
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}