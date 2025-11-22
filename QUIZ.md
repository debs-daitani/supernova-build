# Quiz & Form Builder System Documentation

## Overview

The dAItaniverse Quiz & Form Builder is a comprehensive ScoreApp/Typeform alternative that enables users to create engaging quizzes, assessments, personality tests, surveys, and lead magnets with advanced features like conditional logic, branching, multiple result pages, and detailed analytics.

## Features

### Core Capabilities
- **5 Quiz Types**: Scored, Personality, Assessment, Survey, Lead Magnet
- **7 Question Types**: Multiple Choice, Single Choice, Text, Email, Scale (1-10), Yes/No, Dropdown
- **Conditional Logic**: Create branching paths based on answers and scores
- **Multiple Results**: Define different outcome pages based on score ranges or answer patterns
- **Lead Capture**: Collect names and emails with optional email gates
- **Analytics**: Track views, completions, drop-off rates, popular answers
- **Templates**: Pre-built quiz templates for common use cases
- **Embedding**: Inline and popup embeds for external websites
- **CSV Export**: Download all responses for analysis

### Advanced Features
- Progress bars and question counters
- Shuffle questions for randomization
- Allow/prevent going back
- Custom CSS styling
- SEO meta tags
- Thank you messages and redirects
- Email templates for results
- Dimensional scoring for assessments

## Database Schema

### Quiz Model
```prisma
model Quiz {
  id                String   @id @default(cuid())
  userId            String
  title             String
  slug              String   @unique
  description       String?  @db.Text
  quizType          String   @default("SCORED") // SCORED, PERSONALITY, ASSESSMENT, SURVEY, LEAD_MAGNET

  // Settings
  isPublished       Boolean  @default(false)
  requireEmail      Boolean  @default(false)
  showProgressBar   Boolean  @default(true)
  allowBack         Boolean  @default(true)
  shuffleQuestions  Boolean  @default(false)
  collectLeads      Boolean  @default(false)

  // Customization
  thankYouMessage   String?  @db.Text
  redirectUrl       String?
  metaTitle         String?
  metaDescription   String?  @db.Text
  customCss         String?  @db.Text

  // Analytics
  viewCount         Int      @default(0)
  completionCount   Int      @default(0)

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  publishedAt       DateTime?

  // Relations
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  questions         QuizQuestion[]
  logicRules        QuizLogic[]
  results           QuizResult[]
  responses         QuizResponse[]
  analytics         QuizAnalytics[]

  @@index([userId])
  @@index([slug])
  @@index([isPublished])
}
```

### QuizQuestion Model
```prisma
model QuizQuestion {
  id              String   @id @default(cuid())
  quizId          String
  questionText    String   @db.Text
  questionType    String   @default("SINGLE_CHOICE") // MULTIPLE_CHOICE, SINGLE_CHOICE, TEXT, EMAIL, SCALE, YES_NO, DROPDOWN
  options         Json?    // [{text: string, points: number, category: string}]
  required        Boolean  @default(true)
  description     String?  @db.Text
  imageUrl        String?
  videoUrl        String?
  dimension       String?  // For assessment quizzes (e.g., "Body", "Mind", "Business")
  points          Int?     // Default points for this question
  order           Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  quiz            Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  logicRules      QuizLogic[]

  @@index([quizId])
}
```

### QuizLogic Model
```prisma
model QuizLogic {
  id              String   @id @default(cuid())
  quizId          String
  questionId      String
  conditionType   String   // IF_ANSWER_EQUALS, IF_ANSWER_CONTAINS, IF_SCORE_GREATER_THAN, IF_SCORE_LESS_THAN
  conditionValue  String   // The value to check against
  actionType      String   // SKIP_TO_QUESTION, SHOW_RESULT, SHOW_QUESTION
  actionValue     String   // Question ID or Result ID
  createdAt       DateTime @default(now())

  quiz            Quiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  question        QuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([quizId])
  @@index([questionId])
}
```

### QuizResult Model
```prisma
model QuizResult {
  id              String   @id @default(cuid())
  quizId          String
  title           String
  description     String   @db.Text
  minScore        Int?     // For scored quizzes
  maxScore        Int?     // For scored quizzes
  conditions      Json?    // For complex logic {dimension: "Body", minScore: 70}
  imageUrl        String?
  ctaText         String?  // Call-to-action text
  ctaUrl          String?  // Call-to-action URL
  showScore       Boolean  @default(true)
  emailSubject    String?
  emailBody       String?  @db.Text
  order           Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  quiz            Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  responses       QuizResponse[]

  @@index([quizId])
}
```

### QuizResponse Model
```prisma
model QuizResponse {
  id                String   @id @default(cuid())
  quizId            String
  userId            String?
  answers           Json     // {questionId: answer}
  score             Int?     // Total score for scored quizzes
  dimensionScores   Json?    // {dimension: score} for assessment quizzes
  personalityType   String?  // For personality quizzes (e.g., "A", "B", "C")
  resultId          String?
  respondentName    String?
  respondentEmail   String?
  timeSpent         Int?     // Seconds
  completedAt       DateTime @default(now())
  createdAt         DateTime @default(now())

  quiz              Quiz       @relation(fields: [quizId], references: [id], onDelete: Cascade)
  user              User?      @relation(fields: [userId], references: [id], onDelete: SetNull)
  result            QuizResult? @relation(fields: [resultId], references: [id], onDelete: SetNull)

  @@index([quizId])
  @@index([userId])
}
```

## API Routes

### Quiz Management

#### GET /api/quizzes
List all quizzes for current user
```typescript
// Query params: type, published, search
const response = await fetch('/api/quizzes?type=SCORED&published=true')
```

#### POST /api/quizzes
Create new quiz
```typescript
const response = await fetch('/api/quizzes', {
  method: 'POST',
  body: JSON.stringify({
    title: 'My Quiz',
    description: 'Quiz description',
    quizType: 'SCORED',
    settings: {}
  })
})
```

#### GET /api/quizzes/[id]
Get quiz by ID or slug
```typescript
const quiz = await fetch('/api/quizzes/abc123')
```

#### PATCH /api/quizzes/[id]
Update quiz settings
```typescript
await fetch('/api/quizzes/abc123', {
  method: 'PATCH',
  body: JSON.stringify({
    title: 'Updated Title',
    isPublished: true
  })
})
```

#### DELETE /api/quizzes/[id]
Delete quiz
```typescript
await fetch('/api/quizzes/abc123', { method: 'DELETE' })
```

### Question Management

#### GET /api/quizzes/[id]/questions
List all questions
```typescript
const { questions } = await fetch('/api/quizzes/abc123/questions')
```

#### POST /api/quizzes/[id]/questions
Add question
```typescript
await fetch('/api/quizzes/abc123/questions', {
  method: 'POST',
  body: JSON.stringify({
    questionText: 'What is your name?',
    questionType: 'TEXT',
    required: true
  })
})
```

#### PATCH /api/quizzes/[id]/questions/[questionId]
Update question
```typescript
await fetch('/api/quizzes/abc123/questions/q123', {
  method: 'PATCH',
  body: JSON.stringify({ questionText: 'Updated question' })
})
```

### Results & Responses

#### POST /api/quizzes/[id]/responses
Submit quiz response (public)
```typescript
await fetch('/api/quizzes/abc123/responses', {
  method: 'POST',
  body: JSON.stringify({
    answers: { q1: 'Answer', q2: ['A', 'B'] },
    respondentEmail: 'user@example.com',
    timeSpent: 120
  })
})
```

#### GET /api/quizzes/[id]/responses
Get all responses (owner only)
```typescript
const { responses, total } = await fetch('/api/quizzes/abc123/responses?limit=50')
```

#### GET /api/quizzes/[id]/analytics
Get quiz analytics
```typescript
const analytics = await fetch('/api/quizzes/abc123/analytics')
// Returns: overview, questionStats, dailyStats, completionTrend
```

## Quiz Types

### 1. SCORED
Traditional quiz with points. Questions have point values, final score determines result.

**Use Cases:**
- Knowledge tests
- Skill assessments
- Trivia quizzes

**Configuration:**
```typescript
{
  quizType: 'SCORED',
  questions: [
    {
      questionText: 'What is 2+2?',
      questionType: 'SINGLE_CHOICE',
      options: [
        { text: '3', points: 0 },
        { text: '4', points: 10 },
        { text: '5', points: 0 }
      ]
    }
  ],
  results: [
    { title: 'Beginner', minScore: 0, maxScore: 50 },
    { title: 'Expert', minScore: 51, maxScore: 100 }
  ]
}
```

### 2. PERSONALITY
Determines personality type based on answer categories.

**Use Cases:**
- MBTI-style tests
- Learning style quizzes
- Character assessments

**Configuration:**
```typescript
{
  quizType: 'PERSONALITY',
  questions: [
    {
      questionText: 'How do you recharge?',
      questionType: 'SINGLE_CHOICE',
      options: [
        { text: 'Being with people', category: 'Extrovert' },
        { text: 'Being alone', category: 'Introvert' }
      ]
    }
  ],
  results: [
    { title: 'Extrovert', conditions: { category: 'Extrovert' } },
    { title: 'Introvert', conditions: { category: 'Introvert' } }
  ]
}
```

### 3. ASSESSMENT
Multi-dimensional scoring (e.g., Body, Mind, Business scores).

**Use Cases:**
- 360° assessments
- Multi-factor evaluations
- Health assessments

**Configuration:**
```typescript
{
  quizType: 'ASSESSMENT',
  questions: [
    {
      questionText: 'How often do you exercise?',
      questionType: 'SCALE',
      dimension: 'Body'
    },
    {
      questionText: 'How often do you meditate?',
      questionType: 'SCALE',
      dimension: 'Mind'
    }
  ]
}
```

### 4. SURVEY
Simple data collection with no scoring.

**Use Cases:**
- Customer feedback
- Market research
- Event registration

### 5. LEAD_MAGNET
Optimized for lead generation with email capture.

**Use Cases:**
- Newsletter signups
- Gated content
- Free consultations

## Question Types

### SINGLE_CHOICE
Radio buttons - select one option
```typescript
{
  questionType: 'SINGLE_CHOICE',
  options: [
    { text: 'Option A', points: 10 },
    { text: 'Option B', points: 5 }
  ]
}
```

### MULTIPLE_CHOICE
Checkboxes - select multiple options
```typescript
{
  questionType: 'MULTIPLE_CHOICE',
  options: [
    { text: 'Option A', points: 5 },
    { text: 'Option B', points: 5 }
  ]
}
```

### TEXT
Open-ended text input

### EMAIL
Email input with validation

### SCALE
1-10 slider

### YES_NO
Binary choice

### DROPDOWN
Select dropdown menu

## Conditional Logic

### Logic Conditions
- `IF_ANSWER_EQUALS`: Exact match
- `IF_ANSWER_CONTAINS`: Partial match
- `IF_SCORE_GREATER_THAN`: Score threshold
- `IF_SCORE_LESS_THAN`: Score threshold

### Logic Actions
- `SKIP_TO_QUESTION`: Jump to specific question
- `SHOW_RESULT`: End quiz and show result
- `SHOW_QUESTION`: Show specific question

### Example
```typescript
{
  questionId: 'q1',
  conditionType: 'IF_ANSWER_EQUALS',
  conditionValue: 'Yes',
  actionType: 'SKIP_TO_QUESTION',
  actionValue: 'q5'
}
```

## Analytics

### Metrics Tracked
- **Views**: How many times quiz was viewed
- **Starts**: How many people started quiz
- **Completions**: How many finished quiz
- **Completion Rate**: (Completions / Starts) * 100
- **Drop-off Rate**: (Starts - Completions) / Starts * 100
- **Average Score**: Mean score across all responses
- **Average Time**: Mean time to complete
- **Question Performance**: Popular answers per question
- **Daily Trends**: Views, starts, completions by date

## Embedding

### Inline Embed
```html
<iframe
  src="https://yourdomain.com/quiz/quiz-slug"
  width="100%"
  height="600px"
  frameborder="0"
  style="border: none;">
</iframe>
```

### Popup Embed
```html
<script>
  function openQuiz() {
    window.open('https://yourdomain.com/quiz/quiz-slug', 'quiz', 'width=800,height=600,scrollbars=yes');
  }
</script>
<button onclick="openQuiz()">Take Quiz</button>
```

## CSV Export

Responses can be exported to CSV with the following columns:
- Name
- Email
- Score
- Result
- Completed At
- Time Spent
- Answer for each question

## Best Practices

### Quiz Design
1. **Keep it short**: 5-10 questions for best completion rates
2. **Clear questions**: Be specific and avoid ambiguity
3. **Relevant options**: Ensure all answer choices make sense
4. **Progress indication**: Show progress bar for longer quizzes
5. **Mobile-friendly**: Test on mobile devices

### Lead Generation
1. **Email gates**: Place at end, not beginning
2. **Value proposition**: Explain what they'll get
3. **Privacy assurance**: Mention no spam policy
4. **Follow-up**: Send results via email

### Analytics
1. **Track drop-off**: Identify where people quit
2. **Popular answers**: Understand your audience
3. **A/B test**: Try different question orders
4. **Iterate**: Improve based on data

## Templates

### Pre-built Templates
1. **Business Assessment** (ASSESSMENT)
2. **Personality Quiz** (PERSONALITY)
3. **Lead Magnet** (LEAD_MAGNET)
4. **Customer Feedback** (SURVEY)
5. **Event Registration** (SURVEY)

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Future Enhancements

- Email delivery integration
- Zapier/webhook integrations
- Advanced branching (AND/OR logic)
- Quiz themes and color schemes
- Quiz duplication
- Team collaboration
- Advanced permissions
- Translation/multi-language support
- Timer functionality
- Randomize answer options
- Image upload for questions
- Video embeds
- Social sharing buttons
- Certificate generation

## Support

For issues or questions:
- Check database schema in `prisma/schema.prisma`
- Review API routes in `src/app/api/quizzes/`
- Check utilities in `src/lib/quiz-utils.ts`
- Review config in `src/lib/quiz-config.ts`
