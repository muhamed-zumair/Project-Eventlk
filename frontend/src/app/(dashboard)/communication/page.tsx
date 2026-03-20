"use client";

import { useState, useEffect, useRef } from "react";
import { fetchAPI } from "../../../utils/api";
import { io } from "socket.io-client";
import { 
  MessageSquare, Mail, Users, Send, Sparkles, 
  Search, Paperclip, CalendarDays, Loader2, Upload,
  Link as LinkIcon, X, FileText, History, Info, Clock, User, Lock
} from "lucide-react";

export default function CommunicationPage() {
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- Internal Chat State ---
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [internalAttachment, setInternalAttachment] = useState<File | null>(null);
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load User & "In Progress" Events
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      // 🚀 Register to WebSockets so the server knows where to send our private messages!
      const socket = io('http://localhost:5000');
      socket.emit('register', user.id);

      // Listen for incoming private messages
      socket.on('NEW_INTERNAL_MESSAGE', (msg) => {
        setMessages(prev => {
          // Prevent duplicates if we already added it locally
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      return () => { socket.disconnect(); };
    }

    const fetchActiveEvents = async () => {
      try {
        const response = await fetchAPI('/events', { method: 'GET' });
        if (response.success && response.events) {
          // Only show 'In Progress' events
          const active = response.events.filter((e: any) => e.status === 'In Progress');
          setEventsList(active);
          if (active.length > 0) setSelectedEventId(active[0].id);
        }
      } catch (error) { console.error("Failed to fetch events:", error); }
    };
    fetchActiveEvents();
  }, []);

  // Fetch Team & Messages when Event Changes
  useEffect(() => {
    if (!selectedEventId || !currentUser) return;

    const fetchData = async () => {
      try {
        const [teamRes, msgRes] = await Promise.all([
          fetchAPI(`/communication/${selectedEventId}/team`, { method: 'GET' }),
          fetchAPI(`/communication/${selectedEventId}/messages`, { method: 'GET' })
        ]);
        
        if (teamRes.success) setTeamMembers(teamRes.team);
        if (msgRes.success) {
          const formattedMsgs = msgRes.messages.map((m: any) => ({
            ...m,
            id: m.message_id,
            isMe: m.sender_id === currentUser.id
          }));
          setMessages(formattedMsgs);
        }
      } catch (error) { console.error("Error fetching chat data:", error); }
    };

    fetchData();
    setSelectedRecipients([]); // Reset checkboxes
  }, [selectedEventId, currentUser]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "??";
  };

  const handleToggleRecipient = (id: string) => {
    setSelectedRecipients(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
  };

  const handleToggleAll = () => {
    if (selectedRecipients.length === teamMembers.length) setSelectedRecipients([]);
    else setSelectedRecipients(teamMembers.map(m => m.id));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() && !internalAttachment) return;
    if (selectedRecipients.length === 0) { alert("Please select at least one recipient."); return; }

    const payload = {
      text: chatInput,
      recipients: selectedRecipients,
      attachmentName: internalAttachment ? internalAttachment.name : null
    };

    try {
      const response = await fetchAPI(`/communication/${selectedEventId}/messages`, {
        method: 'POST', body: JSON.stringify(payload)
      });

      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        setChatInput("");
        setInternalAttachment(null);
      }
    } catch (error) { console.error("Failed to send message", error); }
  };

  const currentEventName = eventsList.find(e => e.id === selectedEventId)?.title || "Event";

  // ... (Keep all your existing External Email State variables here, we will wire them in Phase 2) ...
  // To save space, I've omitted the unchanged External Email logic block for now.

  return (
    <div className="space-y-6 h-full flex flex-col max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Communications Center</h2>
          <p className="text-gray-500 text-sm mt-1">Manage team messaging and external attendee emails</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-1.5 rounded-lg flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-md text-indigo-600 shadow-sm"><CalendarDays size={18} /></div>
          <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="bg-transparent text-sm font-bold text-indigo-900 outline-none pr-4 cursor-pointer max-w-[200px] truncate">
            {eventsList.map(evt => <option key={evt.id} value={evt.id}>{evt.title}</option>)}
          </select>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab("internal")} className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "internal" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}><MessageSquare size={18} /> Internal Team Messaging</button>
        <button onClick={() => setActiveTab("external")} className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "external" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}><Mail size={18} /> AI Bulk Emails</button>
      </div>

      {activeTab === "internal" && (
        <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
          {/* Sidebar */}
          <div className="w-full lg:w-1/3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50"><h3 className="font-semibold text-gray-800 flex items-center gap-2"><Users size={18} className="text-indigo-600" /> Select Recipients</h3></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-200">
                <input type="checkbox" checked={selectedRecipients.length === teamMembers.length && teamMembers.length > 0} onChange={handleToggleAll} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span className="text-sm font-bold text-gray-800">Select All Event Staff</span>
              </label>
              <hr className="my-2 border-gray-100" />
              {teamMembers.map((member) => (
                <label key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={selectedRecipients.includes(member.id)} onChange={() => handleToggleRecipient(member.id)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                    <span className="text-sm text-gray-800">{member.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">{member.role}</span>
                </label>
              ))}
              {teamMembers.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No other team members assigned to this event.</p>}
            </div>
          </div>

          {/* Chat Window */}
          <div className="w-full lg:w-2/3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50"><h3 className="font-semibold text-gray-800">{currentEventName} - Private Messages</h3><p className="text-xs text-gray-500">Messages sent here are only visible to selected team members.</p></div>
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 space-y-6">
              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex flex-col gap-1 max-w-[80%] ${msg.isMe ? 'ml-auto items-end' : ''}`}>
                  <div className={`flex items-center gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${msg.isMe ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                      {getInitials(msg.sender)}
                    </div>
                    <span className="text-sm font-bold text-gray-800">{msg.isMe ? "You" : msg.sender}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{msg.date ? `${msg.date}, ` : ''}{msg.time}</span>
                  </div>
                  <div className={`text-sm p-3 rounded-2xl shadow-sm ${msg.isMe ? 'bg-indigo-600 text-white rounded-tr-none mr-10' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none ml-10'}`}>
                    {msg.to_text && (
                      <div className={`flex items-center gap-1.5 mb-2 pb-2 text-[10px] font-bold tracking-wide border-b ${msg.isMe ? 'border-indigo-500/50 text-indigo-200' : 'border-gray-100 text-indigo-600'}`}>
                        <Lock size={10} /> TO: {msg.to_text.toUpperCase()}
                      </div>
                    )}
                    {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                    {msg.attachmentName && (
                      <div className={`flex items-center gap-2 mt-2 p-2.5 rounded-lg text-xs font-medium border ${msg.isMe ? 'bg-indigo-700/50 border-indigo-500/30' : 'bg-gray-50 border-gray-200'}`}>
                        <FileText size={16} /> {msg.attachmentName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-100 bg-white">
              {internalAttachment && <div className="flex items-center gap-2 mb-3 bg-gray-50 border border-gray-200 p-2 rounded-lg w-fit"><FileText size={14} className="text-indigo-600"/> <span className="text-xs font-medium text-gray-700">{internalAttachment.name}</span><button onClick={() => setInternalAttachment(null)} className="text-gray-400 hover:text-red-500"><X size={14} /></button></div>}
              <div className="flex items-end gap-3">
                <input type="file" ref={internalFileInputRef} onChange={(e) => e.target.files && setInternalAttachment(e.target.files[0])} className="hidden" />
                <button onClick={() => internalFileInputRef.current?.click()} className="p-2.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition"><Paperclip size={20} /></button>
                <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a private message..." className="flex-1 border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none transition" rows={2} />
                <button onClick={handleSendMessage} className="p-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition transform hover:scale-105 active:scale-95"><Send size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ... External Email Tab (Unchanged) ... */}
    </div>
  );
}