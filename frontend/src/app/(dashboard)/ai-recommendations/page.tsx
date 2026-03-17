"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, MapPin, PieChart, Palette, 
  ListChecks, BrainCircuit, Zap, DollarSign, Check 
} from "lucide-react";
import { PieChart as ReChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function AIRecommendationsPage() {
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem("aiDraft");
    if (savedDraft) {
      setDraft(JSON.parse(savedDraft));
    }
  }, []);

  const handleConfirmEvent = async () => {
    // Logic to save draft to DB will go here later
    alert("Draft saved to Database! Event Created.");
    localStorage.removeItem("aiDraft");
    window.location.href = "/";
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f59e0b', '#06b6d4'];

  // 1. If no draft exists, show the original "How it Works" UI
  if (!draft) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto h-full flex flex-col pt-4 px-6">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-10 text-white shadow-xl">
           <h1 className="text-4xl font-extrabold mb-4">Meet your intelligent Co-Organizer.</h1>
           <p className="opacity-80">Generate an event from the top menu to see the engine in action.</p>
        </div>
        {/* ... Rest of your original "How it Works" grid goes here ... */}
      </div>
    );
  }

  // 2. If a draft exists, show the AI Output UI
  return (
    <div className="space-y-8 max-w-6xl mx-auto h-full flex flex-col pt-4 px-6 pb-20">
      
      {/* Header with Title and Budget Summary */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="text-indigo-600" /> AI Event Draft: {draft.title}
          </h1>
          <p className="text-gray-500 mt-2">Recommended Strategy for {draft.headcount} attendees</p>
        </div>
        <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 text-right">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Total Budget</p>
          <p className="text-2xl font-black text-gray-900">LKR {draft.totalBudget.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Venue & Budget */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Venue Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={20} /></div>
              <h3 className="text-xl font-bold text-gray-900">Recommended Venue</h3>
            </div>
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <h4 className="text-2xl font-bold text-blue-900">{draft.venue}</h4>
              <p className="text-blue-700 mt-1">Capacity optimized for {draft.headcount} people.</p>
            </div>
          </div>

          {/* Budget Allocation List & Chart */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><PieChart size={20} /></div>
              <h3 className="text-xl font-bold text-gray-900">Suggested Budget Allocation</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                {draft.budgetAllocation.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="font-bold text-gray-900">LKR {item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ReChart>
                    <Pie data={draft.budgetAllocation} innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                      {draft.budgetAllocation.map((_:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </ReChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Theme & Actions */}
        <div className="space-y-8">
          
          {/* Theme Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Palette size={20} /></div>
              <h3 className="text-xl font-bold text-gray-900">AI Color Theme</h3>
            </div>
            <p className="font-bold text-gray-800">"{draft.theme.name}"</p>
            <div className="flex gap-3 mt-4">
              <div className="w-10 h-10 rounded-full" style={{backgroundColor: draft.theme.primary}}></div>
              <div className="w-10 h-10 rounded-full" style={{backgroundColor: draft.theme.secondary}}></div>
              <div className="w-10 h-10 rounded-full" style={{backgroundColor: draft.theme.accent}}></div>
            </div>
          </div>

          {/* Planning Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ListChecks size={20} /></div>
              <h3 className="text-xl font-bold text-gray-900">Action Plan</h3>
            </div>
            <div className="space-y-4">
              {draft.plan.map((step: string, i: number) => (
                <div key={i} className="flex gap-3 text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mt-1 shrink-0" /> {step}
                </div>
              ))}
            </div>
          </div>

          {/* Final Action Button */}
          <button 
            onClick={handleConfirmEvent}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-1"
          >
            Confirm & Create Event
          </button>
          
          <button 
            onClick={() => { localStorage.removeItem("aiDraft"); setDraft(null); }}
            className="w-full text-gray-400 text-sm hover:text-gray-600"
          >
            Discard Draft
          </button>
        </div>
      </div>
    </div>
  );
}