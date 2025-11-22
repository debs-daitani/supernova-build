# dAItaniverse Website Builder System

Complete website builder system with drag-and-drop functionality, templates, and publishing capabilities.

## Features

✅ **Website Management**
- Create, edit, delete, and duplicate websites
- Subdomain hosting (username.daitaniverse.site)
- Custom domain support (future)
- Publish/unpublish websites
- Website settings and configuration

✅ **Page Builder**
- Drag-and-drop page editor
- Pre-built sections (Hero, Features, Testimonials, Pricing, Contact, CTA, Gallery, Team, FAQ, Footer)
- Inline content editing
- Responsive design preview (Desktop, Tablet, Mobile)
- Page management (add, edit, delete, reorder)

✅ **Templates**
- 5 professional starter templates:
  - Landing Page
  - Portfolio
  - Business
  - Restaurant
  - Agency
- Template preview and selection
- Start from blank or template

✅ **Publishing**
- JSON to HTML conversion
- SEO optimization (meta tags, sitemap.xml, robots.txt)
- Custom CSS and JavaScript
- Analytics code injection
- Automatic sitemap generation

✅ **Form Management**
- Contact forms and lead capture
- Form submissions dashboard
- Email notifications (future)
- Spam protection (future)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Radix UI, custom components
- **Deployment**: Vercel (recommended)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL database running on localhost:5432
- Git

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
createdb daitaniverse
```

Or use Docker:

```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=daitaniverse -p 5432:5432 -d postgres:15
```

### 4. Environment Configuration

The `.env` file is already set up with local PostgreSQL connection. Update if needed:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/daitaniverse?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_DOMAIN="daitaniverse.site"
```

### 5. Initialize Database

Push the Prisma schema to the database:

```bash
npm run db:push
```

Generate Prisma Client:

```bash
npm run db:generate
```

### 6. Seed Database with Templates

Run the seed script to create 5 starter templates:

```bash
npm run db:seed
```

This creates:
- Landing Page template
- Portfolio template
- Business template
- Restaurant template
- Agency template

### 7. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── websites/          # Website CRUD
│   │   ├── pages/             # Page CRUD
│   │   ├── templates/         # Template management
│   │   ├── blocks/            # Reusable blocks
│   │   └── form-submissions/  # Form handling
│   ├── websites/              # Website builder pages
│   │   ├── page.tsx           # Websites list
│   │   ├── new/               # Create website
│   │   └── [id]/              # Website management
│   │       ├── pages/         # Pages manager
│   │       ├── settings/      # Website settings
│   │       ├── preview/       # Live preview
│   │       └── submissions/   # Form submissions
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Homepage
│   └── globals.css            # Global styles
├── components/
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── db.ts                  # Prisma client
│   ├── utils.ts               # Utility functions
│   ├── sections.ts            # Pre-built sections library
│   └── publishing.ts          # JSON to HTML engine
└── prisma/
    ├── schema.prisma          # Database schema
    └── seed.ts                # Database seeding

```

## Database Models

### Website
- Basic info (name, domain, subdomain)
- Theme settings (colors, fonts)
- SEO settings
- Custom code (CSS, JS)
- Publishing status

### WebsitePage
- Page content (JSON)
- SEO settings
- Homepage flag
- Navigation order

### WebsiteTemplate
- Template metadata
- Page structures (JSON)
- Theme settings

### WebsiteBlock
- Reusable sections
- Public/private sharing

### FormSubmission
- Form data (JSON)
- Common fields (name, email, message)
- Read status

## Key Pages

### Websites List (`/websites`)
- Grid view of all websites
- Filter by published/drafts
- Create, duplicate, delete actions

### Create Website (`/websites/new`)
- Two-step wizard (details + template)
- Template preview and selection
- Subdomain auto-generation

### Pages Manager (`/websites/[id]/pages`)
- List all pages
- Create, edit, delete pages
- Set homepage
- Publish website

### Page Editor (`/websites/[id]/pages/[pageId]/edit`)
- Left sidebar: Sections library
- Center: Live canvas with device preview
- Right sidebar: Section settings
- Drag-and-drop functionality
- Save and preview

### Website Settings (`/websites/[id]/settings`)
- General settings
- SEO configuration
- Analytics code
- Custom CSS/JS
- robots.txt editor

### Live Preview (`/websites/[id]/preview`)
- Full-screen website preview
- Navigate between pages
- See changes before publishing

### Form Submissions (`/websites/[id]/submissions`)
- Table of all submissions
- Mark as read/unread
- Filter and search
- Export (future)

## Pre-built Sections

1. **Hero** - Centered, Split variants
2. **Features** - 3-column, 4-column grids
3. **Testimonials** - Grid layout
4. **Pricing** - 3-tier pricing tables
5. **Contact** - Simple, With info variants
6. **CTA** - Call-to-action banners
7. **Gallery** - Image grids
8. **Team** - Team member cards
9. **FAQ** - Accordion style
10. **Footer** - Multi-column footers

## Publishing Flow

1. User creates website and pages
2. Adds sections to pages using drag-and-drop
3. Customizes content inline
4. Previews website
5. Clicks "Publish" button
6. System generates static HTML from JSON
7. Uploads to CDN (future)
8. Website live at subdomain

## API Endpoints

### Websites
- `GET /api/websites` - List all websites
- `POST /api/websites` - Create website
- `GET /api/websites/[id]` - Get website
- `PATCH /api/websites/[id]` - Update website
- `DELETE /api/websites/[id]` - Delete website
- `POST /api/websites/[id]/publish` - Publish website
- `POST /api/websites/[id]/duplicate` - Duplicate website

### Pages
- `GET /api/pages?websiteId=xxx` - List pages
- `POST /api/pages` - Create page
- `GET /api/pages/[id]` - Get page
- `PATCH /api/pages/[id]` - Update page
- `DELETE /api/pages/[id]` - Delete page
- `POST /api/pages/[id]/set-homepage` - Set as homepage
- `POST /api/pages/reorder` - Reorder pages

### Templates
- `GET /api/templates` - List templates
- `GET /api/templates/[id]` - Get template

### Blocks
- `GET /api/blocks` - List blocks
- `POST /api/blocks` - Create block

### Form Submissions
- `GET /api/form-submissions?websiteId=xxx` - List submissions
- `POST /api/form-submissions` - Create submission
- `PATCH /api/form-submissions/[id]` - Update submission
- `DELETE /api/form-submissions/[id]` - Delete submission

## Future Enhancements

- [ ] User authentication (NextAuth)
- [ ] Custom domain connection
- [ ] SSL certificates
- [ ] CDN hosting
- [ ] Email notifications for forms
- [ ] Spam protection (reCAPTCHA)
- [ ] Version history
- [ ] A/B testing
- [ ] Advanced analytics
- [ ] More templates
- [ ] E-commerce features
- [ ] Blog functionality
- [ ] Multi-language support

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run format       # Format code
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma Client
npm run db:seed      # Seed database
```

## Testing

1. Create a new website from template
2. Edit pages using the page editor
3. Add sections from the library
4. Customize section content
5. Preview on different devices
6. Publish website
7. Submit a test form
8. Check form submissions

## Troubleshooting

**Database connection issues:**
- Ensure PostgreSQL is running on localhost:5432
- Check DATABASE_URL in .env
- Run `npm run db:push` to sync schema

**Template not loading:**
- Run `npm run db:seed` to create templates
- Check database with `npm run db:studio`

**Page editor not saving:**
- Check console for errors
- Verify API routes are working
- Check database connection

## Support

For issues or questions, please check:
- GitHub Issues
- Documentation
- Community Discord

---

Built with ❤️ by the dAItaniverse team
