'use client';

import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram, Send, CheckCircle2, Loader2 } from 'lucide-react';
import {useState} from 'react';

export default function ContactPage() {
  // 1. Setup State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 2. Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Make sure this URL matches your backend contact route!
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        // Clear the form
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setErrorMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage("Failed to connect to the server. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-gray-400">Have questions about EventLK? We'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* LEFT: Contact Form */}
          <div className="lg:col-span-2 bg-[#0F0F12] border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

            {/* Success Message */}
            {status === 'success' && (
              <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <p>Your message has been received! We will get back to you shortly.</p>
              </div>
            )}

            {/* Error Message */}
            {status === 'error' && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
                <p>{errorMessage}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your.email@example.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+94 XX XXX XXXX" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Subject *</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Message *</label>
                <textarea rows={5} name="message" value={formData.message} onChange={handleChange} required placeholder="Tell us how we can help you..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-white"></textarea>
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Info Cards */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-lg mb-4">Contact Information</h3>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><Mail className="w-5 h-5"/></div>
                <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">eventlk101.admin@gmail.com</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><Phone className="w-5 h-5"/></div>
                <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium">+94 11 234 5678</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><MapPin className="w-5 h-5"/></div>
                <div><p className="text-xs text-gray-500">Office</p><p className="text-sm font-medium">123 Galle Road<br/>Colombo 03<br/>Sri Lanka</p></div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6">
               <h3 className="font-bold text-lg mb-2">Business Hours</h3>
               <div className="text-4xl font-bold">24/7</div>
            </div>

            {/* Socials */}
            <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6">
               <h3 className="font-bold text-lg mb-4">Follow Us</h3>
               <div className="flex gap-4">
                 {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                   <div key={i} className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                     <Icon className="w-4 h-4" />
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
        
        {/* Map Placeholder */}
        <div className="w-full h-80 bg-[#0F0F12] border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-900/10"></div>
          <div className="text-center z-10">
            <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500">Map Location</p>
            <p className="text-xs text-gray-600">123 Galle Road, Colombo 03, Sri Lanka</p>
          </div>
        </div>
      </div>
    </div>
  );
}