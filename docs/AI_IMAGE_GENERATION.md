# AI Image Generation System

Complete AI-powered image generation for dAItaniverse platform using DALL-E, Midjourney, and Stable Diffusion.

## Overview

The AI Image Generation System allows users to create stunning images from text prompts using multiple AI models. Features include 24 pre-configured styles, prompt assistance, quota management, and seamless integration with Design Tools.

## Features

### Core Functionality
- **Multiple AI Models**: DALL-E 3, DALL-E 2, Stable Diffusion, Midjourney
- **24 Style Presets**: Realistic, Artistic, Anime, 3D, Digital Art, and more
- **Prompt Assistant**: Smart suggestions and quality boosters
- **Quota Management**: Tier-based limits (BOLD: 10/month, BADASS: unlimited)
- **Image Gallery**: Masonry grid with search and filters
- **Public Sharing**: Make images public or keep them private
- **Design Tools Integration**: Use AI-generated images in canvas editor

### Advanced Features
- **Negative Prompts**: Specify what to avoid in generation
- **Custom Parameters**: Steps, CFG scale, seed for Stable Diffusion
- **Quality Enhancement**: Automatic prompt improvement
- **Generation Queue**: Handle multiple requests efficiently
- **Status Tracking**: Real-time generation progress

## Database Schema

### AIImage Model
```prisma
model AIImage {
  id              String   @id @default(cuid())
  userId          String

  // Prompts
  prompt          String   @db.Text
  negativePrompt  String?  @db.Text

  // Model and settings
  model           String   // DALLE3, DALLE2, MIDJOURNEY, STABLE_DIFFUSION
  style           String?  // Style preset name
  size            String   // 1024x1024, 1024x1792, etc.

  // Advanced settings
  steps           Int?     // For Stable Diffusion (20-50)
  cfgScale        Float?   // For Stable Diffusion (7-15)
  seed            String?  // For reproducibility

  // Results
  imageUrl        String?
  thumbnailUrl    String?

  // Status
  status          String   @default("GENERATING") // GENERATING, COMPLETED, FAILED
  errorMessage    String?  @db.Text

  // Metadata
  isPublic        Boolean  @default(false)
  usedInDesign    Boolean  @default(false)
  downloadCount   Int      @default(0)

  generatedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([model])
  @@index([style])
  @@index([isPublic])
  @@index([createdAt])
}
```

### AIImageStyle Model
```prisma
model AIImageStyle {
  id              String   @id @default(cuid())
  name            String
  description     String?  @db.Text

  // Visual
  thumbnailUrl    String?
  category        String   // realistic, artistic, digital, 3d, etc.

  // Prompt modifiers
  promptModifier  String   @db.Text
  negativePrompt  String?  @db.Text

  // Model preferences
  model           String
  settings        Json?

  // Metadata
  isPublic        Boolean  @default(true)
  isPremium       Boolean  @default(false)
  usageCount      Int      @default(0)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([category])
  @@index([isPublic])
  @@index([isPremium])
}
```

## API Routes

### Images Management

#### GET /api/ai-images
List user's AI-generated images

**Query Parameters:**
- `status`: Filter by status (GENERATING, COMPLETED, FAILED)
- `model`: Filter by AI model
- `style`: Filter by style preset
- `public`: Filter by visibility (true/false)

**Response:**
```json
[
  {
    "id": "img_123",
    "prompt": "A serene mountain landscape",
    "model": "DALLE3",
    "style": "Realistic Photo",
    "imageUrl": "https://...",
    "status": "COMPLETED",
    "createdAt": "2025-01-22T10:00:00Z"
  }
]
```

#### POST /api/ai-images
Create new image generation request

**Body:**
```json
{
  "prompt": "A serene mountain landscape at sunset",
  "negativePrompt": "blurry, low quality",
  "model": "DALLE3",
  "style": "Realistic Photo",
  "size": "1024x1024",
  "steps": 30,
  "cfgScale": 8,
  "seed": "12345",
  "enhanceQuality": true
}
```

#### GET /api/ai-images/[id]
Get specific AI image

#### PUT /api/ai-images/[id]
Update image (make public/private, mark as used in design)

#### DELETE /api/ai-images/[id]
Delete AI image

### Generation

#### POST /api/ai-images/generate
Generate new AI image with tier/quota enforcement

**Features:**
- Quota validation (BOLD: 10/month, BADASS: unlimited)
- Content policy check
- Prompt enhancement
- Model-specific generation
- Status tracking

### Styles

#### GET /api/ai-image-styles
Get all style presets

**Query Parameters:**
- `category`: Filter by category
- `premium`: Filter by premium status
- `id`: Get specific style by ID

## Frontend Pages

### 1. AI Images Home (`/ai-images`)

**Features:**
- Hero section with features showcase
- Quota usage display
- Recent generations grid
- Quick action cards
- Example images gallery
- Upgrade prompts for quota limits

**Components:**
- Quota progress bar
- Feature cards (4 features)
- Recent images grid (6 images)
- Example prompts (4 categories)

### 2. Generate Image (`/ai-images/generate`)

**Features:**
- Large prompt textarea with character count
- Real-time prompt suggestions
- Style preset selector (24 styles)
- Model dropdown (DALL-E 3, DALL-E 2, SD, MJ)
- Size selector (model-dependent)
- Advanced settings accordion:
  - Negative prompt
  - Steps slider (SD only)
  - CFG scale slider (SD only)
  - Seed input (SD only)
- Quality enhancement toggle
- Example prompts sidebar (6 categories)
- Tips card

**Prompt Assistant:**
- Suggestions for improvement
- Quality boosters
- Lighting suggestions
- Policy violation detection
- Keyword extraction

### 3. Image Gallery (`/ai-images/gallery`)

**Features:**
- Masonry grid layout
- Search by prompt
- Filter: All/My Images/Public Gallery
- Sort: Newest/Most Popular/By Style
- Hover actions: View, Download, Delete
- Infinite scroll (optional)

### 4. Image Detail (`/ai-images/[id]`)

**Features:**
- Large image preview with zoom
- Full prompt and settings display
- Download buttons (PNG, JPG, PDF)
- Regenerate with same settings
- Use in Design Tools button
- Share publicly toggle
- Delete confirmation

### 5. Styles Library (`/ai-images/styles`)

**Features:**
- Category filter tabs
- Style cards with preview
- Prompt modifier display
- Premium badge for PRO styles
- Use style button
- Description and category info

## Style Presets

### Categories

1. **Realistic** (4 styles)
   - Realistic Photo
   - Cinematic
   - Professional Portrait
   - Landscape Photography

2. **Artistic** (4 styles)
   - Oil Painting
   - Watercolor
   - Impressionist (PRO)
   - Abstract Art (PRO)

3. **Digital Art** (3 styles)
   - Digital Art
   - Concept Art (PRO)
   - Vector Illustration

4. **Anime/Manga** (3 styles)
   - Anime
   - Manga
   - Studio Ghibli Style (PRO)

5. **3D Render** (3 styles)
   - 3D Render
   - Low Poly 3D
   - Clay Render

6. **Specialty** (7 styles)
   - Pencil Sketch
   - Comic Book
   - Vintage Photo
   - Neon Art (PRO)
   - Cyberpunk (PRO)
   - Pixel Art

**Total: 24 styles (14 free, 10 premium)**

## Tier Limits

### BRAVE (£6/month)
- ❌ No AI image generation
- Must upgrade to BOLD or BADASS

### BOLD (£26/month)
- ✅ 10 images per month
- ✅ DALL-E 2 and DALL-E 3 only
- ✅ All free styles (14 styles)
- ❌ No Stable Diffusion or Midjourney
- ❌ No premium styles

### BADASS (£260/year)
- ✅ Unlimited images
- ✅ All models (DALL-E 3, DALL-E 2, SD, Midjourney)
- ✅ All 24 styles (free + premium)
- ✅ Advanced settings (steps, CFG, seed)
- ✅ Priority generation queue

## AI Model Integration

### OpenAI DALL-E

**DALL-E 3:**
- Best quality
- 1024x1024, 1024x1792, 1792x1024
- ~15 seconds generation time
- £0.04 per image

**DALL-E 2:**
- Fast generation
- 256x256, 512x512, 1024x1024
- ~10 seconds generation time
- £0.02 per image

**API Endpoint:**
```
POST https://api.openai.com/v1/images/generations
Authorization: Bearer ${OPENAI_API_KEY}

{
  "model": "dall-e-3",
  "prompt": "...",
  "n": 1,
  "size": "1024x1024",
  "quality": "hd"
}
```

### Stable Diffusion

**Via Replicate or Stability AI:**
- Highly customizable
- Multiple models available
- Steps, CFG scale, seed control
- ~30-60 seconds generation time
- £0.01 per image

**Supported Sizes:**
- 512x512, 512x768, 768x512, 768x768, 1024x1024

**API Endpoint (Replicate):**
```
POST https://api.replicate.com/v1/predictions
Authorization: Token ${REPLICATE_API_TOKEN}

{
  "version": "model-version-id",
  "input": {
    "prompt": "...",
    "negative_prompt": "...",
    "width": 1024,
    "height": 1024,
    "num_inference_steps": 30,
    "guidance_scale": 8,
    "seed": 12345
  }
}
```

### Midjourney

**Integration Options:**
- Unofficial API
- Discord bot automation
- ~60 seconds generation time
- Most artistic results

## Prompt Enhancement

### Quality Boosters
Automatically added when enhancement is enabled:
- "highly detailed"
- "professional"
- "best quality"
- "4K resolution"
- "sharp focus"

### Lighting Suggestions
- Natural lighting
- Golden hour
- Studio lighting
- Dramatic lighting
- Cinematic lighting
- Neon lighting

### Camera Angles
- Eye level
- Low angle
- High angle
- Bird's eye view
- Close-up
- Wide shot

### Content Policy
Banned words detection:
- Violence, gore, blood
- NSFW, nude, explicit
- Weapons, drugs
- Hate speech

## Quota Enforcement

### Monthly Reset
```typescript
// Check user's monthly usage
const usage = await getUserMonthlyUsage(userId)

if (userTier === 'BOLD' && usage.aiImagesGenerated >= 10) {
  throw new Error('Monthly quota exceeded')
}

// After successful generation
await incrementUsage(userId, 'aiImagesGenerated')
```

### Tier Validation
```typescript
// Check model access
if (userTier === 'BOLD') {
  if (!['DALLE2', 'DALLE3'].includes(model)) {
    throw new Error('Model requires BADASS tier')
  }
}

// Check premium style access
if (style.isPremium && userTier !== 'BADASS') {
  throw new Error('Premium style requires BADASS tier')
}
```

## Usage Tracking

Track for analytics:
- Total images generated
- Images per model
- Images per style
- Success/failure rate
- Average generation time
- Most popular styles
- Most common prompts

## File Storage

### Image Storage
- Upload generated images to CDN
- Store original URL in database
- Generate thumbnails (256x256)
- Support multiple formats (PNG, JPG, PDF)

### Recommended Services
- **AWS S3** + CloudFront
- **Cloudinary** (automatic optimization)
- **Vercel Blob Storage**
- **Supabase Storage**

## Example Prompts

### Landscapes
- "A serene mountain landscape at sunset with vibrant orange and pink skies"
- "A mystical forest with glowing mushrooms and fairy lights"
- "Northern lights dancing over a snowy mountain range"

### Characters
- "A professional headshot of a confident businesswoman in modern office"
- "A cute cartoon character holding a coffee cup with a happy expression"
- "A futuristic cyberpunk character with neon accessories"

### Products
- "An elegant logo for a wellness brand featuring a lotus flower"
- "A modern smartphone mockup on a clean white background"
- "A luxury perfume bottle with gold accents and soft lighting"

### Abstract
- "Abstract geometric patterns in vibrant gradient colors"
- "Flowing liquid metal with rainbow reflections"
- "Cosmic nebula with swirling galaxies and stars"

## Cost Management

### API Costs
- DALL-E 3: £0.04 per image
- DALL-E 2: £0.02 per image
- Stable Diffusion: £0.01 per image
- Midjourney: £0.05 per image (via unofficial API)

### Monthly Estimates
**BOLD Tier (10 images/month):**
- Using DALL-E 2: £0.20/month
- Using DALL-E 3: £0.40/month

**BADASS Tier (100 images/month avg):**
- Mixed usage: £2-4/month

## Performance Optimizations

1. **Queue System**: Handle concurrent generations
2. **Status Polling**: WebSocket or polling for updates
3. **Image Caching**: Cache generated images in CDN
4. **Thumbnail Generation**: Create smaller previews
5. **Lazy Loading**: Load images as user scrolls

## Security Considerations

1. **Content Moderation**: Check prompts against policy
2. **Rate Limiting**: Prevent abuse
3. **Quota Enforcement**: Hard limits per tier
4. **API Key Security**: Store in environment variables
5. **User Authentication**: Verify user before generation
6. **CORS**: Restrict API access to your domain

## Future Enhancements

- [ ] Video generation (Runway, Pika)
- [ ] Image-to-image transformation
- [ ] Inpainting (edit specific areas)
- [ ] Outpainting (extend image boundaries)
- [ ] Batch generation (multiple images at once)
- [ ] Prompt marketplace (share/sell prompts)
- [ ] Collections/folders organization
- [ ] Favorites/likes system
- [ ] Social features (comments, shares)
- [ ] Advanced editing (filters, adjustments)

## Troubleshooting

### Generation Fails
- Check API key validity
- Verify quota hasn't been exceeded
- Check prompt for policy violations
- Ensure model is available
- Check network connectivity

### Images Not Loading
- Verify image URL is accessible
- Check CORS configuration
- Ensure CDN is working
- Check file permissions

### Slow Generation
- DALL-E: 10-20 seconds normal
- Stable Diffusion: 30-60 seconds normal
- Midjourney: 60+ seconds normal
- Check API service status

## Support

For issues or questions:
1. Check this documentation
2. Review prompt enhancement guidelines
3. Verify tier limits
4. Check browser console for errors
5. Contact support with generation ID

---

**Version**: 1.0.0
**Last Updated**: 2025-01-22
**Author**: dAItaniverse Team
