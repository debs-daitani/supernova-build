/**
 * Video Templates for Platform-Specific Repurposing
 */

export interface VideoTemplatePreset {
  id: string
  name: string
  platform: 'YOUTUBE_SHORT' | 'INSTAGRAM_REEL' | 'TIKTOK' | 'LINKEDIN'
  aspectRatio: string
  maxDuration: number
  recommendedWidth: number
  recommendedHeight: number
  captionStyle: {
    font: string
    size: number
    color: string
    backgroundColor?: string
    position: 'top' | 'middle' | 'bottom'
    animation: 'word' | 'line' | 'none'
  }
  overlays?: {
    logo?: { position: string; size: number }
    cta?: { text: string; position: string }
  }
  description: string
}

export const VIDEO_TEMPLATES: VideoTemplatePreset[] = [
  {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    platform: 'YOUTUBE_SHORT',
    aspectRatio: '9:16',
    maxDuration: 60,
    recommendedWidth: 1080,
    recommendedHeight: 1920,
    captionStyle: {
      font: 'Inter',
      size: 48,
      color: '#FFFFFF',
      backgroundColor: '#000000',
      position: 'middle',
      animation: 'word',
    },
    overlays: {
      logo: { position: 'top-right', size: 80 },
    },
    description: 'Vertical format optimized for YouTube Shorts (max 60s)',
  },
  {
    id: 'instagram-reel',
    name: 'Instagram Reel',
    platform: 'INSTAGRAM_REEL',
    aspectRatio: '9:16',
    maxDuration: 90,
    recommendedWidth: 1080,
    recommendedHeight: 1920,
    captionStyle: {
      font: 'Montserrat',
      size: 44,
      color: '#FFFFFF',
      position: 'top',
      animation: 'word',
    },
    overlays: {
      cta: { text: 'Follow for more!', position: 'bottom' },
    },
    description: 'Vertical format for Instagram Reels (max 90s)',
  },
  {
    id: 'tiktok',
    name: 'TikTok Video',
    platform: 'TIKTOK',
    aspectRatio: '9:16',
    maxDuration: 600,
    recommendedWidth: 1080,
    recommendedHeight: 1920,
    captionStyle: {
      font: 'Inter',
      size: 52,
      color: '#FFFF00',
      backgroundColor: '#000000',
      position: 'middle',
      animation: 'word',
    },
    description: 'TikTok-style vertical video with trending captions',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Video',
    platform: 'LINKEDIN',
    aspectRatio: '1:1',
    maxDuration: 600,
    recommendedWidth: 1080,
    recommendedHeight: 1080,
    captionStyle: {
      font: 'Inter',
      size: 36,
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.7)',
      position: 'bottom',
      animation: 'line',
    },
    overlays: {
      logo: { position: 'bottom-right', size: 100 },
    },
    description: 'Professional square format for LinkedIn posts',
  },
]

export const CAPTION_STYLES = [
  {
    id: 'tiktok-style',
    name: 'TikTok Style',
    font: 'Inter',
    size: 52,
    color: '#FFFF00',
    backgroundColor: '#000000',
    position: 'middle',
    animation: 'word',
    outline: true,
  },
  {
    id: 'youtube-style',
    name: 'YouTube Style',
    font: 'Roboto',
    size: 40,
    color: '#FFFFFF',
    backgroundColor: '#000000',
    position: 'bottom',
    animation: 'line',
    outline: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    font: 'Inter',
    size: 36,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.7)',
    position: 'bottom',
    animation: 'line',
    outline: false,
  },
]

export function getTemplateById(id: string) {
  return VIDEO_TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByPlatform(platform: string) {
  return VIDEO_TEMPLATES.filter((t) => t.platform === platform)
}
