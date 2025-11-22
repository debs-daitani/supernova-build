# AI Video Generation System Documentation

## Overview

The dAItaniverse AI Video Generation System allows users to create stunning AI-generated videos from text prompts using state-of-the-art models like Runway Gen-2/Gen-3, Pika Labs, and Stable Video Diffusion. The system features tier-based quotas, multiple styles, camera movements, and a complete queue management system.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Tier-Based Permissions](#tier-based-permissions)
3. [Features](#features)
4. [Pages & Routes](#pages--routes)
5. [API Endpoints](#api-endpoints)
6. [AI Models](#ai-models)
7. [Video Styles](#video-styles)
8. [Camera Movements](#camera-movements)
9. [Generation Queue](#generation-queue)
10. [Configuration](#configuration)

---

## Database Schema

### AIVideo Model

Stores all generated videos with their settings and status.

```typescript
model AIVideo {
  id              String   @id @default(cuid())
  userId          String
  prompt          String   @db.Text
  negativePrompt  String?  @db.Text
  model           String   // RUNWAY_GEN2, RUNWAY_GEN3, PIKA, STABLE_VIDEO
  style           String   // CINEMATIC, ANIMATION, REALISTIC, ARTISTIC, PRODUCT_DEMO
  duration        Int      // Duration in seconds (3, 5, 10)
  aspectRatio     String   @default("16:9") // 16:9, 9:16, 1:1
  videoUrl        String?
  thumbnailUrl    String?
  seed            Int?     // For reproducibility
  status          String   @default("QUEUED") // QUEUED, GENERATING, COMPLETED, FAILED
  errorMessage    String?  @db.Text
  generationTime  Int?     // Time taken in seconds
  motionIntensity Int?     // 1-10
  cameraMovement  String?  // STATIC, PAN, TILT, ZOOM, DOLLY, ORBIT, CRANE
  isPublic        Boolean  @default(false)
  generatedAt     DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([model])
  @@index([style])
  @@index([isPublic])
  @@index([createdAt])
}
```

**Key Fields:**
- `prompt`: Enhanced prompt with style modifiers
- `status`: QUEUED → GENERATING → COMPLETED/FAILED
- `seed`: Random number for reproducibility
- `videoUrl`: Cloud storage URL
- `generationTime`: Actual time taken to generate

### AIVideoTemplate Model

Pre-built templates for common video types.

```typescript
model AIVideoTemplate {
  id              String   @id @default(cuid())
  userId          String?  // Null for public/system templates
  name            String
  description     String?  @db.Text
  category        String   // PRODUCT_DEMO, EXPLAINER, SOCIAL_AD, etc.
  thumbnailUrl    String?
  previewUrl      String?
  promptTemplate  String   @db.Text // Template with {{variables}}
  model           String   @default("RUNWAY_GEN3")
  style           String   @default("CINEMATIC")
  duration        Int      @default(5)
  aspectRatio     String   @default("16:9")
  motionIntensity Int?
  cameraMovement  String?
  isPublic        Boolean  @default(true)
  usageCount      Int      @default(0)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([category])
  @@index([isPublic])
}
```

**Template Variables:**
Templates support variable replacement:
```
"{{product}} rotating on a clean white background"
```

---

## Tier-Based Permissions

### BRAVE (£6/month)
- **Can Generate:** ❌ No
- **Monthly Quota:** 0 videos
- **Max Duration:** N/A
- **Available Styles:** None
- **Available Models:** None
- **Quality:** N/A

### BOLD (£26/month)
- **Can Generate:** ✅ Yes
- **Monthly Quota:** 2 videos/month
- **Max Duration:** 5 seconds
- **Available Styles:** Cinematic, Animation, Realistic
- **Available Models:** Runway Gen-2, Pika
- **Quality:** 720p
- **Priority Queue:** ❌ No

### BADASS (£260/year)
- **Can Generate:** ✅ Yes
- **Monthly Quota:** Unlimited
- **Max Duration:** 10 seconds
- **Available Styles:** All (Cinematic, Animation, Realistic, Artistic, Product Demo)
- **Available Models:** All (Runway Gen-2, Gen-3, Pika, Stable Video)
- **Quality:** 1080p
- **Priority Queue:** ✅ Yes (2x weight)

**Quota Enforcement:**
- Checked before video generation
- Reset monthly
- Upgrade prompts shown when exceeded

---

## Features

### ✅ Video Generation
- Text-to-video AI generation
- Multiple AI models (Runway, Pika, Stable Video)
- 5 distinct styles (Cinematic, Animation, Realistic, Artistic, Product Demo)
- Duration options: 3s, 5s, 10s
- Aspect ratios: 16:9, 9:16, 1:1
- Motion intensity control (1-10)
- 7 camera movement options
- Negative prompts for quality control
- Seed-based reproducibility

### ✅ Video Management
- Gallery view with filters
- Search by prompt
- Filter by style, model, status
- Download videos (MP4)
- Delete videos
- Regenerate with same settings
- Public/private visibility toggle
- Video detail view with all settings

### ✅ Templates
- Pre-built video templates
- 6 template categories
- Template preview videos
- Variable replacement
- Usage count tracking
- Public template library

### ✅ Queue System
- Real-time queue status
- Queue position display
- Estimated wait time
- Priority queue for BADASS tier
- Currently generating indicator
- Completed/failed history
- Auto-refresh every 5 seconds

### ✅ Prompt Enhancement
- Automatic style modifiers
- Quality enhancers
- Camera movement suggestions
- Example prompts library
- Prompt validation
- Policy violation detection

---

## Pages & Routes

### User Pages

| Page | Route | Description |
|------|-------|-------------|
| AI Videos Home | `/ai-videos` | Homepage with quota display |
| Generate Video | `/ai-videos/generate` | Video generation form |
| Video Gallery | `/ai-videos/gallery` | Browse all videos |
| Video Detail | `/ai-videos/[id]` | View single video |
| Templates | `/ai-videos/templates` | Browse templates |
| Generation Queue | `/ai-videos/queue` | Queue status |

---

## API Endpoints

### Videos

```typescript
// List videos
GET /api/ai-videos
Query: userId, status, style, model, public, page, limit

// Get single video
GET /api/ai-videos/[id]

// Generate video
POST /api/ai-videos
Body: prompt, negativePrompt, model, style, duration, aspectRatio, motionIntensity, cameraMovement, seed

// Update video (visibility)
PATCH /api/ai-videos/[id]
Body: isPublic

// Delete video
DELETE /api/ai-videos/[id]

// Regenerate video
POST /api/ai-videos/[id]/regenerate
```

### Templates

```typescript
// List templates
GET /api/ai-videos/templates
Query: category, public

// Create template
POST /api/ai-videos/templates
Body: name, description, category, promptTemplate, model, style, duration, etc.
```

### Queue

```typescript
// Get queue status
GET /api/ai-videos/queue
Returns: queue, currentlyGenerating, completed, failed
```

---

## AI Models

### Runway Gen-2
- **Speed:** Fast (1.0x baseline)
- **Quality:** High
- **Cost:** £0.30 (3s), £0.50 (5s), £1.00 (10s)
- **Best For:** General purpose, quick iterations

### Runway Gen-3
- **Speed:** Medium (1.2x baseline)
- **Quality:** Highest
- **Cost:** £0.40 (3s), £0.70 (5s), £1.20 (10s)
- **Best For:** Cinematic quality, professional use

### Pika Labs
- **Speed:** Fast (0.9x baseline)
- **Quality:** Creative
- **Cost:** £0.20 (3s), £0.40 (5s), £0.60 (10s)
- **Best For:** Animations, artistic styles

### Stable Video Diffusion
- **Speed:** Fastest (0.8x baseline)
- **Quality:** Good
- **Cost:** £0.15 (3s), £0.25 (5s), £0.40 (10s)
- **Best For:** Quick previews, budget-friendly

---

## Video Styles

### Cinematic
**Modifiers:** `cinematic, movie quality, dramatic lighting, smooth camera movement, professional cinematography`

**Best For:**
- Movie-style scenes
- Dramatic narratives
- Professional content

**Examples:**
- Ocean waves at sunset
- Mountain landscapes
- Urban cityscapes

### Animation
**Modifiers:** `animated, cartoon style, vibrant colors, fluid motion, expressive characters`

**Best For:**
- Cartoon-style content
- Children's content
- Playful videos

**Examples:**
- Logo reveals
- Character animations
- Abstract motion graphics

### Realistic
**Modifiers:** `photorealistic, high detail, natural lighting, real-world physics, lifelike`

**Best For:**
- Product photography
- Nature documentaries
- Real-world simulations

**Examples:**
- Coffee being poured
- Flowers blooming
- Product demonstrations

### Artistic
**Modifiers:** `artistic, creative, abstract, expressive, dynamic composition, unique perspective`

**Best For:**
- Creative projects
- Abstract art
- Experimental videos

**Examples:**
- Paint swirling
- Abstract patterns
- Surreal scenes

### Product Demo
**Modifiers:** `clean background, product focus, professional lighting, smooth rotation, commercial quality`

**Best For:**
- E-commerce
- Product launches
- Marketing materials

**Examples:**
- Phone rotation
- Watch showcase
- Product unboxing

---

## Camera Movements

### Static
- **Description:** Camera remains still
- **Best For:** Detailed shots, stable compositions
- **Use Case:** Product close-ups, portraits

### Pan (Left/Right)
- **Description:** Horizontal camera movement
- **Best For:** Landscapes, revealing scenes
- **Use Case:** City skylines, room tours

### Tilt (Up/Down)
- **Description:** Vertical camera movement
- **Best For:** Tall subjects, buildings
- **Use Case:** Skyscrapers, trees

### Zoom (In/Out)
- **Description:** Camera moves closer or further
- **Best For:** Focus shifts, dramatic reveals
- **Use Case:** Product focus, emotional moments

### Dolly (Forward/Backward)
- **Description:** Camera moves toward or away from subject
- **Best For:** Immersive shots, depth perception
- **Use Case:** Approaching doors, walking scenes

### Orbit
- **Description:** Camera rotates around subject
- **Best For:** 360° product views
- **Use Case:** Product showcases, character reveals

### Crane (Up/Down)
- **Description:** Vertical camera movement (crane shot)
- **Best For:** Establishing shots, grand reveals
- **Use Case:** Building exteriors, aerial perspectives

---

## Generation Queue

### Queue Flow

1. **User submits prompt** → Video created with status `QUEUED`
2. **Queue system picks up video** → Status changes to `GENERATING`
3. **AI model processes video** → 30-120 seconds
4. **Video completed** → Status changes to `COMPLETED`, video URL stored
5. **User notified** → (via WebSocket or polling)

### Priority System

**BADASS users get 2x priority weight:**
- Regular user in position 10 → Actual wait: 10 videos
- BADASS user in position 10 → Actual wait: ~5 videos

### Queue Management

```typescript
// Calculate queue position
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

// Estimate wait time
export function estimateWaitTime(
  queuePosition: number,
  avgGenerationTime: number = 60
): number {
  return queuePosition * avgGenerationTime
}
```

---

## Configuration

### Generation Settings

```typescript
export const GENERATION_SETTINGS = {
  ESTIMATED_TIME_MIN: 30, // seconds
  ESTIMATED_TIME_MAX: 120, // seconds
  DEFAULT_MOTION_INTENSITY: 5, // 1-10
  MAX_PROMPT_LENGTH: 500,
  MAX_NEGATIVE_PROMPT_LENGTH: 300,
}
```

### Storage Settings

```typescript
export const STORAGE_SETTINGS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FORMATS: ['mp4', 'mov', 'webm'],
  THUMBNAIL_WIDTH: 640,
  THUMBNAIL_HEIGHT: 360,
}
```

### Queue Settings

```typescript
export const QUEUE_SETTINGS = {
  MAX_CONCURRENT_GENERATIONS: 3,
  MAX_QUEUE_SIZE: 50,
  PRIORITY_QUEUE_WEIGHT: 2, // BADASS users
}
```

---

## Usage Examples

### Generating a Video

```typescript
const response = await fetch('/api/ai-videos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A serene ocean wave crashing on a beach at sunset',
    model: 'RUNWAY_GEN3',
    style: 'CINEMATIC',
    duration: 5,
    aspectRatio: '16:9',
    motionIntensity: 7,
    cameraMovement: 'PAN',
  }),
})

const video = await response.json()
// Returns: { id, status: 'QUEUED', ... }
```

### Checking Queue Status

```typescript
const response = await fetch('/api/ai-videos/queue')
const data = await response.json()

console.log(`Queue position: ${data.userPosition}`)
console.log(`Estimated wait: ${data.queue[0].estimatedWaitTime}s`)
```

### Regenerating a Video

```typescript
const response = await fetch(`/api/ai-videos/${videoId}/regenerate`, {
  method: 'POST',
})

const newVideo = await response.json()
// Returns new video with different seed
```

---

## Example Prompts

### Cinematic

```
"A serene ocean wave crashing on a beach at sunset"
"A futuristic city with flying cars and neon lights"
"Panoramic view of mountains with clouds moving across the sky"
```

### Animation

```
"Animated logo reveal with particles and light effects"
"Colorful characters dancing in a magical forest"
"Abstract shapes morphing and transforming"
```

### Realistic

```
"Close-up of coffee being poured into a cup, slow motion"
"Time-lapse of flowers blooming in a garden"
"Rain drops falling on a window pane"
```

### Artistic

```
"Abstract colorful paint swirling in water"
"Geometric patterns evolving and shifting"
"Light painting creating intricate designs"
```

### Product Demo

```
"Smartphone rotating on a clean white background"
"Elegant watch with smooth lighting transitions"
"Perfume bottle with misty atmosphere"
```

---

## Prompt Enhancement

The system automatically enhances prompts with:

1. **Style Modifiers** (based on selected style)
2. **Quality Enhancers** (`high quality`, `smooth motion`, `detailed`, etc.)
3. **Camera Movement Instructions** (if selected)

Example enhancement:
```
Input: "Ocean wave at sunset"
Style: CINEMATIC
Camera: PAN

Enhanced:
"Ocean wave at sunset, cinematic, movie quality, dramatic lighting,
smooth camera movement, professional cinematography, high quality,
smooth motion, detailed, professional, crisp, sharp focus"
```

---

## Video Status Flow

```
QUEUED
  ↓
GENERATING (30-120s)
  ↓
COMPLETED ✓
  OR
FAILED ✗
```

**Status Definitions:**
- `QUEUED`: Waiting in queue for processing
- `GENERATING`: Currently being generated by AI
- `COMPLETED`: Successfully generated, video URL available
- `FAILED`: Generation failed, error message provided

---

## Integration Notes

### Runway API (Production)

```typescript
// Example Runway Gen-3 API call
const runwayResponse = await fetch('https://api.runwayml.com/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RUNWAY_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: enhancedPrompt,
    duration: duration,
    aspect_ratio: aspectRatio,
    seed: seed,
  }),
})

const result = await runwayResponse.json()
// Poll for completion
// Download video
// Upload to cloud storage
// Update database with videoUrl
```

### WebSocket Updates (Production)

```typescript
// Server-side: Emit status updates
io.to(userId).emit('video:status', {
  videoId,
  status: 'GENERATING',
  progress: 45,
})

// Client-side: Listen for updates
socket.on('video:status', (data) => {
  updateVideoStatus(data)
})
```

---

## TODO / Future Enhancements

- [ ] Complete Runway API integration
- [ ] Add Pika Labs API integration
- [ ] Implement Stable Video Diffusion
- [ ] Set up video storage (AWS S3 / Cloudflare R2)
- [ ] Implement WebSocket real-time updates
- [ ] Add email notifications for completed videos
- [ ] Create video editing capabilities
- [ ] Add batch generation
- [ ] Implement video-to-video (use image as first frame)
- [ ] Add background music options
- [ ] Create social media auto-posting
- [ ] Implement video trimming/cropping
- [ ] Add watermark options
- [ ] Create API rate limiting
- [ ] Add usage analytics dashboard

---

## Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **AI Models:** Runway ML, Pika Labs, Stability AI
- **Storage:** Cloud storage (AWS S3, Cloudflare R2, etc.)
- **Queue:** Redis (production) or database polling
- **Real-time:** WebSocket (production) or polling
- **Styling:** Tailwind CSS + shadcn/ui

---

## Support & Troubleshooting

### Common Issues

**Q: Video stuck in QUEUED status**
- Check queue length (may be processing other videos)
- BADASS users get priority processing
- Average wait time: 30-120 seconds per video

**Q: Generation failed**
- Check error message in video detail
- Verify prompt doesn't violate content policy
- Try regenerating with different settings
- Reduce duration or complexity

**Q: Quota exceeded**
- BOLD tier: 2 videos/month
- BADASS tier: Unlimited
- Quota resets monthly
- Upgrade for more generations

**Q: Video quality not as expected**
- Try different AI models (Gen-3 for highest quality)
- Adjust motion intensity
- Use more descriptive prompts
- Add quality keywords to negative prompt

---

## License & Credits

Part of the dAItaniverse platform ecosystem.

Created: 2025
Last Updated: 2025-11-22
