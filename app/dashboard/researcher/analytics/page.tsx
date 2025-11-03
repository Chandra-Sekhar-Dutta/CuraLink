'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ResearcherAnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Mock data - Replace with real data from your backend
  const overviewStats = [
    { label: 'Total Projects', value: 12, change: '+15%', trend: 'up', icon: '📊' },
    { label: 'Active Trials', value: 8, change: '+8%', trend: 'up', icon: '🧪' },
    { label: 'Completed Studies', value: 4, change: '0%', trend: 'neutral', icon: '✅' },
    { label: 'Total Participants', value: 1247, change: '+23%', trend: 'up', icon: '👥' },
    { label: 'Collaborators', value: 45, change: '+12%', trend: 'up', icon: '🤝' },
    { label: 'Publications', value: 23, change: '+5%', trend: 'up', icon: '📄' },
    { label: 'Citations', value: 187, change: '+18%', trend: 'up', icon: '📚' },
    { label: 'Funding Secured', value: '$2.4M', change: '+30%', trend: 'up', icon: '💰' },
  ];

  // Project timeline data
  const projectTimelineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Active Projects',
        data: [5, 6, 7, 8, 9, 10, 11, 12, 12, 11, 10, 12],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Completed Projects',
        data: [0, 0, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Participant enrollment data
  const participantData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'New Enrollments',
        data: [45, 52, 48, 65, 58, 72, 68, 85],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
      },
      {
        label: 'Dropouts',
        data: [3, 2, 5, 4, 3, 6, 4, 5],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  // Research areas distribution
  const researchAreasData = {
    labels: ['Oncology', 'Neurology', 'Cardiology', 'Immunology', 'Genetics', 'Other'],
    datasets: [
      {
        data: [30, 25, 20, 15, 7, 3],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(148, 163, 184, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Publication impact
  const publicationImpactData = {
    labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
    datasets: [
      {
        label: 'Publications',
        data: [3, 5, 4, 6, 5],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
      {
        label: 'Citations',
        data: [25, 38, 45, 52, 67],
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
      },
    ],
  };

  // Trial phases distribution
  const trialPhasesData = {
    labels: ['Phase I', 'Phase II', 'Phase III', 'Phase IV'],
    datasets: [
      {
        data: [2, 3, 2, 1],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Collaboration network stats
  const collaborationData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Collaborations',
        data: [3, 5, 4, 7, 6, 8],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                Research Analytics
              </h1>
              <p className="text-gray-600">Comprehensive insights into your research performance</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex gap-2">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    timeRange === range
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {overviewStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    stat.trend === 'up'
                      ? 'bg-green-100 text-green-700'
                      : stat.trend === 'down'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Project Timeline */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Project Timeline</h2>
            <div className="h-64">
              <Line data={projectTimelineData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Participant Enrollment */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Participant Enrollment</h2>
            <div className="h-64">
              <Bar data={participantData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Research Areas Distribution */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Research Areas Distribution</h2>
            <div className="h-64">
              <Doughnut data={researchAreasData} options={pieChartOptions} />
            </div>
          </motion.div>

          {/* Trial Phases */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Clinical Trial Phases</h2>
            <div className="h-64">
              <Pie data={trialPhasesData} options={pieChartOptions} />
            </div>
          </motion.div>

          {/* Publication Impact */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Publication Impact</h2>
            <div className="h-64">
              <Bar data={publicationImpactData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Collaboration Network */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Collaboration Growth</h2>
            <div className="h-64">
              <Line data={collaborationData} options={chartOptions} />
            </div>
          </motion.div>
        </div>

        {/* Performance Insights */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <h3 className="font-semibold text-gray-900">Top Performing Project</h3>
              </div>
              <p className="text-sm text-gray-700">Alzheimer's Disease Biomarkers Study</p>
              <p className="text-xs text-gray-600 mt-1">120 participants • 75% completion</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📈</span>
                <h3 className="font-semibold text-gray-900">Fastest Growing Area</h3>
              </div>
              <p className="text-sm text-gray-700">Immunology Research</p>
              <p className="text-xs text-gray-600 mt-1">+45% growth this quarter</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⭐</span>
                <h3 className="font-semibold text-gray-900">Most Cited Publication</h3>
              </div>
              <p className="text-sm text-gray-700">Novel Biomarkers in Oncology</p>
              <p className="text-xs text-gray-600 mt-1">67 citations • Impact Factor: 8.2</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🤝</span>
                <h3 className="font-semibold text-gray-900">Key Collaborator</h3>
              </div>
              <p className="text-sm text-gray-700">Dr. Sarah Johnson - Stanford</p>
              <p className="text-xs text-gray-600 mt-1">3 joint projects • 5 co-publications</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎓</span>
                <h3 className="font-semibold text-gray-900">Research Impact Score</h3>
              </div>
              <p className="text-sm text-gray-700">H-Index: 24</p>
              <p className="text-xs text-gray-600 mt-1">Top 10% in your field</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💡</span>
                <h3 className="font-semibold text-gray-900">Upcoming Milestone</h3>
              </div>
              <p className="text-sm text-gray-700">Phase III Trial Completion</p>
              <p className="text-xs text-gray-600 mt-1">Diabetes Prevention - Due Dec 2025</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.push('/dashboard/researcher')}
            className="px-6 py-3 bg-white rounded-xl shadow hover:shadow-lg transition-shadow text-gray-700 font-semibold"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => alert('Export feature coming soon!')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            📊 Export Report
          </button>
          <button
            onClick={() => alert('Custom analytics coming soon!')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            🔧 Customize Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
