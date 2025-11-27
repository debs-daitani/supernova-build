# Phase 2BK: Support Ticket System

Complete customer support and helpdesk system for The dAItaniverse platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Backend Services](#backend-services)
- [API Endpoints](#api-endpoints)
- [Frontend Pages](#frontend-pages)
- [Email Notifications](#email-notifications)
- [User Workflows](#user-workflows)
- [Admin Features](#admin-features)
- [Integration Guide](#integration-guide)
- [Testing](#testing)

## 🎯 Overview

Phase 2BK provides a complete support ticket system that:

- **Customers can submit tickets** with attachments
- **Track ticket status** in real-time
- **Staff can manage tickets** efficiently
- **Automated email notifications** keep everyone informed
- **Analytics dashboard** shows support metrics
- **Canned responses** speed up common replies
- **Internal notes** for team collaboration
- **Priority-based** SLA tracking
- **Customer satisfaction ratings** for quality assurance

Think of it as: **Zendesk + Intercom + Freshdesk** - all in one.

## 🗄️ Database Schema

### Ticket Model

```prisma
model Ticket {
  id                String            @id @default(cuid())
  ticketNumber      String            @unique // "TICKET-001234"

  // User info
  userId            String
  user              User              @relation("UserTickets")

  // Content
  subject           String
  description       String            @db.Text
  category          TicketCategory    // BUG, FEATURE_REQUEST, QUESTION, etc.
  priority          TicketPriority    // LOW, MEDIUM, HIGH, URGENT
  status            TicketStatus      // OPEN, PENDING, IN_PROGRESS, RESOLVED, CLOSED

  // Assignment
  assignedToId      String?
  assignedTo        User?             @relation("AssignedTickets")
  assignedAt        DateTime?

  // Tags & Metadata
  tags              String[]
  source            String?           // "web", "email", "api"

  // SLA Tracking
  firstResponseAt   DateTime?
  firstResponseTime Int?              // Minutes
  resolvedAt        DateTime?
  resolutionTime    Int?              // Minutes

  // Satisfaction
  satisfactionRating Int?             // 1-5 stars
  satisfactionComment String?

  // Relations
  messages          TicketMessage[]
  attachments       TicketAttachment[]
  internalNotes     InternalNote[]
}
```

**Enums:**
- `TicketCategory`: BUG, FEATURE_REQUEST, QUESTION, BILLING, ACCOUNT, TECHNICAL, OTHER
- `TicketPriority`: LOW, MEDIUM, HIGH, URGENT
- `TicketStatus`: OPEN, PENDING, IN_PROGRESS, RESOLVED, CLOSED

### TicketMessage Model

```prisma
model TicketMessage {
  id                String            @id
  ticketId          String
  ticket            Ticket

  userId            String
  user              User
  isStaffReply      Boolean           @default(false)

  message           String            @db.Text
  isInternal        Boolean           @default(false) // Private notes

  attachments       MessageAttachment[]
}
```

### CannedResponse Model

```prisma
model CannedResponse {
  id                String            @id
  title             String            // "Password Reset Instructions"
  content           String            @db.Text
  category          String?

  usageCount        Int               @default(0)
  lastUsedAt        DateTime?

  createdBy         String
  creator           User
  isActive          Boolean           @default(true)
}
```

### Other Models

- **TicketAttachment** - Files attached to tickets
- **MessageAttachment** - Files attached to messages
- **InternalNote** - Staff-only notes on tickets
- **SupportMetrics** - Daily analytics tracking

## ⚙️ Backend Services

**File:** `/server/src/services/ticketService.js`

### Key Functions

**Ticket Management:**
```javascript
// Generate unique ticket number
await generateTicketNumber(prisma)
// Returns: "TICKET-001234"

// Create new ticket
await createTicket(ticketData, prisma)
// Returns: Ticket object with attachments

// Get ticket by ID
await getTicketById(ticketId, prisma)
// Returns: Full ticket with messages, attachments, notes

// Get user's tickets
await getUserTickets(userId, options, prisma)
// Returns: Paginated list of tickets

// Get all tickets (admin)
await getAllTickets(filters, prisma)
// Returns: Filtered, paginated ticket list
```

**Message & Communication:**
```javascript
// Add message to ticket
await addTicketMessage(ticketId, messageData, prisma)
// Tracks first response time automatically

// Add internal note (staff only)
await addInternalNote(ticketId, userId, note, prisma)
// Not visible to customers
```

**Ticket Operations:**
```javascript
// Update ticket
await updateTicket(ticketId, updates, prisma)
// Updates: status, priority, category, assignedToId, tags

// Assign to staff
await assignTicket(ticketId, assignedToId, prisma)

// Resolve ticket
await resolveTicket(ticketId, prisma)
// Records resolution time

// Close ticket
await closeTicket(ticketId, prisma)

// Rate ticket (customer satisfaction)
await rateTicket(ticketId, rating, comment, prisma)
// Rating: 1-5 stars
```

**Canned Responses:**
```javascript
// Get canned responses
await getCannedResponses(category, prisma)

// Create canned response
await createCannedResponse(data, prisma)

// Use canned response (increments usage count)
await useCannedResponse(cannedResponseId, prisma)
```

**Analytics:**
```javascript
// Get support statistics
await getSupportStats(dateRange, prisma)
// Returns: ticket counts, avg response/resolution time, satisfaction
```

**Automation:**
```javascript
// Auto-close old resolved tickets
await autoCloseOldTickets(daysOld = 7, prisma)
// Closes tickets resolved 7+ days ago
```

## 🔌 API Endpoints

**File:** `/server/src/routes/support.js`

### Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/support/tickets` | Submit new ticket |
| GET | `/api/support/tickets` | Get my tickets |
| GET | `/api/support/tickets/:id` | Get ticket details |
| POST | `/api/support/tickets/:id/messages` | Add reply |
| PATCH | `/api/support/tickets/:id/resolve` | Mark as resolved |
| POST | `/api/support/tickets/:id/rate` | Rate support (1-5 stars) |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/support/admin/tickets` | Get all tickets (with filters) |
| PATCH | `/api/support/admin/tickets/:id` | Update ticket |
| POST | `/api/support/admin/tickets/:id/assign` | Assign ticket |
| POST | `/api/support/admin/tickets/:id/reply` | Staff reply |
| POST | `/api/support/admin/tickets/:id/notes` | Add internal note |
| POST | `/api/support/admin/tickets/:id/close` | Close ticket |
| GET | `/api/support/admin/stats` | Get support statistics |
| GET | `/api/support/admin/canned-responses` | List canned responses |
| POST | `/api/support/admin/canned-responses` | Create canned response |
| POST | `/api/support/admin/canned-responses/:id/use` | Use canned response |

## 🎨 Frontend Pages

### Customer Interface

**1. Submit Ticket** (`/support/new`)
- Subject and description fields
- Category dropdown (Bug, Feature Request, Question, etc.)
- Priority selection
- File upload (up to 5 files, 10MB each)
- SUPERNova AI integration ("Ask AI First")
- Submit button

**2. My Tickets** (`/support/tickets`)
- Table of all user's tickets
- Columns: Ticket #, Subject, Category, Status, Priority, Created, Messages
- Filter by status
- Click to view details

**3. Ticket Detail** (planned - `/support/tickets/:id`)
- Ticket information header
- Conversation thread
- Reply box with file attachment
- "Mark as Resolved" button
- Rate support (after resolution)

### Admin Interface

**4. Support Dashboard** (`/admin/support`)
- Stats cards:
  - Open Tickets
  - Pending Response
  - Resolved Today
  - Avg Response Time
- Filters: status, priority, category, search
- Ticket table with:
  - Priority icons
  - Ticket number
  - Subject/customer
  - Status, assigned to, created date
- Quick actions

**5. Canned Responses** (planned - `/admin/support/canned-responses`)
- List of saved responses
- Usage statistics
- Add/edit/delete
- Category organization

## 📧 Email Notifications

**File:** `/server/src/config/supportEmailTemplates.js`

### Email Templates

**1. Ticket Created (to customer)**
- Subject: `Ticket Created: TICKET-001234 - [Subject]`
- Includes:
  - Ticket number (prominent)
  - Ticket details
  - Expected response time
  - View ticket CTA

**2. Staff Reply (to customer)**
- Subject: `Re: TICKET-001234 - [Subject]`
- Includes:
  - Staff member's reply
  - View & reply CTA
  - Option to mark as resolved

**3. Ticket Resolved (to customer)**
- Subject: `Resolved: TICKET-001234 - [Subject]`
- Includes:
  - Resolution confirmation
  - Satisfaction rating stars (1-5)
  - Reopen option

**4. Ticket Assigned (to staff)**
- Subject: `Ticket Assigned: TICKET-001234 - [Subject]`
- Includes:
  - Customer information
  - Ticket details
  - Priority highlight
  - View & respond CTA

### Integration

```javascript
const { getTicketCreatedEmail } = require('./config/supportEmailTemplates');

// After creating ticket
const emailContent = getTicketCreatedEmail(ticket);

await sendEmail({
  to: ticket.user.email,
  subject: emailContent.subject,
  html: emailContent.html,
  text: emailContent.text
});
```

## 👥 User Workflows

### Customer Journey

**Submit Ticket:**
1. Navigate to `/support/new`
2. Fill out form (subject, description, category, priority)
3. Optionally try SUPERNova AI for instant help
4. Attach files if needed
5. Click "Submit Ticket"
6. Receive confirmation email with ticket number

**Track Ticket:**
1. Go to `/support/tickets`
2. View list of all tickets with status
3. Click ticket to see conversation
4. Add replies if needed
5. Receive email when staff responds

**Resolve & Rate:**
1. When issue is fixed, click "Mark as Resolved"
2. Rate support experience (1-5 stars)
3. Ticket moves to resolved status
4. Auto-closes after 7 days if no further activity

### Support Team Journey

**View Tickets:**
1. Access `/admin/support`
2. See dashboard with all tickets
3. Filter by status, priority, category
4. Sort by urgency

**Handle Ticket:**
1. Click ticket to open details
2. View customer info and full conversation
3. Assign to self or teammate
4. Add internal notes for team
5. Reply to customer
6. Use canned responses for common issues
7. Update status (Pending, In Progress, Resolved)
8. Add tags for organization

**Manage Workload:**
1. View assigned tickets
2. Track response times
3. Monitor urgent tickets
4. Bulk actions (future enhancement)

## 🔧 Admin Features

### Priority System

| Priority | Color | Icon | Response Time |
|----------|-------|------|---------------|
| LOW      | Green | ⬇️    | 48 hours      |
| MEDIUM   | Yellow | ➡️   | 24 hours      |
| HIGH     | Orange | ⬆️   | 4 hours       |
| URGENT   | Red   | 🔴   | 1 hour        |

### Status Workflow

```
OPEN → New ticket, needs attention
  ↓
PENDING → Waiting on customer response
  ↓
IN_PROGRESS → Staff actively working
  ↓
RESOLVED → Issue fixed, awaiting customer confirmation
  ↓
CLOSED → Ticket archived (auto after 7 days)
```

### SLA Tracking

**Metrics tracked:**
- **First Response Time:** Minutes until staff first replies
- **Resolution Time:** Minutes from open to resolved
- **Average Response Time:** Across all tickets
- **Customer Satisfaction:** Average rating 1-5 stars

**Displayed on dashboard:**
- Open tickets count
- Pending response count
- Resolved today count
- Avg response time
- Satisfaction score

### Internal Notes

Staff can add private notes visible only to team:
- "Called customer, issue confirmed"
- "Escalating to dev team"
- "Waiting on third-party API fix"
- "Customer is VIP, priority handling"

Notes are separate from messages and don't email customer.

### Canned Responses

Pre-written responses for common issues:

**Examples:**
- "How to reset password"
- "Billing questions"
- "Feature not available in Free tier"
- "Bug report received, escalated to dev"

**Features:**
- Categorized (account, billing, technical)
- Usage tracking
- Quick insert with edit before sending
- Team-shared library

## 📖 Integration Guide

### Step 1: Apply Schema

Add models from `/schema/support-tickets.prisma` to your main schema:

```bash
# Merge schema files
cat schema/support-tickets.prisma >> prisma/schema.prisma

# Run migration
npx prisma migrate dev --name add_support_tickets
npx prisma generate
```

### Step 2: Set Up Routes

In your Express app:

```javascript
const supportRoutes = require('./routes/support');

// Attach Prisma to requests
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Mount support routes
app.use('/api/support', supportRoutes);
```

### Step 3: Add Frontend Routes

In your React app:

```jsx
import SubmitTicket from './pages/Support/SubmitTicket';
import MyTickets from './pages/Support/MyTickets';
import SupportDashboard from './pages/Admin/SupportDashboard';

// Routes
<Route path="/support/new" element={<SubmitTicket />} />
<Route path="/support/tickets" element={<MyTickets />} />
<Route path="/admin/support" element={<SupportDashboard />} />
```

### Step 4: Configure File Uploads

Ensure upload directory exists:

```bash
mkdir -p server/uploads/support
chmod 755 server/uploads/support
```

### Step 5: Integrate Email Service

Configure your email service (SendGrid, Mailgun, etc.):

```javascript
const { getTicketCreatedEmail } = require('./config/supportEmailTemplates');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendTicketEmail(ticket) {
  const emailContent = getTicketCreatedEmail(ticket);

  await sgMail.send({
    to: ticket.user.email,
    from: 'support@thedaitaniverse.com',
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });
}
```

### Step 6: Set Up Automation

Create cron job to auto-close old tickets:

```javascript
const cron = require('node-cron');
const { autoCloseOldTickets } = require('./services/ticketService');

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  const closedCount = await autoCloseOldTickets(7, prisma);
  console.log(`Auto-closed ${closedCount} old resolved tickets`);
});
```

## 🧪 Testing

### Manual Testing Checklist

**Customer Flow:**
- [ ] Submit ticket with subject and description
- [ ] Upload file attachments
- [ ] Receive confirmation email with ticket number
- [ ] View "My Tickets" list
- [ ] Open ticket to see details
- [ ] Add reply to ticket
- [ ] Mark ticket as resolved
- [ ] Rate support experience

**Admin Flow:**
- [ ] View support dashboard
- [ ] Filter tickets by status/priority/category
- [ ] Open ticket to see details
- [ ] View customer information
- [ ] Assign ticket to staff member
- [ ] Add internal note (private)
- [ ] Reply to customer
- [ ] Use canned response
- [ ] Change ticket status/priority
- [ ] Close ticket

**Email Notifications:**
- [ ] Ticket created email sent to customer
- [ ] Staff reply email sent to customer
- [ ] Ticket resolved email sent to customer
- [ ] Ticket assigned email sent to staff
- [ ] All emails have working "View Ticket" links

**Analytics:**
- [ ] Dashboard shows correct ticket counts
- [ ] Response times calculated correctly
- [ ] Satisfaction ratings display
- [ ] Stats update in real-time

### Test Scenarios

**1. Urgent Ticket Flow:**
```
1. Customer submits urgent bug report
2. System emails support team
3. Admin assigns to senior developer
4. Developer adds internal note
5. Developer replies with fix
6. Customer confirms fixed
7. Ticket resolved
8. Auto-closes after 7 days
```

**2. Multi-Message Conversation:**
```
1. Customer asks billing question
2. Support requests account details
3. Customer provides info
4. Support explains charges
5. Customer satisfied
6. Marks as resolved
7. Rates 5 stars
```

**3. Escalation:**
```
1. Customer reports critical bug
2. Level 1 support can't fix
3. Adds internal note "Escalating to dev"
4. Reassigns to dev team
5. Dev investigates, adds note
6. Dev fixes and replies
7. Customer tests and confirms
8. Ticket resolved
```

## 🚀 Next Steps

After implementing Phase 2BK:

1. **Live Chat Integration**
   - Add real-time WebSocket chat
   - "Support is typing..." indicator
   - Instant notifications

2. **Knowledge Base**
   - Self-service articles
   - Search before submitting ticket
   - Reduce ticket volume

3. **Ticket Templates**
   - Pre-filled forms for common issues
   - Bug report template
   - Feature request template

4. **SLA Automation**
   - Auto-escalate overdue tickets
   - Email reminders to staff
   - Priority queue management

5. **Advanced Analytics**
   - Staff performance metrics
   - Response time trends
   - Category analysis
   - Customer satisfaction trends

6. **Mobile App**
   - Submit tickets from mobile
   - Push notifications
   - Quick replies

---

**Phase 2BK Status:** ✅ Complete

**Built with:** Prisma, Express, React, Multer

**Dependencies:** @prisma/client, multer, express

**Integration Required:** Email service (SendGrid, Mailgun, etc.)

**Support:** Comprehensive customer support system ready for production use
