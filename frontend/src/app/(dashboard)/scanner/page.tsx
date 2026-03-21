"use client";

import React, { useEffect, useState } from "react";
import { fetchAPI } from "../../../utils/api";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, ScanLine, XCircle, Loader2, ShieldCheck, AlertOctagon } from "lucide-react";

export default function EventScannerPage() {
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize the scanner engine
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 15, qrbox: { width: 280, height: 280 }, aspectRatio: 1.0 },
      false
    );

    // What happens when the camera sees a QR code
    const onScanSuccess = async (decodedText: string) => {
      // 🚀 1. If we are already checking a ticket, ignore any other QR codes it sees!
      if (isProcessing) return; 
      
      setIsProcessing(true);
      
      // (Removed scanner.pause() here to prevent the UI from collapsing)

      try {
        const response = await fetchAPI('/registrations/checkin', {
          method: 'POST',
          body: JSON.stringify({ token: decodedText })
        });

        if (response.success) {
          setScanResult({ success: true, message: response.message || "Check-in successful!" });
        } else {
          setScanResult({ success: false, message: response.message || "Invalid or duplicate ticket." });
        }
      } catch (error: any) {
        setScanResult({ success: false, message: error.message || "Network error. Try again." });
      }

      // 🚀 2. Display the result for 2.5 seconds before resetting so they can scan the next person
      setTimeout(() => {
        setScanResult(null);
        setIsProcessing(false);
      }, 2500);
    };

    scanner.render(onScanSuccess, (error) => { /* Ignore background scan errors */ });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isProcessing]);

  return (
    <div className="max-w-md mx-auto h-full flex flex-col items-center pt-6 px-4 pb-20">
      
      {/* SaaS Header */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ScanLine size={32} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Live Scanner</h2>
        <p className="text-gray-500 font-medium mt-1">Align the QR code within the frame</p>
      </div>

      {/* The Camera Viewport */}
      <div className="w-full relative group">
        
        {/* Decorative Outer Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="bg-white p-2 rounded-[2rem] shadow-xl relative overflow-hidden ring-1 ring-gray-900/5">
          
          {/* 🚀 FIXED: Added min-h-[300px] and flex utilities to prevent collapsing */}
          <div 
            id="reader" 
            className="w-full min-h-[300px] flex flex-col items-center justify-center rounded-3xl overflow-hidden [&_video]:object-cover [&_video]:rounded-3xl border-none [&_a]:text-indigo-600 [&_a]:font-bold [&_a]:no-underline hover:[&_a]:underline [&_button]:bg-indigo-50 [&_button]:text-indigo-700 [&_button]:px-5 [&_button]:py-2.5 [&_button]:rounded-xl [&_button]:font-bold [&_button]:mt-3 [&_button]:mb-5 [&_button]:transition-colors hover:[&_button]:bg-indigo-100 [&_span]:text-gray-900 [&_span]:font-bold"
          ></div>

          {/* SaaS Viewfinder Overlay (Only visible when scanning) */}
          {!isProcessing && !scanResult && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative shadow-[0_0_0_999px_rgba(0,0,0,0.4)]">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-3xl"></div>
                {/* Scanning Laser Animation */}
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Premium Processing Overlay */}
          {isProcessing && !scanResult && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-20 rounded-[1.75rem] animate-in fade-in duration-200">
              <div className="flex flex-col items-center bg-white/10 p-6 rounded-3xl border border-white/20 shadow-2xl">
                <Loader2 size={40} className="text-white animate-spin mb-3" />
                <span className="text-white font-bold tracking-wide">Verifying Ticket...</span>
              </div>
            </div>
          )}

          {/* Premium Success/Error Floating Toast */}
          {scanResult && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-30 rounded-[1.75rem] animate-in fade-in duration-200">
              <div className={`m-6 p-6 w-full max-w-sm rounded-3xl shadow-2xl border flex flex-col items-center text-center animate-in zoom-in-95 duration-300 ${
                scanResult.success 
                  ? 'bg-emerald-500 border-emerald-400 text-white' 
                  : 'bg-rose-500 border-rose-400 text-white'
              }`}>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 border border-white/30 shadow-inner">
                  {scanResult.success ? <ShieldCheck size={36} className="text-white" /> : <AlertOctagon size={36} className="text-white" />}
                </div>
                <h3 className="text-xl font-black tracking-tight mb-1">
                  {scanResult.success ? "Verified!" : "Access Denied"}
                </h3>
                <p className="font-medium text-white/90 text-sm">
                  {scanResult.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Help Text */}
      <p className="mt-8 text-sm font-medium text-gray-400 flex items-center gap-2">
        <ShieldCheck size={16} /> Secure QR Check-in System
      </p>
    </div>
  );
}