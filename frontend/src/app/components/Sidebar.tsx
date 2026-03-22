"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEventContext } from "../../context/EventContext"; // 🚀 1. Import the Brain
import { 
  Home, Calendar, ClipboardList, DollarSign, Users, 
  Sparkles, Settings, ChevronLeft, MessageSquare, QrCode, ScanLine
} from "lucide-react";

// 🚀 2. Split items into groups and assign the exact allowed roles
const managementItems = [
  { name: "Home", href: "/dashboard", icon: Home, roles: ["President", "Secretary", "Treasurer", "Team_Lead", "Volunteer"] },
  { name: "My Events", href: "/events", icon: Calendar, roles: ["President", "Secretary", "Treasurer", "Team_Lead", "Volunteer"] },
  { name: "Task Board", href: "/tasks", icon: ClipboardList, roles: ["President", "Secretary", "Treasurer", "Team_Lead", "Volunteer"] },
  { name: "Budget Tracker", href: "/budget", icon: DollarSign, roles: ["President", "Treasurer"] },
  { name: "Team", href: "/team", icon: Users, roles: ["President", "Secretary"] }
];

const utilityItems = [
  { name: "AI Recommendations", href: "/ai-recommendations", icon: Sparkles, roles: ["President"] },
  { name: "Communication", href: "/communication", icon: MessageSquare, roles: ["President", "Secretary", "Treasurer", "Team_Lead", "Volunteer"] },
  { name: "Registrations", href: "/registrations", icon: QrCode, roles: ["President", "Secretary"] },
  { name: "Live Scanner", href: "/scanner", icon: ScanLine, roles: ["President", "Secretary", "Team_Lead", "Volunteer"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["President", "Secretary", "Treasurer", "Team_Lead", "Volunteer"] }
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { myRole } = useEventContext(); // 🚀 3. Ask the Brain for the user's role

  // 🚀 4. UNLOCKED: Now showing all pages to everyone. 
  // Individual pages will handle the "Select an Event" empty states.
  const visibleManagement = managementItems;
  const visibleUtilities = utilityItems;

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 flex flex-col
          transform transition-all duration-300 ease-in-out shadow-2xl shadow-slate-900/50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0
        `}
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none"></div>

        <div className="p-8 flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-white/10">
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">LK</span>
            </h1>
          </div>
          <button
            className="text-slate-400 hover:text-white md:hidden bg-slate-800/50 hover:bg-slate-800 p-2 rounded-lg border border-slate-700 transition-colors"
            onClick={toggleSidebar}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pb-10 relative z-10">
          
          {/* MANAGEMENT GROUP */}
          <div>
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4">
              Event Management
            </p>
            <div className="space-y-1.5">
              {visibleManagement.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={toggleSidebar}
                    className={`group flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 active:scale-95 overflow-hidden relative ${
                      isActive
                        ? "text-indigo-300 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                    }`}
                  >
                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-50"></div>}
                    {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>}

                    <item.icon 
                      size={20} 
                      className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                        isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                      }`} 
                    />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          {/* UTILITIES GROUP */}
          <div>
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4">
              Smart Tools
            </p>
            <div className="space-y-1.5">
              {visibleUtilities.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={toggleSidebar}
                    className={`group flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 active:scale-95 overflow-hidden relative ${
                      isActive
                        ? "text-indigo-300 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                    }`}
                  >
                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-50"></div>}
                    {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>}

                    <item.icon 
                      size={20} 
                      className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                        isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                      }`} 
                    />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}