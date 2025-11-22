'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { validatePasswordStrength } from '@/lib/password'
import { Check, X } from 'lucide-react'

export default function PasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordStrength = newPassword ? validatePasswordStrength(newPassword) : null

  const handleChangePassword = async () => {
    setSaving(true)
    setSuccess(false)
    setError(null)

    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      setSaving(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setSaving(false)
      return
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password')
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch (err) {
      setError('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const requirements = [
    { met: newPassword.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(newPassword), text: 'At least one uppercase letter' },
    { met: /[a-z]/.test(newPassword), text: 'At least one lowercase letter' },
    { met: /[0-9]/.test(newPassword), text: 'At least one number' },
    { met: /[^A-Za-z0-9]/.test(newPassword), text: 'At least one special character' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Password</h2>
        <p className="text-gray-600">Change your password to keep your account secure</p>
      </div>

      {success && (
        <Alert variant="success" title="Success">
          Your password has been changed successfully. Please use your new password for future logins.
        </Alert>
      )}

      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            We recommend using a strong, unique password that you don't use elsewhere
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
          </div>

          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />

            {/* Password Strength Indicator */}
            {newPassword && passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Password Strength:</span>
                  <span className="text-sm font-medium" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(passwordStrength.score / 4) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Password must contain:</h3>
            <ul className="space-y-1">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  {req.met ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={req.met ? 'text-green-600' : 'text-gray-600'}>
                    {req.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            size="lg"
            className="w-full"
          >
            {saving ? 'Changing Password...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Use a unique password that you don't use for other accounts</li>
            <li>Use a combination of letters, numbers, and symbols</li>
            <li>Avoid using personal information like names or birthdays</li>
            <li>Consider using a password manager to generate and store passwords</li>
            <li>Change your password regularly (every 3-6 months)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
