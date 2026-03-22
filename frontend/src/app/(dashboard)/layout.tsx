"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar"; // Adjust path if needed
import Topbar from "../components/Topbar";   // Adjust path if needed

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isSidebarOpen]);
  const pathname = usePathname(); // 🚀 ADD THIS

  // 🚀 ADD THIS NEW EFFECT: Resets scroll and closes sidebar on page change
  useEffect(() => {
    setIsSidebarOpen(false);
    document.body.style.overflow = "auto";
  }, [pathname]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}