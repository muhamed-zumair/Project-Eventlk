'use client';

import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For redirecting after success

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. STATE FOR FORM DATA
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    password: ''
  });

  // 2. HANDLE INPUT CHANGES
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. HANDLE FORM SUBMISSION
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // 1. Store the token in LocalStorage so the Dashboard can use it
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        localStorage.setItem('isNewUser', 'true');

        // 2. Redirect straight to the dashboard!
        router.push('/dashboard'); 
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-6 relative">
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-purple-900/20 blur-[150px] pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">

        {/* Left Side: Content (Same as before) */}
        <div className="hidden lg:block space-y-8">
          <div>
            <h2 className="text-purple-500 font-bold text-xl mb-2">EventLK</h2>
            <h1 className="text-5xl font-bold leading-tight mb-4">Start Planning<br />Amazing Events</h1>
            <p className="text-gray-400 text-lg">Join thousands of planners who trust EventLK.</p>
          </div>
          <div className="space-y-4">
            {["AI-powered event planning", "Real-time team collaboration", "Budget tracking in LKR", "QR code attendance system"].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
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

          {/* Show error message if it exists */}
          {error && <p className="text-red-500 text-xs mb-4 bg-red-500/10 p-2 rounded">{error}</p>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">First Name *</label>
                <input 
                  type="text" 
                  name="firstName" // Important! Matches state
                  required
                  onChange={handleChange}
                  placeholder="John" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Last Name *</label>
                <input 
                  type="text" 
                  name="lastName" 
                  required
                  onChange={handleChange}
                  placeholder="Doe" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors text-white" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Email Address *</label>
              <input 
                type="email" 
                name="email" 
                required
                onChange={handleChange}
                placeholder="your.email@example.com" 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors text-white" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Organization (University)</label>
              <select
                name="organization"
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors text-gray-300"
              >
                <option value="" className="bg-[#0F0F12]">Select your university...</option>
                <option value="1436be71-3ab3-4ad2-a5ab-8a0481569890" className="bg-[#0F0F12]">University of Moratuwa (UoM)</option>
                <option value="ba63b5e7-7355-47a1-aa2a-800d1f7c8b59" className="bg-[#0F0F12]">Sri Lanka Institute of Information Technology (SLIIT)</option>
                <option value="0172247e-8b4e-49b5-a5d7-8a40da5323a3" className="bg-[#0F0F12]">Informatics Institute of Technology (IIT)</option>
                <option value="6b2d9c31-03d5-4a50-b2c2-7705df4f87b1" className="bg-[#0F0F12]">University of Colombo (UoC)</option>
                <option value="cef9ead1-a35e-461b-b498-2c7edc6200e3" className="bg-[#0F0F12]">University of Peradeniya (UoP)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400">Password *</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  required
                  onChange={handleChange}
                  placeholder="Create a strong password" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500 focus:outline-none transition-colors text-white" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all mt-4 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>

            {/* Social Logins */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0F0F12] px-2 text-gray-500">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-lg text-sm transition-colors"
              >
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-lg text-sm transition-colors text-gray-500">
                Facebook
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}