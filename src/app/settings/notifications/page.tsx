'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toggle } from '@/components/ui/toggle'
import { Alert } from '@/components/ui/alert'

interface Preferences {
  emailMarketing: boolean
  emailUpdates: boolean
  emailDigest: boolean
  emailSupport: boolean
  notifBrowser: boolean
  notifEmail: boolean
  notifInApp: boolean
  notifTickets: boolean
  notifCampaigns: boolean
  notifSocial: boolean
  notifWebsites: boolean
}

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState<Preferences>({
    emailMarketing: true,
    emailUpdates: true,
    emailDigest: true,
    emailSupport: true,
    notifBrowser: false,
    notifEmail: true,
    notifInApp: true,
    notifTickets: true,
    notifCampaigns: true,
    notifSocial: true,
    notifWebsites: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      const data = await response.json()
      setPreferences(data)
    } catch (err) {
      console.error('Error fetching preferences:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Error saving preferences:', err)
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (key: keyof Preferences, value: boolean) => {
    setPreferences({ ...preferences, [key]: value })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Notifications</h2>
        <p className="text-gray-600">Manage how you receive notifications</p>
      </div>

      {success && (
        <Alert variant="success" title="Success">
          Your notification preferences have been saved successfully.
        </Alert>
      )}

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose which emails you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Toggle
            id="email-marketing"
            checked={preferences.emailMarketing}
            onChange={(checked) => updatePreference('emailMarketing', checked)}
            label="Marketing Emails"
            description="Receive emails about new features, tips, and special offers"
          />

          <Toggle
            id="email-updates"
            checked={preferences.emailUpdates}
            onChange={(checked) => updatePreference('emailUpdates', checked)}
            label="Product Updates"
            description="Get notified about product updates and improvements"
          />

          <Toggle
            id="email-digest"
            checked={preferences.emailDigest}
            onChange={(checked) => updatePreference('emailDigest', checked)}
            label="Weekly Digest"
            description="Receive a weekly summary of your activity"
          />

          <Toggle
            id="email-support"
            checked={preferences.emailSupport}
            onChange={(checked) => updatePreference('emailSupport', checked)}
            label="Support Notifications"
            description="Get emails about support tickets and responses"
          />
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Manage browser and in-app notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Toggle
            id="notif-browser"
            checked={preferences.notifBrowser}
            onChange={(checked) => updatePreference('notifBrowser', checked)}
            label="Browser Notifications"
            description="Enable push notifications in your browser"
          />

          <Toggle
            id="notif-email"
            checked={preferences.notifEmail}
            onChange={(checked) => updatePreference('notifEmail', checked)}
            label="Email Notifications"
            description="Receive instant email notifications for important events"
          />

          <Toggle
            id="notif-inapp"
            checked={preferences.notifInApp}
            onChange={(checked) => updatePreference('notifInApp', checked)}
            label="In-App Notifications"
            description="Show notifications within the application"
          />
        </CardContent>
      </Card>

      {/* Feature-Specific Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Notifications</CardTitle>
          <CardDescription>Customize notifications for each feature</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Toggle
            id="notif-tickets"
            checked={preferences.notifTickets}
            onChange={(checked) => updatePreference('notifTickets', checked)}
            label="Support Tickets"
            description="Get notified about support ticket updates and responses"
          />

          <Toggle
            id="notif-campaigns"
            checked={preferences.notifCampaigns}
            onChange={(checked) => updatePreference('notifCampaigns', checked)}
            label="Marketing Campaigns"
            description="Receive notifications about campaign performance"
          />

          <Toggle
            id="notif-social"
            checked={preferences.notifSocial}
            onChange={(checked) => updatePreference('notifSocial', checked)}
            label="Social Media Posts"
            description="Get notified when social media posts are published"
          />

          <Toggle
            id="notif-websites"
            checked={preferences.notifWebsites}
            onChange={(checked) => updatePreference('notifWebsites', checked)}
            label="Website Updates"
            description="Receive notifications about website changes and publications"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
