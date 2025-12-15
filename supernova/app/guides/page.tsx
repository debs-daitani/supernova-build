'use client';

// TODO: Add auth requirement after launch (Jan 26)
// Currently PUBLIC - no login required for guides

import Link from 'next/link';
import {
  Guitar,
  MessageSquare,
  Users,
  Mail,
  BarChart3,
  Target,
  ArrowRight,
} from 'lucide-react';

interface GuideCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  available: boolean;
}

const guides: GuideCard[] = [
  {
    id: 'platform',
    title: 'dAItaniverse Platform Guide',
    description: 'The complete guide to all dAItaniverse tools - working features AND coming soon',
    icon: <Target size={48} className="text-[#C1FF00]" />,
    href: '/guides/platform',
    available: true,
  },
  {
    id: 'venued',
    title: 'VENUED App Guide',
    description: 'Master your project and task management with the rock & roll productivity app',
    icon: <Guitar size={48} className="text-[#FF008E]" />,
    href: '/guides/venued',
    available: true,
  },
  {
    id: 'supernova',
    title: 'SUPERNova Guide',
    description: 'Learn to use your AI assistant for chat, voice, and document analysis',
    icon: <MessageSquare size={48} className="text-[#00F0E9]" />,
    href: '/guides/supernova',
    available: false,
  },
  {
    id: 'crm',
    title: 'CRM Guide',
    description: 'Manage your contacts, deals, and customer relationships effectively',
    icon: <Users size={48} className="text-[#7B61FF]" />,
    href: '/guides/crm',
    available: false,
  },
  {
    id: 'email',
    title: 'Email Marketing Guide',
    description: 'Create campaigns, manage subscribers, and grow your audience',
    icon: <Mail size={48} className="text-[#FF008E]" />,
    href: '/guides/email',
    available: false,
  },
  {
    id: 'quiz',
    title: 'Quiz Builder Guide',
    description: 'Build engaging quizzes to capture leads and segment your audience',
    icon: <BarChart3 size={48} className="text-[#00F0E9]" />,
    href: '/guides/quiz',
    available: false,
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: 'Supernova, sans-serif',
              background: 'linear-gradient(135deg, #FF008E, #00F0E9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Guides & Tutorials
          </h1>
          <p className="text-xl text-gray-400">
            Learn how to rock every feature
          </p>
        </div>

        {/* Guide Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className={`relative bg-[#1a1a1a] rounded-xl border transition-all duration-300 ${
                guide.available
                  ? 'border-[#3d3d3d] hover:border-[#00F0E9] cursor-pointer group'
                  : 'border-[#3d3d3d] opacity-60'
              }`}
            >
              {guide.available ? (
                <Link href={guide.href} className="block p-6">
                  <div className="mb-4">{guide.icon}</div>
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-[#00F0E9] transition-colors">
                    {guide.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">{guide.description}</p>
                  <div className="flex items-center gap-2 text-[#00F0E9] font-medium">
                    <span>Open Guide</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ) : (
                <div className="p-6">
                  <div className="mb-4 opacity-50">{guide.icon}</div>
                  <h2 className="text-xl font-bold text-white mb-2">{guide.title}</h2>
                  <p className="text-gray-400 text-sm mb-4">{guide.description}</p>
                  <span className="inline-block px-3 py-1 bg-gray-800 text-gray-500 text-xs font-medium rounded-full">
                    COMING SOON
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Need help with something not covered here?{' '}
            <Link href="/supernova" className="text-[#00F0E9] hover:underline">
              Chat with SUPERNova
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
