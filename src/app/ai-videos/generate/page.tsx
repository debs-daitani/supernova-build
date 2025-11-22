'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Wand2, Film, Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AI_VIDEO_MODELS,
  AI_VIDEO_MODEL_NAMES,
  AI_VIDEO_STYLES,
  AI_VIDEO_STYLE_NAMES,
  AI_VIDEO_STYLE_DESCRIPTIONS,
  CAMERA_MOVEMENTS,
  CAMERA_MOVEMENT_NAMES,
  DURATION_OPTIONS,
  ASPECT_RATIOS,
  ASPECT_RATIO_NAMES,
  EXAMPLE_PROMPTS,
  TIER_LIMITS,
} from '@/lib/ai-video-config'
import {
  calculateCost,
  estimateGenerationTime,
} from '@/lib/ai-video-utils'

export default function GenerateVideoPage() {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Form state
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [model, setModel] = useState('RUNWAY_GEN3')
  const [style, setStyle] = useState('CINEMATIC')
  const [duration, setDuration] = useState(5)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [motionIntensity, setMotionIntensity] = useState(5)
  const [cameraMovement, setCameraMovement] = useState('STATIC')

  // User tier (TODO: Get from auth)
  const userTier: 'BRAVE' | 'BOLD' | 'BADASS' = 'BOLD'
  const tierLimits = TIER_LIMITS[userTier]

  const estimatedCost = calculateCost(model, duration)
  const estimatedTime = estimateGenerationTime(duration, model)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt')
      return
    }

    setGenerating(true)

    try {
      const res = await fetch('/api/ai-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePrompt || undefined,
          model,
          style,
          duration,
          aspectRatio,
          motionIntensity,
          cameraMovement,
        }),
      })

      if (res.ok) {
        const video = await res.json()
        router.push(`/ai-videos/${video.id}`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to generate video')
      }
    } catch (error) {
      console.error('Error generating video:', error)
      alert('Failed to generate video. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const useExamplePrompt = (example: typeof EXAMPLE_PROMPTS[0]) => {
    setPrompt(example.prompt)
    setStyle(example.style)
    setModel(example.model)
    setDuration(example.duration)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Generate AI Video
          </h1>
          <p className="text-gray-600">Create stunning videos from text prompts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Describe Your Video</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A serene ocean wave crashing on a beach at sunset"
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">{prompt.length} / 500</span>
              </div>
            </Card>

            {/* Style Selection */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Style</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(AI_VIDEO_STYLES).map(([key, value]) => {
                  const isAvailable = tierLimits.availableStyles.includes(value)
                  return (
                    <button
                      key={key}
                      onClick={() => isAvailable && setStyle(value)}
                      disabled={!isAvailable}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        style === value
                          ? 'border-purple-500 bg-purple-50'
                          : isAvailable
                          ? 'border-gray-300 hover:border-purple-300'
                          : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-semibold mb-1">{AI_VIDEO_STYLE_NAMES[value]}</div>
                      <div className="text-xs text-gray-600">
                        {AI_VIDEO_STYLE_DESCRIPTIONS[value]}
                      </div>
                      {!isAvailable && (
                        <div className="text-xs text-orange-600 mt-1">Upgrade required</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Model, Duration, Aspect Ratio */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Settings</h2>

              <div className="space-y-4">
                {/* Model */}
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {Object.entries(AI_VIDEO_MODELS).map(([key, value]) => {
                      const isAvailable = tierLimits.availableModels.includes(value)
                      return (
                        <option key={key} value={value} disabled={!isAvailable}>
                          {AI_VIDEO_MODEL_NAMES[value as keyof typeof AI_VIDEO_MODEL_NAMES]}
                          {!isAvailable ? ' (Upgrade required)' : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Duration (max {tierLimits.maxDuration}s)
                  </label>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((d) => {
                      const isAvailable = d <= tierLimits.maxDuration
                      return (
                        <button
                          key={d}
                          onClick={() => isAvailable && setDuration(d)}
                          disabled={!isAvailable}
                          className={`flex-1 py-3 border-2 rounded-lg font-semibold transition-all ${
                            duration === d
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : isAvailable
                              ? 'border-gray-300 hover:border-purple-300'
                              : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {d}s
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(ASPECT_RATIOS).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setAspectRatio(value)}
                        className={`py-3 border-2 rounded-lg font-semibold transition-all ${
                          aspectRatio === value
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        {ASPECT_RATIO_NAMES[value]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Advanced Settings */}
            <Card className="p-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full"
              >
                <h2 className="text-xl font-bold">Advanced Settings</h2>
                {showAdvanced ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  {/* Negative Prompt */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Negative Prompt (Optional)</label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="e.g., blurry, low quality, distorted"
                      rows={2}
                      maxLength={300}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Motion Intensity */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Motion Intensity: {motionIntensity}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={motionIntensity}
                      onChange={(e) => setMotionIntensity(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Subtle</span>
                      <span>Intense</span>
                    </div>
                  </div>

                  {/* Camera Movement */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Camera Movement</label>
                    <select
                      value={cameraMovement}
                      onChange={(e) => setCameraMovement(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {Object.entries(CAMERA_MOVEMENTS).map(([key, value]) => (
                        <option key={key} value={value}>
                          {CAMERA_MOVEMENT_NAMES[value as keyof typeof CAMERA_MOVEMENT_NAMES]}
                        </option>
                      ))}
                    </select>
                  </div>
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
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Generate Video
                </span>
              )}
            </Button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Generation Info */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Generation Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Time
                  </span>
                  <span className="font-semibold">{estimatedTime}s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Estimated Cost
                  </span>
                  <span className="font-semibold">£{estimatedCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Quality
                  </span>
                  <span className="font-semibold">{tierLimits.quality}</span>
                </div>
              </div>
            </Card>

            {/* Example Prompts */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Example Prompts</h3>
              <div className="space-y-2">
                {EXAMPLE_PROMPTS.slice(0, 5).map((example, index) => (
                  <button
                    key={index}
                    onClick={() => useExamplePrompt(example)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                  >
                    <div className="font-semibold text-sm mb-1">{example.title}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">{example.prompt}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
