# dAItaniverse CRM System

Complete Customer Relationship Management system for the dAItaniverse platform.

## Features

### Contact Management
- **Full Contact Database**: Store and manage contacts with name, email, phone, company, job title, location
- **Status Tracking**: Lead, Prospect, Customer, Inactive
- **Source Tracking**: Quiz, Manual, Import, API
- **Tag System**: Organize contacts with custom tags
- **Custom Fields**: Flexible JSON-based custom data storage
- **Assignment**: Assign contacts to team members
- **Search & Filters**: Advanced search and filtering capabilities

### Sales Pipeline (Deals)
- **Drag-Drop Kanban Board**: Visual pipeline with 6 stages
  - Lead
  - Qualified
  - Proposal
  - Negotiation
  - Won
  - Lost
- **Deal Tracking**: Title, value, currency, probability
- **Timeline**: Track stage changes and history
- **Win/Loss Analysis**: Track won/lost dates and reasons
- **Related Activities**: Link activities and tasks to deals

### Activity Timeline
- **Activity Types**: Note, Email, Call, Meeting, Task
- **Contact/Deal Association**: Link activities to contacts and deals
- **Due Dates**: Set and track activity deadlines
- **Completion Tracking**: Mark activities as completed

### Task Management
- **Priority Levels**: Low, Medium, High, Urgent
- **Status Tracking**: Pending, In Progress, Completed, Cancelled
- **Due Dates**: Set task deadlines with overdue detection
- **Assignment**: Assign tasks to team members
- **Filtering**: Filter by status, priority, assigned user

### CSV Import
- **Drag-Drop Upload**: Easy CSV file upload interface
- **Field Mapping**: Map CSV columns to contact fields
- **Duplicate Detection**: Skip or update existing contacts
- **Preview**: See first 5 rows before import
- **Bulk Import**: Import hundreds of contacts at once

### Analytics Dashboard
- **Contact Metrics**:
  - Total contacts
  - Breakdown by status
  - Breakdown by source
  - Recent additions (30 days)

- **Deal Metrics**:
  - Total deals
  - Pipeline value by stage
  - Conversion rate (won vs lost)
  - Won deals this month
  - Recent deals (30 days)

- **Task Metrics**:
  - Total tasks
  - Breakdown by status
  - Breakdown by priority
  - Overdue tasks count

- **Activity Metrics**:
  - Total activities
  - Breakdown by type

## Database Schema

### Contact Model
```prisma
model Contact {
  id              String        @id @default(cuid())
  name            String
  email           String        @unique
  phone           String?
  company         String?
  jobTitle        String?
  location        String?
  tags            String[]
  customFields    Json?
  source          ContactSource @default(MANUAL)
  status          ContactStatus @default(LEAD)
  assignedToId    String?
  deals           Deal[]
  activities      Activity[]
  tasks           Task[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

### Deal Model
```prisma
model Deal {
  id                String     @id @default(cuid())
  title             String
  value             Float
  currency          String     @default("USD")
  stage             DealStage  @default(LEAD)
  probability       Int        @default(0)
  expectedCloseDate DateTime?
  notes             String?
  customFields      Json?
  assignedToId      String?
  contactId         String
  wonAt             DateTime?
  lostAt            DateTime?
  lostReason        String?
  activities        Activity[]
  tasks             Task[]
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
}
```

### Activity Model
```prisma
model Activity {
  id           String       @id @default(cuid())
  type         ActivityType
  subject      String
  description  String?
  contactId    String?
  dealId       String?
  assignedToId String?
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
  description  String?
  priority     TaskPriority @default(MEDIUM)
  status       TaskStatus   @default(PENDING)
  contactId    String?
  dealId       String?
  assignedToId String?
  dueDate      DateTime?
  completedAt  DateTime?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}
```

## API Endpoints

### Contacts
- `GET /api/crm/contacts` - List contacts with filters
- `POST /api/crm/contacts` - Create new contact
- `GET /api/crm/contacts/[id]` - Get contact details
- `PATCH /api/crm/contacts/[id]` - Update contact
- `DELETE /api/crm/contacts/[id]` - Delete contact
- `POST /api/crm/contacts/import` - Import contacts from CSV

### Deals
- `GET /api/crm/deals` - List deals (grouped by stage)
- `POST /api/crm/deals` - Create new deal
- `GET /api/crm/deals/[id]` - Get deal details
- `PATCH /api/crm/deals/[id]` - Update deal (including stage changes)
- `DELETE /api/crm/deals/[id]` - Delete deal

### Activities
- `GET /api/crm/activities` - List activities
- `POST /api/crm/activities` - Create new activity
- `PATCH /api/crm/activities/[id]` - Update activity
- `DELETE /api/crm/activities/[id]` - Delete activity

### Tasks
- `GET /api/crm/tasks` - List tasks with filters
- `POST /api/crm/tasks` - Create new task
- `PATCH /api/crm/tasks/[id]` - Update task (including mark complete)
- `DELETE /api/crm/tasks/[id]` - Delete task

### Analytics
- `GET /api/crm/analytics` - Get CRM statistics and metrics

## Frontend Pages

### `/crm/contacts`
Contact list with search, filters, and bulk actions. Features:
- Search by name, email, company
- Filter by status and source
- Pagination
- Quick create contact modal
- Click to view contact details

### `/crm/contacts/[id]`
Contact detail page with:
- Contact information card
- Associated deals
- Activity timeline
- Task list
- Quick actions (add note, create task, create deal)

### `/crm/contacts/import`
CSV import wizard with:
- Drag-drop file upload
- Field mapping interface
- Preview before import
- Import results summary
- Duplicate detection

### `/crm/deals`
Kanban board pipeline with:
- Drag-drop between stages
- Deal cards showing value, contact, probability
- Stage summaries with total value
- Click to view deal details

### `/crm/deals/[id]`
Deal detail page with:
- Deal information
- Contact link
- Activity timeline
- Task list
- Stage history

### `/crm/tasks`
Task management with:
- My tasks / All tasks toggle
- Filter by status, priority, due date
- Mark complete checkbox
- Overdue indicators
- Quick add task

### `/crm/analytics`
Analytics dashboard with:
- Key metrics (contacts, deals, pipeline value, conversion rate)
- Contact breakdown by status and source
- Deal pipeline by stage
- Won deals this month
- Tasks overview
- Activities summary

## Technologies Used

- **Next.js 16**: React framework for server-side rendering
- **Prisma**: Database ORM
- **PostgreSQL**: Database
- **@dnd-kit**: Drag-and-drop functionality for Kanban board
- **papaparse**: CSV parsing for import
- **Lucide React**: Icon library
- **TailwindCSS**: Styling

## Design System

The CRM uses the dAItaniverse branding:
- **Colors**:
  - Hot Pink (`#FF008E`)
  - Light Teal (`#00F0E9`)
  - Neon Lime (`#D4FF00`)
  - Charcoal backgrounds
- **Fonts**:
  - Supernova (headings)
  - Josefin Sans (body text)
- **Background**: dAitaniverse Stage.png
- **Effects**: Glass-morphism with backdrop-blur

## Quiz Integration

When someone completes a quiz, a contact is automatically created with:
- `source`: 'QUIZ'
- `tags`: [quiz result tier]
- `customFields`: { quizScore, recommendedPrograms }

This allows you to:
1. Track leads from quizzes
2. Segment contacts by quiz results
3. Follow up with personalized programs

## Usage Examples

### Create a Contact
```typescript
const response = await fetch('/api/crm/contacts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1234567890',
    company: 'Example Corp',
    status: 'LEAD',
    source: 'MANUAL',
    tags: ['hot-lead', 'branding'],
  }),
})
```

### Update Deal Stage
```typescript
const response = await fetch('/api/crm/deals/deal-id', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    stage: 'WON',
  }),
})
```

### Import Contacts from CSV
```typescript
const response = await fetch('/api/crm/contacts/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contacts: [
      { name: 'John Doe', email: 'john@example.com', company: 'ABC Inc' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '555-1234' },
    ],
    skipDuplicates: true,
  }),
})
```

## Future Enhancements

1. **Email Integration**: Connect with email marketing system to track campaigns
2. **Automated Workflows**: Trigger actions based on contact/deal events
3. **Contact Segments**: Dynamic filtering and grouping
4. **Pipeline Customization**: Allow custom deal stages per business
5. **Mobile App**: React Native mobile CRM app
6. **Reports**: Advanced reporting and forecasting
7. **Integrations**: Zapier, webhooks, API for third-party tools
8. **Team Collaboration**: Comments, mentions, notifications
9. **Calendar View**: Timeline view for tasks and activities
10. **Email Tracking**: Track email opens and clicks

## Performance Considerations

- Database indexes on frequently queried fields (email, status, stage, etc.)
- Pagination for large contact lists
- Optimistic UI updates for better UX
- Efficient groupBy queries for analytics
- Relationship loading with Prisma include/select

## Security

- JWT authentication required for all endpoints
- User-based access control
- Input validation on all forms
- SQL injection protection via Prisma
- XSS protection via React
- CSRF protection via Next.js

## Support

For questions or issues with the CRM system, please contact the development team.

---

Built with love for the dAItaniverse community.
