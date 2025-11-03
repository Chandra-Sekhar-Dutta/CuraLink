'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ContactDoctorPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    doctor: '',
    subject: '',
    urgency: 'normal',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock doctors list
  const doctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Primary Care' },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Cardiology' },
    { id: 3, name: 'Dr. Emily Rodriguez', specialty: 'Endocrinology' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      alert(`Your message has been sent to ${formData.doctor}. They will respond within 24-48 hours.`);
      setIsSubmitting(false);
      router.back();
    }, 1500);
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
          <h1 className="text-4xl font-bold text-gray-900">Contact Your Doctor</h1>
          <p className="text-gray-600 mt-2">Send a message to your healthcare provider</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Doctor */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Doctor *
                </label>
                <select
                  required
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.name}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your inquiry"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Urgency Level
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['low', 'normal', 'high'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency: level })}
                      className={`py-3 px-4 rounded-xl font-semibold capitalize transition-all ${
                        formData.urgency === level
                          ? level === 'high'
                            ? 'bg-red-500 text-white'
                            : level === 'normal'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your concern or question in detail..."
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Sidebar - Quick Actions & Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Emergency Contact */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">🚨</span>
                Emergency?
              </h3>
              <p className="text-sm text-red-800 mb-4">
                If this is a medical emergency, please call 911 or go to the nearest emergency room immediately.
              </p>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl">
                Call Emergency Services
              </button>
            </div>

            {/* Your Doctors */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4">Your Care Team</h3>
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">👨‍⚕️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{doctor.name}</p>
                      <p className="text-xs text-gray-600">{doctor.specialty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Time Info */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6">
              <h3 className="font-bold text-indigo-900 mb-2">Response Time</h3>
              <p className="text-sm text-indigo-800">
                Your doctor typically responds within 24-48 hours during business days. Urgent messages are prioritized.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
