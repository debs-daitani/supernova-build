'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, AlertCircle, Check } from 'lucide-react';
import { clearAllData, exportData, importData, isDemoDataLoaded, generateDemoData } from '@/lib/demoData';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const router = useRouter();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = () => {
    try {
      exportData();
      setMessage({ type: 'success', text: 'Data exported successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importData(file);
      setMessage({ type: 'success', text: 'Data imported successfully!' });
      setTimeout(() => {
        setMessage(null);
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import data' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    setMessage({ type: 'success', text: 'All data cleared!' });
    setTimeout(() => {
      setMessage(null);
      router.push('/');
    }, 2000);
  };

  const handleLoadDemo = () => {
    generateDemoData();
    setMessage({ type: 'success', text: 'Demo data loaded!' });
    setTimeout(() => {
      setMessage(null);
      router.push('/backstage');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-10 h-10 text-electric-purple" />
            <h1 className="text-5xl font-black text-white">Settings</h1>
          </div>
          <p className="text-xl text-gray-400">
            Manage your data, export backups, and configure VENUED
          </p>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Data Management */}
        <div className="space-y-6">
          <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Download className="w-6 h-6 text-neon-pink" />
              Export Data
            </h2>
            <p className="text-gray-400 mb-4">
              Download all your projects, tasks, and ADHD tracking data as a JSON file for backup.
            </p>
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-neon-pink rounded-lg text-black font-bold hover:bg-white transition-all"
            >
              Export Backup
            </button>
          </div>

          <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Upload className="w-6 h-6 text-electric-purple" />
              Import Data
            </h2>
            <p className="text-gray-400 mb-4">
              Restore your data from a previously exported JSON backup file.
            </p>
            <label className="inline-block px-6 py-3 bg-electric-purple rounded-lg text-white font-bold hover:bg-white hover:text-black transition-all cursor-pointer">
              Choose File
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-8 rounded-xl bg-white/5 border-2 border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2">Demo Data</h2>
            <p className="text-gray-400 mb-4">
              {isDemoDataLoaded()
                ? 'Demo data is currently loaded.'
                : 'Load sample projects and tasks to explore VENUED.'}
            </p>
            {!isDemoDataLoaded() && (
              <button
                onClick={handleLoadDemo}
                className="px-6 py-3 bg-neon-green rounded-lg text-black font-bold hover:bg-white transition-all"
              >
                Load Demo Data
              </button>
            )}
          </div>

          <div className="p-8 rounded-xl bg-red-500/10 border-2 border-red-500/30">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-400" />
              Clear All Data
            </h2>
            <p className="text-gray-400 mb-4">
              Permanently delete all projects, tasks, and tracking data. This cannot be undone.
            </p>

            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-6 py-3 bg-red-500/20 border-2 border-red-500/50 rounded-lg text-red-400 font-bold hover:bg-red-500/30 transition-all"
              >
                Clear All Data
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50">
                  <p className="text-red-400 font-semibold mb-2">⚠️ Are you absolutely sure?</p>
                  <p className="text-sm text-gray-400">
                    This will permanently delete all your data. Consider exporting a backup first.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearAll}
                    className="px-6 py-3 bg-red-500 rounded-lg text-white font-bold hover:bg-red-400 transition-all"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-6 py-3 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div className="mt-12 p-8 rounded-xl bg-gradient-to-br from-electric-purple/20 to-neon-pink/20 border-2 border-electric-purple/30">
          <h2 className="text-2xl font-bold text-white mb-4">About VENUED</h2>
          <div className="space-y-2 text-gray-300">
            <p>Version: 1.0.0</p>
            <p>Built for ADHD brains, by ADHD brains</p>
            <p className="text-sm text-gray-500 mt-4">
              All data is stored locally in your browser. Nothing is sent to any server.
              Install as a PWA for offline access and a better experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
