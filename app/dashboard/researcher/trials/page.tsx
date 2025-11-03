'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { summarize } from '@/lib/ai';

type Trial = {
  id: string;
  name: string;
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Completed';
  status: 'Recruiting' | 'Active' | 'Completed' | 'Not Recruiting';
  eligibility: string;
  description: string;
  participants?: number;
};

const KEY = 'researcherTrials';

function load(): Trial[] { try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } }
function save(list: Trial[]) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} }

export default function ManageTrialsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [trials, setTrials] = useState<Trial[]>([]);
  const [form, setForm] = useState<Partial<Trial>>({ name: '', phase: 'Phase I', status: 'Recruiting', eligibility: '', description: '' });
  const [filter, setFilter] = useState<'All' | Trial['status']>('All');

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin'); }, [status, router]);
  useEffect(() => { setTrials(load()); }, []);

  const addTrial = () => {
    if (!form.name || !form.eligibility || !form.description) { alert('Please complete required fields.'); return; }
    const t: Trial = {
      id: crypto.randomUUID(),
      name: form.name as string,
      phase: (form.phase as any) || 'Phase I',
      status: (form.status as any) || 'Recruiting',
      eligibility: form.eligibility as string,
      description: form.description as string,
      participants: form.participants || 0,
    };
    const next = [t, ...trials];
    setTrials(next); save(next); setForm({ name: '', phase: 'Phase I', status: 'Recruiting', eligibility: '', description: '' });
  };

  const updateStatus = (id: string, status: Trial['status']) => {
    const next = trials.map(t => t.id === id ? { ...t, status } : t); setTrials(next); save(next);
  };

  const updateParticipants = (id: string, delta: number) => {
    const next = trials.map(t => t.id === id ? { ...t, participants: Math.max(0, (t.participants||0) + delta) } : t); setTrials(next); save(next);
  };

  const visible = useMemo(() => filter === 'All' ? trials : trials.filter(t => t.status === filter), [filter, trials]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Manage Clinical Trials</h1>
          <p className="text-gray-700">Add new trials, update status and participants. AI summaries help communicate key points.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-800">Trial Name</label>
              <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-800">Phase</label>
                <select value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value as Trial['phase'] })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2">
                  {['Phase I','Phase II','Phase III','Completed'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Trial['status'] })} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2">
                  {['Recruiting','Active','Completed','Not Recruiting'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">Eligibility</label>
              <textarea value={form.eligibility || ''} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800">Description</label>
              <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={addTrial} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold">Add Trial</button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Your Trials</div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="border-2 border-gray-200 rounded-xl px-3 py-2">
            {['All','Recruiting','Active','Completed','Not Recruiting'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {visible.map(t => (
            <motion.div key={t.id} className="bg-white rounded-2xl border-2 border-gray-100 p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.phase} • {t.status} • Participants: {t.participants || 0}</div>
                  <div className="text-sm text-gray-700 mt-2">Eligibility: {t.eligibility}</div>
                  <div className="text-sm text-gray-700 mt-1">Summary: {summarize(t.description, 160)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value as Trial['status'])} className="border-2 border-gray-200 rounded-xl px-3 py-2">
                    {['Recruiting','Active','Completed','Not Recruiting'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => updateParticipants(t.id, 1)} className="px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700">+1</button>
                  <button onClick={() => updateParticipants(t.id, -1)} className="px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700">-1</button>
                </div>
              </div>
            </motion.div>
          ))}
          {visible.length === 0 && <div className="text-sm text-gray-600">No trials yet. Add your first trial above.</div>}
        </div>
      </div>
    </div>
  );
}
