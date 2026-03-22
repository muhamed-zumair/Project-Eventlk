'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userJson = searchParams.get('user');

    // DEBUG: Check what is actually arriving from the backend
    console.log("Token received:", !!token);
    console.log("User JSON received:", !!userJson);

    if (token) {
      try {
        // 1. Save the token immediately
        localStorage.setItem('token', token);
        
        // 2. Save user data if it exists, or set a dummy one to prevent crash
        if (userJson) {
          localStorage.setItem('user', userJson);
        } else {
          localStorage.setItem('user', JSON.stringify({ name: "User" }));
        }
        
        localStorage.setItem('isNewUser', 'true');

        // 3. Use window.location.href for a 'hard' redirect to ensure 
        // the app re-reads the fresh localStorage token
        window.location.href = '/dashboard'; 
      } catch (err) {
        console.error("Auth initialization failed:", err);
        window.location.href = '/signin?error=session_error';
      }
    } else if (!searchParams.toString()) {
       // Wait for searchParams to load before giving up
       return;
    } else {
      console.warn("No token found in URL, redirecting to signin");
      window.location.href = '/signin';
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg font-medium text-gray-300">Completing secure login...</p>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F12]">
      {/* Suspense is required in Next.js when using useSearchParams */}
      <Suspense fallback={<p className="text-white">Loading...</p>}>
        <AuthSuccessHandler />
      </Suspense>
    </div>
  );
}