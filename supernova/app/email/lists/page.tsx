'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmailList {
  id: string;
  name: string;
  description: string;
  subscriberCount: number;
  activeSubscriberCount: number;
  createdAt: string;
}

export default function EmailListsPage() {
  const [lists, setLists] = useState<EmailList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await fetch('/api/email/lists');
      const data = await res.json();
      setLists(data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/email/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListName,
          description: newListDescription
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewListName('');
        setNewListDescription('');
        fetchLists();
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const deleteList = async (id: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      await fetch(`/api/email/lists/${id}`, { method: 'DELETE' });
      fetchLists();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Supernova, sans-serif', color: '#FF008E' }}>
              Email Lists
            </h1>
            <p className="text-gray-300">Manage your subscriber lists and audiences</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-lg font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
          >
            + Create List
          </button>
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/email/lists/${list.id}`}
              className="block"
            >
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all cursor-pointer">
                <h3 className="text-xl font-bold mb-2 text-white">{list.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{list.description || 'No description'}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#00F0E9' }}>
                      {list.activeSubscriberCount || 0}
                    </p>
                    <p className="text-xs text-gray-400">Active Subscribers</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteList(list.id);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {lists.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No lists yet. Create your first list!</p>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-white/20 rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6 text-white">Create New List</h2>
              <form onSubmit={createList}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    List Name *
                  </label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg font-semibold"
                    style={{ background: 'linear-gradient(135deg, #FF008E, #00F0E9)', color: '#000' }}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
