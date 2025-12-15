'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Rocket,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Calendar,
  Brain,
  Users,
  ChevronRight,
  TrendingUp,
  Star,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  priority: string;
  color: string | null;
  startDate: string | null;
  targetDate: string | null;
}

interface Stats {
  totalPoints: number;
  level: number;
  tasksCompleted: number;
  focusMinutes: number;
  currentStreak: number;
  longestStreak: number;
  projectCount: number;
  completionRate: number;
}

export default function VenuedBackstagePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, statsRes] = await Promise.all([
          fetch('/api/venued/projects'),
          fetch('/api/venued/stats'),
        ]);

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(data.projects || []);
        }

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-500';
      case 'PLANNING':
        return 'bg-yellow-500';
      case 'COMPLETE':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Zap className="text-red-400" size={16} />;
      case 'MEDIUM':
        return <Target className="text-yellow-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading VENUED...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/home"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #FF008E, #00F0E9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            VENUED
          </h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { href: '/venued', label: 'Backstage', icon: Rocket, active: true },
              { href: '/venued/setlist', label: 'Setlist', icon: Star },
              { href: '/venued/crew', label: 'Crew', icon: Users },
              { href: '/venued/tour', label: 'Tour', icon: Calendar },
              { href: '/venued/entourage', label: 'Entourage', icon: Brain },
            ].map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab.active
                    ? 'border-[#FF008E] text-white'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Rocket size={16} />
              Projects
            </div>
            <div className="text-2xl font-bold text-white">{stats?.projectCount || 0}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <CheckCircle2 size={16} />
              Completed
            </div>
            <div className="text-2xl font-bold text-white">{stats?.tasksCompleted || 0}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Clock size={16} />
              Focus Time
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round((stats?.focusMinutes || 0) / 60)}h
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <TrendingUp size={16} />
              Streak
            </div>
            <div className="text-2xl font-bold text-white">{stats?.currentStreak || 0} days</div>
          </div>
        </div>

        {/* Level Badge */}
        {stats && (
          <div className="bg-gradient-to-r from-[#FF008E]/20 to-[#00F0E9]/20 rounded-xl p-4 border border-white/10 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Level {stats.level}</div>
                <div className="text-xl font-bold text-white">{stats.totalPoints} Points</div>
              </div>
              <div className="text-4xl font-bold text-[#FF008E]">🎸</div>
            </div>
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF008E] to-[#00F0E9]"
                style={{ width: `${(stats.totalPoints % 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {100 - (stats.totalPoints % 100)} points to Level {stats.level + 1}
            </div>
          </div>
        )}

        {/* Projects Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Projects</h2>
          <button
            onClick={() => router.push('/venued/setlist?new=true')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #FF008E, #00F0E9)',
              color: '#000',
            }}
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
            <Rocket className="mx-auto mb-4 text-gray-500" size={64} />
            <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to get started!</p>
            <button
              onClick={() => router.push('/venued/setlist?new=true')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
              style={{
                background: 'linear-gradient(135deg, #FF008E, #00F0E9)',
                color: '#000',
              }}
            >
              <Plus size={18} />
              Create Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/venued/setlist?project=${project.id}`}
                className="block bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[#00F0E9]/50 transition-all hover:bg-white/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: project.color || '#FF008E' }}
                    >
                      🎸
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{project.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span
                          className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}
                        />
                        {project.status}
                        {getPriorityIcon(project.priority)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: project.color || '#FF008E',
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{project.tasksCompleted}/{project.tasksTotal} tasks</span>
                  {project.targetDate && (
                    <span>Due {new Date(project.targetDate).toLocaleDateString()}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
