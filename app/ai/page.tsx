'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AI Page - Redirects to home page
 * AI features are integrated throughout the app via AIAssistant component
 */
export default function AIPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main page since AI features are integrated throughout the app
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center p-8">
        <div className="animate-pulse mb-4">
          <svg className="w-16 h-16 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Redirecting...</h1>
        <p className="text-gray-600">AI features are integrated throughout the app</p>
      </div>
    </div>
  );
}
