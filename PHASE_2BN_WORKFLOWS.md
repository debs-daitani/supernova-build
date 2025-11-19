# Phase 2BN: Automation/Workflow Builder (Zapier Killer)

## 🎯 Overview

A powerful visual workflow automation system that connects all platform features together. Build IF-THIS-THEN-THAT workflows with a drag-and-drop interface to automate repetitive tasks across your entire platform.

**Built:** January 2025
**Status:** ✅ Complete - MVP Ready

---

## 🏗️ Architecture

### Database Schema (`schema/workflows.prisma`)

**8 Core Models:**

1. **Workflow** - Workflow definition with nodes and edges
2. **WorkflowExecution** - History of workflow runs
3. **WorkflowTemplate** - Pre-built workflow templates
4. **ScheduledWorkflow** - Scheduled workflow runs (cron-like)
5. **WorkflowQueue** - Queue for async execution
6. **WorkflowWebhook** - Webhook triggers for workflows

### Backend Services

#### Workflow Execution Engine (`server/src/services/workflowEngine.js`)

**Core Functions:**
- `executeWorkflow()` - Execute a complete workflow
- `executeNodes()` - Process workflow nodes in order
- `executeNode()` - Execute a single node (trigger, action, condition, delay)
- `evaluateCondition()` - Evaluate conditional logic
- `testWorkflow()` - Test workflow with sample data
- `queueWorkflow()` - Add workflow to execution queue
- `processQueue()` - Process queued workflows
- `replaceVariables()` - Replace `{{user.name}}` variables with data

**Features:**
- Support for 4 node types: Trigger, Action, Condition, Delay
- Graph-based workflow execution (follows edges)
- Conditional branching (if/then/else)
- Data flow between nodes
- Error handling with continue-on-error option
- Variable replacement (`{{field.name}}`)

#### Workflow Actions (`server/src/services/workflowActions.js`)

**Communication Actions:**
- `send_email` - Send email with template variables
- `send_sms` - Send SMS message
- `send_notification` - Send in-app notification

**CRM Actions:**
- `create_contact` - Create new contact
- `update_contact` - Update contact info
- `add_tag` - Add tag to user
- `remove_tag` - Remove tag from user
- `add_to_list` - Add user to email list

**Course Actions:**
- `grant_course_access` - Enroll user in course
- `revoke_course_access` - Remove course access
- `award_certificate` - Generate and send certificate

**Ecommerce Actions:**
- `create_order` - Create new order
- `update_order_status` - Update order status
- `generate_coupon` - Create discount code

**Data Actions:**
- `update_user_field` - Update any user field
- `make_http_request` - Call external API
- `run_query` - Execute database query

**System Actions:**
- `log_message` - Log message for debugging

#### Workflow Triggers (`server/src/services/workflowTriggers.js`)

**Event-Based Triggers:**
- `user_signup` - When user creates account
- `purchase_complete` - When order is completed
- `email_opened` - When email is opened
- `form_submitted` - When form is submitted
- `course_completed` - When user finishes course
- `course_enrolled` - When user enrolls in course
- `ticket_created` - When support ticket is created
- `page_viewed` - When specific page is viewed
- `product_added_to_cart` - When item added to cart
- `blog_post_published` - When blog post goes live

**Schedule-Based Triggers:**
- Hourly, Daily, Weekly, Monthly schedules
- Cron expressions for advanced scheduling
- One-time scheduled executions

**Webhook Triggers:**
- External systems can trigger workflows
- Secret-based authentication
- Custom webhook URLs per workflow

### API Routes (`server/src/routes/workflows.js`)

**Workflow CRUD:**
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow
- `PATCH /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

**Workflow Control:**
- `POST /api/workflows/:id/activate` - Turn on workflow
- `POST /api/workflows/:id/deactivate` - Turn off workflow
- `POST /api/workflows/:id/test` - Test with sample data
- `POST /api/workflows/:id/execute` - Manual execution

**Execution History:**
- `GET /api/workflows/:id/executions` - List executions
- `GET /api/workflows/executions/:executionId` - Execution details

**Templates:**
- `GET /api/workflow-templates` - Browse templates
- `GET /api/workflow-templates/:id` - Template details
- `POST /api/workflow-templates/:id/install` - Install template

**Webhooks:**
- `POST /api/workflows/:id/webhook` - Create webhook
- `POST /api/webhooks/:webhookId` - Trigger via webhook

---

## 🎨 Frontend Components

### Visual Workflow Builder (`client/src/pages/Workflows/WorkflowBuilder.jsx`)

**Features:**
- Drag-and-drop node placement
- 4 node types with color coding:
  - 🟢 Trigger (green) - What starts the workflow
  - 🔵 Action (blue) - What happens
  - 🟡 Condition (yellow) - If/then logic
  - 🟠 Delay (orange) - Wait periods
- Click to edit node configuration
- Connect nodes to create flow
- Real-time saving
- Test workflow button
- Activate/deactivate toggle
- Node editor sidebar

**Node Editors:**
- **Trigger Editor** - Select trigger type (signup, purchase, etc.)
- **Action Editor** - Configure action (email, tag, access, etc.)
- **Condition Editor** - Set field, operator, value for logic
- **Delay Editor** - Set wait duration (seconds, minutes, hours, days)

**Variable Support:**
- Use `{{user.name}}`, `{{user.email}}`, etc. in actions
- Variables automatically replaced with real data
- Nested field access (`{{order.total}}`)

### Workflows List (`client/src/pages/Workflows/WorkflowsList.jsx`)

**Features:**
- Grid view of all workflows
- Active/Inactive filter tabs
- Workflow cards show:
  - Name and description
  - Node count
  - Execution count
  - Success rate
  - Last run time
  - Active/Inactive status
- Quick actions: Edit, Activate/Deactivate, View History, Delete
- Create new workflow button
- Browse templates button

### Execution History (`client/src/pages/Workflows/ExecutionHistory.jsx`)

**Features:**
- List of all workflow runs
- Execution status (Success, Failed, Running, etc.)
- Execution duration
- Click to view details
- Detailed execution view shows:
  - Trigger data
  - All executed actions with results
  - Errors (if any)
  - Output data
  - Timing information

### Workflow Templates (`client/src/pages/Workflows/WorkflowTemplates.jsx`)

**Features:**
- Browse pre-built workflows
- Category filter (Ecommerce, Courses, CRM, Marketing, Support)
- Official templates badge
- Featured templates badge
- Install count and tags
- Preview template before installing
- One-click installation

---

## 🚀 Workflow Examples

### Example 1: Welcome New Users

**Trigger:** User Signup

**Nodes:**
1. Trigger: User Signup
2. Action: Send Welcome Email
   - To: `{{user.email}}`
   - Subject: "Welcome to dAItaniverse, {{user.name}}!"
   - Body: "Hi {{user.name}}, thanks for joining..."
3. Delay: Wait 1 day
4. Condition: Check if user created content
   - Field: `user.contentCount`
   - Operator: equals
   - Value: 0
5. Action (if true): Send "Getting Started" Email
6. Action (if false): Send "You're Doing Great" Email

### Example 2: Course Completion

**Trigger:** Course Completed

**Nodes:**
1. Trigger: Course Completed
2. Action: Award Certificate
   - UserId: `{{user.id}}`
   - CourseId: `{{course.id}}`
3. Action: Send Congratulations Email
   - To: `{{user.email}}`
   - Subject: "You completed {{course.title}}!"
4. Action: Add Tag
   - UserId: `{{user.id}}`
   - Tag: "course_graduate"
5. Action: Post to Social Feed
   - Message: "{{user.name}} completed {{course.title}}!"

### Example 3: Abandoned Cart Recovery

**Trigger:** Schedule (Every Hour)

**Nodes:**
1. Trigger: Schedule (Hourly)
2. Action: Find Abandoned Carts
   - Query carts older than 1 hour
3. For each cart:
   - Action: Send Reminder Email
   - Offer 10% discount
4. Delay: Wait 24 hours
5. Condition: Check if still not purchased
6. Action: Send Final Reminder
   - With 15% discount

---

## 🔄 Data Flow

```
User Event (signup, purchase, etc.)
    ↓
Trigger System (workflowTriggers.js)
    ↓
Find Matching Workflows
    ↓
Queue for Execution (WorkflowQueue)
    ↓
Queue Processor (runs every 10s)
    ↓
Workflow Engine (workflowEngine.js)
    ↓
Execute Nodes in Order
    ↓
Action Executor (workflowActions.js)
    ↓
Save Execution History
    ↓
Update Workflow Stats
```

---

## 🛠️ Integration Guide

### 1. Add to Database Schema

```bash
# Add workflow schema to main schema
cat schema/workflows.prisma >> prisma/schema.prisma

# Run migration
npx prisma migrate dev --name add-workflows
```

### 2. Initialize Background Processors

In your `server/index.js`:

```javascript
const { initializeQueueProcessor } = require('./src/services/workflowEngine');
const { initializeScheduleProcessor } = require('./src/services/workflowTriggers');

// After Prisma client initialization
initializeQueueProcessor(prisma);
initializeScheduleProcessor(prisma);
```

### 3. Register Routes

In your `server/index.js`:

```javascript
const workflowRoutes = require('./src/routes/workflows');

app.use('/api/workflows', workflowRoutes);
app.use('/api/workflow-templates', workflowRoutes);
app.use('/api/webhooks', workflowRoutes);
```

### 4. Add Triggers to Your Code

Throughout your platform, add workflow triggers:

```javascript
// After user signup
const { triggerUserSignup } = require('./services/workflowTriggers');
await triggerUserSignup(prisma, newUser);

// After purchase
const { triggerPurchaseComplete } = require('./services/workflowTriggers');
await triggerPurchaseComplete(prisma, order, user, items);

// After course completion
const { triggerCourseCompleted } = require('./services/workflowTriggers');
await triggerCourseCompleted(prisma, userId, courseId);
```

### 5. Add to Navigation

```javascript
import WorkflowsList from './pages/Workflows/WorkflowsList';
import WorkflowBuilder from './pages/Workflows/WorkflowBuilder';
import ExecutionHistory from './pages/Workflows/ExecutionHistory';
import WorkflowTemplates from './pages/Workflows/WorkflowTemplates';

// In your routes
<Route path="/workflows" element={<WorkflowsList />} />
<Route path="/workflows/:id/edit" element={<WorkflowBuilder />} />
<Route path="/workflows/:id/history" element={<ExecutionHistory />} />
<Route path="/workflows/templates" element={<WorkflowTemplates />} />
```

---

## 📊 Performance

**Queue Processing:**
- Processes 10 workflows every 10 seconds
- Automatic retry (up to 3 attempts)
- Timeout protection (5 minutes max)

**Schedule Processing:**
- Checks every minute for due workflows
- Supports hourly, daily, weekly, monthly schedules
- Cron expression support for advanced scheduling

**Execution:**
- Non-blocking async execution
- Parallel action support (future enhancement)
- Error isolation (one node failure doesn't stop workflow)

---

## 🎯 Use Cases

**E-commerce:**
- Welcome new customers
- Abandoned cart recovery
- Order confirmation and tracking
- Product review requests
- Upsell and cross-sell campaigns

**Courses:**
- Course welcome sequence
- Drip content delivery
- Completion certificates
- Progress reminders
- Re-engagement campaigns

**CRM:**
- Lead nurturing sequences
- Contact enrichment
- Segmentation automation
- Task creation
- Follow-up reminders

**Marketing:**
- Email campaigns
- Social media posting
- Content scheduling
- A/B testing automation
- Analytics tracking

**Support:**
- Ticket routing
- Auto-responders
- Escalation rules
- Satisfaction surveys
- Knowledge base suggestions

---

## 🔒 Security & Limits

**Rate Limiting:**
- Max 100 executions per workflow per hour (configurable)
- Max 50 nodes per workflow
- 5-minute timeout per execution
- Infinite loop protection

**Permissions:**
- Users can only access their own workflows
- Template installation creates copy (not shared)
- Webhook secret authentication
- Admin-only dangerous actions (database queries)

**Error Handling:**
- Failed actions logged with details
- Option to continue on error
- Retry mechanism for transient failures
- Email notifications for critical failures

---

## 🎉 Success Metrics

**This Phase Delivers:**

✅ Visual workflow builder with drag-and-drop
✅ 4 node types (Trigger, Action, Condition, Delay)
✅ 10+ trigger types (events + schedules)
✅ 15+ action types (email, CRM, courses, etc.)
✅ Conditional logic (if/then/else)
✅ Variable replacement system
✅ Execution queue and background processing
✅ Execution history and debugging
✅ Workflow templates
✅ Webhook triggers
✅ Testing interface

**Business Value:**

- 💰 **Save $0-1,000/month** on automation tools (vs Zapier, Make)
- ⏱️ **Save hours daily** automating repetitive tasks
- 🎯 **Increase conversions** with automated follow-ups
- 🚀 **Faster onboarding** with automated welcome flows
- 📈 **Better retention** with re-engagement automations
- 🤖 **Reduce manual work** across all platform features

---

## 🛠️ File Structure

```
Phase 2BN: Automation/Workflow Builder
├── schema/
│   └── workflows.prisma                     # Database schema
├── server/
│   └── src/
│       ├── services/
│       │   ├── workflowEngine.js            # Execution engine
│       │   ├── workflowActions.js           # Action executor
│       │   └── workflowTriggers.js          # Trigger system
│       └── routes/
│           └── workflows.js                  # API endpoints
├── client/
│   └── src/
│       └── pages/
│           └── Workflows/
│               ├── WorkflowsList.jsx        # Workflows dashboard
│               ├── WorkflowBuilder.jsx      # Visual builder
│               ├── ExecutionHistory.jsx     # Execution logs
│               └── WorkflowTemplates.jsx    # Templates browser
└── PHASE_2BN_WORKFLOWS.md                   # This file
```

---

## 📝 Future Enhancements

**Advanced Features:**
- 🔮 Parallel action execution
- 🔮 Loop/iteration support
- 🔮 Sub-workflow calls
- 🔮 Advanced error handling (try/catch)
- 🔮 Workflow versioning
- 🔮 A/B testing workflows
- 🔮 AI-powered workflow suggestions

**More Triggers:**
- 🔮 Database changes (insert, update, delete)
- 🔮 File uploads
- 🔮 API calls
- 🔮 Custom events from code
- 🔮 Third-party integrations (Stripe, Shopify, etc.)

**More Actions:**
- 🔮 Slack/Discord notifications
- 🔮 Create calendar events
- 🔮 Generate reports
- 🔮 Export data
- 🔮 AI/ML model calls
- 🔮 Image processing
- 🔮 PDF generation

**UI Improvements:**
- 🔮 Full React Flow integration for better canvas
- 🔮 Zoom and pan controls
- 🔮 Minimap navigation
- 🔮 Workflow templates marketplace
- 🔮 Workflow sharing
- 🔮 Visual diff for changes

---

## 🎓 Quick Start Examples

### Create Your First Workflow

1. Go to `/workflows`
2. Click "Create Workflow"
3. Name it "Welcome New Users"
4. Add Trigger node (User Signup)
5. Add Action node (Send Email)
   - Configure email template
6. Click "Save"
7. Click "Activate"
8. Done! New users will automatically receive welcome email

### Install a Template

1. Go to `/workflows/templates`
2. Browse templates
3. Click "Preview" to see workflow
4. Click "Install"
5. Customize if needed
6. Activate
7. Done!

### Debug a Workflow

1. Go to workflow execution history
2. Click failed execution
3. View trigger data, executed actions, and errors
4. Fix issues in workflow builder
5. Test with "Test" button
6. Activate when working

---

## 📊 Technical Details

**Node Types:**

```javascript
{
  trigger: {
    type: 'trigger',
    data: {
      triggerType: 'user_signup',
      conditions: []  // Optional filters
    }
  },
  action: {
    type: 'action',
    data: {
      actionType: 'send_email',
      config: {
        to: '{{user.email}}',
        subject: 'Welcome!',
        body: 'Hi {{user.name}}...'
      },
      continueOnError: false
    }
  },
  condition: {
    type: 'condition',
    data: {
      condition: {
        field: 'user.membershipTier',
        operator: 'equals',
        value: 'free'
      }
    }
  },
  delay: {
    type: 'delay',
    data: {
      delay: {
        value: 1,
        unit: 'days'  // seconds, minutes, hours, days
      }
    }
  }
}
```

**Variable Syntax:**
- `{{user.name}}` - User's name
- `{{user.email}}` - User's email
- `{{order.total}}` - Order total
- `{{course.title}}` - Course title
- `{{current.date}}` - Current date

---

## 🎉 Phase 2BN Complete!

The dAItaniverse platform now has a powerful workflow automation system that rivals Zapier and Make. Users can visually build automations that connect all platform features together, saving hours of manual work every day.

**Next Phase:** Phase 2C - MVP Completion & Polish
