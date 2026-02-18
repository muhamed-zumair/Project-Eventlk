'use client';

import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-6 relative">
      {/* Background Decor */}
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-purple-900/20 blur-[150px] pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
        
        {/* Left Side: Content */}
        <div className="hidden lg:block space-y-8">
          <div>
            <h2 className="text-purple-500 font-bold text-xl mb-2">EventLK</h2>
            <h1 className="text-5xl font-bold leading-tight mb-4">Start Planning<br/>Amazing Events</h1>
            <p className="text-gray-400 text-lg">Join thousands of event planners who trust EventLK to create unforgettable experiences.</p>
          </div>

          <div className="space-y-4">
            {[
              "AI-powered event planning",
              "Real-time team collaboration",
              "Budget tracking in LKR",
              "QR code attendance system"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-[#0F0F12] border border-white/10 p-8 rounded-2xl shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Create Your Account</h2>
            <p className="text-sm text-gray-400 mt-1">
              Already have an account? <Link href="/signin" className="text-purple-400 hover:underline">Sign in</Link>
            </p>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">First Name *</label>
                <input type="text" placeholder="John" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Last Name *</label>
                <input type="text" placeholder="Doe" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Email Address *</label>
              <input type="email" placeholder="your.email@example.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Organization (Optional)</label>
              <input type="text" placeholder="Your company name" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Password *</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Create a strong password" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all mt-4">
              Create Account →
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0F0F12] px-2 text-gray-500">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-lg text-sm transition-colors">
                Google
              </button>
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-lg text-sm transition-colors">
                Facebook
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}