# VENUED SSO Integration with SUPERNova

Complete Single Sign-On (SSO) and data integration between **SUPERNova** (main AI coaching app) and **VENUED** (ADHD-friendly project management).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────────┐
         │      SUPERNova Dashboard             │
         │  (supernova/app/dashboard/page.tsx)  │
         │                                      │
         │  [NEW CHAT]  [LAUNCH VENUED] ───────┼──┐
         └──────────────────────────────────────┘  │
                                                    │
                                                    ▼
         ┌──────────────────────────────────────────────┐
         │  POST /api/auth/generate-sso                 │
         │  - Verifies user session                     │
         │  - Generates JWT token (5min expiry)         │
         │  - Returns: { token, launchUrl }             │
         └──────────────────────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────────────────┐
         │  VENUED App Opens                            │
         │  URL: http://localhost:3000?sso_token=xxx    │
         └──────────────────────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────────────────┐
         │  VENUED SSO Handler                          │
         │  1. Extract token from URL                   │
         │  2. POST /api/auth/verify-sso                │
         │  3. Get user data                            │
         │  4. Store session in VENUED                  │
         │  5. Fetch projects/tasks from API            │
         └──────────────────────────────────────────────┘
                              │
                              ▼
         ┌──────────────────────────────────────────────┐
         │  VENUED Fully Authenticated                  │
         │  - API calls use SUPERNova auth cookies      │
         │  - Data synced to PostgreSQL                 │
         │  - No localStorage (except for cache)        │
         └──────────────────────────────────────────────┘
```

## Database Schema

### New Models (Added to `prisma/schema.prisma`)

```prisma
model VenuedProject {
  id              String                @id @default(cuid())
  userId          String
  user            User                  @relation(fields: [userId], references: [id], onDelete: Cascade)

  title           String
  description     String?               @db.Text
  emoji           String?               @default("🎸")
  status          VenuedProjectStatus   @default(BACKSTAGE)
  color           String                @default("#FF008E")
  archived        Boolean               @default(false)

  phases          VenuedPhase[]
  tasks           VenuedTask[]
  goals           VenuedGoal[]
  entourageLogs   VenuedEntourageLog[]

  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt
}

model VenuedTask {
  id              String              @id @default(cuid())
  userId          String
  projectId       String
  phaseId         String?

  title           String
  description     String?             @db.Text
  status          VenuedTaskStatus    @default(TODO)
  priority        VenuedTaskPriority  @default(MEDIUM)
  dueDate         DateTime?
  completedAt     DateTime?
  points          Int                 @default(10)
  tags            String[]

  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}

model VenuedStats {
  id              String          @id @default(cuid())
  userId          String          @unique

  totalPoints     Int             @default(0)
  level           Int             @default(1)
  tasksCompleted  Int             @default(0)
  currentStreak   Int             @default(0)
  longestStreak   Int             @default(0)
  achievements    Json?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  lastTaskDate    DateTime?
}
```

See full schema in `prisma/schema.prisma` (lines 1529+).

## API Endpoints

### Authentication

#### `POST /api/auth/generate-sso`
Generate SSO token for VENUED launch.

**Request:**
```typescript
// No body required - uses session cookie
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "launchUrl": "http://localhost:3000?sso_token=..."
}
```

#### `POST /api/auth/verify-sso`
Verify SSO token and return user data.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Projects

#### `GET /api/venued/projects`
Get all projects for authenticated user.

**Query Params:**
- `includeArchived` (boolean): Include archived projects

**Response:**
```json
{
  "projects": [
    {
      "id": "proj_123",
      "title": "Launch dAItaniverse",
      "emoji": "🚀",
      "status": "SETLIST",
      "color": "#FF008E",
      "phases": [...],
      "tasks": [...],
      "_count": { "tasks": 15, "phases": 3 }
    }
  ]
}
```

#### `POST /api/venued/projects`
Create new project.

**Request:**
```json
{
  "title": "New Album Launch",
  "description": "Planning the next big release",
  "emoji": "🎸",
  "color": "#00F0E9",
  "status": "BACKSTAGE"
}
```

#### `GET /api/venued/projects/:id`
Get specific project with all details.

#### `PATCH /api/venued/projects/:id`
Update project.

**Request:**
```json
{
  "title": "Updated Title",
  "status": "CREW",
  "archived": false
}
```

#### `DELETE /api/venued/projects/:id`
Delete project (and all related data).

### Tasks

#### `GET /api/venued/tasks`
Get tasks for authenticated user.

**Query Params:**
- `projectId` (string): Filter by project
- `phaseId` (string): Filter by phase
- `status` (string): Filter by status (TODO, IN_PROGRESS, COMPLETED)

**Response:**
```json
{
  "tasks": [
    {
      "id": "task_123",
      "title": "Write first track",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "points": 20,
      "project": { "title": "Album Launch", "emoji": "🎸" },
      "phase": { "name": "Writing", "color": "#00F0E9" }
    }
  ]
}
```

#### `POST /api/venued/tasks`
Create new task.

**Request:**
```json
{
  "projectId": "proj_123",
  "phaseId": "phase_456",
  "title": "Record vocals",
  "description": "Lay down lead vocals for Track 3",
  "priority": "HIGH",
  "dueDate": "2025-12-01T00:00:00Z",
  "points": 25,
  "tags": ["recording", "vocals"]
}
```

#### `PATCH /api/venued/tasks/:id`
Update task (automatically awards points on completion).

**Request:**
```json
{
  "status": "COMPLETED"
}
```

**Response:**
```json
{
  "task": { ... },
  "stats": {
    "pointsAwarded": 25,
    "totalPoints": 150,
    "currentStreak": 3
  }
}
```

#### `DELETE /api/venued/tasks/:id`
Delete task.

### Phases

#### `GET /api/venued/phases?projectId=xxx`
Get phases for a project.

#### `POST /api/venued/phases`
Create new phase.

**Request:**
```json
{
  "projectId": "proj_123",
  "name": "Recording",
  "color": "#FF008E",
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-12-15T00:00:00Z"
}
```

### Stats & Gamification

#### `GET /api/venued/stats`
Get user stats and achievements.

**Response:**
```json
{
  "stats": {
    "totalPoints": 450,
    "level": 5,
    "tasksCompleted": 45,
    "currentStreak": 7,
    "longestStreak": 12,
    "lastTaskDate": "2025-11-23T10:30:00Z"
  },
  "achievements": [
    {
      "type": "STREAK",
      "name": "Week Warrior",
      "description": "7-day task completion streak",
      "icon": "🔥",
      "earnedAt": "2025-11-23T10:30:00Z"
    }
  ]
}
```

## SSO Security

### Token Characteristics
- **Algorithm:** JWT (HS256)
- **Expiry:** 5 minutes
- **Issuer:** `supernova-ai`
- **Audience:** `venued`
- **Secret:** `VENUED_SSO_SECRET` or `JWT_SECRET` from `.env`

### Token Payload
```typescript
{
  userId: string
  email: string
  name?: string | null
  iat: number  // Issued at
  exp: number  // Expiry
}
```

### Security Best Practices
1. Tokens are single-use (client should discard after verification)
2. Short expiry window (5 minutes)
3. Tokens include issuer and audience claims
4. All API routes verify authentication via cookies
5. No sensitive data in localStorage (API only)

## Migration Guide

### From localStorage to PostgreSQL

If you have existing VENUED data in localStorage:

1. **Export Data (in browser console):**
```javascript
const data = JSON.stringify(localStorage)
console.log(data)
// Copy output to venued-export.json
```

2. **Get Your User ID:**
```bash
# In SUPERNova dashboard, check browser DevTools > Application > Cookies > auth-token
# Decode the JWT to get userId
```

3. **Run Migration:**
```bash
cd supernova
npx ts-node scripts/migrate-venued-data.ts user_xxxxx venued-export.json
```

4. **Verify:**
```sql
SELECT COUNT(*) FROM "VenuedProject" WHERE "userId" = 'user_xxxxx';
SELECT COUNT(*) FROM "VenuedTask" WHERE "userId" = 'user_xxxxx';
```

## Environment Variables

Add to `supernova/.env`:

```bash
# SSO Configuration
VENUED_SSO_SECRET=your-sso-secret-key-min-32-chars
VENUED_URL=http://localhost:3000

# Database (if not already set)
DATABASE_URL=postgresql://user:password@localhost:5432/daitaniverse
```

## Development Setup

### 1. Install Dependencies
```bash
cd supernova
npm install
```

### 2. Push Database Schema
```bash
npx prisma db push
npx prisma generate
```

### 3. Start SUPERNova
```bash
npm run dev
# Runs on http://localhost:3001
```

### 4. Start VENUED
```bash
cd ../venued
npm run dev
# Runs on http://localhost:3000
```

### 5. Test SSO Flow
1. Login to SUPERNova at `http://localhost:3001`
2. Click "LAUNCH VENUED" button
3. New tab opens: `http://localhost:3000?sso_token=xxx`
4. VENUED automatically authenticates and loads data

## File Structure

```
supernova/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── generate-sso/route.ts     # Generate SSO token
│   │   │   └── verify-sso/route.ts       # Verify SSO token
│   │   └── venued/
│   │       ├── projects/
│   │       │   ├── route.ts              # GET, POST projects
│   │       │   └── [id]/route.ts         # GET, PATCH, DELETE project
│   │       ├── tasks/
│   │       │   ├── route.ts              # GET, POST tasks
│   │       │   └── [id]/route.ts         # PATCH, DELETE task
│   │       ├── phases/route.ts           # Phase management
│   │       ├── goals/route.ts            # Goals management
│   │       ├── stats/route.ts            # User stats
│   │       └── entourage/route.ts        # ADHD tools
│   └── dashboard/page.tsx                # "Launch VENUED" button
├── lib/
│   ├── auth-middleware.ts                # Auth verification
│   ├── venued-sso.ts                     # SSO token generation/verification
│   └── prisma.ts                         # Database client
├── prisma/
│   └── schema.prisma                     # Database schema (VENUED models)
└── scripts/
    └── migrate-venued-data.ts            # localStorage migration

venued/
├── app/
│   ├── page.tsx                          # SSO handler on mount
│   └── api/                              # (Optional) Client-side helpers
└── lib/
    └── venued-api.ts                     # API client (fetch wrappers)
```

## Testing Checklist

- [ ] User can login to SUPERNova
- [ ] "Launch VENUED" button appears in dashboard
- [ ] Clicking button generates SSO token
- [ ] VENUED opens in new tab with token
- [ ] VENUED verifies token and loads user data
- [ ] User can create project in VENUED
- [ ] Project appears in database
- [ ] User can create task in project
- [ ] Completing task awards points
- [ ] Stats update correctly (points, level, streak)
- [ ] User can switch between apps seamlessly
- [ ] Logging out of SUPERNova logs out of VENUED
- [ ] Data persists across sessions
- [ ] localStorage migration works

## Troubleshooting

### SSO Token Invalid
- **Cause:** Token expired (>5 min) or wrong secret
- **Fix:** Regenerate token, verify `VENUED_SSO_SECRET` matches in both apps

### CORS Errors
- **Cause:** VENUED running on different origin
- **Fix:** Ensure both apps allow cross-origin requests (if on different domains)

### User Not Found
- **Cause:** User ID in token doesn't exist in database
- **Fix:** Verify user exists: `SELECT * FROM "User" WHERE id = 'xxx';`

### Tasks Not Saving
- **Cause:** Project ID invalid or doesn't belong to user
- **Fix:** Check project ownership in database

### Stats Not Updating
- **Cause:** Task completion logic not triggering
- **Fix:** Ensure `status: 'COMPLETED'` is sent in PATCH request

## Future Enhancements

- [ ] Real-time sync (WebSockets/Supabase Realtime)
- [ ] Offline mode with sync queue
- [ ] Push notifications for task reminders
- [ ] Team collaboration (share projects)
- [ ] Mobile app (React Native with same API)
- [ ] Voice commands via SUPERNova AI
- [ ] Smart task suggestions from AI
- [ ] Integration with calendar apps

## Support

For issues or questions:
- GitHub Issues: [supernova-build/issues](https://github.com/your-repo/issues)
- Documentation: This file
- Contact: support@daitaniverse.com

---

Built with love by **dAItaniverse** | Powered by Claude Sonnet 4.5
