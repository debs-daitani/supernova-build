import { NextRequest, NextResponse } from 'next/server'
import {
  AI_IMAGE_STYLES,
  getStyleById,
  getStylesByCategory,
  getFreeStyles,
  getPremiumStyles,
  STYLE_CATEGORIES,
} from '@/lib/ai-image-styles'

/**
 * GET /api/ai-image-styles
 * Get all AI image style presets
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const premium = searchParams.get('premium')
    const styleId = searchParams.get('id')

    // Get specific style by ID
    if (styleId) {
      const style = getStyleById(styleId)
      if (!style) {
        return NextResponse.json(
          { error: 'Style not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(style)
    }

    // Filter by category
    if (category) {
      const styles = getStylesByCategory(category)
      return NextResponse.json(styles)
    }

    // Filter by premium status
    if (premium === 'true') {
      return NextResponse.json(getPremiumStyles())
    } else if (premium === 'false') {
      return NextResponse.json(getFreeStyles())
    }

    // Return all styles
    return NextResponse.json(AI_IMAGE_STYLES)
  } catch (error) {
    console.error('Error fetching AI image styles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI image styles' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai-image-styles/categories
 * Get all style categories
 */
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(STYLE_CATEGORIES)
  } catch (error) {
    console.error('Error fetching style categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch style categories' },
      { status: 500 }
    )
  }
}
