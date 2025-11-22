/**
 * AI Image Style Presets
 * Pre-defined styles for AI image generation with prompt modifiers
 */

export interface AIImageStylePreset {
  id: string
  name: string
  description: string
  category: string
  thumbnailUrl?: string
  promptModifier: string
  negativePrompt?: string
  model: 'DALLE3' | 'DALLE2' | 'STABLE_DIFFUSION'
  isPremium: boolean
  settings?: {
    steps?: number
    cfgScale?: number
    [key: string]: any
  }
}

export const AI_IMAGE_STYLES: AIImageStylePreset[] = [
  // ========================================
  // REALISTIC STYLES
  // ========================================
  {
    id: 'realistic-photo',
    name: 'Realistic Photo',
    description: 'Professional photography with highly detailed, realistic results',
    category: 'realistic',
    promptModifier: 'professional photography, highly detailed, 8K resolution, realistic lighting, sharp focus, photorealistic',
    negativePrompt: 'cartoon, illustration, painting, drawing, anime, sketch, low quality, blurry',
    model: 'DALLE3',
    isPremium: false,
  },

  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Movie-quality imagery with dramatic lighting and composition',
    category: 'realistic',
    promptModifier: 'cinematic lighting, dramatic composition, film grain, anamorphic lens, color graded, Hollywood style',
    negativePrompt: 'amateur, phone photo, snapshot, casual',
    model: 'DALLE3',
    isPremium: false,
  },

  {
    id: 'portrait',
    name: 'Professional Portrait',
    description: 'Studio-quality portraits with perfect lighting',
    category: 'realistic',
    promptModifier: 'professional portrait photography, studio lighting, bokeh background, 85mm lens, f/1.4, sharp focus on eyes',
    negativePrompt: 'cartoon, illustration, multiple faces, deformed',
    model: 'DALLE3',
    isPremium: false,
  },

  {
    id: 'landscape',
    name: 'Landscape Photography',
    description: 'Breathtaking landscape photos with vivid colors',
    category: 'realistic',
    promptModifier: 'landscape photography, golden hour, vivid colors, HDR, wide angle lens, dramatic sky, natural lighting',
    negativePrompt: 'people, urban, indoor, artificial',
    model: 'DALLE3',
    isPremium: false,
  },

  // ========================================
  // ARTISTIC STYLES
  // ========================================
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    description: 'Classic oil painting with visible brushstrokes',
    category: 'artistic',
    promptModifier: 'oil painting, brushstrokes, artistic, classic art style, canvas texture, rich colors, painterly',
    negativePrompt: 'photo, realistic, digital, smooth',
    model: 'DALLE3',
    isPremium: false,
  },

  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft watercolor painting with flowing colors',
    category: 'artistic',
    promptModifier: 'watercolor painting, soft colors, flowing paint, artistic, delicate, translucent layers',
    negativePrompt: 'photo, digital, sharp edges, solid colors',
    model: 'DALLE3',
    isPremium: false,
  },

  {
    id: 'impressionist',
    name: 'Impressionist',
    description: 'Impressionist art style like Monet or Renoir',
    category: 'artistic',
    promptModifier: 'impressionist painting, loose brushwork, light and color, outdoor scene, Monet style',
    negativePrompt: 'photo, realistic, sharp, modern',
    model: 'DALLE3',
    isPremium: true,
  },

  {
    id: 'abstract',
    name: 'Abstract Art',
    description: 'Modern abstract art with bold shapes and colors',
    category: 'artistic',
    promptModifier: 'abstract art, geometric shapes, bold colors, modern art, non-representational',
    negativePrompt: 'realistic, photo, detailed, figurative',
    model: 'DALLE3',
    isPremium: true,
  },

  // ========================================
  // DIGITAL ART STYLES
  // ========================================
  {
    id: 'digital-art',
    name: 'Digital Art',
    description: 'Modern digital illustration with vibrant colors',
    category: 'digital',
    promptModifier: 'digital art, concept art, trending on ArtStation, highly detailed, vibrant colors, professional illustration',
    negativePrompt: 'photo, sketch, blurry, low quality',
    model: 'DALLE3',
    isPremium: false,
  },

  {
    id: 'concept-art',
    name: 'Concept Art',
    description: 'Professional game/movie concept art',
    category: 'digital',
    promptModifier: 'concept art, matte painting, detailed environment, professional game art, cinematic composition',
    negativePrompt: 'sketch, unfinished, amateur',
    model: 'DALLE3',
    isPremium: true,
  },

  {
    id: 'vector',
    name: 'Vector Illustration',
    description: 'Clean vector-style illustration',
    category: 'digital',
    promptModifier: 'vector illustration, flat design, clean lines, minimalist, Adobe Illustrator style',
    negativePrompt: 'photo, textured, 3D, realistic',
    model: 'DALLE2',
    isPremium: false,
  },

  // ========================================
  // ANIME/MANGA STYLES
  // ========================================
  {
    id: 'anime',
    name: 'Anime',
    description: 'Japanese anime style with cel shading',
    category: 'anime',
    promptModifier: 'anime style, manga, cel shaded, vibrant colors, Japanese animation',
    negativePrompt: 'realistic, photo, 3D, western cartoon',
    model: 'STABLE_DIFFUSION',
    isPremium: false,
    settings: {
      steps: 30,
      cfgScale: 8,
    },
  },

  {
    id: 'manga',
    name: 'Manga',
    description: 'Black and white manga illustration',
    category: 'anime',
    promptModifier: 'manga illustration, black and white, screentone, ink drawing, Japanese comic style',
    negativePrompt: 'color, photo, realistic',
    model: 'STABLE_DIFFUSION',
    isPremium: false,
    settings: {
      steps: 25,
      cfgScale: 7,
    },
  },

  {
    id: 'studio-ghibli',
    name: 'Studio Ghibli Style',
    description: 'Whimsical Studio Ghibli animation style',
    category: 'anime',
    promptModifier: 'Studio Ghibli style, Hayao Miyazaki, whimsical, hand-drawn animation, soft colors, magical atmosphere',
    negativePrompt: 'realistic, photo, dark, gritty',
    model: 'STABLE_DIFFUSION',
    isPremium: true,
    settings: {
      steps: 35,
      cfgScale: 9,
    },
  },

  // ========================================
  // 3D RENDER STYLES
  // ========================================
  {
    id: '3d-render',
    name: '3D Render',
    description: 'Photorealistic 3D rendering',
    category: '3d',
    promptModifier: '3D render, octane render, cinema4d, photorealistic, ray tracing, global illumination',
    negativePrompt: '2D, flat, painting, sketch',
    model: 'STABLE_DIFFUSION',
    isPremium: false,
    settings: {
      steps: 40,
      cfgScale: 10,
    },
  },

  {
    id: 'lowpoly',
    name: 'Low Poly 3D',
    description: 'Stylized low-poly 3D art',
    category: '3d',
    promptModifier: 'low poly 3D art, geometric, faceted, stylized, clean render, isometric view',
    negativePrompt: 'realistic, high poly, photo, 2D',
    model: 'STABLE_DIFFUSION',
    isPremium: false,
    settings: {
      steps: 30,
      cfgScale: 8,
    },
  },

  {
    id: 'clay-render',
    name: 'Clay Render',
    description: 'Soft clay/plastic 3D rendering',
    category: '3d',
    promptModifier: 'clay render, pastel colors, soft lighting, 3D illustration, cute, Pixar style',
    negativePrompt: 'realistic, photo, dark, gritty',
    model: 'DALLE3',
    isPremium: false,
  },

  // ========================================
  // SPECIALTY STYLES
  // ========================================
  {
    id: 'sketch',
    name: 'Pencil Sketch',
    description: 'Hand-drawn pencil sketch',
    category: 'specialty',
    promptModifier: 'pencil sketch, hand drawn, graphite, shading, artistic drawing, black and white',
    negativePrompt: 'color, photo, digital, painting',
    model: 'DALLE2',
    isPremium: false,
  },

  {
    id: 'comic-book',
    name: 'Comic Book',
    description: 'American comic book illustration style',
    category: 'specialty',
    promptModifier: 'comic book art, ink outlines, halftone dots, bold colors, superhero style, dynamic pose',
    negativePrompt: 'photo, realistic, manga, anime',
    model: 'STABLE_DIFFUSION',
    isPremium: false,
    settings: {
      steps: 30,
      cfgScale: 8,
    },
  },

  {
    id: 'vintage',
    name: 'Vintage Photo',
    description: '1960s-70s vintage photography',
    category: 'specialty',
    promptModifier: 'vintage photography, 1970s, film grain, faded colors, retro, nostalgic, analog film',
    negativePrompt: 'modern, digital, sharp, HD',
    model: 'DALLE3',
    isPremium: false,
  },

  {
    id: 'neon',
    name: 'Neon Art',
    description: 'Vibrant neon lights and glow effects',
    category: 'specialty',
    promptModifier: 'neon lights, glowing, vibrant colors, dark background, cyberpunk aesthetic, luminescent',
    negativePrompt: 'dull, matte, natural lighting, daylight',
    model: 'STABLE_DIFFUSION',
    isPremium: true,
    settings: {
      steps: 35,
      cfgScale: 9,
    },
  },

  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic cyberpunk atmosphere',
    category: 'specialty',
    promptModifier: 'cyberpunk style, neon lights, futuristic, dark atmosphere, tech noir, blade runner aesthetic',
    negativePrompt: 'bright, natural, vintage, medieval',
    model: 'STABLE_DIFFUSION',
    isPremium: true,
    settings: {
      steps: 40,
      cfgScale: 10,
    },
  },

  {
    id: 'pixel-art',
    name: 'Pixel Art',
    description: 'Retro 8-bit/16-bit pixel art',
    category: 'specialty',
    promptModifier: 'pixel art, 16-bit, retro gaming, isometric, sharp pixels, limited color palette',
    negativePrompt: 'realistic, photo, smooth, HD',
    model: 'STABLE_DIFFUSION',
    isPremium: false,
    settings: {
      steps: 25,
      cfgScale: 7,
    },
  },
]

/**
 * Get style preset by ID
 */
export function getStyleById(id: string): AIImageStylePreset | undefined {
  return AI_IMAGE_STYLES.find((style) => style.id === id)
}

/**
 * Get styles by category
 */
export function getStylesByCategory(category: string): AIImageStylePreset[] {
  return AI_IMAGE_STYLES.filter((style) => style.category === category)
}

/**
 * Get all free styles
 */
export function getFreeStyles(): AIImageStylePreset[] {
  return AI_IMAGE_STYLES.filter((style) => !style.isPremium)
}

/**
 * Get all premium styles
 */
export function getPremiumStyles(): AIImageStylePreset[] {
  return AI_IMAGE_STYLES.filter((style) => style.isPremium)
}

/**
 * Style categories
 */
export const STYLE_CATEGORIES = [
  { id: 'realistic', name: 'Realistic', icon: '📷' },
  { id: 'artistic', name: 'Artistic', icon: '🎨' },
  { id: 'digital', name: 'Digital Art', icon: '💻' },
  { id: 'anime', name: 'Anime/Manga', icon: '🎌' },
  { id: '3d', name: '3D Render', icon: '🎬' },
  { id: 'specialty', name: 'Specialty', icon: '✨' },
]
