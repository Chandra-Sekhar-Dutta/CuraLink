'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EXPERTS } from '@/lib/mockData';
import { toggleFavorite, getFavorites } from '@/lib/favorites';
import { fetchExpertsByCondition, ExpertResearcher } from '@/lib/externalData';

export default function ResearcherExpertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [liveExperts, setLiveExperts] = useState<ExpertResearcher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'mock' | 'live'>('mock');

  useEffect(() => { 
    if (status === 'unauthenticated') router.push('/auth/signin'); 
  }, [status, router]);

  // Load favorites
  useEffect(() => {
    const favoriteIds = getFavorites('experts');
    setFavorites(new Set(favoriteIds));
  }, []);

  // Search live experts when query changes
  useEffect(() => {
    const searchLiveExperts = async () => {
      const q = query.trim();
      if (q.length < 3) {
        setLiveExperts([]);
        setSearchMode('mock');
        return;
      }

      setLoading(true);
      setSearchMode('live');
      
      try {
        const experts = await fetchExpertsByCondition([q], 20);
        setLiveExperts(experts);
      } catch (error) {
        console.error('Error fetching live experts:', error);
        setLiveExperts([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchLiveExperts, 500);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // If query is less than 3 chars, show mock data filtered
    if (q.length < 3) {
      if (!q) return EXPERTS;
      return EXPERTS.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.specialty.toLowerCase().includes(q) || 
        e.conditions.some(c => c.toLowerCase().includes(q)) ||
        e.city.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q)
      );
    }
    
    // If we have live results, show them
    if (liveExperts.length > 0) {
      return liveExperts.map(expert => ({
        id: expert.id,
        name: expert.name,
        specialty: expert.specialty,
        conditions: expert.conditions,
        city: expert.city,
        country: expert.country,
        email: expert.email || `${expert.name.toLowerCase().replace(/\s/g, '.')}@example.com`,
        orcidId: expert.orcidId,
        affiliation: expert.affiliation,
        publicationCount: expert.publicationCount,
        url: expert.url,
      }));
    }
    
    // If loading, show mock data as placeholder
    if (loading) {
      return EXPERTS.slice(0, 3);
    }
    
    return [];
  }, [query, liveExperts, loading]);

  const handleToggleFavorite = (id: string) => {
    toggleFavorite('experts', id);
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConnectClick = (expert: any) => {
    setSelectedExpert(expert);
    setRequestMessage(`Hi ${expert.name}, I would like to connect with you regarding your expertise in ${expert.specialty}.`);
    setShowConnectModal(true);
  };

  const handleSendConnectionRequest = async () => {
    if (!selectedExpert) return;
    
    setSendingRequest(true);
    try {
      // Simulate sending connection request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Connection request sent to ${selectedExpert.name}!\n\nAn email has been sent to: ${selectedExpert.email}`);
      setShowConnectModal(false);
      setRequestMessage('');
    } catch (error) {
      alert('Failed to send connection request. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleViewProfile = (expertId: string) => {
    router.push(`/dashboard/researcher/experts/${expertId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Expert Directory
          </h1>
          <p className="text-gray-700">Browse and connect with experts in various medical specialties</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Search Experts</label>
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search by name, specialty, condition, or disease (min 3 characters for live search)..." 
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:outline-none transition-colors" 
          />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-500">
              {loading && <span className="text-indigo-600">🔄 Searching live database...</span>}
              {!loading && searchMode === 'live' && (
                <span className="text-green-600">✓ Showing {results.length} live results from ORCID</span>
              )}
              {!loading && searchMode === 'mock' && (
                <span>Found {results.length} expert{results.length !== 1 ? 's' : ''}</span>
              )}
            </div>
            {query.length >= 3 && (
              <div className="text-xs text-indigo-600 font-medium">
                💡 Using ORCID API for real researchers
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((expert: any, index) => (
            <motion.div
              key={expert.id}
              className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-indigo-300 hover:shadow-lg transition-all relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Live Badge */}
              {expert.orcidId && (
                <div className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  LIVE
                </div>
              )}
              
              {/* Expert Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {expert.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <button
                  onClick={() => handleToggleFavorite(expert.id)}
                  className={`p-2 rounded-full transition-colors ${
                    favorites.has(expert.id) 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={favorites.has(expert.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              </div>

              {/* Expert Info */}
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{expert.name}</h3>
                <p className="text-indigo-600 font-semibold text-sm mb-2">{expert.specialty}</p>
                
                {expert.affiliation && (
                  <p className="text-xs text-gray-500 mb-2">🏛️ {expert.affiliation}</p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {expert.city}, {expert.country}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {expert.email}
                  </div>
                  
                  {expert.publicationCount && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {expert.publicationCount} publications
                    </div>
                  )}
                </div>

                {/* Conditions */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Specializes in:</p>
                  <div className="flex flex-wrap gap-1">
                    {expert.conditions.slice(0, 3).map((condition: string) => (
                      <span 
                        key={condition} 
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                      >
                        {condition}
                      </span>
                    ))}
                    {expert.conditions.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{expert.conditions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    className="flex-1 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition-colors"
                    onClick={() => handleConnectClick(expert)}
                  >
                    Connect
                  </button>
                  {expert.url ? (
                    <a
                      href={expert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors text-center"
                    >
                      View ORCID
                    </a>
                  ) : (
                    <button 
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                      onClick={() => handleViewProfile(expert.id)}
                    >
                      View Profile
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No experts found matching your search criteria.</p>
            {query.length >= 3 && (
              <p className="text-sm text-gray-400">Try different keywords or check your spelling</p>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching ORCID database...</p>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard/researcher')}
            className="px-6 py-3 bg-white rounded-xl shadow hover:shadow-md transition-shadow text-gray-700 font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Connection Request Modal */}
      {showConnectModal && selectedExpert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Send Connection Request</h3>
              <button
                onClick={() => !sendingRequest && setShowConnectModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={sendingRequest}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Expert Info */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {selectedExpert.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{selectedExpert.name}</div>
                <div className="text-sm text-indigo-600">{selectedExpert.specialty}</div>
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                rows={4}
                placeholder="Introduce yourself and explain why you'd like to connect..."
                disabled={sendingRequest}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                disabled={sendingRequest}
              >
                Cancel
              </button>
              <button
                onClick={handleSendConnectionRequest}
                disabled={sendingRequest}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingRequest ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Request
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
