"use client";

import { useState, useEffect, useRef } from "react";
import { fetchAPI } from "../../../utils/api";
import { io } from "socket.io-client";
import {
  MessageSquare, Mail, Users, Send, Sparkles,
  Search, Paperclip, CalendarDays, Loader2, Upload,
  Link as LinkIcon, X, FileText, History, Info, Clock, User, Lock, Image as ImageIcon, CheckCircle
} from "lucide-react";

// --- Mock Data for External History (Until we wire it up) ---
const initialSentHistory = [
  {
    id: 1,
    eventId: 'evt_1', // We will keep this static for now
    subject: "Final Schedule Update",
    target: "All Registered Attendees",
    body: "Hi everyone,\n\nPlease find the final schedule attached for the Annual Tech Summit. We look forward to seeing you there at 9 AM.",
    date: "2026-03-10"
  },
];

export default function CommunicationPage() {
  // --- Global State ---
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- Internal Chat State ---
  const [fileError, setFileError] = useState<string | null>(null);
  // --- Internal Chat State ---
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchRecipient, setSearchRecipient] = useState(""); // <-- ADD THIS LINE
  const [isSending, setIsSending] = useState(false);
  const [internalAttachment, setInternalAttachment] = useState<File | null>(null);
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- External Email State ---
  const [emailTarget, setEmailTarget] = useState("registered");
  const [customEmails, setCustomEmails] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [emailPrompt, setEmailPrompt] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [includeSignature, setIncludeSignature] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<'image' | 'video' | 'document' | null>(null);

  // 🚀 NEW: CC and Real History States
  const [ccEmails, setCcEmails] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [sentHistory, setSentHistory] = useState<any[]>([]); // Starts empty!
  const [viewingHistoryEmail, setViewingHistoryEmail] = useState<any>(null);

  // 🚀 NEW: Custom UI States
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  // Helper to trigger nice toast messages instead of alerts
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Auto-hide after 5 seconds
  };


  // ==========================================
  // 1. LIFECYCLE & WEBSOCKETS
  // ==========================================

  // Load User & "In Progress" Events
  useEffect(() => {
    // 1. Fetch Events FIRST
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    const fetchActiveEvents = async () => {
      try {
        const response = await fetchAPI('/events', { method: 'GET' });
        if (response.success && response.events) {
          const active = response.events.filter((e: any) => e.status === 'In Progress');
          setEventsList(active);
          if (active.length > 0) setSelectedEventId(active[0].id);
        }
      } catch (error) { console.error("Failed to fetch events:", error); }
    };
    fetchActiveEvents();

    // 2. Setup User & WebSockets SECOND
    const userStr = localStorage.getItem('user');
    let socket: any;

    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);

      socket = io('http://localhost:5000');
      socket.emit('register', user.id);

      socket.on('NEW_INTERNAL_MESSAGE', (msg: any) => {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;

          // 🚀 TRIGGER DESKTOP NOTIFICATION
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`New message from ${msg.sender}`, { body: msg.text });
          }

          return [...prev, msg];
        });
      });
    }

    // 3. Cleanup function at the VERY END
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // Fetch Team, Messages, AND History when Event Changes
  useEffect(() => {
    if (!selectedEventId || !currentUser) return;

    const fetchData = async () => {
      try {
        const [teamRes, msgRes, historyRes] = await Promise.all([
          fetchAPI(`/communication/${selectedEventId}/team`, { method: 'GET' }),
          fetchAPI(`/communication/${selectedEventId}/messages`, { method: 'GET' }),
          fetchAPI(`/emails/${selectedEventId}/history`, { method: 'GET' }) // 🚀 FETCH REAL HISTORY
        ]);

        if (teamRes.success) setTeamMembers(teamRes.team);
        if (msgRes.success) {
          const formattedMsgs = msgRes.messages.map((m: any) => ({
            ...m, id: m.message_id, isMe: m.sender_id === currentUser.id
          }));
          setMessages(formattedMsgs);
        }
        if (historyRes.success) {
          setSentHistory(historyRes.history); // 🚀 SAVE REAL HISTORY TO STATE
        }
      } catch (error) { console.error("Error fetching data:", error); }
    };

    fetchData();
    setSelectedRecipients([]);
  }, [selectedEventId, currentUser]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ==========================================
  // 2. HELPER VARIABLES
  // ==========================================
  const currentEvent = eventsList.find(e => e.id === selectedEventId);
  const currentEventName = currentEvent?.title || "Event";
  // For the mock history, just show all of it until we wire the backend
  const currentHistory = sentHistory;

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "??";
  };

  // --- NEW: UNIQUE COLOR GENERATOR ---
  const bubbleColors = [
    { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", avatar: "bg-blue-500" },
    { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", avatar: "bg-emerald-500" },
    { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-900", avatar: "bg-rose-500" },
    { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", avatar: "bg-amber-500" },
    { bg: "bg-fuchsia-50", border: "border-fuchsia-200", text: "text-fuchsia-900", avatar: "bg-fuchsia-500" },
    { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-900", avatar: "bg-cyan-500" },
    { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-900", avatar: "bg-orange-500" },
    { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-900", avatar: "bg-teal-500" },
  ];

  const getUserColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return bubbleColors[Math.abs(hash) % bubbleColors.length];
  };

  // ==========================================
  // 3. INTERNAL CHAT FUNCTIONS
  // ==========================================
  const handleToggleRecipient = (id: string) => {
    setSelectedRecipients(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
  };
  // 🚀 NEW: Helper to restrict file types before opening the picker
  const handleUploadClick = (type: 'image' | 'video' | 'document') => {
    setSelectedFileType(type);
    if (internalFileInputRef.current) {
      // Instantly update the HTML 'accept' attribute based on the button clicked
      if (type === 'image') internalFileInputRef.current.accept = 'image/png, image/jpeg, image/jpg, image/gif';
      else if (type === 'video') internalFileInputRef.current.accept = 'video/mp4, video/mov, video/quicktime';
      else internalFileInputRef.current.accept = '.pdf, .doc, .docx, .xls, .xlsx, .txt';

      // Open the file dialog
      internalFileInputRef.current.click();
    }
  };

  // --- NEW: SEARCH FILTER LOGIC ---
  const actualTeam = teamMembers.filter(m => m.id !== currentUser?.id); // Hides the logged-in user
  const filteredTeam = actualTeam.filter(m => m.name.toLowerCase().includes(searchRecipient.toLowerCase()));
  const handleToggleAll = () => {
    if (selectedRecipients.length === filteredTeam.length && filteredTeam.length > 0) setSelectedRecipients([]);
    else setSelectedRecipients(filteredTeam.map(m => m.id));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() && !internalAttachment) return;
    if (selectedRecipients.length === 0) { alert("Please select at least one recipient."); return; }

    setIsSending(true);

    // 🚀 NEW: Using FormData to handle files
    const formData = new FormData();
    formData.append('text', chatInput);
    formData.append('senderId', currentUser.id);
    formData.append('fileType', selectedFileType || 'document');

    // Add all recipients to the form
    selectedRecipients.forEach(id => formData.append('recipients', id));

    // Attach the file if it exists
    if (internalAttachment) {
      formData.append('file', internalAttachment);
    }

    try {
      const token = localStorage.getItem('token');
      // We use native fetch here to allow the browser to set the 'multipart/form-data' boundary
      const res = await fetch(`http://localhost:5000/api/communication/${selectedEventId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // DO NOT set Content-Type here!
        },
        body: formData
      });

      const response = await res.json();

      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        setChatInput("");
        setInternalAttachment(null);
        setSelectedFileType(null);
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  // ==========================================
  // 4. EXTERNAL EMAIL FUNCTIONS
  // ==========================================
  const handleGenerateAI = () => {
    if (!emailPrompt.trim()) {
      alert("Please provide some key details for the AI to use!");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setEmailSubject(`Update regarding the ${currentEventName}`);
      setEmailBody(`Hi everyone,\n\nI hope this email finds you well.\n\nRegarding the update: "${emailPrompt}"\n\nPlease let us know if you have any questions.`);
      setIsGenerating(false);
    }, 1500);
  };

  const handleInsertLinkClick = () => {
    setLinkInput(""); // Clear old input
    setShowLinkModal(true); // Open our nice custom modal
  };

  const confirmInsertLink = () => {
    if (linkInput.trim()) {
      setEmailBody(prev => prev + `\n${linkInput.trim()}\n`);
    }
    setShowLinkModal(false); // Close the modal
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      let hasError = false;

      // 🚀 50MB Security Check
      newFiles.forEach(file => {
        if (file.size > 50 * 1024 * 1024) {
          setFileError(`"${file.name}" is too large! Maximum allowed size is 50MB.`);
          hasError = true;
        } else {
          validFiles.push(file);
        }
      });

      if (hasError) {
        setTimeout(() => setFileError(null), 5000);
      }

      setAttachments(prev => [...prev, ...validFiles]);
      
      // Reset input so you can select the exact same file again if you accidentally delete it
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleSendMail = () => {
    if (!emailSubject || !emailBody) { alert("Please write or generate an email body first."); return; }

    let printTarget = "All Registered Attendees";
    if (emailTarget === "custom") {
      if (!customEmails.trim()) { alert("Please enter at least one custom email address."); return; }
      printTarget = customEmails;
    }
    if (emailTarget === "venue") printTarget = `Venue Manager`;
    if (emailTarget === "csv") {
      if (!csvFile) { alert("Please upload a CSV file first."); return; }
      printTarget = `CSV: ${csvFile.name}`;
    }

    const newHistoryItem = {
      id: Date.now(),
      eventId: selectedEventId,
      subject: emailSubject,
      target: printTarget,
      body: emailBody,
      date: new Date().toISOString().split('T')[0]
    };

    setSentHistory([newHistoryItem, ...sentHistory]);
    alert(`Successfully sent bulk emails for ${currentEventName}!`);

    setEmailSubject(""); setEmailBody(""); setEmailPrompt(""); setAttachments([]); setCustomEmails(""); setCsvFile(null);
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-6 h-full flex flex-col max-w-6xl mx-auto">
      {/* Header */}
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab("internal")} className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "internal" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}><MessageSquare size={18} /> Internal Team Messaging</button>
        <button onClick={() => setActiveTab("external")} className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === "external" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}><Mail size={18} /> AI Bulk Emails</button>
      </div>

      {/* TAB: Internal Messaging */}
      {activeTab === "internal" && (
        actualTeam.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[600px] bg-white border border-gray-100 rounded-xl shadow-sm p-8 text-center animate-in fade-in duration-500">
            <div className="bg-indigo-50 p-5 rounded-full mb-5 border border-indigo-100">
              <Users size={48} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">It's quiet in here...</h3>
            <p className="text-gray-500 max-w-md text-sm leading-relaxed">
              You don't have any other team members assigned to this event yet. Organize your team to start a private chat, share documents, and collaborate!
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
            {/* Sidebar */}
            <div className="w-full lg:w-1/3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Users size={18} className="text-indigo-600" /> Select Recipients</h3>
                {/* NEW: Search Bar */}
                <div className="mt-3 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search team members..." value={searchRecipient} onChange={(e) => setSearchRecipient(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder-gray-400" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-200">
                  <input type="checkbox" checked={selectedRecipients.length === filteredTeam.length && filteredTeam.length > 0} onChange={handleToggleAll} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span className="text-sm font-bold text-gray-800">Select All {searchRecipient && "(Filtered)"}</span>
                </label>
                <hr className="my-2 border-gray-100" />
                {/* Changed from teamMembers to filteredTeam */}
                {filteredTeam.map((member) => (
                  <label key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedRecipients.includes(member.id)} onChange={() => handleToggleRecipient(member.id)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="text-sm text-gray-800">{member.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">{member.role}</span>
                  </label>
                ))}
                {filteredTeam.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No team members found.</p>}
              </div>
            </div>

            {/* Chat Window */}
            <div className="w-full lg:w-2/3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50"><h3 className="font-semibold text-gray-800">{currentEventName} - Private Messages</h3><p className="text-xs text-gray-500">Messages sent here are only visible to selected team members.</p></div>
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 space-y-6">
                {messages.map((msg: any) => {
                  // Determine the unique color for non-me bubbles
                  const uColor = msg.isMe ? null : getUserColor(msg.sender);
                  return (
                    <div key={msg.id} className={`flex flex-col gap-1 max-w-[80%] ${msg.isMe ? 'ml-auto items-end' : ''}`}>
                      <div className={`flex items-center gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${msg.isMe ? 'bg-indigo-600' : uColor?.avatar}`}>
                          {getInitials(msg.sender)}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{msg.isMe ? "You" : msg.sender}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{msg.date ? `${msg.date}, ` : ''}{msg.time}</span>
                      </div>
                      {/* Apply unique colors to the bubble */}
                      <div className={`text-sm p-3 rounded-2xl shadow-sm ${msg.isMe ? 'bg-indigo-600 text-white rounded-tr-none mr-10' : `${uColor?.bg} border ${uColor?.border} ${uColor?.text} rounded-tl-none ml-10`}`}>
                        {msg.to_text && (
                          <div className={`flex items-center gap-1.5 mb-2 pb-2 text-[10px] font-bold tracking-wide border-b ${msg.isMe ? 'border-indigo-500/50 text-indigo-200' : 'border-black/10 opacity-70'}`}>
                            <Lock size={10} /> TO: {msg.to_text.toUpperCase()}
                          </div>
                        )}
                        {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                        {/* 🚀 DYNAMIC ATTACHMENT RENDERING */}
                        {msg.attachment && msg.attachment.url && (
                          <div className={`mt-3 overflow-hidden rounded-xl border ${msg.isMe ? 'bg-indigo-700/30 border-indigo-400/30' : 'bg-white/50 border-black/5'}`}>

                            {/* CASE 1: IMAGES (Show a real preview) */}
                            {msg.attachment.file_type === 'image' && (
                              <div className="group relative cursor-pointer" onClick={() => window.open(msg.attachment.url, '_blank')}>
                                <img
                                  src={msg.attachment.url}
                                  alt={msg.attachment.file_name}
                                  className="max-h-60 w-full object-cover transition group-hover:opacity-90"
                                  onError={(e) => e.currentTarget.style.display = 'none'} // Hides broken icon if the image fails to load
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20">
                                  <Search className="text-white drop-shadow-md" size={28} />
                                </div>
                              </div>
                            )}

                            {/* CASE 2: VIDEOS (Show a Play Icon) */}
                            {msg.attachment.file_type === 'video' && (
                              <button
                                onClick={() => window.open(msg.attachment.url, '_blank')}
                                className="flex items-center gap-4 p-4 w-full hover:bg-black/5 transition text-left"
                              >
                                <div className="bg-amber-500 p-3 rounded-full text-white shadow-md group-hover:scale-105 transition">
                                  <Send size={18} className="rotate-90 ml-0.5" /> {/* Send icon rotated acts as a Play button */}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-bold truncate ${msg.isMe ? 'text-indigo-50' : 'text-gray-800'}`}>
                                    {msg.attachment.file_name}
                                  </p>
                                  <p className={`text-[10px] uppercase tracking-tighter mt-0.5 ${msg.isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                                    Click to Play Video • {msg.attachment.file_size}
                                  </p>
                                </div>
                              </button>
                            )}

                            {/* CASE 3: DOCUMENTS (Standard Card) */}
                            {msg.attachment.file_type === 'document' && (
                              <button
                                onClick={() => window.open(msg.attachment.url, '_blank')}
                                className="flex items-center gap-3 p-3 w-full hover:bg-black/5 transition text-left group"
                              >
                                <div className={`p-2 rounded-lg ${msg.isMe ? 'bg-indigo-500/50 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-bold truncate ${msg.isMe ? 'text-indigo-50' : 'text-gray-800'}`}>
                                    {msg.attachment.file_name}
                                  </p>
                                  <p className={`text-[10px] uppercase tracking-tighter mt-0.5 ${msg.isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                                    {msg.attachment.file_size}
                                  </p>
                                </div>
                                <Upload size={16} className={`rotate-180 opacity-60 group-hover:opacity-100 transition ${msg.isMe ? 'text-indigo-200' : 'text-gray-400'}`} /> {/* Download arrow */}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-gray-100 bg-white">
                {/* 🚀 NEW IMPROVED PREVIEW BLOCK */}
                {internalAttachment && (
                  <div className="flex items-center gap-2 mb-3 bg-indigo-50 border border-indigo-100 p-2 rounded-lg w-fit shadow-sm animate-in zoom-in-95">
                    <FileText size={14} className="text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-900">{internalAttachment.name}</span>
                    <button
                      onClick={() => {
                        setInternalAttachment(null);
                        setSelectedFileType(null); // 🚀 Clears the file type state too
                      }}
                      className="text-indigo-400 hover:text-red-500 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <input
                    type="file"
                    ref={internalFileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];

                        // 🚀 THE SECURITY CHECK: If it's over 50MB, show the error and stop!
                        if (file.size > 50 * 1024 * 1024) {
                          setFileError(`"${file.name}" is too large! Maximum allowed size is 50MB.`);
                          e.target.value = ''; // Reset the hidden input
                          setShowUploadMenu(false); // Close the menu

                          // Auto-hide the error after 5 seconds
                          setTimeout(() => setFileError(null), 5000);
                          return;
                        }

                        // If it passes the test, attach it!
                        setInternalAttachment(file);
                        setShowUploadMenu(false);
                        setFileError(null); // Clear any old errors
                      }
                    }}
                    className="hidden"
                  />

                  <div className="relative">
                    {/* The Plus/Paperclip Button */}
                    <button
                      onClick={() => setShowUploadMenu(!showUploadMenu)}
                      className={`p-2.5 rounded-xl transition shadow-sm border ${showUploadMenu ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-gray-50 text-gray-600 hover:bg-indigo-50 border-gray-200'}`}
                    >
                      {showUploadMenu ? <X size={20} /> : <Paperclip size={20} />}
                    </button>

                    {/* Expanding Symbol Menu */}
                    {showUploadMenu && (
                      <div className="absolute bottom-16 left-0 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2 flex flex-col gap-2 animate-in slide-in-from-bottom-4 duration-200 z-50 min-w-[160px]">
                        <button onClick={() => handleUploadClick('image')} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 flex items-center gap-3 transition group">
                          <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow"><Upload size={16} /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Image</span>
                        </button>
                        <button onClick={() => handleUploadClick('video')} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 flex items-center gap-3 transition group">
                          <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow"><Send size={16} className="rotate-90" /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Video</span>
                        </button>
                        <button onClick={() => handleUploadClick('document')} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 flex items-center gap-3 transition group">
                          <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow"><FileText size={16} /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">Document</span>
                        </button>
                      </div>
                    )}
                  </div>
                  {/* FIX: Added text-gray-900 to ensure visibility */}
                  <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a private message..." className="flex-1 border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none transition" rows={2} />
                  {/* 🚀 Updated Send Button */}
                  <button onClick={handleSendMessage} disabled={isSending} className="p-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center min-w-[48px]">
                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

      {/* TAB: External AI Bulk Emails (3-Pane Layout) */}
      {activeTab === "external" && (
        <div className="flex flex-col xl:flex-row gap-6 h-[750px]">

          {/* PANE 1: LEFT SIDEBAR (Controls & AI) */}
          <div className="w-full xl:w-[300px] shrink-0 flex flex-col gap-6">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-5 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">1. Recipients</label>
                <select value={emailTarget} onChange={(e) => setEmailTarget(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none transition cursor-pointer text-gray-800 font-medium">
                  <option value="registered">All Registered Attendees</option>
                  <option value="venue">Venue Manager</option>
                  <option value="custom">Custom Email Addresses</option>
                  <option value="csv">Upload CSV List</option>
                </select>

                {emailTarget === "venue" && (
                  <div className="mt-3">
                    <input type="email" placeholder="manager@venue.com" value={customEmails} onChange={(e) => setCustomEmails(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-400" />
                    <p className="text-[10px] text-gray-500 mt-1">We will save this email for future bookings.</p>
                  </div>
                )}
                {emailTarget === "custom" && (
                  <textarea placeholder="e.g. a@b.com, c@d.com" value={customEmails} onChange={(e) => setCustomEmails(e.target.value)} className="mt-3 w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-400 resize-none" rows={3} />
                )}
                {emailTarget === "csv" && (
                  <div onClick={() => csvInputRef.current?.click()} className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-gray-500 cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition">
                    <input type="file" accept=".csv" ref={csvInputRef} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCsvFile(file);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const text = event.target?.result as string;
                          const emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi) || [];
                          setCustomEmails(emails.join(', '));
                        };
                        reader.readAsText(file);
                      }
                    }} className="hidden" />
                    <Upload size={20} className={csvFile ? "text-indigo-600" : ""} />
                    <span className={`text-xs text-center font-medium ${csvFile ? "text-indigo-600" : ""}`}>{csvFile ? `${customEmails.split(',').length} emails found` : "Click to upload CSV"}</span>
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Sparkles size={12} className="text-indigo-500" /> AI Assistant</label>
                <select className="w-full border border-gray-200 rounded-lg p-2 text-xs bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none mb-3 text-gray-700">
                  <option>Exciting & Welcoming</option><option>Formal & Professional</option><option>Urgent Reminder</option><option>Thank You</option>
                </select>
                <textarea value={emailPrompt} onChange={(e) => setEmailPrompt(e.target.value)} placeholder="What should this email be about? (e.g. 'Remind attendees about tomorrow's parking rules')" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-400 resize-none" rows={4} />
                <button
                  onClick={async () => {
                    if (!emailPrompt) return alert("Please provide an AI prompt!");
                    setIsGenerating(true);
                    try {
                      const res = await fetchAPI('/emails/generate', { method: 'POST', body: JSON.stringify({ prompt: emailPrompt, tone: "Exciting", eventName: currentEventName }) });
                      if (res.success) { setEmailSubject(res.subject); setEmailBody(res.body); }
                    } finally { setIsGenerating(false); }
                  }}
                  disabled={isGenerating}
                  className="mt-2 w-full flex justify-center items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-100 disabled:opacity-50 transition"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGenerating ? "Drafting..." : "Generate Draft"}
                </button>
              </div>
            </div>
          </div>
          {/* PANE 2: CENTER CANVAS (Composer) */}
          <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col gap-3">
              <input 
                type="text" 
                value={emailSubject} 
                onChange={(e) => setEmailSubject(e.target.value)} 
                placeholder="Subject" 
                className="w-full text-lg font-bold text-gray-900 bg-transparent outline-none placeholder-gray-300" 
              />
              
              {/* 🚀 NEW: The Attachment "Chips" Bar */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200/60 animate-in fade-in duration-300">
                  {attachments.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 shadow-sm transition-all hover:shadow hover:border-indigo-200">
                      {f.type.startsWith('image/') ? <ImageIcon size={14} className="text-indigo-500" /> : <FileText size={14} className="text-indigo-500" />}
                      <span className="max-w-[180px] truncate">{f.name}</span>
                      <button 
                        onClick={() => removeAttachment(i)} 
                        className="ml-1 text-indigo-400 hover:text-white hover:bg-red-500 rounded-full p-0.5 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 bg-white border-b border-gray-100 p-2 px-4 shadow-sm z-10">
              <button onClick={handleInsertLinkClick} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition"><LinkIcon size={14} /> Link</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition"><Paperclip size={14} /> Attach</button>
              <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />

              {/* 🚀 NEW: Add CC Toggle */}
              <button onClick={() => setShowCc(!showCc)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${showCc ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                Add CC
              </button>

              <div className="ml-auto flex items-center gap-1.5 text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded border border-gray-200 uppercase tracking-wider">
                <Lock size={10} /> BCC is Automatic
              </div>
            </div>

            {/* 🚀 NEW: CC Input Field */}
            {showCc && (
              <div className="bg-gray-50 border-b border-gray-100 p-3 px-4 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 w-6">CC:</span>
                <input type="text" value={ccEmails} onChange={(e) => setCcEmails(e.target.value)} placeholder="e.g. sponsor@company.com, dean@university.edu" className="flex-1 bg-white border border-gray-200 rounded-md p-1.5 text-sm outline-none focus:border-indigo-500" />
              </div>
            )}

            <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Write your email body here..." className="flex-1 w-full p-6 text-sm text-gray-800 outline-none resize-none leading-relaxed" />

            

            <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={includeSignature} onChange={(e) => setIncludeSignature(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" /><span className="text-sm font-medium text-gray-600">Include signature</span></label>
              <button
                onClick={async () => {
                  if (!emailSubject || !emailBody) return showToast("Subject and body are required!", "error");
                  setIsSending(true);
                  try {
                    const emails = emailTarget === 'venue' ? [customEmails] : customEmails.split(',').map(e => e.trim()).filter(e => e);
                    const ccListArray = ccEmails.split(',').map(e => e.trim()).filter(e => e);

                    // 🚀 1. Build the FormData package to carry the files
                    const formData = new FormData();
                    formData.append('target', emailTarget);
                    formData.append('subject', emailSubject);
                    formData.append('body', emailBody);
                    formData.append('includeSignature', String(includeSignature));
                    
                    // The UI uses 'customEmails' for the venue input too, so we map it appropriately
                    formData.append('venueEmail', customEmails);

                    // Append all email addresses individually
                    emails.forEach(email => formData.append('customEmails', email));
                    ccListArray.forEach(cc => formData.append('ccList', cc));

                    // 🚀 2. Attach the physical files to the payload!
                    attachments.forEach(file => {
                      formData.append('attachments', file);
                    });

                    // 🚀 3. Send using native fetch instead of fetchAPI so the browser handles the file data
                    const res = await fetch(`http://localhost:5000/api/emails/${selectedEventId}/send`, {
                      method: 'POST',
                      headers: { 
                        'Authorization': `Bearer ${localStorage.getItem('token')}` 
                      },
                      body: formData
                    });

                    const responseData = await res.json();

                    if (responseData.success) {
                      showToast("Mail sent successfully!", "success");
                      setEmailSubject(""); setEmailBody(""); setCustomEmails(""); setCsvFile(null); setCcEmails(""); setShowCc(false); 
                      setAttachments([]); // Clear the attachment chips!
                      
                      // Refresh History!
                      const historyRes = await fetchAPI(`/emails/${selectedEventId}/history`, { method: 'GET' });
                      if (historyRes.success) setSentHistory(historyRes.history);
                    } else {
                      showToast("Error sending email: " + responseData.message, "error");
                    }
                  } catch (error) {
                    console.error("Failed to send email", error);
                    showToast("A critical error occurred while sending the email.", "error");
                  } finally { setIsSending(false); }
                }}
                disabled={isSending}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-md disabled:opacity-70 disabled:hover:scale-100 active:scale-95"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSending ? "Sending..." : "Send Bulk Mail"}
              </button>
            </div>
          </div>

          {/* PANE 3: RIGHT SIDEBAR (History) */}
          <div className="w-full xl:w-[280px] shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><History size={16} className="text-indigo-600" /> Sent Mail</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30">
              {currentHistory.length === 0 ? (
                <div className="text-center py-10"><Mail className="mx-auto text-gray-300 mb-3" size={32} /><p className="text-xs text-gray-400 font-medium">No history found</p></div>
              ) : (
                currentHistory.map(h => (
                  <div key={h.id} className="p-3 bg-white border border-gray-100 rounded-lg hover:border-indigo-200 transition group flex flex-col gap-2 shadow-sm">
                    <p className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-indigo-700 transition">{h.subject}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold truncate max-w-[120px]">{h.target}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{h.date}</span>
                    </div>
                    <button onClick={() => setViewingHistoryEmail(h)} className="mt-1 w-full py-1.5 bg-gray-50 text-gray-600 text-xs font-bold rounded hover:bg-indigo-50 hover:text-indigo-700 transition">View Details</button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW HISTORY MODAL */}
      {viewingHistoryEmail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <div><h2 className="text-xl font-bold text-gray-900">Email Details</h2><p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={12} /> Sent on {viewingHistoryEmail.date}</p></div>
              <button onClick={() => setViewingHistoryEmail(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 bg-gray-50/30 font-sans">

              {/* 🚀 NEW: Detailed Routing Breakdown (TO, CC, BCC) */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-start gap-3 border-b border-gray-50 pb-3">
                  <span className="text-xs font-bold text-gray-400 w-10 mt-0.5">FROM:</span>
                  <span className="text-sm font-semibold text-gray-800">EventLK Organizer (You)</span>
                </div>
                <div className="flex items-start gap-3 border-b border-gray-50 pb-3">
                  <span className="text-xs font-bold text-gray-400 w-10 mt-0.5">TO:</span>
                  <span className="text-sm text-gray-600 italic">Undisclosed Recipients (Hidden for privacy)</span>
                </div>

                {/* Parse the JSON recipient summary from the database */}
                <div className="flex items-start gap-3 border-b border-gray-50 pb-3">
                  <span className="text-xs font-bold text-indigo-400 w-10 mt-0.5">BCC:</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-indigo-700">
                      {JSON.parse(viewingHistoryEmail.recipient_summary || '{}').type || "Custom Target"}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {JSON.parse(viewingHistoryEmail.recipient_summary || '{}').count
                        ? `${JSON.parse(viewingHistoryEmail.recipient_summary || '{}').count} individual emails securely blind-copied.`
                        : JSON.parse(viewingHistoryEmail.recipient_summary || '{}').email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subject</p>
                <h3 className="text-lg font-bold text-gray-800 leading-tight">{viewingHistoryEmail.subject}</h3>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Email Body</p>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-50">{viewingHistoryEmail.body}</div>
              </div>

              {/* 🚀 NEW: Render Attached Files as Clickable Buttons */}
              {JSON.parse(viewingHistoryEmail.recipient_summary || '{}').attachments?.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Paperclip size={14} /> Attachments Sent
                  </p>
                  <div className="flex flex-col gap-2">
                    {JSON.parse(viewingHistoryEmail.recipient_summary || '{}').attachments.map((att: any, idx: number) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition group w-fit pr-6"
                      >
                        <div className="bg-white p-1.5 rounded-md text-indigo-600 shadow-sm group-hover:shadow transition">
                          <FileText size={16} />
                        </div>
                        <span className="text-sm font-bold text-indigo-900 underline-offset-2 group-hover:underline">
                          {att.name}
                        </span>
                        <LinkIcon size={12} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      {/* 🚀 NEW: File Size Error Toast */}
      {fileError && (
        <div className="fixed bottom-10 right-10 z-[100] bg-white border border-red-100 shadow-2xl rounded-xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-red-50 p-2.5 rounded-full text-red-500 border border-red-100 shadow-sm">
            <Info size={20} />
          </div>
          <div className="pr-4">
            <h4 className="text-sm font-bold text-gray-900">File Too Large</h4>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{fileError}</p>
          </div>
          <button 
            onClick={() => setFileError(null)} 
            className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>
        

      )}
      {/* 🚀 NEW UI: Link Insertion Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><LinkIcon size={18} className="text-indigo-600" /> Insert Link</h3>
              <button onClick={() => setShowLinkModal(false)} className="text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
            </div>
            <div className="p-5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">URL Address</label>
              <input 
                type="url" 
                autoFocus
                placeholder="https://example.com" 
                value={linkInput} 
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmInsertLink()}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-gray-900" 
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancel</button>
              <button onClick={confirmInsertLink} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm">Insert</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 NEW UI: Beautiful Toast Notifications (Replaces Alerts) */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[100] bg-white border shadow-2xl rounded-xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success' ? 'border-green-100' : 'border-red-100'}`}>
          <div className={`p-2.5 rounded-full border shadow-sm ${toast.type === 'success' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
          </div>
          <div className="pr-4">
            <h4 className="text-sm font-bold text-gray-900">{toast.type === 'success' ? 'Success' : 'Error'}</h4>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className={`p-1.5 rounded-lg transition ${toast.type === 'success' ? 'text-green-400 hover:bg-green-50 hover:text-green-600' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>

  );
}