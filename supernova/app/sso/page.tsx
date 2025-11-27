'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Link as LinkIcon, Shield, Zap } from 'lucide-react'
import SSOStatus from '../../components/sso/SSOStatus'
import VENUEDLinkButton from '../../components/sso/VENUEDLinkButton'

/**
 * SSO Management Page
 *
 * Allows users to:
 * - View connected applications
 * - See SSO status
 * - Launch VENUED
 * - Manage account connections
 */
export default function SSOPage() {
  const router = useRouter()

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/images/dAitaniverse Stage.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="min-h-screen backdrop-blur-2xl bg-charcoal/80">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-light-teal hover:text-neon-lime font-josefin font-semibold mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-light-teal/20 to-neon-lime/20 border border-light-teal/30">
                <LinkIcon className="w-8 h-8 text-light-teal" />
              </div>
              <div>
                <h1 className="text-4xl font-arp-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-hot-pink via-light-teal to-neon-lime">
                  Single Sign-On
                </h1>
                <p className="text-gray-300 font-josefin mt-1">
                  Manage your connected applications
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-xl bg-gradient-to-br from-neon-lime/10 to-light-teal/10 border border-neon-lime/30">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-josefin font-bold text-white text-lg mb-2">Launch VENUED</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Open your ADHD-friendly project management platform
                  </p>
                </div>
                <Zap className="w-6 h-6 text-neon-lime" />
              </div>
              <VENUEDLinkButton variant="default" className="w-full" />
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-light-teal/10 to-hot-pink/10 border border-light-teal/30">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-josefin font-bold text-white text-lg mb-2">Secure Connection</h3>
                  <p className="text-sm text-gray-300">
                    Your apps use encrypted SSO tokens with 5-minute expiry
                  </p>
                </div>
                <Shield className="w-6 h-6 text-light-teal" />
              </div>
              <div className="flex items-center gap-2 text-sm font-josefin text-neon-lime">
                <div className="w-2 h-2 rounded-full bg-neon-lime animate-pulse" />
                Active & Secure
              </div>
            </div>
          </div>

          {/* SSO Status */}
          <div className="p-8 rounded-2xl backdrop-blur-xl bg-charcoal/40 border border-light-teal/20">
            <SSOStatus />
          </div>

          {/* Info Section */}
          <div className="mt-8 p-6 rounded-xl bg-charcoal/60 backdrop-blur-xl border border-light-teal/10">
            <h3 className="font-josefin font-bold text-white mb-4">How SSO Works</h3>
            <div className="space-y-3 text-sm text-gray-300 font-josefin">
              <p>
                <span className="text-light-teal font-semibold">Single Sign-On (SSO)</span> lets you access all dAItaniverse
                applications with one account.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sign in once to SUPERNova, access VENUED instantly</li>
                <li>Secure JWT tokens with 5-minute expiry</li>
                <li>Your data stays synced across all apps</li>
                <li>One account, one password, infinite possibilities</li>
              </ul>
              <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-light-teal/10">
                Security Note: SSO tokens are short-lived and automatically expire. Your session is protected
                by industry-standard encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
