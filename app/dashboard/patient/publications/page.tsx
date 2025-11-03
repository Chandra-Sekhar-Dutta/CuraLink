'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getFavorites, toggleFavorite } from '@/lib/favorites';
import { summarize } from '@/lib/ai';

export default function PatientPublicationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [favIds, setFavIds] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [realPublications, setRealPublications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin'); }, [status, router]);
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem('patientProfile');
      if (raw) {
        const p = JSON.parse(raw);
        if (p.conditions?.length) {
          setConditions(p.conditions);
          setQuery(p.conditions.join(' '));
        } else {
          // If no conditions, search for common medical topics
          setConditions(['medicine', 'health', 'treatment']);
        }
      } else {
        // No profile, search for common medical topics
        setConditions(['medicine', 'health', 'treatment']);
      }
    } catch {
      // On error, search for common medical topics
      setConditions(['medicine', 'health', 'treatment']);
    }
    setFavIds(getFavorites('publications'));
  }, []);

  // Fetch real publications when conditions change or query changes
  useEffect(() => {
    const fetchPublications = async () => {
      setIsLoading(true);
      try {
        // Use query if provided, otherwise use conditions
        const searchTerms = query.trim() ? query.split(/[\s,]+/).filter(Boolean) : conditions;
        
        if (searchTerms.length === 0) {
          setRealPublications([]);
          setIsLoading(false);
          return;
        }

        const params = new URLSearchParams({
          conditions: searchTerms.join(','),
          maxResults: '30'
        });
        
        const response = await fetch(`/api/external-data/publications?${params}`);
        if (response.ok) {
          const data = await response.json();
          setRealPublications(data.publications || []);
        }
      } catch (error) {
        console.error('Error fetching publications:', error);
        setRealPublications([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(() => {
      fetchPublications();
    }, 800);

    return () => clearTimeout(timer);
  }, [conditions, query]);

  const results = useMemo(() => {
    // Always use real data
    return realPublications.map(p => ({
      ...p,
      url: p.url || `https://pubmed.ncbi.nlm.nih.gov/${p.id.replace('pmid-', '')}/`,
      conditions: p.conditions || conditions,
    }));
  }, [realPublications, conditions]);

  const handleFavorite = (id: string) => {
    const added = toggleFavorite('publications', id);
    const next = new Set(favIds);
    if (added) next.add(id); else next.delete(id);
    setFavIds(Array.from(next));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Research Publications</h1>
          <p className="text-gray-700 mt-2">
            {realPublications.length > 0 
              ? `Showing ${realPublications.length} real publications from PubMed. Click to read full articles.`
              : 'Search for medical research publications by typing keywords or conditions'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <label className="text-sm font-semibold text-gray-800">Search Keywords</label>
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="e.g., Cancer Treatment, Diabetes Research, Heart Disease" 
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500" 
          />
          {isLoading && (
            <div className="text-xs text-pink-600 mt-1">🔍 Searching PubMed database...</div>
          )}
          {!query && (
            <div className="text-xs text-gray-500 mt-1">💡 Type keywords to search for medical research publications</div>
          )}
          {realPublications.length > 0 && (
            <div className="mt-2 text-xs text-green-600 font-semibold">
              ✓ Showing {realPublications.length} real publications from PubMed
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading publications from PubMed...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((p) => (
              <motion.div key={p.id} className="bg-white rounded-2xl border-2 border-gray-100 p-4 hover:border-pink-300 transition-colors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:underline hover:text-pink-600">{p.title}</a>
                    <div className="text-xs text-gray-500 mt-1">
                      {p.journal && <span className="font-medium">{p.journal} • </span>}
                      {p.conditions?.join(', ')} • {p.year}
                    </div>
                    {p.authors && p.authors.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {p.authors.slice(0, 3).join(', ')}
                        {p.authors.length > 3 && ' et al.'}
                      </div>
                    )}
                    {p.abstract && <div className="text-sm text-gray-700 mt-2">{summarize(p.abstract, 160)}</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleFavorite(p.id)} className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${favIds.includes(p.id) ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'}`}>{favIds.includes(p.id) ? 'Saved' : 'Save'}</button>
                    <a href={`https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap">Find full text</a>
                  </div>
                </div>
              </motion.div>
            ))}
            {!isLoading && results.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-100">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No publications found</h3>
                {realPublications.length === 0 ? (
                  <div>
                    <p className="text-gray-600 text-sm mb-2">No publications match your search.</p>
                    <p className="text-gray-500 text-xs">Try different keywords like "cancer treatment", "diabetes research", etc.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 text-sm mb-2">No publications found for your query.</p>
                    <p className="text-gray-500 text-xs">Try different search terms or broaden your keywords.</p>
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
