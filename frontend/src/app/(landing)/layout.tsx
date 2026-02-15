'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="EventLK Logo" width={120} height={40} className="h-8 w-auto object-contain" priority />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/signin" className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2">Sign In</Link>
            <Link href="/signup" className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 rounded-full hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="border-t border-white/10 bg-[#020202] pt-12 pb-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10 mb-20">
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.png" alt="EventLK Logo" width={140} height={50} className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Professional event planning made simple. From dream to reality in clicks.
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-white">Product</h5>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="hover:text-purple-400 cursor-pointer transition-colors">Features</li>
              <li className="hover:text-purple-400 cursor-pointer transition-colors text-white"><Link href="/pricing">Pricing</Link></li>
              <li className="hover:text-purple-400 cursor-pointer transition-colors">Security</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6 text-white">Legal</h5>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="hover:text-purple-400 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-purple-400 cursor-pointer transition-colors">Terms of Service</li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col">
            <h5 className="font-bold mb-6 text-white">Connect</h5>
            <div className="flex gap-4 mb-8">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-purple-600 cursor-pointer transition-all text-gray-400 hover:text-white">
                   <Icon className="w-4 h-4" /> 
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>© 2026 EventLK. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}