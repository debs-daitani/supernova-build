'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Trash2, RefreshCw } from 'lucide-react'

interface ConnectionStatus {
  connected: boolean
  provider: string | null
  expiresAt?: string
  isExpired?: boolean
  calendarIds?: string[]
}

export default function CalendarSettingsPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchStatus()

    // Check for success/error in URL params
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'connected') {
      setMessage({ type: 'success', text: 'Successfully connected to Google Calendar!' })
    } else if (error) {
      const errorMessages: Record<string, string> = {
        access_denied: 'Access was denied. Please try again.',
        invalid_request: 'Invalid request. Please try again.',
        config_error: 'Google Calendar is not configured. Please contact support.',
        token_error: 'Failed to get access token. Please try again.',
        server_error: 'Server error occurred. Please try again.',
      }
      setMessage({ type: 'error', text: errorMessages[error] || 'An error occurred. Please try again.' })
    }
  }, [searchParams])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/calendar/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const response = await fetch('/api/calendar/connect')
      if (response.ok) {
        const data = await response.json()
        if (data.authUrl) {
          window.location.href = data.authUrl
        } else {
          setMessage({ type: 'error', text: 'Failed to get authorization URL' })
        }
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to initiate connection' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect. Please try again.' })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google Calendar? Your local events will remain, but sync will stop.')) {
      return
    }

    setDisconnecting(true)
    try {
      const response = await fetch('/api/calendar/status', { method: 'DELETE' })
      if (response.ok) {
        setStatus({ connected: false, provider: null })
        setMessage({ type: 'success', text: 'Successfully disconnected from Google Calendar' })
      } else {
        setMessage({ type: 'error', text: 'Failed to disconnect' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect. Please try again.' })
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-teal font-josefin">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Message Banner */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
          {message.type === 'success' ? (
            <CheckCircle className="text-green-400" size={20} />
          ) : (
            <AlertCircle className="text-red-400" size={20} />
          )}
          <span className={`font-josefin ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-gray-400 hover:text-white"
          >
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Google Calendar Connection */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
        <h3 className="text-xl font-supernova text-light-teal mb-4">Google Calendar</h3>
        <p className="text-gray-400 font-josefin mb-6">
          Connect your Google Calendar to sync events two-way. Your calendar events will appear in the app,
          and events you create here will sync to Google.
        </p>

        {status?.connected ? (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="text-green-400" size={24} />
              <div className="flex-1">
                <div className="font-josefin text-green-400 font-semibold">Connected</div>
                <div className="text-sm text-gray-400 font-josefin">
                  Your Google Calendar is synced
                </div>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-5 h-5"
                />
              </div>
            </div>

            {/* Token Status */}
            {status.isExpired && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertCircle className="text-yellow-400" size={20} />
                <span className="font-josefin text-yellow-400">
                  Your connection token has expired. Please reconnect.
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-josefin hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={connecting ? 'animate-spin' : ''} />
                {connecting ? 'Reconnecting...' : 'Reconnect'}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-josefin hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                <Trash2 size={18} />
                {disconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Not Connected */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-500/10 border border-gray-500/30">
              <XCircle className="text-gray-400" size={24} />
              <div className="flex-1">
                <div className="font-josefin text-gray-400 font-semibold">Not Connected</div>
                <div className="text-sm text-gray-500 font-josefin">
                  Connect your Google account to start syncing
                </div>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-3 px-6 py-3 rounded-lg bg-white text-black font-josefin font-semibold hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              {connecting ? 'Connecting...' : 'Connect Google Calendar'}
              <ExternalLink size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Sync Information */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
        <h3 className="text-xl font-supernova text-light-teal mb-4">How Sync Works</h3>
        <ul className="space-y-3 text-gray-300 font-josefin">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-light-teal/20 flex items-center justify-center text-light-teal text-sm flex-shrink-0 mt-0.5">1</div>
            <span>Events from your primary Google Calendar will be synced to your dAItaniverse calendar.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-light-teal/20 flex items-center justify-center text-light-teal text-sm flex-shrink-0 mt-0.5">2</div>
            <span>New events you create here with "Sync to Google" enabled will appear in your Google Calendar.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-light-teal/20 flex items-center justify-center text-light-teal text-sm flex-shrink-0 mt-0.5">3</div>
            <span>VENUED scheduled tasks will also appear on your calendar but won't sync to Google.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-light-teal/20 flex items-center justify-center text-light-teal text-sm flex-shrink-0 mt-0.5">4</div>
            <span>Deleting or editing synced events will update both your local and Google calendars.</span>
          </li>
        </ul>
      </div>

      {/* Privacy Note */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-light-teal/20 p-6">
        <h3 className="text-xl font-supernova text-light-teal mb-4">Privacy & Permissions</h3>
        <p className="text-gray-400 font-josefin mb-4">
          When you connect your Google Calendar, we request the following permissions:
        </p>
        <ul className="space-y-2 text-gray-300 font-josefin text-sm">
          <li className="flex items-center gap-2">
            <CheckCircle className="text-light-teal" size={16} />
            View and edit events on your primary calendar
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="text-light-teal" size={16} />
            See details of events you have access to
          </li>
        </ul>
        <p className="text-gray-500 font-josefin text-sm mt-4">
          We never share your calendar data with third parties. You can disconnect at any time.
        </p>
      </div>
    </div>
  )
}
