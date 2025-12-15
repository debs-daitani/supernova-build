'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalUsers: number
  totalConversations: number
  totalMessages: number
  totalVoiceMemos: number
  totalCommitments: number
  activeCommitments: number
  totalKnowledgePrograms: number
  totalContentChunks: number
  dopamineItemsOffered: number
  patternsDetected: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-black text-white p-8"
      style={{
        backgroundImage: 'url("/images/dAitaniverse Stage.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-supernova text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime mb-2">
            SUPERNova Admin
          </h1>
          <p className="text-gray-400 font-josefin">Platform management & analytics</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Users" value={stats.totalUsers} color="hot-pink" />
            <StatCard title="Conversations" value={stats.totalConversations} color="light-teal" />
            <StatCard title="Messages" value={stats.totalMessages} color="neon-lime" />
            <StatCard title="Voice Memos" value={stats.totalVoiceMemos} color="mid-teal" />
            <StatCard title="Commitments" value={`${stats.activeCommitments}/${stats.totalCommitments}`} color="hot-pink" />
            <StatCard title="Knowledge Programs" value={stats.totalKnowledgePrograms} color="light-teal" />
            <StatCard title="Content Chunks" value={stats.totalContentChunks} color="neon-lime" />
            <StatCard title="Dopamine Offered" value={stats.dopamineItemsOffered} color="mid-teal" />
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            title="Blog Manager"
            description="Create and manage blog posts for the dAItaniverse"
            href="/admin/blog"
            icon="✍️"
          />
          <ActionCard
            title="Create Quiz"
            description="Build ScoreApp-style quizzes with drag-drop questions"
            href="/admin/quiz/create"
            icon="📝"
          />
          <ActionCard
            title="Upload Knowledge"
            description="Upload PDFs, DOCXs, or Markdown files to the knowledge base"
            href="/admin/knowledge/upload"
            icon="📚"
          />
          <ActionCard
            title="Manage Users"
            description="View and manage user accounts"
            href="/admin/users"
            icon="👥"
          />
          <ActionCard
            title="View Commitments"
            description="See all user commitments and check-ins"
            href="/admin/commitments"
            icon="✅"
          />
          <ActionCard
            title="Pattern Loops"
            description="View detected pattern loops across users"
            href="/admin/patterns"
            icon="🔁"
          />
          <ActionCard
            title="Dopamine Menu"
            description="Manage dopamine menu items"
            href="/admin/dopamine"
            icon="⚡"
          />
          <ActionCard
            title="Knowledge Base"
            description="View and manage uploaded programs"
            href="/admin/knowledge"
            icon="🧠"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: number | string; color: string }) {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
      <div className="text-sm text-gray-400 font-josefin mb-2">{title}</div>
      <div className={`text-3xl font-supernova text-${color}`}>{value}</div>
    </div>
  )
}

function ActionCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <a
      href={href}
      className="block backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,233,0.3)]"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-supernova text-light-teal mb-2">{title}</h3>
      <p className="text-sm text-gray-400 font-josefin">{description}</p>
    </a>
  )
}
