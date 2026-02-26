"use client";

import { Sparkles, MapPin, DollarSign, Users, Clock, ArrowRight } from "lucide-react";

// --- Types ---
interface Recommendation {
  id: string;
  title: string;
  insight: string;
  description: string;
  impact: 'High Impact' | 'Medium Impact' | 'Low Impact';
  icon: any;
  iconColor: string; // Background color for the icon box
}

// --- Mock Data ---
const recommendations: Recommendation[] = [
  {
    id: "1",
    title: "Optimal Venue Selection",
    insight: 'Venue "Main Hall" aligns best with your current headcount of 200 attendees.',
    description: "Based on your expected attendance and event type, Main Hall offers the best capacity-to-cost ratio with excellent acoustics for presentations.",
    impact: "High Impact",
    icon: MapPin,
    iconColor: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "2",
    title: "Cost Optimization",
    insight: "You can save ~$2,400 by booking catering services before Friday.",
    description: "Early booking discounts are available from your preferred caterer. Act within 3 days to secure 12% savings.",
    impact: "High Impact",
    icon: DollarSign,
    iconColor: "bg-green-100 text-green-600",
  },
  {
    id: "3",
    title: "Attendance Boost",
    insight: "Send reminder emails 48 hours before the event to boost attendance by 15%.",
    description: "Historical data shows that two-day reminder emails increase actual attendance rates significantly for university events.",
    impact: "Medium Impact",
    icon: Users,
    iconColor: "bg-blue-100 text-blue-600",
  },
  {
    id: "4",
    title: "Optimal Scheduling",
    insight: "Schedule your next event on a Thursday afternoon for maximum engagement.",
    description: "Thursday 2-5 PM slots show 23% higher attendance compared to other weekday time slots for similar events.",
    impact: "Medium Impact",
    icon: Clock,
    iconColor: "bg-purple-100 text-purple-600",
  },
];

// --- Components ---
const ImpactBadge = ({ impact }: { impact: string }) => {
  const styles = {
    "High Impact": "bg-red-100 text-red-600",
    "Medium Impact": "bg-orange-100 text-orange-600",
    "Low Impact": "bg-gray-100 text-gray-600",
  }[impact] || "bg-gray-100";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles}`}>
      {impact}
    </span>
  );
};

export default function AIRecommendationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 mb-1">
          <Sparkles size={20} />
          <h2 className="text-lg font-bold">AI Recommendations</h2>
        </div>
        <p className="text-gray-500 text-sm">Intelligent insights powered by machine learning</p>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${rec.iconColor}`}>
                <rec.icon size={24} />
              </div>
              <ImpactBadge impact={rec.impact} />
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1 tracking-wide">
                {rec.title}
              </p>
              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                {rec.insight}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {rec.description}
              </p>
            </div>

            {/* Action Button */}
            <button className="flex items-center gap-2 text-indigo-600 text-sm font-bold hover:text-indigo-800 transition group">
              Apply Recommendation
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}