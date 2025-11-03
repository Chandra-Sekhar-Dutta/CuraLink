'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getFavorites, toggleFavorite } from '@/lib/favorites';
import { summarize } from '@/lib/ai';

type PhaseFilter = 'All' | 'Phase I' | 'Phase II' | 'Phase III' | 'Completed';
type StatusFilter = 'All' | 'Recruiting' | 'Active' | 'Completed' | 'Not Recruiting';

export default function PatientTrialsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [global, setGlobal] = useState(false);
  const [phase, setPhase] = useState<PhaseFilter>('All');
  const [recruit, setRecruit] = useState<StatusFilter>('All');
  const [favIds, setFavIds] = useState<string[]>([]);
  const [realTrials, setRealTrials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conditions, setConditions] = useState<string[]>([]);

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin'); }, [status, router]);
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem('patientProfile');
      if (raw) {
        const p = JSON.parse(raw);
        setCity(p.city || '');
        setCountry(p.country || '');
        setGlobal(!!p.showGlobal);
        if (p.conditions?.length) {
          setConditions(p.conditions);
          setQuery(p.conditions.join(' '));
        } else {
          // If no conditions, fetch trials for common diseases
          setConditions(['cancer', 'diabetes', 'heart disease']);
          setGlobal(true);
        }
      } else {
        // No profile, fetch common trials
        setConditions(['cancer', 'diabetes', 'heart disease']);
        setGlobal(true);
      }
    } catch {
      // On error, fetch common trials
      setConditions(['cancer', 'diabetes', 'heart disease']);
      setGlobal(true);
    }
    setFavIds(getFavorites('trials'));
  }, []);

  // Fetch real trials when conditions change or query changes
  useEffect(() => {
    const fetchTrials = async () => {
      setIsLoading(true);
      try {
        // Use query if provided, otherwise use conditions
        const searchTerms = query.trim() ? query.split(/[\s,]+/).filter(Boolean) : conditions;
        
        if (searchTerms.length === 0) {
          setRealTrials([]);
          setIsLoading(false);
          return;
        }

        const params = new URLSearchParams({
          conditions: searchTerms.join(','),
          maxResults: '50'
        });
        
        if (city && !global) {
          params.append('location', city);
        }
        
        const response = await fetch(`/api/external-data/clinical-trials?${params}`);
        if (response.ok) {
          const data = await response.json();
          setRealTrials(data.trials || []);
        }
      } catch (error) {
        console.error('Error fetching trials:', error);
        setRealTrials([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(() => {
      fetchTrials();
    }, 800);

    return () => clearTimeout(timer);
  }, [conditions, query, city, global]);

  const results = useMemo(() => {
    // Always use real data
    const dataSource = realTrials.map((t: any) => ({
      id: t.id,
      name: t.title,
      conditions: t.conditions || [],
      city: t.city || 'Not specified',
      country: t.country || 'Not specified',
      phase: t.phase,
      status: t.status,
      contactEmail: '',
      description: t.description || '',
    }));
    
    // Apply filters
    const match = (t: any) => (
      (phase === 'All' || t.phase === phase) &&
      (recruit === 'All' || t.status === recruit) &&
      (global || (!city || t.city.toLowerCase().includes(city.toLowerCase())) && (!country || t.country.toLowerCase().includes(country.toLowerCase())))
    );
    
    return dataSource.filter(match);
  }, [realTrials, phase, recruit, city, country, global]);

  const handleFavorite = (id: string) => {
    const added = toggleFavorite('trials', id);
    const next = new Set(favIds);
    if (added) next.add(id); else next.delete(id);
    setFavIds(Array.from(next));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Clinical Trials</h1>
          <p className="text-gray-700 mt-2">
            {realTrials.length > 0 
              ? `Showing ${realTrials.length} real clinical trials from ClinicalTrials.gov`
              : 'Search for clinical trials by typing keywords or conditions'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-800">Search Keywords</label>
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="e.g., Cancer, Diabetes, Heart Disease, Fever, Rashes" 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" 
              />
              {isLoading && (
                <div className="text-xs text-pink-600 mt-1">🔍 Searching ClinicalTrials.gov...</div>
              )}
              {!query && (
                <div className="text-xs text-gray-500 mt-1">💡 Type a condition to search for clinical trials</div>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">Phase</label>
              <select value={phase} onChange={(e) => setPhase(e.target.value as PhaseFilter)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2">
                {['All','Phase I','Phase II','Phase III','Completed'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">Status</label>
              <select value={recruit} onChange={(e) => setRecruit(e.target.value as StatusFilter)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2">
                {['All','Recruiting','Active','Completed','Not Recruiting'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
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
          <label className="inline-flex items-center gap-2 mt-3">
            <input type="checkbox" checked={global} onChange={(e) => setGlobal(e.target.checked)} />
            <span className="text-sm text-gray-700">Show globally (ignore location)</span>
          </label>
          {realTrials.length > 0 && (
            <div className="mt-2 text-xs text-green-600 font-semibold">
              ✓ Showing {realTrials.length} real trials from ClinicalTrials.gov
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading clinical trials from ClinicalTrials.gov...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((t) => (
              <motion.div key={t.id} className="bg-white rounded-2xl border-2 border-gray-100 p-4 hover:border-pink-300 transition-colors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        {t.phase}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.status === 'Recruiting' ? 'bg-green-100 text-green-700' : 
                        t.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">📍 {t.city}, {t.country}</div>
                    {t.description && (
                      <div className="text-sm text-gray-700 mt-2">{summarize(t.description, 160)}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <button onClick={() => handleFavorite(t.id)} className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${favIds.includes(t.id) ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}>{favIds.includes(t.id) ? 'Saved' : 'Save'}</button>
                    {t.contactEmail && (
                      <a href={`mailto:${t.contactEmail}`} className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap">Email admin</a>
                    )}
                    <a href={`https://clinicaltrials.gov/search?id=${t.id}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 whitespace-nowrap">View on CT.gov</a>
                  </div>
                </div>
              </motion.div>
            ))}
            {!isLoading && results.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-100">
                <div className="text-6xl mb-4">🔬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No trials found</h3>
                {realTrials.length === 0 ? (
                  <div>
                    <p className="text-gray-600 text-sm mb-2">No clinical trials match your search.</p>
                    <p className="text-gray-500 text-xs">Try different keywords like "cancer", "diabetes", "heart disease", etc.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 text-sm mb-2">No trials match your current filters.</p>
                    <p className="text-gray-500 text-xs">Try adjusting phase, status, or location filters.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
