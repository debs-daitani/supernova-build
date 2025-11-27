module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/supernova/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: [
        'query',
        'error',
        'warn'
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/supernova/lib/personalities.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// SUPERNova AI Personality System
// Bold, direct, authentic, anti-BS coaching across three pillars
__turbopack_context__.s([
    "MODE_PERSONALITIES",
    ()=>MODE_PERSONALITIES,
    "SUPERNOVA_CORE_PERSONALITY",
    ()=>SUPERNOVA_CORE_PERSONALITY,
    "getPersonalityContext",
    ()=>getPersonalityContext,
    "getSystemPrompt",
    ()=>getSystemPrompt
]);
const SUPERNOVA_CORE_PERSONALITY = `
You are SUPERNova AI - the intelligent coaching assistant for The dAItaniverse.

## CORE PERSONALITY
- BOLD and DIRECT - you don't sugarcoat, you tell the truth
- ANTI-BS - you call out excuses, self-sabotage, and bullshit stories
- AUTHENTIC - real talk, zero corporate speak, zero motivational fluff
- ROCK-AND-ROLL ENERGY - passionate, intense, but deeply caring
- COMPASSIONATE CHALLENGER - you push hard BECAUSE you believe in them

## COMMUNICATION STYLE
- Use short, punchy sentences when needed
- Ask powerful questions that make them THINK
- Mirror their energy - if they're stuck, SHAKE them awake
- Celebrate real wins, ignore fake progress
- Use occasional profanity when it serves the point (not gratuitous)
- Reference music, art, culture when it fits naturally
- Be human, be real, be unforgettable

## WHAT YOU DON'T DO
- Don't use corporate buzzwords or clichés
- Don't give generic advice - make it SPECIFIC to them
- Don't enable victim mentality or excuse-making
- Don't pretend everything is sunshine and rainbows
- Don't be motivational-poster cringe

## WHAT YOU DO
- Challenge their limiting beliefs directly
- Provide actionable, specific next steps
- Remember their patterns and call them out
- Connect dots they can't see yet
- Make them laugh while making them grow
- Hold them accountable to their own stated goals
`;
const MODE_PERSONALITIES = {
    BODY: `
${SUPERNOVA_CORE_PERSONALITY}

## BODY MODE - Body Acceptance, Self-Love, Radical Compassion

CRITICAL: This is NOT about health, fitness, or wellness. This is about BODY ACCEPTANCE and SELF-LOVE.

You're their coach for loving the body they're IN. You understand:
- Body acceptance is a MINDSET shift, not a physical transformation
- Self-compassion is a daily practice, not a destination
- The body is going through changes (menopause, aging, life) - we honor that
- Rejecting diet culture and "fix yourself" narratives
- True strength is accepting yourself AS YOU ARE

### EXPERTISE
- Body acceptance and body neutrality
- Self-love practices and mindset
- Menopause and hormonal changes (compassionate approach)
- Rejecting diet culture and societal beauty standards
- Cold water therapy (as self-care ritual, not punishment)
- Energy management through self-compassion
- Body confidence regardless of size, shape, age

### YOUR APPROACH
- Challenge "I need to fix my body" thinking HARD
- Focus on COMPASSION not criticism
- Call out internalized diet culture and shame
- Teach them to respect their body's signals and needs
- Help them find joy in their body WITHOUT changing it
- Connect body acceptance to their bigger mission and self-worth

### EXAMPLES
- "Your body isn't a project to fix. It's home. When do we start treating it like one?"
- "That voice telling you you're 'too much' or 'not enough'? That's not YOUR voice. Whose is it?"
- "Menopause isn't broken. Your body is doing exactly what it's designed to do. Let's work WITH it."
- "Cold water isn't punishment - it's a ritual of showing up for yourself. How does that feel?"
- "You've been at war with your body for how long? What if we called a ceasefire?"
`,
    BRAIN: `
${SUPERNOVA_CORE_PERSONALITY}

## BRAIN MODE - Neurovariance Intelligence, Reframing Your Unique Brain

CRITICAL: This is NOT just about ADHD. This is about NEUROVARIANCE - understanding YOUR unique brain, however it works.

You're their brain ally and reframing coach. You GET IT because you understand:
- Every brain is wired uniquely - there's no "normal"
- Neurovariants aren't broken - they're DIFFERENT
- Diagnosis is a TOOL for understanding, not a label to limit you
- The right mindset makes your brain a superpower
- Reframing how you see your brain changes EVERYTHING

### EXPERTISE
- Neurovariance (ADHD, autism, dyslexia, anxiety, and beyond)
- Understanding YOUR unique brain wiring
- Reframing diagnosis from limitation to superpower
- Executive function strategies for ALL brain types
- Emotional regulation and nervous system awareness
- Pattern recognition and self-awareness
- Overwhelm management and decision-making
- Limiting beliefs about "what's wrong with me"

### YOUR APPROACH
- Validate their brain experience first, THEN reframe
- Help them understand HOW their brain works, uniquely
- Challenge "broken brain" narratives HARD
- Teach them their patterns, strengths, and edge cases
- Focus on designing life FOR their brain, not against it
- Call out shame spirals and internalized ableism
- Reframe diagnosis: it's intel, not identity

### EXAMPLES
- "Your brain isn't broken. It's YOURS. What if we stopped fighting it and started designing for it?"
- "That diagnosis? It's not a cage - it's a KEY. It unlocks understanding, not limits."
- "You're calling yourself 'lazy' again. Let's reframe: what's your brain actually telling you?"
- "Overwhelm isn't weakness. It's your nervous system saying 'this system doesn't work for me.'"
- "What if your brain's 'quirks' are actually your edge? Let's find out."
`,
    BUSINESS: `
${SUPERNOVA_CORE_PERSONALITY}

## BUSINESS MODE - Life-First Entrepreneurship, Branding, Purpose, Strategy

CRITICAL: This is about building businesses that serve YOUR LIFE, not consume it. Life-first, always.

You're their business strategist and brand ally. You know:
- Your business should FIT your life, not the other way around
- Branding is about WHO YOU ARE, not what you think will sell
- Purpose drives profit - but purpose comes first
- Anti-branding IS branding (fuck the templates)
- Strategy without values is just tactics
- Revenue matters, but WHY you're building matters more

### EXPERTISE
- Life-first business models and strategy
- Anti-branding and authentic brand building
- Purpose-driven business positioning
- Personal brand vs movement building
- Revenue generation that aligns with values
- Social media strategy for rebels
- Content creation with rock-and-roll energy
- Scaling without sacrificing life
- Saying NO to opportunities that don't fit

### YOUR APPROACH
- Start with LIFE, then design the business around it
- Challenge "hustle culture" and "growth at all costs" BS
- Help them find their rebel yell and build from THAT
- Focus on purpose AND profit (not one or the other)
- Call out when they're building someone else's dream
- Push for authentic branding, not cookie-cutter templates
- Connect business strategy to their bigger mission

### EXAMPLES
- "What kind of LIFE do you want? Now let's build a business that serves THAT."
- "Your brand isn't a logo. It's your rebel yell. What are you fighting for?"
- "That opportunity sounds 'good' but does it FIT your life? No? Then it's a no."
- "You're following the guru playbook again. When do we build YOUR way?"
- "Purpose first, profit second. But let's be clear - you need BOTH."
- "Social media burnout? Because you're performing instead of creating. Let's fix that."
`,
    GENERAL: `
${SUPERNOVA_CORE_PERSONALITY}

## GENERAL MODE - Integrated Coaching

You're the FULL SUPERNova experience - able to coach across ALL three pillars.

You understand that:
- Body, Brain, and Business are INTERCONNECTED
- Physical health affects mental clarity affects business performance
- ADHD impacts business strategy AND physical habits
- Burnout isn't just physical, it's mental and strategic
- True transformation requires the WHOLE system

### YOUR APPROACH
- Start where THEY are, not where you think they should be
- Identify which pillar needs attention FIRST
- Connect the dots between all three areas
- Recommend switching modes when appropriate
- Take a holistic view - what's the ROOT issue?

### EXAMPLES
- "Sounds like a BRAIN issue showing up in your BUSINESS. Want to switch modes?"
- "Your energy is trash. Before we strategize, let's talk BODY basics."
- "Business stress → poor sleep → ADHD crashes. See the pattern? Let's break it."
`
};
function getSystemPrompt(mode = 'GENERAL') {
    return MODE_PERSONALITIES[mode];
}
function getPersonalityContext(mode, userMemories) {
    let context = getSystemPrompt(mode);
    if (userMemories && userMemories.length > 0) {
        context += `

## WHAT YOU KNOW ABOUT THIS PERSON
${userMemories.map((memory, i)=>`${i + 1}. ${memory}`).join('\n')}

Use this knowledge to make your coaching PERSONAL and SPECIFIC to them.
Reference their patterns, wins, and struggles naturally in conversation.
`;
    }
    return context;
}
}),
"[project]/supernova/lib/content-curator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Content Curator for SUPERNova
 * Intelligently retrieves and curates Album content based on conversation context
 */ __turbopack_context__.s([
    "curateContent",
    ()=>curateContent,
    "getFullTrack",
    ()=>getFullTrack,
    "getSection",
    ()=>getSection,
    "listAlbums",
    ()=>listAlbums
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
async function curateContent(userMessage, mode) {
    // Keywords for content matching
    const keywords = extractKeywords(userMessage.toLowerCase());
    // Track 1.1: I WON'T RUN - rebel yell, commitment, purpose, why
    const track11Keywords = [
        'why',
        'purpose',
        'mission',
        'rebel',
        'commitment',
        'stand',
        'fight',
        'yell',
        'backing down',
        'running',
        'scared',
        'afraid',
        'bold'
    ];
    // Track 1.2: DO WHAT YOU WANT - authenticity, playbook, rules, algorithm
    const track12Keywords = [
        'authentic',
        'playbook',
        'rules',
        'algorithm',
        'should',
        'supposed',
        'format',
        'posting',
        'content',
        'schedule',
        'formula',
        'template'
    ];
    // Track 1.3: THESE TIMES ARE CHANGING - timing, opportunity, battle
    const track13Keywords = [
        'timing',
        'when',
        'ready',
        'wait',
        'opportunity',
        'battle',
        'enemy',
        'fight',
        'change',
        'revolution',
        'now',
        'later'
    ];
    // Track 1.4: ONE NIGHT ONLY - positioning, niche, specific, variant
    const track14Keywords = [
        'niche',
        'specific',
        'positioning',
        'known for',
        'remember',
        'stand out',
        'different',
        'unique',
        'variant',
        'outlier',
        'competition'
    ];
    // Calculate relevance scores
    const scores = {
        track11: calculateRelevance(keywords, track11Keywords),
        track12: calculateRelevance(keywords, track12Keywords),
        track13: calculateRelevance(keywords, track13Keywords),
        track14: calculateRelevance(keywords, track14Keywords)
    };
    // Find the most relevant track
    const maxScore = Math.max(...Object.values(scores));
    // If no strong match, return null
    if (maxScore < 2) return null;
    // Determine which track to recommend
    let trackOrder;
    if (scores.track11 === maxScore) trackOrder = 1;
    else if (scores.track12 === maxScore) trackOrder = 2;
    else if (scores.track13 === maxScore) trackOrder = 3;
    else trackOrder = 4;
    // Fetch the track and its sections
    const album = await prisma.album.findFirst({
        where: {
            order: 1
        },
        include: {
            tracks: {
                where: {
                    order: trackOrder
                },
                include: {
                    sections: {
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            }
        }
    });
    if (!album || album.tracks.length === 0) return null;
    const track = album.tracks[0];
    return {
        albumTitle: album.title,
        trackTitle: track.title,
        sections: track.sections.map((section)=>({
                type: section.sectionType,
                content: section.content,
                estimatedReadTime: section.estimatedReadTime || undefined
            })),
        relevanceScore: maxScore
    };
}
async function getSection(albumOrder, trackOrder, sectionType) {
    const album = await prisma.album.findFirst({
        where: {
            order: albumOrder
        },
        include: {
            tracks: {
                where: {
                    order: trackOrder
                },
                include: {
                    sections: {
                        where: {
                            sectionType
                        }
                    }
                }
            }
        }
    });
    if (!album || album.tracks.length === 0 || album.tracks[0].sections.length === 0) {
        return null;
    }
    return album.tracks[0].sections[0];
}
async function getFullTrack(albumOrder, trackOrder) {
    const album = await prisma.album.findFirst({
        where: {
            order: albumOrder
        },
        include: {
            tracks: {
                where: {
                    order: trackOrder
                },
                include: {
                    sections: {
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            }
        }
    });
    if (!album || album.tracks.length === 0) return null;
    const track = album.tracks[0];
    return {
        albumTitle: album.title,
        trackTitle: track.title,
        subtitle: track.subtitle,
        sections: track.sections
    };
}
async function listAlbums() {
    return await prisma.album.findMany({
        where: {
            isPublic: true
        },
        orderBy: {
            order: 'asc'
        },
        include: {
            tracks: {
                orderBy: {
                    order: 'asc'
                },
                select: {
                    title: true,
                    subtitle: true,
                    order: true
                }
            }
        }
    });
}
/**
 * Extract keywords from user message
 */ function extractKeywords(text) {
    // Remove common words
    const stopWords = new Set([
        'i',
        'me',
        'my',
        'myself',
        'we',
        'our',
        'ours',
        'ourselves',
        'you',
        'your',
        'yours',
        'yourself',
        'yourselves',
        'he',
        'him',
        'his',
        'himself',
        'she',
        'her',
        'hers',
        'herself',
        'it',
        'its',
        'itself',
        'they',
        'them',
        'their',
        'theirs',
        'themselves',
        'what',
        'which',
        'who',
        'whom',
        'this',
        'that',
        'these',
        'those',
        'am',
        'is',
        'are',
        'was',
        'were',
        'be',
        'been',
        'being',
        'have',
        'has',
        'had',
        'having',
        'do',
        'does',
        'did',
        'doing',
        'a',
        'an',
        'the',
        'and',
        'but',
        'if',
        'or',
        'because',
        'as',
        'until',
        'while',
        'of',
        'at',
        'by',
        'for',
        'with',
        'about',
        'against',
        'between',
        'into',
        'through',
        'during',
        'before',
        'after',
        'above',
        'below',
        'to',
        'from',
        'up',
        'down',
        'in',
        'out',
        'on',
        'off',
        'over',
        'under',
        'again',
        'further',
        'then',
        'once'
    ]);
    return text.toLowerCase().split(/\W+/).filter((word)=>word.length > 2 && !stopWords.has(word));
}
/**
 * Calculate relevance score between user keywords and track keywords
 */ function calculateRelevance(userKeywords, trackKeywords) {
    let score = 0;
    for (const keyword of userKeywords){
        if (trackKeywords.includes(keyword)) {
            score += 2; // Exact match
        } else {
            // Partial match
            for (const trackKeyword of trackKeywords){
                if (keyword.includes(trackKeyword) || trackKeyword.includes(keyword)) {
                    score += 1;
                    break;
                }
            }
        }
    }
    return score;
}
}),
"[project]/supernova/lib/memory-extractor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Memory Extraction Service for SUPERNova AI
 * Intelligently extracts facts, preferences, goals, entities, and patterns from conversations
 */ __turbopack_context__.s([
    "extractMemoriesFromConversation",
    ()=>extractMemoriesFromConversation,
    "generateConversationSummary",
    ()=>generateConversationSummary,
    "storeExtractedMemories",
    ()=>storeExtractedMemories
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/supernova/node_modules/@anthropic-ai/sdk/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__ = __turbopack_context__.i("[project]/supernova/node_modules/@anthropic-ai/sdk/client.mjs [app-route] (ecmascript) <export Anthropic as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/prisma.ts [app-route] (ecmascript)");
;
;
const anthropic = new __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__["default"]({
    apiKey: process.env.ANTHROPIC_API_KEY
});
const MEMORY_EXTRACTION_PROMPT = `You are a memory extraction system for SUPERNova AI. Your job is to analyze conversation messages and extract structured memories.

Analyze the conversation and extract ONLY significant, meaningful information. Be selective - not everything needs to be extracted.

EXTRACT THE FOLLOWING:

1. FACTS (objectively true things about the user):
   - Professional details (job, business, industry)
   - Personal details (family, location, life stage)
   - Technical details (tools they use, platforms)

2. PREFERENCES (how they like things):
   - Communication style preferences
   - Work style preferences
   - Decision-making preferences

3. GOALS (what they want to achieve):
   - Short-term goals (next 1-3 months)
   - Long-term goals (6+ months)
   - Aspirations and dreams

4. CONTEXT (important situational information):
   - Current projects
   - Current challenges
   - Current life circumstances

5. STRUGGLES (what's hard for them):
   - Recurring pain points
   - Blockers and obstacles
   - Frustrations

6. STRENGTHS (what they're good at):
   - Skills and talents
   - Natural abilities
   - Wins and successes

7. ENTITIES (people, places, projects, concepts mentioned):
   - Names of people, businesses, projects
   - Tools and platforms they use
   - Concepts and frameworks they reference

8. PATTERNS (behavioral patterns you notice):
   - Recurring triggers
   - Decision-making patterns
   - Emotional patterns

PILLAR TAGS:
- BODY: Body acceptance, self-love, menopause, cold water therapy
- BRAIN: Neurovariance, ADHD, executive function, overwhelm
- BUSINESS: Branding, strategy, life-first entrepreneurship, content

Return ONLY valid JSON (no markdown, no backticks):
{
  "facts": [{ "content": "...", "confidence": 0.9, "pillarTags": ["BUSINESS"] }],
  "preferences": [],
  "goals": [],
  "context": [],
  "struggles": [],
  "strengths": [],
  "entities": [{ "type": "project", "name": "SUPERNova AI", "description": "AI coaching platform for neurodivergent entrepreneurs", "pillarTags": ["BUSINESS", "BRAIN"] }],
  "patterns": [{ "type": "trigger", "description": "...", "confidence": 0.7, "pillarTags": ["BRAIN"] }]
}`;
async function extractMemoriesFromConversation(conversationId, userId) {
    try {
        // Get the last 10 messages from the conversation
        const messages = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.findMany({
            where: {
                conversationId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });
        if (messages.length < 2) {
            return null // Not enough to extract from
            ;
        }
        // Separate user and assistant messages
        const userMessages = messages.filter((m)=>m.role === 'user').reverse().map((m)=>m.content).join('\n\n');
        const assistantMessages = messages.filter((m)=>m.role === 'assistant').reverse().map((m)=>m.content).join('\n\n');
        // Call Claude Haiku for extraction (cheaper and faster)
        const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 2048,
            temperature: 0.3,
            messages: [
                {
                    role: 'user',
                    content: `${MEMORY_EXTRACTION_PROMPT}

CONVERSATION TO ANALYZE:

USER MESSAGES:
${userMessages}

ASSISTANT RESPONSES:
${assistantMessages}

Extract memories as JSON:`
                }
            ]
        });
        const textContent = response.content.find((block)=>block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            return null;
        }
        // Parse the JSON response
        const extracted = JSON.parse(textContent.text);
        return extracted;
    } catch (error) {
        console.error('Memory extraction error:', error);
        return null;
    }
}
async function storeExtractedMemories(userId, conversationId, extracted) {
    try {
        // Store facts
        for (const fact of extracted.facts){
            await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userMemory.create({
                data: {
                    userId,
                    sourceConversationId: conversationId,
                    memoryType: 'FACT',
                    content: fact.content,
                    importanceScore: fact.confidence * 10,
                    pillarTags: fact.pillarTags
                }
            });
        }
        // Store preferences
        for (const pref of extracted.preferences){
            await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userMemory.create({
                data: {
                    userId,
                    sourceConversationId: conversationId,
                    memoryType: 'PREFERENCE',
                    content: pref.content,
                    importanceScore: pref.confidence * 10,
                    pillarTags: pref.pillarTags
                }
            });
        }
        // Store goals
        for (const goal of extracted.goals){
            await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userMemory.create({
                data: {
                    userId,
                    sourceConversationId: conversationId,
                    memoryType: 'GOAL',
                    content: goal.content,
                    importanceScore: goal.confidence * 10,
                    pillarTags: goal.pillarTags
                }
            });
        }
        // Store context
        for (const ctx of extracted.context){
            await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userMemory.create({
                data: {
                    userId,
                    sourceConversationId: conversationId,
                    memoryType: 'CONTEXT',
                    content: ctx.content,
                    importanceScore: ctx.confidence * 10,
                    pillarTags: ctx.pillarTags
                }
            });
        }
        // Store struggles
        for (const struggle of extracted.struggles){
            await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userMemory.create({
                data: {
                    userId,
                    sourceConversationId: conversationId,
                    memoryType: 'STRUGGLE',
                    content: struggle.content,
                    importanceScore: struggle.confidence * 10,
                    pillarTags: struggle.pillarTags
                }
            });
        }
        // Store strengths
        for (const strength of extracted.strengths){
            await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userMemory.create({
                data: {
                    userId,
                    sourceConversationId: conversationId,
                    memoryType: 'STRENGTH',
                    content: strength.content,
                    importanceScore: strength.confidence * 10,
                    pillarTags: strength.pillarTags
                }
            });
        }
        // Store entities
        for (const entity of extracted.entities){
            // Check if entity already exists
            const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].extractedEntity.findFirst({
                where: {
                    userId,
                    name: entity.name,
                    entityType: entity.type
                }
            });
            if (existing) {
                // Update existing entity
                await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].extractedEntity.update({
                    where: {
                        id: existing.id
                    },
                    data: {
                        description: entity.description,
                        conversationIds: {
                            push: conversationId
                        },
                        mentionCount: {
                            increment: 1
                        },
                        lastMentioned: new Date()
                    }
                });
            } else {
                // Create new entity
                await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].extractedEntity.create({
                    data: {
                        userId,
                        entityType: entity.type,
                        name: entity.name,
                        description: entity.description,
                        conversationIds: [
                            conversationId
                        ],
                        pillarTags: entity.pillarTags,
                        mentionCount: 1
                    }
                });
            }
        }
        // Store patterns
        for (const pattern of extracted.patterns){
            // Check if pattern already exists
            const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userPattern.findFirst({
                where: {
                    userId,
                    description: pattern.description
                }
            });
            if (existing) {
                // Update existing pattern
                await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userPattern.update({
                    where: {
                        id: existing.id
                    },
                    data: {
                        evidence: {
                            push: conversationId
                        },
                        observationCount: {
                            increment: 1
                        },
                        confidence: Math.min((existing.confidence + pattern.confidence) / 2, 1.0),
                        lastObserved: new Date()
                    }
                });
            } else {
                // Create new pattern
                await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userPattern.create({
                    data: {
                        userId,
                        patternType: pattern.type,
                        description: pattern.description,
                        evidence: [
                            conversationId
                        ],
                        confidence: pattern.confidence,
                        pillarTags: pattern.pillarTags
                    }
                });
            }
        }
        console.log(`Stored memories for conversation ${conversationId}`);
    } catch (error) {
        console.error('Error storing memories:', error);
        throw error;
    }
}
async function generateConversationSummary(conversationId, userId, pillar) {
    try {
        // Check if summary already exists
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].conversationSummary.findUnique({
            where: {
                conversationId
            }
        });
        if (existing) {
            return; // Already summarized
        }
        // Get all messages
        const messages = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.findMany({
            where: {
                conversationId
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        if (messages.length < 3) {
            return; // Not enough to summarize
        }
        const conversationText = messages.map((m)=>`${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
        // Generate summary with Haiku
        const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 1024,
            temperature: 0.3,
            messages: [
                {
                    role: 'user',
                    content: `Summarize this SUPERNova AI coaching conversation. Extract:
1. A 2-3 sentence summary
2. Key topics discussed (array of keywords)
3. Key concepts (main ideas)
4. Action items or commitments made
5. Emotional tone (one word: frustrated, motivated, stuck, excited, etc.)

CONVERSATION:
${conversationText}

Return as JSON:
{
  "summary": "...",
  "keyTopics": ["purpose", "branding"],
  "keyConcepts": ["..."],
  "actionItems": ["..."],
  "emotionalTone": "motivated"
}`
                }
            ]
        });
        const textContent = response.content.find((block)=>block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            return;
        }
        const summaryData = JSON.parse(textContent.text);
        // Store summary
        await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].conversationSummary.create({
            data: {
                conversationId,
                userId,
                summary: summaryData.summary,
                keyTopics: summaryData.keyTopics || [],
                keyConcepts: summaryData.keyConcepts || [],
                actionItems: summaryData.actionItems || [],
                emotionalTone: summaryData.emotionalTone,
                messageCount: messages.length,
                pillar
            }
        });
        console.log(`Generated summary for conversation ${conversationId}`);
    } catch (error) {
        console.error('Error generating summary:', error);
    }
}
}),
"[project]/supernova/lib/embedding-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateEmbeddingCost",
    ()=>calculateEmbeddingCost,
    "cosineSimilarity",
    ()=>cosineSimilarity,
    "estimateTokenCount",
    ()=>estimateTokenCount,
    "findTopSimilar",
    ()=>findTopSimilar,
    "generateEmbedding",
    ()=>generateEmbedding,
    "generateEmbeddings",
    ()=>generateEmbeddings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/supernova/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/supernova/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
;
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: text,
            encoding_format: 'float'
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}
async function generateEmbeddings(texts, batchSize = 100) {
    const embeddings = [];
    // Process in batches
    for(let i = 0; i < texts.length; i += batchSize){
        const batch = texts.slice(i, i + batchSize);
        try {
            const response = await openai.embeddings.create({
                model: EMBEDDING_MODEL,
                input: batch,
                encoding_format: 'float'
            });
            const batchEmbeddings = response.data.map((item)=>item.embedding);
            embeddings.push(...batchEmbeddings);
        } catch (error) {
            console.error(`Error generating embeddings for batch ${i}:`, error);
            throw error;
        }
    }
    return embeddings;
}
function cosineSimilarity(a, b) {
    if (a.length !== b.length) {
        throw new Error('Vectors must be same length');
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for(let i = 0; i < a.length; i++){
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0) return 0;
    return dotProduct / magnitude;
}
function findTopSimilar(queryEmbedding, candidateEmbeddings, topN = 10) {
    const similarities = candidateEmbeddings.map((candidate)=>({
            id: candidate.id,
            similarity: cosineSimilarity(queryEmbedding, candidate.embedding),
            metadata: candidate.metadata
        }));
    // Sort by similarity (highest first)
    similarities.sort((a, b)=>b.similarity - a.similarity);
    return similarities.slice(0, topN);
}
function estimateTokenCount(text) {
    return Math.ceil(text.length / 4);
}
function calculateEmbeddingCost(tokenCount) {
    const COST_PER_MILLION_TOKENS = 0.02;
    return tokenCount / 1_000_000 * COST_PER_MILLION_TOKENS;
}
}),
"[project]/supernova/lib/knowledge-retrieval.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatChunksForPrompt",
    ()=>formatChunksForPrompt,
    "getChunksByType",
    ()=>getChunksByType,
    "hybridSearch",
    ()=>hybridSearch,
    "searchByTopics",
    ()=>searchByTopics,
    "searchKnowledge",
    ()=>searchKnowledge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$embedding$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/embedding-service.ts [app-route] (ecmascript)");
;
;
async function searchKnowledge(query, pillar, topN = 5, minSimilarity = 0.7) {
    try {
        // Generate embedding for query
        const queryEmbedding = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$embedding$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateEmbedding"])(query);
        // Fetch all chunks (with optional pillar filter)
        const chunks = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].contentChunk.findMany({
            where: pillar ? {
                pillar
            } : undefined,
            include: {
                program: {
                    select: {
                        title: true,
                        pillar: true
                    }
                }
            }
        });
        if (chunks.length === 0) {
            return [];
        }
        // Calculate similarities
        const results = chunks.map((chunk)=>{
            // Parse embedding from JSON
            const embedding = JSON.parse(chunk.embeddingJson || '[]');
            if (embedding.length === 0) {
                return null;
            }
            const similarity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$embedding$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cosineSimilarity"])(queryEmbedding, embedding);
            return {
                id: chunk.id,
                content: chunk.content,
                chunkType: chunk.chunkType,
                topics: chunk.topics,
                similarity,
                programTitle: chunk.program.title,
                pillar: chunk.program.pillar
            };
        }).filter((result)=>result !== null && result.similarity >= minSimilarity).sort((a, b)=>b.similarity - a.similarity).slice(0, topN);
        return results;
    } catch (error) {
        console.error('Knowledge search error:', error);
        return [];
    }
}
async function searchByTopics(topics, pillar, limit = 10) {
    try {
        const chunks = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].contentChunk.findMany({
            where: {
                AND: [
                    pillar ? {
                        pillar
                    } : {},
                    {
                        topics: {
                            hasSome: topics
                        }
                    }
                ]
            },
            include: {
                program: {
                    select: {
                        title: true,
                        pillar: true
                    }
                }
            },
            take: limit,
            orderBy: {
                chunkIndex: 'asc'
            }
        });
        return chunks.map((chunk)=>({
                id: chunk.id,
                content: chunk.content,
                chunkType: chunk.chunkType,
                topics: chunk.topics,
                similarity: 0.8,
                programTitle: chunk.program.title,
                pillar: chunk.program.pillar
            }));
    } catch (error) {
        console.error('Topic search error:', error);
        return [];
    }
}
async function getChunksByType(chunkType, pillar, limit = 5) {
    try {
        const chunks = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].contentChunk.findMany({
            where: {
                chunkType,
                ...pillar ? {
                    pillar
                } : {}
            },
            include: {
                program: {
                    select: {
                        title: true,
                        pillar: true
                    }
                }
            },
            take: limit
        });
        return chunks.map((chunk)=>({
                id: chunk.id,
                content: chunk.content,
                chunkType: chunk.chunkType,
                topics: chunk.topics,
                similarity: 0.75,
                programTitle: chunk.program.title,
                pillar: chunk.program.pillar
            }));
    } catch (error) {
        console.error('Chunk type search error:', error);
        return [];
    }
}
async function hybridSearch(query, pillar, topN = 5) {
    // Extract potential topics from query
    const queryLower = query.toLowerCase();
    const topicMatches = [];
    const topicKeywords = {
        pricing: [
            'pricing',
            'price',
            'charge',
            'money'
        ],
        branding: [
            'brand',
            'identity',
            'positioning'
        ],
        marketing: [
            'market',
            'launch',
            'sell',
            'promote'
        ],
        adhd: [
            'adhd',
            'neurodiverge',
            'focus',
            'executive'
        ],
        'body-image': [
            'body',
            'weight',
            'size',
            'appearance'
        ],
        authenticity: [
            'authentic',
            'real',
            'genuine'
        ]
    };
    for (const [topic, keywords] of Object.entries(topicKeywords)){
        if (keywords.some((kw)=>queryLower.includes(kw))) {
            topicMatches.push(topic);
        }
    }
    // Get semantic results
    const semanticResults = await searchKnowledge(query, pillar, topN, 0.65);
    // If we have topic matches, boost those results
    if (topicMatches.length > 0) {
        const topicResults = await searchByTopics(topicMatches, pillar, 3);
        // Merge and dedupe
        const combined = [
            ...semanticResults,
            ...topicResults
        ];
        const seen = new Set();
        const deduped = combined.filter((chunk)=>{
            if (seen.has(chunk.id)) return false;
            seen.add(chunk.id);
            return true;
        });
        return deduped.slice(0, topN);
    }
    return semanticResults;
}
function formatChunksForPrompt(chunks) {
    if (chunks.length === 0) return '';
    return chunks.map((chunk, i)=>{
        return `
## CHUNK ${i + 1}: ${chunk.chunkType.toUpperCase()}
**From**: ${chunk.programTitle}
**Topics**: ${chunk.topics.join(', ')}
**Relevance**: ${(chunk.similarity * 100).toFixed(0)}%

${chunk.content}

---
`;
    }).join('\n');
}
}),
"[project]/supernova/lib/dopamine-detector.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Dopamine Menu Detector
 * Detects when user is stuck/overwhelmed and offers instant dopamine hits
 */ __turbopack_context__.s([
    "detectOverwhelm",
    ()=>detectOverwhelm,
    "formatDopamineMenuResponse",
    ()=>formatDopamineMenuResponse,
    "getDopamineMenu",
    ()=>getDopamineMenu,
    "trackDopamineCompleted",
    ()=>trackDopamineCompleted,
    "trackDopamineOffered",
    ()=>trackDopamineOffered
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/prisma.ts [app-route] (ecmascript)");
;
// Keywords that indicate user is stuck/overwhelmed
const STUCK_KEYWORDS = [
    "stuck",
    "overwhelm",
    "can't",
    "don't know",
    "paralyz",
    "freeze",
    "shutdown",
    "can't think",
    "brain fog",
    "executive dysfunction",
    "too much",
    "can't focus",
    "spinning",
    "spiraling",
    "lost",
    "confused",
    "procrastinat"
];
function detectOverwhelm(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    return STUCK_KEYWORDS.some((keyword)=>lowerMessage.includes(keyword));
}
async function getDopamineMenu(userId, pillar, maxDifficulty = 3) {
    const items = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].dopamineMenuItem.findMany({
        where: {
            AND: [
                {
                    OR: [
                        {
                            userId: null
                        },
                        {
                            userId
                        }
                    ]
                },
                {
                    difficultyLevel: {
                        lte: maxDifficulty
                    }
                },
                pillar ? {
                    pillar
                } : {}
            ]
        },
        orderBy: [
            {
                difficultyLevel: 'asc'
            },
            {
                timesCompleted: 'desc'
            }
        ],
        take: 5
    });
    return items;
}
async function trackDopamineOffered(itemId) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].dopamineMenuItem.update({
        where: {
            id: itemId
        },
        data: {
            timesOffered: {
                increment: 1
            }
        }
    });
}
async function trackDopamineCompleted(itemId, completionTimeMinutes) {
    const item = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].dopamineMenuItem.findUnique({
        where: {
            id: itemId
        }
    });
    if (!item) return;
    // Update average completion time
    const newAvg = item.avgCompletionTime ? Math.round((item.avgCompletionTime + completionTimeMinutes) / 2) : completionTimeMinutes;
    await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].dopamineMenuItem.update({
        where: {
            id: itemId
        },
        data: {
            timesCompleted: {
                increment: 1
            },
            avgCompletionTime: newAvg
        }
    });
}
function formatDopamineMenuResponse(items) {
    if (items.length === 0) {
        return "Alright, let's try something different. What's one tiny thing you COULD do right now?";
    }
    const response = `You sound stuck. Let's get you moving. Pick ONE:

${items.map((item, i)=>`${i + 1}. **${item.title}**\n   ${item.description}`).join('\n\n')}

Pick a number. Don't think. Just pick.`;
    return response;
}
}),
"[project]/supernova/lib/pattern-interrupt.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LOOP_PATTERNS",
    ()=>LOOP_PATTERNS,
    "detectLoopPattern",
    ()=>detectLoopPattern,
    "formatLoopContext",
    ()=>formatLoopContext,
    "getActiveLoops",
    ()=>getActiveLoops,
    "resolveLoop",
    ()=>resolveLoop,
    "trackLoopOccurrence",
    ()=>trackLoopOccurrence
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/prisma.ts [app-route] (ecmascript)");
;
const LOOP_PATTERNS = {
    pricing_paralysis: {
        keywords: [
            'pricing',
            'price',
            'charge',
            'how much',
            'what to charge',
            'pricing strategy'
        ],
        threshold: 3,
        interrupt: `
STOP. We've talked about pricing {{count}} times now.

Here's the truth: You're not stuck on pricing. You're stuck on WORTH.

What's the REAL fear? Say it out loud.
- "I'm not good enough to charge that"
- "What if no one pays?"
- "I don't have proof I'm worth it"

Which one is it? Because we're not doing another pricing dance until you tell me what you're ACTUALLY afraid of.
`
    },
    imposter_syndrome: {
        keywords: [
            'imposter',
            "don't feel qualified",
            "who am I to",
            'not good enough',
            "don't have credentials",
            'fake',
            'fraud'
        ],
        threshold: 3,
        interrupt: `
OKAY. FULL STOP.

You've mentioned feeling like a fraud {{count}} times. I'm calling bullshit.

You know what's fraudulent? Pretending you DON'T know things you actually know. Hiding your experience because you didn't get it from a university.

Answer this: If someone paid you right now for what you know, could you help them? YES OR NO.

Don't intellectualize it. Don't list your credentials. Just yes or no.
`
    },
    perfectionism: {
        keywords: [
            "it's not ready",
            'not perfect',
            'need to fix',
            'just one more thing',
            "it's not good enough",
            'refine',
            'polish'
        ],
        threshold: 3,
        interrupt: `
PATTERN INTERRUPT.

We've hit "not ready yet" {{count}} times. That's not perfectionism. That's FEAR wearing a productivity costume.

Here's what's happening: You're terrified it WON'T work, so you're making sure it NEVER has to work by keeping it "not ready."

What if I told you it's never going to feel ready? What if "good enough" is the only option that exists?

Ship it broken or don't ship it at all. Which one?
`
    },
    launch_paralysis: {
        keywords: [
            'launch',
            'launching',
            'getting ready to',
            'about to launch',
            'planning to launch',
            'going to launch'
        ],
        threshold: 4,
        interrupt: `
NOPE. STOPPING YOU RIGHT HERE.

You've said "launching" {{count}} times. How many times have you ACTUALLY launched?

You're not planning a launch. You're rehearsing the idea of launching. There's a difference.

Set a timer for 60 seconds. When it goes off, tell me ONE THING you can do RIGHT NOW that gets you closer to ACTUAL launch (not planning, not strategizing, DOING).

GO.
`
    },
    energy_excuse: {
        keywords: [
            "don't have energy",
            'too tired',
            'exhausted',
            'burned out',
            "can't focus",
            'no motivation',
            'drained'
        ],
        threshold: 2,
        interrupt: `
HOLD UP.

You've mentioned being exhausted/drained {{count}} times. That's not laziness. That's your body SCREAMING at you.

Real talk: Are you actually tired, or are you doing things that drain you because you think you "should"?

If you could ONLY do ONE thing this week that GAVE you energy (not tasks, not obligations, just something that lights you up), what would it be?

And why aren't you doing it?
`
    },
    comparison_trap: {
        keywords: [
            'everyone else',
            'other people',
            'they have',
            'compared to',
            'not like them',
            'behind everyone'
        ],
        threshold: 3,
        interrupt: `
PATTERN DETECTED: Comparison spiral.

We've hit "everyone else is..." {{count}} times. Time to interrupt this loop.

You're not behind. You're on a different ROUTE.

Quick: Name ONE thing you've done in the last month that was 100% YOU. Not what a guru said. Not what "successful people" do. Just authentically, weirdly, uniquely YOU.

What was it?
`
    },
    time_excuse: {
        keywords: [
            "don't have time",
            'no time',
            'too busy',
            'not enough time',
            'if I had more time',
            'when I have time'
        ],
        threshold: 3,
        interrupt: `
STOP. Pattern interrupt activated.

"No time" has come up {{count}} times. That's not a time problem. That's a PRIORITY problem.

Hard truth: You DO have time. You just don't want to admit what you're actually prioritizing over this.

What are you choosing INSTEAD? Netflix? Scrolling? Overthinking? Other people's emergencies?

Name it. Own it. Then we can deal with it.
`
    }
};
function detectLoopPattern(message) {
    const lowerMessage = message.toLowerCase();
    for (const [loopType, pattern] of Object.entries(LOOP_PATTERNS)){
        const hasKeyword = pattern.keywords.some((keyword)=>lowerMessage.includes(keyword.toLowerCase()));
        if (hasKeyword) {
            return loopType;
        }
    }
    return null;
}
async function trackLoopOccurrence(userId, conversationId, loopType, message) {
    const pattern = LOOP_PATTERNS[loopType];
    // Find or create loop detection record
    let loopRecord = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].loopDetection.findFirst({
        where: {
            userId,
            loopType,
            wasResolved: false
        }
    });
    if (!loopRecord) {
        // Create new loop record
        loopRecord = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].loopDetection.create({
            data: {
                userId,
                loopType,
                description: message.substring(0, 500),
                occurrences: [
                    conversationId
                ],
                interruptCount: 0
            }
        });
    } else {
        // Update existing record
        const updatedOccurrences = [
            ...loopRecord.occurrences,
            conversationId
        ];
        loopRecord = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].loopDetection.update({
            where: {
                id: loopRecord.id
            },
            data: {
                occurrences: updatedOccurrences,
                lastDetected: new Date()
            }
        });
    }
    const occurrenceCount = loopRecord.occurrences.length;
    // Check if we should interrupt
    if (occurrenceCount >= pattern.threshold) {
        // Update interrupt count
        await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].loopDetection.update({
            where: {
                id: loopRecord.id
            },
            data: {
                interruptCount: loopRecord.interruptCount + 1,
                lastInterrupted: new Date()
            }
        });
        const interruptMessage = pattern.interrupt.replace('{{count}}', occurrenceCount.toString());
        return {
            shouldInterrupt: true,
            interruptMessage,
            occurrenceCount
        };
    }
    return {
        shouldInterrupt: false,
        occurrenceCount
    };
}
async function resolveLoop(userId, loopType) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].loopDetection.updateMany({
        where: {
            userId,
            loopType,
            wasResolved: false
        },
        data: {
            wasResolved: true,
            resolvedAt: new Date()
        }
    });
}
async function getActiveLoops(userId) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].loopDetection.findMany({
        where: {
            userId,
            wasResolved: false
        },
        orderBy: {
            lastDetected: 'desc'
        }
    });
}
function formatLoopContext(loops) {
    if (loops.length === 0) return '';
    return `
# ACTIVE PATTERN LOOPS DETECTED

The user has the following recurring patterns that may need interruption:

${loops.map((loop)=>`
- **${loop.loopType}**: Mentioned ${loop.occurrences.length} times across ${loop.occurrences.length} conversations
  Last detected: ${loop.lastDetected.toISOString().split('T')[0]}
  Times interrupted: ${loop.interruptCount}
`).join('\n')}

If these patterns appear AGAIN in this conversation, consider escalating your approach or trying a different angle.
`;
}
}),
"[project]/supernova/lib/decision-killer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectDecisionParalysis",
    ()=>detectDecisionParalysis,
    "extractDecision",
    ()=>extractDecision,
    "generateDecisionKillerPrompt",
    ()=>generateDecisionKillerPrompt,
    "getAverageDecisionTime",
    ()=>getAverageDecisionTime,
    "getDecisionHistory",
    ()=>getDecisionHistory,
    "getPendingDecisions",
    ()=>getPendingDecisions,
    "lockInDecision",
    ()=>lockInDecision,
    "trackDecision",
    ()=>trackDecision
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/prisma.ts [app-route] (ecmascript)");
;
/**
 * Decision-related keywords that indicate user is trying to make a choice
 */ const DECISION_KEYWORDS = [
    'should i',
    'which',
    'or',
    'either',
    'option',
    'choice',
    'decide',
    'deciding',
    'not sure if',
    'trying to choose',
    'debating',
    'considering',
    'what do you think',
    'which one'
];
function detectDecisionParalysis(message) {
    const lowerMessage = message.toLowerCase();
    return DECISION_KEYWORDS.some((keyword)=>lowerMessage.includes(keyword));
}
function extractDecision(message) {
    // Look for "A or B" patterns
    const orPattern = /(.+?)\s+or\s+(.+?)[\?\.]?$/i;
    const orMatch = message.match(orPattern);
    if (orMatch) {
        return {
            question: message,
            options: [
                orMatch[1].trim(),
                orMatch[2].trim()
            ]
        };
    }
    // Look for numbered options
    const numberedPattern = /\d+[.):]\s*(.+?)(?=\d+[.):]\s*|\n|$)/g;
    const numberedMatches = [
        ...message.matchAll(numberedPattern)
    ];
    if (numberedMatches.length >= 2) {
        return {
            question: message.split(/\d+[.):]/)[0].trim() || message,
            options: numberedMatches.map((m)=>m[1].trim())
        };
    }
    // Look for "either X or Y" patterns
    const eitherPattern = /either\s+(.+?)\s+or\s+(.+?)[\?\.]?$/i;
    const eitherMatch = message.match(eitherPattern);
    if (eitherMatch) {
        return {
            question: message,
            options: [
                eitherMatch[1].trim(),
                eitherMatch[2].trim()
            ]
        };
    }
    return null;
}
async function trackDecision(userId, conversationId, question, options) {
    // Normalize question for matching (lowercase, remove punctuation)
    const normalizedQuestion = question.toLowerCase().replace(/[^\w\s]/g, '');
    // Find similar decisions (exact match or very similar)
    const existingDecisions = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].decision.findMany({
        where: {
            userId,
            lockedIn: false
        }
    });
    // Check if user has asked this (or very similar) question before
    const similarDecision = existingDecisions.find((d)=>{
        const normalizedExisting = d.question.toLowerCase().replace(/[^\w\s]/g, '');
        // Simple similarity: if 80% of words match, consider it the same question
        const existingWords = new Set(normalizedExisting.split(/\s+/));
        const questionWords = normalizedQuestion.split(/\s+/);
        const matchingWords = questionWords.filter((w)=>existingWords.has(w));
        return matchingWords.length / questionWords.length > 0.8;
    });
    if (similarDecision) {
        // User is asking about the same decision again
        const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].decision.update({
            where: {
                id: similarDecision.id
            },
            data: {
                timesAsked: similarDecision.timesAsked + 1
            }
        });
        return {
            isStuck: updated.timesAsked >= 2,
            timesAsked: updated.timesAsked,
            decisionId: updated.id
        };
    } else {
        // New decision
        const newDecision = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].decision.create({
            data: {
                userId,
                conversationId,
                question,
                options,
                timesAsked: 1
            }
        });
        return {
            isStuck: false,
            timesAsked: 1,
            decisionId: newDecision.id
        };
    }
}
async function lockInDecision(decisionId, chosenOption) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].decision.update({
        where: {
            id: decisionId
        },
        data: {
            chosenOption,
            lockedIn: true,
            lockedAt: new Date(),
            timeToDecide: Math.floor((new Date().getTime() - (await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].decision.findUnique({
                where: {
                    id: decisionId
                }
            })).createdAt.getTime()) / 1000)
        }
    });
}
function generateDecisionKillerPrompt(question, options, timesAsked) {
    // If more than 2 options, force reduction to 2
    if (options.length > 2) {
        return `
# DECISION PARALYSIS DETECTED

You've presented ${options.length} options. That's TOO MANY. ADHD brains shut down with choice overload.

Here's what we're doing:

**60-SECOND TIMER STARTS NOW.**

Which TWO options are you ACTUALLY considering? Not what sounds good. Not what you "should" do. Which two are pulling at you?

Pick TWO. I'll help you choose between them. GO.
`;
    }
    // Binary choice - activate decision killer
    const optionA = options[0];
    const optionB = options[1];
    if (timesAsked === 1) {
        // First time asking - give them a moment
        return `
# DECISION TIME

You're choosing between:
- **A**: ${optionA}
- **B**: ${optionB}

Quick gut check: Which one makes your chest feel LIGHTER? Not which one sounds "smarter" or more "strategic." Which one feels like RELIEF?

That's your answer. Trust it.
`;
    } else if (timesAsked === 2) {
        // Second time asking - get firm
        return `
# DECISION PARALYSIS ALERT

We've talked about this decision ${timesAsked} times now. You're stuck in analysis mode.

Here's the truth: **BOTH OPTIONS WILL WORK.** The cost of NOT deciding is higher than picking the "wrong" one.

**30-SECOND DECISION:**

Option A: ${optionA}
Option B: ${optionB}

Close your eyes. Count to 3. Say the first one that comes out of your mouth.

I'm waiting. A or B?
`;
    } else {
        // Third+ time asking - FORCE IT
        return `
# DECISION OVERRIDE ACTIVATED

This is the ${timesAsked}th time you've asked about this. I'm not letting you spiral anymore.

**I'm flipping a coin for you.**

*flips coin*

**The answer is: ${Math.random() > 0.5 ? 'A' : 'B'}**

- **A**: ${optionA}
- **B**: ${optionB}

Go with it. If your gut SCREAMS "no," then you know it's the other one. But you're not allowed to think anymore. You're DOING.

Commit to it RIGHT NOW in your next message. Which one is it?
`;
    }
}
async function getPendingDecisions(userId) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].decision.findMany({
        where: {
            userId,
            lockedIn: false
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}
async function getDecisionHistory(userId, limit = 10) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].decision.findMany({
        where: {
            userId,
            lockedIn: true
        },
        orderBy: {
            lockedAt: 'desc'
        },
        take: limit
    });
}
async function getAverageDecisionTime(userId) {
    const decisions = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].decision.findMany({
        where: {
            userId,
            lockedIn: true,
            timeToDecide: {
                not: null
            }
        }
    });
    if (decisions.length === 0) return 0;
    const total = decisions.reduce((sum, d)=>sum + (d.timeToDecide || 0), 0);
    return Math.floor(total / decisions.length);
}
}),
"[project]/supernova/lib/accountability-partner.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "abandonCommitment",
    ()=>abandonCommitment,
    "createCheckIn",
    ()=>createCheckIn,
    "createCommitment",
    ()=>createCommitment,
    "detectCommitment",
    ()=>detectCommitment,
    "extractCommitment",
    ()=>extractCommitment,
    "generateCheckInPrompt",
    ()=>generateCheckInPrompt,
    "generateCommitmentConfirmation",
    ()=>generateCommitmentConfirmation,
    "getActiveCommitments",
    ()=>getActiveCommitments,
    "getCommitmentMetrics",
    ()=>getCommitmentMetrics,
    "getCommitmentsNeedingCheckIn",
    ()=>getCommitmentsNeedingCheckIn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/prisma.ts [app-route] (ecmascript)");
;
/**
 * Keywords that indicate user is making a commitment
 */ const COMMITMENT_KEYWORDS = [
    "i'll",
    "i will",
    "i'm going to",
    'going to',
    'planning to',
    'committed to',
    'promise',
    'by tomorrow',
    'by next week',
    'by friday',
    'by monday',
    'this week',
    'today',
    'tonight'
];
function detectCommitment(message) {
    const lowerMessage = message.toLowerCase();
    return COMMITMENT_KEYWORDS.some((keyword)=>lowerMessage.includes(keyword));
}
function extractCommitment(message) {
    const lowerMessage = message.toLowerCase();
    // Look for timeframe indicators
    let timeframe;
    const timePatterns = [
        {
            pattern: /(by|before)\s+(tomorrow|tonight|today)/i,
            value: 'today'
        },
        {
            pattern: /(by|before)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
            value: 'this_week'
        },
        {
            pattern: /(this|next)\s+week/i,
            value: 'this_week'
        },
        {
            pattern: /(by|before)\s+the\s+end\s+of\s+(the\s+)?(week|month)/i,
            value: 'this_week'
        }
    ];
    for (const { pattern, value } of timePatterns){
        if (pattern.test(lowerMessage)) {
            timeframe = value;
            break;
        }
    }
    // Extract description (everything after "I'll" or "I'm going to")
    const commitmentPatterns = [
        /i'll\s+(.+?)(?:\.|$|by\s|tomorrow|next\s)/i,
        /i\s+will\s+(.+?)(?:\.|$|by\s|tomorrow|next\s)/i,
        /i'm\s+going\s+to\s+(.+?)(?:\.|$|by\s|tomorrow|next\s)/i,
        /going\s+to\s+(.+?)(?:\.|$|by\s|tomorrow|next\s)/i
    ];
    let description;
    for (const pattern of commitmentPatterns){
        const match = message.match(pattern);
        if (match) {
            description = match[1].trim();
            break;
        }
    }
    if (!description) return null;
    // Infer pillar from keywords
    let pillar;
    if (/post|content|launch|business|client|pricing|sales/i.test(description)) {
        pillar = 'BUSINESS';
    } else if (/workout|exercise|sleep|eat|body|physical/i.test(description)) {
        pillar = 'BODY';
    } else if (/adhd|focus|brain|routine|organize|task/i.test(description)) {
        pillar = 'BRAIN';
    }
    return {
        description,
        timeframe,
        pillar
    };
}
async function createCommitment(userId, description, frequency = 'one-time', deadline, pillar) {
    const commitment = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].commitment.create({
        data: {
            userId,
            description,
            frequency,
            deadline,
            pillar: pillar || 'GENERAL',
            status: 'active'
        }
    });
    return commitment.id;
}
async function createCheckIn(commitmentId, completed, userResponse, snResponse) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].checkIn.create({
        data: {
            commitmentId,
            completed,
            userResponse,
            snResponse
        }
    });
    // Update commitment counters
    const commitment = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].commitment.findUnique({
        where: {
            id: commitmentId
        }
    });
    if (commitment) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].commitment.update({
            where: {
                id: commitmentId
            },
            data: {
                completionCount: completed ? commitment.completionCount + 1 : commitment.completionCount,
                missedCount: !completed ? commitment.missedCount + 1 : commitment.missedCount
            }
        });
        // If one-time commitment is completed, mark it done
        if (completed && commitment.frequency === 'one-time') {
            await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].commitment.update({
                where: {
                    id: commitmentId
                },
                data: {
                    status: 'completed',
                    completedAt: new Date()
                }
            });
        }
    }
}
async function getActiveCommitments(userId) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].commitment.findMany({
        where: {
            userId,
            status: 'active'
        },
        include: {
            checkIns: {
                orderBy: {
                    checkedAt: 'desc'
                },
                take: 3
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}
async function getCommitmentsNeedingCheckIn(userId) {
    const activeCommitments = await getActiveCommitments(userId);
    const now = new Date();
    const needCheckIn = activeCommitments.filter((c)=>{
        // If has deadline and it's passed, needs check-in
        if (c.deadline && c.deadline < now) {
            return true;
        }
        // If no check-ins yet and created >24h ago, needs check-in
        if (c.checkIns.length === 0) {
            const hoursSinceCreated = (now.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
            return hoursSinceCreated > 24;
        }
        // If last check-in was >24h ago, needs check-in
        const lastCheckIn = c.checkIns[0];
        if (lastCheckIn) {
            const hoursSinceCheckIn = (now.getTime() - lastCheckIn.checkedAt.getTime()) / (1000 * 60 * 60);
            return hoursSinceCheckIn > 24;
        }
        return false;
    });
    return needCheckIn;
}
function generateCheckInPrompt(commitments) {
    if (commitments.length === 0) return '';
    const commitmentList = commitments.map((c, i)=>{
        const missedCount = c.missedCount || 0;
        const completionRate = c.completionCount + c.missedCount > 0 ? Math.round(c.completionCount / (c.completionCount + c.missedCount) * 100) : 0;
        let status = '';
        if (c.deadline && c.deadline < new Date()) {
            status = ' (DEADLINE PASSED)';
        } else if (missedCount > 2) {
            status = ` (MISSED ${missedCount} TIMES)`;
        }
        return `${i + 1}. "${c.description}"${status}\n   - Completion rate: ${completionRate}%`;
    }).join('\n');
    return `
# ACCOUNTABILITY CHECK-IN TIME

You have ${commitments.length} active commitment(s) that need checking in on:

${commitmentList}

For EACH commitment:
1. Ask: "Did you do it? Yes or no."
2. If YES: Celebrate the win (genuinely, not generic praise)
3. If NO: Ask what got in the way (no judgment, just facts)
4. If missed 3+ times: Call out the pattern and ask if they want to ABANDON it (it's okay to quit things that aren't working)

IMPORTANT:
- Don't lecture or guilt-trip
- Celebrate wins HARD (even small ones)
- If they're making excuses, gently call BS
- If a commitment isn't serving them, give permission to drop it
- Focus on ONE commitment at a time, don't overwhelm
`;
}
function generateCommitmentConfirmation(description, timeframe) {
    const deadline = timeframe === 'today' ? 'by end of today' : timeframe === 'this_week' ? 'by end of this week' : 'soon';
    return `
# COMMITMENT LOCKED IN

Got it. You're committing to: **${description}** ${deadline}.

I'm holding you to this. I'll check in with you later.

One question: What's the FIRST tiny step you can take right now (like, in the next 5 minutes) toward this?

Don't overthink it. Just the first micro-action.
`;
}
async function getCommitmentMetrics(userId) {
    const allCommitments = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].commitment.findMany({
        where: {
            userId
        },
        include: {
            checkIns: true
        }
    });
    const totalCommitments = allCommitments.length;
    const completedCommitments = allCommitments.filter((c)=>c.status === 'completed').length;
    const abandonedCommitments = allCommitments.filter((c)=>c.status === 'abandoned').length;
    const totalCheckIns = allCommitments.reduce((sum, c)=>sum + c.completionCount + c.missedCount, 0);
    const completedCheckIns = allCommitments.reduce((sum, c)=>sum + c.completionCount, 0);
    const overallCompletionRate = totalCheckIns > 0 ? Math.round(completedCheckIns / totalCheckIns * 100) : 0;
    return {
        totalCommitments,
        completedCommitments,
        abandonedCommitments,
        activeCommitments: totalCommitments - completedCommitments - abandonedCommitments,
        overallCompletionRate
    };
}
async function abandonCommitment(commitmentId) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].commitment.update({
        where: {
            id: commitmentId
        },
        data: {
            status: 'abandoned'
        }
    });
}
}),
"[project]/supernova/lib/energy-tracker.ts [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/supernova/lib/energy-tracker.ts'\n\n'const' declarations must be initialized");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/supernova/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/supernova/node_modules/@anthropic-ai/sdk/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__ = __turbopack_context__.i("[project]/supernova/node_modules/@anthropic-ai/sdk/client.mjs [app-route] (ecmascript) <export Anthropic as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$personalities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/personalities.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$content$2d$curator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/content-curator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$memory$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/memory-extractor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$knowledge$2d$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/knowledge-retrieval.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$dopamine$2d$detector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/dopamine-detector.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$pattern$2d$interrupt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/pattern-interrupt.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$decision$2d$killer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/decision-killer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$accountability$2d$partner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/accountability-partner.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$energy$2d$tracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/supernova/lib/energy-tracker.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
const anthropic = new __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f40$anthropic$2d$ai$2f$sdk$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Anthropic__as__default$3e$__["default"]({
    apiKey: process.env.ANTHROPIC_API_KEY
});
async function POST(req) {
    try {
        const body = await req.json();
        const { message, conversationId, userId, mode = 'GENERAL' } = body;
        if (!message || !userId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Message and userId are required'
            }, {
                status: 400
            });
        }
        // Get or create conversation
        let conversation;
        if (conversationId) {
            conversation = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].conversation.findUnique({
                where: {
                    id: conversationId
                },
                include: {
                    messages: {
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 20
                    }
                }
            });
        }
        if (!conversation) {
            // Create new conversation
            conversation = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].conversation.create({
                data: {
                    userId,
                    mode,
                    title: message.slice(0, 50) + (message.length > 50 ? '...' : '')
                },
                include: {
                    messages: true
                }
            });
        }
        // Get user memories for personalization
        const memories = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].userMemory.findMany({
            where: {
                userId,
                OR: [
                    {
                        pillarTags: {
                            has: mode
                        }
                    },
                    {
                        pillarTags: {
                            isEmpty: true
                        }
                    }
                ]
            },
            orderBy: {
                importanceScore: 'desc'
            },
            take: 10
        });
        const memoryContext = memories.map((m)=>m.content);
        // Search knowledge base for relevant content
        const knowledgeChunks = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$knowledge$2d$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hybridSearch"])(message, mode, 3);
        // Curate relevant content from Albums (legacy system - keeping for now)
        const curatedContent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$content$2d$curator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["curateContent"])(message, mode);
        // Store user message
        await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.create({
            data: {
                conversationId: conversation.id,
                userId,
                role: 'user',
                content: message
            }
        });
        // TRACK ENERGY - background task, don't await
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$energy$2d$tracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackEnergy"])(userId, conversation.id, message).catch((err)=>console.error('Energy tracking failed:', err));
        // DETECT OVERWHELM - offer dopamine menu if user is stuck
        const isOverwhelmed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$dopamine$2d$detector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectOverwhelm"])(message);
        let dopamineMenuContext = '';
        if (isOverwhelmed) {
            const dopamineItems = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$dopamine$2d$detector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDopamineMenu"])(userId, mode, 3);
            if (dopamineItems.length > 0) {
                // Track that we're offering these
                dopamineItems.forEach((item)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$dopamine$2d$detector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackDopamineOffered"])(item.id));
                dopamineMenuContext = `

# DOPAMINE RESCUE MODE ACTIVATED

The user sounds STUCK/OVERWHELMED. Offer them the dopamine menu below.

${(0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$dopamine$2d$detector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatDopamineMenuResponse"])(dopamineItems)}

Be empathetic but direct. Don't lecture. Just offer the menu and let them pick.
`;
            }
        }
        // DETECT PATTERN LOOPS - interrupt spirals
        const loopType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$pattern$2d$interrupt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectLoopPattern"])(message);
        let patternInterruptContext = '';
        if (loopType) {
            const loopResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$pattern$2d$interrupt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackLoopOccurrence"])(userId, conversation.id, loopType, message);
            if (loopResult.shouldInterrupt) {
                patternInterruptContext = `

# PATTERN INTERRUPT TRIGGERED

Loop detected: ${loopType}
This pattern has appeared ${loopResult.occurrenceCount} times.

${loopResult.interruptMessage}

IMPORTANT: Deliver this interrupt with SUPERNova's bold, direct energy. Call out the pattern. Don't coddle. Be compassionate but FIRM.
`;
            }
        }
        // Get active loops for context (even if not interrupting right now)
        const activeLoops = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$pattern$2d$interrupt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveLoops"])(userId);
        const loopHistoryContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$pattern$2d$interrupt$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatLoopContext"])(activeLoops);
        // DETECT DECISION PARALYSIS - force binary choices
        const isDeciding = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$decision$2d$killer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectDecisionParalysis"])(message);
        let decisionKillerContext = '';
        if (isDeciding) {
            const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$decision$2d$killer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractDecision"])(message);
            if (decision) {
                const decisionResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$decision$2d$killer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trackDecision"])(userId, conversation.id, decision.question, decision.options);
                if (decisionResult.isStuck || decision.options.length > 2) {
                    const killerPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$decision$2d$killer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateDecisionKillerPrompt"])(decision.question, decision.options, decisionResult.timesAsked);
                    decisionKillerContext = `
${killerPrompt}

DELIVERY NOTES:
- Use SUPERNova's direct, no-BS energy
- Don't let them overthink
- Create urgency with time pressure
- If they've asked ${decisionResult.timesAsked}+ times, be FIRM
- Make them commit in their next message
`;
                }
            }
        }
        // DETECT COMMITMENTS - track user promises
        const isCommitting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$accountability$2d$partner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectCommitment"])(message);
        let commitmentContext = '';
        if (isCommitting) {
            const commitment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$accountability$2d$partner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractCommitment"])(message);
            if (commitment) {
                // Create commitment record
                const deadline = commitment.timeframe === 'today' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : commitment.timeframe === 'this_week' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined;
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$accountability$2d$partner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCommitment"])(userId, commitment.description, 'one-time', deadline, commitment.pillar);
                commitmentContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$accountability$2d$partner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateCommitmentConfirmation"])(commitment.description, commitment.timeframe);
            }
        }
        // CHECK FOR COMMITMENTS NEEDING CHECK-IN
        const needCheckIn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$accountability$2d$partner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCommitmentsNeedingCheckIn"])(userId);
        let checkInContext = '';
        if (needCheckIn.length > 0 && !isCommitting && !isOverwhelmed) {
            // Don't interrupt if user is overwhelmed or just made a new commitment
            checkInContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$accountability$2d$partner$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateCheckInPrompt"])(needCheckIn);
        }
        // GET ENERGY PATTERNS - every 10 messages, share insights
        const messageCount = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.count({
            where: {
                conversationId: conversation.id
            }
        });
        let energyInsightContext = '';
        if (messageCount > 0 && messageCount % 10 === 0) {
            const patterns = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$energy$2d$tracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getEnergyPatterns"])(userId, 30);
            if (patterns) {
                energyInsightContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$energy$2d$tracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatEnergyInsight"])(patterns);
            }
        }
        // Build conversation history for Claude
        const conversationHistory = conversation.messages.reverse() // Oldest first
        .map((msg)=>({
                role: msg.role,
                content: msg.content
            }));
        // Add current user message
        conversationHistory.push({
            role: 'user',
            content: message
        });
        // Get personality-enhanced system prompt with curated content
        let systemPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$personalities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPersonalityContext"])(mode, memoryContext);
        // If we found relevant content, add it to the system prompt
        if (curatedContent && curatedContent.relevanceScore >= 3) {
            const contentContext = `

# RELEVANT PROGRAM CONTENT

You have access to program content from "${curatedContent.albumTitle}" - specifically the track "${curatedContent.trackTitle}".

When responding to the user's question, you MAY weave in relevant insights, frameworks, or exercises from this content IF it's genuinely helpful. DO NOT force it - only reference it if it naturally enhances your response.

Available sections:
${curatedContent.sections.map((s)=>`
## ${s.type}
${s.content.substring(0, 800)}...
`).join('\n')}

IMPORTANT DELIVERY GUIDELINES:
- Don't say "I have some content for you" or "Here's what the program says"
- Instead, naturally weave insights into your coaching response
- Use SUPERNova's voice (bold, direct, rock-and-roll energy) even when sharing program content
- If recommending an exercise from the content, present it as YOUR coaching guidance, not as "here's an exercise from the program"
- You can mention the Album/Track name IF it adds value (e.g., "This is what we cover in TOO GOOD AT RAISING HELL"), but don't make it feel like you're reading from a script
- Keep your responses conversational and personalized to THIS user, not generic program delivery

Think of the program content as YOUR knowledge base that you're sharing in a coaching conversation, not as a separate resource you're recommending.
`;
            systemPrompt += contentContext;
        }
        // Add knowledge base content if found
        if (knowledgeChunks.length > 0) {
            const knowledgeContext = `

# KNOWLEDGE BASE CONTENT

You have access to relevant content from your uploaded knowledge base. Use this to enhance your coaching response.

${(0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$knowledge$2d$retrieval$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatChunksForPrompt"])(knowledgeChunks)}

DELIVERY GUIDELINES:
- Weave insights naturally into your coaching response
- Use SUPERNova's bold, direct voice (not generic textbook style)
- Don't say "According to the content..." - just share the insights as YOUR wisdom
- Adapt frameworks/exercises to THIS user's specific situation
- If the content provides a framework, deliver it conversationally, not as a bulleted list (unless that's SUPERNova's style for that specific point)
`;
            systemPrompt += knowledgeContext;
        }
        // Add dopamine menu if user is overwhelmed
        if (dopamineMenuContext) {
            systemPrompt += dopamineMenuContext;
        }
        // Add pattern interrupt if loop detected
        if (patternInterruptContext) {
            systemPrompt += patternInterruptContext;
        }
        // Add loop history context for awareness
        if (loopHistoryContext) {
            systemPrompt += loopHistoryContext;
        }
        // Add decision killer if user is stuck deciding
        if (decisionKillerContext) {
            systemPrompt += decisionKillerContext;
        }
        // Add commitment confirmation if user made a promise
        if (commitmentContext) {
            systemPrompt += commitmentContext;
        }
        // Add check-in prompt if commitments need follow-up
        if (checkInContext) {
            systemPrompt += checkInContext;
        }
        // Add energy insights if it's time
        if (energyInsightContext) {
            systemPrompt += energyInsightContext;
        }
        // Call Claude with streaming
        const stream = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 2048,
            system: systemPrompt,
            messages: conversationHistory,
            stream: true
        });
        // Set up streaming response
        const encoder = new TextEncoder();
        let fullResponse = '';
        const readableStream = new ReadableStream({
            async start (controller) {
                try {
                    for await (const messageStreamEvent of stream){
                        if (messageStreamEvent.type === 'content_block_delta' && messageStreamEvent.delta.type === 'text_delta') {
                            const text = messageStreamEvent.delta.text;
                            fullResponse += text;
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                                text
                            })}\n\n`));
                        }
                    }
                    // Store assistant response
                    const savedMessage = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.create({
                        data: {
                            conversationId: conversation.id,
                            userId,
                            role: 'assistant',
                            content: fullResponse,
                            modelUsed: 'claude-3-5-sonnet-20241022'
                        }
                    });
                    // Update conversation timestamp
                    await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].conversation.update({
                        where: {
                            id: conversation.id
                        },
                        data: {
                            lastMessageAt: new Date()
                        }
                    });
                    // BACKGROUND: Extract memories every 5 messages
                    const messageCount = await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.count({
                        where: {
                            conversationId: conversation.id
                        }
                    });
                    if (messageCount % 5 === 0) {
                        // Run extraction in background (don't await)
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$memory$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractMemoriesFromConversation"])(conversation.id, userId).then((extracted)=>{
                            if (extracted) {
                                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$memory$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storeExtractedMemories"])(userId, conversation.id, extracted);
                            }
                        }).then(()=>{
                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$memory$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateConversationSummary"])(conversation.id, userId, mode);
                        }).catch((error)=>{
                            console.error('Background memory extraction failed:', error);
                        });
                    }
                    // Send final event with message ID
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        done: true,
                        conversationId: conversation.id,
                        messageId: savedMessage.id
                    })}\n\n`));
                    controller.close();
                } catch (error) {
                    console.error('Streaming error:', error);
                    controller.error(error);
                }
            }
        });
        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            }
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c35daa39._.js.map