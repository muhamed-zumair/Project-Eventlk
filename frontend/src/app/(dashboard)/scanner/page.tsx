"use client";

import React, { useEffect, useState } from "react";
import { fetchAPI } from "../../../utils/api";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, AlertTriangle, ScanLine, XCircle } from "lucide-react";

export default function EventScannerPage() {
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Initialize the scanner engine
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    // What happens when the camera sees a QR code
    const onScanSuccess = async (decodedText: string) => {
      if (isProcessing) return; // Prevent double-scanning the same code instantly
      
      setIsProcessing(true);
      scanner.pause(true); // Freeze the camera frame

      try {
        const response = await fetchAPI('/registrations/checkin', {
          method: 'POST',
          body: JSON.stringify({ token: decodedText })
        });

        if (response.success) {
          setScanResult({ success: true, message: response.message });
        } else {
          setScanResult({ success: false, message: response.message || "Invalid Ticket" });
        }
      } catch (error: any) {
        setScanResult({ success: false, message: error.message || "Network error. Try again." });
      }

      // Keep the result on screen for 2.5 seconds, then resume scanning the next person!
      setTimeout(() => {
        setScanResult(null);
        setIsProcessing(false);
        scanner.resume();
      }, 2500);
    };

    scanner.render(onScanSuccess, (error) => { /* Ignore background scan errors */ });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isProcessing]);

  return (
    <div className="max-w-md mx-auto h-full flex flex-col items-center pt-8 px-4 pb-20">
      <div className="text-center mb-8">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full inline-flex mb-3 shadow-sm">
          <ScanLine size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Live Check-In</h2>
        <p className="text-gray-500 text-sm mt-1">Point camera at the attendee's QR code</p>
      </div>

      {/* The Camera Viewport */}
      <div className="w-full bg-white p-2 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden">
        <div id="reader" className="w-full rounded-2xl overflow-hidden [&_video]:object-cover [&_video]:rounded-2xl border-none"></div>
        
        {/* Processing Overlay */}
        {isProcessing && !scanResult && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
            <div className="animate-pulse text-indigo-600 font-bold flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              Verifying Ticket...
            </div>
          </div>
        )}
      </div>

      {/* Success / Error Popups */}
      <div className="h-24 w-full mt-6">
        {scanResult && (
          <div className={`w-full p-4 rounded-2xl shadow-md border flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in ${
            scanResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="shrink-0">
              {scanResult.success ? <CheckCircle size={24} className="text-green-600" /> : <XCircle size={24} className="text-red-600" />}
            </div>
            <p className="font-bold text-sm leading-snug">{scanResult.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}