'use client'

import { use } from 'react'
import ComingSoon from '@/app/components/ComingSoon'
import {
  Calendar,
  FolderOpen,
  Cloud,
  UserPlus,
  Video,
  Workflow,
  Wand2,
  Image,
  Film,
  ImagePlus,
  Scissors,
  FileEdit,
  FileText,
  Table2,
  Presentation,
  Palette,
  Globe,
  Layout,
  Sparkles,
  GraduationCap,
  UsersRound,
  Award,
  Zap,
  PieChart,
  LineChart,
  Activity,
  MousePointer,
  MessageCircle,
  Users,
  CalendarClock,
  Inbox,
  ShoppingBag,
  CalendarCheck,
  Gift,
  Crown,
  Ticket,
  ArrowRightLeft,
  HelpCircle,
} from 'lucide-react'

// Feature data with descriptions
const featureData: Record<string, { title: string; description: string; category: string; icon: any }> = {
  // Business Hub
  'calendar': {
    title: 'Calendar',
    description: 'Sync your Google Calendar, schedule meetings, block focus time - all integrated with your tasks and energy levels.',
    category: 'Business Hub',
    icon: Calendar,
  },
  'documents': {
    title: 'Document Management',
    description: 'Organise files, create templates, manage all your business documents in one place.',
    category: 'Business Hub',
    icon: FolderOpen,
  },
  'cloud-storage': {
    title: 'Cloud Storage',
    description: 'Secure storage for all your business files with easy organisation and sharing.',
    category: 'Business Hub',
    icon: Cloud,
  },
  'team-collaboration': {
    title: 'Team Collaboration',
    description: 'Work with your crew - share projects, assign tasks, communicate in real-time.',
    category: 'Business Hub',
    icon: UserPlus,
  },
  'video-platform': {
    title: 'Video Platform',
    description: 'Host and organise your video content - tutorials, courses, client recordings.',
    category: 'Business Hub',
    icon: Video,
  },
  'workflows': {
    title: 'Workflows & Automation',
    description: 'Build automated workflows to handle repetitive tasks. Set it and forget it.',
    category: 'Business Hub',
    icon: Workflow,
  },

  // Creative Studio
  'ai-content': {
    title: 'AI Content Generation',
    description: 'Let AI help you write blog posts, social captions, emails and more - in YOUR voice.',
    category: 'Creative Studio',
    icon: Wand2,
  },
  'image-generation': {
    title: 'Image Generation',
    description: 'Create custom images for your brand using AI - no design skills needed.',
    category: 'Creative Studio',
    icon: Image,
  },
  'video-generation': {
    title: 'Video Generation',
    description: 'Turn scripts into videos, create promo content, build your visual library.',
    category: 'Creative Studio',
    icon: Film,
  },
  'image-editor': {
    title: 'Image Editor',
    description: 'Edit and enhance images without leaving the platform.',
    category: 'Creative Studio',
    icon: ImagePlus,
  },
  'video-editor': {
    title: 'Video Editor',
    description: 'Trim, cut, add text - basic video editing built right in.',
    category: 'Creative Studio',
    icon: Scissors,
  },
  'pdf-editor': {
    title: 'PDF Editor',
    description: 'Create, edit and annotate PDFs for proposals, contracts, workbooks.',
    category: 'Creative Studio',
    icon: FileEdit,
  },
  'document-editor': {
    title: 'Document Editor',
    description: 'Write and format documents with AI assistance.',
    category: 'Creative Studio',
    icon: FileText,
  },
  'spreadsheets': {
    title: 'Spreadsheet Editor',
    description: 'Manage data, track numbers, create reports.',
    category: 'Creative Studio',
    icon: Table2,
  },
  'presentations': {
    title: 'Presentation Editor',
    description: 'Build slides for pitches, workshops, courses.',
    category: 'Creative Studio',
    icon: Presentation,
  },
  'brand-kit': {
    title: 'Brand Kit Manager',
    description: 'Store your colours, fonts, logos - apply them across everything you create.',
    category: 'Creative Studio',
    icon: Palette,
  },
  'website-builder': {
    title: 'Website Builder',
    description: 'Build websites for yourself or your clients - drag, drop, publish.',
    category: 'Creative Studio',
    icon: Globe,
  },
  'templates': {
    title: 'Template Library',
    description: 'Pre-designed templates for social posts, documents, presentations and more.',
    category: 'Creative Studio',
    icon: Layout,
  },
  'logo-creator': {
    title: 'Logo Creator',
    description: 'Design a logo or refresh your brand identity with AI assistance.',
    category: 'Creative Studio',
    icon: Sparkles,
  },

  // Learn / Programmes
  'programmes': {
    title: 'Programme Library',
    description: 'Access curated learning paths designed for neurodivergent entrepreneurs.',
    category: 'Learn',
    icon: GraduationCap,
  },
  'content-creation-programme': {
    title: 'Content Creation Programme',
    description: 'Master content that converts - written, video, audio, social.',
    category: 'Learn',
    icon: FileText,
  },
  'social-media-programme': {
    title: 'Social Media Strategy Programme',
    description: 'Build a social presence that grows your business without burning you out.',
    category: 'Learn',
    icon: UsersRound,
  },
  'personal-branding-programme': {
    title: 'Personal Branding Programme',
    description: 'Stand out, be memorable, attract your ideal clients.',
    category: 'Learn',
    icon: Award,
  },
  'ai-leverage-programme': {
    title: 'AI Leverage Programme',
    description: 'Use AI tools to work smarter - including getting the most from SUPERNova.',
    category: 'Learn',
    icon: Zap,
  },

  // Analytics
  'analytics-dashboard': {
    title: 'Analytics Dashboard',
    description: 'See all your business data in one place - revenue, engagement, growth patterns.',
    category: 'Analytics',
    icon: PieChart,
  },
  'revenue-analytics': {
    title: 'Revenue Analytics',
    description: 'Track income, spot trends, forecast your earnings.',
    category: 'Analytics',
    icon: LineChart,
  },
  'content-performance': {
    title: 'Content Performance',
    description: 'See what\'s working - which content gets engagement, which converts.',
    category: 'Analytics',
    icon: Activity,
  },
  'user-behaviour': {
    title: 'User Behaviour',
    description: 'Understand how people interact with your content and offers.',
    category: 'Analytics',
    icon: MousePointer,
  },

  // Community
  'community-forum': {
    title: 'Community Forum',
    description: 'Connect with other neurodivergent entrepreneurs. Share wins, get support, collaborate.',
    category: 'Community',
    icon: MessageCircle,
  },
  'member-profiles': {
    title: 'Member Profiles',
    description: 'Your space to show who you are and what you do.',
    category: 'Community',
    icon: Users,
  },
  'groups': {
    title: 'Groups',
    description: 'Join or create groups around specific interests, industries, or goals.',
    category: 'Community',
    icon: UsersRound,
  },
  'events': {
    title: 'Events',
    description: 'Virtual meetups, workshops, co-working sessions with your fellow founders.',
    category: 'Community',
    icon: CalendarClock,
  },
  'direct-messages': {
    title: 'Direct Messaging',
    description: 'Connect privately with community members.',
    category: 'Community',
    icon: Inbox,
  },
  'leaderboard': {
    title: 'Leaderboard',
    description: 'Celebrate achievements and see who\'s crushing it.',
    category: 'Community',
    icon: Award,
  },

  // Money / Additional
  'ecommerce': {
    title: 'Ecommerce',
    description: 'Sell products, digital downloads, and services directly from the platform.',
    category: 'Money',
    icon: ShoppingBag,
  },
  'booking-system': {
    title: 'Booking System',
    description: 'Let clients book calls and sessions directly - synced with your calendar.',
    category: 'Money',
    icon: CalendarCheck,
  },
  'affiliate-program': {
    title: 'Affiliate/Referral System',
    description: 'Earn rewards for referring other entrepreneurs to the platform.',
    category: 'Additional',
    icon: Gift,
  },
  'membership-tiers': {
    title: 'Membership Tiers',
    description: 'Upgrade options with additional features and benefits.',
    category: 'Additional',
    icon: Crown,
  },
  'support-tickets': {
    title: 'Support Tickets',
    description: 'Get help when you need it - submit and track support requests.',
    category: 'Additional',
    icon: Ticket,
  },
  'migration-tools': {
    title: 'Migration Tools',
    description: 'Moving from another platform? We\'ll help you bring everything over.',
    category: 'Additional',
    icon: ArrowRightLeft,
  },
  'help': {
    title: 'Help Centre',
    description: 'Documentation, tutorials, and guides to help you get the most from dAItaniverse.',
    category: 'Support',
    icon: HelpCircle,
  },
}

export default function ComingSoonPage({ params }: { params: Promise<{ feature: string }> }) {
  const { feature } = use(params)
  const data = featureData[feature]

  if (!data) {
    return (
      <ComingSoon
        title="Coming Soon"
        description="This feature is currently in development. We're working hard to bring it to you!"
        category="dAItaniverse"
      />
    )
  }

  const IconComponent = data.icon

  return (
    <ComingSoon
      title={data.title}
      description={data.description}
      category={data.category}
      icon={<IconComponent size={40} />}
    />
  )
}
