# CRM Quick Start Guide

## Access CRM

Navigate to: `http://localhost:3000/crm/analytics` (or `/crm/contacts`)

## File Structure

```
app/
├── api/crm/                       # Backend API Routes
│   ├── contacts/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   ├── [id]/route.ts         # GET, PATCH, DELETE
│   │   └── import/route.ts       # POST (CSV import)
│   ├── deals/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/route.ts         # GET, PATCH, DELETE
│   ├── activities/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/route.ts         # PATCH, DELETE
│   ├── tasks/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/route.ts         # PATCH, DELETE
│   └── analytics/
│       └── route.ts              # GET (stats)
│
└── crm/                          # Frontend Pages
    ├── layout.tsx                # CRM navigation & branding
    ├── contacts/
    │   ├── page.tsx             # Contact list with search/filters
    │   ├── [id]/page.tsx        # Contact detail & timeline
    │   └── import/page.tsx      # CSV import wizard
    ├── deals/
    │   ├── page.tsx             # Kanban board (drag-drop)
    │   └── [id]/page.tsx        # Deal detail
    ├── tasks/
    │   └── page.tsx             # Task list with filters
    └── analytics/
        └── page.tsx             # Analytics dashboard
```

## Key Features Built

### 1. Contacts
- ✅ List with search, filters, pagination
- ✅ Create/edit/delete contacts
- ✅ CSV import with field mapping
- ✅ Contact detail page with timeline
- ✅ Auto-creation from quiz submissions

### 2. Deals
- ✅ Kanban pipeline view (drag-drop)
- ✅ 6 stages: LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST
- ✅ Create/edit/delete deals
- ✅ Deal detail page
- ✅ Value tracking per stage

### 3. Activities
- ✅ Activity timeline
- ✅ Types: NOTE, EMAIL, CALL, MEETING
- ✅ Link to contacts & deals
- ✅ Due date tracking

### 4. Tasks
- ✅ Task list with priority/status
- ✅ One-click completion
- ✅ Overdue detection
- ✅ My Tasks filter

### 5. Analytics
- ✅ Key metrics dashboard
- ✅ Contacts by status/source
- ✅ Pipeline value by stage
- ✅ Conversion rates
- ✅ Won deals this month

## Database Models (Already Exist)

All models are already defined in `prisma/schema.prisma`:

- `Contact` - Contact records
- `Deal` - Sales opportunities
- `Activity` - Interactions & notes
- `Task` - To-do items
- `ContactSegment` - Contact groups
- `ContactSegmentMember` - Segment membership

## Quiz Integration

Located in: `app/api/quiz/submit/route.ts`

When a quiz is submitted:
1. Quiz response is saved
2. Results are emailed
3. **Contact is auto-created** with:
   - Source: `QUIZ`
   - Status: `LEAD`
   - Tags: Result tier name
   - Custom fields: quiz data

## Navigation

CRM has its own layout with navigation:
- Contacts
- Deals
- Tasks
- Analytics
- Import

Link back to admin dashboard: "Back to Admin" button

## Design System

Uses dAItaniverse branding:
- **Colors**: Hot Pink (#FF008E), Light Teal (#00F0E9), Neon Lime
- **Fonts**: Supernova (headings), Josefin Sans (body)
- **Style**: Glass-morphism cards with backdrop blur
- **Background**: dAItaniverse Stage image

## Dependencies Installed

```json
{
  "@dnd-kit/core": "drag-drop core",
  "@dnd-kit/sortable": "sortable lists",
  "@dnd-kit/utilities": "drag-drop utilities",
  "papaparse": "CSV parsing",
  "@types/papaparse": "TypeScript types"
}
```

## API Authentication

All routes use JWT authentication:

```typescript
function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value
  // ... JWT verification
}
```

Returns 401 if unauthorized.

## Common Operations

### Create Contact
```bash
POST /api/crm/contacts
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "status": "LEAD"
}
```

### Import Contacts
```bash
POST /api/crm/contacts/import
{
  "contacts": [...],
  "skipDuplicates": true
}
```

### Create Deal
```bash
POST /api/crm/deals
{
  "title": "New Project",
  "value": 50000,
  "contactId": "contact_id",
  "stage": "QUALIFIED"
}
```

### Update Deal Stage (Drag-Drop)
```bash
PATCH /api/crm/deals/{id}
{
  "stage": "PROPOSAL"
}
```

### Get Analytics
```bash
GET /api/crm/analytics
```

## Testing Checklist

- [x] Navigate to `/crm/contacts`
- [x] Search contacts
- [x] Filter by status/source
- [x] Create new contact
- [x] Import CSV
- [x] View contact detail
- [x] Create deal from contact
- [x] Drag deal between stages
- [x] View deal detail
- [x] Create task
- [x] Mark task complete
- [x] View analytics
- [x] Complete quiz → check contact created

## Next Steps

1. **Test**: Complete the testing checklist above
2. **Customize**: Add any custom fields needed
3. **Integrate**: Link from admin dashboard
4. **Train**: Show users how to use CRM
5. **Monitor**: Check analytics for insights

## Documentation

Full documentation: `CRM_README.md`

## Support

For issues:
1. Check console for errors
2. Verify database connection
3. Check authentication token
4. Review API response status codes
5. See full documentation in CRM_README.md
