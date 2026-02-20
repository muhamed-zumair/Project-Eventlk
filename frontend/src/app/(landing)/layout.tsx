'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Linkedin, Instagram, Menu, X } from 'lucide-react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="relative flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      
      {/* NAVBAR*/}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between w-full">
          
          <Link href="/" className="flex-shrink-0 flex items-center z-50" onClick={() => setIsMobileMenuOpen(false)}>
            <Image src="/logo.png" alt="EventLK Logo" width={120} height={40} className="h-8 w-auto object-contain" priority/>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/signin" className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2">Sign In</Link>
            <Link href="/signup" className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all">Get Started</Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            type="button"
            className="lg:hidden relative z-50 text-white p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          className={`lg:hidden absolute top-full left-0 w-full max-w-[100vw] bg-[#050505] border-b border-white/10 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-[calc(100vh-5rem)] border-t border-white/5 opacity-100 visible' : 'max-h-0 border-transparent opacity-0 invisible'
          }`}
        >
          <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
            <div className="flex flex-col gap-4 text-lg font-medium text-gray-300">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-2 block">Home</Link>
              <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-2 block">Pricing</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white py-2 block">Contact</Link>
            </div>
            <hr className="border-white/10" />
            <div className="flex flex-col gap-4 pb-4">
              <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 border border-white/10 hover:bg-white/5 transition-colors rounded-lg text-gray-300 block">Sign In</Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-shadow rounded-lg font-bold text-white block">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative flex-grow">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-[#020202] pt-12 pb-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10 mb-20">
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.png" alt="EventLK Logo" width={140} height={50} className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Professional event planning made simple. From dream to reality in clicks.
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-white">Product</h5>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="hover:text-purple-400 cursor-pointer transition-colors">Features</li>
              <li className="hover:text-purple-400 cursor-pointer transition-colors"><Link href="/pricing">Pricing</Link></li>
              <li className="hover:text-purple-400 cursor-pointer transition-colors">Security</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-white">Legal</h5>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="hover:text-purple-400 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-purple-400 cursor-pointer transition-colors">Terms of Service</li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col">
            <h5 className="font-bold mb-6 text-white">Connect</h5>
            <div className="flex gap-4 mb-8">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-purple-600 cursor-pointer transition-all text-gray-300 hover:text-white">
                   <Icon className="w-4 h-4" /> 
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-200">
          <p>© 2026 EventLK. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}