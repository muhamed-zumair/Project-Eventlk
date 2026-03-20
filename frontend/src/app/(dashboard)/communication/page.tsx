"use client";

import { useState, useEffect, useRef } from "react";
import { fetchAPI } from "../../../utils/api";
import { io } from "socket.io-client";
import { 
  MessageSquare, Mail, Users, Send, Sparkles, 
  Search, Paperclip, CalendarDays, Loader2, Upload,
  Link as LinkIcon, X, FileText, History, Info, Clock, User, Lock
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
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchRecipient, setSearchRecipient] = useState(""); // <-- ADD THIS LINE
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

  // --- History State ---
  const [sentHistory, setSentHistory] = useState(initialSentHistory);
  const [viewingHistoryEmail, setViewingHistoryEmail] = useState<any>(null); 

  // ==========================================
  // 1. LIFECYCLE & WEBSOCKETS
  // ==========================================
  
  // Load User & "In Progress" Events
  useEffect(() => {
    // 1. Fetch Events FIRST
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
          return [...prev, msg];
        });
      });
    }

    // 3. Cleanup function at the VERY END
    return () => { 
      if (socket) socket.disconnect(); 
    };
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
            ...m, id: m.message_id, isMe: m.sender_id === currentUser.id
          }));
          setMessages(formattedMsgs);
        }
      } catch (error) { console.error("Error fetching chat data:", error); }
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

  const handleInsertLink = () => {
    const url = prompt("Enter the URL (e.g., https://example.com):");
    if (url) setEmailBody(prev => prev + `\n\nLink: ${url}\n`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
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
                      {msg.attachmentName && (
                        <div className={`flex items-center gap-2 mt-2 p-2.5 rounded-lg text-xs font-medium border ${msg.isMe ? 'bg-indigo-700/50 border-indigo-500/30' : 'bg-white/50 border-black/10'}`}>
                          <FileText size={16} /> {msg.attachmentName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-100 bg-white">
              {internalAttachment && <div className="flex items-center gap-2 mb-3 bg-gray-50 border border-gray-200 p-2 rounded-lg w-fit"><FileText size={14} className="text-indigo-600"/> <span className="text-xs font-medium text-gray-700">{internalAttachment.name}</span><button onClick={() => setInternalAttachment(null)} className="text-gray-400 hover:text-red-500"><X size={14} /></button></div>}
              <div className="flex items-end gap-3">
                <input type="file" ref={internalFileInputRef} onChange={(e) => e.target.files && setInternalAttachment(e.target.files[0])} className="hidden" />
                <button onClick={() => internalFileInputRef.current?.click()} className="p-2.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition"><Paperclip size={20} /></button>
                {/* FIX: Added text-gray-900 to ensure visibility */}
                <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a private message..." className="flex-1 border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none transition" rows={2} />
                <button onClick={handleSendMessage} className="p-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition transform hover:scale-105 active:scale-95"><Send size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* TAB: External AI Bulk Emails */}
      {activeTab === "external" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Sparkles size={24} /></div>
                <div><h3 className="text-lg font-bold text-gray-800">Email Updates & Announcements</h3><p className="text-sm text-gray-500">Draft AI emails or write manual updates to attendees.</p></div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">1. Recipients</label>
                    <select value={emailTarget} onChange={(e) => setEmailTarget(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white focus:border-indigo-500 outline-none">
                      <option value="registered">All Registered Attendees</option>
                      <option value="venue">Venue Manager</option>
                      <option value="custom">Custom Email Addresses</option>
                      <option value="csv">Upload CSV List</option>
                    </select>
                    {emailTarget === "custom" && (
                      <div className="mt-3">
                        <input type="text" placeholder="e.g. a@b.com, c@d.com" value={customEmails} onChange={(e) => setCustomEmails(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none" />
                        <p className="text-[10px] text-gray-400 mt-1 italic">Type one or more emails separated by commas.</p>
                      </div>
                    )}
                    {emailTarget === "venue" && (
                      <div className="mt-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                        <p className="text-xs text-indigo-700 font-medium flex items-center gap-2">
                          <Info size={14} /> Will send to the venue manager on file.
                        </p>
                      </div>
                    )}
                    {emailTarget === "csv" && <div onClick={() => csvInputRef.current?.click()} className="mt-3 border-2 border-dashed border-gray-300 rounded-xl p-3 flex items-center justify-center gap-2 text-gray-500 text-sm cursor-pointer hover:bg-gray-50"><input type="file" accept=".csv" ref={csvInputRef} onChange={handleCsvChange} className="hidden" /> {csvFile ? <span className="text-indigo-600 font-medium">{csvFile.name}</span> : <span><Upload size={16} /> Upload CSV</span>}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">2. Tone (For AI)</label>
                    <select className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-white focus:border-indigo-500 outline-none">
                      <option>Exciting & Welcoming</option><option>Formal & Professional</option><option>Urgent Reminder</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">3. AI Prompt (Optional)</label>
                  <textarea value={emailPrompt} onChange={(e) => setEmailPrompt(e.target.value)} placeholder="Provide key details for AI to generate a draft..." className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none" rows={2} />
                  <button onClick={handleGenerateAI} disabled={isGenerating} className="mt-2 flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-100 disabled:opacity-70 transition">{isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {isGenerating ? "AI Generating..." : "Generate AI Draft"}</button>
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">4. Review & Manual Edit</label>
                  <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Subject Line" className="w-full border border-gray-300 rounded-t-xl border-b-0 p-3 text-sm font-medium outline-none focus:bg-gray-50" />
                  <div className="flex gap-2 bg-gray-50 border-x border-gray-300 p-2 border-b">
                    <button onClick={handleInsertLink} className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-100"><LinkIcon size={12} /> Add Link</button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-100"><Paperclip size={12} /> Attach</button>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  </div>
                  <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Write your email body here..." className="w-full border border-gray-300 rounded-b-xl p-4 text-sm outline-none focus:bg-gray-50 min-h-[200px]" rows={8} />
                </div>
                {attachments.length > 0 && <div className="space-y-2">{attachments.map((f, i) => <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-xs border border-gray-100"><span>{f.name}</span><button onClick={() => removeAttachment(i)}><X size={14} /></button></div>)}</div>}
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={includeSignature} onChange={(e) => setIncludeSignature(e.target.checked)} className="rounded text-indigo-600 w-4 h-4" /><span className="text-sm font-medium text-gray-700">Add committee signature</span></label>
                  <button onClick={handleSendMail} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition shadow-sm"><Send size={16} /> Send Bulk Mail</button>
                </div>
              </div>
            </div>
          </div>

          {/* History Panel */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col max-h-[750px] overflow-hidden">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><History size={18} className="text-indigo-600" /> Sent Mail History</h3>
            <div className="space-y-3 overflow-y-auto pr-1">
              {currentHistory.length === 0 ? (
                <div className="text-center py-10"><Mail className="mx-auto text-gray-200 mb-2" size={32} /><p className="text-xs text-gray-400">No emails sent for this event yet.</p></div>
              ) : (
                currentHistory.map(h => (
                  <div key={h.id} onClick={() => setViewingHistoryEmail(h)} className="p-3 border border-gray-100 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition cursor-pointer group">
                    <p className="text-sm font-bold text-gray-800 truncate group-hover:text-indigo-700 transition font-sans">{h.subject}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium truncate max-w-[120px]">{h.target}</span>
                      <span className="text-[10px] text-gray-400">{h.date}</span>
                    </div>
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
            <div className="p-6 overflow-y-auto space-y-6 bg-gray-50/30 font-sans">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subject</p>
                <h3 className="text-lg font-bold text-gray-800 leading-tight">{viewingHistoryEmail.subject}</h3>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recipients</p>
                <div className="flex items-center gap-2 text-sm text-indigo-700 font-medium break-all"><Users size={16} className="shrink-0" /> {viewingHistoryEmail.target}</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Email Body</p>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-50">{viewingHistoryEmail.body}</div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-white shrink-0"><button onClick={() => setViewingHistoryEmail(null)} className="w-full bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition">Close Preview</button></div>
          </div>
        </div>
      )}
    </div>
  );
}