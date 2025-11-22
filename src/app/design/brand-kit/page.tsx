'use client'

import { useState, useEffect } from 'react'
import { Palette, Type, Image, Plus, Trash2, Check, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BrandKit {
  id: string
  colors: string[]
  primaryFont: string
  secondaryFont: string
  logoUrl: string | null
}

const popularFonts = [
  'Inter',
  'Montserrat',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Raleway',
  'Playfair Display',
  'Merriweather',
  'Ubuntu',
  'Nunito',
  'Oswald',
  'Work Sans',
  'PT Sans',
  'Source Sans Pro',
]

export default function BrandKitPage() {
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null)
  const [colors, setColors] = useState<string[]>([])
  const [primaryFont, setPrimaryFont] = useState('Inter')
  const [secondaryFont, setSecondaryFont] = useState('Montserrat')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [newColor, setNewColor] = useState('#ec4899')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBrandKit()
  }, [])

  const fetchBrandKit = async () => {
    try {
      const res = await fetch('/api/brand-kit')
      const data = await res.json()
      setBrandKit(data)
      setColors(data.colors || [])
      setPrimaryFont(data.primaryFont || 'Inter')
      setSecondaryFont(data.secondaryFont || 'Montserrat')
      setLogoUrl(data.logoUrl || null)
    } catch (error) {
      console.error('Error fetching brand kit:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveBrandKit = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/brand-kit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colors,
          primaryFont,
          secondaryFont,
          logoUrl,
        }),
      })

      const data = await res.json()
      setBrandKit(data)
      alert('Brand kit saved successfully!')
    } catch (error) {
      console.error('Error saving brand kit:', error)
      alert('Failed to save brand kit. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const addColor = () => {
    if (colors.includes(newColor)) {
      alert('This color is already in your palette')
      return
    }
    if (colors.length >= 10) {
      alert('Maximum 10 colors allowed')
      return
    }
    setColors([...colors, newColor])
  }

  const removeColor = (color: string) => {
    setColors(colors.filter((c) => c !== color))
  }

  const getColorName = (hex: string) => {
    // Simple color name mapping
    const colorNames: { [key: string]: string } = {
      '#ec4899': 'Pink',
      '#8b5cf6': 'Purple',
      '#f59e0b': 'Orange',
      '#ef4444': 'Red',
      '#3b82f6': 'Blue',
      '#10b981': 'Green',
      '#f59e0b': 'Amber',
      '#06b6d4': 'Cyan',
      '#6366f1': 'Indigo',
      '#84cc16': 'Lime',
    }
    return colorNames[hex.toLowerCase()] || hex
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Brand Kit
          </h1>
          <p className="text-gray-600">Manage your brand colors, fonts, and logo</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading brand kit...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Brand Colors */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Brand Colors</h2>
                  <p className="text-sm text-gray-600">Add up to 10 colors to your palette</p>
                </div>
              </div>

              {/* Color Palette */}
              <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {colors.map((color) => (
                    <div key={color} className="group relative">
                      <div
                        className="aspect-square rounded-lg shadow-md cursor-pointer relative overflow-hidden"
                        style={{ backgroundColor: color }}
                      >
                        <button
                          onClick={() => removeColor(color)}
                          className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      <p className="text-sm font-medium mt-2 text-center">{color}</p>
                    </div>
                  ))}
                </div>

                {/* Add Color */}
                {colors.length < 10 && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="h-12 cursor-pointer"
                      />
                    </div>
                    <Input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="#ec4899"
                      className="flex-1"
                    />
                    <Button onClick={addColor} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Preset Palettes */}
              <div>
                <Label className="mb-3 block">Or choose a preset palette:</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setColors(['#ec4899', '#8b5cf6', '#f59e0b'])}
                    className="justify-start"
                  >
                    <div className="flex gap-1 mr-2">
                      <div className="w-4 h-4 rounded bg-pink-500"></div>
                      <div className="w-4 h-4 rounded bg-purple-500"></div>
                      <div className="w-4 h-4 rounded bg-orange-500"></div>
                    </div>
                    Pink Purple Orange
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setColors(['#3b82f6', '#06b6d4', '#10b981'])}
                    className="justify-start"
                  >
                    <div className="flex gap-1 mr-2">
                      <div className="w-4 h-4 rounded bg-blue-500"></div>
                      <div className="w-4 h-4 rounded bg-cyan-500"></div>
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                    </div>
                    Blue Cyan Green
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setColors(['#ef4444', '#f59e0b', '#eab308'])}
                    className="justify-start"
                  >
                    <div className="flex gap-1 mr-2">
                      <div className="w-4 h-4 rounded bg-red-500"></div>
                      <div className="w-4 h-4 rounded bg-orange-500"></div>
                      <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    </div>
                    Red Orange Yellow
                  </Button>
                </div>
              </div>
            </Card>

            {/* Brand Fonts */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 flex items-center justify-center">
                  <Type className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Brand Fonts</h2>
                  <p className="text-sm text-gray-600">Select your primary and secondary fonts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primaryFont" className="mb-2 block">
                    Primary Font
                  </Label>
                  <select
                    id="primaryFont"
                    value={primaryFont}
                    onChange={(e) => setPrimaryFont(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {popularFonts.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <div
                    className="mt-3 p-4 bg-gray-50 rounded-lg text-2xl"
                    style={{ fontFamily: primaryFont }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryFont" className="mb-2 block">
                    Secondary Font
                  </Label>
                  <select
                    id="secondaryFont"
                    value={secondaryFont}
                    onChange={(e) => setSecondaryFont(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {popularFonts.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <div
                    className="mt-3 p-4 bg-gray-50 rounded-lg text-2xl"
                    style={{ fontFamily: secondaryFont }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>
              </div>
            </Card>

            {/* Brand Logo */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                  <Image className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Brand Logo</h2>
                  <p className="text-sm text-gray-600">Upload your logo to use in designs</p>
                </div>
              </div>

              {logoUrl ? (
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img src={logoUrl} alt="Brand Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Logo uploaded</p>
                    <Button
                      variant="outline"
                      onClick={() => setLogoUrl(null)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Logo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload your logo (PNG, SVG, or JPG)</p>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              )}
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={fetchBrandKit}>
                Reset
              </Button>
              <Button
                onClick={saveBrandKit}
                disabled={saving}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Brand Kit
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
