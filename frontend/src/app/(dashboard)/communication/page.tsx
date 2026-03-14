"use client";

import { useState, useRef } from "react";
import { 
  MessageSquare, Mail, Users, Send, Sparkles, 
  Search, Paperclip, CalendarDays, Loader2, Upload,
  Link as LinkIcon, X, FileText
} from "lucide-react";

// --- Mock Data ---
const myEvents = [
  { id: 'evt_1', name: "Annual Tech Summit 2026" },
  { id: 'evt_2', name: "Spring Conference" },
];

const initialTeamMembers = [
  { id: 1, eventId: 'evt_1', name: "Sarah Mitchell", role: "Chairperson" },
  { id: 2, eventId: 'evt_1', name: "David Kim", role: "Treasurer" },
  { id: 3, eventId: 'evt_1', name: "Emily Chen", role: "Secretary" },
  { id: 4, eventId: 'evt_2', name: "Sarah Mitchell", role: "Volunteer" },
  { id: 5, eventId: 'evt_2', name: "Michael Brown", role: "Team Lead" },
];

const initialMessages = [
  { id: 1, eventId: 'evt_1', sender: "Sarah Mitchell", initials: "SM", text: "Hey team! Just a reminder that we need to finalize the catering budget by tomorrow.", time: "10:42 AM", isMe: true },
  { id: 2, eventId: 'evt_1', sender: "David Kim", initials: "DK", text: "I'll have the final numbers ready by 3 PM today.", time: "10:45 AM", isMe: false },
  { id: 3, eventId: 'evt_2', sender: "Michael Brown", initials: "MB", text: "Has anyone contacted the Spring guest speakers yet?", time: "09:00 AM", isMe: false },
];

export default function CommunicationPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>(myEvents[0].id);
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");

  // --- Internal Chat State ---
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);

  // --- External Email State ---
  const [emailTarget, setEmailTarget] = useState("registered");
  const [customEmail, setCustomEmail] = useState("");
  
  // NEW: CSV Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [emailPrompt, setEmailPrompt] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Attachments and Signatures
  const [attachments, setAttachments] = useState<File[]>([]);
  const [includeSignature, setIncludeSignature] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Dynamic Filtering ---
  const currentTeam = initialTeamMembers.filter(m => m.eventId === selectedEventId);
  const currentMessages = messages.filter(m => m.eventId === selectedEventId);
  const currentEventName = myEvents.find(e => e.id === selectedEventId)?.name;

  // --- Handlers: Internal Chat ---
  const handleToggleRecipient = (id: number) => {
    setSelectedRecipients(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedRecipients.length === currentTeam.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(currentTeam.map(m => m.id));
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage = {
      id: Date.now(),
      eventId: selectedEventId,
      sender: "Sarah Mitchell (You)",
      initials: "SM",
      text: chatInput,
      time: "Just now",
      isMe: true
    };
    setMessages([...messages, newMessage]);
    setChatInput("");
  };

  // --- Handlers: External Emails ---
  const handleGenerateAI = () => {
    if (!emailPrompt.trim()) {
      alert("Please provide some key details for the AI to use!");
      return;
    }
    
    setIsGenerating(true);
    
    setTimeout(() => {
      setEmailSubject(`Update regarding the ${currentEventName}`);
      setEmailBody(`Hi [Name],\n\nI hope this email finds you well.\n\nRegarding your note: "${emailPrompt}" - we have updated the schedule accordingly.\n\nPlease let us know if you have any questions.`);
      setIsGenerating(false);
    }, 1500);
  };

  const handleInsertLink = () => {
    const url = prompt("Enter the URL (e.g., https://example.com):");
    if (url) {
      setEmailBody(prev => prev + `\n\nLink: ${url}\n`);
    }
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

  // NEW: Handle CSV Upload
  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleSendMail = () => {
    if (!emailSubject || !emailBody) {
      alert("Please generate or write an email first.");
      return;
    }

    if (emailTarget === "custom" && !customEmail) {
      alert("Please enter a custom email address.");
      return;
    }

    if (emailTarget === "csv" && !csvFile) {
      alert("Please upload a CSV file first.");
      return;
    }

    // Append signature if checked (UPDATED FORMAT)
    let finalBody = emailBody;
    if (includeSignature) {
      finalBody += `\n\n---\nBest Regards,\nThe Organizing Committee\n${currentEventName}`;
    }

    // Determine exact target for the log
    let printTarget = "All Registered Attendees";
    if (emailTarget === "custom") printTarget = `Custom Email: ${customEmail}`;
    if (emailTarget === "csv") printTarget = `CSV Upload: ${csvFile?.name}`;

    // For presentation/testing
    console.log("SENDING TO BACKEND:");
    console.log("Target:", printTarget);
    console.log("Subject:", emailSubject);
    console.log("Body:", finalBody);
    console.log("Attachments:", attachments.length, "files");

    alert(`Successfully sent emails for ${currentEventName}!`);
    
    // Reset Form
    setEmailSubject("");
    setEmailBody("");
    setEmailPrompt("");
    setAttachments([]);
    setCustomEmail("");
    setCsvFile(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Communications Center</h2>
          <p className="text-gray-500 text-sm mt-1">Manage team messaging and external attendee emails</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-1.5 rounded-lg flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-md text-indigo-600 shadow-sm">
            <CalendarDays size={18} />
          </div>
          <select 
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setSelectedRecipients([]);
            }}
            className="bg-transparent text-sm font-bold text-indigo-900 outline-none pr-4 cursor-pointer"
          >
            {myEvents.map(evt => (
              <option key={evt.id} value={evt.id}>{evt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("internal")}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "internal"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <MessageSquare size={18} />
          Internal Team Messaging
        </button>
        <button
          onClick={() => setActiveTab("external")}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "external"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Mail size={18} />
          AI Bulk Emails
        </button>
      </div>

      {/* TAB CONTENT: Internal Messaging */}
      {activeTab === "internal" && (
        <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
          {/* Left Sidebar: Recipients List */}
          <div className="w-full lg:w-1/3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-indigo-600" /> Select Recipients
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-200">
                <input 
                  type="checkbox" 
                  checked={selectedRecipients.length === currentTeam.length && currentTeam.length > 0}
                  onChange={handleToggleAll}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                />
                <span className="text-sm font-bold text-gray-800">Select All Event Staff</span>
              </label>
              
              <hr className="my-2 border-gray-100" />
              
              {currentTeam.map((member) => (
                <label key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={selectedRecipients.includes(member.id)}
                      onChange={() => handleToggleRecipient(member.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" 
                    />
                    <span className="text-sm text-gray-800">{member.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{member.role}</span>
                </label>
              ))}

              {currentTeam.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No team members assigned to this event.</p>
              )}
            </div>
          </div>

          {/* Right Area: Chat Window */}
          <div className="w-full lg:w-2/3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-800">{currentEventName} - Announcement Board</h3>
              <p className="text-xs text-gray-500">Messages sent here will notify selected team members.</p>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30 space-y-6">
              {currentMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                currentMessages.map(msg => (
                  <div key={msg.id} className={`flex flex-col gap-1 max-w-[80%] ${msg.isMe ? 'ml-auto items-end' : ''}`}>
                    <div className={`flex items-center gap-2 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${msg.isMe ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                        {msg.initials}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{msg.sender}</span>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <div className={`text-sm p-3 rounded-2xl ${msg.isMe ? 'bg-indigo-600 text-white rounded-tr-none mr-10' : 'bg-indigo-50 border border-indigo-100 text-gray-800 rounded-tl-none ml-10'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-2">
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                  <Paperclip size={20} />
                </button>
                <textarea 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                  }}
                  placeholder="Type your message to the team... (Press Enter to send)" 
                  className="flex-1 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  rows={2}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI Bulk Emails */}
      {activeTab === "external" && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 max-w-4xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Email Updates & Announcements</h3>
              <p className="text-sm text-gray-500">Draft and send committee updates to attendees. (QR tickets are sent separately via Registrations).</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1: Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">1. Who is this for?</label>
                <select 
                  value={emailTarget}
                  onChange={(e) => setEmailTarget(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
                >
                  <option value="registered">All Registered Attendees</option>
                  <option value="custom">Custom Email Address</option>
                  <option value="csv">Upload Custom CSV List</option>
                </select>

                {/* WIRED UP: Custom Email Input */}
                {emailTarget === "custom" && (
                  <input 
                    type="email" 
                    placeholder="e.g. sponsor@company.com" 
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 mt-3 text-sm outline-none focus:border-indigo-500 text-gray-900"
                  />
                )}
                
                {/* WIRED UP: CSV Upload Input */}
                {emailTarget === "csv" && (
                  <div 
                    onClick={() => csvInputRef.current?.click()}
                    className="mt-3 border-2 border-dashed border-gray-300 rounded-xl p-3 flex items-center justify-center gap-2 text-gray-500 text-sm cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input 
                      type="file" 
                      accept=".csv"
                      ref={csvInputRef}
                      onChange={handleCsvChange}
                      className="hidden" 
                    />
                    {csvFile ? (
                      <span className="flex items-center gap-2 text-indigo-600 font-medium">
                        <FileText size={16} /> {csvFile.name}
                      </span>
                    ) : (
                      <>
                        <Upload size={16} /> Click to upload .csv file
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">2. Email Tone</label>
                <select className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white">
                  <option>Exciting & Welcoming</option>
                  <option>Formal & Professional</option>
                  <option>Urgent Reminder</option>
                </select>
              </div>
            </div>

            {/* Step 3: Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">3. What are the key details?</label>
              <textarea 
                value={emailPrompt}
                onChange={(e) => setEmailPrompt(e.target.value)}
                placeholder="e.g., Remind them that the event starts tomorrow at 9 AM, parking is at the North Garage..." 
                className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 resize-none"
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition w-full justify-center disabled:opacity-70"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isGenerating ? "AI is generating..." : "Generate AI Draft"}
            </button>

            {/* Output Editor */}
            <div className="pt-6 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">4. Review & Edit Draft</label>
              
              <input 
                type="text" 
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email Subject"
                className="w-full border border-gray-300 rounded-t-xl border-b-0 p-3 text-sm font-medium outline-none focus:bg-gray-50 text-gray-900"
              />
              
              {/* Mini Toolbar for formatting */}
              <div className="flex gap-2 bg-gray-50 border-x border-gray-300 p-2">
                <button 
                  onClick={handleInsertLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-100 transition"
                  title="Insert a clickable link"
                >
                  <LinkIcon size={14} /> Add Link
                </button>
              </div>

              <textarea 
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Email Body"
                className="w-full border border-gray-300 rounded-b-xl p-4 text-sm outline-none focus:bg-gray-50 resize-y text-gray-800"
                rows={8}
              />

              {/* Attachments Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                  >
                    <Paperclip size={16} /> Attach Files
                  </button>
                  <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </div>
                
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2 px-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FileText size={14} className="text-gray-400" />
                          <span className="font-medium">{file.name}</span>
                          <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button onClick={() => removeAttachment(idx)} className="text-gray-400 hover:text-red-500">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Signature Toggle */}
              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={includeSignature}
                    onChange={(e) => setIncludeSignature(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">
                    Append official committee signature
                  </span>
                </label>
              </div>
            </div>

            {/* Final Action */}
            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSendMail}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                <Send size={16} /> Send Mail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}