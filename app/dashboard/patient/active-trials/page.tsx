'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ActiveTrial {
  id: number;
  name: string;
  phase: string;
  status: 'Active' | 'Screening' | 'On Hold' | 'Completed';
  nextVisit: string;
  progress: number;
  coordinator: string;
  location: string;
  description: string;
  startDate: string;
  expectedEndDate: string;
  participantId?: string;
  visitsCompleted: number;
  totalVisits: number;
}

export default function ActiveTrialsPage() {
  const [selectedTrial, setSelectedTrial] = useState<ActiveTrial | null>(null);

  const activeTrials: ActiveTrial[] = [
    { 
      id: 1, 
      name: 'Alzheimer\'s Prevention Study', 
      phase: 'Phase III', 
      status: 'Active', 
      nextVisit: '2025-11-10',
      progress: 60,
      coordinator: 'Dr. Sarah Johnson',
      location: 'Research Center A, Boston',
      description: 'A comprehensive study investigating preventive measures and early interventions for Alzheimer\'s disease in high-risk populations.',
      startDate: '2025-06-01',
      expectedEndDate: '2026-12-31',
      participantId: 'ALZ-2025-1234',
      visitsCompleted: 6,
      totalVisits: 10
    },
    { 
      id: 2, 
      name: 'Diabetes Management Trial', 
      phase: 'Phase II', 
      status: 'Active', 
      nextVisit: '2025-11-15',
      progress: 40,
      coordinator: 'Dr. Priya Sharma',
      location: 'Medical Center B, Mumbai',
      description: 'Evaluating new approaches to diabetes management including lifestyle modifications and novel therapeutic interventions.',
      startDate: '2025-08-15',
      expectedEndDate: '2026-08-14',
      participantId: 'DM-2025-5678',
      visitsCompleted: 4,
      totalVisits: 12
    },
    { 
      id: 3, 
      name: 'Heart Health Research', 
      phase: 'Phase I', 
      status: 'Screening', 
      nextVisit: '2025-11-20',
      progress: 20,
      coordinator: 'Dr. Michael Chen',
      location: 'Cardiology Institute, Chicago',
      description: 'Initial phase study examining cardiovascular health markers and potential preventive strategies for heart disease.',
      startDate: '2025-10-01',
      expectedEndDate: '2026-03-31',
      participantId: 'HH-2025-9012',
      visitsCompleted: 2,
      totalVisits: 8
    },
    { 
      id: 4, 
      name: 'Cancer Immunotherapy Study', 
      phase: 'Phase III', 
      status: 'Active', 
      nextVisit: '2025-11-25',
      progress: 75,
      coordinator: 'Dr. Emily Rodriguez',
      location: 'Oncology Center, Toronto',
      description: 'Advanced trial studying novel immunotherapy approaches for various cancer types with promising early results.',
      startDate: '2025-03-01',
      expectedEndDate: '2026-02-28',
      participantId: 'CAN-2025-3456',
      visitsCompleted: 9,
      totalVisits: 12
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Screening': return 'bg-blue-100 text-blue-700';
      case 'On Hold': return 'bg-amber-100 text-amber-700';
      case 'Completed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPhaseColor = (phase: string) => {
    if (phase.includes('I')) return 'bg-blue-500';
    if (phase.includes('II')) return 'bg-purple-500';
    if (phase.includes('III')) return 'bg-pink-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/patient" className="text-pink-600 hover:text-pink-800 font-semibold text-sm flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
            My Active Clinical Trials
          </h1>
          <p className="text-gray-700 mt-2">Track your participation in ongoing clinical research studies</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
              {activeTrials.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Active Trials</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="text-3xl font-bold text-green-600">
              {activeTrials.filter(t => t.status === 'Active').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Currently Active</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="text-3xl font-bold text-blue-600">
              {activeTrials.reduce((sum, t) => sum + t.visitsCompleted, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Visits Completed</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(activeTrials.reduce((sum, t) => sum + t.progress, 0) / activeTrials.length)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Average Progress</div>
          </div>
        </div>

        {/* Trials List */}
        <div className="space-y-6">
          {activeTrials.map((trial, index) => (
            <motion.div
              key={trial.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {/* Trial Header */}
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{trial.name}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trial.status)} bg-opacity-20`}>
                        {trial.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                      <span className={`px-3 py-1 ${getPhaseColor(trial.phase)} rounded-full font-semibold`}>
                        {trial.phase}
                      </span>
                      <span>📋 ID: {trial.participantId}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90 mb-1">Overall Progress</div>
                    <div className="text-3xl font-bold">{trial.progress}%</div>
                  </div>
                </div>
              </div>

              {/* Trial Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Left Column - Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">About This Trial</h3>
                      <p className="text-sm text-gray-600">{trial.description}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">👨‍⚕️ Coordinator:</span>
                        <span className="text-gray-600">{trial.coordinator}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">📍 Location:</span>
                        <span className="text-gray-600">{trial.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">📅 Started:</span>
                        <span className="text-gray-600">
                          {new Date(trial.startDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">🏁 Expected End:</span>
                        <span className="text-gray-600">
                          {new Date(trial.expectedEndDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Progress & Next Visit */}
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">Visit Progress</span>
                        <span className="text-sm text-gray-600">
                          {trial.visitsCompleted} / {trial.totalVisits} visits
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-pink-600 to-purple-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${trial.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Next Visit */}
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-pink-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                          <div className="text-xl font-bold">{new Date(trial.nextVisit).getDate()}</div>
                          <div className="text-xs">
                            {new Date(trial.nextVisit).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 font-semibold">Next Visit</div>
                          <div className="font-bold text-gray-900">
                            {new Date(trial.nextVisit).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <motion.button
                        className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View Full Details
                      </motion.button>
                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg font-semibold text-sm hover:bg-pink-200 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Contact Team
                        </motion.button>
                        <motion.button
                          className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-200 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          View Reports
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {activeTrials.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No active trials</h3>
            <p className="text-gray-600 mb-6">You're not currently enrolled in any clinical trials.</p>
            <Link href="/dashboard/patient/trials">
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Available Trials
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
