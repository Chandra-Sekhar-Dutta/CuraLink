'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

interface PatientProfile {
  conditionNarrative: string;
  conditions: string[];
  city: string;
  country: string;
  showGlobal: boolean; // ignore location filter
}

const KNOWN_CONDITIONS: { key: string; labels: string[] }[] = [
  { key: 'Brain Cancer', labels: ['brain cancer', 'cns cancer', 'brain tumour', 'brain tumor'] },
  { key: 'Glioma', labels: ['glioma', 'gbm', 'glioblastoma'] },
  { key: 'Lung Cancer', labels: ['lung cancer', 'nsclc', 'small cell lung', 'non small cell'] },
  { key: 'Breast Cancer', labels: ['breast cancer'] },
  { key: 'Diabetes', labels: ['diabetes', 'type 2 diabetes', 't2d', 'diabetic'] },
  { key: 'Malaria', labels: ['malaria', 'plasmodium', 'tropical disease'] },
  { key: 'Dwarfism', labels: ['dwarfism', 'achondroplasia', 'short stature', 'growth hormone'] },
  { key: 'Tuberculosis', labels: ['tuberculosis', 'tb', 'mycobacterium'] },
  { key: 'Alzheimer', labels: ['alzheimer', 'dementia', 'cognitive decline'] },
  { key: 'Parkinson', labels: ['parkinson', 'parkinsons', 'movement disorder'] },
  { key: 'Asthma', labels: ['asthma', 'bronchial', 'respiratory'] },
  { key: 'Arthritis', labels: ['arthritis', 'rheumatoid', 'joint pain'] },
  { key: 'Hypertension', labels: ['hypertension', 'high blood pressure', 'elevated bp'] },
  { key: 'Depression', labels: ['depression', 'depressive disorder', 'mood disorder'] },
  { key: 'Anxiety', labels: ['anxiety', 'panic disorder', 'gad'] },
  { key: 'Obesity', labels: ['obesity', 'overweight', 'weight management'] },
  { key: 'Stroke', labels: ['stroke', 'cerebrovascular', 'brain attack'] },
  { key: 'Heart Disease', labels: ['heart disease', 'cardiovascular', 'coronary', 'cardiac'] },
  { key: 'Epilepsy', labels: ['epilepsy', 'seizure', 'seizure disorder'] },
  { key: 'Migraine', labels: ['migraine', 'chronic headache'] },
  { key: 'Lupus', labels: ['lupus', 'sle', 'systemic lupus'] },
  { key: 'Celiac Disease', labels: ['celiac', 'coeliac', 'gluten intolerance'] },
  { key: 'Crohn Disease', labels: ['crohn', 'crohns', 'ibd', 'inflammatory bowel'] },
  { key: 'Psoriasis', labels: ['psoriasis', 'skin disorder'] },
  { key: 'Hepatitis', labels: ['hepatitis', 'liver inflammation'] },
  { key: 'HIV', labels: ['hiv', 'aids', 'human immunodeficiency'] },
  { key: 'Leukemia', labels: ['leukemia', 'blood cancer', 'leukaemia'] },
  { key: 'Lymphoma', labels: ['lymphoma', 'non-hodgkin', 'hodgkin'] },
  { key: 'Anemia', labels: ['anemia', 'anaemia', 'iron deficiency'] },
  { key: 'Thyroid Disorder', labels: ['thyroid', 'hypothyroid', 'hyperthyroid'] },
  { key: 'Kidney Disease', labels: ['kidney disease', 'renal', 'nephropathy'] },
  { key: 'Liver Disease', labels: ['liver disease', 'cirrhosis', 'hepatic'] },
];

function extractConditions(narrative: string): string[] {
  const text = narrative.toLowerCase();
  const found = new Set<string>();
  for (const cond of KNOWN_CONDITIONS) {
    if (cond.labels.some(label => text.includes(label))) {
      found.add(cond.key);
    }
  }
  return Array.from(found);
}

export default function PatientProfileSetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSpellChecking, setIsSpellChecking] = useState(false);
  const [spellCheckResults, setSpellCheckResults] = useState<{ [key: string]: string }>({});

  const [profile, setProfile] = useState<PatientProfile>({
    conditionNarrative: '',
    conditions: [],
    city: '',
    country: '',
    showGlobal: false,
  });

  // Load existing from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('patientProfile');
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfile((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  // Load existing from server (override local)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/patient/profile', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) {
            setProfile((prev) => ({
              ...prev,
              ...data.profile,
              conditions: data.profile.conditions || [],
            }));
          }
        }
      } catch {}
    })();
  }, []);

  // Role guard: allow only patients
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const userType = (session?.user as any)?.userType;
      if (userType === 'researcher') {
        router.push('/dashboard/researcher');
      }
    }
  }, [status, session, router]);

  const suggestedConditions = useMemo(() => {
    if (!profile.conditionNarrative.trim()) return [] as string[];
    const extracted = extractConditions(profile.conditionNarrative);
    // return only those not already in list
    return extracted.filter(e => !profile.conditions.includes(e));
  }, [profile.conditionNarrative, profile.conditions]);

  const addCondition = (c: string) => {
    const val = c.trim();
    if (!val) return;
    setProfile(p => ({ ...p, conditions: Array.from(new Set([...p.conditions, val])) }));
  };

  const addConditionWithSpellCheck = async (c: string) => {
    const val = c.trim();
    if (!val) return;
    
    setIsSpellChecking(true);
    try {
      // Check if already spell-checked
      const corrected = spellCheckResults[val.toLowerCase()];
      if (corrected) {
        addCondition(corrected);
        setIsSpellChecking(false);
        return;
      }

      // Call spell check API
      const response = await fetch('/api/spell-correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: val }),
      });

      if (response.ok) {
        const data = await response.json();
        const correctedTerm = data.correctedTerm || val;
        
        // Store result for future use
        setSpellCheckResults(prev => ({
          ...prev,
          [val.toLowerCase()]: correctedTerm
        }));

        // Show notification if corrected
        if (data.wasCorrected) {
          console.log(`Spell corrected: "${val}" → "${correctedTerm}"`);
        }

        addCondition(correctedTerm);
      } else {
        addCondition(val);
      }
    } catch (error) {
      console.error('Spell check error:', error);
      addCondition(val); // Add anyway if spell check fails
    } finally {
      setIsSpellChecking(false);
    }
  };

  const removeCondition = (c: string) => {
    setProfile(p => ({ ...p, conditions: p.conditions.filter(x => x !== c) }));
  };

  const handleSave = async () => {
    try {
      // Save locally for instant UX
      localStorage.setItem('patientProfile', JSON.stringify(profile));
      // Persist to server (best effort)
      await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conditionNarrative: profile.conditionNarrative,
          conditions: profile.conditions,
          city: profile.city,
          country: profile.country,
          showGlobal: profile.showGlobal,
        }),
      }).catch(() => {});
    } catch {}
    router.push('/dashboard/patient');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
            Patient Profile Setup
          </h1>
          <p className="text-gray-700 mt-2">Tell us about your health condition and where you're located to personalize your dashboard.</p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="space-y-8">
            {/* Natural Language Input */}
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">Describe your condition (natural language)</label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={4}
                placeholder="e.g., I have Brain Cancer and recently diagnosed with Glioblastoma."
                value={profile.conditionNarrative}
                onChange={(e) => setProfile(p => ({ ...p, conditionNarrative: e.target.value }))}
              />
              {suggestedConditions.length > 0 && (
                <div className="text-sm text-gray-600">
                  Suggested conditions:
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestedConditions.map((c) => (
                      <button
                        key={c}
                        onClick={() => addConditionWithSpellCheck(c)}
                        disabled={isSpellChecking}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          isSpellChecking
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                        }`}
                      >
                        + {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Conditions chips */}
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">Conditions of interest</label>
              <p className="text-xs text-gray-500">
                ✨ AI-powered spell checking enabled. We support all diseases including malaria, dwarfism, and more!
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.conditions.map((c) => (
                  <span key={c} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    {c}
                    <button onClick={() => removeCondition(c)} className="ml-1 text-purple-700 hover:text-purple-900">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add condition (e.g., Malaria, Dwarfism, Diabetes)"
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      addConditionWithSpellCheck(target.value);
                      target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const el = document.querySelector<HTMLInputElement>('input[placeholder*="Add condition"]');
                    if (el && el.value) {
                      addConditionWithSpellCheck(el.value);
                      el.value = '';
                    }
                  }}
                  disabled={isSpellChecking}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    isSpellChecking 
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  }`}
                >
                  {isSpellChecking ? 'Checking...' : 'Add'}
                </button>
              </div>
            </motion.div>

            {/* Location and Global toggle */}
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-800">City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))}
                  placeholder="e.g., Boston"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-800">Country</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={(e) => setProfile(p => ({ ...p, country: e.target.value }))}
                  placeholder="e.g., United States"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Location Filter</label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.showGlobal}
                    onChange={(e) => setProfile(p => ({ ...p, showGlobal: e.target.checked }))}
                    className="w-5 h-5"
                  />
                  <span className="text-sm text-gray-700">Show experts globally (ignore location)</span>
                </label>
              </div>
            </motion.div>

            {/* Save */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl"
              >
                Save and View Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          Note: This is an initial profile setup. You can update it anytime from your dashboard.
        </div>
      </div>
    </div>
  );
}
