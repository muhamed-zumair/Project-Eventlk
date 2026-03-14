"use client";

import React, { useState } from "react";
import { 
  Calendar, MapPin, Users, ArrowRight, X, 
  TrendingUp, DollarSign, FileText, User, Download, CheckCircle 
} from "lucide-react";

// --- Types for Completed Events ---
interface Speaker {
  name: string;
  role: string;
}

interface Sponsor {
  name: string;
  tier: string;
  amount: string;
}

interface EventDocument {
  id: string;
  name: string;
  size: string;
  date: string;
}

interface CompletedEvent {
  id: string;
  title: string;
  status: "Done";
  date: string;
  location: string;
  summary: string;
  iconColor: string;
  analytics: {
    expectedAttendees: number;
    actualAttendees: number;
    allocatedBudget: number;
    spentBudget: number;
  };
  speakers: Speaker[];
  sponsors: Sponsor[];
  documents: EventDocument[];
}

// --- Mock Data: 1 Completed Event ---
const completedEvents: CompletedEvent[] = [
  {
    id: "evt_past_1",
    title: "Alumni Tech Meetup 2023",
    status: "Done",
    date: "November 30, 2023",
    location: "University Grand Hall",
    iconColor: "bg-green-100 text-green-600",
    summary: "The Alumni Tech Meetup 2023 was a resounding success, bringing together over 180 former students and industry leaders. The event fostered incredible networking opportunities, resulted in 15 new mentorship pairings, and successfully stayed well under the allocated budget. Feedback forms indicated a 98% satisfaction rate among attendees.",
    analytics: {
      expectedAttendees: 200,
      actualAttendees: 185,
      allocatedBudget: 15000,
      spentBudget: 12450,
    },
    speakers: [
      { name: "Dr. Jonathan Crane", role: "Head of AI, Global Tech" },
      { name: "Sarah Jenkins", role: "Founder, Startup Hub" }
    ],
    sponsors: [
      { name: "TechCorp Global", tier: "Gold", amount: "$5,000" },
      { name: "InnovateLocal", tier: "Silver", amount: "$2,500" }
    ],
    documents: [
      { id: "doc_1", name: "Final_Budget_Report.xlsx", size: "1.2 MB", date: "Dec 02, 2023" },
      { id: "doc_2", name: "Attendee_List_Final.csv", size: "850 KB", date: "Nov 30, 2023" },
      { id: "doc_3", name: "Event_Photos_Link.pdf", size: "120 KB", date: "Dec 05, 2023" }
    ]
  }
];

// --- Components ---
const StatusBadge = () => {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
      Done
    </span>
  );
};

export default function MyEventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<CompletedEvent | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Past Events</h2>
          <p className="text-gray-500 text-sm mt-1">Review analytics, documents, and summaries of completed events</p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {completedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
          >
            {/* Card Header: Icon & Badge */}
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${event.iconColor}`}>
                <CheckCircle size={24} />
              </div>
              <StatusBadge />
            </div>

            {/* Event Title */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">{event.title}</h3>

            {/* Event Details List */}
            <div className="space-y-3 text-sm text-gray-600 mb-6 flex-1">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-400" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-400" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users size={16} className="text-gray-400" />
                <span>{event.analytics.actualAttendees} attendees</span>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-gray-50 mt-auto">
              <button 
                onClick={() => setSelectedEvent(event)}
                className="flex items-center gap-2 text-indigo-600 text-sm font-medium hover:text-indigo-800 transition group w-full"
              >
                View Post-Event Report
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        ))}

        {completedEvents.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">You have no completed events yet.</p>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL (POST-EVENT REPORT) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="bg-gray-900 p-6 text-white flex justify-between items-start shrink-0">
              <div>
                <div className="flex gap-2 mb-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                    Event Completed
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                <p className="text-gray-400 text-sm mt-1">{selectedEvent.date} • {selectedEvent.location}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar bg-gray-50">

              {/* Impressive Summary */}
              <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="text-indigo-600" size={20} /> Event Summary
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {selectedEvent.summary}
                </p>
              </section>

              {/* Analytics Section */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-indigo-600" size={20} /> Post-Event Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Attendance Analytics */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-sm font-medium text-gray-500">Final Attendance</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round((selectedEvent.analytics.actualAttendees / selectedEvent.analytics.expectedAttendees) * 100)}%
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full mb-3 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full" 
                        style={{ width: `${(selectedEvent.analytics.actualAttendees / selectedEvent.analytics.expectedAttendees) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{selectedEvent.analytics.actualAttendees} Attended</span>
                      <span>{selectedEvent.analytics.expectedAttendees} Expected</span>
                    </div>
                  </div>

                  {/* Budget Analytics */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-sm font-medium text-gray-500">Budget Utilization</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round((selectedEvent.analytics.spentBudget / selectedEvent.analytics.allocatedBudget) * 100)}%
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full mb-3 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full rounded-full" 
                        style={{ width: `${(selectedEvent.analytics.spentBudget / selectedEvent.analytics.allocatedBudget) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${selectedEvent.analytics.spentBudget.toLocaleString()} Spent</span>
                      <span>${selectedEvent.analytics.allocatedBudget.toLocaleString()} Allocated</span>
                    </div>
                  </div>

                </div>
              </section>

              {/* Speakers & Sponsors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Speakers */}
                <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="text-indigo-600" size={18} /> Guest Speakers
                  </h3>
                  <div className="space-y-4">
                    {selectedEvent.speakers.map((speaker, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {speaker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{speaker.name}</p>
                          <p className="text-xs text-gray-500">{speaker.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Sponsors */}
                <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign className="text-indigo-600" size={18} /> Official Sponsors
                  </h3>
                  <div className="space-y-4">
                    {selectedEvent.sponsors.map((sponsor, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{sponsor.name}</p>
                          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{sponsor.tier}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-700">{sponsor.amount}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Historical Documents */}
              <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="text-indigo-600" size={20} /> Archived Documents
                </h3>
                <div className="space-y-2">
                  {selectedEvent.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-gray-50 border border-gray-100 rounded-lg transition">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 text-gray-500 rounded-lg">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.size} • Saved on {doc.date}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition px-3 py-1.5 rounded-md hover:bg-indigo-50">
                        <Download size={16} /> Download
                      </button>
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