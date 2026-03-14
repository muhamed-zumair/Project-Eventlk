"use client";

import { 
  Sparkles, MapPin, PieChart, Palette, 
  ListChecks, BrainCircuit, Zap 
} from "lucide-react";

export default function AIRecommendationsPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto h-full flex flex-col pt-4">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-10 md:p-14 text-white shadow-xl relative overflow-hidden">
        {/* Abstract background decorations */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 -mb-10 w-48 h-48 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>

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
            Our proprietary AI model analyzes thousands of data points to instantly generate comprehensive event strategies. Generate an event from the top menu to see the engine in action.
          </p>
        </div>
      </div>

      {/* Title for features */}
      <div className="pt-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">How the Engine Works</h2>
          <p className="text-gray-500 mt-1">Four pillars of automated event planning</p>
        </div>
      </div>

      {/* Core Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        
        {/* Capability 1: Venue */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MapPin size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Venue Matching</h3>
          <p className="text-gray-600 leading-relaxed">
            The AI cross-references your expected headcount, event category, and total budget to recommend the perfect real-world venue. It calculates exact capacity limits and cost-per-head viability to ensure you never overbook or overspend.
          </p>
        </div>

        {/* Capability 2: Budget */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <PieChart size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Financial Allocation</h3>
          <p className="text-gray-600 leading-relaxed">
            Stop guessing your budget. The model instantly structures a highly detailed financial strategy, dividing your total funds across key categories (Venue, AV, Food, Speakers, Marketing) based on historical data for your specific event type.
          </p>
        </div>

        {/* Capability 3: Branding */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Palette size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Brand & Theme Generation</h3>
          <p className="text-gray-600 leading-relaxed">
            The AI generates a cohesive, psychology-backed color palette tailored to the mood of your event. From "Synergy Spectrum" for professional workshops to vibrant neon for hackathons, you get exact HEX codes for your marketing team.
          </p>
        </div>

        {/* Capability 4: Planning */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ListChecks size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Pre-Event Action Plans</h3>
          <p className="text-gray-600 leading-relaxed">
            Transform ideas into execution. The engine writes a customized, week-by-week action plan. It details exactly when to book logistics, when to open registrations, and how to manage the committee right up until the day of the event.
          </p>
        </div>

      </div>

    </div>
  );
}