'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wand2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Info,
  Loader,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EXAMPLE_PROMPTS, suggestImprovements } from '@/lib/prompt-enhancement'

interface StylePreset {
  id: string
  name: string
  description: string
  category: string
  promptModifier: string
  negativePrompt?: string
  model: string
  isPremium: boolean
}

export default function GenerateImagePage() {
  const router = useRouter()

  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [model, setModel] = useState('DALLE3')
  const [size, setSize] = useState('1024x1024')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [steps, setSteps] = useState(30)
  const [cfgScale, setCfgScale] = useState(8)
  const [seed, setSeed] = useState('')
  const [enhanceQuality, setEnhanceQuality] = useState(true)

  const [styles, setStyles] = useState<StylePreset[]>([])
  const [generating, setGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Landscapes')

  useEffect(() => {
    fetchStyles()
  }, [])

  useEffect(() => {
    if (prompt.length > 10) {
      const improvements = suggestImprovements(prompt)
      setSuggestions(improvements)
    } else {
      setSuggestions([])
    }
  }, [prompt])

  const fetchStyles = async () => {
    try {
      const res = await fetch('/api/ai-image-styles')
      const data = await res.json()
      setStyles(data)
    } catch (error) {
      console.error('Error fetching styles:', error)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt')
      return
    }

    setGenerating(true)

    try {
      const selectedStyleData = styles.find((s) => s.id === selectedStyle)

      const res = await fetch('/api/ai-images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePrompt || selectedStyleData?.negativePrompt,
          model,
          style: selectedStyleData?.name,
          size,
          steps,
          cfgScale,
          seed: seed || undefined,
          enhanceQuality,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Generation failed')
      }

      const data = await res.json()

      // Poll for completion
      if (data.status === 'GENERATING') {
        pollGenerationStatus(data.id)
      } else if (data.status === 'COMPLETED') {
        router.push(`/ai-images/${data.id}`)
      }
    } catch (error: any) {
      alert(error.message || 'Failed to generate image')
      setGenerating(false)
    }
  }

  const pollGenerationStatus = async (imageId: string) => {
    const maxAttempts = 60 // 60 seconds max
    let attempts = 0

    const poll = setInterval(async () => {
      attempts++

      try {
        const res = await fetch(`/api/ai-images/${imageId}`)
        const data = await res.json()

        if (data.status === 'COMPLETED') {
          clearInterval(poll)
          router.push(`/ai-images/${imageId}`)
        } else if (data.status === 'FAILED') {
          clearInterval(poll)
          alert('Generation failed: ' + (data.errorMessage || 'Unknown error'))
          setGenerating(false)
        } else if (attempts >= maxAttempts) {
          clearInterval(poll)
          alert('Generation timed out')
          setGenerating(false)
        }
      } catch (error) {
        clearInterval(poll)
        console.error('Error polling status:', error)
        setGenerating(false)
      }
    }, 1000)
  }

  const useExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  const modelOptions = [
    { value: 'DALLE3', label: 'DALL-E 3 (Best Quality)', tier: 'BOLD' },
    { value: 'DALLE2', label: 'DALL-E 2 (Fast)', tier: 'BOLD' },
    { value: 'STABLE_DIFFUSION', label: 'Stable Diffusion (Customizable)', tier: 'BADASS' },
    { value: 'MIDJOURNEY', label: 'Midjourney (Artistic)', tier: 'BADASS' },
  ]

  const sizeOptions: Record<string, string[]> = {
    DALLE3: ['1024x1024', '1024x1792', '1792x1024'],
    DALLE2: ['256x256', '512x512', '1024x1024'],
    STABLE_DIFFUSION: ['512x512', '512x768', '768x512', '1024x1024'],
    MIDJOURNEY: ['1024x1024', '1024x1792', '1792x1024'],
  }

  const currentExamples = EXAMPLE_PROMPTS.find((e) => e.category === selectedCategory)?.prompts || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Generate AI Image
          </h1>
          <p className="text-gray-600">Describe what you want to create</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <Card className="p-6">
              <Label htmlFor="prompt" className="text-lg font-semibold mb-3 block">
                Describe Your Image
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A serene mountain landscape at sunset with vibrant colors..."
                rows={4}
                className="mb-3"
              />

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-blue-900 mb-2">Suggestions:</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {suggestions.map((suggestion, i) => (
                          <li key={i}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Quality Enhancement Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enhanceQuality}
                  onChange={(e) => setEnhanceQuality(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  Enhance quality automatically (adds "highly detailed", "professional", etc.)
                </span>
              </label>
            </Card>

            {/* Style Selection */}
            <Card className="p-6">
              <Label className="text-lg font-semibold mb-4 block">Choose a Style (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                <button
                  onClick={() => setSelectedStyle(null)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedStyle === null
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <p className="font-medium text-sm">No Style</p>
                  <p className="text-xs text-gray-500">Use prompt as-is</p>
                </button>

                {styles.slice(0, 11).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all relative ${
                      selectedStyle === style.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    {style.isPremium && (
                      <span className="absolute top-2 right-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                        PRO
                      </span>
                    )}
                    <p className="font-medium text-sm">{style.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{style.description}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Model & Size */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="model" className="mb-2 block">
                    AI Model
                  </Label>
                  <select
                    id="model"
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value)
                      // Reset size to first valid option
                      setSize(sizeOptions[e.target.value]?.[0] || '1024x1024')
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {modelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} {option.tier === 'BADASS' ? '(PRO)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="size" className="mb-2 block">
                    Image Size
                  </Label>
                  <select
                    id="size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {(sizeOptions[model] || ['1024x1024']).map((sizeOption) => (
                      <option key={sizeOption} value={sizeOption}>
                        {sizeOption}
                        {sizeOption.includes('1792') ? ' (Portrait/Landscape)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Advanced Settings */}
            <Card className="p-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full mb-4"
              >
                <Label className="text-lg font-semibold cursor-pointer">Advanced Settings</Label>
                {showAdvanced ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {showAdvanced && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="negativePrompt" className="mb-2 block">
                      Negative Prompt
                      <span className="text-xs text-gray-500 ml-2">(What to avoid)</span>
                    </Label>
                    <Textarea
                      id="negativePrompt"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="blurry, low quality, distorted..."
                      rows={2}
                    />
                  </div>

                  {model === 'STABLE_DIFFUSION' && (
                    <>
                      <div>
                        <Label htmlFor="steps" className="mb-2 block">
                          Steps: {steps}
                          <span className="text-xs text-gray-500 ml-2">(20-50, more = better quality but slower)</span>
                        </Label>
                        <input
                          id="steps"
                          type="range"
                          min="20"
                          max="50"
                          value={steps}
                          onChange={(e) => setSteps(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cfgScale" className="mb-2 block">
                          CFG Scale: {cfgScale}
                          <span className="text-xs text-gray-500 ml-2">(7-15, higher = follows prompt more closely)</span>
                        </Label>
                        <input
                          id="cfgScale"
                          type="range"
                          min="7"
                          max="15"
                          step="0.5"
                          value={cfgScale}
                          onChange={(e) => setCfgScale(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label htmlFor="seed" className="mb-2 block">
                          Seed (Optional)
                          <span className="text-xs text-gray-500 ml-2">(For reproducibility)</span>
                        </Label>
                        <Input
                          id="seed"
                          type="text"
                          value={seed}
                          onChange={(e) => setSeed(e.target.value)}
                          placeholder="Leave empty for random"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg py-6"
            >
              {generating ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Generating... This may take up to 60 seconds
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Image
                </>
              )}
            </Button>

            {generating && (
              <div className="text-center text-sm text-gray-600">
                <p className="flex items-center justify-center gap-2">
                  <Info className="w-4 h-4" />
                  Your image is being generated. You can close this page and check back later.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Example Prompts */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Example Prompts
              </h3>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {EXAMPLE_PROMPTS.map((category) => (
                  <button
                    key={category.category}
                    onClick={() => setSelectedCategory(category.category)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      selectedCategory === category.category
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.category}
                  </button>
                ))}
              </div>

              {/* Example Prompts */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentExamples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => useExamplePrompt(example)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </Card>

            {/* Tips Card */}
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                Tips for Better Results
              </h3>
              <ul className="text-sm space-y-2 text-gray-700">
                <li>• Be specific with details and adjectives</li>
                <li>• Mention lighting (e.g., "golden hour", "studio lighting")</li>
                <li>• Specify art style or medium</li>
                <li>• Use quality modifiers like "highly detailed", "4K"</li>
                <li>• Mention camera angle if relevant</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
