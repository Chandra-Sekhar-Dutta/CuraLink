'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PrescriptionsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);

  // Mock prescription data
  const prescriptions = [
    {
      id: 1,
      medication: 'Lisinopril 10mg',
      prescribedBy: 'Dr. Sarah Johnson',
      dosage: 'Once daily',
      refillsRemaining: 2,
      lastFilled: '2024-10-15',
      nextRefill: '2024-11-15',
      status: 'active'
    },
    {
      id: 2,
      medication: 'Metformin 500mg',
      prescribedBy: 'Dr. Sarah Johnson',
      dosage: 'Twice daily with meals',
      refillsRemaining: 0,
      lastFilled: '2024-09-20',
      nextRefill: '2024-10-20',
      status: 'needs_refill'
    },
    {
      id: 3,
      medication: 'Atorvastatin 20mg',
      prescribedBy: 'Dr. Michael Chen',
      dosage: 'Once daily at bedtime',
      refillsRemaining: 5,
      lastFilled: '2024-10-01',
      nextRefill: '2024-12-01',
      status: 'active'
    }
  ];

  const handleRefillRequest = (medicationName: string) => {
    setSelectedMedication(medicationName);
    // In a real app, this would trigger an API call
    setTimeout(() => {
      alert(`Refill request for ${medicationName} has been submitted. Your pharmacy will contact you shortly.`);
      setSelectedMedication(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900">My Prescriptions</h1>
          <p className="text-gray-600 mt-2">Manage your medications and refill requests</p>
        </div>

        {/* Prescriptions List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((prescription) => (
            <motion.div
              key={prescription.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{prescription.medication}</h3>
                  <p className="text-sm text-gray-600">{prescription.prescribedBy}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    prescription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {prescription.status === 'active' ? 'Active' : 'Needs Refill'}
                </span>
              </div>

              {/* Dosage Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">💊</span>
                  <span className="text-sm">{prescription.dosage}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">🔄</span>
                  <span className="text-sm">{prescription.refillsRemaining} refills remaining</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">📅</span>
                  <span className="text-sm">Next refill: {prescription.nextRefill}</span>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                onClick={() => handleRefillRequest(prescription.medication)}
                disabled={selectedMedication === prescription.medication}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                  prescription.status === 'needs_refill'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedMedication === prescription.medication ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Request Refill'
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <motion.div
          className="mt-8 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">ℹ️</div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Important Information</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Refill requests are typically processed within 24-48 hours</li>
                <li>• Your pharmacy will contact you when your prescription is ready</li>
                <li>• Please ensure your insurance information is up to date</li>
                <li>• Contact your doctor if you have any questions about your medications</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
