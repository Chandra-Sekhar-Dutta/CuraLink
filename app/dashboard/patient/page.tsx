'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';

const PatientDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<{
    conditions: string[];
    city?: string;
    country?: string;
    showGlobal?: boolean;
  } | null>(null);
  const [realPublications, setRealPublications] = useState<any[]>([]);
  const [realTrials, setRealTrials] = useState<any[]>([]);
  const [loadingExternal, setLoadingExternal] = useState(false);

  // Load patient profile from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('patientProfile');
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  // Load patient profile from server (override local if present)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/patient/profile', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) setProfile((prev) => ({ ...prev, ...data.profile }));
        }
      } catch {}
    })();
  }, []);

  // Fetch real external data when profile changes
  useEffect(() => {
    if (!profile || !profile.conditions || profile.conditions.length === 0) {
      return;
    }

    const fetchExternalData = async () => {
      setLoadingExternal(true);
      try {
        // Fetch publications from PubMed
        const pubParams = new URLSearchParams({
          conditions: profile.conditions.join(','),
          maxResults: '10'
        });
        const pubResponse = await fetch(`/api/external-data/publications?${pubParams}`);
        if (pubResponse.ok) {
          const pubData = await pubResponse.json();
          setRealPublications(pubData.publications || []);
        }

        // Fetch clinical trials
        const trialParams = new URLSearchParams({
          conditions: profile.conditions.join(','),
          maxResults: '10'
        });
        if (profile.city && !profile.showGlobal) {
          trialParams.append('location', profile.city);
        }
        const trialResponse = await fetch(`/api/external-data/clinical-trials?${trialParams}`);
        if (trialResponse.ok) {
          const trialData = await trialResponse.json();
          setRealTrials(trialData.trials || []);
        }
      } catch (error) {
        console.error('Error fetching external data:', error);
      } finally {
        setLoadingExternal(false);
      }
    };

    fetchExternalData();
  }, [profile]);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Dynamic user data from session
  const userData = {
    fullName: session?.user?.name || 'Patient User',
    email: session?.user?.email || '',
    patientId: 'PT-2024-8756',
    dateOfBirth: '1985-06-15',
    bloodGroup: 'A+',
    phone: '+1 (555) 123-4567',
    address: '123 Healthcare Ave, Medical City, MC 12345',
    emergencyContact: 'Emergency Contact - +1 (555) 987-6543'
  };

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Mock data
  const healthStats = [
    { label: 'Active Trials', value: '3', icon: '🔬', color: 'from-pink-500 to-purple-500' },
    { label: 'Appointments', value: '2', icon: '📅', color: 'from-purple-500 to-indigo-500' },
    { label: 'Test Results', value: '12', icon: '📋', color: 'from-indigo-500 to-blue-500' },
    { label: 'Messages', value: '5', icon: '💬', color: 'from-blue-500 to-pink-500' },
  ];

  const upcomingAppointments = [
    { id: 1, type: 'Clinical Trial Check-up', doctor: 'Dr. Sarah Johnson', date: '2025-11-05', time: '10:00 AM', location: 'Research Center A' },
    { id: 2, type: 'Blood Test', doctor: 'Lab Technician', date: '2025-11-08', time: '8:30 AM', location: 'City Hospital Lab' },
  ];

  const activeTrials = [
    { id: 1, name: 'Alzheimer\'s Prevention Study', phase: 'Phase III', status: 'Active', nextVisit: '2025-11-10', progress: 60 },
    { id: 2, name: 'Diabetes Management Trial', phase: 'Phase II', status: 'Active', nextVisit: '2025-11-15', progress: 40 },
    { id: 3, name: 'Heart Health Research', phase: 'Phase I', status: 'Screening', nextVisit: '2025-11-20', progress: 20 },
  ];

  const recentResults = [
    { test: 'Blood Sugar Level', value: '95 mg/dL', status: 'Normal', date: '2025-10-30' },
    { test: 'Blood Pressure', value: '120/80', status: 'Normal', date: '2025-10-28' },
    { test: 'Cholesterol', value: '180 mg/dL', status: 'Normal', date: '2025-10-25' },
  ];

  const medications = [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', nextRefill: '2025-11-15' },
    { name: 'Vitamin D', dosage: '1000 IU', frequency: 'Once daily', nextRefill: '2025-12-01' },
  ];

  // Mock datasets for personalization
  const allPublications = useMemo(() => ([
    { id: 'pub1', title: "Latest Advances in Glioma Treatment", conditions: ['Glioma', 'Brain Cancer'], year: 2025, journal: '', authors: [], url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Glioma+Treatment' },
    { id: 'pub2', title: "Targeted Therapies in Lung Cancer", conditions: ['Lung Cancer'], year: 2024, journal: '', authors: [], url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Lung+Cancer+Therapy' },
    { id: 'pub3', title: "Integrative Care for Brain Tumors", conditions: ['Brain Cancer'], year: 2023, journal: '', authors: [], url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Brain+Tumor+Care' },
  ]), []);

  const allExperts = useMemo(() => ([
    { id: 'exp1', name: 'Dr. Sarah Johnson', specialty: 'Neuro-Oncology', conditions: ['Brain Cancer', 'Glioma'], city: 'Boston', country: 'United States' },
    { id: 'exp2', name: 'Dr. Michael Chen', specialty: 'Pulmonology', conditions: ['Lung Cancer'], city: 'San Francisco', country: 'United States' },
    { id: 'exp3', name: 'Dr. Emily Rodriguez', specialty: 'Neurosurgery', conditions: ['Glioma'], city: 'Toronto', country: 'Canada' },
  ]), []);

  const allTrials = useMemo(() => ([
    { id: 'tr1', name: "Glioblastoma Immunotherapy Study", conditions: ['Glioma'], city: 'Boston', country: 'United States', phase: 'Phase II', status: 'Recruiting', description: '', sponsor: '', url: 'https://clinicaltrials.gov/search?cond=Glioblastoma' },
    { id: 'tr2', name: "NSCLC Targeted Therapy Trial", conditions: ['Lung Cancer'], city: 'Chicago', country: 'United States', phase: 'Phase III', status: 'Recruiting', description: '', sponsor: '', url: 'https://clinicaltrials.gov/search?cond=Lung+Cancer' },
    { id: 'tr3', name: "Brain Cancer Precision Medicine", conditions: ['Brain Cancer'], city: 'London', country: 'United Kingdom', phase: 'Phase I', status: 'Active', description: '', sponsor: '', url: 'https://clinicaltrials.gov/search?cond=Brain+Cancer' },
  ]), []);

  const filtered = useMemo(() => {
    // Use real data if available, otherwise fall back to mock data
    const publicationsToShow = realPublications.length > 0 
      ? realPublications.map(p => ({
          id: p.id,
          title: p.title,
          conditions: profile?.conditions || [],
          year: p.year,
          journal: p.journal,
          authors: p.authors,
          url: p.id.startsWith('pmid-') 
            ? `https://pubmed.ncbi.nlm.nih.gov/${p.id.replace('pmid-', '')}/`
            : `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(p.title)}`
        }))
      : allPublications.slice(0, 3);

    const trialsToShow = realTrials.length > 0
      ? realTrials.map(t => ({
          id: t.id,
          name: t.title,
          conditions: t.conditions,
          city: t.city || 'Not specified',
          country: t.country || 'Not specified',
          phase: t.phase,
          status: t.status,
          description: t.description,
          sponsor: t.sponsor,
          url: t.id.startsWith('NCT') 
            ? `https://clinicaltrials.gov/study/${t.id}`
            : `https://clinicaltrials.gov/search?cond=${encodeURIComponent(t.conditions.join(','))}`
        }))
      : allTrials.slice(0, 3);

    // For experts, still use mock data until we integrate a proper expert API
    if (!profile || !profile.conditions || profile.conditions.length === 0) {
      return {
        publications: publicationsToShow.slice(0, 3),
        experts: allExperts.slice(0, 3),
        trials: trialsToShow.slice(0, 3),
      };
    }
    
    const byCond = (item: { conditions: string[] }) => item.conditions.some(c => profile.conditions.includes(c));
    const byLoc = (item: { city: string; country: string }) => {
      if (profile.showGlobal) return true;
      const cityOk = profile.city ? item.city.toLowerCase() === profile.city.toLowerCase() : true;
      const countryOk = profile.country ? item.country.toLowerCase() === profile.country.toLowerCase() : true;
      return cityOk && countryOk;
    };
    
    return {
      publications: publicationsToShow.slice(0, 5),
      experts: allExperts.filter(e => byCond(e) && byLoc(e)).slice(0, 5),
      trials: trialsToShow.slice(0, 5),
    };
  }, [profile, allPublications, allExperts, allTrials, realPublications, realTrials]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <motion.header
        className="bg-white shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                Patient Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome back, {userData.fullName}</p>
            </div>
            <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => router.push('/')}
                  className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Home
                </motion.button>
                <motion.button
                  onClick={async () => {
                    await signOut({ callbackUrl: '/auth/signin' });
                  }}
                  className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 font-semibold text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign out
                </motion.button>
              <NotificationBell />
              <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {getInitials(userData.fullName)}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Links */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {[
            { href: '/dashboard/patient/experts', label: 'Experts', emoji: '👩‍⚕️' },
            { href: '/dashboard/patient/trials', label: 'Trials', emoji: '🧪' },
            { href: '/dashboard/patient/publications', label: 'Publications', emoji: '📚' },
            { href: '/dashboard/patient/favorites', label: 'Favorites', emoji: '⭐' },
            { href: '/dashboard/patient/forums', label: 'Forums', emoji: '💬' },
            { href: '/dashboard/patient/profile-setup', label: 'Profile', emoji: '🧩' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <div className="w-full bg-white rounded-xl p-3 shadow hover:shadow-md transition-all border border-transparent hover:border-pink-200 flex items-center gap-2">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-pink-600">{item.label}</span>
              </div>
            </Link>
          ))}
        </motion.div>
        {/* Profile CTA */}
        {!profile && (
          <motion.div
            className="mb-8 p-4 rounded-xl border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900">Personalize your dashboard</div>
                <div className="text-sm text-gray-700">Tell us about your condition to see tailored trials, publications, and experts.</div>
              </div>
              <button
                onClick={() => router.push('/dashboard/patient/profile-setup')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold"
              >
                Set up profile
              </button>
            </div>
          </motion.div>
        )}

        {/* Personalized Recommendations */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Publications */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Recommended Publications</h2>
              <button
                onClick={() => router.push('/dashboard/patient/profile-setup')}
                className="text-xs text-pink-600 hover:text-pink-800 font-semibold"
              >Edit profile</button>
            </div>
            {loadingExternal ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.publications.map((p, idx) => {
                  // Use the pre-generated URL from the publication object
                  const pubmedUrl = p.url || `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(p.title)}`;
                  
                  return (
                    <a 
                      key={p.id} 
                      href={pubmedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border-2 border-gray-100 rounded-xl hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm group-hover:text-pink-600 transition-colors">
                            {p.title}
                            <span className="ml-2 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {p.journal && <span className="font-medium">{p.journal} • </span>}
                            {p.year}
                            {p.authors && p.authors.length > 0 && (
                              <span className="block mt-1 text-gray-400">
                                {p.authors.slice(0, 3).join(', ')}
                                {p.authors.length > 3 && ' et al.'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-gray-400 group-hover:text-pink-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  );
                })}
                {!loadingExternal && filtered.publications.length === 0 && (
                  <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                    {profile?.conditions && profile.conditions.length > 0 
                      ? 'Loading publications from PubMed...'
                      : 'Set up your profile to see personalized publications from PubMed.'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Experts */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Experts</h2>
              <button
                onClick={() => router.push('/dashboard/patient/profile-setup')}
                className="text-xs text-pink-600 hover:text-pink-800 font-semibold"
              >Edit profile</button>
            </div>
            <div className="space-y-3">
              {filtered.experts.map((e, idx) => (
                <div key={e.id} className="p-3 border-2 border-gray-100 rounded-xl hover:border-pink-300 transition-colors">
                  <div className="font-semibold text-gray-900 text-sm">{e.name}</div>
                  <div className="text-xs text-gray-600">{e.specialty}</div>
                  <div className="text-xs text-gray-500 mt-1">{e.city}, {e.country} • {e.conditions.join(', ')}</div>
                </div>
              ))}
              {filtered.experts.length === 0 && (
                <div className="text-sm text-gray-600">No experts match your filters. Try enabling global view or updating location.</div>
              )}
            </div>
          </div>

          {/* Clinical Trials */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Clinical Trials</h2>
              <button
                onClick={() => router.push('/dashboard/patient/profile-setup')}
                className="text-xs text-pink-600 hover:text-pink-800 font-semibold"
              >Edit profile</button>
            </div>
            {loadingExternal ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.trials.map((t) => {
                  // Use the pre-generated URL from the trial object
                  const trialUrl = t.url || `https://clinicaltrials.gov/search?cond=${encodeURIComponent(t.conditions.join(','))}`;
                  
                  return (
                    <a
                      key={t.id}
                      href={trialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border-2 border-gray-100 rounded-xl hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm group-hover:text-pink-600 transition-colors">
                            {t.name}
                            <span className="ml-2 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                          </div>
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
                          <div className="text-xs text-gray-600 mt-2">📍 {t.city}, {t.country}</div>
                          {t.sponsor && (
                            <div className="text-xs text-gray-500 mt-1">Sponsor: {t.sponsor}</div>
                          )}
                          {t.description && (
                            <div className="text-xs text-gray-600 mt-2 line-clamp-2">{t.description}</div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-gray-400 group-hover:text-pink-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  );
                })}
                {!loadingExternal && filtered.trials.length === 0 && (
                  <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                    {profile?.conditions && profile.conditions.length > 0 
                      ? 'Loading trials from ClinicalTrials.gov...'
                      : 'Set up your profile to see relevant clinical trials from ClinicalTrials.gov.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {healthStats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative overflow-hidden group"
              whileHover={{ y: -5 }}
            >
              <motion.div
                className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative z-10">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointments & Trials */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                  Upcoming Appointments
                </h2>
                <Link href="/dashboard/patient/appointments">
                  <motion.button
                    className="text-pink-600 hover:text-pink-800 font-semibold text-sm flex items-center gap-1"
                    whileHover={{ x: 5 }}
                  >
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </Link>
              </div>

              <div className="space-y-4">
                {upcomingAppointments.map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    className="p-4 border-2 border-gray-100 rounded-xl hover:border-pink-300 transition-colors cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {new Date(apt.date).getDate()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{apt.type}</h3>
                        <p className="text-sm text-gray-600 mt-1">{apt.doctor}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>📅 {apt.date}</span>
                          <span>🕐 {apt.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">📍 {apt.location}</p>
                      </div>
                      <motion.button
                        className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg font-semibold text-sm hover:bg-pink-200 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Details
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Active Clinical Trials */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                  Active Clinical Trials
                </h2>
                <Link href="/dashboard/patient/active-trials">
                  <motion.button
                    className="text-pink-600 hover:text-pink-800 font-semibold text-sm flex items-center gap-1"
                    whileHover={{ x: 5 }}
                  >
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </Link>
              </div>

              <div className="space-y-4">
                {activeTrials.map((trial, index) => (
                  <motion.div
                    key={trial.id}
                    className="p-4 border-2 border-gray-100 rounded-xl hover:border-purple-300 transition-colors cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{trial.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            {trial.phase}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            trial.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {trial.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      📅 Next Visit: {trial.nextVisit}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <motion.div
                        className="bg-gradient-to-r from-pink-600 to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${trial.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">{trial.progress}% complete</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Health Info & Actions */}
          <div className="space-y-6">
            {/* Recent Test Results */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Test Results</h2>
              <div className="space-y-3">
                {recentResults.map((result, index) => (
                  <motion.div
                    key={index}
                    className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">{result.test}</div>
                        <div className="text-gray-600 text-sm mt-1">{result.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{result.date}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        result.status === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Medications */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Current Medications</h2>
              <div className="space-y-3">
                {medications.map((med, index) => (
                  <motion.div
                    key={index}
                    className="p-3 border-l-4 border-pink-500 bg-pink-50 rounded-r-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="font-semibold text-gray-900 text-sm">{med.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{med.dosage} - {med.frequency}</div>
                    <div className="text-xs text-gray-500 mt-1">Next refill: {med.nextRefill}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Health Summary Card */}
            <motion.div
              className="bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 rounded-2xl p-6 shadow-lg text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold mb-4">Patient Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Patient ID:</span>
                  <span className="font-semibold text-xs">{userData.patientId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Blood Type:</span>
                  <span className="font-semibold">{userData.bloodGroup}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Date of Birth:</span>
                  <span className="font-semibold text-xs">{userData.dateOfBirth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Phone:</span>
                  <span className="font-semibold text-xs">{userData.phone}</span>
                </div>
                <div className="pt-2 border-t border-white/20">
                  <div className="text-sm opacity-90 mb-1">Emergency Contact:</div>
                  <div className="font-semibold text-xs">{userData.emergencyContact}</div>
                </div>
              </div>
              <motion.button
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-3 px-4 mt-4 font-semibold transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Full Health Profile
              </motion.button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <motion.button
                  className="w-full bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 rounded-xl py-3 px-4 text-left transition-all flex items-center gap-3 text-gray-900"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">🔍</span>
                  <span className="font-semibold">Find Clinical Trials</span>
                </motion.button>
                <motion.button
                  className="w-full bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 rounded-xl py-3 px-4 text-left transition-all flex items-center gap-3 text-gray-900"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">💊</span>
                  <span className="font-semibold">Refill Prescription</span>
                </motion.button>
                <motion.button
                  className="w-full bg-gradient-to-r from-indigo-100 to-pink-100 hover:from-indigo-200 hover:to-pink-200 rounded-xl py-3 px-4 text-left transition-all flex items-center gap-3 text-gray-900"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">📞</span>
                  <span className="font-semibold">Contact Doctor</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
