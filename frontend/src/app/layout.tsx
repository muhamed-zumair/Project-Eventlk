"use client";

import "./globals.css";
import { EventProvider } from "../context/EventContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <EventProvider>
          {/* 🚀 Cleaned: No Sidebar or Topbar here anymore */}
          {children}
        </EventProvider>
      </body>
    </html>
  );
}