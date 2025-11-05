'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ConnectionStatus;
  createdAt: string;
  requester: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  isRequester: boolean;
}

export default function ConnectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user?.userType !== 'researcher') {
      router.push('/dashboard');
      return;
    }

    if (status === 'authenticated') {
      fetchConnections();
    }
  }, [status, session, router]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/researcher/connections');
      const data = await response.json();

      if (response.ok) {
        setConnections(data.connections || []);
      } else {
        console.error('Failed to fetch connections:', data.error);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionAction = async (connectionId: string, action: 'accept' | 'reject') => {
    try {
      setProcessingId(connectionId);
      const response = await fetch('/api/researcher/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, action }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh connections
        await fetchConnections();
      } else {
        alert(data.error || 'Failed to process connection request');
      }
    } catch (error) {
      console.error('Error processing connection:', error);
      alert('An error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredConnections = connections.filter((conn) => conn.status === activeTab);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Connections</h1>
          <p className="text-gray-600">Manage your researcher network</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending ({connections.filter((c) => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'accepted'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Connected ({connections.filter((c) => c.status === 'accepted').length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'rejected'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Rejected ({connections.filter((c) => c.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Connections List */}
        <div className="space-y-4">
          {filteredConnections.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">
                {activeTab === 'pending' && '⏳'}
                {activeTab === 'accepted' && '🤝'}
                {activeTab === 'rejected' && '❌'}
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No {activeTab} connections
              </h3>
              <p className="text-gray-500">
                {activeTab === 'pending' &&
                  'You have no pending connection requests at the moment.'}
                {activeTab === 'accepted' &&
                  "You haven't connected with any researchers yet. Start by sending connection requests!"}
                {activeTab === 'rejected' && 'No rejected connections.'}
              </p>
              {activeTab !== 'rejected' && (
                <button
                  onClick={() => router.push('/dashboard/researcher/find')}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Find Researchers
                </button>
              )}
            </div>
          ) : (
            filteredConnections.map((connection) => {
              const otherUser = connection.isRequester
                ? connection.receiver
                : connection.requester;
              
              // Handle case where otherUser might be undefined
              if (!otherUser) {
                return null;
              }

              const initials = otherUser.name
                ? otherUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                : otherUser.email ? otherUser.email[0].toUpperCase() : '?';

              return (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {otherUser.image ? (
                          <img
                            src={otherUser.image}
                            alt={otherUser.name || 'User'}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {otherUser.name || 'Anonymous'}
                        </h3>
                        <p className="text-gray-600">{otherUser.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {connection.isRequester
                            ? 'You sent a connection request'
                            : 'Sent you a connection request'}
                          {' • '}
                          {new Date(connection.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      {activeTab === 'pending' && !connection.isRequester && (
                        <>
                          <button
                            onClick={() => handleConnectionAction(connection.id, 'accept')}
                            disabled={processingId === connection.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === connection.id ? 'Processing...' : '✓ Accept'}
                          </button>
                          <button
                            onClick={() => handleConnectionAction(connection.id, 'reject')}
                            disabled={processingId === connection.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === connection.id ? 'Processing...' : '✗ Reject'}
                          </button>
                        </>
                      )}

                      {activeTab === 'pending' && connection.isRequester && (
                        <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                          ⏳ Awaiting Response
                        </span>
                      )}

                      {activeTab === 'accepted' && (
                        <button
                          onClick={() =>
                            router.push(`/dashboard/researcher/chat?userId=${otherUser.id}`)
                          }
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                        >
                          💬 Chat
                        </button>
                      )}

                      <button
                        onClick={() => router.push(`/profile/${otherUser.id}`)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        👤 View Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
