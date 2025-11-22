'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'
import { Upload, X } from 'lucide-react'

interface ProfileData {
  firstName: string
  lastName: string
  bio: string
  pronouns: string
  twitterHandle: string
  linkedinUrl: string
  instagramHandle: string
  websiteUrl: string
  profilePhotoUrl?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    bio: '',
    pronouns: '',
    twitterHandle: '',
    linkedinUrl: '',
    instagramHandle: '',
    websiteUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      setProfile(data)
      setCharCount(data.bio?.length || 0)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    setError(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    try {
      const response = await fetch('/api/user/photo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile({ ...profile, profilePhotoUrl: data.profilePhotoUrl })
      }
    } catch (err) {
      console.error('Error uploading photo:', err)
    }
  }

  const handlePhotoRemove = async () => {
    try {
      const response = await fetch('/api/user/photo', { method: 'DELETE' })
      if (response.ok) {
        setProfile({ ...profile, profilePhotoUrl: undefined })
      }
    } catch (err) {
      console.error('Error removing photo:', err)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Profile</h2>
        <p className="text-gray-600">Manage your public profile information</p>
      </div>

      {success && (
        <Alert variant="success" title="Success">
          Your profile has been updated successfully.
        </Alert>
      )}

      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Upload a profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-pink-purple flex items-center justify-center text-white text-3xl font-bold">
              {profile.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span>{profile.firstName?.[0] || 'U'}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              {profile.profilePhotoUrl && (
                <Button variant="ghost" onClick={handlePhotoRemove}>
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your name and personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="pronouns">Pronouns</Label>
            <Select
              id="pronouns"
              value={profile.pronouns}
              onChange={(e) => setProfile({ ...profile, pronouns: e.target.value })}
            >
              <option value="">Select pronouns</option>
              <option value="she/her">she/her</option>
              <option value="he/him">he/him</option>
              <option value="they/them">they/them</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => {
                setProfile({ ...profile, bio: e.target.value })
                setCharCount(e.target.value.length)
              }}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{charCount}/500 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                @
              </span>
              <Input
                id="twitter"
                value={profile.twitterHandle}
                onChange={(e) => setProfile({ ...profile, twitterHandle: e.target.value })}
                placeholder="username"
                className="rounded-l-none"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                @
              </span>
              <Input
                id="instagram"
                value={profile.instagramHandle}
                onChange={(e) => setProfile({ ...profile, instagramHandle: e.target.value })}
                placeholder="username"
                className="rounded-l-none"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              value={profile.linkedinUrl}
              onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <Label htmlFor="website">Personal Website</Label>
            <Input
              id="website"
              type="url"
              value={profile.websiteUrl}
              onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
