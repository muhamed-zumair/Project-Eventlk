"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchAPI } from "../utils/api";

// 1. Define what the Brain knows
interface EventContextType {
  selectedEventId: string | null;
  setSelectedEventId: (id: string) => void;
  myRole: string | null;
  isLoadingContext: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(true);

  // 2. When the app loads, figure out what event they are looking at and their role
  useEffect(() => {
    const fetchRole = async () => {
      setIsLoadingContext(true);
      try {
        // Fetch all active events
        const response = await fetchAPI('/events', { method: 'GET' });
        
        if (response.success && response.events.length > 0) {
          // If no event is selected, default to their first active event
          const activeEventId = selectedEventId || response.events[0].id;
          setSelectedEventId(activeEventId);

          // Find this specific event in the list to grab the user's role
          const currentEvent = response.events.find((e: any) => e.id === activeEventId);
          if (currentEvent) {
            setMyRole(currentEvent.role); // e.g., 'President', 'Volunteer', 'Team_Lead'
          }
        } else {
          setMyRole(null);
        }
      } catch (error) {
        console.error("Failed to load Event Context", error);
      } finally {
        setIsLoadingContext(false);
      }
    };

    fetchRole();
  }, [selectedEventId]); // Re-run this if they switch events!

  return (
    <EventContext.Provider value={{ selectedEventId, setSelectedEventId, myRole, isLoadingContext }}>
      {children}
    </EventContext.Provider>
  );
};

// 3. A custom hook so your pages can easily talk to the Brain
export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEventContext must be used within an EventProvider");
  return context;
};