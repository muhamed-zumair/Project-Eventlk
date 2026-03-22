"use client";

import { useState, useEffect } from "react";
import { User, Bell, Lock, CheckCircle, Info, X, Loader2, Eye, EyeOff , Sparkles} from "lucide-react";
import { fetchAPI } from "../../../utils/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form States
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", role: "" });
  const [notifications, setNotifications] = useState({ tasks: true, messages: true });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [isSaving, setIsSaving] = useState(false);


  // 🚀 NEW: Track password visibility
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });


  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetchAPI("/auth/settings", { method: "GET" });
        if (res.success) {
          setProfile({
            firstName: res.user.first_name || "",
            lastName: res.user.last_name || "",
            email: res.user.email,
            role: res.user.global_role === "User" ? "EventLK User" : "EventLK Organizer"
          });
          setNotifications({
            tasks: res.user.notify_tasks ?? true,
            messages: res.user.notify_messages ?? true
          });
        }
      } catch (error) {
        showToast("Failed to load settings.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await fetchAPI("/auth/settings/profile", {
      method: "PUT",
      body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName })
    });
    setIsSaving(false);
    if (res.success) {
      showToast(res.message, "success");
      // Update local storage so the sidebar name updates too!
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.firstName = profile.firstName;
      storedUser.lastName = profile.lastName;
      localStorage.setItem('user', JSON.stringify(storedUser));
    } else showToast(res.message, "error");
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    const res = await fetchAPI("/auth/settings/notifications", {
      method: "PUT",
      body: JSON.stringify({ notifyTasks: notifications.tasks, notifyMessages: notifications.messages })
    });
    setIsSaving(false);
    if (res.success) showToast(res.message, "success");
    else showToast(res.message, "error");
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return showToast("New passwords do not match!", "error");
    if (passwords.new.length < 8) return showToast("Password must be at least 8 characters.", "error");

    setIsSaving(true);
    try {
      const res = await fetchAPI("/auth/settings/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      });

      if (res.success) {
        showToast(res.message, "success");
        setPasswords({ current: "", new: "", confirm: "" });
        setShowPassword({ current: false, new: false, confirm: false }); // Reset eyes
      } else {
        showToast(res.message, "error");
      }
    } catch (error: any) {
      // 🚀 CATCH THE THROWN ERROR AND SHOW IT IN THE TOAST
      showToast(error.message || "Failed to update password.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
  <div className="max-w-6xl mx-auto p-10 space-y-8 animate-pulse">
    <div className="space-y-2">
      <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
      <div className="h-4 w-64 bg-gray-100 rounded-lg"></div>
    </div>
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-64 space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-12 w-full bg-gray-100 rounded-xl"></div>)}
      </div>
      <div className="flex-1 h-96 bg-gray-50 rounded-2xl border border-gray-100"></div>
    </div>
  </div>
);
  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col relative">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences and security</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-1 shrink-0">
          {[{ id: "profile", label: "Profile", icon: User }, { id: "notifications", label: "Notifications", icon: Bell }, { id: "security", label: "Security", icon: Lock }].map((item) => (
            <button 
  key={item.id} 
  onClick={() => setActiveTab(item.id)} 
  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 ${
    activeTab === item.id 
      ? "bg-white text-indigo-600 shadow-sm border border-indigo-100 ring-4 ring-indigo-50/50" 
      : "text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm"
  }`}
>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Profile Settings</h3>
              <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address (Read Only)</label>
                    <input type="email" disabled value={profile.email} className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Type (Read Only)</label>
                    <div className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-indigo-700 font-bold bg-indigo-50/50 cursor-not-allowed">{profile.role}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button 
  type="submit" 
  disabled={isSaving} 
  className="relative bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200 disabled:opacity-70 flex items-center gap-2 overflow-hidden"
>
  {isSaving ? (
    <>
      <Loader2 size={18} className="animate-spin" />
      <span>Updating...</span>
    </>
  ) : (
    <span>Save Changes</span>
  )}
</button>
                </div>
                {/* 🚀 New User Encouragement */}
                <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                  <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-indigo-900">Ready to level up?</p>
                    <p className="text-xs text-indigo-700/70 mt-0.5 font-medium">
                      Create your first event to be promoted to an <strong className="text-indigo-900">EventLK Organizer</strong>.
                    </p>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-8 max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Email Notification Preferences</h3>
              <div className="space-y-6">

                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-gray-800">Task Assignments</p><p className="text-sm text-gray-500 mt-1">Email me when I am assigned a new task</p></div>
                  <button onClick={() => setNotifications({ ...notifications, tasks: !notifications.tasks })} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${notifications.tasks ? "bg-indigo-600" : "bg-gray-200"}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 mt-0.5 ${notifications.tasks ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>

                <div className="border-t border-gray-50"></div>

                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-gray-800">Internal Messages</p><p className="text-sm text-gray-500 mt-1">Email me when someone sends a private message</p></div>
                  <button onClick={() => setNotifications({ ...notifications, messages: !notifications.messages })} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${notifications.messages ? "bg-indigo-600" : "bg-gray-200"}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 mt-0.5 ${notifications.messages ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button 
  onClick={handleSaveNotifications} 
  disabled={isSaving} 
  className="relative bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200 disabled:opacity-70 flex items-center gap-2 overflow-hidden"
>
  {isSaving ? (
    <>
      <Loader2 size={18} className="animate-spin" />
      <span>Updating...</span>
    </>
  ) : (
    <span>Save Preferences</span>
  )}
</button>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-8 max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Security Settings</h3>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Current Password</label>
                  <div className="relative">
                    <input type={showPassword.current ? "text" : "password"} value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white pr-10" required />
                    <button type="button" onClick={() => setShowPassword({...showPassword, current: !showPassword.current})} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition">
                      {/* 🚀 SWAPPED ICONS HERE */}
                      {showPassword.current ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <input type={showPassword.new ? "text" : "password"} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white pr-10" required />
                    <button type="button" onClick={() => setShowPassword({...showPassword, new: !showPassword.new})} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition">
                      {/* 🚀 SWAPPED ICONS HERE */}
                      {showPassword.new ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                  <div className="relative">
                    <input type={showPassword.confirm ? "text" : "password"} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white pr-10" required />
                    <button type="button" onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition">
                      {/* 🚀 SWAPPED ICONS HERE */}
                      {showPassword.confirm ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button 
  type="submit" 
  disabled={isSaving} 
  className="relative bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200 disabled:opacity-70 flex items-center gap-2 overflow-hidden"
>
  {isSaving ? (
    <>
      <Loader2 size={18} className="animate-spin" />
      <span>Updating...</span>
    </>
  ) : (
    <span>Update Password</span>
  )}
</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[100] bg-white border shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 border-l-4 ${
          toast.type === 'success' ? 'border-l-emerald-500' : 'border-l-rose-500'
        }`}>
          <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <Info size={20} />}
          </div>
          <div className="pr-8">
            <h4 className="text-sm font-black text-gray-900">{toast.type === 'success' ? 'Settings Saved' : 'Update Failed'}</h4>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
          
          {/* Progress Bar Timer Animation */}
          <div className={`absolute bottom-0 left-0 h-1 transition-all duration-[4000ms] ease-linear ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
          }`} style={{ width: '100%', animation: 'progress 4s linear forwards' }}></div>
        </div>
      )}

      {/* Adding the custom keyframe for the progress bar */}
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}