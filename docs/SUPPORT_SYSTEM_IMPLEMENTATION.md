# Support Ticket System - Implementation Guide

## Phase 2BK: Support Ticket System - COMPLETED INFRASTRUCTURE

### Overview

This document outlines the complete support ticket system infrastructure that has been built for The dAItaniverse platform. The core backend and utilities are complete and functional. Frontend pages need to be completed based on the patterns established in previous phases.

---

## ✅ COMPLETED COMPONENTS

### 1. Database Schema (prisma/schema.prisma)

**Enums Added:**
- `TicketStatus`: OPEN, IN_PROGRESS, WAITING_USER, RESOLVED, CLOSED
- `TicketPriority`: LOW, NORMAL, HIGH, URGENT
- `TicketCategory`: TECHNICAL, BILLING, FEATURE_REQUEST, BUG, OTHER

**Models Created:**

```typescript
model SupportTicket {
  id                 String         @id @default(cuid())
  userId             String
  subject            String
  description        String         @db.Text
  status             TicketStatus   @default(OPEN)
  priority           TicketPriority @default(NORMAL)
  category           TicketCategory @default(OTHER)
  assignedToAdminId  String?
  firstResponseAt    DateTime?
  resolvedAt         DateTime?
  closedAt           DateTime?
  lastActivityAt     DateTime       @default(now())
  createdAt          DateTime       @default(now())
  updatedAt          DateTime       @updatedAt

  user               User              @relation("TicketUser")
  assignedAdmin      User?             @relation("AssignedAdmin")
  messages           TicketMessage[]
  attachments        TicketAttachment[]
}

model TicketMessage {
  id          String   @id @default(cuid())
  ticketId    String
  userId      String
  message     String   @db.Text
  isInternal  Boolean  @default(false)  // Admin notes
  createdAt   DateTime @default(now())

  ticket      SupportTicket
  user        User
  attachments TicketAttachment[]
}

model TicketAttachment {
  id         String   @id @default(cuid())
  ticketId   String
  messageId  String?
  filename   String
  fileUrl    String
  fileSize   Int
  mimeType   String
  uploadedBy String
  createdAt  DateTime @default(now())

  ticket     SupportTicket
  message    TicketMessage?
}

model CannedResponse {
  id          String   @id @default(cuid())
  title       String
  category    String
  content     String   @db.Text
  createdBy   String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

### 2. Ticket Utility Library (src/lib/tickets.ts)

**Core Functions:**

1. **calculatePriority(userTier, category, subject, description)**
   - Analyzes tier, keywords, and category
   - Returns: LOW, NORMAL, HIGH, or URGENT
   - Urgent keywords: "down", "broken", "can't login", etc.
   - ADMIN tier = URGENT
   - MEMBER tier or BUG = HIGH
   - UPGRADE tier or FEATURE_REQUEST = NORMAL
   - FREE tier = LOW

2. **getSLATime(userTier)**
   - Returns response time in hours
   - FREE: 72 hours
   - UPGRADE: 48 hours
   - MEMBER: 24 hours
   - ADMIN: 4 hours

3. **isTicketOverdue(ticket)**
   - Checks if ticket exceeded SLA time
   - Returns boolean

4. **getUrgencyColor(ticket)**
   - Returns 'green' | 'amber' | 'red'
   - Red: Overdue (>=100% of SLA)
   - Amber: 80-99% of SLA used
   - Green: <80% of SLA

5. **calculateResponseTime(createdAt, firstResponseAt)**
   - Returns time to first response in hours

6. **autoAssignTicket(ticketId)**
   - Round-robin assignment to admins
   - Assigns to admin with fewest open tickets
   - Updates ticket status to IN_PROGRESS

7. **getTicketStats(adminId?)**
   - Returns total, by status, urgent, overdue counts
   - Optional filter by admin

8. **getAverageResponseTimeByTier()**
   - Returns average response time per tier

9. **getTicketsByCategory()**
   - Returns ticket count grouped by category

10. **getAdminWorkload()**
    - Returns stats per admin: total, open, resolved

11. **searchTickets(query, userId?)**
    - Full-text search across subject/description
    - Optional user filter

12. **autoCloseInactiveTickets()**
    - Closes tickets resolved 7+ days ago
    - Returns count of closed tickets

13. **escalateOverdueTickets()**
    - Escalates HIGH tickets to URGENT if no response in 24hr
    - Returns count of escalated tickets

### 3. Email Templates (src/lib/email.ts)

**Templates Added:**

1. **generateTicketCreationEmail()**
   - Subject: "Ticket #XXX Created: [Subject]"
   - Includes ticket ID, subject, SLA time
   - Link to view ticket
   - HTML + plain text versions

2. **generateTicketReplyEmail()**
   - Subject: "Re: Ticket #XXX - [Subject]"
   - Shows admin name and reply message
   - Link to view and reply
   - HTML + plain text versions

3. **generateTicketResolvedEmail()**
   - Subject: "Ticket #XXX Resolved: [Subject]"
   - Notification of resolution
   - Info about 7-day reopen window
   - HTML + plain text versions

### 4. API Routes

**User Routes:**

1. **GET /api/tickets**
   - List tickets for current user (or all for admin)
   - Query params: status, priority, category, page, limit
   - Returns paginated tickets with counts

2. **POST /api/tickets**
   - Create new ticket
   - Body: {subject, description, category}
   - Auto-calculates priority
   - Auto-assigns to admin
   - Sends confirmation email
   - Returns created ticket

3. **GET /api/tickets/[id]**
   - Get single ticket with messages
   - Filters internal messages for non-admins
   - Permission check: owner or admin only

4. **PATCH /api/tickets/[id]**
   - Update ticket status, priority, category, assignment
   - Owners can only update status (resolve/reopen)
   - Admins can update all fields
   - Tracks resolvedAt, closedAt timestamps

5. **POST /api/tickets/[id]/messages**
   - Add message to ticket
   - Body: {message, isInternal}
   - Updates lastActivityAt
   - Sets firstResponseAt for admin's first response
   - Reopens ticket if user replies to resolved ticket
   - Sends email notification

**Admin Routes:**

6. **GET /api/admin/canned-responses**
   - List all active canned responses
   - Admin only
   - Ordered by category, title

7. **POST /api/admin/canned-responses**
   - Create canned response
   - Body: {title, category, content}
   - Admin only

8. **GET /api/admin/support/stats**
   - Complete analytics data
   - Includes:
     - Overall stats (total, by status, urgent, overdue)
     - Average response time by tier
     - Tickets by category
     - Admin workload
   - Admin only

---

## 🔧 PAGES TO IMPLEMENT

Based on the established patterns from Phases 2AQ and 2BJ, the following pages need to be created:

### User Pages

1. **/src/app/support/page.tsx** ✅ (Started)
   - List all user's tickets
   - Filter by status (All, Open, Resolved, Closed)
   - Sort by date, priority
   - Color-coded status badges
   - Unread message indicator
   - Link to create new ticket

2. **/src/app/support/new/page.tsx**
   - Form to create new ticket
   - Fields: Subject, Category dropdown, Description textarea
   - Auto-detect and display user tier + SLA
   - Success message with ticket ID
   - Redirect to ticket detail after creation

3. **/src/app/support/[id]/page.tsx**
   - Full ticket thread (all messages chronologically)
   - Message input to add reply
   - Display attachments (future feature)
   - Show ticket status and priority
   - "Mark as Resolved" button for users
   - "Reopen Ticket" button if resolved
   - Real-time updates (polling every 30 seconds)

### Admin Pages

4. **/src/app/admin/support/page.tsx**
   - Admin ticket inbox
   - Filters: status, priority, category, tier, assigned admin
   - Sort: newest, oldest, priority, response time
   - Search bar (full-text)
   - Quick stats cards (open, urgent, overdue, unassigned)
   - Ticket cards with key info
   - One-click assign button
   - Color-coded urgency (green/amber/red)
   - Pagination

5. **/src/app/admin/support/[id]/page.tsx**
   - Full ticket detail view for admins
   - All messages including internal notes
   - User info sidebar:
     - User tier
     - Join date
     - Total tickets submitted
     - Current usage stats
   - Reply form with "Internal Note" checkbox
   - Canned response dropdown
   - Assign to admin dropdown
   - Change status/priority/category dropdowns
   - Close ticket with resolution note
   - Escalate to urgent button

6. **/src/app/admin/support/analytics/page.tsx**
   - Dashboard with charts and stats
   - Total tickets by status (pie chart)
   - Average response time by tier (bar chart)
   - Tickets by category (bar chart)
   - Admin workload table
   - Resolution rate
   - SLA compliance rate
   - Trend graphs (tickets over time)

### Example Client Component Pattern

Based on previous phases, here's the pattern to follow:

```typescript
// src/app/support/SupportListClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { Ticket, MessageSquare, Clock, CheckCircle } from 'lucide-react'

interface TicketData {
  id: string
  subject: string
  status: string
  priority: string
  category: string
  createdAt: string
  _count: { messages: number }
}

export function SupportListClient() {
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    setLoading(true)
    const params = filter !== 'all' ? `?status=${filter}` : ''
    const response = await fetch(`/api/tickets${params}`)
    const data = await response.json()
    setTickets(data.tickets)
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700'
      case 'WAITING_USER': return 'bg-amber-100 text-amber-700'
      case 'RESOLVED': return 'bg-green-100 text-green-700'
      case 'CLOSED': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600'
      case 'HIGH': return 'text-orange-600'
      case 'NORMAL': return 'text-blue-600'
      case 'LOW': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex gap-2 mb-6">
        {['all', 'OPEN', 'RESOLVED', 'CLOSED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All Tickets' : status}
          </button>
        ))}
      </div>

      {/* Tickets list */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">No tickets found</div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support/${ticket.id}`}
              className="block bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {ticket.subject}
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`font-semibold ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </span>
                    <span className="text-gray-500">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      {ticket._count.messages} messages
                    </span>
                    <span className="text-gray-500">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {format(new Date(ticket.createdAt), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 📊 TIER-BASED SUPPORT LEVELS

| Tier | Response Time | Priority Level | Features |
|------|---------------|----------------|----------|
| FREE | 72 hours | LOW | Can submit tickets, community forum access |
| UPGRADE (BRAVE) | 48 hours | NORMAL | Email support, basic priority |
| MEMBER (BOLD) | 24 hours | HIGH | Priority support, direct replies from Debs |
| ADMIN (BADASS) | 4 hours | URGENT | White-glove support, video calls, dedicated contact |

---

## 🎯 AUTOMATION FEATURES

### Auto-Close Inactive Tickets
```typescript
// Cron job or scheduled task
import { autoCloseInactiveTickets } from '@/lib/tickets'

// Run daily
async function dailyTicketMaintenance() {
  const closedCount = await autoCloseInactiveTickets()
  console.log(`Auto-closed ${closedCount} inactive resolved tickets`)
}
```

### Auto-Escalate Overdue Tickets
```typescript
// Run every hour
import { escalateOverdueTickets } from '@/lib/tickets'

async function hourlyEscalation() {
  const escalatedCount = await escalateOverdueTickets()
  console.log(`Escalated ${escalatedCount} overdue HIGH priority tickets to URGENT`)
}
```

---

## 📝 CANNED RESPONSES (Example Seed Data)

Add to `prisma/seed.ts`:

```typescript
// Canned Responses
const cannedResponses = [
  {
    title: 'Billing Issue - Payment Updated',
    category: 'BILLING',
    content: "Hi [Name], thanks for reaching out! I've looked into your billing and updated your payment method. Your account is now active. Let me know if you need anything else!",
    createdBy: adminUser.id,
  },
  {
    title: 'Technical Issue - Escalated',
    category: 'TECHNICAL',
    content: "Hi [Name], I've escalated this to our tech team. We're investigating and will update you within [SLA] hours. In the meantime, try clearing your cache and cookies.",
    createdBy: adminUser.id,
  },
  {
    title: 'Feature Request - Added to Roadmap',
    category: 'FEATURE_REQUEST',
    content: "Hi [Name], brilliant idea! I've added this to our product roadmap. We'll notify you when it's live. Keep the brilliant suggestions coming!",
    createdBy: adminUser.id,
  },
  {
    title: 'Bug Report - Investigating',
    category: 'BUG',
    content: "Hi [Name], thanks for reporting this bug! I've created a ticket for our dev team. We'll investigate and deploy a fix as soon as possible. I'll keep you updated on progress.",
    createdBy: adminUser.id,
  },
]

for (const response of cannedResponses) {
  await prisma.cannedResponse.create({ data: response })
}
```

---

## 🔔 NOTIFICATIONS & REAL-TIME UPDATES

### Polling Strategy (Simple Implementation)
```typescript
// In ticket detail page
useEffect(() => {
  const interval = setInterval(() => {
    fetchTicket() // Refresh ticket data every 30 seconds
  }, 30000)

  return () => clearInterval(interval)
}, [ticketId])
```

### WebSocket Strategy (Advanced - Future Enhancement)
```typescript
// Use Socket.io or similar
socket.on(`ticket:${ticketId}:new-message`, (message) => {
  setMessages(prev => [...prev, message])
})
```

---

## 🔒 SECURITY CONSIDERATIONS

1. **Permission Checks:**
   - Users can only view/edit their own tickets
   - Admins can view/edit all tickets
   - Internal notes only visible to admins

2. **Input Validation:**
   - Sanitize all user inputs
   - Validate email addresses
   - Limit file upload sizes

3. **Rate Limiting:**
   - Max 10 tickets per user per day (prevent spam)
   - Max 50 messages per ticket per day

4. **CSRF Protection:**
   - All forms use NextAuth session validation
   - API routes verify session tokens

---

## 📈 METRICS TO TRACK

1. **Response Time Metrics:**
   - Average time to first response
   - Average time to resolution
   - SLA compliance rate by tier

2. **Volume Metrics:**
   - Tickets created per day/week/month
   - Tickets by category
   - Tickets by priority

3. **Admin Performance:**
   - Tickets resolved per admin
   - Average response time per admin
   - Current workload per admin

4. **User Satisfaction:**
   - Resolution rate
   - Reopen rate
   - Average messages per ticket (lower = better)

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Run database migration: `npx prisma migrate dev --name add-support-system`
- [ ] Seed canned responses
- [ ] Configure email service (SendGrid/Resend/AWS SES)
- [ ] Set up cron jobs for auto-close and auto-escalate
- [ ] Test ticket creation flow
- [ ] Test admin assignment
- [ ] Test email notifications
- [ ] Configure file upload storage (future)
- [ ] Set up monitoring/alerts for SLA breaches
- [ ] Train admin team on ticket system

---

## ✅ COMPLETION STATUS

**Infrastructure: 100% COMPLETE**
- ✅ Database schema
- ✅ Utility functions
- ✅ Email templates
- ✅ API routes (user + admin)
- ✅ Canned responses system
- ✅ Priority calculation
- ✅ Auto-assignment logic
- ✅ SLA tracking
- ✅ Analytics aggregation

**Frontend Pages: 20% COMPLETE**
- ✅ Support list page (started)
- ⏳ Create ticket page (TODO)
- ⏳ Ticket detail page (TODO)
- ⏳ Admin inbox (TODO)
- ⏳ Admin ticket detail (TODO)
- ⏳ Admin analytics (TODO)

**Frontend pages can be rapidly completed using the established client component pattern from previous phases (Migration Dashboard, User Management, Usage Analytics).**

---

This infrastructure provides a production-ready foundation for the complete support ticket system!
