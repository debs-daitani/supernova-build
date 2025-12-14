export interface GuidePage {
  id: string;
  title: string;
  section: string;
  content: string;
}

export const venuedGuide: GuidePage[] = [
  {
    id: 'welcome',
    title: 'Welcome to VENUED',
    section: 'Introduction',
    content: `<h1>Welcome to VENUED!</h1>
<p>VENUED is your project and task management app built specifically for neurodivergent entrepreneurs.</p>

<h2>What makes it different?</h2>
<p>It's designed to work WITH your brain, not against it. No more fighting generic productivity tools that assume everyone thinks the same way.</p>

<h2>What you can do:</h2>
<ul>
<li>Keep track of projects (we call them "Tours")</li>
<li>Manage your to-do list (we call them "Actions")</li>
<li>Plan your week visually</li>
<li>Capture ideas quickly before you forget them</li>
<li>Track your energy levels</li>
<li>Get structured help to start and end your workday</li>
</ul>

<p><strong>Everything stays on YOUR device.</strong> No accounts, no servers, no data worries.</p>`
  },
  {
    id: 'rock-and-roll',
    title: 'The Rock & Roll Theme',
    section: 'Introduction',
    content: `<h1>Why Rock & Roll?</h1>
<p>VENUED uses music/gig terminology throughout:</p>

<ul>
<li><strong>Tours</strong> = Projects (like a band going on tour)</li>
<li><strong>Actions</strong> = Tasks (the things you do)</li>
<li><strong>Backstage</strong> = Your dashboard (where you prep)</li>
<li><strong>Crew</strong> = Your actions/team (who makes it happen)</li>
<li><strong>Setlist</strong> = Your schedule/energy (plan the show)</li>
<li><strong>Entourage</strong> = Support tools (your backup)</li>
<li><strong>Gig Vibe</strong> = Energy level (how you're feeling)</li>
</ul>

<p><strong>Why?</strong> Because building a business should feel like putting on a show, not filling in spreadsheets.</p>

<p>Plus, it's just more fun this way!</p>`
  },
  {
    id: 'accessing-venued',
    title: 'Accessing VENUED',
    section: 'Introduction',
    content: `<h1>How to Access VENUED</h1>

<h2>On your phone or tablet:</h2>
<ol>
<li>Open your web browser (Safari on iPhone, Chrome on Android)</li>
<li>Go to: <strong>venued.wtf</strong></li>
<li>Bookmark it or add to your home screen for easy access</li>
</ol>

<h2>Adding to Home Screen (iPhone):</h2>
<ol>
<li>Tap the Share button (square with arrow)</li>
<li>Scroll down and tap "Add to Home Screen"</li>
<li>Tap "Add"</li>
<li>VENUED now appears like a regular app!</li>
</ol>

<h2>Adding to Home Screen (Android):</h2>
<ol>
<li>Tap the three dots menu</li>
<li>Tap "Add to Home Screen" or "Install App"</li>
<li>Confirm</li>
<li>Done!</li>
</ol>

<h2>On your computer:</h2>
<ol>
<li>Open any web browser</li>
<li>Go to: <strong>venued.wtf</strong></li>
<li>Bookmark it for easy access</li>
</ol>`
  },
  {
    id: 'backstage-dashboard',
    title: 'The Backstage Dashboard',
    section: 'Your Dashboard (Backstage)',
    content: `<h1>Backstage - Your Home Base</h1>

<p>When you open VENUED, you land on <strong>Backstage</strong>. Think of it as your dressing room before a show - where you prep, check your vibe, and see what's on the schedule.</p>

<h2>What you'll see:</h2>
<ul>
<li>Good morning/afternoon/evening greeting</li>
<li>Your Next Big Hit (priority task)</li>
<li>Quick Wins buttons</li>
<li>Upcoming schedule preview</li>
<li>Quick Capture button (pink + in corner)</li>
</ul>

<h2>The top navigation bar shows:</h2>
<ul>
<li><strong>?</strong> = Help (opens this guide)</li>
<li><strong>Backstage</strong> = Dashboard (you're here)</li>
<li><strong>Crew</strong> = Your actions and tours</li>
<li><strong>Tour</strong> = Calendar view</li>
<li><strong>Setlist</strong> = Energy tracking</li>
<li><strong>Entourage</strong> = Support tools</li>
</ul>`
  },
  {
    id: 'quick-wins',
    title: 'Quick Wins',
    section: 'Your Dashboard (Backstage)',
    content: `<h1>Quick Wins - Fast Actions</h1>

<p>The Quick Wins section gives you one-tap access to common actions:</p>

<h2>LFG! (Let's Fucking Go!)</h2>
<p>Jump straight to your Crew to see all your actions and tours.</p>

<h2>Quick Capture</h2>
<p>Got a thought? Capture it instantly before it disappears. More on this later.</p>

<h2>Check Gig Vibe</h2>
<p>Update your energy level. This helps VENUED suggest appropriate tasks.</p>

<h2>End My Day</h2>
<p>Your shutdown ritual. Celebrate wins, dump remaining thoughts, set tomorrow's priority.</p>

<p><strong>These are your go-to buttons for daily use!</strong></p>`
  },
  {
    id: 'next-big-hit',
    title: 'Your Next Big Hit',
    section: 'Your Dashboard (Backstage)',
    content: `<h1>Your Next Big Hit</h1>

<p>This card shows you <strong>ONE thing</strong> to focus on right now.</p>

<p><strong>Why just one?</strong> Because ADHD brains work better with clear single focus, not overwhelming lists.</p>

<h2>The task shown is based on:</h2>
<ul>
<li>Your current energy level (Gig Vibe)</li>
<li>What's due or overdue</li>
<li>What you've marked as priority</li>
</ul>

<h2>You can:</h2>
<ul>
<li>Tap to see full details</li>
<li>Mark as complete when done</li>
<li>Skip if not right for now</li>
</ul>

<p><strong>If nothing shows here, you either:</strong></p>
<ul>
<li>Have no actions set up yet (go create some!)</li>
<li>Have completed everything (go you!)</li>
</ul>`
  },
  {
    id: 'crew-page',
    title: 'The Crew Page',
    section: 'Managing Your Work (Crew)',
    content: `<h1>Crew - Your Actions & Tours</h1>

<p>Tap "Crew" in the navigation to see all your work.</p>

<h2>You'll see two tabs:</h2>
<ul>
<li><strong>Actions</strong> = Individual tasks</li>
<li><strong>Tours</strong> = Projects (groups of actions)</li>
</ul>

<h2>Actions are single tasks like:</h2>
<ul>
<li>"Email Sarah about proposal"</li>
<li>"Post on Instagram"</li>
<li>"Review website copy"</li>
</ul>

<h2>Tours are bigger projects containing multiple actions:</h2>
<ul>
<li>"Launch new course" (with 20 actions inside)</li>
<li>"Q1 Marketing push" (with various tasks)</li>
<li>"Website redesign" (with phases and tasks)</li>
</ul>

<p>Most people start with simple Actions, then create Tours for bigger projects.</p>`
  },
  {
    id: 'creating-action',
    title: 'Creating an Action',
    section: 'Managing Your Work (Crew)',
    content: `<h1>Creating a New Action</h1>

<ol>
<li>Tap the "LFG!" button (or go to Crew)</li>
<li>Choose "Quick Action"</li>
<li>Fill in the details:</li>
</ol>

<ul>
<li><strong>Title:</strong> What's the task? (required)</li>
<li><strong>Description:</strong> Any extra details (optional)</li>
<li><strong>Energy Level:</strong> Low/Medium/High - how much energy does this need?</li>
<li><strong>Priority:</strong> How important is it?</li>
<li><strong>Due Date:</strong> When should it be done? (optional)</li>
<li><strong>Links:</strong> Attach relevant URLs (optional)</li>
</ul>

<ol start="4">
<li>Tap "Create Action"</li>
</ol>

<p><strong>That's it!</strong> Your action is now in your Crew.</p>

<p><em>Tip: Don't overthink it. You can always edit later.</em></p>`
  },
  {
    id: 'creating-tour',
    title: 'Creating a Tour',
    section: 'Managing Your Work (Crew)',
    content: `<h1>Creating a Tour (Project)</h1>

<ol>
<li>Tap the "LFG!" button (or go to Crew)</li>
<li>Choose "Kick Off a Tour"</li>
<li>Fill in the basics:</li>
</ol>

<ul>
<li><strong>Tour Name:</strong> What's the project?</li>
<li><strong>Description:</strong> What's it about?</li>
<li><strong>Start Date:</strong> When does it begin?</li>
<li><strong>Target End Date:</strong> When should it finish?</li>
</ul>

<ol start="4">
<li>Tap "Create Tour"</li>
</ol>

<h2>Now you can add Actions to your Tour:</h2>
<ul>
<li>Open the Tour</li>
<li>Tap "Add Action"</li>
<li>Create actions that belong to this project</li>
</ul>

<p>Tours help you see the big picture while still breaking work into manageable pieces.</p>`
  },
  {
    id: 'managing-actions',
    title: 'Managing Actions',
    section: 'Managing Your Work (Crew)',
    content: `<h1>Working with Your Actions</h1>

<p>From the Crew page, you can:</p>

<h2>View actions:</h2>
<ul>
<li>All actions across all tours</li>
<li>Filter by energy level, status, or due date</li>
<li>Search for specific actions</li>
</ul>

<h2>For each action:</h2>
<ul>
<li>Tap to see full details</li>
<li>Swipe or tap to mark complete</li>
<li>Edit to change details</li>
<li>Delete if no longer needed</li>
</ul>

<h2>Completed actions:</h2>
<ul>
<li>Move to "Completed" section</li>
<li>Can be viewed for reference</li>
<li>Contribute to your daily wins!</li>
</ul>

<p><em>Tip: Check Crew at the start of each day to see what needs attention.</em></p>`
  },
  {
    id: 'tour-calendar',
    title: 'Tour Calendar',
    section: 'Your Calendar (Tour)',
    content: `<h1>Tour - Your Calendar View</h1>

<p>Tap "Tour" in the navigation to see your schedule.</p>

<h2>The calendar shows:</h2>
<ul>
<li>Actions with due dates</li>
<li>Tour start/end dates</li>
<li>Today highlighted</li>
</ul>

<h2>Views available:</h2>
<ul>
<li>Month view (see the big picture)</li>
<li>Week view (more detail)</li>
<li>Day view (focused on today)</li>
</ul>

<h2>Tap any day to:</h2>
<ul>
<li>See what's scheduled</li>
<li>Add new actions for that day</li>
<li>Move things around</li>
</ul>

<p>This is your "what's when" view - great for planning your week.</p>`
  },
  {
    id: 'setlist-gig-vibe',
    title: 'Setlist & Gig Vibe',
    section: 'Energy Tracking (Setlist)',
    content: `<h1>Setlist - Track Your Energy</h1>

<p>Tap "Setlist" in the navigation for energy tracking.</p>

<h2>Gig Vibe = Your current energy level:</h2>
<ul>
<li><strong>Low</strong> = Tired, need easy tasks, brain fog</li>
<li><strong>Medium</strong> = Normal energy, can do most things</li>
<li><strong>High</strong> = Energised, ready for hard/creative work</li>
</ul>

<h2>Why track energy?</h2>
<ul>
<li>Match tasks to your current state</li>
<li>Spot patterns over time</li>
<li>Stop forcing yourself to do "high energy" tasks when you're depleted</li>
</ul>

<h2>Update your Gig Vibe:</h2>
<ul>
<li>Tap "Check Gig Vibe" from Backstage</li>
<li>Or tap the energy icon in Setlist</li>
<li>Select your current level</li>
<li>Done!</li>
</ul>

<p><em>Tip: Check in 2-3 times per day for best insights.</em></p>`
  },
  {
    id: 'energy-patterns',
    title: 'Understanding Your Patterns',
    section: 'Energy Tracking (Setlist)',
    content: `<h1>Understanding Your Patterns</h1>

<p>Over time, Setlist shows you:</p>
<ul>
<li>When you typically have high energy (your peak times)</li>
<li>When you usually crash</li>
<li>How your energy fluctuates through the week</li>
</ul>

<h2>Use this to:</h2>
<ul>
<li>Schedule important work during peak times</li>
<li>Plan admin/easy tasks for low periods</li>
<li>Stop beating yourself up for afternoon slumps (it's just your pattern!)</li>
</ul>

<p><strong>This is about working WITH your natural rhythms, not fighting them.</strong></p>

<p><em>Note: It takes a couple of weeks of tracking to see meaningful patterns. Stick with it!</em></p>`
  },
  {
    id: 'entourage-overview',
    title: 'Entourage Overview',
    section: 'Support Tools (Entourage)',
    content: `<h1>Entourage - Your Support Crew</h1>

<p>Tap "Entourage" for tools that help when you're stuck.</p>

<h2>Available tools:</h2>

<h3>Reframe</h3>
<p>Stuck in negative thought spiral? This helps you challenge and reframe unhelpful thoughts.</p>

<h3>Retune</h3>
<p>Need a mental break? Quick reset activities to refresh your brain.</p>

<h3>Tune Up</h3>
<p>Need structured focus? Step-by-step guidance to get into work mode.</p>

<p><strong>These aren't just nice-to-haves</strong> - they're essential tools for neurodivergent brains that need specific support strategies.</p>

<p><em>Use them whenever you need them. No shame, no guilt.</em></p>`
  },
  {
    id: 'quick-capture',
    title: 'Quick Capture',
    section: 'Daily Rituals',
    content: `<h1>Quick Capture - Save Thoughts Instantly</h1>

<p>The pink + button in the bottom right corner is your Quick Capture.</p>

<h2>What it's for:</h2>
<ul>
<li>Random ideas that pop into your head</li>
<li>Things you don't want to forget</li>
<li>Tasks you'll deal with later</li>
<li>Anything you need to get out of your brain</li>
</ul>

<h2>How to use:</h2>
<ol>
<li>Tap the pink + button</li>
<li>Type or speak your thought</li>
<li>Tap save</li>
<li>Done - it's in your Inbox</li>
</ol>

<h2>Later, you can:</h2>
<ul>
<li>Turn captures into proper Actions</li>
<li>Add them to Tours</li>
<li>Delete if no longer relevant</li>
</ul>

<p><strong>The point:</strong> Get it OUT of your head immediately. Process later.</p>`
  },
  {
    id: 'end-my-day',
    title: 'End My Day Ritual',
    section: 'Daily Rituals',
    content: `<h1>End My Day - Your Shutdown Ritual</h1>

<p>This is one of the most powerful features in VENUED.</p>

<h2>Why you need it:</h2>
<ul>
<li>Properly close your workday</li>
<li>Celebrate what you DID do (not what you didn't)</li>
<li>Clear your head for evening/sleep</li>
<li>Set up tomorrow for success</li>
</ul>

<h2>The ritual walks you through:</h2>

<h3>1. What You Rocked Today</h3>
<p>Review completed actions. Acknowledge your wins!</p>

<h3>2. Missed Beats</h3>
<p>Anything still in your head? Dump it here. It goes to your Inbox - safe til tomorrow.</p>

<h3>3. Tomorrow's WIN</h3>
<p>Pick ONE thing that would make tomorrow great. Just one. Single focus.</p>

<h3>4. Curtain Call</h3>
<p>Any final reflections? How do you feel?</p>

<p><strong>Then: Leave the Stage!</strong></p>

<p>Confetti celebrates your day (because you deserve it).</p>`
  },
  {
    id: 'getting-started-tips',
    title: 'Getting Started Tips',
    section: 'Tips & Best Practices',
    content: `<h1>Tips for Getting Started</h1>

<h2>Start small:</h2>
<ul>
<li>Don't try to put your entire life into VENUED day one</li>
<li>Start with 3-5 current tasks</li>
<li>Add more as you get comfortable</li>
</ul>

<h2>Daily habits to build:</h2>
<ul>
<li><strong>Morning:</strong> Check Gig Vibe, look at Your Next Big Hit</li>
<li><strong>During day:</strong> Quick Capture random thoughts</li>
<li><strong>Evening:</strong> End My Day ritual</li>
</ul>

<h2>Don't overthink it:</h2>
<ul>
<li>Actions don't need perfect descriptions</li>
<li>Energy levels are estimates, not science</li>
<li>You can always edit, delete, reorganise</li>
</ul>

<h2>Give it a week:</h2>
<ul>
<li>New tools feel awkward at first</li>
<li>Stick with the basics for 5-7 days</li>
<li>Then explore more features</li>
</ul>`
  },
  {
    id: 'common-questions',
    title: 'Common Questions',
    section: 'Tips & Best Practices',
    content: `<h1>Common Questions</h1>

<h3>Q: Where is my data stored?</h3>
<p>A: On your device only. Nothing goes to external servers.</p>

<h3>Q: What if I clear my browser?</h3>
<p>A: Your data may be lost. Consider exporting regularly (feature coming soon).</p>

<h3>Q: Can I use on multiple devices?</h3>
<p>A: Currently, each device is separate. Sync coming in future updates.</p>

<h3>Q: I forgot to End My Day yesterday!</h3>
<p>A: No problem. Just start fresh today. No guilt!</p>

<h3>Q: This feels overwhelming...</h3>
<p>A: Just use Quick Capture and End My Day for the first week. That's enough!</p>

<h3>Q: I have feedback/found a bug!</h3>
<p>A: Amazing! Message the beta WhatsApp group or email directly.</p>`
  },
  {
    id: 'beta-feedback',
    title: 'Giving Feedback (Beta Testers)',
    section: 'Tips & Best Practices',
    content: `<h1>For Beta Testers - Your Feedback Matters!</h1>

<p>You're not just testing software. You're helping build something that actually works for neurodivergent entrepreneurs.</p>

<h2>We want to know:</h2>
<ul>
<li>What's confusing</li>
<li>What's brilliant</li>
<li>What's missing</li>
<li>What would make it perfect</li>
</ul>

<h2>Good feedback includes:</h2>
<ul>
<li>What you were trying to do</li>
<li>What happened (or didn't)</li>
<li>What you expected</li>
<li>Screenshots if helpful</li>
</ul>

<h2>Be brutally honest:</h2>
<ul>
<li>"This is confusing" = valuable</li>
<li>"I love this" = valuable</li>
<li>"I never use this" = valuable</li>
</ul>

<p><strong>All feedback shapes what gets built next.</strong></p>

<p><em>Thank you for being part of this!</em></p>`
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
