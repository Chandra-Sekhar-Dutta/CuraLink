'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ClinicalTrialsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    condition: '',
    location: '',
    status: 'all'
  });
  const [profile, setProfile] = useState<any>(null);

  // Load patient profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/patient/profile', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          if (data.profile?.conditions?.[0]) {
            setFilters(prev => ({ ...prev, condition: data.profile.conditions[0] }));
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, []);

  // Fetch trials
  useEffect(() => {
    const fetchTrials = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.condition) params.append('conditions', filters.condition);
        if (filters.location) params.append('location', filters.location);
        params.append('maxResults', '20');

        const response = await fetch(`/api/external-data/clinical-trials?${params}`);
        if (response.ok) {
          const data = await response.json();
          setTrials(data.trials || []);
        }
      } catch (error) {
        console.error('Error fetching trials:', error);
      } finally {
        setLoading(false);
      }
    };

    if (filters.condition) {
      fetchTrials();
    }
  }, [filters.condition, filters.location]);

  const filteredTrials = filters.status === 'all' 
    ? trials 
    : trials.filter(t => t.status?.toLowerCase() === filters.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Find Clinical Trials</h1>
          <p className="text-gray-600 mt-2">Discover research studies that match your health conditions</p>
        </div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Search Filters</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
              <input
                type="text"
                value={filters.condition}
                onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                placeholder="e.g., Diabetes, Cancer"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="City, State, or ZIP"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="recruiting">Recruiting</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-gray-700">
              Found <span className="font-bold text-indigo-600">{filteredTrials.length}</span> clinical trials
            </div>

            <div className="grid gap-6">
              {filteredTrials.map((trial, index) => (
                <motion.div
                  key={trial.id || index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{trial.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                          {trial.status || 'Recruiting'}
                        </span>
                        {trial.phase && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                            {trial.phase}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">{trial.description || trial.summary}</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {trial.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">📍</span>
                        <span>{trial.location}</span>
                      </div>
                    )}
                    {trial.sponsor && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">🏥</span>
                        <span>{trial.sponsor}</span>
                      </div>
                    )}
                    {trial.conditions && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">🔬</span>
                        <span>{trial.conditions.join(', ')}</span>
                      </div>
                    )}
                    {trial.enrollment && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">👥</span>
                        <span>{trial.enrollment} participants</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {trial.url && (
                      <a
                        href={trial.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-center transition-all"
                      >
                        View Details
                      </a>
                    )}
                    <button
                      onClick={() => alert('Contact feature coming soon! For now, please use the "View Details" link.')}
                      className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-4 rounded-xl transition-all"
                    >
                      Express Interest
                    </button>
                  </div>
                </motion.div>
              ))}

              {filteredTrials.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No trials found</h3>
                  <p className="text-gray-600">Try adjusting your search filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
