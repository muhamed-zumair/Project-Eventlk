"use client";

import { Plus, Calendar, MapPin, Users, ArrowRight } from "lucide-react";

// --- Types ---
type EventStatus = "Upcoming" | "Planning" | "Completed";

interface Event {
  id: string;
  title: string;
  status: EventStatus;
  date: string;
  location: string;
  attendees: number;
  iconColor: string; // To match the distinct icon background colors
}

// --- Mock Data (Matches Screenshot) ---
const events: Event[] = [
  {
    id: "1",
    title: "Annual Tech Summit 2025",
    status: "Upcoming",
    date: "Dec 25, 2024",
    location: "Main Hall",
    attendees: 200,
    iconColor: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "2",
    title: "Spring Conference",
    status: "Planning",
    date: "Jan 15, 2025",
    location: "Conference Center",
    attendees: 150,
    iconColor: "bg-blue-100 text-blue-600",
  },
  {
    id: "3",
    title: "Startup Networking Event",
    status: "Planning",
    date: "Feb 10, 2025",
    location: "Innovation Hub",
    attendees: 80,
    iconColor: "bg-purple-100 text-purple-600",
  },
  {
    id: "4",
    title: "Alumni Meetup",
    status: "Completed",
    date: "Nov 30, 2024",
    location: "University Grounds",
    attendees: 120,
    iconColor: "bg-green-100 text-green-600",
  },
];

// --- Components ---

const StatusBadge = ({ status }: { status: EventStatus }) => {
  const styles = {
    Upcoming: "bg-indigo-100 text-indigo-700",
    Planning: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function MyEventsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Events</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track all your university events</p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Card Header: Icon & Badge */}
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${event.iconColor}`}>
                <Calendar size={24} />
              </div>
              <StatusBadge status={event.status} />
            </div>

            {/* Event Title */}
            <h3 className="text-lg font-bold text-gray-800 mb-4">{event.title}</h3>

            {/* Event Details List */}
            <div className="space-y-3 text-sm text-gray-600 mb-6">
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
                <span>{event.attendees} attendees</span>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-gray-50">
              <button className="flex items-center gap-2 text-indigo-600 text-sm font-medium hover:text-indigo-800 transition group">
                View Details
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}