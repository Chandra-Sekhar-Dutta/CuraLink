'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SelectRole() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async (userType: 'patient' | 'researcher') => {
    setLoading(true);

    try {
      // Update user type in database
      const response = await fetch('/api/auth/update-usertype', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType }),
      });

      if (response.ok) {
        // Update the session
        await update();
        
        // Redirect to appropriate dashboard
        if (userType === 'patient') {
          router.push('/dashboard/patient');
        } else {
          router.push('/dashboard/researcher');
        }
      } else {
        alert('Failed to update user type');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      alert('An error occurred');
      setLoading(false);
    }
  };

  const handleGoBack = async () => {
    // Sign out and go back to home
    await signOut({ redirect: false });
    router.push('/');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 p-4">
      <motion.div
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 relative"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        {/* Back Button */}
        <motion.button
          onClick={handleGoBack}
          className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition-colors group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Go back to home"
        >
          <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>

        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Welcome to CuraLink!
        </motion.h1>

        <motion.p
          className="text-center text-gray-600 text-lg mb-12"
          variants={fadeInUp}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Please select your role to continue
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            onClick={() => handleRoleSelection('patient')}
            disabled={loading}
            className="group relative overflow-hidden rounded-2xl border-2 border-pink-600 bg-gradient-to-br from-pink-50 to-purple-50 p-8 hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
            variants={scaleIn}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm a Patient</h3>
              <p className="text-gray-600">Find clinical trials, connect with experts, and manage your health journey</p>
            </div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </motion.button>

          <motion.button
            onClick={() => handleRoleSelection('researcher')}
            disabled={loading}
            className="group relative overflow-hidden rounded-2xl border-2 border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
            variants={scaleIn}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">I'm a Researcher</h3>
              <p className="text-gray-600">Manage studies, collaborate with peers, and advance medical research</p>
            </div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </motion.button>
        </div>

        {loading && (
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-2">Setting up your account...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
