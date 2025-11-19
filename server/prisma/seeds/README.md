# Database Seeds

This directory contains database seed files for The dAItaniverse platform.

## Available Seeds

### Main Sales Page (`main-sales-page.js`)

**Purpose:** Creates The dAItaniverse main sales page at `/join` using the Landing Page Builder.

**What it creates:**
- Complete sales page with 11 sections
- Hero with headline and CTA
- Social proof stats
- Problem section (40+ tools comparison)
- Solution section (all features)
- Side-by-side comparison table
- Features grid (40+ tools organized by category)
- Pricing table (FREE, PRO, ENTERPRISE)
- 6 customer testimonials
- FAQ section (15 common questions)
- Guarantee section
- Final CTA with urgency

**Tracking & Analytics:**
- Facebook Pixel integration
- Google Analytics integration
- Exit intent popup (50% discount offer)

**Published:** Yes, automatically published at `/join` slug

## Running Seeds

### Run All Seeds
```bash
cd server
npm run db:seed
```

### Run Specific Seed
```bash
# Main sales page only
npm run db:seed:main-page
```

## Notes

- Seeds are idempotent - running them multiple times will update existing records
- System user (`system@daitaniverse.com`) is created automatically if needed
- All content matches Phase 2BE specifications
- Images paths are placeholders - update with actual image URLs

## Content Updates

To update the main sales page content:

1. Edit `main-sales-page.js`
2. Modify the `getMainSalesPageSections()` function
3. Run the seed again: `npm run db:seed:main-page`

The seed will detect the existing page and update it with new content.

## Section Types Used

- `hero` - Main header with headline and CTA
- `socialProof` - Stats and trust indicators
- `problem` - Paint the pain points
- `solution` - Show the fix
- `comparison` - Side-by-side comparison table
- `features` - Grid of features organized by category
- `pricing` - Pricing plans
- `testimonials` - Customer reviews
- `faq` - Frequently asked questions
- `guarantee` - Money-back guarantee
- `finalCTA` - Last conversion opportunity

## Customization

### Update Pricing
Edit the `pricing` section in `getMainSalesPageSections()`:
```javascript
{
  type: 'pricing',
  content: {
    plans: [
      { name: 'PRO', price: '26', ... }
    ]
  }
}
```

### Add/Remove Features
Edit the `features` section categories array.

### Modify Testimonials
Edit the `testimonials` section testimonials array.

### Update FAQ
Edit the `faq` section faqs array.

## Troubleshooting

**Error: User not found**
- The seed creates a system user automatically
- Check database connection

**Error: Slug already exists**
- The seed updates existing pages by slug
- Should not cause errors

**Page not showing**
- Check `isPublished: true` in the seed
- Verify slug is `join`
- Check routes are configured in App.jsx

## Related Files

- `/server/prisma/seed.js` - Master seed runner
- `/server/package.json` - Seed scripts
- `/client/src/services/landing-pages.js` - Landing page service
- `/server/src/routes/landing-pages.js` - Landing page API routes
