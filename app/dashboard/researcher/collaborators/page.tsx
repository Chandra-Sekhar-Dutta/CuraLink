'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EXPERTS } from '@/lib/mockData';

const KEY = 'collabRequests';

export default function CollaboratorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [requests, setRequests] = useState<Record<string, boolean>>({});

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin'); }, [status, router]);
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setRequests(JSON.parse(raw)); } catch {} }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXPERTS.filter(r => !q || r.name.toLowerCase().includes(q) || r.specialty.toLowerCase().includes(q) || r.conditions.some(c => c.toLowerCase().includes(q)));
  }, [query]);

  const sendRequest = (id: string) => {
    const next = { ...requests, [id]: true };
    setRequests(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    alert('Connection request sent. You can chat once accepted.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Collaborators</h1>
          <p className="text-gray-700">Search global collaborators by specialty or keywords. Send connection requests.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <label className="text-sm font-semibold text-gray-800">Search</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., Immunology, Glioma" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
        </div>

        <div className="space-y-3">
          {results.map((r) => (
            <motion.div key={r.id} className="bg-white rounded-2xl border-2 border-gray-100 p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{r.name}</div>
                  <div className="text-sm text-gray-600">{r.specialty}</div>
                  <div className="text-xs text-gray-500">{r.city}, {r.country} • {r.conditions.join(', ')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button disabled={!!requests[r.id]} onClick={() => sendRequest(r.id)} className={`px-3 py-2 rounded-lg text-sm font-semibold ${requests[r.id] ? 'bg-gray-100 text-gray-600' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>{requests[r.id] ? 'Requested' : 'Connect'}</button>
                </div>
              </div>
            </motion.div>
          ))}
          {results.length === 0 && <div className="text-sm text-gray-600">No collaborators found.</div>}
        </div>
      </div>
    </div>
  );
}
