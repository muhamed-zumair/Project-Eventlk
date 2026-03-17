"use client";
import { fetchAPI } from '../../../utils/api';
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, FileText, CheckCircle, ArrowRight, X } from "lucide-react";

export default function MyEvents() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openReport = async (id: string) => {
    const response = await fetchAPI(`/events/report/${id}`, { method: 'GET' });
    if (response.success) {
      setSelectedReport(response.report);
      setIsModalOpen(true);
    }
  };
  useEffect(() => {
    const fetchPast = async () => {
      try {
        // You'll need to define this route in your backend routes/eventRoutes.js
        const response = await fetchAPI('/events/past', { method: 'GET' });
        if (response.success) setPastEvents(response.events);
      } catch (error) {
        console.error("Error loading past events", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPast();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Past Events</h1>
        <p className="text-gray-500 mt-1">Review analytics, documents, and summaries of completed events</p>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-indigo-600 animate-pulse">Loading history...</div>
      ) : pastEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-gray-400">No completed events yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastEvents.map((event) => (
            <div key={event.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">Done</span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">{event.title}</h3>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <Calendar size={16} /> {new Date(event.start_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <MapPin size={16} /> {event.venue_name || "University Grand Hall"}
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <Users size={16} /> {event.expected_headcount} attendees
                </div>
              </div>

              <button
                onClick={() => openReport(event.id)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition group">
                View Post-Event Report <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            {/* Header */}
            <div className="bg-slate-900 p-8 text-white flex justify-between items-start sticky top-0 z-10">
              <div>
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold uppercase mb-3 inline-block">Event Completed</span>
                <h2 className="text-3xl font-bold">{selectedReport.title}</h2>
                <p className="opacity-70 mt-1">{new Date(selectedReport.start_date).toDateString()} • {selectedReport.venue_name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full"><X size={24} /></button>
            </div>

            <div className="p-8 space-y-10">
              {/* Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
                  <div className="flex justify-between items-end mb-4">
                    <h4 className="font-bold text-gray-700">Final Attendance</h4>
                    <span className="text-2xl font-black text-indigo-600">{selectedReport.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all" style={{ width: `${selectedReport.attendanceRate}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{selectedReport.finalAttendance} Attended / {selectedReport.expected_headcount} Expected</p>
                </div>

                <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
                  <div className="flex justify-between items-end mb-4">
                    <h4 className="font-bold text-gray-700">Budget Utilization</h4>
                    <span className="text-2xl font-black text-green-600">{selectedReport.budgetUtilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full transition-all" style={{ width: `${selectedReport.budgetUtilization}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">LKR {selectedReport.totalSpent.toLocaleString()} Spent / LKR {selectedReport.total_budget.toLocaleString()} Allocated</p>
                </div>
              </div>

              {/* Event Summary Section */}
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={22} className="text-indigo-500" /> Event Summary</h3>
                <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-6 leading-relaxed text-gray-700">
                  {selectedReport.post_event_summary || "No summary was provided for this event."}
                </div>
              </section>

              {/* Documents */}
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={22} className="text-indigo-500" /> Archived Documents</h3>
                <div className="space-y-3">
                  {selectedReport.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <FileText className="text-gray-400" />
                        <span className="font-medium text-gray-800">{doc.file_name}</span>
                      </div>
                      <button className="text-indigo-600 font-bold text-sm">Download</button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}