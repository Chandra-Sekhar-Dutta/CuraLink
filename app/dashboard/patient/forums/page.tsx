'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { addNotification } from '@/lib/notifications';
import { getResearcherIds } from '@/lib/researchers';

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

const CATEGORIES = ['Cancer Research', 'Clinical Trials Insights', 'Caregiving', 'General Health'];

export default function PatientForumsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin'); }, [status, router]);
  
  // Fetch threads from API
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch('/api/forums');
        if (response.ok) {
          const data = await response.json();
          setThreads(data.threads || []);
        }
      } catch (error) {
        console.error('Error fetching threads:', error);
      }
    };
    
    if (status === 'authenticated') {
      fetchThreads();
      // Poll for new threads/replies every 5 seconds
      const interval = setInterval(fetchThreads, 5000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const isPatient = (session?.user as any)?.userType === 'patient';

  const addThread = async () => {
    if (!title || !body) { alert('Please provide a title and content.'); return; }
    const userId = (session?.user as any)?.id || 'unknown';
    const patientName = session?.user?.name || 'A patient';
    
    const t: Thread = { 
      id: crypto.randomUUID(), 
      category, 
      title, 
      body, 
      authorType: 'patient',
      authorId: userId,
      authorName: patientName,
      replies: [] 
    };
    
    try {
      // Save to backend
      const response = await fetch('/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_thread', thread: t })
      });
      
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
        setTitle(''); 
        setBody('');
        
        // Notify researchers - get active researchers from backend
        const researchers = data.researchers || [];
        notifyResearchersFromBackend(patientName, title, category, t.id, researchers);
      } else {
        alert('Failed to post question. Please try again.');
      }
    } catch (error) {
      console.error('Error posting thread:', error);
      alert('Failed to post question. Please try again.');
    }
  };

  // Function to notify researchers using backend data
  const notifyResearchersFromBackend = (patientName: string, questionTitle: string, questionCategory: string, threadId: string, researchers: any[]) => {
    // Get researcher IDs from backend response
    const researcherIds = researchers.map(r => r.userId);
    
    // Fallback to localStorage if no researchers from backend
    if (researcherIds.length === 0) {
      const localIds = getResearcherIds();
      researcherIds.push(...localIds);
    }
    
    // If still no researchers, use fallback
    if (researcherIds.length === 0) {
      researcherIds.push('researcher-general');
    }
    
    // Send notification to each researcher
    researcherIds.forEach(researcherId => {
      addNotification(researcherId, {
        type: 'forum_reply',
        title: 'New Patient Question',
        message: `${patientName} asked: "${questionTitle}" in ${questionCategory}`,
        link: '/dashboard/researcher/forums',
        metadata: { threadId, category: questionCategory, questionTitle }
      });
    });
  };

  const toggleThread = (threadId: string) => {
    const next = new Set(expandedThreads);
    if (next.has(threadId)) {
      next.delete(threadId);
    } else {
      next.add(threadId);
    }
    setExpandedThreads(next);
  };

  const grouped = useMemo(() => {
    const map: Record<string, Thread[]> = {};
    for (const c of CATEGORIES) map[c] = [];
    for (const t of threads) {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    }
    return map;
  }, [threads]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Forums</h1>
          <p className="text-gray-700">Ask questions and get answers from researchers. Only researchers can reply.</p>
        </div>

        {/* Composer for patients */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-sm font-semibold text-gray-800">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm font-semibold text-gray-800">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., How to interpret trial eligibility?" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
            </div>
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your question..." rows={4} className="mt-3 w-full border-2 border-gray-200 rounded-xl px-4 py-2" />
          <div className="flex justify-end mt-3">
            <button onClick={addThread} className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-shadow">Post question</button>
          </div>
        </div>

        {CATEGORIES.map((c) => (
          <div key={c} className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{c}</h2>
            <div className="space-y-3">
              {(grouped[c] || []).map(t => {
                const isExpanded = expandedThreads.has(t.id);
                return (
                  <motion.div key={t.id} className="bg-white rounded-2xl border-2 border-gray-100 p-4">
                    <div className="font-semibold text-gray-900">{t.title}</div>
                    <div className="text-xs text-gray-500 mb-2">Posted by {t.authorType}</div>
                    <div className="text-sm text-gray-700 mb-3">{t.body}</div>
                    
                    {/* Reply count and expand button */}
                    <button
                      onClick={() => toggleThread(t.id)}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1 mb-2"
                    >
                      {t.replies.length} repl{t.replies.length === 1 ? 'y' : 'ies'}
                      <svg 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Replies section */}
                    {isExpanded && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        {t.replies.length > 0 ? (
                          t.replies.map(r => (
                            <div key={r.id} className="text-sm rounded-lg p-3 bg-indigo-50 border-l-4 border-indigo-500">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-indigo-700">
                                  👨‍⚕️ Researcher
                                  {r.authorName ? ` - ${r.authorName}` : ''}
                                </span>
                              </div>
                              <div className="text-gray-800">{r.body}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4">
                            No replies yet. Researchers will respond to your question soon.
                          </div>
                        )}
                        
                        {/* Info message - no reply input for patients */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800">
                              <span className="font-semibold">Note:</span> Only researchers can reply to questions. They will provide expert answers to help you.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {(grouped[c] || []).length === 0 && <div className="text-sm text-gray-600">No threads yet.</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
