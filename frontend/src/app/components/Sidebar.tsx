"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Calendar, ClipboardList, DollarSign, Users, 
  Sparkles, BarChart2, Settings, ChevronLeft , MessageSquare, QrCode
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "My Events", href: "/events", icon: Calendar },
  { name: "Task Board", href: "/tasks", icon: ClipboardList },
  { name: "Budget Tracker", href: "/budget", icon: DollarSign },
  { name: "Team", href: "/team", icon: Users },
  { name: "AI Recommendations", href: "/ai-recommendations", icon: Sparkles },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Communication ", href: "/communication", icon: MessageSquare },
  { name: "Registrations", href: "/registrations", icon: QrCode },
  { name: "Settings", href: "/settings", icon: Settings }
  
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0
        `}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600">EventLK</h1>
          <button
            className="text-gray-400 hover:text-gray-600 md:hidden"
            onClick={toggleSidebar}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={toggleSidebar}
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
      </aside>
    </>
  );
}