// AI Video Generation Configuration

// AI Models
export const AI_VIDEO_MODELS = {
  RUNWAY_GEN2: 'RUNWAY_GEN2',
  RUNWAY_GEN3: 'RUNWAY_GEN3',
  PIKA: 'PIKA',
  STABLE_VIDEO: 'STABLE_VIDEO',
} as const

export const AI_VIDEO_MODEL_NAMES = {
  RUNWAY_GEN2: 'Runway Gen-2',
  RUNWAY_GEN3: 'Runway Gen-3',
  PIKA: 'Pika Labs',
  STABLE_VIDEO: 'Stable Video Diffusion',
}

export const AI_VIDEO_MODEL_DESCRIPTIONS = {
  RUNWAY_GEN2: 'Fast, high-quality video generation',
  RUNWAY_GEN3: 'Latest model with improved quality and motion',
  PIKA: 'Creative animations and artistic styles',
  STABLE_VIDEO: 'Stable, consistent video generation',
}

// Video Styles
export const AI_VIDEO_STYLES = {
  CINEMATIC: 'CINEMATIC',
  ANIMATION: 'ANIMATION',
  REALISTIC: 'REALISTIC',
  ARTISTIC: 'ARTISTIC',
  PRODUCT_DEMO: 'PRODUCT_DEMO',
} as const

export const AI_VIDEO_STYLE_NAMES = {
  CINEMATIC: 'Cinematic',
  ANIMATION: 'Animation',
  REALISTIC: 'Realistic',
  ARTISTIC: 'Artistic',
  PRODUCT_DEMO: 'Product Demo',
}

export const AI_VIDEO_STYLE_DESCRIPTIONS = {
  CINEMATIC: 'Movie-quality with dramatic lighting and smooth camera movement',
  ANIMATION: 'Cartoon style with vibrant colors and fluid motion',
  REALISTIC: 'Photorealistic with natural lighting and real-world physics',
  ARTISTIC: 'Creative, abstract, and expressive compositions',
  PRODUCT_DEMO: 'Professional product showcase with clean backgrounds',
}

// Style Modifiers (auto-appended to prompts)
export const STYLE_MODIFIERS = {
  CINEMATIC: 'cinematic, movie quality, dramatic lighting, smooth camera movement, professional cinematography',
  ANIMATION: 'animated, cartoon style, vibrant colors, fluid motion, expressive characters',
  REALISTIC: 'photorealistic, high detail, natural lighting, real-world physics, lifelike',
  ARTISTIC: 'artistic, creative, abstract, expressive, dynamic composition, unique perspective',
  PRODUCT_DEMO: 'clean background, product focus, professional lighting, smooth rotation, commercial quality',
}

// Camera Movements
export const CAMERA_MOVEMENTS = {
  STATIC: 'STATIC',
  PAN: 'PAN',
  TILT: 'TILT',
  ZOOM: 'ZOOM',
  DOLLY: 'DOLLY',
  ORBIT: 'ORBIT',
  CRANE: 'CRANE',
} as const

export const CAMERA_MOVEMENT_NAMES = {
  STATIC: 'Static (No Movement)',
  PAN: 'Pan (Left/Right)',
  TILT: 'Tilt (Up/Down)',
  ZOOM: 'Zoom (In/Out)',
  DOLLY: 'Dolly (Forward/Backward)',
  ORBIT: 'Orbit (Around Subject)',
  CRANE: 'Crane (Vertical Movement)',
}

export const CAMERA_MOVEMENT_DESCRIPTIONS = {
  STATIC: 'Camera remains still',
  PAN: 'Camera moves horizontally left or right',
  TILT: 'Camera tilts up or down',
  ZOOM: 'Camera zooms in or out',
  DOLLY: 'Camera moves forward or backward',
  ORBIT: 'Camera rotates around the subject',
  CRANE: 'Camera moves up or down vertically',
}

// Duration Options (in seconds)
export const DURATION_OPTIONS = [3, 5, 10] as const

// Aspect Ratios
export const ASPECT_RATIOS = {
  LANDSCAPE: '16:9',
  PORTRAIT: '9:16',
  SQUARE: '1:1',
} as const

export const ASPECT_RATIO_NAMES = {
  '16:9': 'Landscape (16:9)',
  '9:16': 'Portrait (9:16)',
  '1:1': 'Square (1:1)',
}

// Tier Limits
export const TIER_LIMITS = {
  BRAVE: {
    canGenerate: false,
    monthlyQuota: 0,
    maxDuration: 0,
    availableStyles: [],
    availableModels: [],
    quality: null,
    priorityQueue: false,
  },
  BOLD: {
    canGenerate: true,
    monthlyQuota: 2,
    maxDuration: 5,
    availableStyles: ['CINEMATIC', 'ANIMATION', 'REALISTIC'],
    availableModels: ['RUNWAY_GEN2', 'PIKA'],
    quality: '720p',
    priorityQueue: false,
  },
  BADASS: {
    canGenerate: true,
    monthlyQuota: -1, // Unlimited
    maxDuration: 10,
    availableStyles: ['CINEMATIC', 'ANIMATION', 'REALISTIC', 'ARTISTIC', 'PRODUCT_DEMO'],
    availableModels: ['RUNWAY_GEN2', 'RUNWAY_GEN3', 'PIKA', 'STABLE_VIDEO'],
    quality: '1080p',
    priorityQueue: true,
  },
}

// Generation Settings
export const GENERATION_SETTINGS = {
  ESTIMATED_TIME_MIN: 30, // seconds
  ESTIMATED_TIME_MAX: 120, // seconds
  DEFAULT_MOTION_INTENSITY: 5, // 1-10
  MAX_PROMPT_LENGTH: 500,
  MAX_NEGATIVE_PROMPT_LENGTH: 300,
}

// API Costs (estimated per video)
export const API_COSTS = {
  RUNWAY_GEN2: {
    3: 0.30,
    5: 0.50,
    10: 1.00,
  },
  RUNWAY_GEN3: {
    3: 0.40,
    5: 0.70,
    10: 1.20,
  },
  PIKA: {
    3: 0.20,
    5: 0.40,
    10: 0.60,
  },
  STABLE_VIDEO: {
    3: 0.15,
    5: 0.25,
    10: 0.40,
  },
}

// Video Status
export const VIDEO_STATUS = {
  QUEUED: 'QUEUED',
  GENERATING: 'GENERATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const

// Template Categories
export const TEMPLATE_CATEGORIES = {
  PRODUCT_DEMO: 'PRODUCT_DEMO',
  EXPLAINER: 'EXPLAINER',
  SOCIAL_AD: 'SOCIAL_AD',
  BACKGROUND_LOOP: 'BACKGROUND_LOOP',
  TEXT_ANIMATION: 'TEXT_ANIMATION',
  LOGO_REVEAL: 'LOGO_REVEAL',
} as const

export const TEMPLATE_CATEGORY_NAMES = {
  PRODUCT_DEMO: 'Product Demo',
  EXPLAINER: 'Explainer Video',
  SOCIAL_AD: 'Social Media Ad',
  BACKGROUND_LOOP: 'Background Loop',
  TEXT_ANIMATION: 'Text Animation',
  LOGO_REVEAL: 'Logo Reveal',
}

// Example Prompts
export const EXAMPLE_PROMPTS = [
  {
    title: 'Ocean Wave',
    prompt: 'A serene ocean wave crashing on a beach at sunset',
    style: 'CINEMATIC',
    model: 'RUNWAY_GEN3',
    duration: 5,
  },
  {
    title: 'Futuristic City',
    prompt: 'A futuristic city with flying cars and neon lights',
    style: 'CINEMATIC',
    model: 'RUNWAY_GEN3',
    duration: 5,
  },
  {
    title: 'Coffee Pour',
    prompt: 'Close-up of coffee being poured into a cup, slow motion',
    style: 'REALISTIC',
    model: 'RUNWAY_GEN2',
    duration: 3,
  },
  {
    title: 'Logo Reveal',
    prompt: 'Animated logo reveal with particles and light effects',
    style: 'ANIMATION',
    model: 'PIKA',
    duration: 3,
  },
  {
    title: 'Flower Blooming',
    prompt: 'Time-lapse of flowers blooming in a garden',
    style: 'REALISTIC',
    model: 'RUNWAY_GEN3',
    duration: 5,
  },
  {
    title: 'Paint Swirl',
    prompt: 'Abstract colorful paint swirling in water',
    style: 'ARTISTIC',
    model: 'PIKA',
    duration: 5,
  },
  {
    title: 'Product Showcase',
    prompt: 'Smartphone rotating on a clean white background with soft lighting',
    style: 'PRODUCT_DEMO',
    model: 'RUNWAY_GEN3',
    duration: 5,
  },
  {
    title: 'Mountain Landscape',
    prompt: 'Panoramic view of mountains with clouds moving across the sky',
    style: 'CINEMATIC',
    model: 'RUNWAY_GEN3',
    duration: 10,
  },
]

// Quality Enhancers (automatically added to prompts)
export const QUALITY_ENHANCERS = [
  'high quality',
  'smooth motion',
  'detailed',
  'professional',
  'crisp',
  'sharp focus',
]

// Negative Prompt Suggestions
export const NEGATIVE_PROMPT_SUGGESTIONS = [
  'blurry',
  'distorted',
  'low quality',
  'pixelated',
  'grainy',
  'artifacts',
  'jittery motion',
  'unrealistic',
]

// Storage Settings
export const STORAGE_SETTINGS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FORMATS: ['mp4', 'mov', 'webm'],
  THUMBNAIL_WIDTH: 640,
  THUMBNAIL_HEIGHT: 360,
}

// Queue Settings
export const QUEUE_SETTINGS = {
  MAX_CONCURRENT_GENERATIONS: 3,
  MAX_QUEUE_SIZE: 50,
  PRIORITY_QUEUE_WEIGHT: 2, // BADASS users get 2x priority
}
