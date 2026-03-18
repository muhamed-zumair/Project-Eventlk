"use client";

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, MapPin, PieChart, Palette, 
  ListChecks, BrainCircuit, Zap, DollarSign, Check, X,
  TrendingUp, Rocket, ArrowRight
} from "lucide-react";
import { PieChart as ReChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
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
      const response = await fetchAPI("/events", {
        method: "POST",
        body: JSON.stringify({
          title: draft.title || "AI Generated Event",
          date: draft.date || new Date().toISOString().split('T')[0],
          category: draft.category || "Workshops & Training", 
          expectedAttendees: Number(draft.headcount) || 100,
          budget: Number(draft.totalBudget) || 50000,
          description: draft.plan ? `AI Plan: ${draft.plan.join(", ")}` : "AI Generated Strategy",
          venue: draft.venue || "Recommended Venue",
          venueAddress: "Recommended by EventLK AI"
        })
      });

      if (response.success) {
        alert("AI Event Created Successfully!");
        localStorage.removeItem("aiDraft"); 
        window.location.href = "/dashboard"; 
      }
    } catch (error: any) {
      console.error("Full Error Details:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f59e0b', '#06b6d4'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col pt-4 px-6 pb-20">
      
      {/* 1. SHARED HERO SECTION */}
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 rounded-3xl p-10 md:p-14 text-white shadow-2xl relative overflow-hidden shrink-0 border border-indigo-800/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-indigo-100 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-inner">
            <BrainCircuit size={16} /> EventLK Intelligence Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
            Meet your intelligent <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              Co-Organizer.
            </span>
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-2xl font-medium">
            {draft 
              ? `Reviewing your custom plan for "${draft.title}". Initialize your project below.` 
              : "Our proprietary AI model analyzes thousands of data points to instantly generate comprehensive event strategies."}
          </p>
        </div>
      </div>

      {!draft ? (
        /* 2. DEFAULT "HOW IT WORKS" CONTENT */
        <>
          <div className="pt-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">How the Engine Works</h2>
              <p className="text-gray-500 mt-1">Four pillars of automated event planning</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm group hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><MapPin size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Venue Matching</h3>
              <p className="text-gray-600 leading-relaxed">The AI cross-references your expected headcount, event category, and total budget to recommend the perfect real-world venue.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm group hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><PieChart size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Financial Allocation</h3>
              <p className="text-gray-600 leading-relaxed">Stop guessing your budget. The model instantly structures a highly detailed financial strategy across key categories.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm group hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Palette size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Brand & Theme Generation</h3>
              <p className="text-gray-600 leading-relaxed">The AI generates a cohesive, psychology-backed color palette tailored to the mood of your event.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm group hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><ListChecks size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pre-Event Action Plans</h3>
              <p className="text-gray-600 leading-relaxed">Transform ideas into execution. The engine writes a customized, week-by-week action plan for your committee.</p>
            </div>
          </div>
        </>
      ) : (
        /* 3. NEW UPGRADED DYNAMIC AI DRAFT CONTENT */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4">
          
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Sparkles className="text-indigo-600" /> Executive Summary: {draft.title}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">Generated strategy for {draft.headcount} expected attendees.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* --- LEFT MAIN CONTENT (8 columns) --- */}
            <div className="xl:col-span-8 space-y-8">
              
              {/* Row 1: Venue & Theme Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><MapPin size={22} /></div>
                    <h3 className="text-lg font-bold text-gray-900">Top Venue Match</h3>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/50 flex-1 flex flex-col justify-center">
                    <h4 className="text-2xl font-extrabold text-blue-950 mb-2">{draft.venue}</h4>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      <p className="text-sm font-semibold text-blue-700">Capacity optimized for {draft.headcount} people</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><Palette size={22} /></div>
                    <h3 className="text-lg font-bold text-gray-900">Brand Intelligence</h3>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-bold text-gray-800 mb-5">{draft.theme.name}</p>
                    <div className="flex gap-5">
                      {[draft.theme.primary, draft.theme.secondary, draft.theme.accent].map((color, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div 
                            className="w-12 h-12 rounded-full shadow-md border-4 border-white ring-1 ring-gray-100 group-hover:scale-110 transition-transform duration-300" 
                            style={{backgroundColor: color}}
                          ></div>
                          <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-indigo-600 transition-colors uppercase">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* UPGRADED: Budget Allocation (Sleek 1-column list to fix clinging text) */}
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><PieChart size={22} /></div>
                  <h3 className="text-lg font-bold text-gray-900">Financial Distribution</h3>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="h-64 w-64 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReChart>
                        <Pie data={draft.budgetAllocation} innerRadius={75} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                          {draft.budgetAllocation.map((_:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip formatter={(value: any) => `LKR ${value.toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      </ReChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total</span>
                      <span className="text-xl font-black text-gray-900">100%</span>
                    </div>
                  </div>
                  
                  {/* SLEEK 1-COLUMN LIST WITH WHITESPACE-NOWRAP */}
                  <div className="flex-1 w-full flex flex-col gap-3">
                    {draft.budgetAllocation.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50/80 border border-gray-100/50 rounded-2xl hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="font-bold text-gray-700 text-sm">{item.name}</span>
                        </div>
                        <span className="font-black text-gray-900 whitespace-nowrap">LKR {item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* UPGRADED: The Interactive Roadmap with dashed connecting line */}
              <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><ListChecks size={24} /></div>
                  <h3 className="text-2xl font-bold text-gray-900">Execution Roadmap</h3>
                </div>
                
                <div className="relative ml-4 md:ml-6 space-y-10 pb-4">
                  {/* Connecting Dashed Line */}
                  <div className="absolute top-2 bottom-2 left-0 w-0.5 border-l-2 border-dashed border-indigo-200"></div>

                  {draft.plan.map((step: string, i: number) => {
                    if (i === 0 && !step.includes(':') && !step.match(/^\d/)) return null;

                    const splitIndex = step.indexOf(':');
                    const hasTitle = splitIndex !== -1 && splitIndex < 100; 
                    let title = hasTitle ? step.substring(0, splitIndex).trim() : `Phase ${i + 1}`;
                    let desc = hasTitle ? step.substring(splitIndex + 1).trim() : step;
                    title = title.replace(/^\d+\.\s*/, '');

                    return (
                      <div key={i} className="relative pl-10 md:pl-14 group">
                        {/* Glowing Node perfectly aligned over the dashed line */}
                        <div className="absolute -left-[9px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.0)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-shadow duration-300 z-10"></div>
                        
                        <div className="bg-white hover:bg-indigo-50/40 transition-colors duration-300 border border-gray-100 hover:border-indigo-100 rounded-2xl p-6 shadow-sm">
                          <h4 className="text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                            {title}
                          </h4>
                          <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* --- RIGHT SIDEBAR - STICKY (4 columns) --- */}
            <div className="xl:col-span-4 relative">
              <div className="sticky top-8 space-y-6">
                
                {/* WIDGET 1: Financial Summary */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Financials</h3>
                    <TrendingUp size={18} className="text-green-500" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Calculated AI Budget</p>
                  <p className="text-4xl font-black text-gray-900 mb-4">LKR {draft.totalBudget.toLocaleString()}</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 p-3 rounded-xl border border-green-100">
                    <Check size={14} /> Safe allocation based on headcount
                  </div>
                </div>
                
                {/* WIDGET 2: Launch Control Center (Separated from Budget!) */}
                <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-xl shadow-indigo-900/10 text-white">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Rocket className="text-indigo-400" size={20}/> Ready to Launch?</h3>
                  <p className="text-sm text-gray-400 mb-8 leading-relaxed">Confirming will save this strategy to your database and generate your collaborative event dashboard.</p>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={handleConfirmEvent}
                      disabled={isSaving}
                      className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:bg-indigo-500 transition-all duration-200 flex justify-center items-center gap-2"
                    >
                      {isSaving ? (
                        <span className="animate-pulse">Saving to Database...</span>
                      ) : (
                        <>Initialize Dashboard <ArrowRight size={18} /></>
                      )}
                    </button>
                    <button 
                      onClick={() => { localStorage.removeItem("aiDraft"); setDraft(null); }}
                      className="w-full bg-gray-800 border border-gray-700 text-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-700 hover:text-white transition flex items-center justify-center gap-2"
                    >
                      <X size={18} /> Discard Plan
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}