"use client";
import { fetchAPI } from '../../../utils/api';
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, FileText, CheckCircle, ArrowRight } from "lucide-react";

export default function MyEvents() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

              <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition group">
                View Post-Event Report <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}