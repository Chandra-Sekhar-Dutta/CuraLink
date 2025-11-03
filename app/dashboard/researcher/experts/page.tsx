'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EXPERTS } from '@/lib/mockData';
import { toggleFavorite, getFavorites } from '@/lib/favorites';

export default function ResearcherExpertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => { 
    if (status === 'unauthenticated') router.push('/auth/signin'); 
  }, [status, router]);

  // Load favorites
  useEffect(() => {
    const favoriteIds = getFavorites('experts');
    setFavorites(new Set(favoriteIds));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EXPERTS;
    return EXPERTS.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.specialty.toLowerCase().includes(q) || 
      e.conditions.some(c => c.toLowerCase().includes(q)) ||
      e.city.toLowerCase().includes(q) ||
      e.country.toLowerCase().includes(q)
    );
  }, [query]);

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
            placeholder="Search by name, specialty, condition, or location..." 
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:outline-none transition-colors" 
          />
          <div className="text-xs text-gray-500 mt-2">
            Found {results.length} expert{results.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((expert, index) => (
            <motion.div
              key={expert.id}
              className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Expert Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {expert.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                </div>

                {/* Conditions */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Specializes in:</p>
                  <div className="flex flex-wrap gap-1">
                    {expert.conditions.slice(0, 3).map((condition) => (
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
                    onClick={() => alert('Connect feature coming soon!')}
                  >
                    Connect
                  </button>
                  <button 
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                    onClick={() => alert('Profile view coming soon!')}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No experts found matching your search criteria.</p>
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
    </div>
  );
}
