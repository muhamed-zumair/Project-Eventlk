"use client";

import { useState } from "react";
import { 
  MessageSquare, Mail, Users, Send, Sparkles, 
  CheckSquare, Search, Paperclip 
} from "lucide-react";

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");

  // Mock Team Data
  const teamMembers = [
    { id: 1, name: "Sarah Mitchell", role: "Chairperson" },
    { id: 2, name: "David Kim", role: "Treasurer" },
    { id: 3, name: "Emily Chen", role: "Secretary" },
    { id: 4, name: "Alex Johnson", role: "Team Lead" },
    { id: 5, name: "Michael Brown", role: "Volunteer" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Communications Center</h2>
          <p className="text-gray-500 text-sm mt-1">Manage team messaging and external attendee emails</p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("internal")}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "internal"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <MessageSquare size={18} />
          Internal Team Messaging
        </button>
        <button
          onClick={() => setActiveTab("external")}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "external"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Mail size={18} />
          AI Bulk Emails
        </button>
      </div>

      {/* TAB CONTENT: Internal Messaging */}
      {activeTab === "internal" && (
        <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
          {/* Left Sidebar: Recipients List */}
          <div className="w-full lg:w-1/3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-indigo-600" /> Select Recipients
              </h3>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search team members..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-gray-800">Select All Event Staff</span>
              </label>
              <hr className="my-2 border-gray-100" />
              {teamMembers.map((member) => (
                <label key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-800">{member.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{member.role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Right Area: Chat Window */}
          <div className="w-full lg:w-2/3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-800">Event Announcement Board</h3>
              <p className="text-xs text-gray-500">Messages sent here will notify selected team members.</p>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30">
              {/* Mock Message */}
              <div className="flex flex-col gap-1 mb-6 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-medium">SM</div>
                  <span className="text-sm font-medium text-gray-800">Sarah Mitchell (You)</span>
                  <span className="text-xs text-gray-400">10:42 AM</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 text-gray-800 text-sm p-3 rounded-2xl rounded-tl-none ml-10">
                  Hey team! Just a reminder that we need to finalize the catering budget by tomorrow end of day. David, can you confirm the numbers?
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <Paperclip size={20} />
                </button>
                <textarea 
                  placeholder="Type your message to the team..." 
                  className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  rows={2}
                />
                <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI Bulk Emails */}
      {activeTab === "external" && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 max-w-4xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">AI Email Generator</h3>
              <p className="text-sm text-gray-500">Draft and send professional emails to attendees in seconds.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1: Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">1. Who is this for?</label>
                <select className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white">
                  <option>All Registered Attendees</option>
                  <option>Speakers & Sponsors Only</option>
                  <option>Upload Custom CSV List...</option>
                </select>
              </div>

              {/* Step 2: Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">2. Email Tone</label>
                <select className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white">
                  <option>Exciting & Welcoming</option>
                  <option>Formal & Professional</option>
                  <option>Urgent Reminder</option>
                </select>
              </div>
            </div>

            {/* Step 3: Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">3. What are the key details?</label>
              <textarea 
                placeholder="e.g., Remind them that the Tech Summit starts tomorrow at 9 AM, parking is at the North Garage, and to have their QR codes ready." 
                className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 resize-none"
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <button className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition w-full justify-center">
              <Sparkles size={16} /> Generate AI Draft
            </button>

            {/* Output Editor */}
            <div className="pt-6 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">4. Review & Edit Draft</label>
              <input 
                type="text" 
                defaultValue="Important details for tomorrow's Tech Summit!" 
                className="w-full border border-gray-300 rounded-t-xl border-b-0 p-3 text-sm font-medium outline-none focus:bg-gray-50"
              />
              <textarea 
                defaultValue="Hi [First Name],&#10;&#10;We are so excited to welcome you to the Tech Summit tomorrow! Please remember that doors open at 9:00 AM. &#10;&#10;Parking is available at the North Garage. To ensure a smooth check-in, please have the unique QR code we sent you ready to scan at the entrance.&#10;&#10;See you tomorrow,&#10;The EventLK Team" 
                className="w-full border border-gray-300 rounded-b-xl p-4 text-sm outline-none focus:bg-gray-50 resize-y"
                rows={8}
              />
            </div>

            {/* Final Action */}
            <div className="flex justify-end gap-3 pt-2">
              <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                Send Test Email
              </button>
              <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                <Send size={16} /> Send to 168 Attendees
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}