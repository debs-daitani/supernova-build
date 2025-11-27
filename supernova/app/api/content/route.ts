/**
 * API endpoint for accessing Album content
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  curateContent,
  getSection,
  getFullTrack,
  listAlbums,
} from '@/lib/content-curator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, message, mode, albumOrder, trackOrder, sectionType } = body

    switch (action) {
      case 'curate': {
        // Curate content based on user message
        if (!message || !mode) {
          return NextResponse.json(
            { error: 'Message and mode are required for curation' },
            { status: 400 }
          )
        }

        const content = await curateContent(message, mode)
        return NextResponse.json({ content })
      }

      case 'getSection': {
        // Get a specific section
        if (
          albumOrder === undefined ||
          trackOrder === undefined ||
          !sectionType
        ) {
          return NextResponse.json(
            { error: 'albumOrder, trackOrder, and sectionType are required' },
            { status: 400 }
          )
        }

        const section = await getSection(albumOrder, trackOrder, sectionType)
        return NextResponse.json({ section })
      }

      case 'getTrack': {
        // Get full track with all sections
        if (albumOrder === undefined || trackOrder === undefined) {
          return NextResponse.json(
            { error: 'albumOrder and trackOrder are required' },
            { status: 400 }
          )
        }

        const track = await getFullTrack(albumOrder, trackOrder)
        return NextResponse.json({ track })
      }

      case 'listAlbums': {
        // List all available albums
        const albums = await listAlbums()
        return NextResponse.json({ albums })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: curate, getSection, getTrack, or listAlbums' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // GET request lists all albums
    const albums = await listAlbums()
    return NextResponse.json({ albums })
  } catch (error) {
    console.error('Content API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
