'use client';

import { useState, useEffect } from 'react';
import { Music, Plus } from 'lucide-react';
import Link from 'next/link';
import { Project, ProjectStatus } from '@/lib/types';
import { getProjects, calculateStats, initializeSampleData } from '@/lib/storage';
import BackstageStats from '@/components/backstage/BackstageStats';
import ProjectCard from '@/components/backstage/ProjectCard';
import FilterTabs from '@/components/backstage/FilterTabs';
import EmptyState from '@/components/backstage/EmptyState';

export default function Backstage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<ProjectStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize sample data if no projects exist
    initializeSampleData();

    // Load projects
    const loadedProjects = getProjects();
    setProjects(loadedProjects);
    setIsLoading(false);
  }, []);

  const stats = calculateStats();

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'all') return true;
    return project.status === activeFilter;
  });

  // Calculate filter counts
  const filterCounts = {
    all: projects.length,
    planning: projects.filter((p) => p.status === 'planning').length,
    live: projects.filter((p) => p.status === 'live').length,
    complete: projects.filter((p) => p.status === 'complete').length,
  };

  const handleProjectClick = (projectId: string) => {
    // For now, just log - will implement modal/navigation later
    console.log('Project clicked:', projectId);
    // TODO: Navigate to /setlist/:id or open modal
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your shows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Music className="w-10 h-10 text-neon-pink" />
              <h1 className="text-5xl font-black text-white tracking-tight">
                Backstage
              </h1>
            </div>
            <Link
              href="/setlist"
              className="group flex items-center gap-2 px-6 py-3 bg-neon-pink rounded-full text-black font-bold hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,27,141,0.4)] hover:shadow-[0_0_30px_rgba(255,27,141,0.6)]"
            >
              <Plus className="w-5 h-5" />
              New Show
            </Link>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl">
            Your command center. See what's happening, what's next, and what needs your attention.
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-neon-pink to-electric-purple mt-4" />
        </div>

        {/* Stats */}
        <BackstageStats stats={stats} />

        {/* Filter Tabs */}
        <div className="mb-8">
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={filterCounts}
          />
        </div>

        {/* Projects Grid or Empty State */}
        {filteredProjects.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
