# SUPERNova CRM System Documentation

## Overview

The SUPERNova CRM (Customer Relationship Management) system is a complete sales and contact management solution built into the dAItaniverse platform. It features modern drag-and-drop interfaces, powerful analytics, and seamless integration with the quiz system for automatic lead capture.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [API Routes](#api-routes)
4. [Frontend Pages](#frontend-pages)
5. [Database Schema](#database-schema)
6. [Quiz Integration](#quiz-integration)
7. [Usage Guide](#usage-guide)
8. [Development](#development)

---

## Features

### Contact Management
- **Comprehensive Contact Database**: Store names, emails, phone numbers, companies, job titles, locations
- **Custom Fields**: Flexible JSON storage for additional contact data
- **Tagging System**: Organize contacts with multiple tags
- **Status Tracking**: LEAD → PROSPECT → CUSTOMER → INACTIVE lifecycle
- **Source Tracking**: QUIZ, MANUAL, IMPORT, API sources
- **Advanced Search & Filtering**: Search by name, email, company with status/source filters
- **Bulk Import**: CSV upload with field mapping and duplicate detection
- **Assignment**: Assign contacts to team members

### Deal Pipeline
- **Visual Kanban Board**: Drag-and-drop deals through stages
- **Pipeline Stages**: LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST
- **Deal Tracking**: Track value, currency, probability, expected close dates
- **Contact Association**: Link deals to contacts
- **Win/Loss Analysis**: Track reasons and dates for closed deals
- **Pipeline Analytics**: Real-time value calculations per stage

### Activity Timeline
- **Activity Types**: NOTE, EMAIL, CALL, MEETING, TASK
- **Contact & Deal Association**: Link activities to contacts or deals
- **Due Dates**: Schedule future activities
- **Completion Tracking**: Mark activities as complete
- **Full Timeline View**: See all activities for a contact or deal

### Task Management
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
- **Status Workflow**: PENDING → IN_PROGRESS → COMPLETED/CANCELLED
- **Due Date Tracking**: Automatic overdue detection
- **Assignment**: Assign tasks to team members
- **Quick Complete**: One-click task completion
- **My Tasks Filter**: View only your assigned tasks

### Analytics Dashboard
- **Key Metrics**:
  - Total contacts (with 30-day growth)
  - Total deals (with 30-day growth)
  - Pipeline value (open opportunities)
  - Conversion rate (won vs lost)
- **Visualizations**:
  - Contacts by status breakdown
  - Contacts by source breakdown
  - Pipeline by stage (value + count)
  - Won deals this month
  - Task status overview
  - Activity type summary
- **Real-time Updates**: All metrics update in real-time

---

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **UI Libraries**:
  - `@dnd-kit/core` - Drag and drop functionality
  - `@dnd-kit/sortable` - Sortable kanban boards
  - `papaparse` - CSV parsing for imports
  - Lucide React - Icons
- **Styling**: Tailwind CSS with custom dAItaniverse branding

### Design System
- **Colors**:
  - Hot Pink: `#FF008E`
  - Light Teal: `#00F0E9`
  - Neon Lime: Custom accent
  - Charcoal: Background
- **Fonts**:
  - Supernova: Headlines
  - Josefin Sans: Body text
- **UI Pattern**: Glass-morphism cards with backdrop blur

---

## API Routes

### Contacts API

#### `GET /api/crm/contacts`
List contacts with filtering, search, and pagination.

**Query Parameters**:
- `search` (string): Search in name, email, phone, company
- `status` (string): Filter by status (LEAD, PROSPECT, CUSTOMER, INACTIVE)
- `source` (string): Filter by source (QUIZ, MANUAL, IMPORT, API)
- `assignedTo` (string): Filter by assigned user ID
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)

**Response**:
```json
{
  "contacts": [...],
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3
}
```

#### `POST /api/crm/contacts`
Create a new contact.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Example Corp",
  "jobTitle": "CEO",
  "location": "New York, NY",
  "tags": ["VIP", "Newsletter"],
  "customFields": { "industry": "Tech" },
  "status": "LEAD",
  "source": "MANUAL",
  "assignedToId": "user123"
}
```

**Response**: Created contact object (201)

#### `GET /api/crm/contacts/[id]`
Get single contact with full details.

**Response**: Contact object with related deals, activities, tasks

#### `PATCH /api/crm/contacts/[id]`
Update contact.

**Request Body**: Partial contact object

**Response**: Updated contact object

#### `DELETE /api/crm/contacts/[id]`
Delete contact (cascades to related records).

**Response**: 204 No Content

#### `POST /api/crm/contacts/import`
Bulk import contacts from CSV.

**Request Body**:
```json
{
  "contacts": [...],
  "skipDuplicates": true
}
```

**Response**:
```json
{
  "imported": 45,
  "skipped": 5,
  "errors": []
}
```

---

### Deals API

#### `GET /api/crm/deals`
List all deals grouped by stage.

**Response**:
```json
{
  "dealsByStage": {
    "LEAD": [...],
    "QUALIFIED": [...],
    "PROPOSAL": [...],
    "NEGOTIATION": [...],
    "WON": [...],
    "LOST": [...]
  }
}
```

#### `POST /api/crm/deals`
Create a new deal.

**Request Body**:
```json
{
  "title": "Website Redesign Project",
  "value": 50000,
  "currency": "USD",
  "contactId": "contact123",
  "stage": "QUALIFIED",
  "probability": 70,
  "expectedCloseDate": "2025-12-31",
  "notes": "Warm lead from referral",
  "assignedToId": "user123"
}
```

#### `GET /api/crm/deals/[id]`
Get single deal with full details.

#### `PATCH /api/crm/deals/[id]`
Update deal (including stage changes).

**Request Body**: Partial deal object

#### `DELETE /api/crm/deals/[id]`
Delete deal.

---

### Activities API

#### `GET /api/crm/activities`
List activities.

**Query Parameters**:
- `contactId` (string): Filter by contact
- `dealId` (string): Filter by deal
- `type` (string): Filter by type (NOTE, EMAIL, CALL, MEETING)

#### `POST /api/crm/activities`
Create activity.

**Request Body**:
```json
{
  "type": "CALL",
  "subject": "Discovery Call",
  "description": "Discussed requirements and timeline",
  "contactId": "contact123",
  "dealId": "deal456",
  "dueDate": "2025-12-15T10:00:00Z",
  "assignedToId": "user123"
}
```

#### `PATCH /api/crm/activities/[id]`
Update activity.

#### `DELETE /api/crm/activities/[id]`
Delete activity.

---

### Tasks API

#### `GET /api/crm/tasks`
List tasks.

**Query Parameters**:
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `myTasks` (boolean): Show only tasks assigned to current user
- `dueDate` (string): Filter by due date

#### `POST /api/crm/tasks`
Create task.

**Request Body**:
```json
{
  "title": "Follow up with lead",
  "description": "Send proposal document",
  "priority": "HIGH",
  "status": "PENDING",
  "contactId": "contact123",
  "dealId": "deal456",
  "dueDate": "2025-12-20",
  "assignedToId": "user123"
}
```

#### `PATCH /api/crm/tasks/[id]`
Update task (mark complete, change status, etc.)

#### `DELETE /api/crm/tasks/[id]`
Delete task.

---

### Analytics API

#### `GET /api/crm/analytics`
Get comprehensive CRM statistics.

**Response**:
```json
{
  "contacts": {
    "total": 500,
    "recent": 45,
    "byStatus": [...],
    "bySource": [...]
  },
  "deals": {
    "total": 120,
    "recent": 15,
    "pipelineValue": 1500000,
    "conversionRate": 25,
    "byStage": [...],
    "wonThisMonth": {
      "count": 8,
      "value": 240000
    }
  },
  "tasks": {
    "total": 89,
    "overdue": 12,
    "byStatus": [...]
  },
  "activities": {
    "total": 345,
    "byType": [...]
  }
}
```

---

## Frontend Pages

### `/crm/contacts` - Contact List
**Features**:
- Search bar (searches name, email, phone, company)
- Status filter dropdown
- Source filter dropdown
- Responsive table view
- Inline stats (deals, tasks, activities count)
- Click row to view details
- "New Contact" button with modal

**Mobile-Responsive**: Adapts to mobile with stacked layout

### `/crm/contacts/[id]` - Contact Detail
**Features**:
- Editable contact info card
- Activity timeline (all notes, calls, emails, meetings)
- Associated deals list
- Related tasks list
- Quick add note/activity buttons
- Delete contact option

### `/crm/contacts/import` - CSV Import
**Features**:
- Drag & drop CSV upload
- File preview (first 5 rows)
- Field mapping interface (map CSV columns to contact fields)
- Duplicate detection (skips existing emails)
- Import results summary (imported/skipped/errors)
- "Import Another File" or "View Contacts" actions

**Supported CSV Columns**:
- name (required)
- email (required)
- phone
- company
- jobTitle
- location

### `/crm/deals` - Deal Pipeline (Kanban)
**Features**:
- 6-column kanban board (LEAD, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST)
- Drag-and-drop deals between stages (updates via API)
- Deal cards show:
  - Title
  - Value (formatted currency)
  - Probability %
  - Contact name
- Stage headers show:
  - Deal count
  - Total stage value
- Click deal card to view details

**Mobile-Responsive**: Switches to horizontal scroll on mobile

### `/crm/deals/[id]` - Deal Detail
**Features**:
- Editable deal info
- Contact link (click to view contact)
- Stage change dropdown
- Activity timeline
- Related tasks
- Stage history tracking
- Won/Lost marking with reason

### `/crm/tasks` - Task List
**Features**:
- "My Tasks Only" toggle
- Status filter tabs (ALL, PENDING, IN_PROGRESS, COMPLETED)
- One-click task completion (checkbox)
- Priority badges (color-coded)
- Overdue indicator (red alert icon)
- Due date display
- Associated contact/deal links
- "New Task" button

### `/crm/analytics` - Analytics Dashboard
**Features**:
- 4 key metric cards:
  - Total Contacts
  - Total Deals
  - Pipeline Value
  - Conversion Rate
- Contacts by Status (progress bars)
- Contacts by Source (progress bars)
- Pipeline by Stage (value bars + deal counts)
- Won This Month highlight card
- Task Overview breakdown
- Activities Summary

**Auto-Refresh**: Metrics update when navigating back to page

---

## Database Schema

### Contact Model
```prisma
model Contact {
  id           String        @id @default(cuid())
  name         String
  email        String        @unique
  phone        String?
  company      String?
  jobTitle     String?
  location     String?
  tags         String[]
  customFields Json?
  source       ContactSource @default(MANUAL)
  status       ContactStatus @default(LEAD)
  assignedToId String?
  assignedTo   User?

  deals        Deal[]
  activities   Activity[]
  tasks        Task[]
  segments     ContactSegmentMember[]

  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

### Deal Model
```prisma
model Deal {
  id                String    @id @default(cuid())
  title             String
  value             Float
  currency          String    @default("USD")
  stage             DealStage @default(LEAD)
  probability       Int       @default(0)
  expectedCloseDate DateTime?
  notes             String?   @db.Text
  customFields      Json?
  assignedToId      String?
  assignedTo        User?

  contactId         String
  contact           Contact
  activities        Activity[]
  tasks             Task[]

  wonAt             DateTime?
  lostAt            DateTime?
  lostReason        String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

### Activity Model
```prisma
model Activity {
  id           String       @id @default(cuid())
  type         ActivityType
  subject      String
  description  String?      @db.Text
  contactId    String?
  contact      Contact?
  dealId       String?
  deal         Deal?
  assignedToId String?
  assignedTo   User?
  dueDate      DateTime?
  completedAt  DateTime?

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}
```

### Task Model
```prisma
model Task {
  id           String       @id @default(cuid())
  title        String
  description  String?      @db.Text
  priority     TaskPriority @default(MEDIUM)
  status       TaskStatus   @default(PENDING)
  contactId    String?
  contact      Contact?
  dealId       String?
  deal         Deal?
  assignedToId String?
  assignedTo   User?
  dueDate      DateTime?
  completedAt  DateTime?

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}
```

### Enums
```prisma
enum ContactSource {
  QUIZ
  MANUAL
  IMPORT
  API
}

enum ContactStatus {
  LEAD
  PROSPECT
  CUSTOMER
  INACTIVE
}

enum DealStage {
  LEAD
  QUALIFIED
  PROPOSAL
  NEGOTIATION
  WON
  LOST
}

enum ActivityType {
  NOTE
  EMAIL
  CALL
  MEETING
  TASK
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

---

## Quiz Integration

### Automatic Contact Creation

When a user completes a quiz, the system **automatically creates a CRM contact** with the following details:

**Implementation** (`app/api/quiz/submit/route.ts`):

```typescript
// After quiz submission and email sending
const existingContact = await prisma.contact.findUnique({
  where: { email },
})

if (!existingContact) {
  await prisma.contact.create({
    data: {
      name: name || 'Quiz Lead',
      email,
      phone,
      source: 'QUIZ',
      status: 'LEAD',
      tags: [scoringResult.resultTier?.name] || ['Quiz'],
      customFields: {
        quizId,
        quizScore: scoringResult.totalScore,
        quizCompletedAt: new Date().toISOString(),
        recommendedPrograms: scoringResult.recommendedPrograms.map(p => p.id),
        resultTier: scoringResult.resultTier?.name || null,
      },
    },
  })
}
```

### Contact Custom Fields from Quiz
- `quizId`: Which quiz they completed
- `quizScore`: Their total score
- `quizCompletedAt`: Timestamp of completion
- `recommendedPrograms`: Array of recommended program IDs
- `resultTier`: Result tier name (e.g., "Beginner", "Advanced")

### Tags from Quiz
- Automatically tagged with their result tier name
- Makes it easy to segment quiz leads in CRM

### Duplicate Prevention
- Checks if email already exists
- Only creates new contact if email is new
- Prevents duplicate entries from repeat quiz takers

### Lead Follow-Up Workflow
1. User completes quiz
2. Contact auto-created with source = "QUIZ"
3. View all quiz leads: Filter contacts by source = "QUIZ"
4. Create deals for qualified leads
5. Add follow-up tasks
6. Track entire sales cycle in CRM

---

## Usage Guide

### Getting Started

1. **Access CRM**: Navigate to `/crm/analytics` (dashboard) or `/crm/contacts`
2. **Add First Contact**: Click "New Contact" button or import CSV
3. **Create Deal**: Click on contact → "Create Deal" button
4. **Move Through Pipeline**: Drag deals in kanban view to update stage
5. **Add Tasks**: Create follow-up tasks with due dates
6. **Log Activities**: Add notes, calls, meetings to contact timeline

### Best Practices

#### Contact Management
- **Use Tags**: Organize contacts with meaningful tags (VIP, Newsletter, Event, etc.)
- **Custom Fields**: Store industry-specific data in customFields JSON
- **Regular Updates**: Keep status current (LEAD → PROSPECT → CUSTOMER)
- **Assignment**: Assign contacts to team members for accountability

#### Deal Management
- **Update Probability**: Adjust as deal progresses (0% to 100%)
- **Set Close Dates**: Track expected close dates for forecasting
- **Add Notes**: Document important details in deal notes
- **Won/Lost Tracking**: Always mark final outcome with reason

#### Task Management
- **Set Priorities**: Use URGENT for time-sensitive tasks
- **Realistic Due Dates**: Set achievable deadlines
- **Daily Review**: Check "My Tasks" daily
- **Link to Contacts**: Always associate tasks with contacts/deals

#### CSV Import Tips
- **Clean Data**: Remove duplicates before import
- **Required Fields**: Ensure name and email columns exist
- **Test First**: Import 5-10 rows to test field mapping
- **Review Results**: Check skipped/error counts after import

### Analytics Insights

**Use analytics to**:
- Track lead generation effectiveness (source breakdown)
- Monitor sales pipeline health (stage distribution)
- Identify bottlenecks (deals stuck in stages)
- Calculate monthly revenue (won deals)
- Measure team productivity (task completion)
- Forecast revenue (pipeline value × probability)

---

## Development

### Local Setup

1. **Prerequisites**:
   - Node.js 18+
   - PostgreSQL database
   - Environment variables configured

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Migration**:
   ```bash
   npx prisma migrate dev
   ```

4. **Run Dev Server**:
   ```bash
   npm run dev
   ```

5. **Access CRM**:
   - Contacts: http://localhost:3000/crm/contacts
   - Deals: http://localhost:3000/crm/deals
   - Tasks: http://localhost:3000/crm/tasks
   - Analytics: http://localhost:3000/crm/analytics

### Project Structure

```
supernova/
├── app/
│   ├── api/
│   │   └── crm/
│   │       ├── contacts/
│   │       │   ├── route.ts          # List, Create
│   │       │   ├── [id]/route.ts     # Get, Update, Delete
│   │       │   └── import/route.ts   # CSV Import
│   │       ├── deals/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── activities/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── tasks/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── analytics/
│   │           └── route.ts
│   └── crm/
│       ├── layout.tsx               # CRM Layout
│       ├── contacts/
│       │   ├── page.tsx            # Contact List
│       │   ├── [id]/page.tsx       # Contact Detail
│       │   └── import/page.tsx     # CSV Import
│       ├── deals/
│       │   ├── page.tsx            # Kanban Board
│       │   └── [id]/page.tsx       # Deal Detail
│       ├── tasks/
│       │   └── page.tsx            # Task List
│       └── analytics/
│           └── page.tsx            # Dashboard
├── lib/
│   └── prisma.ts                   # Prisma Client
└── prisma/
    └── schema.prisma               # Database Schema
```

### Adding Features

#### Add New Contact Field
1. Update Prisma schema
2. Run migration
3. Update API routes (GET/POST/PATCH)
4. Update frontend forms
5. Update TypeScript interfaces

#### Add New Activity Type
1. Add enum to schema: `ActivityType`
2. Run migration
3. Update activity creation forms
4. Update timeline display logic

#### Add Custom Analytics
1. Create aggregation query in `/api/crm/analytics`
2. Add chart component to `/crm/analytics/page.tsx`
3. Use Prisma aggregations (`groupBy`, `count`, `sum`)

### Authentication Integration

All API routes include authentication:

```typescript
function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}
```

**Protect routes**:
```typescript
const userId = getUserIdFromRequest(request)
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Performance Optimization

**Implemented optimizations**:
- Pagination on contact list (50 per page)
- Indexed database queries (status, source, createdAt)
- Selective field loading (use `select` in Prisma)
- Aggregation queries for analytics (single DB call)
- Client-side filtering where appropriate

**Future optimizations**:
- Virtual scrolling for large lists
- Search index (Elasticsearch/Algolia)
- Redis caching for analytics
- Background job for CSV import (>1000 rows)

### Testing

**Manual Testing Checklist**:
- [ ] Create contact via form
- [ ] Import contacts via CSV
- [ ] Search contacts
- [ ] Filter by status/source
- [ ] View contact detail
- [ ] Create deal from contact
- [ ] Drag deal between stages
- [ ] Add activity to contact
- [ ] Create task with due date
- [ ] Mark task complete
- [ ] View analytics dashboard
- [ ] Quiz submission creates contact

**Automated Testing** (recommended):
- Unit tests for API routes (Jest)
- Integration tests for workflows (Playwright)
- E2E tests for critical paths (Cypress)

---

## Troubleshooting

### Common Issues

**Issue**: Contacts not appearing in list
- **Check**: Authentication token is valid
- **Check**: Database connection is active
- **Check**: Filters are not too restrictive

**Issue**: CSV import fails
- **Check**: File is valid CSV format
- **Check**: Required fields (name, email) are present
- **Check**: Email addresses are unique
- **Check**: Field mapping is correct

**Issue**: Drag-and-drop not working
- **Check**: `@dnd-kit` libraries are installed
- **Check**: JavaScript is enabled
- **Check**: No console errors

**Issue**: Analytics showing zero
- **Check**: Data exists in database
- **Check**: Date filters are correct
- **Check**: User has access to data

### Support

For issues or questions:
1. Check this documentation
2. Review API route code
3. Check Prisma schema
4. Consult Next.js docs
5. Contact development team

---

## Future Enhancements

### Planned Features
- [ ] Email integration (send emails from CRM)
- [ ] Calendar integration (sync meetings)
- [ ] Custom fields builder (UI for custom fields)
- [ ] Advanced segments (dynamic contact groups)
- [ ] Email campaigns to contacts
- [ ] Deal forecasting (AI predictions)
- [ ] Mobile app
- [ ] Webhooks (notify external systems)
- [ ] API rate limiting
- [ ] Audit log (track all changes)

### Integration Opportunities
- **Email**: Resend, SendGrid, Mailgun
- **Calendar**: Google Calendar, Outlook
- **Communication**: Slack, Discord notifications
- **Payments**: Stripe integration for won deals
- **Analytics**: Mixpanel, Amplitude events

---

## License

Part of the dAItaniverse SUPERNova platform.

---

## Changelog

### Version 1.0.0 (2025-01-23)
- Initial CRM release
- Contact management
- Deal pipeline with kanban
- Activity timeline
- Task management
- Analytics dashboard
- CSV import
- Quiz integration

---

**Built with love by the dAItaniverse team**
