'use client'

import { useState } from 'react'
import { ExternalLink, Loader2, CheckCircle, Rocket } from 'lucide-react'

interface VENUEDLinkButtonProps {
  variant?: 'default' | 'compact' | 'large'
  className?: string
}

/**
 * VENUEDLinkButton Component
 *
 * Button to launch VENUED with SSO authentication
 * Handles SSO token generation and opens VENUED in a new tab
 */
export default function VENUEDLinkButton({
  variant = 'default',
  className = '',
}: VENUEDLinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleLaunchVenued = async () => {
    try {
      setIsLoading(true)
      setStatus('idle')

      // Generate SSO token
      const response = await fetch('/api/auth/generate-sso', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate SSO token')
      }

      const { launchUrl } = await response.json()

      // Show success state briefly
      setStatus('success')

      // Open VENUED in new tab
      setTimeout(() => {
        window.open(launchUrl, '_blank', 'noopener,noreferrer')
        setIsLoading(false)
        setStatus('idle')
      }, 500)
    } catch (error) {
      console.error('Launch VENUED error:', error)
      setStatus('error')
      setIsLoading(false)

      // Reset error state after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  // Variant styles
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-xl font-josefin font-bold transition-all duration-300'

  const variantClasses = {
    large: 'px-8 py-4 text-lg',
    default: 'px-6 py-3 text-base',
    compact: 'px-4 py-2 text-sm',
  }

  const statusClasses = {
    idle: 'bg-gradient-to-r from-neon-lime to-light-teal hover:from-neon-lime/90 hover:to-light-teal/90 text-charcoal shadow-[0_0_20px_rgba(0,240,233,0.4)] hover:shadow-[0_0_30px_rgba(0,240,233,0.6)] hover:scale-105',
    success: 'bg-neon-lime text-charcoal shadow-[0_0_30px_rgba(183,255,0,0.6)]',
    error: 'bg-hot-pink text-white shadow-[0_0_30px_rgba(255,0,142,0.6)]',
  }

  return (
    <button
      onClick={handleLaunchVenued}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${statusClasses[status]} ${className} ${
        isLoading ? 'cursor-wait opacity-90' : ''
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {variant !== 'compact' && 'Launching...'}
        </>
      ) : status === 'success' ? (
        <>
          <CheckCircle className="w-5 h-5" />
          {variant !== 'compact' && 'Opening VENUED'}
        </>
      ) : status === 'error' ? (
        <>
          <ExternalLink className="w-5 h-5" />
          {variant !== 'compact' && 'Retry'}
        </>
      ) : (
        <>
          <Rocket className="w-5 h-5" />
          {variant === 'large' ? 'Launch VENUED' : variant === 'compact' ? 'VENUED' : 'LAUNCH VENUED'}
        </>
      )}
    </button>
  )
}
