# Video Editor & Repurposing System

Complete video editing and repurposing platform for dAItaniverse - turn long videos into short clips optimized for social media.

## Overview

The Video Editor & Repurposing System allows users to upload videos, edit them, extract clips, add captions, and optimize for different social media platforms. Replaces tools like Descript, Kapwing, and OpusClip.

## Features

### Video Management
- Upload videos (MP4, MOV, AVI, max 2GB)
- Automatic thumbnail generation
- Video library with search and filters
- Video metadata and properties
- Quota management by tier

### Video Editing
- Timeline-based editor
- Trim start/end points
- Cut/split into sections
- Remove middle sections
- Playback controls
- Waveform visualization

### Clip Creation
- Extract portions of videos
- Multiple clips from one video
- Aspect ratio conversion:
  - 16:9 (YouTube landscape)
  - 9:16 (TikTok, Reels, Shorts vertical)
  - 1:1 (Instagram square)
  - 4:5 (Instagram vertical)
- Auto-crop or manual positioning
- Blur/padding for aspect changes

### Captions & Subtitles
- Auto-generate from transcript (Whisper API)
- Edit caption text
- Caption styling (font, color, position, animation)
- Platform-specific styles (TikTok, YouTube, Professional)
- Burn into video or export .srt
- Word-by-word or line-by-line animation

### Templates
- Platform-specific templates
- Pre-configured caption styles
- Optimized export settings
- Logo and CTA overlays

## Database Schema

### Video Model
```prisma
model Video {
  id              String   @id @default(cuid())
  userId          String
  title           String
  description     String?
  originalUrl     String
  processedUrl    String?
  thumbnailUrl    String?
  duration        Int      // seconds
  width           Int
  height          Int
  fileSize        Int      // bytes
  format          String?
  status          String   // UPLOADING, PROCESSING, READY, FAILED
  uploadedAt      DateTime
  processedAt     DateTime?

  clips           VideoClip[]
  transcript      VideoTranscript?
}
```

### VideoClip Model
```prisma
model VideoClip {
  id              String   @id @default(cuid())
  videoId         String
  userId          String
  title           String
  startTime       Float    // seconds
  endTime         Float    // seconds
  duration        Float
  clipUrl         String?
  thumbnailUrl    String?
  aspectRatio     String   // 16:9, 9:16, 1:1, 4:5
  width           Int
  height          Int
  captions        Json?    // Subtitle data
  status          String   // PROCESSING, READY, FAILED
}
```

### VideoTemplate Model
```prisma
model VideoTemplate {
  id              String   @id @default(cuid())
  name            String
  platform        String   // YOUTUBE_SHORT, INSTAGRAM_REEL, TIKTOK, LINKEDIN
  aspectRatio     String
  maxDuration     Int
  captionStyle    Json     // Font, color, position
  overlays        Json?    // Logo, CTA positions
}
```

### VideoTranscript Model
```prisma
model VideoTranscript {
  id              String   @id @default(cuid())
  videoId         String   @unique
  fullText        String
  segments        Json     // Timestamped words
  language        String
}
```

## API Routes

### Videos
- `GET /api/videos` - List user's videos
- `POST /api/videos` - Create video record after upload
- `GET /api/videos/[id]` - Get video details
- `PUT /api/videos/[id]` - Update video metadata
- `DELETE /api/videos/[id]` - Delete video and clips

### Clips
- `GET /api/video-clips` - List clips (filter by videoId)
- `POST /api/video-clips` - Create new clip
- `GET /api/video-clips/[id]` - Get clip details
- `DELETE /api/video-clips/[id]` - Delete clip

### Templates
- `GET /api/video-templates` - List templates (filter by platform)

## Pages

### 1. Video Library (`/video`)
- Grid of uploaded videos
- Upload button with quota display
- Filter by status (All, Processing, Ready)
- Video cards: thumbnail, title, duration, clips count
- Actions: Edit, Create Clip, Delete

### 2. Upload Video (`/video/upload`)
- Drag-and-drop upload zone
- File validation (format, size)
- Upload progress bar
- Video title input
- Automatic processing after upload

### 3. Video Templates (`/video/templates`)
- Grid of platform templates
- Template details: aspect ratio, max duration, resolution
- Caption style preview
- Use template button

## FFmpeg Operations

### Trim Video
```bash
ffmpeg -i input.mp4 -ss START_TIME -to END_TIME -c copy output.mp4
```

### Change Aspect Ratio (with padding)
```bash
ffmpeg -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black" output.mp4
```

### Add Captions
```bash
ffmpeg -i input.mp4 -vf subtitles=captions.srt output.mp4
```

### Extract Thumbnail
```bash
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 thumbnail.jpg
```

### Extract Audio for Transcription
```bash
ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 audio.wav
```

## Transcription (OpenAI Whisper)

### API Call
```typescript
const formData = new FormData()
formData.append('file', audioFile)
formData.append('model', 'whisper-1')

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
  body: formData,
})

const transcript = await response.json()
```

### Transcript Format
```json
{
  "fullText": "Complete transcript...",
  "segments": [
    {
      "text": "Hello",
      "start": 0.0,
      "end": 0.5,
      "words": [
        { "word": "Hello", "start": 0.0, "end": 0.5 }
      ]
    }
  ]
}
```

## Caption Styles

### TikTok Style
- Font: Inter, 52px
- Color: Yellow (#FFFF00)
- Background: Black (#000000)
- Position: Middle
- Animation: Word-by-word with highlight

### YouTube Style
- Font: Roboto, 40px
- Color: White (#FFFFFF)
- Background: Black (#000000)
- Position: Bottom
- Animation: Line-by-line

### Professional
- Font: Inter, 36px
- Color: White (#FFFFFF)
- Background: Semi-transparent black
- Position: Bottom third
- Animation: Line-by-line

## Platform Templates

### YouTube Shorts
- Aspect Ratio: 9:16
- Max Duration: 60 seconds
- Resolution: 1080x1920
- Caption Style: TikTok-style captions
- Features: Logo watermark, word-by-word animation

### Instagram Reels
- Aspect Ratio: 9:16
- Max Duration: 90 seconds
- Resolution: 1080x1920
- Caption Style: Top-aligned captions
- Features: CTA overlay at end

### TikTok
- Aspect Ratio: 9:16
- Max Duration: 10 minutes
- Resolution: 1080x1920
- Caption Style: Yellow highlight, center position
- Features: Trending caption animation

### LinkedIn
- Aspect Ratio: 1:1
- Max Duration: 10 minutes
- Resolution: 1080x1080
- Caption Style: Professional, bottom third
- Features: Company logo, lower third

## Tier Limits

### BRAVE (£6/month)
- ❌ No video editing access
- Must upgrade to BOLD or BADASS

### BOLD (£26/month)
- ✅ 4 videos per month
- ✅ Basic editing (trim, crop, captions)
- ✅ Export 720p
- ✅ All free templates
- ❌ No AI transcription
- ❌ No 4K export

### BADASS (£260/year)
- ✅ Unlimited videos
- ✅ Advanced editing (transitions, effects)
- ✅ AI caption generation (Whisper)
- ✅ Export up to 4K
- ✅ All templates
- ✅ Priority processing

## Processing Queue

### Background Jobs
1. **Upload Job**: Upload video to cloud storage (S3/R2)
2. **Thumbnail Job**: Extract thumbnails at 0%, 25%, 50%, 75%
3. **Transcription Job**: Generate transcript using Whisper API
4. **Clip Job**: Extract clip using FFmpeg based on start/end times
5. **Caption Job**: Burn captions into video using FFmpeg

### Queue Management
- Process one video at a time per user
- Retry failed jobs (max 3 attempts)
- WebSocket updates for real-time status
- Email notification when complete

## Storage

### File Organization
```
videos/
  user_123/
    original/
      video_456.mp4
    processed/
      video_456_processed.mp4
    clips/
      clip_789.mp4
      clip_790.mp4
    thumbnails/
      video_456_thumb.jpg
      clip_789_thumb.jpg
```

### Storage Limits by Tier
- **BOLD**: 10GB total
- **BADASS**: 100GB total

## Quota Enforcement

```typescript
// Check monthly quota
const usage = await getUserMonthlyUsage(userId)

if (userTier === 'BOLD' && usage.contentVideosRepurposed >= 4) {
  throw new Error('Monthly video quota exceeded')
}

// After successful processing
await incrementUsage(userId, 'contentVideosRepurposed')
```

## Example Workflows

### Workflow 1: Create TikTok from YouTube Video
1. Upload long YouTube video
2. Wait for processing and transcription
3. Create clip: Select 45-second portion
4. Apply TikTok template (9:16, yellow captions)
5. Preview and export
6. Download or post directly

### Workflow 2: Repurpose for Multiple Platforms
1. Upload original video
2. Create Clip 1: YouTube Shorts (9:16, 60s)
3. Create Clip 2: Instagram Reel (9:16, 60s, top captions)
4. Create Clip 3: LinkedIn (1:1, 90s, professional captions)
5. Export all clips
6. Post to each platform

## Technical Stack

### Backend
- FFmpeg for video processing
- OpenAI Whisper API for transcription
- Background job queue (BullMQ/Redis)
- Cloud storage (AWS S3 or Cloudflare R2)

### Frontend
- Video.js for video player
- Waveform visualization
- Timeline editor component
- Drag handles for clip selection

## Future Enhancements

- [ ] AI-powered highlight detection
- [ ] Auto-generate clips from long videos
- [ ] Background music library
- [ ] Intro/outro templates
- [ ] Text animations and effects
- [ ] Green screen removal
- [ ] Speed ramping (0.5x to 2x)
- [ ] Transitions between clips
- [ ] Multi-track editing
- [ ] Collaborative editing

## Troubleshooting

### Upload Fails
- Check file size (max 2GB)
- Verify format (MP4, MOV, AVI)
- Check internet connection
- Verify quota not exceeded

### Processing Stuck
- Check background job queue
- Verify FFmpeg installed
- Check server resources
- Review error logs

### Export Issues
- Verify output format supported
- Check resolution settings
- Ensure captions properly formatted
- Review FFmpeg command output

## Cost Estimates

### Processing Costs
- Transcription (Whisper): ~$0.006 per minute
- Storage (S3): ~$0.023 per GB/month
- Processing (server): ~$0.01 per video

### Monthly Estimates
**BOLD Tier (4 videos/month avg):**
- 4 videos × 10min each = 40min
- Transcription: $0.24/month
- Storage (5GB): $0.12/month
- Processing: $0.04/month
- **Total: ~$0.40/month**

**BADASS Tier (50 videos/month avg):**
- 50 videos × 10min each = 500min
- Transcription: $3.00/month
- Storage (50GB): $1.15/month
- Processing: $0.50/month
- **Total: ~$4.65/month**

---

**Version**: 1.0.0
**Last Updated**: 2025-01-22
**Author**: dAItaniverse Team
