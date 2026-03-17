"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, MapPin, PieChart, Palette, 
  ListChecks, BrainCircuit, Zap, DollarSign, Check, X 
} from "lucide-react";
import { PieChart as ReChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fetchAPI } from "../../../utils/api";

export default function AIRecommendationsPage() {
  const [draft, setDraft] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem("aiDraft");
    if (savedDraft) {
      setDraft(JSON.parse(savedDraft));
    }
  }, []);

  const handleConfirmEvent = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      // 1. Save the main event and get back the ID
      const response = await fetchAPI("/events", {
        method: "POST",
        body: JSON.stringify({
          title: draft.title,
          date: draft.date,
          category: draft.category,
          expectedAttendees: draft.headcount,
          budget: draft.totalBudget,
          description: `AI Generated Plan: ${draft.plan.join(". ")}`,
          venue: draft.venue, // This will be handled by your controller's venue logic
          venueAddress: "Recommended by EventLK AI"
        })
      });

      if (response.success) {
        alert("AI Event Created Successfully!");
        localStorage.removeItem("aiDraft");
        window.location.href = "/dashboard"; // Change this to your actual dashboard route
      }
    } catch (error) {
      console.error("Error saving AI event:", error);
      alert("Failed to create AI event.");
    } finally {
      setIsSaving(false);
    }
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f59e0b', '#06b6d4'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto h-full flex flex-col pt-4 px-6 pb-20">
      
      {/* 1. SHARED HERO SECTION (Always stays at the top) */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-10 md:p-14 text-white shadow-xl relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-sm font-semibold mb-6 backdrop-blur-sm">
            <BrainCircuit size={16} /> EventLK Intelligence Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Meet your intelligent <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">
              Co-Organizer.
            </span>
          </h1>
          <p className="text-indigo-100/90 text-lg leading-relaxed max-w-2xl">
            {draft 
              ? `Reviewing your custom plan for "${draft.title}". Confirm below to initialize your project.` 
              : "Our proprietary AI model analyzes thousands of data points to instantly generate comprehensive event strategies."}
          </p>
        </div>
      </div>

      {!draft ? (
        /* 2. DEFAULT "HOW IT WORKS" CONTENT (Strictly Restored) */
        <>
          <div className="pt-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">How the Engine Works</h2>
              <p className="text-gray-500 mt-1">Four pillars of automated event planning</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><MapPin size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Venue Matching</h3>
              <p className="text-gray-600 leading-relaxed">The AI cross-references your expected headcount, event category, and total budget to recommend the perfect real-world venue.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm group">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><PieChart size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Financial Allocation</h3>
              <p className="text-gray-600 leading-relaxed">Stop guessing your budget. The model instantly structures a highly detailed financial strategy across key categories.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm group">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Palette size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Brand & Theme Generation</h3>
              <p className="text-gray-600 leading-relaxed">The AI generates a cohesive, psychology-backed color palette tailored to the mood of your event.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm group">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><ListChecks size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pre-Event Action Plans</h3>
              <p className="text-gray-600 leading-relaxed">Transform ideas into execution. The engine writes a customized, week-by-week action plan for your committee.</p>
            </div>
          </div>
        </>
      ) : (
        /* 3. DYNAMIC AI DRAFT CONTENT (Only shows when Preview & Confirm clicked) */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="text-indigo-600" /> AI Draft: {draft.title}
              </h2>
              <p className="text-gray-500 mt-2">Recommended Strategy for {draft.headcount} attendees</p>
            </div>
            <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 text-right">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Total Budget</p>
              <p className="text-2xl font-black text-gray-900">LKR {draft.totalBudget.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Venue */}
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

              {/* Budget Allocation */}
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

            <div className="space-y-8">
              {/* Theme & Actions */}
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

              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ListChecks size={20} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Action Plan</h3>
                </div>
                <div className="space-y-4 text-sm text-gray-600">
                  {draft.plan.map((step: string, i: number) => (
                    <div key={i} className="flex gap-3"><Check size={16} className="text-green-500 mt-1" /> {step}</div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleConfirmEvent}
                  disabled={isSaving}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition"
                >
                  {isSaving ? "Saving..." : "Confirm & Create Event"}
                </button>
                <button 
                  onClick={() => { localStorage.removeItem("aiDraft"); setDraft(null); }}
                  className="w-full bg-white border border-gray-200 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <X size={18} /> Cancel & Discard Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}