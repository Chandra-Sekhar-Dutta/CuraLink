'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (session?.user) {
      const userType = (session.user as any).userType;
      const cb = searchParams.get('callbackUrl');
      const roleHint = (searchParams.get('role') || '').toLowerCase();

      // Whitelist callback destinations per role
      const allowedByRole: Record<string, string> = {
        patient: '/dashboard/patient',
        researcher: '/dashboard/researcher',
      };

      // 1) If we have a safe callbackUrl to any dashboard, honor it first
      if (cb && cb.startsWith('/dashboard/')) {
        router.push(cb);
        return;
      }

      // 2) If there's an explicit role hint, prefer that
      if (roleHint === 'researcher') {
        router.push(allowedByRole.researcher);
        return;
      }
      if (roleHint === 'patient') {
        router.push(allowedByRole.patient);
        return;
      }

      // 3) Otherwise, fall back to the user's stored role
      if (userType === 'patient' || userType === 'researcher') {
        router.push(allowedByRole[userType]);
      } else {
        // For users without userType (OAuth sign-in first time), redirect to select role
        router.push('/auth/select-role');
      }
    }
  }, [session, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Check if it's an email verification error
        if (result.error.includes('verify your email')) {
          setError('Please verify your email before signing in. Check your inbox for the verification link.');
          setShowResendLink(true);
        } else {
          setError('Invalid email or password');
          setShowResendLink(false);
        }
        setLoading(false);
      } else if (result?.ok) {
        // Refresh session and redirect immediately according to role and callbackUrl
        const updated = await update();
  const cb = searchParams.get('callbackUrl');
  const roleHint = (searchParams.get('role') || '').toLowerCase();
        const userType = (updated?.user as any)?.userType;

        const allowedByRole: Record<string, string> = {
          patient: '/dashboard/patient',
          researcher: '/dashboard/researcher',
        };

        // 1) If we have a safe dashboard callback, honor it first
        if (cb && cb.startsWith('/dashboard/')) {
          router.push(cb);
          return;
        }

        // 2) Respect role hint from the link, if provided
        if (roleHint === 'researcher') {
          router.push(allowedByRole.researcher);
          return;
        }
        if (roleHint === 'patient') {
          router.push(allowedByRole.patient);
          return;
        }

        // 3) Fall back to user's stored role or role selection
        if (userType === 'patient' || userType === 'researcher') {
          router.push(allowedByRole[userType]);
        } else {
          router.push('/auth/select-role');
        }
      }
    } catch (error: any) {
      if (error?.message?.includes('verify your email')) {
        setError('Please verify your email before signing in. Check your inbox for the verification link.');
        setShowResendLink(true);
      } else {
        setError('Something went wrong');
        setShowResendLink(false);
      }
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        alert('Verification email sent! Please check your inbox.');
      } else {
        setError(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('Failed to resend verification email');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Sign in to CuraLink</h2>
        
        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
              {showResendLink && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="block mt-2 text-indigo-600 hover:text-indigo-700 font-medium underline"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={async () => {
            // Preserve callbackUrl but return to this page to apply role-aware redirect
            const cb = searchParams.get('callbackUrl') || '';
            const ret = `/auth/signin${cb ? `?callbackUrl=${encodeURIComponent(cb)}` : ''}`;
            await signIn('google', { callbackUrl: ret });
          }}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* ORCID Sign In */}
        <button
          onClick={async () => {
            const cb = searchParams.get('callbackUrl') || '';
            const ret = `/auth/signin${cb ? `?callbackUrl=${encodeURIComponent(cb)}` : ''}`;
            await signIn('orcid', { callbackUrl: ret });
          }}
          className="w-full flex items-center justify-center gap-3 bg-[#a6ce39] text-white border border-[#a6ce39] rounded-lg px-6 py-3 hover:bg-[#8fb82d] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.016-5.325 5.016h-3.919V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.825-1.444 3.825-3.722 0-2.056-1.285-3.722-3.844-3.722h-2.278z"/>
          </svg>
          Continue with ORCID
        </button>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/sign-up" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}