"use client";
import { fetchAPI } from '../../../utils/api';
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, FileText, CheckCircle, ArrowRight, X, DollarSign } from "lucide-react";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            {/* --- HEADER --- */}
            <div className="bg-slate-900 p-8 text-white relative shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle size={14} /> Event Completed
                </span>
              </div>

              <h2 className="text-3xl font-bold mb-2">{selectedReport.title}</h2>
              <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(selectedReport.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><MapPin size={16} /> {selectedReport.venue_name || "Venue TBA"}</span>
              </div>
            </div>

            {/* --- SCROLLABLE BODY --- */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 space-y-8">

              {/* Analytics Section */}
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Post-Event Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Attendance Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-sm font-semibold text-slate-500">Final Attendance</span>
                      <span className="text-3xl font-black text-slate-900">{selectedReport.attendanceRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${selectedReport.attendanceRate}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>{selectedReport.finalAttendance} Attended</span>
                      <span>{selectedReport.expected_headcount} Expected</span>
                    </div>
                  </div>

                  {/* Budget Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-sm font-semibold text-slate-500">Budget Utilization</span>
                      <span className="text-3xl font-black text-slate-900">{selectedReport.budgetUtilization}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${selectedReport.budgetUtilization > 100 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(selectedReport.budgetUtilization, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>LKR {selectedReport.totalSpent?.toLocaleString()} Spent</span>
                      <span>LKR {selectedReport.total_budget?.toLocaleString()} Allocated</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Details Grid (Speakers & Sponsors) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Speakers */}
                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users size={20} className="text-indigo-500" /> Guest Speakers
                  </h3>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {selectedReport.speakers?.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {selectedReport.speakers.map((speaker: any, i: number) => (
                          <div key={i} className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                              {speaker.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{speaker.name}</p>
                              <p className="text-xs text-slate-500">{speaker.designation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-slate-400 italic">No speakers recorded.</div>
                    )}
                  </div>
                </section>

                {/* Sponsors */}
                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <DollarSign size={20} className="text-indigo-500" /> Official Sponsors
                  </h3>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {selectedReport.sponsors?.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {selectedReport.sponsors.map((sponsor: any, i: number) => (
                          <div key={i} className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm mb-1">{sponsor.name}</p>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                {sponsor.tier}
                              </span>
                            </div>
                            <span className="font-semibold text-slate-900 text-sm">
                              LKR {Number(sponsor.contribution_amount).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-slate-400 italic">No sponsors recorded.</div>
                    )}
                  </div>
                </section>
              </div>

              {/* Documents Section */}
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-indigo-500" /> Archived Documents
                </h3>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-2 space-y-2">
                  {selectedReport.documents?.length > 0 ? (
                    selectedReport.documents.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 text-slate-500 rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{doc.file_name}</p>
                            <p className="text-xs text-slate-400">Archived on {new Date(doc.uploaded_at || selectedReport.start_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button className="text-indigo-600 font-semibold text-sm px-3 py-1.5 hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-400 italic bg-white rounded-lg">No documents archived for this event.</div>
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}