export interface GuidePage {
  id: string;
  title: string;
  section: string;
  content: string;
  comingSoon?: boolean;
}

export const platformGuide: GuidePage[] = [
  // ===========================================
  // SECTION 1: WELCOME TO THE dAItaniverse
  // ===========================================
  {
    id: 'welcome',
    title: 'Welcome to the dAItaniverse',
    section: 'Welcome',
    content: `<h1>Welcome to the dAItaniverse!</h1>
<p>You've just stepped into something special - a complete AI-powered business ecosystem built specifically for <strong>neurodivergent entrepreneurs</strong>.</p>

<h2>What is the dAItaniverse?</h2>
<p>It's everything you need to run your business in one place. No more jumping between 15 different apps. No more trying to make generic tools work for your brain.</p>

<p><strong>The dAItaniverse is built for how YOUR brain actually works.</strong></p>

<h2>What makes it different?</h2>
<ul>
<li>Designed by neurodivergent entrepreneurs, for neurodivergent entrepreneurs</li>
<li>SUPERNova AI understands your unique challenges and adapts to help</li>
<li>Rock-themed interfaces that make work feel less like work</li>
<li>Everything connects - your CRM knows your tasks, your AI knows your goals</li>
<li>No shame, no guilt, no "productivity hacks" that don't work for us</li>
</ul>

<p><em>This isn't just software. It's your crew, your backstage pass, your support system.</em></p>`
  },
  {
    id: 'platform-overview',
    title: 'Platform Overview',
    section: 'Welcome',
    content: `<h1>Platform Overview</h1>
<p>Here's your map to the dAItaniverse. Each area serves a specific purpose:</p>

<h2>Core Tools (Working Now)</h2>
<ul>
<li><strong>Dashboard (Home)</strong> - Your mission control, at-a-glance stats</li>
<li><strong>SUPERNova</strong> - Your AI business partner with 3 modes</li>
<li><strong>VENUED</strong> - Project and task management (external app)</li>
<li><strong>CRM</strong> - Contacts, deals, and customer relationships</li>
<li><strong>Email Marketing</strong> - Campaigns and subscriber management</li>
<li><strong>Quiz Builder</strong> - Lead generation and assessment tools</li>
<li><strong>Guides</strong> - Interactive learning resources (you're here!)</li>
<li><strong>Billing</strong> - Subscription and payment management</li>
</ul>

<h2>Coming Soon</h2>
<ul>
<li><strong>Business Hub</strong> - Calendar, documents, cloud storage, team tools</li>
<li><strong>Creative Studio</strong> - AI content, image/video generation, editors</li>
<li><strong>Analytics</strong> - Revenue, content performance, user behaviour</li>
<li><strong>Programmes</strong> - Learning paths and courses</li>
<li><strong>Community</strong> - Forum, groups, events, messaging</li>
</ul>

<p><strong>Use the sidebar navigation to explore each area.</strong></p>`
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    section: 'Welcome',
    content: `<h1>Getting Started</h1>
<p>Don't try to learn everything at once. Here's the recommended path:</p>

<h2>Day 1: Get Familiar</h2>
<ol>
<li>Explore the Dashboard - see what's there</li>
<li>Have a chat with SUPERNova - just say hello</li>
<li>Look at the sidebar - notice all the areas</li>
</ol>

<h2>Week 1: Core Features</h2>
<ol>
<li>Add a few contacts to your CRM</li>
<li>Try SUPERNova in different modes (Brain, Body, Business)</li>
<li>Create your first email campaign (even just a draft)</li>
<li>Explore VENUED for task management</li>
</ol>

<h2>Quick Wins to Build Confidence</h2>
<ul>
<li>Ask SUPERNova for help with something you're stuck on</li>
<li>Import your existing contacts</li>
<li>Send yourself a test email campaign</li>
<li>Complete the End My Day ritual in VENUED</li>
</ul>

<h2>Getting Help</h2>
<ul>
<li>Check these Guides for any feature</li>
<li>Ask SUPERNova - it knows the platform well</li>
<li>Settings icon for account and preferences</li>
</ul>

<p><em>Remember: There's no "wrong" way to use this. Explore at your own pace!</em></p>`
  },

  // ===========================================
  // SECTION 2: DASHBOARD
  // ===========================================
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    section: 'Dashboard',
    content: `<h1>Dashboard - Your Mission Control</h1>
<p>The Dashboard is the first thing you see when you log in. It's designed to give you everything important at a glance.</p>

<h2>What You'll See</h2>

<h3>Welcome Header</h3>
<p>Personalised greeting with your name. Simple but important - you're acknowledged.</p>

<h3>Stats Cards</h3>
<p>Quick numbers showing:</p>
<ul>
<li><strong>Total Contacts</strong> - How many people are in your CRM</li>
<li><strong>Active Deals</strong> - Pipeline opportunities</li>
<li><strong>Email Subscribers</strong> - Your audience size</li>
<li><strong>Recent Activity</strong> - What's been happening</li>
</ul>

<h3>Quick Actions</h3>
<p>Fast access to common tasks:</p>
<ul>
<li>Open SUPERNova Chat</li>
<li>Add a Contact</li>
<li>Create Campaign</li>
<li>View CRM</li>
</ul>

<h2>Why This Layout?</h2>
<p>ADHD brains need visual cues and quick access. The Dashboard reduces the "where do I start?" paralysis by showing you what matters most.</p>

<p><em>Tip: If the Dashboard feels overwhelming, just pick ONE thing to do. The rest will wait.</em></p>`
  },
  {
    id: 'dashboard-widgets',
    title: 'Dashboard Widgets',
    section: 'Dashboard',
    content: `<h1>Understanding Dashboard Widgets</h1>
<p>Each card on your Dashboard is a "widget" - a mini view into one part of your business.</p>

<h2>Stats Cards</h2>
<p>These update in real-time as you add contacts, create deals, and grow your email list. They're there to show progress - celebrate when numbers go up!</p>

<h2>Quick Chat Widget</h2>
<p>A mini SUPERNova chat right on your Dashboard. Ask a quick question without leaving the page. Perfect for:</p>
<ul>
<li>"What should I focus on today?"</li>
<li>"Give me a quick motivation boost"</li>
<li>"Help me draft a response to this client"</li>
</ul>

<h3>Expanding to Full Chat</h3>
<p>Click "Open Full Chat" to go to the complete SUPERNova experience with all features.</p>

<h2>Activity Feed</h2>
<p>Recent actions across your platform - contacts added, emails sent, deals updated. Helps you remember what you did (because we forget!).</p>

<h2>Customisation (Coming)</h2>
<p>Future updates will let you arrange and choose which widgets appear. For now, we've set up what works best for most users.</p>`
  },

  // ===========================================
  // SECTION 3: SUPERNova AI
  // ===========================================
  {
    id: 'supernova-intro',
    title: 'What is SUPERNova?',
    section: 'SUPERNova AI',
    content: `<h1>What is SUPERNova?</h1>
<p>SUPERNova is your AI business partner. Not a generic chatbot - a specialised assistant that understands neurodivergent entrepreneurs.</p>

<h2>What Makes SUPERNova Different?</h2>
<ul>
<li><strong>Three Modes</strong> - Brain, Body, and Business support</li>
<li><strong>Context Aware</strong> - Remembers your conversations and business</li>
<li><strong>No Judgment</strong> - Designed to support, not criticise</li>
<li><strong>Practical Help</strong> - Not just information, but actual assistance</li>
</ul>

<h2>What Can SUPERNova Do?</h2>
<ul>
<li>Help with ADHD challenges (executive function, focus, time blindness)</li>
<li>Support emotional regulation and self-compassion</li>
<li>Provide business strategy and marketing advice</li>
<li>Draft content, emails, and copy</li>
<li>Problem-solve when you're stuck</li>
<li>Be a thinking partner for big decisions</li>
</ul>

<h2>How to Access</h2>
<ul>
<li><strong>Quick Chat</strong> - Widget on Dashboard for fast questions</li>
<li><strong>Full Chat</strong> - "SUPERNova Chat" in sidebar for deeper conversations</li>
</ul>

<p><em>Think of SUPERNova as the business partner who actually gets it.</em></p>`
  },
  {
    id: 'supernova-brain-mode',
    title: 'Brain Mode',
    section: 'SUPERNova AI',
    content: `<h1>SUPERNova Brain Mode</h1>
<p>Brain Mode is for when you need help with how your brain works (or doesn't).</p>

<h2>What Brain Mode Helps With:</h2>

<h3>Executive Function</h3>
<ul>
<li>Breaking big tasks into small steps</li>
<li>Getting started when you're stuck</li>
<li>Staying on track</li>
<li>Transitioning between tasks</li>
</ul>

<h3>Focus & Attention</h3>
<ul>
<li>Strategies for deep work</li>
<li>Managing distractions</li>
<li>Body doubling alternatives</li>
<li>Hyperfocus management</li>
</ul>

<h3>Time Management</h3>
<ul>
<li>Time blindness strategies</li>
<li>Realistic scheduling</li>
<li>Deadline management</li>
<li>Buffer time planning</li>
</ul>

<h3>Emotional Regulation</h3>
<ul>
<li>Handling overwhelm</li>
<li>Managing rejection sensitivity</li>
<li>Dealing with frustration</li>
<li>Reframing negative thoughts</li>
</ul>

<h2>Example Prompts for Brain Mode:</h2>
<ul>
<li>"I can't get started on this project"</li>
<li>"I'm overwhelmed and don't know what to do first"</li>
<li>"Help me break down this massive task"</li>
<li>"I keep getting distracted, what can I do?"</li>
</ul>`
  },
  {
    id: 'supernova-body-mode',
    title: 'Body Mode (Confident Body)',
    section: 'SUPERNova AI',
    content: `<h1>SUPERNova Body Mode</h1>
<p>Body Mode (also called Confident Body) is for the inner work - self-love, identity, and emotional wellbeing.</p>

<h2>What Body Mode Helps With:</h2>

<h3>Self-Love & Acceptance</h3>
<ul>
<li>Working through imposter syndrome</li>
<li>Celebrating wins (yes, even small ones)</li>
<li>Accepting your neurodivergent traits</li>
<li>Building self-compassion</li>
</ul>

<h3>Identity & Purpose</h3>
<ul>
<li>Connecting to your "why"</li>
<li>Aligning business with values</li>
<li>Personal brand authenticity</li>
<li>Finding your voice</li>
</ul>

<h3>Energy & Wellbeing</h3>
<ul>
<li>Managing burnout</li>
<li>Setting healthy boundaries</li>
<li>Rest without guilt</li>
<li>Work-life integration</li>
</ul>

<h3>Inner Work</h3>
<ul>
<li>Processing difficult emotions</li>
<li>Letting go of perfectionism</li>
<li>Handling criticism</li>
<li>Building resilience</li>
</ul>

<h2>Example Prompts for Body Mode:</h2>
<ul>
<li>"I feel like a fraud"</li>
<li>"I need a pep talk"</li>
<li>"Help me be kinder to myself"</li>
<li>"I'm burning out, what should I do?"</li>
</ul>`
  },
  {
    id: 'supernova-business-mode',
    title: 'Business Mode',
    section: 'SUPERNova AI',
    content: `<h1>SUPERNova Business Mode</h1>
<p>Business Mode is your strategic advisor for all things business.</p>

<h2>What Business Mode Helps With:</h2>

<h3>Strategy & Planning</h3>
<ul>
<li>Business model refinement</li>
<li>Goal setting and roadmaps</li>
<li>Decision making</li>
<li>Problem solving</li>
</ul>

<h3>Marketing & Sales</h3>
<ul>
<li>Marketing strategy</li>
<li>Content ideas</li>
<li>Sales conversations</li>
<li>Pricing guidance</li>
</ul>

<h3>Client Management</h3>
<ul>
<li>Handling difficult clients</li>
<li>Setting boundaries</li>
<li>Communication templates</li>
<li>Scope creep prevention</li>
</ul>

<h3>Operations</h3>
<ul>
<li>Systems and processes</li>
<li>Automation ideas</li>
<li>Efficiency improvements</li>
<li>Team management</li>
</ul>

<h2>Example Prompts for Business Mode:</h2>
<ul>
<li>"Help me plan my Q1 marketing"</li>
<li>"How should I price this service?"</li>
<li>"Write a proposal for [project]"</li>
<li>"What should I prioritise this month?"</li>
</ul>`
  },
  {
    id: 'supernova-tips',
    title: 'Getting the Best from SUPERNova',
    section: 'SUPERNova AI',
    content: `<h1>Getting the Best from SUPERNova</h1>

<h2>Be Specific</h2>
<p>Instead of: "Help me with marketing"</p>
<p>Try: "I need 5 Instagram post ideas for my coaching business targeting burnt-out corporate women"</p>

<h2>Give Context</h2>
<p>The more SUPERNova knows, the better it can help:</p>
<ul>
<li>What's your business about?</li>
<li>Who are your clients?</li>
<li>What have you tried?</li>
<li>What's blocking you?</li>
</ul>

<h2>Ask Follow-Up Questions</h2>
<p>First answer not quite right? Ask for:</p>
<ul>
<li>"Can you be more specific?"</li>
<li>"Give me examples"</li>
<li>"Make it more [casual/professional/etc]"</li>
<li>"What about [specific concern]?"</li>
</ul>

<h2>Use It Often</h2>
<p>SUPERNova learns from your conversations. The more you use it, the more useful it becomes.</p>

<h2>Don't Hold Back</h2>
<p>SUPERNova is here to help, not judge. If you're struggling, say so. If you're excited, share it. If you need tough love, ask for it.</p>

<p><em>Pro tip: Start each session by telling SUPERNova your current energy level and what you're trying to achieve.</em></p>`
  },

  // ===========================================
  // SECTION 4: VENUED
  // ===========================================
  {
    id: 'venued-overview',
    title: 'VENUED Overview',
    section: 'VENUED',
    content: `<h1>VENUED - Project & Task Management</h1>
<p>VENUED is your rock & roll productivity app, designed specifically for ADHD brains.</p>

<h2>Quick Access</h2>
<p>Click "VENUED" in the sidebar to open it in a new tab, or go directly to <strong>venued.wtf</strong></p>

<h2>Why VENUED is Different</h2>
<ul>
<li>Built for neurodivergent brains, not against them</li>
<li>Rock-themed terminology that makes work fun</li>
<li>Energy-based task matching</li>
<li>Structured start and end-of-day rituals</li>
<li>Quick capture for random thoughts</li>
</ul>

<h2>Key Terminology</h2>
<ul>
<li><strong>Tours</strong> = Projects</li>
<li><strong>Actions</strong> = Tasks</li>
<li><strong>Backstage</strong> = Dashboard</li>
<li><strong>Crew</strong> = Your tasks and projects</li>
<li><strong>Setlist</strong> = Energy tracking</li>
<li><strong>Entourage</strong> = Support tools</li>
<li><strong>Gig Vibe</strong> = Energy level</li>
</ul>

<h2>Detailed Guide</h2>
<p>For the complete VENUED guide, go to <strong>Guides → VENUED App Guide</strong> in the sidebar.</p>

<p><em>VENUED and dAItaniverse work together - your business tools here, your task management there.</em></p>`
  },

  // ===========================================
  // SECTION 5: CRM
  // ===========================================
  {
    id: 'crm-overview',
    title: 'CRM Overview',
    section: 'CRM',
    content: `<h1>CRM - Customer Relationship Management</h1>
<p>Your CRM is where you track everyone important to your business - leads, clients, partners, and contacts.</p>

<h2>Why You Need It</h2>
<ul>
<li>Never forget who you talked to or what about</li>
<li>Track deals from lead to close</li>
<li>See your sales pipeline at a glance</li>
<li>Know when to follow up</li>
</ul>

<h2>Main Areas</h2>
<ul>
<li><strong>Contacts</strong> - All your people</li>
<li><strong>Deals</strong> - Sales opportunities</li>
<li><strong>Tasks</strong> - CRM-specific actions</li>
<li><strong>Analytics</strong> - Pipeline and performance data</li>
</ul>

<h2>Quick Access</h2>
<p>Find CRM in the sidebar under "Business Hub". You'll see:</p>
<ul>
<li>CRM (main overview)</li>
<li>CRM Analytics (reports and insights)</li>
</ul>

<p><em>A good CRM is like having a perfect memory for business relationships.</em></p>`
  },
  {
    id: 'crm-contacts',
    title: 'Managing Contacts',
    section: 'CRM',
    content: `<h1>Managing Contacts</h1>

<h2>Adding a Contact</h2>
<ol>
<li>Go to CRM → Contacts</li>
<li>Click "Add Contact"</li>
<li>Fill in the details:
  <ul>
  <li>Name (required)</li>
  <li>Email</li>
  <li>Phone</li>
  <li>Company</li>
  <li>Notes</li>
  </ul>
</li>
<li>Click Save</li>
</ol>

<h2>Contact Profiles</h2>
<p>Click any contact to see their full profile:</p>
<ul>
<li>All their details</li>
<li>Activity history</li>
<li>Linked deals</li>
<li>Tasks related to them</li>
<li>Notes and timeline</li>
</ul>

<h2>Importing Contacts</h2>
<p>Have contacts in a spreadsheet? Import them:</p>
<ol>
<li>Go to CRM → Contacts → Import</li>
<li>Upload your CSV file</li>
<li>Map the columns to fields</li>
<li>Review and import</li>
</ol>

<h2>Searching & Filtering</h2>
<p>Use the search bar to find contacts by name, email, or company. Filter by status, tags, or custom fields.</p>

<p><em>Tip: Add contacts immediately after meeting someone. Your future self will thank you!</em></p>`
  },
  {
    id: 'crm-deals',
    title: 'Deals & Pipeline',
    section: 'CRM',
    content: `<h1>Deals & Sales Pipeline</h1>

<h2>What's a Deal?</h2>
<p>A deal represents a sales opportunity - a potential project, contract, or sale with a contact.</p>

<h2>Creating a Deal</h2>
<ol>
<li>Go to CRM → Deals</li>
<li>Click "Add Deal"</li>
<li>Fill in:
  <ul>
  <li>Deal name</li>
  <li>Value (expected revenue)</li>
  <li>Contact (who it's with)</li>
  <li>Stage (where it is in your pipeline)</li>
  <li>Expected close date</li>
  </ul>
</li>
<li>Click Save</li>
</ol>

<h2>Pipeline Stages</h2>
<p>Deals move through stages:</p>
<ul>
<li><strong>Lead</strong> - Initial interest</li>
<li><strong>Qualified</strong> - Confirmed opportunity</li>
<li><strong>Proposal</strong> - You've sent an offer</li>
<li><strong>Negotiation</strong> - Discussing terms</li>
<li><strong>Won</strong> - Deal closed successfully</li>
<li><strong>Lost</strong> - Deal didn't happen</li>
</ul>

<h2>Moving Deals</h2>
<p>Drag deals between stages or click to edit and change the stage manually.</p>

<h2>Deal Value</h2>
<p>Track potential revenue. This helps you forecast income and prioritise high-value opportunities.</p>`
  },
  {
    id: 'crm-tasks-activities',
    title: 'CRM Tasks & Activities',
    section: 'CRM',
    content: `<h1>CRM Tasks & Activities</h1>

<h2>CRM Tasks</h2>
<p>Tasks linked to specific contacts or deals:</p>
<ul>
<li>Follow up calls</li>
<li>Send proposals</li>
<li>Check in emails</li>
<li>Meeting prep</li>
</ul>

<h2>Creating a Task</h2>
<ol>
<li>Go to CRM → Tasks (or from within a contact/deal)</li>
<li>Click "Add Task"</li>
<li>Fill in:
  <ul>
  <li>Task description</li>
  <li>Due date</li>
  <li>Link to contact/deal</li>
  <li>Priority</li>
  </ul>
</li>
<li>Click Save</li>
</ol>

<h2>Activity Log</h2>
<p>Every action on a contact is logged automatically:</p>
<ul>
<li>Emails sent</li>
<li>Notes added</li>
<li>Deals created or updated</li>
<li>Tasks completed</li>
</ul>

<h2>Adding Notes</h2>
<p>On any contact profile, add notes to record:</p>
<ul>
<li>Conversation summaries</li>
<li>Important details mentioned</li>
<li>Follow-up items</li>
<li>Personal details to remember</li>
</ul>

<p><em>The activity log is your memory - use it liberally!</em></p>`
  },
  {
    id: 'crm-analytics',
    title: 'CRM Analytics',
    section: 'CRM',
    content: `<h1>CRM Analytics</h1>
<p>Go to CRM → Analytics to see your sales data visualised.</p>

<h2>Available Metrics</h2>

<h3>Pipeline Overview</h3>
<ul>
<li>Total deals by stage</li>
<li>Total potential revenue</li>
<li>Average deal value</li>
<li>Conversion rates</li>
</ul>

<h3>Activity Metrics</h3>
<ul>
<li>Contacts added over time</li>
<li>Tasks completed</li>
<li>Deal progression</li>
</ul>

<h3>Win/Loss Analysis</h3>
<ul>
<li>Win rate percentage</li>
<li>Revenue won vs lost</li>
<li>Common reasons for lost deals</li>
</ul>

<h2>Using the Data</h2>
<p>Ask yourself:</p>
<ul>
<li>Where are deals getting stuck?</li>
<li>What's my average time to close?</li>
<li>Which lead sources convert best?</li>
<li>Am I following up enough?</li>
</ul>

<p><em>Data helps you work smarter, not harder. Check analytics weekly to spot patterns.</em></p>`
  },

  // ===========================================
  // SECTION 6: EMAIL MARKETING
  // ===========================================
  {
    id: 'email-overview',
    title: 'Email Marketing Overview',
    section: 'Email Marketing',
    content: `<h1>Email Marketing</h1>
<p>Build and nurture your audience through email campaigns.</p>

<h2>Why Email Marketing?</h2>
<ul>
<li>You own your email list (unlike social followers)</li>
<li>Direct access to your audience's inbox</li>
<li>Higher conversion rates than social media</li>
<li>Build relationships over time</li>
</ul>

<h2>Main Features</h2>
<ul>
<li><strong>Subscribers</strong> - Manage your email list</li>
<li><strong>Campaigns</strong> - Create and send emails</li>
<li><strong>Analytics</strong> - Track opens, clicks, and performance</li>
</ul>

<h2>Access Email Marketing</h2>
<p>Click "Email Marketing" in the sidebar under Business Hub.</p>

<h2>Powered by Resend</h2>
<p>We use Resend for reliable email delivery. Your emails arrive in inboxes, not spam folders.</p>

<p><em>Email is still one of the most powerful marketing tools. Start building your list today!</em></p>`
  },
  {
    id: 'email-subscribers',
    title: 'Managing Subscribers',
    section: 'Email Marketing',
    content: `<h1>Managing Subscribers</h1>

<h2>Adding Subscribers</h2>
<ol>
<li>Go to Email → Subscribers</li>
<li>Click "Add Subscriber"</li>
<li>Enter email address and name</li>
<li>Click Save</li>
</ol>

<h2>Importing Subscribers</h2>
<ol>
<li>Go to Email → Subscribers → Import</li>
<li>Upload a CSV file with email addresses</li>
<li>Map columns (email, name, etc.)</li>
<li>Import</li>
</ol>

<h2>Subscriber Details</h2>
<p>Click any subscriber to see:</p>
<ul>
<li>Contact information</li>
<li>Subscription status</li>
<li>Email history</li>
<li>Engagement stats</li>
</ul>

<h2>Managing Unsubscribes</h2>
<p>When someone unsubscribes, they're automatically marked. You cannot send to unsubscribed contacts.</p>

<h2>Best Practices</h2>
<ul>
<li>Only email people who've opted in</li>
<li>Make unsubscribing easy (it's required by law)</li>
<li>Clean your list periodically</li>
<li>Don't buy email lists - ever</li>
</ul>`
  },
  {
    id: 'email-campaigns',
    title: 'Creating Campaigns',
    section: 'Email Marketing',
    content: `<h1>Creating Email Campaigns</h1>

<h2>Starting a Campaign</h2>
<ol>
<li>Go to Email → Campaigns</li>
<li>Click "Create Campaign"</li>
<li>Fill in:
  <ul>
  <li>Campaign name (internal reference)</li>
  <li>Subject line (what recipients see)</li>
  <li>Preview text (shows in inbox preview)</li>
  </ul>
</li>
</ol>

<h2>The Email Editor</h2>
<p>Use the rich text editor to:</p>
<ul>
<li>Write your email content</li>
<li>Format text (bold, italic, headings)</li>
<li>Add links</li>
<li>Insert images</li>
</ul>

<h2>Personalisation</h2>
<p>Use merge tags to personalise:</p>
<ul>
<li><strong>{{name}}</strong> - Subscriber's name</li>
<li><strong>{{email}}</strong> - Their email address</li>
</ul>

<h2>Selecting Recipients</h2>
<p>Choose who receives the email:</p>
<ul>
<li>All subscribers</li>
<li>Specific segments (coming soon)</li>
<li>Selected individuals</li>
</ul>

<h2>Sending</h2>
<ul>
<li><strong>Send Now</strong> - Immediately send to all recipients</li>
<li><strong>Save Draft</strong> - Save and send later</li>
</ul>

<p><em>Always send a test email to yourself first!</em></p>`
  },
  {
    id: 'email-analytics',
    title: 'Email Analytics',
    section: 'Email Marketing',
    content: `<h1>Email Analytics</h1>
<p>Track how your emails perform.</p>

<h2>Key Metrics</h2>

<h3>Open Rate</h3>
<p>Percentage of recipients who opened your email. Good benchmark: 20-30%.</p>

<h3>Click Rate</h3>
<p>Percentage who clicked a link. Good benchmark: 2-5%.</p>

<h3>Bounce Rate</h3>
<p>Emails that couldn't be delivered. Keep under 2%.</p>

<h3>Unsubscribe Rate</h3>
<p>People who opted out. Keep under 0.5% per email.</p>

<h2>Viewing Campaign Stats</h2>
<ol>
<li>Go to Email → Campaigns</li>
<li>Click on any sent campaign</li>
<li>View the Stats tab</li>
</ol>

<h2>What the Data Tells You</h2>
<ul>
<li>Low opens? Work on subject lines</li>
<li>Low clicks? Improve content and CTAs</li>
<li>High unsubscribes? Check frequency and relevance</li>
</ul>

<h2>Overall Analytics</h2>
<p>Go to Email → Analytics for aggregate data across all campaigns.</p>

<p><em>Track trends over time, not just individual campaigns.</em></p>`
  },

  // ===========================================
  // SECTION 7: QUIZ BUILDER
  // ===========================================
  {
    id: 'quiz-overview',
    title: 'Quiz Builder Overview',
    section: 'Quiz Builder',
    content: `<h1>Quiz Builder</h1>
<p>Create interactive quizzes for lead generation, assessment, and audience engagement.</p>

<h2>What Can You Build?</h2>
<ul>
<li><strong>Lead Generation Quizzes</strong> - "What type of entrepreneur are you?"</li>
<li><strong>Assessment Quizzes</strong> - "Is coaching right for you?"</li>
<li><strong>Educational Quizzes</strong> - Test knowledge after training</li>
<li><strong>Fun Quizzes</strong> - Engage your audience</li>
</ul>

<h2>Why Quizzes Work</h2>
<ul>
<li>Interactive content gets more engagement</li>
<li>People love learning about themselves</li>
<li>Segment leads based on answers</li>
<li>Personalise follow-up based on results</li>
</ul>

<h2>Access Quiz Builder</h2>
<p>Find it in the sidebar under Learn → Quiz Builder.</p>

<p><em>Quizzes can convert 30-50% of visitors to leads. That's powerful!</em></p>`
  },
  {
    id: 'quiz-creating',
    title: 'Creating a Quiz',
    section: 'Quiz Builder',
    content: `<h1>Creating a Quiz</h1>

<h2>Quiz Setup</h2>
<ol>
<li>Go to Quiz Builder → Create Quiz</li>
<li>Enter quiz details:
  <ul>
  <li>Quiz title</li>
  <li>Description</li>
  <li>Type (assessment, lead gen, etc.)</li>
  </ul>
</li>
</ol>

<h2>Adding Questions</h2>
<ol>
<li>Click "Add Question"</li>
<li>Enter your question text</li>
<li>Add answer options</li>
<li>Set scoring (if applicable)</li>
<li>Repeat for all questions</li>
</ol>

<h2>Question Types</h2>
<ul>
<li><strong>Multiple Choice</strong> - Pick one answer</li>
<li><strong>Multiple Select</strong> - Pick several answers</li>
<li><strong>Scale</strong> - Rate on a scale</li>
<li><strong>Text</strong> - Free-form answer</li>
</ul>

<h2>Results & Outcomes</h2>
<p>Define what happens based on scores:</p>
<ul>
<li>Different result pages per score range</li>
<li>Custom messaging for each outcome</li>
<li>Recommended next steps</li>
</ul>

<h2>Publishing</h2>
<p>Once ready, click Publish to make your quiz live. You'll get a shareable link.</p>`
  },
  {
    id: 'quiz-analytics',
    title: 'Quiz Analytics',
    section: 'Quiz Builder',
    content: `<h1>Quiz Analytics</h1>
<p>Track how your quizzes perform.</p>

<h2>Key Metrics</h2>

<h3>Completion Rate</h3>
<p>Percentage who finish the quiz. Good: 60%+</p>

<h3>Lead Capture Rate</h3>
<p>Percentage who provide their email. Good: 30%+</p>

<h3>Drop-off Points</h3>
<p>Where people abandon the quiz. Use this to improve problematic questions.</p>

<h2>Response Data</h2>
<p>See how people answer each question:</p>
<ul>
<li>Most common answers</li>
<li>Answer distribution</li>
<li>Correlation between answers</li>
</ul>

<h2>Lead Data</h2>
<p>For quizzes with email capture:</p>
<ul>
<li>View collected leads</li>
<li>Export to CRM or email list</li>
<li>See their quiz results</li>
</ul>

<h2>Using Insights</h2>
<ul>
<li>Personalise follow-up based on results</li>
<li>Identify common pain points</li>
<li>Refine your messaging</li>
</ul>`
  },

  // ===========================================
  // SECTION 8: BILLING & PAYMENTS
  // ===========================================
  {
    id: 'billing-overview',
    title: 'Billing & Payments',
    section: 'Billing',
    content: `<h1>Billing & Payments</h1>
<p>Manage your dAItaniverse subscription and payment details.</p>

<h2>Accessing Billing</h2>
<p>Click "Billing" in the sidebar under Money, or go to Settings → Billing.</p>

<h2>What You Can Do</h2>
<ul>
<li>View your current plan</li>
<li>Update payment method</li>
<li>View billing history</li>
<li>Download invoices</li>
<li>Change or cancel subscription</li>
</ul>

<h2>Payment Methods</h2>
<p>We accept:</p>
<ul>
<li>Credit/Debit cards</li>
<li>Powered by Stripe (secure payment processing)</li>
</ul>

<h2>Subscription Management</h2>
<ul>
<li><strong>Upgrade</strong> - Move to a higher plan anytime</li>
<li><strong>Downgrade</strong> - Takes effect at next billing cycle</li>
<li><strong>Cancel</strong> - Access continues until period ends</li>
</ul>

<h2>Invoices</h2>
<p>All invoices are available in your billing section. Download PDFs for your records.</p>

<p><em>Questions about billing? Contact support or ask SUPERNova for help.</em></p>`
  },

  // ===========================================
  // SECTION 9: GUIDES
  // ===========================================
  {
    id: 'guides-overview',
    title: 'Using Guides',
    section: 'Guides',
    content: `<h1>Using Guides</h1>
<p>You're in one right now! Guides are interactive tutorials for every part of the platform.</p>

<h2>Available Guides</h2>
<ul>
<li><strong>Platform Overview</strong> - This guide (the big picture)</li>
<li><strong>VENUED App Guide</strong> - Complete VENUED documentation</li>
<li>More guides coming soon!</li>
</ul>

<h2>How to Navigate</h2>
<ul>
<li><strong>Next/Previous</strong> - Arrow buttons at bottom</li>
<li><strong>Contents</strong> - Click section names on the left (desktop) or menu icon (mobile)</li>
<li><strong>Keyboard</strong> - Use arrow keys, Home/End</li>
</ul>

<h2>Requesting Guides</h2>
<p>Need a guide for something specific? Let us know! We're building based on what you need.</p>

<h2>Guide Updates</h2>
<p>Guides are updated as features evolve. Check back for new content.</p>

<p><em>Guides + SUPERNova = you'll never be stuck.</em></p>`
  },

  // ===========================================
  // SECTION 10: ADMIN (Brief)
  // ===========================================
  {
    id: 'admin-overview',
    title: 'Admin Features',
    section: 'Admin',
    content: `<h1>Admin Features</h1>
<p>Admin tools are for platform administrators and specific account functions.</p>

<h2>Admin Dashboard</h2>
<p>If you have admin access, you can view:</p>
<ul>
<li>Platform statistics</li>
<li>User activity</li>
<li>System health</li>
</ul>

<h2>Payments Admin</h2>
<p>View and manage payment-related data:</p>
<ul>
<li>Revenue tracking</li>
<li>Subscription status</li>
<li>Payment history</li>
</ul>

<h2>Knowledge Upload</h2>
<p>Admin tool for uploading content to SUPERNova's knowledge base (admin only).</p>

<h2>Quiz Management</h2>
<p>Create and manage quizzes for the platform:</p>
<ul>
<li>Quiz Builder</li>
<li>Quiz Analytics</li>
</ul>

<p><em>Most users won't need admin access - it's for platform management.</em></p>`
  },

  // ===========================================
  // SECTION 11: BUSINESS TOOLS (COMING SOON)
  // ===========================================
  {
    id: 'business-calendar',
    title: 'Calendar',
    section: 'Business Hub (Coming Soon)',
    content: `<h1>Calendar</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Sync your Google Calendar, schedule meetings, block focus time - all integrated with your tasks and energy levels.</p>

<h2>Planned Features</h2>
<ul>
<li>Google Calendar sync</li>
<li>Meeting scheduling</li>
<li>Focus time blocking</li>
<li>Energy-aware scheduling</li>
<li>Integration with VENUED tasks</li>
<li>Reminders and notifications</li>
</ul>

<h2>Why It Matters</h2>
<p>Your calendar should work WITH your brain. We're building time management that accounts for energy fluctuations and ADHD challenges.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'business-documents',
    title: 'Document Management',
    section: 'Business Hub (Coming Soon)',
    content: `<h1>Document Management</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Organise files, create templates, manage all your business documents in one place.</p>

<h2>Planned Features</h2>
<ul>
<li>File organisation and folders</li>
<li>Template library</li>
<li>Document search</li>
<li>Version history</li>
<li>Share and collaborate</li>
<li>Connect to CRM and projects</li>
</ul>

<h2>Why It Matters</h2>
<p>No more hunting through Dropbox, Drive, and your desktop. Everything in one searchable place.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'business-cloud',
    title: 'Cloud Storage',
    section: 'Business Hub (Coming Soon)',
    content: `<h1>Cloud Storage</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Secure storage for all your business files with easy organisation and sharing.</p>

<h2>Planned Features</h2>
<ul>
<li>Secure file storage</li>
<li>Easy upload and download</li>
<li>File sharing with links</li>
<li>Storage quota management</li>
<li>Integration with other platform tools</li>
</ul>

<h2>Why It Matters</h2>
<p>One less external service to manage. Your files where you work.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'business-team',
    title: 'Team Collaboration',
    section: 'Business Hub (Coming Soon)',
    content: `<h1>Team Collaboration</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Work with your crew - share projects, assign tasks, communicate in real-time.</p>

<h2>Planned Features</h2>
<ul>
<li>Team workspaces</li>
<li>Task assignment</li>
<li>Real-time collaboration</li>
<li>Team chat</li>
<li>Permissions and roles</li>
<li>Activity feeds</li>
</ul>

<h2>Why It Matters</h2>
<p>Whether you have a VA, contractors, or a full team - collaborate without leaving the platform.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'business-video',
    title: 'Video Platform',
    section: 'Business Hub (Coming Soon)',
    content: `<h1>Video Platform</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Host and organise your video content - tutorials, courses, client recordings.</p>

<h2>Planned Features</h2>
<ul>
<li>Video hosting</li>
<li>Course organisation</li>
<li>Client portal videos</li>
<li>Recording management</li>
<li>Video analytics</li>
<li>Embed and share options</li>
</ul>

<h2>Why It Matters</h2>
<p>Stop paying for separate video hosting. Keep everything together.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'business-workflows',
    title: 'Workflows & Automation',
    section: 'Business Hub (Coming Soon)',
    content: `<h1>Workflows & Automation</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Build automated workflows to handle repetitive tasks. Set it and forget it.</p>

<h2>Planned Features</h2>
<ul>
<li>Visual workflow builder</li>
<li>Trigger-based automation</li>
<li>Email sequences</li>
<li>Task automation</li>
<li>CRM automations</li>
<li>Integration triggers</li>
</ul>

<h2>Why It Matters</h2>
<p>ADHD brains shouldn't waste energy on repetitive tasks. Let automation handle it.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },

  // ===========================================
  // SECTION 12: CREATIVE STUDIO (COMING SOON)
  // ===========================================
  {
    id: 'creative-ai-content',
    title: 'AI Content Generation',
    section: 'Creative Studio (Coming Soon)',
    content: `<h1>AI Content Generation</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Let AI help you write blog posts, social captions, emails and more - in YOUR voice.</p>

<h2>Planned Features</h2>
<ul>
<li>Blog post generation</li>
<li>Social media captions</li>
<li>Email copy</li>
<li>Website content</li>
<li>Voice and tone matching</li>
<li>Content repurposing</li>
</ul>

<h2>Why It Matters</h2>
<p>Content creation without the blank page paralysis. AI-assisted, human-refined.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'creative-image-gen',
    title: 'Image Generation',
    section: 'Creative Studio (Coming Soon)',
    content: `<h1>Image Generation</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Create custom images for your brand using AI - no design skills needed.</p>

<h2>Planned Features</h2>
<ul>
<li>AI image generation</li>
<li>Brand style consistency</li>
<li>Social media graphics</li>
<li>Blog images</li>
<li>Product mockups</li>
<li>Custom illustrations</li>
</ul>

<h2>Why It Matters</h2>
<p>Professional visuals without the design degree or expensive freelancers.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'creative-video-gen',
    title: 'Video Generation',
    section: 'Creative Studio (Coming Soon)',
    content: `<h1>Video Generation</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Turn scripts into videos, create promo content, build your visual library.</p>

<h2>Planned Features</h2>
<ul>
<li>Script to video</li>
<li>Promo video creation</li>
<li>Social video clips</li>
<li>Video templates</li>
<li>Stock footage integration</li>
<li>Auto-captions</li>
</ul>

<h2>Why It Matters</h2>
<p>Video content without the production complexity. Create and publish fast.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'creative-editors',
    title: 'Image & Video Editors',
    section: 'Creative Studio (Coming Soon)',
    content: `<h1>Image & Video Editors</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Edit and enhance images and videos without leaving the platform.</p>

<h2>Image Editor - Planned Features</h2>
<ul>
<li>Crop and resize</li>
<li>Filters and adjustments</li>
<li>Text overlays</li>
<li>Background removal</li>
<li>Quick touch-ups</li>
</ul>

<h2>Video Editor - Planned Features</h2>
<ul>
<li>Trim and cut</li>
<li>Text and titles</li>
<li>Basic transitions</li>
<li>Audio adjustments</li>
<li>Export options</li>
</ul>

<h2>Why It Matters</h2>
<p>Quick edits without switching to heavy software. Get content out faster.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'creative-documents',
    title: 'Document Editors',
    section: 'Creative Studio (Coming Soon)',
    content: `<h1>Document Editors</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Create, edit, and manage PDFs, documents, spreadsheets, and presentations.</p>

<h2>PDF Editor - Planned</h2>
<ul>
<li>Create and edit PDFs</li>
<li>Annotate and sign</li>
<li>Merge and split</li>
<li>Form creation</li>
</ul>

<h2>Document Editor - Planned</h2>
<ul>
<li>Rich text editing</li>
<li>Templates</li>
<li>AI writing assistance</li>
<li>Export options</li>
</ul>

<h2>Spreadsheet Editor - Planned</h2>
<ul>
<li>Data management</li>
<li>Basic formulas</li>
<li>Charts</li>
<li>Import/export</li>
</ul>

<h2>Presentation Editor - Planned</h2>
<ul>
<li>Slide creation</li>
<li>Templates</li>
<li>Media embedding</li>
<li>Present mode</li>
</ul>

<p><em>Stay tuned - these are coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'creative-brand',
    title: 'Brand Kit & Templates',
    section: 'Creative Studio (Coming Soon)',
    content: `<h1>Brand Kit & Templates</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<h2>Brand Kit Manager</h2>
<p>Store your colours, fonts, logos - apply them across everything you create.</p>
<ul>
<li>Brand colour palette</li>
<li>Font selections</li>
<li>Logo library</li>
<li>Brand guidelines</li>
<li>Auto-apply to templates</li>
</ul>

<h2>Template Library</h2>
<p>Pre-designed templates for social posts, documents, presentations and more.</p>
<ul>
<li>Social media templates</li>
<li>Document templates</li>
<li>Presentation templates</li>
<li>Email templates</li>
<li>Customisable designs</li>
</ul>

<h2>Logo Creator</h2>
<p>Design a logo or refresh your brand identity with AI assistance.</p>

<h2>Why It Matters</h2>
<p>Consistent branding without the headache. Your brand, everywhere, effortlessly.</p>

<p><em>Stay tuned - these are coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'creative-website',
    title: 'Website Builder',
    section: 'Creative Studio (Coming Soon)',
    content: `<h1>Website Builder</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Build websites for yourself or your clients - drag, drop, publish.</p>

<h2>Planned Features</h2>
<ul>
<li>Drag and drop builder</li>
<li>Mobile responsive</li>
<li>Template library</li>
<li>Custom domains</li>
<li>SEO tools</li>
<li>Form integration</li>
<li>Analytics</li>
<li>Blog functionality</li>
</ul>

<h2>Why It Matters</h2>
<p>Your website, on your platform, without the WordPress headaches.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },

  // ===========================================
  // SECTION 13: ANALYTICS (COMING SOON)
  // ===========================================
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    section: 'Analytics (Coming Soon)',
    content: `<h1>Analytics Dashboard</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>See all your business data in one place - revenue, engagement, growth patterns.</p>

<h2>Planned Features</h2>
<ul>
<li>Unified dashboard</li>
<li>Key metrics at a glance</li>
<li>Custom date ranges</li>
<li>Trend analysis</li>
<li>Goal tracking</li>
<li>Exportable reports</li>
</ul>

<h2>Why It Matters</h2>
<p>Data from every part of your business, finally in one place. Make decisions based on facts.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'analytics-revenue',
    title: 'Revenue Analytics',
    section: 'Analytics (Coming Soon)',
    content: `<h1>Revenue Analytics</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Track income, spot trends, forecast your earnings.</p>

<h2>Planned Features</h2>
<ul>
<li>Income tracking</li>
<li>Revenue by source</li>
<li>Monthly/quarterly trends</li>
<li>Forecasting</li>
<li>Goal progress</li>
<li>Profit margins</li>
</ul>

<h2>Why It Matters</h2>
<p>Know your numbers without the spreadsheet chaos. Financial clarity for better decisions.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'analytics-content',
    title: 'Content Performance',
    section: 'Analytics (Coming Soon)',
    content: `<h1>Content Performance</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>See what's working - which content gets engagement, which converts.</p>

<h2>Planned Features</h2>
<ul>
<li>Content engagement metrics</li>
<li>Top performing content</li>
<li>Conversion tracking</li>
<li>Audience insights</li>
<li>Best times to post</li>
<li>Content recommendations</li>
</ul>

<h2>Why It Matters</h2>
<p>Stop guessing what works. Let data guide your content strategy.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },
  {
    id: 'analytics-behaviour',
    title: 'User Behaviour',
    section: 'Analytics (Coming Soon)',
    content: `<h1>User Behaviour</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Understand how people interact with your content and offers.</p>

<h2>Planned Features</h2>
<ul>
<li>Visitor analytics</li>
<li>Page views and sessions</li>
<li>User journeys</li>
<li>Conversion funnels</li>
<li>Heatmaps</li>
<li>A/B testing insights</li>
</ul>

<h2>Why It Matters</h2>
<p>Understand your audience's behaviour to improve their experience and your conversions.</p>

<p><em>Stay tuned - this is coming soon!</em></p>`,
    comingSoon: true
  },

  // ===========================================
  // SECTION 14: PROGRAMMES (COMING SOON)
  // ===========================================
  {
    id: 'programmes-overview',
    title: 'Programme Library',
    section: 'Programmes (Coming Soon)',
    content: `<h1>Programme Library</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Access curated learning paths designed for neurodivergent entrepreneurs.</p>

<h2>Planned Programmes</h2>

<h3>Content Creation Programme</h3>
<p>Master content that converts - written, video, audio, social.</p>

<h3>Social Media Strategy Programme</h3>
<p>Build a social presence that grows your business without burning you out.</p>

<h3>Personal Branding Programme</h3>
<p>Stand out, be memorable, attract your ideal clients.</p>

<h3>AI Leverage Programme</h3>
<p>Use AI tools to work smarter - including getting the most from SUPERNova.</p>

<h2>Why It Matters</h2>
<p>Learning designed for how you learn. Bite-sized, practical, and neurodivergent-friendly.</p>

<p><em>Stay tuned - programmes are coming soon!</em></p>`,
    comingSoon: true
  },

  // ===========================================
  // SECTION 15: COMMUNITY (COMING SOON)
  // ===========================================
  {
    id: 'community-overview',
    title: 'Community Features',
    section: 'Community (Coming Soon)',
    content: `<h1>Community Features</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<p>Connect with other neurodivergent entrepreneurs. Share wins, get support, collaborate.</p>

<h2>Planned Features</h2>

<h3>Community Forum</h3>
<p>Discussion threads, Q&A, topic channels.</p>

<h3>Member Profiles</h3>
<p>Your space to show who you are and what you do.</p>

<h3>Groups</h3>
<p>Join or create groups around specific interests, industries, or goals.</p>

<h3>Events</h3>
<p>Virtual meetups, workshops, co-working sessions with your fellow founders.</p>

<h3>Direct Messaging</h3>
<p>Connect privately with community members.</p>

<h3>Leaderboards</h3>
<p>Celebrate achievements and see who's crushing it.</p>

<h2>Why It Matters</h2>
<p>Entrepreneurship is lonely. Community changes everything. Find your people here.</p>

<p><em>Stay tuned - community is coming soon!</em></p>`,
    comingSoon: true
  },

  // ===========================================
  // SECTION 16: ADDITIONAL FEATURES (COMING SOON)
  // ===========================================
  {
    id: 'additional-features',
    title: 'Additional Features',
    section: 'Additional (Coming Soon)',
    content: `<h1>Additional Features Coming Soon</h1>
<p class="coming-soon-badge">🚧 COMING SOON</p>

<h2>Ecommerce</h2>
<p>Sell products, digital downloads, and services directly from the platform.</p>

<h2>Booking System</h2>
<p>Let clients book calls and sessions directly - synced with your calendar.</p>

<h2>Affiliate/Referral System</h2>
<p>Earn rewards for referring other entrepreneurs to the platform.</p>

<h2>Membership Tiers</h2>
<p>Upgrade options with additional features and benefits.</p>

<h2>Support Tickets</h2>
<p>Get help when you need it - submit and track support requests.</p>

<h2>Migration Tools</h2>
<p>Moving from another platform? We'll help you bring everything over.</p>

<p><em>These features are in development. Stay tuned!</em></p>`,
    comingSoon: true
  },

  // ===========================================
  // SECTION 17: GETTING HELP
  // ===========================================
  {
    id: 'help-overview',
    title: 'Getting Help',
    section: 'Getting Help',
    content: `<h1>Getting Help</h1>
<p>Stuck? Here's how to get unstuck.</p>

<h2>In-Platform Help</h2>

<h3>SUPERNova</h3>
<p>Your first stop. Ask SUPERNova anything about the platform:</p>
<ul>
<li>"How do I add a contact?"</li>
<li>"What can I do with email marketing?"</li>
<li>"I'm stuck on [feature]"</li>
</ul>

<h3>Guides</h3>
<p>Interactive documentation (like this one) for deep dives into features.</p>

<h3>Help Icon (?)</h3>
<p>Look for the question mark icon throughout the platform for contextual help.</p>

<h2>Contact Support</h2>
<p>For issues SUPERNova can't solve:</p>
<ul>
<li>Use the Support feature in Settings</li>
<li>Email support directly</li>
<li>Beta testers: Use the WhatsApp group</li>
</ul>

<h2>Feedback & Feature Requests</h2>
<p>Have an idea? Found a bug? We want to know:</p>
<ul>
<li>Use in-app feedback</li>
<li>Tell SUPERNova (it gets logged)</li>
<li>Email the team directly</li>
</ul>`
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    section: 'Getting Help',
    content: `<h1>Frequently Asked Questions</h1>

<h3>Q: How do I reset my password?</h3>
<p>A: Use the "Forgot Password" link on the login page. You'll receive an email to reset it.</p>

<h3>Q: Can I use dAItaniverse on mobile?</h3>
<p>A: Yes! The platform is mobile-responsive. Use your browser on any device.</p>

<h3>Q: Is my data secure?</h3>
<p>A: Yes. We use industry-standard encryption, secure payment processing (Stripe), and never sell your data.</p>

<h3>Q: What happens if I cancel my subscription?</h3>
<p>A: You'll retain access until the end of your billing period. Your data remains available for export.</p>

<h3>Q: Can I export my data?</h3>
<p>A: Yes. Contact support for data export assistance. Full self-service export coming soon.</p>

<h3>Q: How is SUPERNova different from ChatGPT?</h3>
<p>A: SUPERNova is specifically trained for neurodivergent entrepreneurs, has three specialised modes, and integrates with your platform data.</p>

<h3>Q: What if a feature doesn't work?</h3>
<p>A: Report it! Use feedback channels or contact support. We fix things fast.</p>

<h3>Q: How often do you add new features?</h3>
<p>A: Continuously. Check the "Coming Soon" sections for what's next.</p>`
  },
  {
    id: 'tips-best-practices',
    title: 'Tips & Best Practices',
    section: 'Getting Help',
    content: `<h1>Tips & Best Practices</h1>

<h2>Daily Habits</h2>
<ul>
<li><strong>Morning:</strong> Check Dashboard, set intentions with SUPERNova</li>
<li><strong>During day:</strong> Quick Capture thoughts, work from Next Big Hit</li>
<li><strong>Evening:</strong> End My Day ritual in VENUED</li>
</ul>

<h2>Getting Unstuck</h2>
<ul>
<li>Ask SUPERNova for help - seriously, it's good at this</li>
<li>Switch modes - Brain Mode for ADHD struggles, Body Mode for motivation</li>
<li>Use Quick Capture to dump your brain</li>
<li>Break tasks into tiny pieces</li>
</ul>

<h2>Building Momentum</h2>
<ul>
<li>Start with Quick Wins</li>
<li>Celebrate small victories</li>
<li>Don't try to use everything at once</li>
<li>Add one new feature per week</li>
</ul>

<h2>For Neurodivergent Brains</h2>
<ul>
<li>Use energy levels to guide what you work on</li>
<li>External deadlines help - set them</li>
<li>Body doubling: work with SUPERNova open</li>
<li>Forgive yourself when things don't go to plan</li>
</ul>

<p><em>The platform adapts to you. You don't have to adapt to it.</em></p>`
  },
  {
    id: 'whats-next',
    title: "What's Next",
    section: 'Getting Help',
    content: `<h1>What's Next?</h1>

<h2>You've Got This</h2>
<p>You now know the platform. Not every feature - but enough to start using it effectively.</p>

<h2>Recommended Next Steps</h2>
<ol>
<li><strong>Have a conversation with SUPERNova</strong> - Tell it about your business</li>
<li><strong>Add 5 contacts to your CRM</strong> - Start building your database</li>
<li><strong>Explore VENUED</strong> - Set up your first project</li>
<li><strong>Send yourself a test email</strong> - See how campaigns work</li>
</ol>

<h2>Remember</h2>
<ul>
<li>You don't need to use everything</li>
<li>Start with what solves your biggest problem</li>
<li>Ask for help - that's what SUPERNova is for</li>
<li>This platform grows with you</li>
</ul>

<h2>Welcome to the dAItaniverse</h2>
<p>You're not just using software. You're part of something built for entrepreneurs like you - by entrepreneurs like you.</p>

<p><strong>Now go build something amazing.</strong></p>

<p><em>🎸 Rock on! 🎸</em></p>`
  }
];

// Get unique sections for table of contents
export function getGuideSections(guide: GuidePage[]): string[] {
  const sections: string[] = [];
  guide.forEach(page => {
    if (!sections.includes(page.section)) {
      sections.push(page.section);
    }
  });
  return sections;
}

// Get pages by section
export function getPagesBySection(guide: GuidePage[], section: string): GuidePage[] {
  return guide.filter(page => page.section === section);
}
