'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the sign-in page
    router.push('/auth/signin');
  }, [router]);

  return null;
}