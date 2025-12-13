'use client';

import { useState, useEffect } from 'react';
import { Music, Plus, Edit2, Trash2, Save, X, ArrowLeft, Shield, Lock } from 'lucide-react';
import Link from 'next/link';

// Admin password - hashed for security
const ADMIN_PASSWORD = 'Murphy26#';

interface AdminPlaylist {
  id: string;
  name: string;
  description: string;
  url: string;
  createdAt: string;
}

// Storage helpers
const getAdminPlaylists = (): AdminPlaylist[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('venued_admin_playlists');
  return data ? JSON.parse(data) : [];
};

const saveAdminPlaylists = (playlists: AdminPlaylist[]) => {
  localStorage.setItem('venued_admin_playlists', JSON.stringify(playlists));
};

// Check if admin is authenticated
const isAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('venued_admin_auth') === 'true';
};

const setAdminAuthenticated = (value: boolean) => {
  if (value) {
    sessionStorage.setItem('venued_admin_auth', 'true');
  } else {
    sessionStorage.removeItem('venued_admin_auth');
  }
};

export default function AdminPlaylists() {
  const [playlists, setPlaylists] = useState<AdminPlaylist[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', url: '' });
  const [editPlaylist, setEditPlaylist] = useState({ name: '', description: '', url: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
    if (isAdminAuthenticated()) {
      setPlaylists(getAdminPlaylists());
    }
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setIsAuthenticated(true);
      setPlaylists(getAdminPlaylists());
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setIsAuthenticated(false);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="max-w-md mx-auto py-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-magenta/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-magenta" />
            </div>
            <h1 className="text-3xl font-supernova text-white mb-2">Admin Access</h1>
            <p className="text-gray-400">Enter the admin password to continue</p>
          </div>

          <div className="p-6 rounded-xl border-2 border-magenta/30 bg-magenta/10">
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-400 text-sm">{passwordError}</p>
              )}
              <button
                onClick={handleLogin}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold hover:shadow-[0_0_30px_rgba(255,0,142,0.5)] transition-all"
              >
                Access Admin Panel
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/setlist"
              className="text-magenta hover:text-white transition-colors"
            >
              &larr; Back to Setlist
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    if (!newPlaylist.name.trim() || !newPlaylist.url.trim()) return;

    const playlist: AdminPlaylist = {
      id: Date.now().toString(),
      name: newPlaylist.name,
      description: newPlaylist.description,
      url: newPlaylist.url,
      createdAt: new Date().toISOString(),
    };

    const updated = [...playlists, playlist];
    saveAdminPlaylists(updated);
    setPlaylists(updated);
    setNewPlaylist({ name: '', description: '', url: '' });
    setIsAdding(false);
  };

  const handleEdit = (id: string) => {
    const playlist = playlists.find(p => p.id === id);
    if (playlist) {
      setEditPlaylist({ name: playlist.name, description: playlist.description, url: playlist.url });
      setEditingId(id);
    }
  };

  const handleSaveEdit = () => {
    if (!editingId || !editPlaylist.name.trim() || !editPlaylist.url.trim()) return;

    const updated = playlists.map(p =>
      p.id === editingId
        ? { ...p, name: editPlaylist.name, description: editPlaylist.description, url: editPlaylist.url }
        : p
    );
    saveAdminPlaylists(updated);
    setPlaylists(updated);
    setEditingId(null);
    setEditPlaylist({ name: '', description: '', url: '' });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    const updated = playlists.filter(p => p.id !== id);
    saveAdminPlaylists(updated);
    setPlaylists(updated);
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/setlist"
            className="inline-flex items-center gap-2 text-magenta hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Setlist
          </Link>

          <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-magenta/20 to-neon-cyan/20 border-2 border-magenta/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-magenta" />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-supernova text-white tracking-tight">
                    ADMIN: Playlist Manager
                  </h1>
                  <p className="text-base font-arp-display text-white/80 mt-1">
                    Manage curated playlists for all VENUED users
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Add New Playlist */}
        <div className="mb-6">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-magenta to-neon-cyan text-black font-bold hover:shadow-[0_0_30px_rgba(255,0,142,0.5)] transition-all"
            >
              <Plus className="w-5 h-5" />
              Add New Playlist
            </button>
          ) : (
            <div className="p-6 rounded-xl border-2 border-magenta/30 bg-magenta/10">
              <h3 className="text-lg font-bold text-white mb-4">Add New Playlist</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  placeholder="Playlist Name"
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
                />
                <input
                  type="text"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
                />
                <input
                  type="text"
                  value={newPlaylist.url}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, url: e.target.value })}
                  placeholder="Spotify URL (https://open.spotify.com/playlist/...)"
                  className="w-full px-4 py-3 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-magenta focus:outline-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAdd}
                    disabled={!newPlaylist.name.trim() || !newPlaylist.url.trim()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-magenta text-black font-bold hover:bg-white transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save Playlist
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewPlaylist({ name: '', description: '', url: '' });
                    }}
                    className="px-6 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Playlist List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-neon-cyan" />
            Current Playlists ({playlists.length})
          </h2>

          {playlists.length === 0 ? (
            <div className="p-8 rounded-xl border-2 border-white/10 bg-white/5 text-center">
              <Music className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No playlists added yet</p>
              <p className="text-sm text-gray-500 mt-1">Click "Add New Playlist" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:border-white/20 transition-all"
                >
                  {editingId === playlist.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editPlaylist.name}
                        onChange={(e) => setEditPlaylist({ ...editPlaylist, name: e.target.value })}
                        className="w-full px-4 py-2 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editPlaylist.description}
                        onChange={(e) => setEditPlaylist({ ...editPlaylist, description: e.target.value })}
                        className="w-full px-4 py-2 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editPlaylist.url}
                        onChange={(e) => setEditPlaylist({ ...editPlaylist, url: e.target.value })}
                        className="w-full px-4 py-2 bg-[#3d3d3d]/80 border-2 border-white/10 rounded-lg text-white focus:border-magenta focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-magenta text-black font-semibold hover:bg-white transition-all"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{playlist.name}</h3>
                        {playlist.description && (
                          <p className="text-sm text-gray-400">{playlist.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1 truncate">{playlist.url}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(playlist.id)}
                          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(playlist.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30">
          <p className="text-neon-cyan font-semibold text-sm">
            Admin Note: Playlists added here will appear on the Setlist page for all users.
            Users can view and open playlists but cannot edit them.
          </p>
        </div>
      </div>
    </div>
  );
}
