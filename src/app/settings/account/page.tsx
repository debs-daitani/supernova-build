'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface AccountData {
  id: string
  email: string
  emailVerified: boolean
  username: string
  timezone: string
  language: string
  createdAt: string
}

export default function AccountPage() {
  const [account, setAccount] = useState<AccountData | null>(null)
  const [timezone, setTimezone] = useState('UTC')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchAccount()
  }, [])

  const fetchAccount = async () => {
    try {
      const response = await fetch('/api/user/account')
      const data = await response.json()
      setAccount(data)
      setTimezone(data.timezone || 'UTC')
    } catch (err) {
      console.error('Error fetching account:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/user/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Error updating account:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return

    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: deleteConfirmation, password: deletePassword }),
      })

      if (response.ok) {
        // Redirect to goodbye page or logout
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Error deleting account:', err)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Account</h2>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {success && (
        <Alert variant="success" title="Success">
          Your account settings have been updated successfully.
        </Alert>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <div className="flex items-center gap-2">
              <Input value={account?.email || ''} disabled className="bg-gray-50" />
              {account?.emailVerified ? (
                <span className="flex items-center gap-1 text-green-600 text-sm whitespace-nowrap">
                  <CheckCircle className="h-4 w-4" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600 text-sm whitespace-nowrap">
                  <AlertCircle className="h-4 w-4" />
                  Unverified
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is your primary email address for login and notifications
            </p>
          </div>

          <div>
            <Label>Username</Label>
            <Input value={account?.username || ''} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">
              Your unique username on the platform
            </p>
          </div>

          <div>
            <Label>Account ID</Label>
            <Input value={account?.id || ''} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">
              Reference this ID when contacting support
            </p>
          </div>

          <div>
            <Label>Member Since</Label>
            <Input value={account ? formatDate(account.createdAt) : ''} disabled className="bg-gray-50" />
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
          <CardDescription>Customize your regional preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Australia/Sydney">Sydney (AEDT)</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">Language</Label>
            <Select id="language" value="en" disabled>
              <option value="en">English (US)</option>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Additional languages coming soon
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-600">Delete Account</h3>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Your account will be scheduled for deletion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="warning">
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>All your websites will be unpublished</li>
                <li>All your data will be deleted after 30 days</li>
                <li>Your username will be released</li>
                <li>This action cannot be undone</li>
              </ul>
            </Alert>

            <div>
              <Label htmlFor="delete-confirmation">
                Type <strong>DELETE</strong> to confirm
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <div>
              <Label htmlFor="delete-password">Enter your password</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || !deletePassword}
            >
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
