# Email Marketing System - Implementation Guide

## Phase: Email Marketing - BUILD STATUS

### ✅ COMPLETED (Ready for Use)

**Database Schema (100%)**
- ✅ 4 enums: EmailSubscriberStatus, EmailSubscriberSource, EmailCampaignStatus, EmailRecipientStatus
- ✅ 4 models: EmailSubscriber, EmailCampaign, EmailCampaignRecipient, EmailTemplate
- ✅ User model relations updated

**Utility Library (100%)**
- ✅ src/lib/email-marketing.ts (500+ lines) with 17 core functions:
  * canAddSubscribers() - Quota checking
  * addSubscriber() - Add single subscriber
  * importSubscribers() - Bulk CSV import
  * updateSubscriberTags() - Tag management
  * unsubscribeSubscriber() - Handle unsubscribes
  * createCampaign() - Create new campaign
  * getCampaignRecipients() - Get recipients by filter
  * scheduleCampaign() - Schedule or send campaign
  * replaceTemplateVariables() - Template variable replacement
  * generateTrackingPixel() - Open tracking URL
  * generateTrackingUrl() - Click tracking URL
  * trackEmailOpen() - Record email opens
  * trackEmailClick() - Record link clicks
  * getCampaignAnalytics() - Campaign performance stats
  * exportSubscribersToCSV() - Export functionality

**API Routes (75%)**
- ✅ GET /api/email/subscribers - List subscribers with filters
- ✅ POST /api/email/subscribers - Add single subscriber
- ✅ POST /api/email/subscribers/import - Import from CSV
- ✅ GET /api/email/campaigns - List campaigns
- ✅ POST /api/email/campaigns - Create campaign
- ✅ GET /api/email/campaigns/[id] - Campaign analytics
- ✅ PATCH /api/email/campaigns/[id] - Update campaign

**Frontend Pages (50%)**
- ✅ /email/subscribers - List all subscribers
  * Table view with search/filter
  * Status badges (Subscribed, Unsubscribed, Bounced)
  * Tag display
  * Quota tracking with progress bar
  * Export to CSV functionality
  * Empty state

- ✅ /email/subscribers/new - Add/Import subscribers
  * Tab 1: Add single subscriber form
  * Tab 2: CSV import with parsing
  * Email validation
  * Quota checking
  * Import results display

- ✅ /email/campaigns - List all campaigns
  * Card-based layout
  * Status filters (All, Draft, Scheduled, Sent)
  * Performance stats (open rate, click rate)
  * Status badges
  * Edit/View actions

### 🚧 PENDING COMPLETION

**Tier Limits (Configured)**
- FREE: 0 subscribers
- UPGRADE (BRAVE): 300 subscribers
- MEMBER (BOLD): 1,000 subscribers
- ADMIN (BADASS): Unlimited

**Missing API Routes:**
1. GET /api/email/subscribers/[id] - Subscriber detail & activity
2. PATCH /api/email/subscribers/[id] - Update subscriber
3. DELETE /api/email/subscribers/[id] - Delete subscriber
4. POST /api/email/subscribers/[id]/tags - Bulk tag update
5. POST /api/email/campaigns/[id]/schedule - Schedule campaign
6. POST /api/email/campaigns/[id]/send - Send campaign immediately
7. GET /api/email/templates - List email templates
8. POST /api/email/templates - Create template
9. GET /api/email/track/open/[campaignId]/[recipientId] - Track opens
10. GET /api/email/track/click/[campaignId]/[recipientId] - Track clicks & redirect

**Missing Frontend Pages:**
1. /email/subscribers/[id] - Subscriber detail page
   * Subscriber info (email, name, tags, status)
   * Activity history (campaigns received, opens, clicks)
   * Edit details form
   * Add/remove tags interface
   * Unsubscribe/resubscribe buttons

2. /email/campaigns/new - Campaign creation wizard
   * Step 1: Campaign details (name, subject, preview text, from name/email)
   * Step 2: Email editor (see below)
   * Step 3: Recipient selection (all, by tag, manual)
   * Step 4: Schedule (send now or pick date/time)
   * Save as draft at any step

3. /email/campaigns/[id]/edit - Campaign editor
   * Rich text editor for email content
   * Drag-and-drop blocks: Text, Image, Button, Divider
   * Preview desktop/mobile toggle
   * Variable insertion buttons ({{firstName}}, etc.)
   * Send test email button
   * Save draft button
   * Continue to schedule

4. /email/campaigns/[id] - Campaign analytics & detail
   * Campaign overview card
   * Stats cards: Sent, Opened, Clicked, Bounced
   * Open rate, click rate, bounce rate percentages
   * Opens over time chart (line chart)
   * Clicks over time chart (line chart)
   * Top links clicked table
   * Recipient status breakdown table
   * Export report button

5. /email/templates - Template library
   * Grid of templates with thumbnails
   * Filter by category
   * Preview template modal
   * Use template button (creates campaign)
   * Save current email as template button
   * Delete template button

6. /unsubscribe/[token] - Public unsubscribe page
   * Pre-filled email address
   * One-click unsubscribe confirmation
   * Success message
   * Option to resubscribe

**Email Sending Service (Not Implemented)**

Current state: Email utility functions exist but no actual sending integration.

**Required Implementation:**

1. **Choose Email Provider:**
   - Option A: Nodemailer + SMTP (SendGrid, Mailgun, AWS SES)
   - Option B: SendGrid API
   - Option C: AWS SES API
   - Option D: Resend API (modern alternative)

2. **Create Email Service (src/lib/email-sender.ts):**
   ```typescript
   export async function sendEmail(params: {
     to: string
     from: string
     subject: string
     html: string
     text?: string
   }): Promise<{success: boolean; messageId?: string; error?: string}>

   export async function sendCampaignEmail(
     campaignId: string,
     recipientId: string
   ): Promise<void>

   export async function processCampaignQueue(
     campaignId: string
   ): Promise<void>
   ```

3. **Tracking Implementation:**
   - Insert tracking pixel: `<img src="{{trackingPixelUrl}}" width="1" height="1" />`
   - Replace all links with tracking URLs
   - Create tracking endpoints (see missing API routes)

4. **Queue System:**
   - Use Bull/BullMQ for job queue
   - Rate limit: 50 emails/minute (configurable)
   - Retry failed sends (3 attempts)
   - Update campaign progress in real-time

5. **Scheduled Sending:**
   - Cron job to check for scheduled campaigns
   - Move to SENDING status when time arrives
   - Process through queue

**Email Templates (Not Created)**

Need to create 5 default templates in database:

1. **Newsletter Template**
   ```html
   Category: newsletter
   Name: "Classic Newsletter"
   - Header with logo placeholder
   - Main content area
   - Featured article section
   - Footer with social links & unsubscribe
   ```

2. **Announcement Template**
   ```html
   Category: announcement
   Name: "Bold Announcement"
   - Large heading
   - Image placeholder
   - CTA button
   - Simple footer
   ```

3. **Promotion Template**
   ```html
   Category: promotion
   Name: "Special Offer"
   - Eye-catching header
   - Discount code section
   - Product/service highlights
   - Urgency timer placeholder
   - CTA button
   ```

4. **Welcome Email Template**
   ```html
   Category: welcome
   Name: "Warm Welcome"
   - Personal greeting with {{firstName}}
   - What to expect section
   - Quick start guide
   - Support contact info
   ```

5. **Product Launch Template**
   ```html
   Category: product
   Name: "Product Launch"
   - Hero image placeholder
   - Product description
   - Key features bullets
   - Pre-order/Buy CTA
   - Social sharing buttons
   ```

**Automation Features (Not Implemented)**

1. **Welcome Email Automation:**
   - Trigger: New subscriber added
   - Action: Send welcome email template
   - Implementation: Webhook or event listener on subscriber creation

2. **Tag-Based Sequences:**
   - Define email sequences per tag
   - Scheduled delays between emails
   - Automatic progression through sequence

**Unsubscribe Flow:**

1. Every sent email must include:
   ```html
   <a href="{{unsubscribeUrl}}">Unsubscribe</a>
   ```

2. Unsubscribe URL format:
   ```
   /unsubscribe/[encrypted-subscriber-id]
   ```

3. Page shows:
   - "Are you sure you want to unsubscribe?"
   - Email address (from encrypted ID)
   - Confirm button
   - "I changed my mind" link

4. On confirm:
   - Update subscriber status to UNSUBSCRIBED
   - Set unsubscribedAt timestamp
   - Show confirmation message
   - Option to resubscribe

**Bounce & Complaint Handling:**

1. **Bounces (Hard & Soft):**
   - Set up webhook with email provider
   - POST /api/email/webhooks/bounce
   - Update subscriber status to BOUNCED
   - Increment campaign bouncedCount

2. **Spam Complaints:**
   - Set up webhook with email provider
   - POST /api/email/webhooks/complaint
   - Update subscriber status to COMPLAINED
   - Automatically unsubscribe

**Testing Features Needed:**

1. **Send Test Email:**
   - Endpoint: POST /api/email/campaigns/[id]/test
   - Sends to single email address
   - Uses real template rendering
   - No tracking pixels/links

2. **Email Preview:**
   - Desktop view (600px width)
   - Mobile view (320px width)
   - Dark mode preview (optional)

**Analytics Enhancements:**

1. **Top Links Clicked:**
   - Parse campaign HTML for all links
   - Track clicks per link
   - Show table: Link URL, Click Count, Click Rate

2. **Opens/Clicks Over Time:**
   - Group by hour/day
   - Line chart data
   - Compare opens vs clicks

3. **Engagement Breakdown:**
   - Subscribers who opened
   - Subscribers who clicked
   - Subscribers who didn't open
   - Export each segment

**CSV Import/Export Enhancements:**

1. **Import:**
   - File upload (not just paste)
   - Column mapping interface
   - Duplicate detection options
   - Tag all imported subscribers

2. **Export:**
   - Filter before export
   - Select columns
   - Export by tag
   - Export campaign recipients

**Quota Enforcement:**

Already implemented in utility library:
- `canAddSubscribers()` checks tier limits
- Blocks adds if limit reached
- Shows upgrade message

Still need:
- Quota usage dashboard
- Upgrade prompts in UI
- Historical usage tracking

**Email Editor Requirements:**

Recommend using one of:
1. **React Email Editor** (react-email-editor)
2. **GrapesJS** (open source)
3. **Unlayer** (feature-rich)
4. **Custom** (blocks-based with TipTap)

Editor must support:
- Drag-and-drop blocks
- Mobile responsive preview
- Variable insertion
- Save as template
- Export HTML

**Integration Checklist:**

- [ ] Choose & configure email provider
- [ ] Create email sending service
- [ ] Set up queue system (Bull/BullMQ)
- [ ] Implement tracking endpoints
- [ ] Create default templates
- [ ] Build campaign editor
- [ ] Build analytics pages
- [ ] Implement unsubscribe flow
- [ ] Set up bounce/complaint webhooks
- [ ] Add send test email feature
- [ ] Create scheduled sending cron job
- [ ] Build remaining frontend pages
- [ ] Add automation triggers
- [ ] Comprehensive testing

**Current Limitations:**

1. No actual email sending (requires provider integration)
2. Campaign editor not built (needs rich text editor)
3. Analytics page not built (needs charts)
4. No email templates in database
5. No unsubscribe page
6. No tracking endpoints
7. No automation/sequences
8. No A/B testing

**Recommended Next Steps:**

**Phase 1: Email Sending (Priority: HIGH)**
1. Choose email provider (Resend recommended for ease)
2. Create email-sender.ts service
3. Implement tracking pixel & link replacement
4. Create tracking endpoints
5. Test send to yourself

**Phase 2: Campaign Creation (Priority: HIGH)**
6. Build campaign creation wizard
7. Integrate simple email editor (TipTap or React Email)
8. Add template variable insertion
9. Build recipient selection interface
10. Implement schedule/send functionality

**Phase 3: Templates & Analytics (Priority: MEDIUM)**
11. Create 5 default email templates
12. Build templates library page
13. Build campaign analytics page with charts
14. Add export functionality

**Phase 4: Polish & Automation (Priority: LOW)**
15. Build unsubscribe page
16. Set up bounce/complaint webhooks
17. Add welcome email automation
18. Implement scheduled sending cron
19. Add A/B testing capability

**Estimated Time to Complete:**
- Phase 1 (Sending): 8-12 hours
- Phase 2 (Creation): 16-20 hours
- Phase 3 (Templates/Analytics): 12-16 hours
- Phase 4 (Polish): 8-12 hours

**Total:** 44-60 hours (5-7 working days)

---

## Technical Notes

**Environment Variables Needed:**
```env
# Email Provider (choose one)
SENDGRID_API_KEY=
AWS_SES_ACCESS_KEY=
AWS_SES_SECRET_KEY=
AWS_SES_REGION=
RESEND_API_KEY=

# Queue (if using Bull)
REDIS_URL=

# App URL (for tracking links)
APP_URL=https://yourdomain.com
```

**Database Migration:**
After updating schema, run:
```bash
npx prisma migrate dev --name add_email_marketing
npx prisma generate
```

**Dependencies to Install:**
```bash
# Email sending (choose one)
npm install @sendgrid/mail  # SendGrid
npm install aws-sdk  # AWS SES
npm install resend  # Resend
npm install nodemailer  # Generic SMTP

# Queue (recommended)
npm install bullmq
npm install ioredis

# Email editor (choose one)
npm install react-email-editor
npm install grapesjs
npm install @tiptap/react @tiptap/starter-kit

# Charts (for analytics)
npm install recharts
npm install chart.js react-chartjs-2
```

**Security Considerations:**
1. Rate limit API endpoints
2. Validate email addresses server-side
3. Sanitize HTML content (prevent XSS)
4. Use signed/encrypted unsubscribe tokens
5. Implement DKIM, SPF, DMARC for deliverability
6. Add CAPTCHA to public unsubscribe form

**Performance Optimizations:**
1. Index database queries
2. Cache subscriber counts
3. Batch email sends
4. Use CDN for tracking pixel
5. Lazy load campaign recipients
6. Paginate subscriber lists

---

## Summary

**What's Built:**
- Complete database schema
- Comprehensive utility library
- Core API routes for subscribers & campaigns
- Subscribers list page with quota tracking
- Add/Import subscribers page with CSV support
- Campaigns list page with filters

**What Remains:**
- Email sending integration
- Campaign editor with rich text
- Analytics pages with charts
- Email templates
- Tracking endpoints
- Unsubscribe flow
- Automation features

**Status:**
Core infrastructure complete (50%). Requires email provider integration and frontend completion to be production-ready.
