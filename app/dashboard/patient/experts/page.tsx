'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EXPERTS, Expert } from '@/lib/mockData';
import { getFavorites, toggleFavorite } from '@/lib/favorites';

interface RealExpert {
  id: string;
  name: string;
  orcidId?: string;
  specialty: string;
  conditions: string[];
  city: string;
  country: string;
  active: boolean;
  email?: string;
  affiliation?: string;
  publicationCount?: number;
  url?: string;
}

export default function PatientExpertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [global, setGlobal] = useState(false);
  const [meetingExpert, setMeetingExpert] = useState<Expert | RealExpert | null>(null);
  const [meetingForm, setMeetingForm] = useState({ name: '', contact: '', notes: '' });
  const [favIds, setFavIds] = useState<string[]>([]);
  const [realExperts, setRealExperts] = useState<RealExpert[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(false);
  const [useRealData, setUseRealData] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  // Load defaults from patient profile
  useEffect(() => {
    try {
      const raw = localStorage.getItem('patientProfile');
      if (raw) {
        const p = JSON.parse(raw);
        setCity(p.city || '');
        setCountry(p.country || '');
        setGlobal(!!p.showGlobal);
        if (p.conditions?.length) {
          const conditionsQuery = p.conditions.join(' ');
          setQuery(conditionsQuery);
          // Automatically fetch real experts based on conditions
          fetchRealExperts(p.conditions);
        } else {
          // If no conditions, enable global view to show mock experts
          setGlobal(true);
        }
      } else {
        // If no profile, enable global view to show mock experts
        setGlobal(true);
      }
    } catch {
      // On error, enable global view
      setGlobal(true);
    }
    setFavIds(getFavorites('experts'));
  }, []);

  // Fetch real experts from ORCID API
  const fetchRealExperts = async (conditions: string[]) => {
    if (conditions.length === 0) {
      setRealExperts([]);
      return;
    }
    
    setIsLoadingExperts(true);
    try {
      const response = await fetch(
        `/api/external-data/experts?conditions=${encodeURIComponent(conditions.join(','))}&maxResults=20`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRealExperts(data.experts || []);
        setUseRealData(data.experts?.length > 0);
      }
    } catch (error) {
      console.error('Error fetching experts:', error);
      setRealExperts([]);
    } finally {
      setIsLoadingExperts(false);
    }
  };

  // Trigger search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        const conditions = query.split(/[\s,]+/).filter(Boolean);
        fetchRealExperts(conditions);
      } else {
        // Clear real experts if query is empty, fall back to mock data
        setRealExperts([]);
        setUseRealData(false);
      }
    }, 800); // Debounce for 800ms
    
    return () => clearTimeout(timer);
  }, [query]);

  // Combine real and mock experts
  const allExpertsData = useMemo(() => {
    if (useRealData && realExperts.length > 0) {
      return realExperts;
    }
    return EXPERTS;
  }, [realExperts, useRealData]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    const condMatch = (e: Expert | RealExpert) => {
      if (!q) return true;
      return (
        e.conditions.some(c => c.toLowerCase().includes(q) || q.includes(c.toLowerCase())) ||
        e.specialty.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        ('affiliation' in e && e.affiliation?.toLowerCase().includes(q))
      );
    };
    
    const locMatch = (e: Expert | RealExpert) => {
      if (global) return true;
      const cityMatch = !city || e.city.toLowerCase().includes(city.toLowerCase());
      const countryMatch = !country || e.country.toLowerCase().includes(country.toLowerCase());
      return cityMatch && countryMatch;
    };
    
    return allExpertsData.filter(e => condMatch(e) && locMatch(e));
  }, [query, city, country, global, allExpertsData]);

  const handleFavorite = (id: string) => {
    const added = toggleFavorite('experts', id);
    const next = new Set(favIds);
    if (added) next.add(id); else next.delete(id);
    setFavIds(Array.from(next));
  };

  const submitMeeting = () => {
    if (!meetingExpert) return;
    if (!meetingExpert.active) {
      alert('This expert is not active on the platform. Your request has been sent to admin.');
    } else {
      if (!meetingForm.name || !meetingForm.contact) {
        alert('Please provide your name and contact.');
        return;
      }
      alert(`Meeting request sent to ${meetingExpert.name}. We will notify you at ${meetingForm.contact}.`);
    }
    setMeetingExpert(null);
    setMeetingForm({ name: '', contact: '', notes: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Health Experts</h1>
          <p className="text-gray-700">Search and follow experts. Request meetings with active experts.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-800">Search</label>
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="e.g., Glioma, Neuro-Oncology, Cancer Research" 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" 
              />
              {isLoadingExperts && (
                <div className="text-xs text-pink-600 mt-1">🔍 Searching ORCID database...</div>
              )}
              {!query && (
                <div className="text-xs text-gray-500 mt-1">💡 Type a condition to search real researchers from ORCID</div>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Boston" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., United States" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={global} onChange={(e) => setGlobal(e.target.checked)} />
              <span className="text-sm text-gray-700">Show globally (ignore location)</span>
            </label>
            {useRealData && realExperts.length > 0 && (
              <div className="text-xs text-green-600 font-semibold">
                ✓ Showing {realExperts.length} real researchers from ORCID
              </div>
            )}
            {!useRealData && results.length > 0 && (
              <div className="text-xs text-gray-600">
                Showing {results.length} sample experts
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {results.map((e) => {
            const isRealExpert = 'orcidId' in e;
            const realExpertData = isRealExpert ? (e as RealExpert) : null;
            const expertUrl = realExpertData?.url;
            
            return (
              <motion.div 
                key={e.id} 
                className="bg-white rounded-2xl border-2 border-gray-100 p-4 hover:border-pink-300 transition-colors" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-900">{e.name}</div>
                      {isRealExpert && expertUrl && (
                        <a 
                          href={expertUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 transition-colors"
                          title="View ORCID Profile"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{e.specialty}</div>
                    {realExpertData?.affiliation && (
                      <div className="text-xs text-gray-500 mt-1">🏛️ {realExpertData.affiliation}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">📍 {e.city}, {e.country}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      🔬 Research: {e.conditions.slice(0, 3).join(', ')}
                      {e.conditions.length > 3 && ` +${e.conditions.length - 3} more`}
                    </div>
                    {realExpertData?.publicationCount !== undefined && (
                      <div className="text-xs text-green-600 mt-1 font-semibold">
                        📚 {realExpertData.publicationCount} publications
                      </div>
                    )}
                    {!e.active && (
                      <div className="mt-1 text-xs text-amber-700 bg-amber-100 inline-block px-2 py-1 rounded">
                        Not active on platform — meeting requests go to admin
                      </div>
                    )}
                    {isRealExpert && (
                      <div className="mt-1 text-xs text-green-700 bg-green-100 inline-block px-2 py-1 rounded">
                        ✓ Verified ORCID researcher
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      onClick={() => handleFavorite(e.id)} 
                      className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                        favIds.includes(e.id) 
                          ? 'bg-pink-600 text-white' 
                          : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                      }`}
                    >
                      {favIds.includes(e.id) ? 'Following' : 'Follow'}
                    </button>
                    <button 
                      onClick={() => setMeetingExpert(e)} 
                      className="px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    >
                      Request meeting
                    </button>
                    {e.email && (
                      <a 
                        href={`mailto:${e.email}`} 
                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Email
                      </a>
                    )}
                    {isRealExpert && expertUrl && (
                      <a 
                        href={expertUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200"
                      >
                        ORCID Profile
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {results.length === 0 && !isLoadingExperts && (
            <div className="text-gray-600 text-sm">
              No experts match your search. Try enabling global results or adjusting keywords.
            </div>
          )}
          {isLoadingExperts && (
            <div className="flex items-center justify-center py-8">
              <div className="text-pink-600 font-semibold animate-pulse">
                Searching for experts...
              </div>
            </div>
          )}
        </div>

        {meetingExpert && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="font-bold text-lg mb-2">Request a meeting</div>
              <div className="text-sm text-gray-700 mb-4">Expert: {meetingExpert.name}</div>
              <div className="space-y-3">
                <input value={meetingForm.name} onChange={(e) => setMeetingForm({ ...meetingForm, name: e.target.value })} placeholder="Your name" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
                <input value={meetingForm.contact} onChange={(e) => setMeetingForm({ ...meetingForm, contact: e.target.value })} placeholder="Email or phone" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
                <textarea value={meetingForm.notes} onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })} placeholder="Notes (optional)" rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setMeetingExpert(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700">Cancel</button>
                <button onClick={submitMeeting} className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">Send request</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
