// Quiz & Form Builder Configuration

// Quiz Types
export const QUIZ_TYPES = {
  SCORED: 'SCORED',
  PERSONALITY: 'PERSONALITY',
  ASSESSMENT: 'ASSESSMENT',
  SURVEY: 'SURVEY',
  LEAD_MAGNET: 'LEAD_MAGNET',
} as const

export const QUIZ_TYPE_NAMES = {
  SCORED: 'Scored Quiz',
  PERSONALITY: 'Personality Quiz',
  ASSESSMENT: 'Assessment',
  SURVEY: 'Survey',
  LEAD_MAGNET: 'Lead Magnet',
}

export const QUIZ_TYPE_DESCRIPTIONS = {
  SCORED: 'Questions with correct answers and points. Show results based on total score.',
  PERSONALITY: 'Discover personality types based on answer patterns (A, B, C, D).',
  ASSESSMENT: 'Multi-dimensional scoring across categories (e.g., Body, Brain, Business).',
  SURVEY: 'Collect feedback and opinions without scoring.',
  LEAD_MAGNET: 'Capture leads and deliver results via email.',
}

// Question Types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  TEXT: 'TEXT',
  EMAIL: 'EMAIL',
  SCALE: 'SCALE',
  YES_NO: 'YES_NO',
  DROPDOWN: 'DROPDOWN',
} as const

export const QUESTION_TYPE_NAMES = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  SINGLE_CHOICE: 'Single Choice',
  TEXT: 'Text Input',
  EMAIL: 'Email',
  SCALE: 'Scale (1-10)',
  YES_NO: 'Yes/No',
  DROPDOWN: 'Dropdown',
}

export const QUESTION_TYPE_ICONS = {
  MULTIPLE_CHOICE: 'check-square',
  SINGLE_CHOICE: 'circle-dot',
  TEXT: 'text',
  EMAIL: 'at-sign',
  SCALE: 'sliders',
  YES_NO: 'toggle-left',
  DROPDOWN: 'chevron-down',
}

// Logic Condition Types
export const CONDITION_TYPES = {
  IF_ANSWER_EQUALS: 'IF_ANSWER_EQUALS',
  IF_ANSWER_CONTAINS: 'IF_ANSWER_CONTAINS',
  IF_SCORE_GREATER_THAN: 'IF_SCORE_GREATER_THAN',
  IF_SCORE_LESS_THAN: 'IF_SCORE_LESS_THAN',
  IF_DIMENSION_GREATER_THAN: 'IF_DIMENSION_GREATER_THAN',
} as const

export const CONDITION_TYPE_NAMES = {
  IF_ANSWER_EQUALS: 'If answer equals',
  IF_ANSWER_CONTAINS: 'If answer contains',
  IF_SCORE_GREATER_THAN: 'If score greater than',
  IF_SCORE_LESS_THAN: 'If score less than',
  IF_DIMENSION_GREATER_THAN: 'If dimension score greater than',
}

// Logic Action Types
export const ACTION_TYPES = {
  SHOW_QUESTION: 'SHOW_QUESTION',
  SKIP_TO_QUESTION: 'SKIP_TO_QUESTION',
  SHOW_RESULT: 'SHOW_RESULT',
  HIDE_QUESTION: 'HIDE_QUESTION',
} as const

export const ACTION_TYPE_NAMES = {
  SHOW_QUESTION: 'Show question',
  SKIP_TO_QUESTION: 'Skip to question',
  SHOW_RESULT: 'Show result',
  HIDE_QUESTION: 'Hide question',
}

// Template Categories
export const TEMPLATE_CATEGORIES = {
  ASSESSMENT: 'ASSESSMENT',
  PERSONALITY: 'PERSONALITY',
  LEAD_MAGNET: 'LEAD_MAGNET',
  SURVEY: 'SURVEY',
  FEEDBACK: 'FEEDBACK',
} as const

export const TEMPLATE_CATEGORY_NAMES = {
  ASSESSMENT: 'Business Assessment',
  PERSONALITY: 'Personality Quiz',
  LEAD_MAGNET: 'Lead Magnet',
  SURVEY: 'Survey',
  FEEDBACK: 'Customer Feedback',
}

// Default Quiz Settings
export const DEFAULT_QUIZ_SETTINGS = {
  requireEmail: false,
  showProgressBar: true,
  allowRetake: true,
  shuffleQuestions: false,
  primaryColor: '#8B5CF6',
  fontFamily: 'Inter',
}

// Scale Settings
export const SCALE_SETTINGS = {
  MIN: 1,
  MAX: 10,
  DEFAULT: 5,
}

// Personality Categories (for personality quizzes)
export const PERSONALITY_CATEGORIES = ['A', 'B', 'C', 'D', 'E', 'F']

// Scoring Settings
export const SCORING_SETTINGS = {
  DEFAULT_POINTS: 10,
  MIN_POINTS: 0,
  MAX_POINTS: 100,
}

// Analytics Settings
export const ANALYTICS_SETTINGS = {
  RETENTION_DAYS: 90, // Keep analytics for 90 days
  AGGREGATE_INTERVAL: 'daily', // Aggregate analytics daily
}

// Validation Rules
export const VALIDATION = {
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 100,
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 10,
  MIN_RESULTS: 1,
  MAX_RESULTS: 20,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_QUESTION_LENGTH: 500,
  MAX_OPTION_LENGTH: 200,
}

// Email Settings
export const EMAIL_SETTINGS = {
  DEFAULT_SUBJECT: 'Your quiz results are ready!',
  DEFAULT_TEMPLATE: `
Hi {{name}},

Thank you for completing "{{quizTitle}}"!

{{#if score}}
Your score: {{score}}/{{totalScore}} ({{percentage}}%)
{{/if}}

{{resultDescription}}

{{#if ctaUrl}}
{{ctaText}}: {{ctaUrl}}
{{/if}}

Best regards,
The Team
  `.trim(),
}

// Embed Settings
export const EMBED_SETTINGS = {
  TYPES: {
    INLINE: 'INLINE',
    POPUP: 'POPUP',
    SLIDE_IN: 'SLIDE_IN',
  },
  DEFAULT_WIDTH: '100%',
  DEFAULT_HEIGHT: '600px',
}

// Response Export Settings
export const EXPORT_SETTINGS = {
  FORMATS: ['CSV', 'JSON', 'XLSX'],
  MAX_RESPONSES_PER_EXPORT: 10000,
}

// Completion Messages
export const DEFAULT_MESSAGES = {
  WELCOME: 'Welcome! Ready to get started?',
  COMPLETION: 'Thank you for completing this quiz!',
  EMAIL_REQUIRED: 'Please enter your email to see your results.',
  ERROR: 'Oops! Something went wrong. Please try again.',
}

// Quiz Status
export const QUIZ_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const

// Response Status
export const RESPONSE_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
} as const

// Analytics Metrics
export const ANALYTICS_METRICS = {
  COMPLETION_RATE: 'completionRate',
  AVG_SCORE: 'avgScore',
  AVG_TIME_SPENT: 'avgTimeSpent',
  DROP_OFF_RATE: 'dropOffRate',
  CONVERSION_RATE: 'conversionRate',
}

// Chart Colors
export const CHART_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#F97316', // Amber
]

// Dimension Names (for assessment quizzes)
export const DEFAULT_DIMENSIONS = [
  'Body',
  'Brain',
  'Business',
  'Relationships',
  'Spirit',
  'Finance',
]

// Question Placeholder Text
export const QUESTION_PLACEHOLDERS = {
  MULTIPLE_CHOICE: 'What would you like to ask?',
  SINGLE_CHOICE: 'What would you like to ask?',
  TEXT: 'Enter your question...',
  EMAIL: 'What is your email address?',
  SCALE: 'How would you rate...',
  YES_NO: 'Yes or no question?',
  DROPDOWN: 'Please select an option...',
}

// Result Placeholder Text
export const RESULT_PLACEHOLDERS = {
  TITLE: 'Result Title',
  DESCRIPTION: 'Describe this result and what it means...',
  CTA_TEXT: 'Learn More',
  CTA_URL: 'https://example.com',
}

// Time Limits (in seconds)
export const TIME_LIMITS = {
  NO_LIMIT: 0,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
  FIFTEEN_MINUTES: 900,
  THIRTY_MINUTES: 1800,
}

// Progress Calculation
export const PROGRESS_SETTINGS = {
  SHOW_PERCENTAGE: true,
  SHOW_QUESTION_COUNT: true,
  ANIMATE: true,
}

// Social Sharing
export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
}

// Embed Code Templates
export const EMBED_CODE_TEMPLATE = {
  INLINE: `<iframe
  src="{{quizUrl}}"
  width="{{width}}"
  height="{{height}}"
  frameborder="0"
  style="border: none;">
</iframe>`,
  POPUP: `<script>
  window.openQuizPopup = function() {
    window.open('{{quizUrl}}', 'quiz', 'width=800,height=600');
  }
</script>
<button onclick="openQuizPopup()">Take Quiz</button>`,
}
