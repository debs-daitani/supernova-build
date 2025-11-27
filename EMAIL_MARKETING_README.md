# Email Marketing Platform - dAItaniverse SUPERNova

## Overview

A complete, production-ready email marketing platform for managing subscribers, campaigns, sequences, and analytics. Built with Next.js, Prisma, and PostgreSQL.

## Features

### 1. Subscriber Management
- **Full CRUD operations** for email subscribers
- **Import from CSV** with field mapping
- **Status tracking**: Subscribed, Unsubscribed, Bounced, Complained
- **Source tracking**: Quiz, Manual, Import, Signup Form, CRM
- **Custom fields** for flexible data storage
- **Tag-based organization**
- **Activity timeline** per subscriber

### 2. List Management
- **Segmentation** by tags, status, behavior
- **Dynamic lists** with automatic updates
- **Subscriber counts** automatically maintained
- **Many-to-many relationships** (subscribers can be in multiple lists)

### 3. Campaign Management
- **Broadcast emails** - one-time sends to lists
- **Draft, Schedule, Send** workflow
- **Email editor** (textarea for MVP, ready for rich text editor)
- **Template support**
- **Preview functionality**
- **Real-time stats**: Opens, Clicks, Bounces, Unsubscribes

### 4. Sequence Automation
- **Drip campaigns** with timed delays
- **Trigger types**:
  - Manual enrollment
  - List subscription
  - Tag addition
- **Multi-step workflows** with delay configuration
- **Active/Paused status** control
- **Performance tracking** per sequence

### 5. Template Library
- **Reusable email templates**
- **Category organization**: Welcome, Newsletter, Promo, Follow-up, Announcement
- **Variable support**: {{firstName}}, {{lastName}}, etc.
- **Preview thumbnails**

### 6. Analytics Dashboard
- **Key metrics**:
  - Total subscribers (with growth trends)
  - Campaigns sent
  - Average open rate
  - Average click rate
- **Subscriber status breakdown**
- **Top performing campaigns**
- **Growth charts** (30-day trends)
- **Source attribution**

### 7. Email Tracking
- **Open tracking** via 1x1 pixel
- **Click tracking** via redirect URLs
- **Event logging**: Sent, Opened, Clicked, Bounced, Unsubscribed
- **IP address and user agent** capture

### 8. GDPR Compliance
- **Easy unsubscribe** in every email
- **Unsubscribe page** with one-click action
- **Data export capability**
- **Consent tracking**

## Database Schema

All models are already defined in `prisma/schema.prisma`:

### Core Models
- `EmailSubscriber` - Email addresses with status, source, tags
- `EmailList` - Segments for grouping subscribers
- `EmailListSubscriber` - Many-to-many join table
- `EmailCampaign` - Broadcast email campaigns
- `EmailSequence` - Automated drip campaigns
- `EmailSequenceEmail` - Individual emails in sequences
- `EmailTemplate` - Reusable templates
- `EmailEvent` - Tracking for opens, clicks, bounces
- `EmailAutomation` - Visual workflow automation (future enhancement)

## API Routes

### Subscribers
- `GET /api/email/subscribers` - List subscribers with filters
- `POST /api/email/subscribers` - Add subscriber
- `GET /api/email/subscribers/[id]` - Get subscriber details
- `PATCH /api/email/subscribers/[id]` - Update subscriber
- `DELETE /api/email/subscribers/[id]` - Delete subscriber
- `POST /api/email/subscribers/import` - CSV bulk import

### Lists
- `GET /api/email/lists` - List all email lists
- `POST /api/email/lists` - Create list
- `GET /api/email/lists/[id]` - Get list with subscribers
- `PATCH /api/email/lists/[id]` - Update list
- `DELETE /api/email/lists/[id]` - Delete list

### Campaigns
- `GET /api/email/campaigns` - List campaigns
- `POST /api/email/campaigns` - Create campaign
- `GET /api/email/campaigns/[id]` - Get campaign details
- `PATCH /api/email/campaigns/[id]` - Update campaign
- `DELETE /api/email/campaigns/[id]` - Delete campaign
- `POST /api/email/campaigns/[id]/send` - Send/schedule campaign
- `GET /api/email/campaigns/[id]/stats` - Get campaign statistics

### Sequences
- `GET /api/email/sequences` - List sequences
- `POST /api/email/sequences` - Create sequence
- `GET /api/email/sequences/[id]` - Get sequence with emails
- `PATCH /api/email/sequences/[id]` - Update sequence
- `DELETE /api/email/sequences/[id]` - Delete sequence

### Templates
- `GET /api/email/templates` - List templates
- `POST /api/email/templates` - Create template
- `GET /api/email/templates/[id]` - Get template
- `PATCH /api/email/templates/[id]` - Update template
- `DELETE /api/email/templates/[id]` - Delete template

### Analytics
- `GET /api/email/analytics` - Overall email marketing stats

### Tracking
- `GET /api/email/track/open/[eventId]` - Track email open (1x1 pixel)
- `GET /api/email/track/click/[eventId]` - Track link click (redirect)

### Unsubscribe
- `GET /api/email/unsubscribe/[subscriberId]` - Unsubscribe page
- `POST /api/email/unsubscribe/[subscriberId]` - Process unsubscribe

## Frontend Pages

### Main Navigation (`/email`)
- Layout with tabs: Subscribers, Lists, Campaigns, Sequences, Templates, Analytics

### Subscribers
- `/email/subscribers` - List view with search, filters, bulk actions
- `/email/subscribers/[id]` - Subscriber profile with activity timeline
- `/email/subscribers/import` - CSV import wizard with field mapping

### Lists
- `/email/lists` - Grid view of all lists with subscriber counts
- `/email/lists/[id]` - List details with subscriber management

### Campaigns
- `/email/campaigns` - List view grouped by status (Draft, Scheduled, Sent)
- `/email/campaigns/[id]` - Campaign editor with preview and analytics
- `/email/campaigns/create` - Create new campaign

### Sequences
- `/email/sequences` - List view of automation sequences
- `/email/sequences/[id]` - Sequence editor with step builder

### Templates
- `/email/templates` - Template library by category
- `/email/templates/[id]` - Template editor

### Analytics
- `/email/analytics` - Dashboard with charts and metrics

## Integration Points

### Quiz Integration
When a quiz is completed (`/api/quiz/submit`):
1. Creates email subscriber automatically
2. Adds to "Quiz Leads" list
3. Tags with quiz result tier
4. Triggers "Quiz Completion" sequence if active

### CRM Integration
- Quiz submissions create both CRM contacts AND email subscribers
- Subscriber data syncs with contact records
- Shared tagging system

## Email Service Integration

### IMPORTANT: Production Email Delivery

This system is **production-ready** for everything except actual email sending. To send real emails, you need to integrate an email service provider:

#### Recommended Services
1. **Resend** (resend.com) - Modern, developer-friendly
2. **SendGrid** (sendgrid.com) - Enterprise-grade
3. **Amazon SES** (aws.amazon.com/ses) - Cost-effective at scale
4. **Postmark** (postmarkapp.com) - Transactional emails

#### Integration Steps

1. **Install SDK**:
```bash
npm install resend  # or sendgrid, @aws-sdk/client-ses, etc.
```

2. **Create Email Service** (`lib/email-service.ts`):
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  from,
  subject,
  html,
  trackingPixel,
  clickTracking
}: {
  to: string
  from: string
  subject: string
  html: string
  trackingPixel?: string
  clickTracking?: boolean
}) {
  // Inject tracking pixel
  const htmlWithTracking = trackingPixel
    ? html + `<img src="${trackingPixel}" width="1" height="1" />`
    : html

  // Transform links for click tracking if enabled
  const finalHtml = clickTracking
    ? transformLinksForTracking(htmlWithTracking)
    : htmlWithTracking

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html: finalHtml
  })

  return { success: !error, messageId: data?.id, error }
}
```

3. **Update Campaign Send Route** (`/api/email/campaigns/[id]/send`):
```typescript
// Get campaign and subscribers
const campaign = await prisma.emailCampaign.findUnique(...)
const subscribers = await prisma.emailSubscriber.findMany(...)

// Send to each subscriber
for (const subscriber of subscribers) {
  // Create event record
  const event = await prisma.emailEvent.create({
    data: {
      campaignId: campaign.id,
      subscriberId: subscriber.id,
      type: 'SENT'
    }
  })

  // Generate tracking URLs
  const trackingPixel = `${process.env.NEXT_PUBLIC_APP_URL}/api/email/track/open/${event.id}`

  // Send email
  await sendEmail({
    to: subscriber.email,
    from: `${campaign.fromName} <${campaign.fromEmail}>`,
    subject: campaign.subject,
    html: campaign.htmlContent,
    trackingPixel,
    clickTracking: true
  })

  // Update campaign stats
  await prisma.emailCampaign.update({
    where: { id: campaign.id },
    data: { sentCount: { increment: 1 } }
  })
}
```

4. **Add Environment Variables**:
```env
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### Email Queue System (Recommended for Production)

For high-volume sending, use a queue:

```bash
npm install bull redis
```

```typescript
import Queue from 'bull'

const emailQueue = new Queue('emails', process.env.REDIS_URL)

// Add to queue
emailQueue.add({ campaignId, subscriberId })

// Process queue
emailQueue.process(async (job) => {
  const { campaignId, subscriberId } = job.data
  await sendCampaignEmail(campaignId, subscriberId)
})
```

## MVP Notes

### Current Implementation
- **Email editor**: Simple textarea (production-ready for plain text/HTML)
- **Sequence builder**: List view (functional and intuitive)
- **Email sending**: Queued locally (needs service integration as above)

### Future Enhancements
1. **Rich text editor**: TipTap, Quill, or React-Email
2. **Visual sequence builder**: React Flow for drag-and-drop
3. **A/B testing**: Subject line and content variants
4. **Advanced segmentation**: Behavioral triggers
5. **Email templates**: Pre-built designs library

## Styling

Uses dAItaniverse branding:
- **Hot Pink**: #FF008E
- **Light Teal**: #00F0E9
- **Neon Lime**: #CCFF00
- **Font**: Supernova (headings), Josefin Sans (body)
- **Design**: Glass-morphism with backdrop blur

## Development

### Setup
```bash
cd supernova
npm install
```

### Environment Variables
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
RESEND_API_KEY="your-api-key" # When ready for production
```

### Database Sync
```bash
npx prisma db push
```

### Run Development Server
```bash
npm run dev
```

Visit:
- Main app: http://localhost:3001
- Email marketing: http://localhost:3001/email/subscribers

## Testing

### Test Subscriber Flow
1. Go to `/email/subscribers`
2. Click "Add Subscriber" or "Import CSV"
3. Add test subscriber
4. View subscriber detail page
5. Check activity timeline

### Test Campaign Flow
1. Go to `/email/campaigns`
2. Create new campaign
3. Set subject, content, select lists
4. Send campaign (will be queued until email service is integrated)
5. View campaign stats

### Test Quiz Integration
1. Complete a quiz at `/quiz/[id]`
2. Submit with email address
3. Check `/email/subscribers` - new subscriber should appear
4. Check `/email/lists` - "Quiz Leads" list should have new subscriber

## Security

### Authentication
All email routes require authentication (implement JWT token check if not already present).

### Data Privacy
- Passwords never stored for subscribers
- Email addresses indexed for performance
- Unsubscribe links contain subscriber ID only
- GDPR-compliant data handling

### Rate Limiting
Add rate limiting to prevent abuse:
```typescript
// lib/rate-limit.ts
import rateLimit from 'express-rate-limit'

export const emailApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## Monitoring

### Key Metrics to Track
- Subscriber growth rate
- Campaign open rates (industry avg: 15-25%)
- Campaign click rates (industry avg: 2-5%)
- Unsubscribe rates (keep below 0.5%)
- Bounce rates (keep below 2%)

### Health Checks
- Database connection
- Email service API status
- Queue processing rate
- Disk space for attachments

## Support

For issues or questions:
- Check this README first
- Review API route implementations
- Check Prisma schema for data structure
- Review console logs for errors

## License

Proprietary - dAItaniverse / Debs Daitani Ltd
