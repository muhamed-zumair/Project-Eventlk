"use client";
import { fetchAPI } from '../../../utils/api';
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, FileText, CheckCircle, ArrowRight, X, DollarSign, DownloadCloud, Loader2, BarChart3, Presentation, Handshake } from "lucide-react";

export default function MyEvents() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isExtractingId, setIsExtractingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPast = async () => {
      try {
        // 🚀 1. Fetch the newly upgraded backend route
        const response = await fetchAPI('/events/past', { method: 'GET' });
        
        if (response.success) {
          setPastEvents(response.events);
        }
      } catch (error) {
        console.error("Error loading past events", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPast();
  }, []);

  const openReport = async (eventId: string) => {
    setIsExtractingId(eventId);
    try {
      // 🚀 2. Fetch the detailed report. We trust the backend 100% here. No frontend math!
      const response = await fetchAPI(`/events/report/${eventId}`, { method: 'GET' });
      
      if (response.success) {
        setSelectedReport(response.report);
      }
    } catch (error) {
      console.error("Failed to extract report details:", error);
    } finally {
      setIsExtractingId(null);
    }
  };

  const handleDownloadFile = async (docId: string) => {
    try {
      const response = await fetchAPI(`/events/documents/${docId}/download`, { method: 'GET' });
      if (response.success && response.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error("Failed to download file", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Post-Event Reports</h1>
          <p className="text-gray-500 mt-2 font-medium">Review analytics, documents, and financial summaries of your completed events.</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
          <BarChart3 size={24} />
        </div>
      </div>

      {/* CONTENT AREA */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-indigo-600 space-y-4">
          <Loader2 size={32} className="animate-spin" />
          <span className="font-semibold animate-pulse">Retrieving archives...</span>
        </div>
      ) : pastEvents.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4"><CheckCircle size={40} /></div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No completed events yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Once an event finishes, its historical data, budget reports, and documents will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pastEvents.map((event) => (
            <div key={event.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-5">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border border-emerald-100">
                  <CheckCircle size={14} /> Completed
                </span>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</p>
                  <p className="text-sm font-semibold text-gray-900">{event.start_date ? new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBA"}</p>
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
              <p className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-6">
                <MapPin size={16} className="text-indigo-400" /> {event.venue_name || "Venue TBA"}
              </p>

              <div className="space-y-5 bg-gray-50 rounded-2xl p-5 mb-6 flex-1 border border-gray-100">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-1.5">
                    <span className="text-gray-600 flex items-center gap-1.5"><Users size={16} className="text-blue-500" /> Attendance</span>
                    <span className="text-gray-900">{event.checked_in_count} / {event.expected_headcount}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${event.expected_headcount > 0 ? (event.checked_in_count / event.expected_headcount) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold mb-1.5">
                    <span className="text-gray-600 flex items-center gap-1.5"><DollarSign size={16} className="text-emerald-500" /> Budget Spent</span>
                    <span className="text-gray-900">{Math.round(event.total_budget > 0 ? (event.total_spent / event.total_budget) * 100 : 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${event.total_spent > event.total_budget ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(event.total_budget > 0 ? (event.total_spent / event.total_budget) * 100 : 0, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openReport(event.id)}
                disabled={isExtractingId === event.id}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isExtractingId === event.id ? (
                  <><Loader2 size={18} className="animate-spin" /> Generating Report...</>
                ) : (
                  <>View Full Report <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FULL REPORT MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">

            {/* Modal Header */}
            <div className="bg-slate-900 p-8 text-white relative shrink-0">
              <button onClick={() => setSelectedReport(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white hover:bg-slate-800 p-2.5 rounded-full transition-colors bg-slate-800/50">
                <X size={24} />
              </button>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <CheckCircle size={14} /> Official Post-Event Report
              </span>

              <h2 className="text-3xl md:text-4xl font-black mb-3">{selectedReport.title}</h2>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-300 text-sm font-semibold">
                <span className="flex items-center gap-2"><Calendar size={18} className="text-indigo-400" /> {selectedReport.start_date ? new Date(selectedReport.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Date TBA"}</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-2"><MapPin size={18} className="text-indigo-400" /> {selectedReport.venue_name || "Venue TBA"}</span>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 space-y-8">

              {/* Top Analytics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Final Attendance Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><Users size={100} /></div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Final Attendance</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-black text-slate-900">{selectedReport.attendanceRate}%</span>
                    <span className="text-slate-500 font-medium">Turnout</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-4">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${selectedReport.attendanceRate}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500" /> {selectedReport.finalAttendance} Attended</span>
                    <span>{selectedReport.expected_headcount} Expected</span>
                  </div>
                </div>

                {/* Budget Utilization Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><DollarSign size={100} /></div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Budget Utilization</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-black text-slate-900">{selectedReport.budgetUtilization}%</span>
                    <span className="text-slate-500 font-medium">Spent</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-4">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${selectedReport.budgetUtilization > 100 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(selectedReport.budgetUtilization, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2"><DollarSign size={16} className={selectedReport.budgetUtilization > 100 ? "text-red-500" : "text-emerald-500"} /> LKR {Number(selectedReport.totalSpent).toLocaleString()}</span>
                    <span>LKR {Number(selectedReport.total_budget).toLocaleString()} Limit</span>
                  </div>
                </div>
              </div>

              {/* Speakers & Sponsors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Speakers */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Presentation size={20} className="text-indigo-500" /> Event Speakers
                  </h3>
                  {selectedReport.speakers?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedReport.speakers.map((speaker: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg shrink-0">
                            {speaker.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{speaker.name}</p>
                            <p className="text-sm font-medium text-slate-500">{speaker.designation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm font-medium text-slate-400 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No speakers were recorded for this event.</p>
                  )}
                </div>

                {/* Sponsors */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Handshake size={20} className="text-indigo-500" /> Official Sponsors
                  </h3>
                  {selectedReport.sponsors?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedReport.sponsors.map((sponsor: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                          <div>
                            <p className="font-bold text-slate-900 mb-1">{sponsor.name}</p>
                            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-black uppercase tracking-widest">
                              {sponsor.tier}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                            LKR {Number(sponsor.contribution_amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm font-medium text-slate-400 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No sponsors were recorded for this event.</p>
                  )}
                </div>
              </div>

              {/* Documents Archive */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <FileText size={20} className="text-indigo-500" /> Secure Document Archive
                </h3>
                {selectedReport.documents?.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {selectedReport.documents.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="p-3 bg-white text-indigo-500 rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <FileText size={20} />
                          </div>
                          <div className="truncate pr-4">
                            <p className="font-bold text-slate-800 text-sm truncate">{doc.file_name}</p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{doc.file_size} • Archived AWS S3</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDownloadFile(doc.id)}
                          className="shrink-0 bg-white text-indigo-600 font-bold text-sm px-4 py-2 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-2"
                        >
                          <DownloadCloud size={16} /> Get
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm font-medium text-slate-400 py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No documents were archived during this event.</p>
                )}
              </div>

            </div>
            
            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 bg-white flex justify-end shrink-0 rounded-b-3xl">
              <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-sm text-sm">
                Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}