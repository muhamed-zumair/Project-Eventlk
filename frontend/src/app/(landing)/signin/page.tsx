'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation'; // 🚀 Catch the URL params// For redirecting after success

import { Suspense } from 'react'; // 👈 Add this import at the top with your other imports

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteEmail = searchParams.get('email') || ''; 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: inviteEmail, 
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); 
        router.push('/dashboard');
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#030303]">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-900/20 blur-[150px] pointer-events-none" />

      <div className="max-w-md w-full z-10 text-center">
        <div className="mb-8">
          <h2 className="text-purple-500 font-bold text-xl mb-2">EventLK</h2>
          <h1 className="text-4xl font-bold mb-2 text-white">Welcome Back!</h1>
          <p className="text-gray-300 text-sm max-w-sm mx-auto">
            Sign in to continue managing your events and creating unforgettable experiences.
          </p>
        </div>

        <div className="bg-[#0F0F12] border border-white/10 p-8 rounded-2xl shadow-2xl text-left">
          <h2 className="text-2xl font-bold mb-1">Sign In</h2>
          <p className="text-sm text-gray-400 mb-6">
            Don't have an account? <Link href="/signup" className="text-purple-400 hover:underline">Create one</Link>
          </p>

          {error && <p className="text-red-500 text-xs mb-4 bg-red-500/10 p-2 rounded">{error}</p>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs text-gray-400 block font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email} 
                required
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" required onChange={handleChange} placeholder="Enter your password" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0F0F12] px-2 text-gray-500">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-lg text-sm transition-colors text-white"
              >
                Google
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          By signing in, you agree to our <Link href="/terms" className="text-purple-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}

// 🚀 THIS IS THE WRAPPER THAT FIXES THE VERCEL ERROR
export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030303] flex items-center justify-center text-white">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}