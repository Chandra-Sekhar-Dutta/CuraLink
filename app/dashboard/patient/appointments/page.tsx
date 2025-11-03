'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Appointment {
  id: number;
  type: string;
  doctor: string;
  date: string;
  time: string;
  location: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  notes?: string;
}

export default function AppointmentsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const allAppointments: Appointment[] = [
    { 
      id: 1, 
      type: 'Clinical Trial Check-up', 
      doctor: 'Dr. Sarah Johnson', 
      date: '2025-11-05', 
      time: '10:00 AM', 
      location: 'Research Center A',
      status: 'Upcoming',
      notes: 'Bring previous test results'
    },
    { 
      id: 2, 
      type: 'Blood Test', 
      doctor: 'Lab Technician', 
      date: '2025-11-08', 
      time: '8:30 AM', 
      location: 'City Hospital Lab',
      status: 'Upcoming',
      notes: 'Fasting required - no food 8 hours before'
    },
    { 
      id: 3, 
      type: 'Consultation', 
      doctor: 'Dr. Priya Sharma', 
      date: '2025-11-12', 
      time: '2:00 PM', 
      location: 'Medical Center B',
      status: 'Upcoming',
      notes: 'Discuss trial enrollment'
    },
    { 
      id: 4, 
      type: 'Follow-up Visit', 
      doctor: 'Dr. Michael Chen', 
      date: '2025-11-20', 
      time: '11:30 AM', 
      location: 'Pulmonology Clinic',
      status: 'Upcoming'
    },
    { 
      id: 5, 
      type: 'Initial Screening', 
      doctor: 'Dr. Emily Rodriguez', 
      date: '2025-10-28', 
      time: '9:00 AM', 
      location: 'Research Center A',
      status: 'Completed',
      notes: 'All vitals normal'
    },
    { 
      id: 6, 
      type: 'MRI Scan', 
      doctor: 'Radiology Department', 
      date: '2025-10-15', 
      time: '3:00 PM', 
      location: 'City Hospital Imaging',
      status: 'Completed'
    },
    { 
      id: 7, 
      type: 'Consultation', 
      doctor: 'Dr. James Wilson', 
      date: '2025-10-10', 
      time: '1:00 PM', 
      location: 'Medical Center C',
      status: 'Cancelled',
      notes: 'Rescheduled to later date'
    },
  ];

  const filteredAppointments = allAppointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status.toLowerCase() === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/patient" className="text-pink-600 hover:text-pink-800 font-semibold text-sm flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
            My Appointments
          </h1>
          <p className="text-gray-700 mt-2">Manage and view all your medical appointments</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Appointments ({allAppointments.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                filter === 'upcoming' 
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming ({allAppointments.filter(a => a.status === 'Upcoming').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                filter === 'completed' 
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({allAppointments.filter(a => a.status === 'Completed').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                filter === 'cancelled' 
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled ({allAppointments.filter(a => a.status === 'Cancelled').length})
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((apt, index) => (
            <motion.div
              key={apt.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Date Badge */}
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                    <div className="text-2xl font-bold">{new Date(apt.date).getDate()}</div>
                    <div className="text-xs">
                      {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{apt.type}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">👨‍⚕️ Doctor:</span>
                        <span>{apt.doctor}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">📅 Date:</span>
                          <span>{new Date(apt.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">🕐 Time:</span>
                          <span>{apt.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">📍 Location:</span>
                        <span>{apt.location}</span>
                      </div>
                      {apt.notes && (
                        <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <span className="font-semibold">📝 Notes:</span>
                          <span className="text-amber-900">{apt.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex-col gap-2">
                  {apt.status === 'Upcoming' && (
                    <>
                      <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-shadow"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Reschedule
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    </>
                  )}
                  {apt.status === 'Completed' && (
                    <motion.button
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Report
                    </motion.button>
                  )}
                  <motion.button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredAppointments.length === 0 && (
            <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">You don't have any {filter !== 'all' ? filter : ''} appointments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
