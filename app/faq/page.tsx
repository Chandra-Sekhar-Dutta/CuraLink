'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Generate a unique session ID for tracking chat conversations
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface FAQItem {
  question: string;
  answer: string;
  category: 'patient' | 'researcher' | 'general';
}

const faqData: FAQItem[] = [
  // Patient FAQs
  {
    question: 'How do I find clinical trials relevant to my condition?',
    answer: 'After signing up as a patient, complete your profile setup with your health conditions. The dashboard will automatically show personalized clinical trials matching your profile. You can also search manually in the Clinical Trials section.',
    category: 'patient',
  },
  {
    question: 'Is my health information secure on CuraLink?',
    answer: 'Yes, absolutely. CuraLink uses bank-level encryption and complies with HIPAA regulations. Your health data is stored securely and only shared with your explicit consent.',
    category: 'patient',
  },
  {
    question: 'How do I contact a researcher or trial administrator?',
    answer: 'From any trial or expert profile, click the "Contact" or "Request Meeting" button. You can also send email directly through our platform to maintain privacy.',
    category: 'patient',
  },
  {
    question: 'Can I save trials and publications for later?',
    answer: 'Yes! Click the star/heart icon on any trial, publication, or expert profile to save it to your Favorites. Access all saved items from your dashboard\'s Favorites page.',
    category: 'patient',
  },
  {
    question: 'What does "global" mean in my profile settings?',
    answer: 'Enabling "Show Global" removes location filters, showing you clinical trials and experts worldwide, not just in your city/country.',
    category: 'patient',
  },
  
  // Researcher FAQs
  {
    question: 'How do I create and manage clinical trials?',
    answer: 'Navigate to "Manage Trials" from your dashboard. Click "Add New Trial", fill in details, and save. You can update trial status, participant count, and view applicants anytime.',
    category: 'researcher',
  },
  {
    question: 'How can I find collaborators for my research?',
    answer: 'Use the Collaborators page to search for other researchers by specialty, interests, or institution. Send connection requests to start collaborating.',
    category: 'researcher',
  },
  {
    question: 'Can I create discussion forums for my research area?',
    answer: 'Yes! Researchers can create community forums in the Forums section. Patients can post questions, and you can provide expert responses.',
    category: 'researcher',
  },
  {
    question: 'How do I add my publications to my profile?',
    answer: 'In Profile Setup, you can add your ORCID or ResearchGate ID to import publications automatically. You can also manually add relevant papers.',
    category: 'researcher',
  },
  {
    question: 'What is the AI summary feature?',
    answer: 'CuraLink uses AI to generate concise summaries of long trial descriptions, publications, and research data, making it easier to quickly understand complex information.',
    category: 'researcher',
  },
  
  // General FAQs
  {
    question: 'What is CuraLink?',
    answer: 'CuraLink is a platform connecting patients with clinical trials and researchers. It helps patients find relevant studies and enables researchers to recruit participants and collaborate.',
    category: 'general',
  },
  {
    question: 'How do I sign up?',
    answer: 'Click "Sign In" in the header, then choose "Sign Up". Select your role (Patient/Caregiver or Researcher), fill in details, and verify your email.',
    category: 'general',
  },
  {
    question: 'Can I sign in with Google?',
    answer: 'Yes! We support Google OAuth for quick and secure sign-in. You\'ll still need to select your user type (Patient or Researcher) after first sign-in.',
    category: 'general',
  },
  {
    question: 'What is the AI Assistant?',
    answer: 'The purple chat button in the bottom-right corner opens our AI Assistant powered by Google Gemini. Ask questions about clinical trials, health conditions, or how to use the platform.',
    category: 'general',
  },
  {
    question: 'Is CuraLink free to use?',
    answer: 'Yes, CuraLink is currently free for both patients and researchers. Our mission is to make clinical research accessible to everyone.',
    category: 'general',
  },
  {
    question: 'How do I reset my password?',
    answer: 'On the sign-in page, click "Forgot Password". Enter your email, and we\'ll send you a reset link.',
    category: 'general',
  },
  {
    question: 'Can I use CuraLink on my phone?',
    answer: 'Absolutely! CuraLink is fully responsive and works great on phones, tablets, and desktops. All features are optimized for mobile use.',
    category: 'general',
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'patient' | 'researcher' | 'general'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId()); // Generate once per page load
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAskAI = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/faq-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          sessionId: sessionId 
        }),
      });

      const data = await response.json();

      if (!response.ok && !data.response) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI service. Please try again in a moment, or browse the FAQ sections above for immediate answers.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const categories = [
    { id: 'all' as const, label: 'All Questions' },
    { id: 'patient' as const, label: 'For Patients' },
    { id: 'researcher' as const, label: 'For Researchers' },
    { id: 'general' as const, label: 'General' },
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Frequently Asked Questions
            </motion.h1>
            <motion.p
              className="mt-4 text-xl text-gray-700 max-w-3xl mx-auto font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Find answers to common questions or ask our AI assistant
            </motion.p>
            
            {/* Search Bar */}
            <motion.div
              className="max-w-2xl mx-auto mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 rounded-full text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-lg text-lg border border-gray-200"
                />
                <svg
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-12"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat.label}
              </motion.button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQ List */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="wait">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <motion.div
                      key={index}
                      className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          Q
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {faq.question}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          <button
                            onClick={() => handleQuickQuestion(faq.question)}
                            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            Ask AI about this →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                <motion.div
                  className="bg-white rounded-2xl p-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600">No FAQs match your search. Try the AI assistant!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Chatbot Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <h3 className="font-bold">Ask AI Assistant</h3>
                  </div>
                  <p className="text-sm text-white/80 mt-1">
                    Powered by Gemini
                  </p>
                </div>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                      <svg
                        className="w-12 h-12 mx-auto mb-3 text-indigo-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <p className="text-sm">Ask me anything about CuraLink!</p>
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about CuraLink..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleAskAI}
                      disabled={!input.trim() || isLoading}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                className="mt-6 bg-white rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="font-bold text-gray-900 mb-3">Need More Help?</h3>
                <div className="space-y-2">
                  <Link href="/Contact" className="block text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                    → Contact Support
                  </Link>
                  <Link href="/About" className="block text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                    → About CuraLink
                  </Link>
                  <Link href="/auth/signin" className="block text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                    → Sign In
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  );
}
