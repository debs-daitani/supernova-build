// AI Video Utility Functions

import {
  STYLE_MODIFIERS,
  QUALITY_ENHANCERS,
  API_COSTS,
  TIER_LIMITS,
  GENERATION_SETTINGS,
} from './ai-video-config'

// Enhance prompt with style modifiers and quality enhancers
export function enhancePrompt(
  prompt: string,
  style: string,
  addQualityEnhancers: boolean = true
): string {
  let enhanced = prompt.trim()

  // Add style modifiers
  const styleModifier = STYLE_MODIFIERS[style as keyof typeof STYLE_MODIFIERS]
  if (styleModifier) {
    enhanced = `${enhanced}, ${styleModifier}`
  }

  // Add quality enhancers
  if (addQualityEnhancers) {
    enhanced = `${enhanced}, ${QUALITY_ENHANCERS.join(', ')}`
  }

  return enhanced
}

// Calculate estimated cost for video generation
export function calculateCost(model: string, duration: number): number {
  const costs = API_COSTS[model as keyof typeof API_COSTS]
  if (!costs) return 0

  return costs[duration as keyof typeof costs] || 0
}

// Estimate generation time based on duration and model
export function estimateGenerationTime(duration: number, model: string): number {
  const baseTime = GENERATION_SETTINGS.ESTIMATED_TIME_MIN
  const maxTime = GENERATION_SETTINGS.ESTIMATED_TIME_MAX

  // Longer videos take more time
  const durationMultiplier = duration / 3 // 3s is baseline

  // Different models have different speeds
  const modelMultipliers: Record<string, number> = {
    RUNWAY_GEN2: 1.0,
    RUNWAY_GEN3: 1.2,
    PIKA: 0.9,
    STABLE_VIDEO: 0.8,
  }

  const modelMultiplier = modelMultipliers[model] || 1.0

  const estimated = Math.round(baseTime * durationMultiplier * modelMultiplier)

  return Math.min(Math.max(estimated, baseTime), maxTime)
}

// Check if user can generate video based on tier
export function canGenerateVideo(
  tier: 'BRAVE' | 'BOLD' | 'BADASS',
  currentCount: number
): { allowed: boolean; reason?: string } {
  const limits = TIER_LIMITS[tier]

  if (!limits.canGenerate) {
    return {
      allowed: false,
      reason: 'AI video generation is not available on your current plan. Upgrade to BOLD or BADASS.',
    }
  }

  if (limits.monthlyQuota !== -1 && currentCount >= limits.monthlyQuota) {
    return {
      allowed: false,
      reason: `You've reached your monthly quota of ${limits.monthlyQuota} videos. Upgrade to BADASS for unlimited generation.`,
    }
  }

  return { allowed: true }
}

// Check if tier supports specific duration
export function canUseDuration(
  tier: 'BRAVE' | 'BOLD' | 'BADASS',
  duration: number
): { allowed: boolean; reason?: string } {
  const limits = TIER_LIMITS[tier]

  if (duration > limits.maxDuration) {
    return {
      allowed: false,
      reason: `Maximum duration for ${tier} tier is ${limits.maxDuration} seconds. Upgrade to access longer videos.`,
    }
  }

  return { allowed: true }
}

// Check if tier supports specific style
export function canUseStyle(
  tier: 'BRAVE' | 'BOLD' | 'BADASS',
  style: string
): { allowed: boolean; reason?: string } {
  const limits = TIER_LIMITS[tier]

  if (!limits.availableStyles.includes(style)) {
    return {
      allowed: false,
      reason: `This style is not available on your current plan. Upgrade to access all styles.`,
    }
  }

  return { allowed: true }
}

// Check if tier supports specific model
export function canUseModel(
  tier: 'BRAVE' | 'BOLD' | 'BADASS',
  model: string
): { allowed: boolean; reason?: string } {
  const limits = TIER_LIMITS[tier]

  if (!limits.availableModels.includes(model)) {
    return {
      allowed: false,
      reason: `This model is not available on your current plan. Upgrade to access all models.`,
    }
  }

  return { allowed: true }
}

// Validate prompt
export function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: 'Prompt is required' }
  }

  if (prompt.length > GENERATION_SETTINGS.MAX_PROMPT_LENGTH) {
    return {
      valid: false,
      error: `Prompt is too long (max ${GENERATION_SETTINGS.MAX_PROMPT_LENGTH} characters)`,
    }
  }

  // Check for policy violations (basic)
  const bannedTerms = ['explicit', 'nsfw', 'violence', 'gore']
  const lowerPrompt = prompt.toLowerCase()

  for (const term of bannedTerms) {
    if (lowerPrompt.includes(term)) {
      return {
        valid: false,
        error: 'Prompt contains prohibited content',
      }
    }
  }

  return { valid: true }
}

// Validate negative prompt
export function validateNegativePrompt(
  negativePrompt: string
): { valid: boolean; error?: string } {
  if (!negativePrompt) return { valid: true }

  if (negativePrompt.length > GENERATION_SETTINGS.MAX_NEGATIVE_PROMPT_LENGTH) {
    return {
      valid: false,
      error: `Negative prompt is too long (max ${GENERATION_SETTINGS.MAX_NEGATIVE_PROMPT_LENGTH} characters)`,
    }
  }

  return { valid: true }
}

// Generate seed (random number for reproducibility)
export function generateSeed(): number {
  return Math.floor(Math.random() * 1000000)
}

// Format duration for display
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) {
    return `${minutes}m`
  }

  return `${minutes}m ${remainingSeconds}s`
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Get aspect ratio dimensions
export function getAspectRatioDimensions(aspectRatio: string, baseWidth: number = 1920) {
  const ratios: Record<string, { width: number; height: number }> = {
    '16:9': { width: baseWidth, height: Math.round((baseWidth * 9) / 16) },
    '9:16': { width: Math.round((baseWidth * 9) / 16), height: baseWidth },
    '1:1': { width: baseWidth, height: baseWidth },
  }

  return ratios[aspectRatio] || ratios['16:9']
}

// Calculate queue position based on priority
export function calculateQueuePosition(
  isPriority: boolean,
  currentQueueLength: number,
  priorityCount: number
): number {
  if (isPriority) {
    return priorityCount + 1
  }

  return currentQueueLength - priorityCount + 1
}

// Estimate wait time based on queue position
export function estimateWaitTime(queuePosition: number, avgGenerationTime: number = 60): number {
  return queuePosition * avgGenerationTime
}

// Format wait time
export function formatWaitTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }

  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${
    remainingMinutes !== 1 ? 's' : ''
  }`
}

// Replace template variables
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  })

  return result
}

// Extract template variables from template string
export function extractTemplateVariables(template: string): string[] {
  const regex = /{{(\w+)}}/g
  const variables: string[] = []
  let match

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}

// Generate thumbnail from video (placeholder)
export function generateThumbnailUrl(videoUrl: string): string {
  // In production, this would use a video processing service
  // to extract the first frame and generate a thumbnail
  return videoUrl.replace('.mp4', '_thumb.jpg')
}

// Get video quality label
export function getQualityLabel(tier: 'BRAVE' | 'BOLD' | 'BADASS'): string {
  return TIER_LIMITS[tier].quality || 'N/A'
}

// Check if video is processing
export function isVideoProcessing(status: string): boolean {
  return status === 'QUEUED' || status === 'GENERATING'
}

// Check if video is ready
export function isVideoReady(status: string): boolean {
  return status === 'COMPLETED'
}

// Check if video failed
export function isVideoFailed(status: string): boolean {
  return status === 'FAILED'
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    QUEUED: 'yellow',
    GENERATING: 'blue',
    COMPLETED: 'green',
    FAILED: 'red',
  }

  return colors[status] || 'gray'
}

// Get status icon
export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    QUEUED: 'clock',
    GENERATING: 'loader',
    COMPLETED: 'check-circle',
    FAILED: 'x-circle',
  }

  return icons[status] || 'circle'
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50)
}

// Generate video filename
export function generateVideoFilename(prompt: string, id: string): string {
  const sanitized = sanitizeFilename(prompt)
  const timestamp = Date.now()
  return `${sanitized}_${id}_${timestamp}.mp4`
}
