'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userJson = searchParams.get('user');

    if (token && userJson) {
      try {
        // 1. Save the "Baton" passed from the backend
        localStorage.setItem('token', token);
        localStorage.setItem('user', userJson);
        
        // 2. Set the flag for your "Impressive" greeting
        localStorage.setItem('isNewUser', 'true');

        // 3. Clear the URL and go to dashboard
        router.push('/dashboard');
      } catch (err) {
        console.error("Auth initialization failed:", err);
        router.push('/signin?error=session_error');
      }
    } else {
      // If someone lands here without tokens, send them back
      router.push('/signin');
    }
  }, [searchParams, router]);

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