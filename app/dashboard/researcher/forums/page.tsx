'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { addNotification } from '@/lib/notifications';
import { registerResearcher } from '@/lib/researchers';

type Thread = {
  id: string;
  category: string;
  title: string;
  body: string;
  authorType: 'patient' | 'researcher';
  authorId?: string;
  authorName?: string;
  replies: { id: string; body: string; authorType: 'researcher' | 'patient'; authorName?: string; }[];
};

export default function ResearcherForumsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCat, setNewCat] = useState('');
  const [reply, setReply] = useState<Record<string, string>>({});

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin'); }, [status, router]);
  
  // Fetch threads and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/forums');
        if (response.ok) {
          const data = await response.json();
          setThreads(data.threads || []);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching forum data:', error);
      }
    };
    
    if (status === 'authenticated') {
      fetchData();
      // Poll for new threads/replies every 5 seconds
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Register researcher for notifications
  useEffect(() => {
    const registerToBackend = async () => {
      if (session?.user) {
        const userId = (session.user as any)?.id || session.user.email || 'unknown';
        const userName = session.user.name || 'Researcher';
        const userEmail = session.user.email || undefined;
        
        // Register in localStorage (for client-side)
        registerResearcher(userId, userName, userEmail);
        
        // Register on backend (for server-side notifications)
        try {
          await fetch('/api/forums', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'register_researcher', 
              userId, 
              userName, 
              userEmail 
            })
          });
        } catch (error) {
          console.error('Error registering researcher on backend:', error);
        }
      }
    };
    
    if (status === 'authenticated') {
      registerToBackend();
      // Re-register every 5 minutes to keep active
      const interval = setInterval(registerToBackend, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session, status]);

  const isResearcher = (session?.user as any)?.userType === 'researcher';

  const allCats = useMemo(() => {
    const base = ['Cancer Research', 'Clinical Trials Insights', 'Caregiving', 'General Health'];
    return Array.from(new Set([...base, ...categories]));
  }, [categories]);

  const grouped = useMemo(() => {
    const map: Record<string, Thread[]> = {};
    for (const c of allCats) map[c] = [];
    for (const t of threads) { if (!map[t.category]) map[t.category] = []; map[t.category].push(t); }
    return map;
  }, [threads, allCats]);

  const addCategory = async () => {
    const v = newCat.trim(); 
    if (!v) return;
    
    try {
      const response = await fetch('/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_category', category: v })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        setNewCat('');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const addReply = async (id: string) => {
    const text = (reply[id] || '').trim(); 
    if (!text) return;
    
    const thread = threads.find(t => t.id === id);
    const researcherName = session?.user?.name || 'Researcher';
    
    const newReply = { 
      id: crypto.randomUUID(), 
      body: text, 
      authorType: 'researcher' as const,
      authorName: researcherName
    };
    
    try {
      // Save reply to backend
      const response = await fetch('/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_reply', threadId: id, reply: newReply })
      });
      
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
        setReply({ ...reply, [id]: '' });
        
        // Send notification to the thread author if it's a patient
        if (thread?.authorType === 'patient' && thread.authorId) {
          addNotification(thread.authorId, {
            type: 'forum_reply',
            title: 'New Reply to Your Question',
            message: `${researcherName} replied to your question: "${thread.title}"`,
            link: '/dashboard/patient/forums',
            metadata: { threadId: id, replyText: text }
          });
        }
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to post reply. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Forums Management</h1>
          <p className="text-gray-700">Create communities and reply to patient questions. Patients can only post questions.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <div className="font-semibold mb-2">Create a new community</div>
          <div className="flex gap-2">
            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g., Neuro-Oncology" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2" />
            <button onClick={addCategory} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Create</button>
          </div>
          <div className="text-xs text-gray-600 mt-2">Patients can post questions. Only researchers can reply to those questions.</div>
        </div>

        {allCats.map((c) => (
          <div key={c} className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{c}</h2>
            <div className="space-y-3">
              {(grouped[c] || []).map(t => (
                <motion.div key={t.id} className="bg-white rounded-2xl border-2 border-gray-100 p-4">
                  <div className="font-semibold text-gray-900">{t.title}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    Posted by {t.authorType}
                    {t.authorName ? ` - ${t.authorName}` : ''}
                  </div>
                  <div className="text-sm text-gray-700">{t.body}</div>
                  <div className="mt-3 space-y-2">
                    {t.replies.map(r => (
                      <div key={r.id} className="text-sm bg-indigo-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-indigo-700">
                            {r.authorType === 'researcher' ? '👨‍⚕️ Researcher' : '🧑 Patient'}
                            {r.authorName ? ` - ${r.authorName}` : ''}
                          </span>
                        </div>
                        <div className="text-gray-800">{r.body}</div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input value={reply[t.id] || ''} onChange={(e) => setReply({ ...reply, [t.id]: e.target.value })} placeholder="Write a reply..." className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2" />
                      <button onClick={() => addReply(t.id)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Reply</button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {(grouped[c] || []).length === 0 && <div className="text-sm text-gray-600">No threads yet.</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
