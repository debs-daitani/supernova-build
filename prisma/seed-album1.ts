/**
 * Seed script for Album 1: TOO GOOD AT RAISING HELL
 * The Badass Branding Blueprint - Finding Your Fight
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAlbum1() {
  console.log('🎸 Seeding Album 1: TOO GOOD AT RAISING HELL...')

  // Create Album 1
  const album1 = await prisma.album.create({
    data: {
      title: 'TOO GOOD AT RAISING HELL',
      subtitle: 'Finding Your Fight',
      description: 'Album 1 of The Badass Branding Blueprint. Learn to find your rebel yell, commit to your mission, pick your battle, and become the variant.',
      pillar: 'BRANDING',
      order: 1,
      soundtrack: 'The Struts (+ Luke Spiller Solo)',
      objectives: [
        'Find your rebel yell and commit to not running from it',
        'Build your brand on YOUR terms, not the playbook',
        'Pick your battle NOW and claim it publicly',
        'Become THE variant - unmissable and incomparable',
      ],
      outcomes: [
        'A clear rebel yell you can defend',
        'Freedom from the personal branding playbook',
        'A publicly claimed battle worth fighting',
        'An unmissable variant position',
      ],
      tags: ['branding', 'rebellion', 'positioning', 'authenticity'],
      isPublic: true,
    },
  })

  console.log(`✅ Created Album: ${album1.title}`)

  // Track 1.1: I WON'T RUN
  const track11 = await prisma.track.create({
    data: {
      albumId: album1.id,
      title: "I WON'T RUN",
      subtitle: 'Saying Yes to Your Yell (No Backing Down)',
      songTitle: "I Won't Run",
      order: 1,
      estimatedReadTime: '15 min',
      objectives: ['Find your rebel yell', 'Commit to not backing down', 'Face the consequences of boldness'],
      tags: ['commitment', 'rebel-yell', 'purpose', 'courage'],
    },
  })

  console.log(`  ✅ Created Track 1.1: ${track11.title}`)

  // Track 1.1 Sections
  await prisma.section.createMany({
    data: [
      {
        trackId: track11.id,
        sectionType: 'TRUTH_BOMB',
        content: `Let's cut the bullshit: every guru and their dog bangs on about "finding your why" like it's some mystical enlightenment moment you'll have whilst doing yoga at sunrise. Spoiler alert - it's not.

Here's what's actually happening in 2025: the personal branding landscape is drowning in identical, polished clones all spouting the same "authentic" nonsense whilst following the exact same formula. People are exhausted. They can smell manufactured authenticity a mile off, and they're hungry for something real.

But here's where most people get it wrong - they think "finding your why" means discovering some profound purpose that sounds good on an About page. Then they spend six months agonising over whether it's "right", whether it's "too controversial", whether they should soften it to appeal to more people.

Fuck that.

**Your why isn't a mission statement. Your why is your rebel yell. And once you've found it, you don't run from it.**

The difference? A mission statement sits pretty on your website. A rebel yell rallies people to your cause. A mission statement describes what you do. A yell declares what you're fighting AGAINST - and commits you to that fight, no matter what.

Think about it - what pisses you off so much about your industry that you're willing to build a business fighting it? What makes you want to trash the hotel rooms? That's your yell.

But here's where most people bottle it: they find their yell, they feel that fire in their belly, they know exactly what they want to say... and then they water it down. They soften it. They add caveats. They worry about alienating people. They run.

Truth is, the market is saturated with personal brands but starving for purpose-driven voices who actually have the balls to stand by what they believe. The brands winning right now aren't the ones with the best morning routines or the prettiest Instagram grids. They're the ones with a battle worth fighting - and the commitment to not back down when it gets uncomfortable.

Because it WILL get uncomfortable. When you stop playing it safe, when you stop trying to please everyone, when you actually take a stand - some people won't like it. Some people will unfollow. Some people will tell you you're "too much" or "too aggressive" or "too controversial".

**Good. That means you've found your rebel yell. And now the question is: will you run from it, or will you own it?**

People don't follow brands anymore. They join movements. And movements need leaders who don't run when things get spicy.`,
        order: 1,
        estimatedReadTime: '3-5 min',
        examples: [],
        resources: [],
      },
      {
        trackId: track11.id,
        sectionType: 'REBELLION',
        content: `Here's how we do it differently:

**Traditional Branding Says:** "Find your unique value proposition, test it with your audience, and refine based on feedback."

**We Say:** "Find your rebel yell and plant your fucking flag. Then defend it. YELL YOUR YELL."

The anti-establishment approach to branding isn't about being contrarian for the sake of it. It's about identifying what's broken in your industry, declaring war on it, and refusing to back down even when people tell you you're being "too much".

Look at the brands that are actually breaking through right now. They're not winning because they carefully A/B tested their messaging and found the safest possible position. They're winning because they picked a clear enemy (guru culture, hustle porn, corporate bullshit, whatever) and they committed to that fight - no hedging, no softening, no running.

Your yell isn't "I help midlife women start businesses." That's beige. That's wallpaper. That gets lost in the sea of sameness - and you can abandon it the second it stops working without anyone noticing.

Your yell is "Fuck the labels - we're building businesses OUR way." See the difference? One describes. One declares war. And one demands commitment.

**The BADASS of it is: when you commit to your yell - when you refuse to run from it even when it's uncomfortable - something magical happens.**

You stop attracting everyone and start attracting die-hard groupies. Your audience gets smaller initially (good - you're filtering out tourists), then more engaged (they're here for the fight), then more committed (they're invested in the cause), then bigger than it's ever been. But now they're not just followers - they're front row at your gigs and they trust you BECAUSE you didn't run when things got difficult.

The traditional approach says "test and refine". We say "commit and defend".

Hard truth time: **the only way to build a movement is to not run when the mainstream tells you to sit down and shut up.**`,
        order: 2,
        estimatedReadTime: '2-3 min',
        examples: [],
        resources: [],
      },
      {
        trackId: track11.id,
        sectionType: 'IMPACTFUL_ACTION',
        content: `Right, enough theory. Time to find your rebel yell and commit to it.

**Grab a piece of paper (or open a blank doc) and answer these three questions:**

1. **What makes you want to trash the hotel rooms in your industry?**
   (Be specific. "Everything" isn't an answer. What REALLY pisses you off?)

2. **What are the "gurus" getting wrong?**
   (What advice do you see everywhere that makes you call bullshit?)

3. **If you could burn one business belief to the ground, what would it be?**
   (The lie that's keeping your ideal clients stuck, broke, or miserable)

Once you've got those three answers, combine them into one sentence that starts with:

**"Unlike [the mainstream approach], I'm choosing [your rebellion]."**

For example:
- "Unlike business coaches who tell you to niche down and hustle harder, I'm choosing to help midlife entrepreneurs build businesses that actually fit their ADHD brains."
- "Unlike the guru brigade charging £10k for their courses, I'm choosing to democratise business strategy with AI for £26 a month."

**That sentence? That's your rebel yell.**

Now here's the commitment part:

**Write down three things that might happen if you lead with this yell:**
- Who might unfollow you?
- What opportunities might you "miss"?
- What criticism might you face?

Look at that list. Really look at it. Are those consequences you can live with? Because if the answer is yes, you've found a yell worth defending.

**Do this now. Don't overthink it. Write three answers, craft one sentence, face the potential consequences. 15 minutes, maximum.**

**Then commit. Put it everywhere. Lead with it. And when people tell you to soften it, remember: I WON'T RUN.**`,
        order: 3,
        estimatedReadTime: 'One clear action',
        examples: [],
        resources: [],
      },
      {
        trackId: track11.id,
        sectionType: 'ENCORE',
        content: `Once you've got your rebel yell and faced the potential consequences:

1. What's scarier - committing to this yell or staying invisible in the sea of sameness? (Be honest.)

2. If you could magically have 10,000 lukewarm followers OR 100 die-hard groupies who believe in your yell, which would you choose? (If you hesitated, why?)

3. What would "not running" look like for you practically? (When someone criticises your position, when an opportunity requires you to soften your message, when the algorithm seems to punish your boldness - what's your commitment?)

4. Does this yell feel TRUE enough to defend for the next 12 months minimum? (If not, it's not your yell yet - keep digging.)

**Bring these reflections to your next session with SUPERNova and we'll make sure your rebel yell is bulletproof.**`,
        order: 4,
        estimatedReadTime: 'Reflection prompts',
        examples: [],
        resources: [],
      },
      {
        trackId: track11.id,
        sectionType: 'BACKSTAGE_PASS',
        content: `**Real-World Rebel Yells That Didn't Run:**

- **Example 1:** A brand positioning expert who leads with "Unlike agencies that make you invisible behind corporate speak, I help founders build brands that sound exactly like them." Her enemy: corporate blandness. When clients ask her to "tone it down", she doesn't. She's committed.

- **Example 2:** The dAItaniverse's rebel yell: "Fuck the labels - midlife neuro-variant entrepreneurs building businesses OUR way." Enemy: guru culture, expensive SaaS exploitation, neurotypical business models. When people say it's "too aggressive", we don't soften. We double down.

**The Commitment Test:**

If you're not willing to lose some people by standing for something, you don't actually stand for anything. The brands breaking through in 2025 are the ones who decided what hill they're willing to die on - and then defended it.

**Further Reading:**
- Research backing: "The market is saturated with personal brands but starving for purpose-driven voices" (Medium, 2024)
- On commitment: Why movements need leaders who don't back down when challenged

**Next Track:** Once you've committed to your rebel yell, we'll tackle Track 1.2 where we explore why doing what YOU want beats following the personal branding playbook.`,
        order: 5,
        estimatedReadTime: 'Resources & Examples',
        examples: [
          'A brand positioning expert who leads with fighting corporate blandness',
          'The dAItaniverse rebel yell against guru culture',
        ],
        resources: [
          'Medium 2024: Market saturation vs purpose-driven voices',
          'Commitment research: Movement leaders',
        ],
      },
    ],
  })

  console.log(`    ✅ Created 5 sections for Track 1.1`)

  // Track 1.2: DO WHAT YOU WANT
  const track12 = await prisma.track.create({
    data: {
      albumId: album1.id,
      title: 'DO WHAT YOU WANT',
      subtitle: 'Your Mission, Your Rules (Purpose vs Personal Brand)',
      songTitle: 'Do What You Want',
      order: 2,
      estimatedReadTime: '15 min',
      objectives: [
        'Understand the difference between personal brand and purpose-driven movement',
        'Break free from the personal branding playbook',
        'Build on YOUR terms, not the platform\'s terms',
      ],
      tags: ['purpose', 'authenticity', 'freedom', 'movement'],
    },
  })

  console.log(`  ✅ Created Track 1.2: ${track12.title}`)

  await prisma.section.createMany({
    data: [
      {
        trackId: track12.id,
        sectionType: 'TRUTH_BOMB',
        content: `Everyone's got an opinion on how you should build your brand.

Post daily. No wait, prioritise quality over quantity. Use video. No wait, carousels get more engagement. Be vulnerable. No wait, be aspirational. Share your journey. No wait, focus on your expertise. LinkedIn is for thought leadership. Instagram is for community. TikTok is for reach. Newsletters are making a comeback. Threads is the new Twitter. Blah blah fucking blah.

Here's what nobody's telling you: **all of that advice is about building a personal brand. None of it is about building a movement.**

And there's a massive difference.

**Personal Brand = Following the playbook**
Post at optimal times. Use trending audio. Create value-packed carousels. Build your audience. Engage for 30 minutes daily. Use the right hashtags. Follow the algorithm. Play the game.

It's all about YOU and how well you can perform the personal branding dance. Jump through the hoops. Tick the boxes. Do what the gurus say works.

**Purpose-Driven Movement = Your gig, your setlist**
Post when you've got something to say. Use whatever format actually expresses your message. Share what matters to your mission, not what the algorithm rewards. Build raving fans, not an audience asleep at the rail. Create on your terms, not the platform's terms.

It's about the MISSION, and you get to decide how to chart it.

See the difference?

Personal brands ask: "What should I post to get engagement?"
Movements ask: "What needs to be said, and how do I want to say it?"

Right now, the market is absolutely saturated with people following the personal branding playbook to the letter. LinkedIn is a sea of carousel posts with the same templates, the same "lessons learned" hooks, the same perfectly curated vulnerability. Everyone's doing what they've been told works.

And audiences? They're BORED. They can hear the cover version from a mile away. That perfectly timed post you agonised over for three hours? They know. That "spontaneous" video you filmed twelve takes of? They feel it. That authentic vulnerability you reverse-engineered from a viral post template? They're done with it.

But a creator who posts when they've actually got something to say? Who uses whatever format feels right for their message rather than whatever the algorithm is rewarding this week? Who breaks all the "rules" because the mission matters more than the metrics?

**That cuts through like an untuned guitar.**

The brands breaking through in 2025 aren't the ones following the playbook. They're the ones who decided "fuck the playbook, I'm doing this MY way" and built something that actually matters to them.`,
        order: 1,
        estimatedReadTime: '3-5 min',
        examples: [],
        resources: [],
      },
      {
        trackId: track12.id,
        sectionType: 'REBELLION',
        content: `Here's how we flip the script:

**Traditional Branding Says:** "Follow best practices, study what's working, model successful creators, and optimise your strategy based on analytics."

**We Say:** "Build your movement on YOUR terms. The rules are suggestions, not commandments. Your gig, your setlist."

The difference is everything. When you're building a personal brand, you're constantly checking: Am I doing this right? Is this what I'm supposed to post? Will this perform well? Am I following the formula?

It's exhausting. It's inauthentic. And it shows.

When you're building a purpose-driven movement, the question shifts: Does this advance the mission? Does this feel true? Does this need to be said? How do I want to chart this?

That's it. The algorithm's opinion is irrelevant. The guru's playbook doesn't matter. The "right way" to do it can fuck off.

Think about the difference:

**Personal Brand Approach:** "It's Tuesday at 10am, which is optimal posting time. I need to create a carousel about productivity hacks because those perform well. Even though I don't actually have anything to say about productivity today, I need to stay consistent."

**Movement Approach:** "I've got something to say about why the '5am club' is ableist bullshit that punishes neurodivergent people. I'm saying it right now, in whatever format feels right, and if it doesn't 'perform well' I don't give a shit because it needed to be said."

One is performance. One is purpose.

Here's what happens when you shift to "do what you want" energy:

- Your content becomes instantly more interesting (because YOU're actually interested in what you're saying)
- Your voice becomes distinctive (because you're not following everyone else's template)
- Your audience becomes more engaged (because they're getting the real you, not the performed you)
- Your burnout decreases (because you're not forcing content to meet arbitrary posting schedules)

**The BADASS of it is: this only works if you actually HAVE a mission worth building on your terms.**

If you're just being contrarian for the sake of it ("I post whenever I want because I'm a rebel!"), that's not a movement - that's just chaos. But if you're breaking the rules because following them would compromise your mission? That's power.`,
        order: 2,
        estimatedReadTime: '2-3 min',
        examples: [],
        resources: [],
      },
      {
        trackId: track12.id,
        sectionType: 'IMPACTFUL_ACTION',
        content: `Time to audit whether you're building a personal brand (following the rules) or a movement (your gig, your setlist).

**Look at your content from the last month and honestly answer:**

**How many of your posts were created because:**
- [ ] It was "time to post" and you needed to stay consistent
- [ ] You saw a format performing well and wanted to replicate it
- [ ] You thought "this is what my audience wants to see"
- [ ] A guru said "you should be doing X"
- [ ] The algorithm rewards this type of content

**vs how many were created because:**
- [ ] You had something you genuinely needed to say
- [ ] You wanted to chart your mission forward
- [ ] You were pissed off about something and needed to call it out
- [ ] The format felt right for YOUR message (not because it's trending)
- [ ] It was true to your voice and values, performance be damned

**If you've got more ticks in the first column, you're building a personal brand on someone else's terms.**

**Now here's the action:**

For your next piece of content, before you create it, ask yourself ONE question:

**"If nobody saw this, if it got zero engagement, if the algorithm buried it - would I still want to say this?"**

If the answer is no, don't post it. Wait until you've got something that passes that test.

If the answer is yes, create it however YOU want. Wrong format? Don't care. Wrong time? Irrelevant. Breaks the rules? Good.

**Post it. See how it feels. Notice the difference between creating on YOUR terms vs the platform's terms.**`,
        order: 3,
        estimatedReadTime: 'One clear action',
        examples: [],
        resources: [],
      },
      {
        trackId: track12.id,
        sectionType: 'ENCORE',
        content: `After you've audited your content and created something on your terms:

1. What percentage of your content is "have to" vs "want to"? (If it's more than 50% "have to", what would change if you only posted when you had something to say?)

2. What rules are you following that you don't actually believe in? (Daily posting? Specific formats? Certain topics? List them.)

3. If you gave yourself complete permission to build your brand YOUR way, what would you do differently? (Be specific. What would you stop? Start? Change?)

4. What are you afraid will happen if you stop following the playbook? (Loss of growth? Looking unprofessional? Missing opportunities? Name the fear.)

**Bring these reflections to SUPERNova and we'll figure out what rules you need to break to build a movement that's actually yours.**`,
        order: 4,
        estimatedReadTime: 'Reflection prompts',
        examples: [],
        resources: [],
      },
      {
        trackId: track12.id,
        sectionType: 'BACKSTAGE_PASS',
        content: `**Movement vs Personal Brand in Action:**

- **Personal Brand:** Posts at optimal times using trending formats to maximize engagement and build audience
- **Movement:** Posts when there's something worth saying, in whatever format serves the message, engagement be damned. Your gig, your setlist.

**Real Examples:**

- Look at how the most authentic voices in your industry show up. Are they following the playbook or doing their own thing? The ones who feel REAL are usually the ones breaking the rules.

- Simon Sinek built his entire brand on "Start With Why" - a mission, not a posting strategy. He didn't follow the LinkedIn carousel playbook. He talked about what mattered to him and the format followed the message.

**Key Insight:**

The personal brand creators who shifted from "what should I post?" to "what do I want to say?" reported feeling more energised, more authentic, and ironically - better engagement from a smaller but more committed audience of raving fans.

**Remember:** You can follow the playbook and build an audience asleep at the rail. Or you can do what you want and build a movement of die-hard groupies. Pick one.

**Next Track:** Now that you know you get to build this YOUR way, Track 1.3 will show you why NOW is the time to stop playing by the old rules.`,
        order: 5,
        estimatedReadTime: 'Resources & Examples',
        examples: [
          'Simon Sinek - Start With Why as mission-driven approach',
          'Authentic voices breaking playbook rules',
        ],
        resources: [
          'Research: Personal brand creators shifting to mission-first approach',
        ],
      },
    ],
  })

  console.log(`    ✅ Created 5 sections for Track 1.2`)

  // Track 1.3: THESE TIMES ARE CHANGING
  const track13 = await prisma.track.create({
    data: {
      albumId: album1.id,
      title: 'THESE TIMES ARE CHANGING',
      subtitle: 'Go Mainstream - Go Home! (Play the B-side)',
      songTitle: 'These Times are Changing',
      order: 3,
      estimatedReadTime: '15 min',
      objectives: [
        'Understand the breakthrough moment we\'re in',
        'Pick your battle NOW, not later',
        'Claim your rebellion publicly',
      ],
      tags: ['timing', 'opportunity', 'revolution', 'boldness'],
    },
  })

  console.log(`  ✅ Created Track 1.3: ${track13.title}`)

  await prisma.section.createMany({
    data: [
      {
        trackId: track13.id,
        sectionType: 'TRUTH_BOMB',
        content: `Let me guess - you've been told to "stay in your lane", "don't be too controversial", "keep it professional", "build your audience first, THEN share your opinions".

That advice worked in 2015. Maybe even 2020. But in 2025? It's actively working against you.

**These times are changing. And if you're not changing with them, you're getting left behind.**

Here's what's actually happening right now: trust in traditional media is at record lows. Only 31% of people trust mass media. Corporate brands are losing credibility. Polished, perfect, "professional" content is being ignored. The personal branding playbook that worked five years ago is now producing thousands of identical, forgettable clones.

And audiences? They're leaving the venue.

They're tired of manufactured authenticity. They're exhausted by hustle culture. They're done with gurus selling them dreams. They're sick of being sold to by brands that pretend to care about them but are really just optimising for conversions.

**The revolution is already happening. The question is: are you going to join it or keep playing by the old rules?**

Truth is, if you're still trying to build a "professional" personal brand that doesn't offend anyone, stays neutral on everything, and focuses on being palatable to the masses, you're already obsolete. That set's finished. And the encore's done.

The brands cutting through right now? They've picked a side. They've chosen their battle. They've decided what they're FOR and what they're AGAINST - and they're not apologising for it.

They're not waiting to "build an audience first". They're not softening their message to appeal to more people. They're not playing it safe.

They're starting with their rebellion and letting their tribe find them.

**This is the breakthrough moment.** The market is saturated with personal brands but starving for purpose-driven voices. The window is open RIGHT NOW for people willing to be bold, pick their battle, and lead with it.

But that window won't stay open forever. As more people catch on, as the "purpose-driven" approach becomes the new playbook, it'll get harder to cut through. Right now, you can still be early. You can still be brave. You can still be FIRST in your space with your rebellion.

**But only if you stop waiting for permission and pick your fucking battle.**`,
        order: 1,
        estimatedReadTime: '3-5 min',
        examples: [],
        resources: [],
      },
      {
        trackId: track13.id,
        sectionType: 'REBELLION',
        content: `Here's how times are changing:

**Old Rules (2015-2020):**
- Build your audience first, opinions later
- Stay neutral to appeal to everyone
- Professional = polished and perfect
- Focus on your credentials and expertise
- Don't alienate potential customers

**New Rules (2025):**
- Lead with your rebellion, let your tribe find you
- Pick a side or be invisible
- Professional = real and raw
- Focus on your mission and your battle
- DELIBERATELY alienate the wrong people

The brands winning in 2025 aren't following the old playbook. They're writing a new one. And the core principle of that new playbook is simple:

**Identify what's broken. Pick your battle. Rally your tribe. Fight.**

Not later. Not "once you've built your platform". Not "when you're more established". NOW.

Hard truth time: the outliers who are brave enough to lead with their rebellion RIGHT NOW are becoming the obvious choice for people tired of the mainstream bullshit. They're not competing with other brands - they're incomparable. They're not "better" - they're the ONLY option for their people.

Think about your own behaviour. When you discover a brand that's saying what you've been thinking but haven't seen anyone else articulate - that calls out the bullshit you're tired of, that challenges the Status Quo (yes, the pun is intended) you've been quietly resenting - don't you feel like you've found your people?

That's what happens when you pick your battle NOW instead of waiting.

**The old approach said "build slowly and carefully". The new reality demands "plant your flag and defend it".**

And if you're thinking "but I'm not ready" or "I need more experience first" or "I should wait until I'm more established" - that's your old conditioning talking. That's the voice that kept you playing small under the old rules.

These times are changing. Change with them or get left behind.`,
        order: 2,
        estimatedReadTime: '2-3 min',
        examples: [],
        resources: [],
      },
      {
        trackId: track13.id,
        sectionType: 'IMPACTFUL_ACTION',
        content: `Time to identify YOUR battle and claim it - today, not someday.

**Answer these questions with brutal honesty:**

1. **What's the one thing in your industry that makes you genuinely angry?**
   (Not mildly annoyed - what actually fires you up?)

2. **What advice do "successful" people in your field give that you think is actively harmful?**
   (What are they getting wrong that's keeping your ideal clients stuck?)

3. **If you could change ONE thing about your industry tomorrow, what would it be?**
   (This is your battle.)

4. **Who benefits from keeping things the way they are?**
   (This is your enemy - even if it's not a person, it's a system, a belief, an approach.)

Now complete this statement:

**"The [industry/approach/belief] wants you to [old way]. I'm building a [your thing] for people ready to [new way] instead."**

For example:
- "The business coaching industry wants you to believe you need to invest £10k+ in masterminds and hustle 24/7 to succeed. I'm building an AI platform for people ready to get expert strategy for £26/month and build businesses that fit their actual lives."

- "The personal branding world wants you to follow their templated playbook and become another identical clone. I'm building a movement for people ready to burn the playbook and build brands that sound exactly like them."

**Write yours. Post it TODAY. Not next week. Not when you've "refined" it. Today.**

Because these times are changing, and the people who move NOW are the ones who'll be leading the revolution, not following it.`,
        order: 3,
        estimatedReadTime: 'One clear action',
        examples: [],
        resources: [],
      },
      {
        trackId: track13.id,
        sectionType: 'ENCORE',
        content: `After you've identified your battle and claimed it publicly:

1. What stopped you from saying this before now? (Fear of judgment? Waiting for permission? Imposter syndrome? Name it.)

2. If you'd claimed this battle a year ago, where would you be now? (This isn't about regret - it's about understanding the cost of waiting.)

3. What would it mean to FULLY commit to this battle for the next 12 months? (What would you have to say no to? What would you have to stand firm on?)

4. Are you more afraid of being too bold or being forgotten? (Be honest. Because those are your only two options.)

**Bring these reflections to SUPERNova and we'll make sure you're fighting the right battle at the right time.**`,
        order: 4,
        estimatedReadTime: 'Reflection prompts',
        examples: [],
        resources: [],
      },
      {
        trackId: track13.id,
        sectionType: 'BACKSTAGE_PASS',
        content: `**Why NOW Is the Time:**

- Trust in traditional media and corporate brands is at historic lows - audiences are actively looking for authentic alternatives
- The personal brand market is oversaturated but the purpose-driven movement space is wide open
- Early movers in the "lead with rebellion" approach are becoming category leaders in their niches
- The window for being FIRST with your specific rebellion in your specific market is open NOW

**The Breakthrough Moment:**

We're at a tipping point where "authenticity" has become so manufactured it's lost meaning, and audiences are hungry for voices who actually stand for something. The brands that claim their battles NOW will own their categories. The ones who wait will be playing catch-up.

**Historical Context:**

Every major shift in personal branding has had a breakthrough moment where early movers won big:
- Blogging (early 2000s)
- Social media (late 2000s)
- Video content (mid 2010s)
- Purpose-driven movements (RIGHT NOW)

**Don't wait for this to become the new playbook. Be the one writing it.**

**Next Track:** You've found your rebel yell, committed to doing it your way, and picked your battle. Now Track 1.4 will show you how to make your rebellion unmissable.`,
        order: 5,
        estimatedReadTime: 'Resources & Examples',
        examples: [
          'Trust in media at record lows - 31% trust mass media',
          'Purpose-driven movements as the current breakthrough moment',
        ],
        resources: [
          'Media trust statistics 2025',
          'Historical branding shift patterns',
        ],
      },
    ],
  })

  console.log(`    ✅ Created 5 sections for Track 1.3`)

  // Track 1.4: ONE NIGHT ONLY
  const track14 = await prisma.track.create({
    data: {
      albumId: album1.id,
      title: 'ONE NIGHT ONLY',
      subtitle: "The Outlier's Edge - BE THE VARIANT",
      songTitle: 'One Night Only',
      order: 4,
      estimatedReadTime: '15 min',
      objectives: [
        'Embrace radical specificity over broad positioning',
        'Become unmissable, not just better',
        'Craft your variant position statement',
      ],
      tags: ['positioning', 'specificity', 'differentiation', 'variant'],
    },
  })

  console.log(`  ✅ Created Track 1.4: ${track14.title}`)

  await prisma.section.createMany({
    data: [
      {
        trackId: track14.id,
        sectionType: 'TRUTH_BOMB',
        content: `You know that moment when you meet someone at a networking event and they rattle off their entire LinkedIn profile like a human business card? "I'm a business coach, marketing strategist, podcast host, author, speaker, and consultant specialising in digital transformation, personal branding, leadership development, and..."

By the time they finish, you've forgotten everything except maybe the one weird detail that stood out. Maybe they mentioned they're also a beekeeper. That's the bit you remember.

Here's the harsh reality: **you've got one shot to make an impression. ONE NIGHT ONLY.** What are people going to remember about you?

Because in a world drowning in content, information, and personal brands, people can barely remember ONE thing about you, let alone ten. If you try to be known for everything, you'll be known for nothing.

But here's where it gets interesting: the outlier's edge isn't about being better - it's about being UNMISSABLE. **It's about being THE VARIANT.**

Think about the brands that stick in your head. They're not the ones with the most complete service offering or the longest list of credentials. They're the ones with a clear, bold, unmissable position that makes you think "oh THAT person" the second their name comes up.

- "Oh that's the woman who builds AI platforms for midlife entrepreneurs"
- "Oh that's the guy who teaches introverts to build personal brands"
- "Oh that's the coach who only works with recovering perfectionists"

ONE clear thing. Not ten things. ONE.

The problem? Most people are terrified of being "too niche" or "limiting their opportunities" so they try to keep their positioning broad enough to appeal to everyone. And in doing so, they appeal to no one.

The outliers - the variants - who are winning right now have done the opposite. They've gone so specific, so focused, so unapologetically narrow that they've become the ONLY choice for their people.

**The BADASS of it is: when you own one clear position, you become memorable. When you're memorable, you get talked about. When you get talked about, opportunities find YOU.**

You don't need to be everything to everyone. You need to be UNMISSABLE to someone. **You need to BE THE VARIANT.**`,
        order: 1,
        estimatedReadTime: '3-5 min',
        examples: [],
        resources: [],
      },
      {
        trackId: track14.id,
        sectionType: 'REBELLION',
        content: `Here's how we flip the script:

**Traditional Branding Says:** "Don't niche down too much - you'll limit your market and miss opportunities."

**We Say:** "Unique is better than better. Go so specific you become unforgettable. BE THE VARIANT."

The outlier approach means embracing radical specificity. Not because you're actually limiting yourself (you can expand later once you're known for something), but because being unmissable beats being comprehensive every single time.

Think about it: would you rather be one of ten thousand "business coaches for women entrepreneurs" or the ONLY "AI platform for midlife neurodivergent entrepreneurs building businesses their way"?

One is forgettable. One is a movement.

Here's what happens when you embrace your variant status:

**You stop competing.** When you're the only person doing exactly what you do, for exactly who you serve, in exactly the way you do it - there's no competition. You're not "better than" anyone else. You're incomparable.

**You attract die-hard groupies, not shoppers.** People don't find you because they're comparing options. They find you because you're the ONLY option that makes sense for them.

**You become referable.** "I know someone perfect for you" only works when that someone has a clear, memorable position. Nobody says "I know a great business coach" and expects that to be helpful. But "I know someone who builds AI tools specifically for midlife entrepreneurs with ADHD"? That's a referral that lands.

**You give yourself permission to say no.** When you're trying to appeal to everyone, you take on clients who aren't quite right because you're afraid of missing opportunities. When you own your variant position, you get to be selective.

The traditional approach says cast a wide net. We say become a laser beam. **BE THE VARIANT.**`,
        order: 2,
        estimatedReadTime: '2-3 min',
        examples: [],
        resources: [],
      },
      {
        trackId: track14.id,
        sectionType: 'IMPACTFUL_ACTION',
        content: `Time to claim your variant position.

**Answer these three questions:**

1. **What's the ONE thing you want to be known for?**
   (Not three things. Not "well, I do several things". ONE. If someone could only remember one sentence about you, what would it be?)

2. **Who is this specifically NOT for?**
   (Seriously. Who are you willing to exclude? If the answer is "everyone can benefit", you haven't niched enough.)

3. **What makes your approach incomparable?**
   (Not "better" - DIFFERENT. What do you do that literally nobody else does, in the way you do it, for the people you do it for?)

Now craft your **Variant Position Statement:**

**"I'm the [only/first] [specific person] who [specific thing] for [specific audience] who [specific problem/belief]."**

Examples:
- "I'm the only tech entrepreneur building a £26/month AI business platform specifically for midlife neurodivergent women who refuse to play by neurotypical business rules."

- "I'm the only brand strategist who works exclusively with recovering people-pleasers to build brands that repel the wrong clients."

**Write yours. Test it. Does it make you slightly uncomfortable? Good. Does it immediately exclude some people? Even better. Is it so specific that someone hearing it once will remember it? Perfect.**

Now put it EVERYWHERE. LinkedIn headline. Instagram bio. About page. Email signature. First line of every introduction.

**Own it. BE THE VARIANT. You've got one shot. Make it count.**`,
        order: 3,
        estimatedReadTime: 'One clear action',
        examples: [],
        resources: [],
      },
      {
        trackId: track14.id,
        sectionType: 'ENCORE',
        content: `After you've written your Variant Position Statement:

1. Does this feel too narrow? (Sit with that discomfort. What opportunities are you afraid you'll miss by going this specific?)

2. If you committed to THIS position for the next 12 months, what would change about your content, your offers, your audience?

3. What would you have to say NO to in order to protect this position? (Client projects, collaboration offers, speaking opportunities that don't align?)

4. If you became THE person known for this one thing, would that actually excite you? Or are you trying to be known for something you think you SHOULD want rather than what you actually want?

**Bring these reflections to SUPERNova. We'll dig into whether your variant position is truly aligned or whether you're still trying to please someone else's expectations.**`,
        order: 4,
        estimatedReadTime: 'Reflection prompts',
        examples: [],
        resources: [],
      },
      {
        trackId: track14.id,
        sectionType: 'BACKSTAGE_PASS',
        content: `**The Variant's Edge in Action:**

- Goldie Chan became known for ONE thing: creating 800+ consecutive daily videos on LinkedIn as an introvert. That radical specificity made her unmissable and built her entire brand.

- Brands that position as variants (the anti-establishment alternative to the mainstream) consistently outperform "better" competitors because they're incomparable, not better.

**Key Principle: Radical Specificity**

In a world drowning in information, people can remember one thing about you - maybe. Choose what that one thing is, or the market will choose for you (and it probably won't be the thing you want).

**The One-Shot Test:**

If someone meets you at an event and only remembers ONE thing about you, what would you want it to be? That's your variant position. Everything else is supporting detail.

**Remember:** Broad positioning = forgettable. Radical specificity = unmissable. **BE THE VARIANT.**`,
        order: 5,
        estimatedReadTime: 'Resources & Examples',
        examples: [
          'Goldie Chan - 800+ consecutive daily LinkedIn videos as introvert',
          'Anti-establishment variants outperforming competitors',
        ],
        resources: [
          'Radical specificity research',
          'Variant positioning case studies',
        ],
      },
    ],
  })

  console.log(`    ✅ Created 5 sections for Track 1.4`)

  console.log('\n🎸 Album 1 seeding complete!')
  console.log(`   Album: ${album1.title}`)
  console.log(`   Tracks: 4`)
  console.log(`   Total Sections: 20`)
}

async function main() {
  try {
    await seedAlbum1()
  } catch (error) {
    console.error('Error seeding Album 1:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
