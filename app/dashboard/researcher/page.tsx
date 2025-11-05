'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ORCIDBadge from '@/components/ORCIDBadge';
import NotificationBell from '@/components/NotificationBell';
import { registerResearcher } from '@/lib/researchers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const ResearcherDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<{
    specialties?: string[];
    interests?: string[];
    affiliation?: string;
    department?: string;
    position?: string;
    phone?: string;
  } | null>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Load researcher profile from server
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/researcher/profile', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) setProfile(data.profile);
        }
      } catch {}
    })();
  }, []);

  // Load projects from database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/researcher/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status]);

  // Load collaborators from API
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const res = await fetch('/api/collaborators');
        if (res.ok) {
          const data = await res.json();
          setCollaborators(data.collaborators || []);
        }
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      } finally {
        setLoadingCollaborators(false);
      }
    };
    
    if (status === 'authenticated') {
      fetchCollaborators();
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

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Dynamic user data from session and profile
  const userData = {
    fullName: session?.user?.name || 'Researcher User',
    email: session?.user?.email || '',
    researcherId: 'RES-2024-3421',
    affiliation: profile?.affiliation || 'Harvard Medical School',
    department: profile?.department || 'Department of Neuroscience',
    position: profile?.position || 'Senior Research Scientist',
    orcid: '0000-0003-1419-2405',
    phone: profile?.phone || '+1 (555) 234-5678',
    specialization: profile?.specialties?.[0] || 'Neurodegenerative Diseases',
    yearsOfExperience: 12
  };

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(word => word !== 'Dr.' && word !== 'Prof.')
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
  const stats = [
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length.toString(), icon: '📊', color: 'from-indigo-500 to-purple-500' },
    { label: 'Collaborators', value: collaborators.length.toString(), icon: '👥', color: 'from-purple-500 to-pink-500' },
    { label: 'Publications', value: '23', icon: '📄', color: 'from-pink-500 to-indigo-500' },
    { label: 'Citations', value: '187', icon: '📚', color: 'from-indigo-500 to-blue-500' },
  ];

  // Use real projects from database, fallback to empty array
  const recentProjects = projects.slice(0, 3).map(p => ({
    id: p.id,
    title: p.title,
    status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
    progress: 75, // TODO: Calculate from project data
    participants: 0, // TODO: Get from project collaborators
    deadline: p.endDate || 'N/A',
  }));

  const upcomingTasks = [
    { task: 'Submit IRB approval for Project X', deadline: 'Tomorrow', priority: 'high' },
    { task: 'Review patient data from Trial 123', deadline: 'Nov 5, 2025', priority: 'medium' },
    { task: 'Prepare presentation for conference', deadline: 'Nov 10, 2025', priority: 'low' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <motion.header
        className="bg-white shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Researcher Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back, {userData.fullName}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <motion.button
                  onClick={() => router.push('/')}
                  className="px-2 sm:px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-xs sm:text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Home
                </motion.button>
                <motion.button
                  onClick={async () => {
                    await signOut({ callbackUrl: '/auth/signin' });
                  }}
                  className="px-2 sm:px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 font-semibold text-xs sm:text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign out
                </motion.button>
              <NotificationBell />
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-indigo-300 transition-all"
                onClick={() => router.push('/dashboard/researcher/profile-setup')}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                title="View/Edit Profile"
              >
                {getInitials(userData.fullName)}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Quick Links */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { href: '/dashboard/researcher/profile-setup', label: 'Profile', color: 'from-blue-500 to-indigo-600' },
              { href: '/dashboard/researcher/experts', label: 'Experts', color: 'from-green-500 to-emerald-600' },
              { href: '/dashboard/researcher/collaborators', label: 'Collaborators', color: 'from-purple-500 to-pink-600' },
              { href: '/dashboard/researcher/trials', label: 'Manage Trials', color: 'from-orange-500 to-red-600' },
              { href: '/dashboard/researcher/forums', label: 'Forums', color: 'from-cyan-500 to-blue-600' },
              { href: '/dashboard/researcher/favorites', label: 'Favorites', color: 'from-yellow-500 to-orange-600' },
              { href: '/dashboard/researcher/find', label: 'Find Researchers', color: 'from-indigo-500 to-purple-600' },
              { href: '/dashboard/researcher/connections', label: 'My Connections', color: 'from-pink-500 to-rose-600' },
              { href: '/dashboard/researcher/chat', label: 'Messages', color: 'from-violet-500 to-purple-600' },
            ].map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="flex-shrink-0"
              >
                <Link href={item.href} className="group">
                  <div className={`relative px-4 py-2 rounded-full bg-gradient-to-r ${item.color} text-white font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap`}>
                    {item.label}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative overflow-hidden group"
              whileHover={{ y: -5 }}
            >
              <motion.div
                className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative z-10">
                <div className="text-2xl sm:text-4xl mb-2">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 text-xs sm:text-sm mt-1">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Projects */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Recent Projects
              </h2>
              <Link href="/projects">
                <motion.button
                  className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs sm:text-sm flex items-center gap-1"
                  whileHover={{ x: 5 }}
                >
                  View All
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-300 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>👥 {project.participants} participants</span>
                    <span>📅 Due: {project.deadline}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">{project.progress}% complete</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Collaborators */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Top Collaborators</h2>
                <Link href="/dashboard/researcher/collaborators">
                  <span className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer">
                    View All
                  </span>
                </Link>
              </div>
              
              {loadingCollaborators ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : collaborators.length > 0 ? (
                <div className="space-y-3">
                  {collaborators.slice(0, 3).map((collab: any, index: number) => (
                    <motion.div
                      key={collab.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      onClick={() => router.push(`/dashboard/researcher/profile/${collab.id}`)}
                    >
                      {collab.image ? (
                        <img
                          src={collab.image}
                          alt={collab.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {collab.avatar}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-sm">{collab.name}</div>
                        <div className="text-xs text-gray-600">{collab.institution}</div>
                        <div className="text-xs text-indigo-600 mt-1">{collab.projects} shared projects</div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No collaborators found</p>
                </div>
              )}
            </motion.div>

            {/* Upcoming Tasks */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Tasks</h2>
              <div className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <motion.div
                    key={index}
                    className="p-3 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{task.task}</div>
                        <div className="text-xs text-gray-600 mt-1">{task.deadline}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold">Researcher Profile</h2>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs sm:text-sm opacity-90">ID:</span>
                  <span className="font-semibold text-xs break-all text-right">{userData.researcherId}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs sm:text-sm opacity-90">Affiliation:</span>
                  <span className="font-semibold text-xs break-words text-right">{userData.affiliation}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs sm:text-sm opacity-90">Position:</span>
                  <span className="font-semibold text-xs break-words text-right">{userData.position}</span>
                </div>
                {(session?.user as any)?.orcidId && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm opacity-90">ORCID:</span>
                    <ORCIDBadge />
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Specialization:</span>
                  <span className="font-semibold text-xs">{userData.specialization}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Experience:</span>
                  <span className="font-semibold">{userData.yearsOfExperience} years</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/researcher/profile-setup');
                  }}
                  className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-xl py-3 px-4 font-bold transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Profile</span>
                </motion.button>
              </div>
              <div className="mt-3 space-y-2">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/researcher/trials');
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-3 px-4 text-left transition-all flex items-center gap-3"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">➕</span>
                  <span className="font-semibold">New Project</span>
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/researcher/analytics');
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-3 px-4 text-left transition-all flex items-center gap-3"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">📊</span>
                  <span className="font-semibold">View Analytics</span>
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/researcher/collaborators');
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-3 px-4 text-left transition-all flex items-center gap-3"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">👥</span>
                  <span className="font-semibold">Find Collaborators</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearcherDashboard;
