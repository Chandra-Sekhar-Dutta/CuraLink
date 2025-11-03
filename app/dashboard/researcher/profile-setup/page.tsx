'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PUBLICATIONS } from '@/lib/mockData';
import { summarize } from '@/lib/ai';

type Profile = {
  specialties: string[];
  interests: string[];
  orcid?: string;
  researchGate?: string;
  availableForMeetings?: boolean;
};

const KEY = 'researcherProfile';

export default function ResearcherProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({ specialties: [], interests: [], availableForMeetings: true });
  const [specInput, setSpecInput] = useState('');
  const [intInput, setIntInput] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
  }, [status, router]);

  // Load existing profile from localStorage
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setProfile(JSON.parse(raw)); } catch {}
  }, []);

  // Load existing profile from server (override local)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/researcher/profile', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) {
            setProfile((prev) => ({
              ...prev,
              ...data.profile,
              specialties: data.profile.specialties || [],
              interests: data.profile.interests || [],
            }));
          }
        }
      } catch {}
    })();
  }, []);

  const save = async () => {
    try {
      // Save locally for instant UX
      localStorage.setItem(KEY, JSON.stringify(profile));
      
      // Persist to server
      await fetch('/api/researcher/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialties: profile.specialties,
          interests: profile.interests,
          orcid: profile.orcid,
          researchGate: profile.researchGate,
          availableForMeetings: profile.availableForMeetings,
        }),
      }).catch(() => {});
    } catch {}
    router.push('/dashboard/researcher');
  };

  const addSpec = () => {
    const v = specInput.trim(); if (!v) return; setProfile(p => ({ ...p, specialties: Array.from(new Set([...(p.specialties||[]), v])) })); setSpecInput('');
  };
  const addInt = () => {
    const v = intInput.trim(); if (!v) return; setProfile(p => ({ ...p, interests: Array.from(new Set([...(p.interests||[]), v])) })); setIntInput('');
  };

  const suggestedPubs = useMemo(() => {
    const keys = new Set([...(profile.specialties||[]), ...(profile.interests||[])]);
    if (keys.size === 0) return PUBLICATIONS.slice(0, 5);
    const q = Array.from(keys).map(s => s.toLowerCase());
    return PUBLICATIONS.filter(p => q.some(k => p.title.toLowerCase().includes(k) || p.conditions.some(c => c.toLowerCase().includes(k)))).slice(0, 6);
  }, [profile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Researcher Profile Setup</h1>
          <p className="text-gray-700">Provide your specialties and interests. Optionally add ORCID/ResearchGate to auto-import later.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Specialties</label>
            <div className="flex gap-2">
              <input value={specInput} onChange={(e) => setSpecInput(e.target.value)} placeholder="e.g., Oncology, Neurology" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2" />
              <button onClick={addSpec} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(profile.specialties||[]).map(s => (
                <span key={s} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Research Interests</label>
            <div className="flex gap-2">
              <input value={intInput} onChange={(e) => setIntInput(e.target.value)} placeholder="e.g., Immunotherapy, Clinical AI, Gene Therapy" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2" />
              <button onClick={addInt} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(profile.interests||[]).map(s => (
                <span key={s} className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">{s}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">ORCID (optional)</label>
              <input value={profile.orcid || ''} onChange={(e) => setProfile(p => ({ ...p, orcid: e.target.value }))} placeholder="0000-0000-0000-0000" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">ResearchGate (optional)</label>
              <input value={profile.researchGate || ''} onChange={(e) => setProfile(p => ({ ...p, researchGate: e.target.value }))} placeholder="profile url" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Availability</label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={!!profile.availableForMeetings} onChange={(e) => setProfile(p => ({ ...p, availableForMeetings: e.target.checked }))} />
                <span className="text-sm text-gray-700">Available for meetings</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={save} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">Save and go to Dashboard</button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Your Publications (AI summaries)</h2>
          <div className="space-y-3">
            {suggestedPubs.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border-2 border-gray-100 p-4">
                <div className="font-semibold text-gray-900">{p.title}</div>
                <div className="text-xs text-gray-500">{p.year}</div>
                {p.abstract && <div className="text-sm text-gray-700 mt-2">{summarize(p.abstract, 160)}</div>}
              </div>
            ))}
            {suggestedPubs.length === 0 && <div className="text-sm text-gray-600">Add specialties or interests to see suggested publications.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
