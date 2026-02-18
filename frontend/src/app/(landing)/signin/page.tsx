'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-6 relative">
      {/* Background Decor */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-900/20 blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full z-10 text-center">
        <div className="mb-8">
          <h2 className="text-purple-500 font-bold text-xl mb-2">EventLK</h2>
          <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-gray-400 text-sm">Sign in to continue managing your events and creating unforgettable experiences.</p>
        </div>

        <div className="bg-[#0F0F12] border border-white/10 p-8 rounded-2xl shadow-2xl text-left">
          <h2 className="text-2xl font-bold mb-1">Sign In</h2>
          <p className="text-sm text-gray-400 mb-6">
            Don't have an account? <Link href="/signup" className="text-purple-400 hover:underline">Create one</Link>
          </p>

          <form className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Email Address</label>
              <input type="email" placeholder="your.email@example.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
                <input type="checkbox" className="rounded bg-white/10 border-white/20" />
                Remember me
              </label>
              <a href="#" className="text-purple-400 hover:underline">Forgot password?</a>
            </div>

            <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all">
              Sign In →
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
        
        <div className="mt-8 text-xs text-gray-500">
           By signing in, you agree to our <a href="#" className="text-purple-400">Terms of Service</a> and <a href="#" className="text-purple-400">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}