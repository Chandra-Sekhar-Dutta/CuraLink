'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getFavorites } from '@/lib/favorites';
import { EXPERTS, TRIALS, PUBLICATIONS } from '@/lib/mockData';

export default function PatientFavoritesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [fav, setFav] = useState({ experts: [] as string[], trials: [] as string[], publications: [] as string[] });

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin'); }, [status, router]);
  useEffect(() => {
    setFav({
      experts: getFavorites('experts'),
      trials: getFavorites('trials'),
      publications: getFavorites('publications'),
    });
  }, []);

  const expertItems = useMemo(() => EXPERTS.filter(e => fav.experts.includes(e.id)), [fav.experts]);
  const trialItems = useMemo(() => TRIALS.filter(t => fav.trials.includes(t.id)), [fav.trials]);
  const pubItems = useMemo(() => PUBLICATIONS.filter(p => fav.publications.includes(p.id)), [fav.publications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">My Favorites</h1>
          <p className="text-gray-700">Saved experts, clinical trials, and publications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="font-bold mb-3">Experts</h2>
            <div className="space-y-2">
              {expertItems.map(e => (
                <div key={e.id} className="text-sm text-gray-800">{e.name} • {e.specialty}</div>
              ))}
              {expertItems.length === 0 && <div className="text-sm text-gray-500">No saved experts.</div>}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="font-bold mb-3">Clinical Trials</h2>
            <div className="space-y-2">
              {trialItems.map(t => (
                <div key={t.id} className="text-sm text-gray-800">{t.name} • {t.phase}</div>
              ))}
              {trialItems.length === 0 && <div className="text-sm text-gray-500">No saved trials.</div>}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="font-bold mb-3">Publications</h2>
            <div className="space-y-2">
              {pubItems.map(p => (
                <div key={p.id} className="text-sm text-gray-800">{p.title}</div>
              ))}
              {pubItems.length === 0 && <div className="text-sm text-gray-500">No saved publications.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
