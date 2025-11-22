'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'LIGHT' | 'DARK' | 'SYSTEM'

export default function AppearancePage() {
  const [theme, setTheme] = useState<Theme>('SYSTEM')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // In a real app, fetch user theme preference
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'SYSTEM'
    setTheme(savedTheme)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/user/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      })

      if (response.ok) {
        localStorage.setItem('theme', theme)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)

        // Apply theme
        applyTheme(theme)
      }
    } catch (err) {
      console.error('Error saving theme:', err)
    } finally {
      setSaving(false)
    }
  }

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement

    if (selectedTheme === 'SYSTEM') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', selectedTheme === 'DARK')
    }
  }

  const themes = [
    {
      value: 'LIGHT' as Theme,
      label: 'Light',
      description: 'Clean and bright interface',
      icon: Sun,
    },
    {
      value: 'DARK' as Theme,
      label: 'Dark',
      description: 'Easy on the eyes at night',
      icon: Moon,
    },
    {
      value: 'SYSTEM' as Theme,
      label: 'System',
      description: 'Match your system preference',
      icon: Monitor,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Appearance</h2>
        <p className="text-gray-600">Customize how the dAItaniverse looks for you</p>
      </div>

      {success && (
        <Alert variant="success" title="Success">
          Your appearance preferences have been saved successfully.
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              const isSelected = theme === themeOption.value

              return (
                <button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  className={cn(
                    'relative p-6 border-2 rounded-lg transition-all hover:border-pink-300',
                    isSelected
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-gradient-pink-purple flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <div className={cn(
                      'h-16 w-16 rounded-full flex items-center justify-center mb-3',
                      isSelected
                        ? 'bg-gradient-pink-purple text-white'
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-1">{themeOption.label}</h3>
                    <p className="text-sm text-gray-600">{themeOption.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your theme looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-pink-purple" />
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-48 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-5/6 bg-gray-100 rounded" />
              <div className="h-3 w-4/6 bg-gray-100 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gradient-pink-purple rounded" />
              <div className="h-8 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Additional appearance settings</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              Font size customization
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              Compact mode for dense layouts
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              Custom accent colors
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-300" />
              High contrast mode
            </li>
          </ul>
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
