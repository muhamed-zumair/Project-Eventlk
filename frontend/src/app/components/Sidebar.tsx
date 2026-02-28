"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Calendar, ClipboardList, DollarSign, Users, 
  Sparkles, BarChart2, Settings, ChevronLeft 
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "My Events", href: "/events", icon: Calendar },
  { name: "Task Board", href: "/tasks", icon: ClipboardList },
  { name: "Budget Tracker", href: "/budget", icon: DollarSign },
  { name: "Team", href: "/team", icon: Users },
  { name: "AI Recommendations", href: "/ai-recommendations", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600">EventLK</h1>
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}