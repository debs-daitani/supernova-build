/**
 * Phase 2AZ: Email Automation Sequences
 * Frontend Service - API client for email sequence management
 */

import api from './api';

const emailSequencesService = {
  // ============================================
  // SEQUENCE MANAGEMENT
  // ============================================

  /**
   * Get all email sequences (admin)
   */
  getAllSequences: async () => {
    const response = await api.get('/email-sequences');
    return response.data;
  },

  /**
   * Get single sequence with emails
   */
  getSequence: async (id) => {
    const response = await api.get(`/email-sequences/${id}`);
    return response.data;
  },

  /**
   * Create new sequence
   */
  createSequence: async (data) => {
    const response = await api.post('/email-sequences', data);
    return response.data;
  },

  /**
   * Update sequence
   */
  updateSequence: async (id, data) => {
    const response = await api.patch(`/email-sequences/${id}`, data);
    return response.data;
  },

  /**
   * Delete sequence
   */
  deleteSequence: async (id) => {
    const response = await api.delete(`/email-sequences/${id}`);
    return response.data;
  },

  /**
   * Pause sequence
   */
  pauseSequence: async (id) => {
    const response = await api.post(`/email-sequences/${id}/pause`);
    return response.data;
  },

  /**
   * Activate sequence
   */
  activateSequence: async (id) => {
    const response = await api.post(`/email-sequences/${id}/activate`);
    return response.data;
  },

  // ============================================
  // EMAIL MANAGEMENT
  // ============================================

  /**
   * Add email to sequence
   */
  addEmail: async (sequenceId, data) => {
    const response = await api.post(`/email-sequences/${sequenceId}/emails`, data);
    return response.data;
  },

  /**
   * Update email
   */
  updateEmail: async (emailId, data) => {
    const response = await api.patch(`/email-sequences/emails/${emailId}`, data);
    return response.data;
  },

  /**
   * Delete email
   */
  deleteEmail: async (emailId) => {
    const response = await api.delete(`/email-sequences/emails/${emailId}`);
    return response.data;
  },

  // ============================================
  // ENROLLMENT MANAGEMENT
  // ============================================

  /**
   * Enroll users in sequence
   */
  enrollUsers: async (sequenceId, userIds) => {
    const response = await api.post(`/email-sequences/${sequenceId}/enroll`, { userIds });
    return response.data;
  },

  /**
   * Get all enrollments (admin)
   */
  getAllEnrollments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/email-sequences/enrollments${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  /**
   * Unenroll user from sequence
   */
  unenrollUser: async (enrollmentId) => {
    const response = await api.delete(`/email-sequences/enrollments/${enrollmentId}`);
    return response.data;
  },

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Get sequence analytics
   */
  getSequenceAnalytics: async (sequenceId) => {
    const response = await api.get(`/email-sequences/${sequenceId}/analytics`);
    return response.data;
  },

  /**
   * Get email analytics
   */
  getEmailAnalytics: async (emailId) => {
    const response = await api.get(`/email-sequences/emails/${emailId}/analytics`);
    return response.data;
  },

  // ============================================
  // QUEUE PROCESSING (for testing/manual trigger)
  // ============================================

  /**
   * Manually process email queue
   */
  processQueue: async () => {
    const response = await api.post('/email-sequences/process-queue');
    return response.data;
  },

  // ============================================
  // PRE-BUILT SEQUENCE TEMPLATES
  // ============================================

  /**
   * Get template for pre-built sequences
   */
  getSequenceTemplate: (type) => {
    const templates = {
      welcome: {
        name: 'Welcome Series',
        description: 'Welcome new users and introduce them to the platform',
        sequenceType: 'welcome',
        triggerEvent: 'user_signup',
        triggerDelay: 5,
        emails: [
          {
            order: 0,
            delayDays: 0,
            delayHours: 0,
            subject: 'Welcome to The dAItaniverse, {{preferredName}}! 🌟',
            textContent: `Hey {{preferredName}},

Debs here - I'm so excited you joined The dAItaniverse!

I know starting something new can feel overwhelming, but I've got you. Over the next few days, I'll be sending you some emails to help you get the most out of {{pronounPossessive}} new membership.

Here's what's coming:
- Day 2: Quick wins you can implement TODAY
- Day 4: How to use the AI prompts like a pro
- Day 7: My secret strategies for [your specific goal]

For now, just log in and look around. Get a feel for the place. It's all yours.

Talk soon,
Debs

P.S. If you ever get stuck or have questions, just hit reply. I read every email.`,
            htmlContent: `<p>Hey {{preferredName}},</p>

<p>Debs here - I'm so excited you joined The dAItaniverse!</p>

<p>I know starting something new can feel overwhelming, but I've got you. Over the next few days, I'll be sending you some emails to help you get the most out of {{pronounPossessive}} new membership.</p>

<p><strong>Here's what's coming:</strong></p>
<ul>
  <li><strong>Day 2:</strong> Quick wins you can implement TODAY</li>
  <li><strong>Day 4:</strong> How to use the AI prompts like a pro</li>
  <li><strong>Day 7:</strong> My secret strategies for {{businessGoal}}</li>
</ul>

<p>For now, just log in and look around. Get a feel for the place. It's all yours.</p>

<p>Talk soon,<br>Debs</p>

<p><em>P.S. If you ever get stuck or have questions, just hit reply. I read every email.</em></p>`,
            ctaText: 'Explore Your Dashboard',
            ctaUrl: '/dashboard'
          },
          {
            order: 1,
            delayDays: 2,
            delayHours: 0,
            subject: 'Your first quick win (takes 5 minutes) ⚡',
            textContent: `Hey {{preferredName}},

Day 2! Time for your first quick win.

I want you to feel a WIN today. So here's something simple that works:

[Pick ONE prompt from the library and use it right now]

That's it. Just one. See what happens.

Most people overthink this stuff. They want to learn everything before they start. But {{pronounSubject}} just need to START.

One prompt. One result. One win.

Then come back tomorrow and I'll show you something even cooler.

You've got this,
Debs`,
            htmlContent: `<p>Hey {{preferredName}},</p>

<p><strong>Day 2! Time for your first quick win.</strong></p>

<p>I want you to feel a WIN today. So here's something simple that works:</p>

<p><strong>[Pick ONE prompt from the library and use it right now]</strong></p>

<p>That's it. Just one. See what happens.</p>

<p>Most people overthink this stuff. {{pronounSubject|capitalize}} want to learn everything before {{pronounSubject}} start. But you just need to START.</p>

<p><strong>One prompt. One result. One win.</strong></p>

<p>Then come back tomorrow and I'll show you something even cooler.</p>

<p>You've got this,<br>Debs</p>`,
            ctaText: 'Browse Prompts',
            ctaUrl: '/prompts'
          },
          {
            order: 2,
            delayDays: 4,
            delayHours: 0,
            subject: 'The secret to getting BETTER results from AI 🎯',
            textContent: `{{preferredName}},

Quick question: Have you used any prompts yet?

If yes - AMAZING. Keep going.

If not - that's okay too. Let me make this easier.

The secret to getting better results from AI isn't using fancier prompts.

It's THIS:

Be specific about what you want.

Don't say "write me content."
Say "write me a 3-paragraph Instagram caption about [your topic] that makes people want to click the link."

See the difference?

Try it today. Pick any prompt. Make it specific to YOUR {{businessGoal}}.

Watch what happens.

Debs`,
            htmlContent: `<p>{{preferredName}},</p>

<p><strong>Quick question: Have you used any prompts yet?</strong></p>

<p>If yes - AMAZING. Keep going.</p>

<p>If not - that's okay too. Let me make this easier.</p>

<p><strong>The secret to getting better results from AI isn't using fancier prompts.</strong></p>

<p><strong>It's THIS:</strong></p>

<p style="background: #f0f0f0; padding: 15px; border-left: 4px solid #6366f1;">Be specific about what you want.</p>

<p>Don't say "write me content."<br>
Say "write me a 3-paragraph Instagram caption about [your topic] that makes people want to click the link."</p>

<p><strong>See the difference?</strong></p>

<p>Try it today. Pick any prompt. Make it specific to YOUR {{businessGoal}}.</p>

<p>Watch what happens.</p>

<p>Debs</p>`,
            ctaText: 'Try It Now',
            ctaUrl: '/prompts'
          },
          {
            order: 3,
            delayDays: 7,
            delayHours: 0,
            subject: 'This is why you\'re not getting results (yet) 💭',
            textContent: `Hey {{preferredName}},

It's been a week since you joined.

Can I be real with you?

Most people who sign up for something new... never actually USE it.

They get excited. They join. They look around.

Then life happens and they forget.

Don't be that person.

{{pronounSubject|capitalize}} joined because {{pronounSubject}} wanted to achieve {{businessGoal}}.

That's still true, right?

So here's my challenge to you:

Use The dAItaniverse for 10 minutes today. Just 10.

Pick a prompt. Use it. See what you create.

That's how this works. Small actions. Consistent effort.

You didn't join just to join. You joined to CHANGE something.

Let's do this.

Debs

P.S. If you're stuck or don't know where to start, just reply to this email. I'll personally point you in the right direction.`,
            htmlContent: `<p>Hey {{preferredName}},</p>

<p><strong>It's been a week since you joined.</strong></p>

<p>Can I be real with you?</p>

<p>Most people who sign up for something new... never actually USE it.</p>

<p>{{pronounSubject|capitalize}} get excited. {{pronounSubject|capitalize}} join. {{pronounSubject|capitalize}} look around.</p>

<p>Then life happens and {{pronounSubject}} forget.</p>

<p><strong>Don't be that person.</strong></p>

<p>You joined because you wanted to achieve <strong>{{businessGoal}}</strong>.</p>

<p>That's still true, right?</p>

<p><strong>So here's my challenge to you:</strong></p>

<p style="background: #f0f0f0; padding: 15px; border-left: 4px solid #6366f1;">Use The dAItaniverse for <strong>10 minutes</strong> today. Just 10.</p>

<p>Pick a prompt. Use it. See what you create.</p>

<p>That's how this works. <strong>Small actions. Consistent effort.</strong></p>

<p>You didn't join just to join. You joined to CHANGE something.</p>

<p><strong>Let's do this.</strong></p>

<p>Debs</p>

<p><em>P.S. If you're stuck or don't know where to start, just reply to this email. I'll personally point you in the right direction.</em></p>`,
            ctaText: 'Let\'s Go',
            ctaUrl: '/dashboard'
          },
          {
            order: 4,
            delayDays: 14,
            delayHours: 0,
            subject: 'Ready to level up? Here\'s what\'s next 🚀',
            textContent: `{{preferredName}},

Two weeks in. How's it going?

By now, you've probably explored the platform, tried some prompts, maybe even created some cool stuff.

But here's the thing...

You're only seeing a FRACTION of what's possible.

The free membership is great. But the real magic happens when you upgrade to full access.

Here's what you unlock:
- Advanced AI prompts for [specific use case]
- Weekly live coaching calls with me
- Access to the private community
- All future courses and resources

I'm not saying you HAVE to upgrade.

But if {{businessGoal}} is important to you...

If you want SERIOUS results instead of just playing around...

Then it's time.

Check out what's waiting for you inside:

[UPGRADE LINK]

Let's take this to the next level.

Debs`,
            htmlContent: `<p>{{preferredName}},</p>

<p><strong>Two weeks in. How's it going?</strong></p>

<p>By now, you've probably explored the platform, tried some prompts, maybe even created some cool stuff.</p>

<p><strong>But here's the thing...</strong></p>

<p>You're only seeing a FRACTION of what's possible.</p>

<p>The free membership is great. But the real magic happens when you upgrade to full access.</p>

<p><strong>Here's what you unlock:</strong></p>
<ul>
  <li>Advanced AI prompts for {{businessType}}</li>
  <li>Weekly live coaching calls with me</li>
  <li>Access to the private community</li>
  <li>All future courses and resources</li>
</ul>

<p>I'm not saying you HAVE to upgrade.</p>

<p><strong>But if {{businessGoal}} is important to you...</strong></p>

<p>If you want SERIOUS results instead of just playing around...</p>

<p><strong>Then it's time.</strong></p>

<p>Check out what's waiting for you inside:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="/upgrade" style="background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Unlock Full Access</a>
</p>

<p>Let's take this to the next level.</p>

<p>Debs</p>`,
            ctaText: 'Unlock Full Access',
            ctaUrl: '/upgrade'
          }
        ]
      },
      onboarding: {
        name: 'Onboarding Sequence',
        description: 'Guide new users through setup and first actions',
        sequenceType: 'onboarding',
        triggerEvent: 'user_signup',
        triggerDelay: 0,
        emails: [
          {
            order: 0,
            delayDays: 0,
            delayHours: 1,
            subject: 'Let\'s get you set up! (This takes 2 minutes)',
            textContent: 'Quick setup guide...',
            htmlContent: '<p>Quick setup guide...</p>',
            ctaText: 'Complete Setup',
            ctaUrl: '/onboarding'
          },
          {
            order: 1,
            delayDays: 1,
            delayHours: 0,
            subject: 'Your personalized dashboard is ready',
            textContent: 'Dashboard tour...',
            htmlContent: '<p>Dashboard tour...</p>',
            ctaText: 'View Dashboard',
            ctaUrl: '/dashboard'
          }
        ]
      },
      upgrade: {
        name: 'Upgrade Campaign',
        description: 'Convert free users to paid subscribers',
        sequenceType: 'upgrade',
        triggerEvent: 'trial_start',
        triggerDelay: 0,
        conditions: { accountType: 'free' },
        emails: [
          {
            order: 0,
            delayDays: 3,
            delayHours: 0,
            subject: 'You\'re missing out on the best features 😢',
            textContent: 'Upgrade benefits...',
            htmlContent: '<p>Upgrade benefits...</p>',
            ctaText: 'Upgrade Now',
            ctaUrl: '/upgrade'
          },
          {
            order: 1,
            delayDays: 7,
            delayHours: 0,
            subject: 'Last chance: Special upgrade offer inside',
            textContent: 'Limited time offer...',
            htmlContent: '<p>Limited time offer...</p>',
            ctaText: 'Claim Offer',
            ctaUrl: '/upgrade'
          }
        ]
      },
      reengagement: {
        name: 'Re-engagement Campaign',
        description: 'Win back inactive users',
        sequenceType: 'engagement',
        triggerEvent: 'inactive_30days',
        triggerDelay: 0,
        emails: [
          {
            order: 0,
            delayDays: 0,
            delayHours: 0,
            subject: 'We miss you, {{preferredName}} 💔',
            textContent: 'Come back...',
            htmlContent: '<p>Come back...</p>',
            ctaText: 'I\'m Back!',
            ctaUrl: '/dashboard'
          },
          {
            order: 1,
            delayDays: 7,
            delayHours: 0,
            subject: 'Here\'s what you\'ve been missing',
            textContent: 'New features...',
            htmlContent: '<p>New features...</p>',
            ctaText: 'Explore Now',
            ctaUrl: '/dashboard'
          }
        ]
      },
      milestone: {
        name: 'Milestone Celebration',
        description: 'Celebrate user achievements',
        sequenceType: 'milestone',
        triggerEvent: 'milestone_reached',
        triggerDelay: 0,
        emails: [
          {
            order: 0,
            delayDays: 0,
            delayHours: 0,
            subject: '🎉 You did it, {{preferredName}}!',
            textContent: 'Congratulations...',
            htmlContent: '<p>Congratulations...</p>',
            ctaText: 'Keep Going',
            ctaUrl: '/dashboard'
          }
        ]
      },
      launch: {
        name: 'Launch Countdown',
        description: 'Build excitement for new product launches',
        sequenceType: 'launch',
        triggerEvent: 'launch_announced',
        triggerDelay: 0,
        emails: [
          {
            order: 0,
            delayDays: 0,
            delayHours: 0,
            subject: 'Something BIG is coming...',
            textContent: 'Teaser...',
            htmlContent: '<p>Teaser...</p>',
            ctaText: 'Learn More',
            ctaUrl: '/launches'
          },
          {
            order: 1,
            delayDays: 3,
            delayHours: 0,
            subject: 'LIVE in 48 hours!',
            textContent: 'Final countdown...',
            htmlContent: '<p>Final countdown...</p>',
            ctaText: 'Get Ready',
            ctaUrl: '/launches'
          }
        ]
      }
    };

    return templates[type] || null;
  }
};

export default emailSequencesService;
