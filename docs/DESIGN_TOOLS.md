# Design Tools (Canva Alternative)

A complete graphic design tool built into dAItaniverse platform for creating social media graphics, YouTube thumbnails, marketing materials, and more.

## Overview

The Design Tools feature is a Canva-style graphic design application that allows users to create professional-quality designs using drag-and-drop interface, pre-built templates, custom assets, and brand kit management.

## Features

### 1. Canvas Editor
- **Drag-and-drop interface** powered by Fabric.js
- **Real-time editing** of text, images, shapes, and elements
- **Multi-layer support** with layer management panel
- **Undo/Redo functionality** for editing history
- **Zoom controls** (25% - 200%)
- **Export options**: PNG, JPG, PDF formats

### 2. Template Library
- **20+ starter templates** across multiple categories:
  - Social Media (Instagram, Facebook, Twitter posts and stories)
  - YouTube (Thumbnails, channel art, end screens)
  - Marketing (Display ads, email headers, social ads)
  - Business (Business cards, presentations, logos)
  - Other (Invitations, posters, flyers)
- **Category filtering** and search
- **Usage tracking** for popular templates
- **One-click template duplication**

### 3. Brand Kit Management
- **Color palette management** (up to 10 brand colors)
- **Preset color palettes** (Pink-Purple-Orange, Blue-Cyan-Green, Red-Orange-Yellow)
- **Font selection** (Primary and Secondary fonts from Google Fonts)
- **Logo upload** for consistent branding
- **Auto-save functionality**

### 4. Asset Library
- **Upload custom images, icons, and shapes** (max 10MB per file)
- **Asset type categorization** (IMAGE, ICON, SHAPE, PHOTO)
- **Grid and list view modes**
- **Search and filter** by type and tags
- **File size and dimension tracking**

### 5. Design Management
- **My Designs library** with grid/list views
- **Search functionality** across designs
- **Duplicate designs** for quick variations
- **Delete designs** with confirmation
- **Auto-save** with manual save option
- **Template attribution** tracking

## Architecture

### Database Schema

#### DesignTemplate Model
```prisma
model DesignTemplate {
  id           String   @id @default(cuid())
  name         String
  category     String   // social-media, marketing, business, youtube, other
  width        Int
  height       Int
  thumbnailUrl String?
  previewUrl   String?
  jsonData     Json     // Fabric.js JSON
  tags         String[]
  isPublic     Boolean  @default(true)
  createdBy    String?  // userId or null for platform templates
  usageCount   Int      @default(0)
}
```

#### UserDesign Model
```prisma
model UserDesign {
  id           String   @id @default(cuid())
  userId       String
  name         String
  templateId   String?
  width        Int
  height       Int
  thumbnailUrl String?
  jsonData     Json     // Fabric.js JSON
  category     String?
  tags         String[]
  isPublic     Boolean  @default(false)
  lastEditedAt DateTime @updatedAt
}
```

#### DesignAsset Model
```prisma
model DesignAsset {
  id           String   @id @default(cuid())
  userId       String
  name         String
  type         String   // IMAGE, ICON, SHAPE, PHOTO
  fileUrl      String
  thumbnailUrl String?
  fileSize     Int      // in bytes
  mimeType     String
  width        Int?
  height       Int?
  tags         String[]
  isPublic     Boolean  @default(false)
}
```

#### BrandKit Model
```prisma
model BrandKit {
  id            String   @id @default(cuid())
  userId        String   @unique
  colors        String[]
  primaryFont   String?  @default("Inter")
  secondaryFont String?  @default("Montserrat")
  logoUrl       String?
}
```

### API Routes

#### Designs
- `GET /api/designs` - List user's designs with template relations
- `POST /api/designs` - Create new design from template or scratch
- `GET /api/designs/[id]` - Get specific design with template
- `PUT /api/designs/[id]` - Update design (auto-updates lastEditedAt)
- `DELETE /api/designs/[id]` - Delete design

#### Templates
- `GET /api/design-templates` - List public templates (ordered by usage count)
- `POST /api/design-templates` - Create template (admin only)
- Query params: `?category=social-media` for filtering

#### Assets
- `GET /api/design-assets` - List user's assets
- `POST /api/design-assets` - Upload asset (FormData with file)
- Query params: `?type=IMAGE` for filtering
- Validation: Max 10MB file size, image types only

#### Brand Kit
- `GET /api/brand-kit` - Get or auto-create brand kit
- `PUT /api/brand-kit` - Upsert brand kit
- Default colors: `['#ec4899', '#8b5cf6', '#f59e0b']`
- Default fonts: `Inter` (primary), `Montserrat` (secondary)

### Frontend Pages

#### 1. Design Home (`/design`)
- **Quick action cards**: Templates, My Designs, Uploads, Brand Kit
- **Category browser**: Social Media, YouTube, Marketing, Business
- **Recent designs** preview (6 most recent)
- **Popular templates** preview (8 most used)
- **Empty state** with call-to-action

#### 2. Template Browser (`/design/templates`)
- **Category tabs**: All, Social Media, YouTube, Marketing, Business, Other
- **Search functionality** with real-time filtering
- **Template cards** with dimensions and tags
- **Usage count** display
- **One-click design creation** from template

#### 3. My Designs (`/design/my-designs`)
- **Grid/List view toggle**
- **Search and filter** functionality
- **Bulk selection** and deletion
- **Duplicate designs** feature
- **Template attribution** display
- **Last edited timestamp** with relative time

#### 4. Canvas Editor (`/design/editor/[id]`)
- **Top toolbar**: Back, Name edit, Undo/Redo, Download, Save
- **Left sidebar**: Text, Image, Rectangle, Circle, Line, Layers, Uploads, Brand Kit
- **Canvas area**: Zoomable canvas with Fabric.js integration
- **Right sidebar**:
  - Object properties (font, size, color, position, dimensions)
  - Design info (dimensions, name)
  - Brand colors quick access
  - Export options (PNG, JPG, PDF)
- **Zoom controls**: 25% - 200% with visual indicator

#### 5. Uploads Library (`/design/uploads`)
- **Drag-and-drop upload area**
- **File validation**: Max 10MB, images only
- **Type filters**: All, Images, Icons, Shapes, Photos
- **Grid/List view** modes
- **Asset management**: Delete, view details
- **File metadata**: Size, dimensions, upload date

#### 6. Brand Kit (`/design/brand-kit`)
- **Color palette editor**: Add/remove up to 10 colors
- **Preset palettes**: Quick brand color setups
- **Font selection**: Primary and secondary fonts
- **Font preview**: Real-time font rendering
- **Logo upload**: Brand logo management
- **Save functionality**: Persistent brand settings

## Template Categories and Dimensions

### Social Media
- **Instagram Post**: 1080 × 1080 px
- **Instagram Story**: 1080 × 1920 px
- **Facebook Post**: 1200 × 630 px
- **Facebook Cover**: 820 × 312 px
- **Twitter Post**: 1200 × 675 px
- **LinkedIn Post**: 1200 × 627 px
- **Pinterest Pin**: 1000 × 1500 px
- **TikTok Video Cover**: 1080 × 1920 px

### YouTube
- **Thumbnail**: 1280 × 720 px
- **Channel Art**: 2560 × 1440 px

### Marketing
- **Google Display Ad (Large)**: 336 × 280 px
- **Google Display Ad (Medium)**: 300 × 250 px
- **Email Header**: 600 × 200 px
- **Social Media Ad**: 1080 × 1080 px
- **Web Banner**: 728 × 90 px

### Business
- **Business Card**: 1050 × 600 px (300 DPI)
- **Presentation Slide**: 1920 × 1080 px
- **Logo**: 500 × 500 px

### Other
- **Invitation**: 1080 × 1350 px
- **Poster**: 1080 × 1920 px
- **Flyer**: 816 × 1056 px

## Technology Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Fabric.js 5.3** for canvas manipulation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Radix UI** for accessible components

### Backend
- **Next.js API Routes** for REST endpoints
- **Prisma ORM** with PostgreSQL
- **JSON storage** for canvas data (Fabric.js format)
- **FormData handling** for file uploads

### Key Libraries
- `fabric@5.3.0` - Canvas manipulation and rendering
- `lucide-react` - Icon library
- `@radix-ui/*` - Accessible UI components
- `tailwindcss` - Utility-first CSS

## File Structure

```
src/
├── app/
│   ├── design/
│   │   ├── page.tsx                    # Design Home
│   │   ├── templates/
│   │   │   └── page.tsx               # Template Browser
│   │   ├── my-designs/
│   │   │   └── page.tsx               # My Designs
│   │   ├── editor/
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Canvas Editor
│   │   ├── uploads/
│   │   │   └── page.tsx               # Uploads Library
│   │   └── brand-kit/
│   │       └── page.tsx               # Brand Kit
│   └── api/
│       ├── designs/
│       │   ├── route.ts               # Designs list & create
│       │   └── [id]/
│       │       └── route.ts           # Design get/update/delete
│       ├── design-templates/
│       │   └── route.ts               # Templates list & create
│       ├── design-assets/
│       │   └── route.ts               # Assets list & upload
│       └── brand-kit/
│           └── route.ts               # Brand kit get/update
├── lib/
│   ├── design-templates.ts            # Template data (20+ templates)
│   └── db.ts                          # Prisma client
└── components/
    └── ui/                            # Radix UI components
```

## Installation

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

This will install Fabric.js (`fabric@5.3.0`) and all other dependencies.

### 2. Database Setup
```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate
```

### 3. Seed Templates (Optional)
```bash
# Create seed script using design-templates.ts data
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000/design` to access the Design Tools.

## Usage Guide

### Creating a Design

1. **From Template**:
   - Navigate to Design Home (`/design`)
   - Click "Start from Template" or browse categories
   - Select a template from the Template Browser
   - Template automatically opens in Canvas Editor

2. **From Scratch**:
   - Navigate to Canvas Editor directly
   - Create blank canvas with custom dimensions
   - Add elements using left sidebar tools

### Editing a Design

1. **Adding Text**:
   - Click Text tool in left sidebar
   - Text box appears on canvas
   - Double-click to edit content
   - Adjust font, size, color in right sidebar

2. **Adding Images**:
   - Click Image tool or navigate to Uploads
   - Upload image from computer
   - Drag image from uploads library to canvas

3. **Adding Shapes**:
   - Click shape tool (Rectangle, Circle, Line)
   - Shape appears on canvas
   - Adjust size, color, position in right sidebar

4. **Using Brand Kit**:
   - Set up brand colors and fonts in Brand Kit page
   - Access brand colors in Canvas Editor right sidebar
   - Apply brand colors to any element

### Exporting a Design

1. Click "Download" button in top toolbar
2. Select export format:
   - **PNG**: Best for web graphics with transparency
   - **JPG**: Best for photos and social media
   - **PDF**: Best for print materials
3. Design downloads to browser's download folder

### Managing Designs

1. **Duplicate**: Click duplicate icon on design card
2. **Delete**: Click delete icon (confirmation required)
3. **Search**: Use search bar to find designs by name/tags
4. **Filter**: Switch between Grid/List view modes

## Fabric.js Integration

The Canvas Editor uses Fabric.js for powerful canvas manipulation:

### Canvas Initialization
```typescript
const canvas = new fabric.Canvas(canvasRef.current, {
  width: design.width,
  height: design.height,
  backgroundColor: '#ffffff',
})
```

### Loading Saved Designs
```typescript
canvas.loadFromJSON(design.jsonData, () => {
  canvas.renderAll()
})
```

### Saving Designs
```typescript
const canvasJSON = canvas.toJSON()
// Save to database via API
```

### Exporting Designs
```typescript
const dataURL = canvas.toDataURL({
  format: 'png', // or 'jpeg', 'pdf'
  quality: 1,
})
```

### Adding Elements
```typescript
// Text
const text = new fabric.Textbox('Text', {
  left: 100,
  top: 100,
  fontSize: 32,
  fontFamily: 'Inter',
  fill: '#ec4899',
})
canvas.add(text)

// Rectangle
const rect = new fabric.Rect({
  left: 100,
  top: 100,
  width: 200,
  height: 100,
  fill: '#8b5cf6',
})
canvas.add(rect)

// Circle
const circle = new fabric.Circle({
  left: 100,
  top: 100,
  radius: 50,
  fill: '#f59e0b',
})
canvas.add(circle)
```

## Brand Kit Best Practices

1. **Color Palette**:
   - Use 3-5 primary brand colors
   - Add 2-3 accent colors if needed
   - Use hex codes for consistency

2. **Font Selection**:
   - Choose readable fonts for body text
   - Select distinctive fonts for headlines
   - Test fonts at different sizes

3. **Logo Usage**:
   - Upload PNG with transparent background
   - Maintain aspect ratio in designs
   - Use consistent logo placement

## Performance Considerations

1. **Canvas Size**: Large canvases (>4000px) may impact performance
2. **Image Optimization**: Compress images before upload
3. **Layer Count**: Limit to 50-100 layers per design
4. **Auto-save**: Saves on blur or every 30 seconds
5. **File Size**: Keep design JSON under 1MB for best performance

## Future Enhancements

### Planned Features
- [ ] Collaboration (real-time multi-user editing)
- [ ] Animation support (GIF, MP4 export)
- [ ] Icon library integration (Font Awesome, Material Icons)
- [ ] Photo filters and effects
- [ ] Background removal tool
- [ ] Magic resize (auto-adjust to different dimensions)
- [ ] Version history
- [ ] Template marketplace
- [ ] AI-powered design suggestions
- [ ] Batch export (multiple formats at once)

### Integration Opportunities
- [ ] Unsplash/Pexels integration for stock photos
- [ ] Google Fonts API for expanded font library
- [ ] Cloudinary for image optimization
- [ ] AWS S3 for file storage
- [ ] PDF.js for PDF export
- [ ] jsPDF for better PDF generation

## Troubleshooting

### Canvas Not Rendering
- Ensure Fabric.js is installed: `npm install fabric@5.3.0`
- Check browser console for errors
- Verify canvas dimensions are valid

### Export Not Working
- Check browser download permissions
- Ensure canvas has content
- Try different export format

### Upload Failing
- Verify file size is under 10MB
- Ensure file type is image/*
- Check server upload limits

### Brand Kit Not Saving
- Check network connection
- Verify API route is accessible
- Check browser console for errors

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in source files
3. Check browser console for errors
4. Submit GitHub issue with details

## License

MIT License - Part of dAItaniverse Platform

---

**Version**: 1.0.0
**Last Updated**: 2025-01-22
**Author**: dAItaniverse Team
