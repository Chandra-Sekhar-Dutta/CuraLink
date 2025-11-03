'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AIPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main page since AI features are integrated throughout the app
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-600">AI features are integrated throughout the app</p>
      </div>
    </div>
  );
}
