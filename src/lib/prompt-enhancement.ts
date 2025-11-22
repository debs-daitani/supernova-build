/**
 * Prompt Enhancement Utilities
 * Help users create better prompts for AI image generation
 */

/**
 * Quality boosters to add to prompts
 */
export const QUALITY_BOOSTERS = [
  'highly detailed',
  '4K resolution',
  '8K resolution',
  'professional',
  'award winning',
  'masterpiece',
  'best quality',
  'sharp focus',
  'vivid colors',
  'high resolution',
]

/**
 * Lighting suggestions
 */
export const LIGHTING_OPTIONS = [
  'natural lighting',
  'golden hour',
  'studio lighting',
  'dramatic lighting',
  'soft lighting',
  'backlighting',
  'rim lighting',
  'volumetric lighting',
  'cinematic lighting',
  'neon lighting',
  'moonlight',
  'sunset',
  'sunrise',
]

/**
 * Camera angle suggestions
 */
export const CAMERA_ANGLES = [
  'eye level',
  'low angle',
  'high angle',
  "bird's eye view",
  'close-up',
  'medium shot',
  'wide shot',
  'over the shoulder',
  'dutch angle',
  'aerial view',
]

/**
 * Camera types/lenses
 */
export const CAMERA_TYPES = [
  '35mm lens',
  '50mm lens',
  '85mm lens',
  '24mm wide angle',
  'macro lens',
  'telephoto lens',
  'fisheye lens',
  'anamorphic lens',
  'DSLR',
  'film camera',
]

/**
 * Example prompts by category
 */
export const EXAMPLE_PROMPTS = [
  {
    category: 'Landscapes',
    prompts: [
      'A serene mountain landscape at sunset with vibrant orange and pink skies',
      'A mystical forest with glowing mushrooms and fairy lights',
      'A peaceful beach with crystal clear water and white sand',
      'Northern lights dancing over a snowy mountain range',
      'A Japanese zen garden with cherry blossoms and koi pond',
    ],
  },
  {
    category: 'Characters',
    prompts: [
      'A professional headshot of a confident businesswoman in modern office',
      'A cute cartoon character holding a coffee cup with a happy expression',
      'A futuristic cyberpunk character with neon accessories',
      'An elderly wizard with a long white beard and magical staff',
      'A friendly robot assistant with expressive LED eyes',
    ],
  },
  {
    category: 'Cityscapes',
    prompts: [
      'A futuristic city skyline with flying cars and neon lights at night',
      'A charming European cobblestone street with cafes and flowers',
      'A cyberpunk city street with holographic advertisements',
      'An aerial view of a modern metropolis at golden hour',
      'A cozy bookstore interior with warm lighting and comfortable chairs',
    ],
  },
  {
    category: 'Abstract',
    prompts: [
      'Abstract geometric patterns in vibrant gradient colors',
      'Flowing liquid metal with rainbow reflections',
      'Cosmic nebula with swirling galaxies and stars',
      'Minimalist composition with bold shapes and pastel colors',
      'Organic flowing forms in warm earth tones',
    ],
  },
  {
    category: 'Products',
    prompts: [
      'An elegant logo for a wellness brand featuring a lotus flower',
      'A modern smartphone mockup on a clean white background',
      'A luxury perfume bottle with gold accents and soft lighting',
      'A minimalist coffee package design with geometric patterns',
      'A sleek smartwatch with a metallic band on marble surface',
    ],
  },
  {
    category: 'Animals',
    prompts: [
      'A majestic lion with flowing mane in golden savanna',
      'A cute baby panda eating bamboo in a forest',
      'A colorful tropical bird perched on a vibrant flower',
      'A wise owl sitting on a moonlit branch',
      'A playful dolphin jumping through ocean waves',
    ],
  },
]

/**
 * Banned/problematic words that may violate content policies
 */
const BANNED_WORDS = [
  'violence',
  'gore',
  'blood',
  'weapon',
  'nsfw',
  'nude',
  'explicit',
  'illegal',
  'drugs',
  'hate',
]

/**
 * Check if prompt contains banned words
 */
export function checkPromptPolicy(prompt: string): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []
  const lowerPrompt = prompt.toLowerCase()

  for (const word of BANNED_WORDS) {
    if (lowerPrompt.includes(word)) {
      issues.push(`Contains potentially problematic word: "${word}"`)
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Enhance a basic prompt with quality boosters if not already present
 */
export function enhancePrompt(
  prompt: string,
  options: {
    addQuality?: boolean
    style?: string
    lighting?: string
  } = {}
): string {
  let enhanced = prompt.trim()

  // Add quality boosters if requested and not already present
  if (options.addQuality) {
    const hasQuality = QUALITY_BOOSTERS.some((booster) =>
      prompt.toLowerCase().includes(booster.toLowerCase())
    )

    if (!hasQuality) {
      enhanced += ', highly detailed, professional, best quality'
    }
  }

  // Add lighting if specified
  if (options.lighting && !prompt.toLowerCase().includes('lighting')) {
    enhanced += `, ${options.lighting}`
  }

  return enhanced
}

/**
 * Suggest improvements for a prompt
 */
export function suggestImprovements(prompt: string): string[] {
  const suggestions: string[] = []
  const lowerPrompt = prompt.toLowerCase()

  // Check if prompt is too short
  if (prompt.length < 20) {
    suggestions.push('Add more details to describe what you want to see')
  }

  // Check if quality modifiers are missing
  const hasQuality = QUALITY_BOOSTERS.some((booster) =>
    lowerPrompt.includes(booster.toLowerCase())
  )
  if (!hasQuality) {
    suggestions.push('Add quality modifiers like "highly detailed" or "professional"')
  }

  // Check if lighting is specified
  const hasLighting = LIGHTING_OPTIONS.some((light) =>
    lowerPrompt.includes(light.toLowerCase())
  )
  if (!hasLighting && !lowerPrompt.includes('abstract')) {
    suggestions.push('Specify lighting like "natural lighting" or "golden hour"')
  }

  // Check if style is mentioned
  if (!lowerPrompt.includes('style') && !lowerPrompt.includes('art')) {
    suggestions.push('Specify an art style or medium')
  }

  // Check for vague words
  const vagueWords = ['nice', 'good', 'beautiful', 'amazing']
  const hasVague = vagueWords.some((word) => lowerPrompt.includes(word))
  if (hasVague) {
    suggestions.push('Replace vague adjectives with specific descriptive terms')
  }

  return suggestions
}

/**
 * Extract keywords from prompt for search/filtering
 */
export function extractKeywords(prompt: string): string[] {
  // Remove common words
  const commonWords = [
    'a',
    'an',
    'the',
    'with',
    'and',
    'or',
    'in',
    'on',
    'at',
    'to',
    'of',
    'for',
  ]

  const words = prompt
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3 && !commonWords.includes(word))

  // Return unique keywords
  return Array.from(new Set(words))
}

/**
 * Get prompt templates by category
 */
export function getPromptTemplates(category: string): string[] {
  const template = EXAMPLE_PROMPTS.find(
    (t) => t.category.toLowerCase() === category.toLowerCase()
  )
  return template?.prompts || []
}

/**
 * Generate negative prompt suggestions based on style
 */
export function suggestNegativePrompt(style?: string): string {
  const baseNegative = 'low quality, blurry, distorted, disfigured, ugly, bad anatomy'

  const styleSpecific: Record<string, string> = {
    realistic: 'cartoon, illustration, painting, drawing, anime',
    artistic: 'photo, realistic, digital',
    anime: 'realistic, photo, 3D, western cartoon',
    '3d': '2D, flat, painting, sketch',
    digital: 'photo, sketch, traditional media',
  }

  if (style && styleSpecific[style]) {
    return `${baseNegative}, ${styleSpecific[style]}`
  }

  return baseNegative
}

/**
 * Calculate estimated generation time based on model and settings
 */
export function estimateGenerationTime(
  model: string,
  settings?: { steps?: number }
): number {
  // Times in seconds
  const baseTimes: Record<string, number> = {
    DALLE3: 15,
    DALLE2: 10,
    MIDJOURNEY: 60,
    STABLE_DIFFUSION: 30,
  }

  let time = baseTimes[model] || 30

  // Adjust for steps if using Stable Diffusion
  if (model === 'STABLE_DIFFUSION' && settings?.steps) {
    time = (settings.steps / 30) * 30 // Scale based on steps
  }

  return time
}

/**
 * Validate image size for model
 */
export function validateSize(model: string, size: string): boolean {
  const validSizes: Record<string, string[]> = {
    DALLE3: ['1024x1024', '1024x1792', '1792x1024'],
    DALLE2: ['256x256', '512x512', '1024x1024'],
    STABLE_DIFFUSION: ['512x512', '512x768', '768x512', '768x768', '1024x1024'],
    MIDJOURNEY: ['1024x1024', '1024x1792', '1792x1024', '2048x2048'],
  }

  return validSizes[model]?.includes(size) || false
}
