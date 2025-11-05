'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Researcher {
  id: number;
  name: string;
  email: string;
  image: string | null;
  affiliation?: string;
  position?: string;
  specialties?: string[];
  connectionStatus?: 'none' | 'pending' | 'accepted' | 'rejected';
}

export default function FindResearchersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState<number | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchResearchers();
  }, [session]);

  const fetchResearchers = async () => {
    try {
      const res = await fetch('/api/researcher/find');
      if (res.ok) {
        const data = await res.json();
        setResearchers(data.researchers || []);
      }
    } catch (error) {
      console.error('Error fetching researchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (receiverId: number) => {
    setSending(receiverId);
    try {
      const res = await fetch('/api/researcher/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId }),
      });

      if (res.ok) {
        // Update local state
        setResearchers(prev =>
          prev.map(r =>
            r.id === receiverId ? { ...r, connectionStatus: 'pending' } : r
          )
        );
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    } finally {
      setSending(null);
    }
  };

  const filteredResearchers = researchers.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.affiliation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusButton = (researcher: Researcher) => {
    switch (researcher.connectionStatus) {
      case 'accepted':
        return (
          <button
            onClick={() => router.push('/dashboard/researcher/chat')}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm hover:bg-green-200 transition-colors"
          >
            💬 Chat
          </button>
        );
      case 'pending':
        return (
          <button
            disabled
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold text-sm cursor-not-allowed"
          >
            ⏳ Pending
          </button>
        );
      case 'rejected':
        return (
          <button
            disabled
            className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-semibold text-sm cursor-not-allowed"
          >
            ❌ Rejected
          </button>
        );
      default:
        return (
          <button
            onClick={() => sendConnectionRequest(researcher.id)}
            disabled={sending === researcher.id}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50"
          >
            {sending === researcher.id ? '⏳ Sending...' : '➕ Connect'}
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Find Researchers</h1>
          <p className="text-gray-600">Connect with fellow researchers and collaborate</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or affiliation..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </motion.div>

        {/* Researchers List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredResearchers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No researchers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResearchers.map((researcher, index) => (
              <motion.div
                key={researcher.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {researcher.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{researcher.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{researcher.email}</p>
                  </div>
                </div>

                {researcher.position && (
                  <p className="text-sm font-semibold text-indigo-600 mb-1">{researcher.position}</p>
                )}
                {researcher.affiliation && (
                  <p className="text-sm text-gray-600 mb-3">{researcher.affiliation}</p>
                )}

                {researcher.specialties && researcher.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {researcher.specialties.slice(0, 3).map((specialty, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {getStatusButton(researcher)}
                  <button
                    onClick={() => router.push(`/researcher/${researcher.id}`)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                  >
                    👤 View Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
