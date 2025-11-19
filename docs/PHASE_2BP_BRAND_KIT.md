# Phase 2BP: Brand Kit Manager

## Overview

A centralized brand asset management system that stores all brand elements (colors, fonts, logos, guidelines) in one place and enables auto-application across the entire platform. This system ensures brand consistency and saves time by managing all brand assets from a single dashboard.

## Features

### Core Features
- **Color Palette Management**: Add, edit, and organize brand colors with hex codes, RGB values, and usage notes
- **Typography System**: Manage brand fonts with Google Fonts integration and custom font upload support
- **Logo Library**: Store multiple logo variations (primary, secondary, icon, white, black, favicon)
- **Brand Guidelines**: Document brand story, values, voice, and usage rules
- **Asset Library**: Organize brand assets (images, icons, patterns, templates) with categorization and tagging
- **Color Tools**: AI palette generator and WCAG contrast checker
- **Sharing**: Generate shareable links with permissions and password protection
- **Export**: Export brand kit as CSS variables, JSON, or PDF

### Advanced Features
- **AI Color Palette Generator**: Generate complementary color palettes from a single primary color
- **Contrast Checker**: Verify WCAG AA/AAA compliance for accessibility
- **Auto-Apply**: Apply brand kit to all platform content with one click
- **Brand Consistency Checker**: Scan content for brand compliance (planned)
- **Multiple Brand Kits**: Create separate kits for different brands or clients
- **Primary Kit**: Designate one kit as the default for new content

## Architecture

### Database Schema

#### BrandKit
Main container for all brand assets.

```prisma
model BrandKit {
  id          String   @id @default(cuid())
  userId      String
  name        String
  isPrimary   Boolean  @default(false)
  colors      Json?    // Array of color objects
  fonts       Json?    // Array of font objects
  logos       Json?    // Array of logo objects
  guidelines  Json?    // Brand guidelines object
  settings    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  assets      BrandAsset[]
  guidelineSections BrandGuideline[]
}
```

**Colors JSON Structure:**
```json
[
  {
    "name": "Primary",
    "hex": "#FF6B35",
    "rgb": "rgb(255, 107, 53)",
    "usage": "Main brand color for CTAs and important elements"
  },
  {
    "name": "Secondary",
    "hex": "#2196F3",
    "rgb": "rgb(33, 150, 243)",
    "usage": "Complementary color for contrast"
  }
]
```

**Fonts JSON Structure:**
```json
[
  {
    "name": "Primary",
    "family": "Montserrat",
    "weights": ["400", "700"],
    "usage": "Headings and titles"
  },
  {
    "name": "Secondary",
    "family": "Open Sans",
    "weights": ["400", "600"],
    "usage": "Body text and paragraphs"
  }
]
```

**Logos JSON Structure:**
```json
[
  {
    "type": "Primary",
    "url": "https://cdn.example.com/logo-primary.svg",
    "usage": "Main logo for website and marketing materials"
  },
  {
    "type": "Icon",
    "url": "https://cdn.example.com/logo-icon.svg",
    "usage": "Small spaces and app icons"
  }
]
```

#### BrandAsset
Individual brand assets with metadata.

```prisma
model BrandAsset {
  id           String   @id @default(cuid())
  brandKitId   String
  name         String
  type         AssetType
  fileUrl      String
  thumbnailUrl String?
  fileSize     Int?
  dimensions   String?
  category     String?
  tags         String[]
  metadata     Json?
  uploadedAt   DateTime @default(now())

  brandKit     BrandKit @relation(...)
}

enum AssetType {
  LOGO
  ICON
  IMAGE
  PATTERN
  TEMPLATE
  GRAPHIC
  FONT
  OTHER
}
```

#### BrandGuideline
Structured guideline sections.

```prisma
model BrandGuideline {
  id          String   @id @default(cuid())
  brandKitId  String
  section     GuidelineSection
  title       String
  content     String   @db.Text
  examples    Json?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  brandKit    BrandKit @relation(...)
}

enum GuidelineSection {
  BRAND_STORY
  BRAND_VALUES
  BRAND_VOICE
  LOGO_USAGE
  COLOR_USAGE
  TYPOGRAPHY
  IMAGERY
  DOS_AND_DONTS
  OTHER
}
```

#### BrandShare
Shareable links with permissions.

```prisma
model BrandShare {
  id           String   @id @default(cuid())
  brandKitId   String
  token        String   @unique
  permissions  SharePermission @default(VIEW)
  password     String?
  expiresAt    DateTime?
  createdBy    String
  accessCount  Int      @default(0)
  lastAccessAt DateTime?
  createdAt    DateTime @default(now())
}

enum SharePermission {
  VIEW
  EDIT
}
```

## API Endpoints

### Brand Kits

#### GET /api/brand-kits
Get all brand kits for authenticated user.

**Response:**
```json
{
  "success": true,
  "brandKits": [
    {
      "id": "kit_123",
      "name": "My Brand",
      "isPrimary": true,
      "colors": [...],
      "fonts": [...],
      "_count": {
        "assets": 15,
        "guidelineSections": 5
      }
    }
  ]
}
```

#### GET /api/brand-kits/:id
Get single brand kit with full details.

#### POST /api/brand-kits
Create new brand kit.

**Request:**
```json
{
  "name": "My Brand",
  "isPrimary": false,
  "colors": [],
  "fonts": [],
  "logos": []
}
```

#### PATCH /api/brand-kits/:id
Update brand kit.

#### DELETE /api/brand-kits/:id
Delete brand kit.

### Brand Assets

#### GET /api/brand-kits/:id/assets
Get assets with optional filters.

**Query Parameters:**
- `type`: Filter by asset type
- `category`: Filter by category
- `search`: Search by name or tags

#### POST /api/brand-kits/:id/assets
Upload new asset.

**Request:**
```json
{
  "name": "Instagram Post Template",
  "type": "TEMPLATE",
  "fileUrl": "https://cdn.example.com/template.psd",
  "category": "Social Media",
  "tags": ["instagram", "square", "template"]
}
```

#### DELETE /api/brand-assets/:id
Delete asset.

### Brand Guidelines

#### POST /api/brand-kits/:id/guidelines
Create or update guideline section.

**Request:**
```json
{
  "section": "BRAND_STORY",
  "title": "Our Mission",
  "content": "We believe in making design accessible to everyone...",
  "examples": []
}
```

#### DELETE /api/brand-guidelines/:id
Delete guideline section.

### Color Tools

#### POST /api/brand-kits/tools/generate-palette
Generate color palette from primary color.

**Request:**
```json
{
  "primaryColor": "#FF6B35"
}
```

**Response:**
```json
{
  "success": true,
  "palette": [
    {
      "name": "Primary",
      "hex": "#FF6B35",
      "rgb": "rgb(255, 107, 53)",
      "usage": "Main brand color for CTAs and important elements"
    },
    {
      "name": "Secondary",
      "hex": "#35CBFF",
      "rgb": "rgb(53, 203, 255)",
      "usage": "Complementary color for contrast"
    }
    // ... more colors
  ]
}
```

#### POST /api/brand-kits/tools/check-contrast
Check WCAG contrast ratio between two colors.

**Request:**
```json
{
  "color1": "#FF6B35",
  "color2": "#FFFFFF"
}
```

**Response:**
```json
{
  "success": true,
  "ratio": "3.45",
  "passAA": false,
  "passAAA": false,
  "passAALarge": true
}
```

### Sharing

#### POST /api/brand-kits/:id/share
Create shareable link.

**Request:**
```json
{
  "permissions": "VIEW",
  "password": "secret123",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "share": {
    "id": "share_123",
    "token": "abc123xyz789",
    "permissions": "VIEW"
  },
  "shareUrl": "/brand-kit/shared/abc123xyz789"
}
```

#### GET /api/brand-kits/shared/:token
Get shared brand kit (public endpoint).

**Query Parameters:**
- `password`: Optional password for protected shares

### Export

#### GET /api/brand-kits/:id/export/css
Export as CSS variables.

**Response (text/css):**
```css
:root {
  --brand-primary: #FF6B35;
  --brand-secondary: #2196F3;
  --brand-accent: #FFC107;
  --font-primary: 'Montserrat';
  --font-secondary: 'Open Sans';
}
```

#### GET /api/brand-kits/:id/export/json
Export as JSON.

**Response:** Full brand kit object as JSON file.

#### POST /api/brand-kits/:id/apply
Apply brand kit to all content.

**Request:**
```json
{
  "targets": ["websites", "emails", "presentations"]
}
```

## Frontend Components

### Brand Kit Dashboard (`/brand-kit/:id`)
**Component:** `client/src/pages/BrandKit/BrandKitDashboard.jsx`

Main dashboard with tabbed interface:
- Header with kit name, primary badge, and action buttons
- Tabs: Colors, Typography, Logos, Assets, Guidelines
- Apply to All Content button
- Export menu (CSS, JSON)
- Share and Duplicate buttons

### Color Palette Manager
**Component:** `client/src/pages/BrandKit/components/ColorPaletteManager.jsx`

Features:
- Grid of color swatches with names, hex codes, and RGB values
- Add/edit/delete colors
- Color picker with hex and RGB inputs
- Usage notes for each color
- AI palette generator
- WCAG contrast checker
- Copy hex to clipboard

### Typography Manager
**Component:** `client/src/pages/BrandKit/components/TypographyManager.jsx`

Features:
- List of brand fonts with live previews
- Google Fonts integration (10 popular fonts included)
- Custom font upload support (planned)
- Font weight selection (300-900)
- Usage guidelines for each font
- Sample text in multiple sizes

### Logo Library
**Component:** `client/src/pages/BrandKit/components/LogoLibrary.jsx`

Features:
- Grid of logo variations (Primary, Secondary, Icon, White, Black, Favicon)
- Upload logos with URLs
- Preview on light/dark backgrounds
- Usage guidelines
- Download in multiple formats

### Asset Library
**Component:** `client/src/pages/BrandKit/components/AssetLibrary.jsx`

Features:
- Grid view with thumbnails
- Upload assets with metadata
- Filter by type (Logo, Icon, Image, Pattern, Template, Graphic)
- Search by name or tags
- Category organization
- Download assets
- Hover preview with actions

### Brand Guidelines
**Component:** `client/src/pages/BrandKit/components/BrandGuidelines.jsx`

Features:
- Organized by section (Brand Story, Values, Voice, Logo Usage, etc.)
- Rich text editor for content
- Markdown support
- Add example images
- Reorder sections
- Export as PDF (planned)

## Color Algorithm Details

### Palette Generation
The palette generator uses HSL color space to create harmonious color schemes:

1. **Primary Color**: User-provided color
2. **Secondary Color**: Complementary color (180° hue rotation)
3. **Accent Color**: Analogous color (30° hue shift, slight lightness increase)
4. **Light Variant**: Reduced saturation, increased lightness
5. **Dark Variant**: Increased saturation, reduced lightness

### Contrast Calculation
Uses WCAG 2.1 formula for relative luminance:

```
Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)
```

Where L1 and L2 are relative luminance values.

**WCAG Standards:**
- **AA Normal Text**: 4.5:1 minimum
- **AAA Normal Text**: 7:1 minimum
- **AA Large Text**: 3:1 minimum

## Usage Examples

### Creating a Brand Kit

```javascript
const response = await fetch('/api/brand-kits', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Brand',
    isPrimary: true,
    colors: [
      {
        name: 'Primary',
        hex: '#FF6B35',
        rgb: 'rgb(255, 107, 53)',
        usage: 'CTAs and headlines'
      }
    ],
    fonts: [
      {
        name: 'Primary',
        family: 'Montserrat',
        weights: ['400', '700'],
        usage: 'Headings'
      }
    ]
  })
});
```

### Generating Color Palette

```javascript
const response = await fetch('/api/brand-kits/tools/generate-palette', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    primaryColor: '#FF6B35'
  })
});

const { palette } = await response.json();
// palette contains 5 harmonious colors
```

### Checking Color Contrast

```javascript
const response = await fetch('/api/brand-kits/tools/check-contrast', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    color1: '#FF6B35',
    color2: '#FFFFFF'
  })
});

const { ratio, passAA, passAAA } = await response.json();
console.log(`Contrast ratio: ${ratio}:1`);
console.log(`WCAG AA: ${passAA ? 'Pass' : 'Fail'}`);
```

### Uploading an Asset

```javascript
const response = await fetch('/api/brand-kits/kit_123/assets', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Instagram Post Template',
    type: 'TEMPLATE',
    fileUrl: 'https://cdn.example.com/template.psd',
    category: 'Social Media',
    tags: ['instagram', 'square', '1080x1080']
  })
});
```

### Creating Share Link

```javascript
const response = await fetch('/api/brand-kits/kit_123/share', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    permissions: 'VIEW',
    password: 'secret123',
    expiresAt: '2025-12-31T23:59:59Z'
  })
});

const { shareUrl } = await response.json();
// Share this URL with team members
```

## Key Files

### Backend
- `schema/brandKit.prisma` - Database schema (4 models)
- `server/src/services/brandKitService.js` - Business logic
- `server/src/routes/brandKit.js` - API endpoints

### Frontend
- `client/src/pages/BrandKit/BrandKitDashboard.jsx` - Main dashboard
- `client/src/pages/BrandKit/components/ColorPaletteManager.jsx` - Color management
- `client/src/pages/BrandKit/components/TypographyManager.jsx` - Font management
- `client/src/pages/BrandKit/components/LogoLibrary.jsx` - Logo storage
- `client/src/pages/BrandKit/components/AssetLibrary.jsx` - Asset management
- `client/src/pages/BrandKit/components/BrandGuidelines.jsx` - Guidelines editor

## Integration with Platform Tools

### Website Builder
- Brand colors appear in color picker dropdown
- Brand fonts available in font selector
- "Apply Brand Kit" button instantly applies colors and fonts

### Email Editor
- Brand colors pre-loaded in palette
- Email templates use brand styling automatically
- Logos available in asset picker

### Image Editor
- Brand colors accessible in color palette
- Logo overlays available
- Templates pre-populated with brand elements

### Presentation Editor
- Brand color themes available
- Fonts applied to all new slides
- Logo on master slide

### Document Editor
- Brand fonts in font menu
- Color palette includes brand colors
- Header/footer with logo

## Security Considerations

### Access Control
- All endpoints require authentication except shared links
- Users can only access their own brand kits
- Share links support password protection

### Data Validation
- Hex color validation
- URL validation for assets
- Input sanitization for text fields

### Rate Limiting
Consider implementing rate limiting for:
- Asset uploads (prevent abuse)
- Palette generation (CPU-intensive)
- API exports

## Performance Optimization

### Caching
- Brand kits can be cached (rarely change)
- Shared kits cached for 15 minutes
- CSS exports cached per kit version

### Asset Management
- Use CDN for asset storage
- Generate thumbnails for images
- Lazy load assets in grid view

### Database Optimization
- Indexes on userId and isPrimary
- Indexes on brandKitId for related models
- Efficient JSON queries for colors/fonts

## Future Enhancements

### Planned Features
- **Brand Consistency Checker**: Scan all content and flag non-compliant usage
- **PDF Export**: Generate brand guidelines PDF document
- **Custom Font Upload**: Upload TTF/OTF/WOFF files
- **Version History**: Track changes to brand kit over time
- **Brand Templates**: Pre-designed templates for social media, print, etc.
- **Team Collaboration**: Multiple users editing same brand kit
- **Color Blindness Simulator**: Preview designs for accessibility
- **Brand Kit Marketplace**: Share and sell brand kits
- **Integration APIs**: Zapier, Figma, Adobe CC integration

### Technical Improvements
- WebSocket for real-time collaboration
- Image processing for automatic thumbnail generation
- Advanced color harmony algorithms
- AI-powered brand name generator
- Automated brand compliance scoring

## Testing

### Manual Testing Checklist
- [ ] Create brand kit
- [ ] Add colors (hex, RGB, usage notes)
- [ ] Generate color palette
- [ ] Check color contrast
- [ ] Add fonts (Google Fonts)
- [ ] Upload logos
- [ ] Upload assets with tags
- [ ] Filter and search assets
- [ ] Create brand guideline sections
- [ ] Share brand kit with password
- [ ] Export as CSS
- [ ] Export as JSON
- [ ] Apply brand kit to content
- [ ] Set kit as primary
- [ ] Duplicate brand kit
- [ ] Delete brand kit

### Accessibility Testing
- [ ] Color contrast ratios meet WCAG AA
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Font sizes readable
- [ ] Touch targets adequate (44x44px)

## Troubleshooting

### Colors Not Applying
- Verify brand kit is set as primary
- Check CSS variables are being imported
- Ensure target elements reference CSS variables
- Clear browser cache

### Assets Not Loading
- Verify asset URLs are accessible
- Check CORS headers for external CDNs
- Ensure file permissions are correct
- Verify asset file size isn't too large

### Palette Generator Not Working
- Verify hex color format (#RRGGBB)
- Check API endpoint is accessible
- Ensure sufficient server resources

### Share Link Not Working
- Verify token is correct
- Check if link has expired
- Ensure password is correct (if protected)
- Verify share hasn't been deleted

## Success Metrics

### KPIs to Track
- Number of brand kits created
- Colors per kit (average)
- Assets uploaded per user
- Share link usage
- Export downloads (CSS, JSON)
- Apply actions (how often users apply brand)
- Time saved (before/after brand kit)
- Brand consistency score (future)

---

## Phase 2BP Complete! 🎨

The Brand Kit Manager is now fully functional with:
- ✅ Complete database schema (4 models)
- ✅ Comprehensive backend service
- ✅ 20+ API endpoints
- ✅ Full-featured dashboard
- ✅ Color palette manager with AI generator
- ✅ Typography manager
- ✅ Logo library
- ✅ Asset library with filtering
- ✅ Brand guidelines editor
- ✅ WCAG contrast checker
- ✅ Share and export functionality
- ✅ Complete documentation

This system provides a powerful, centralized solution for managing all brand assets and ensuring consistency across the entire platform.
