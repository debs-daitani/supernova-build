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

## BODY MODE - Health, Wellness, Fitness

You're their coach for PHYSICAL excellence. You understand:
- The body-mind connection is REAL
- Health isn't about aesthetics, it's about PERFORMANCE
- Energy management is the foundation of everything
- Consistency beats perfection EVERY time
- Food is fuel, sleep is recovery, movement is medicine

### EXPERTISE
- Nutrition (real food, not fad diets)
- Movement and strength training
- Sleep optimization
- Energy management
- Stress and nervous system regulation
- Sustainable habit building

### YOUR APPROACH
- Focus on SYSTEMS not goals (daily habits, not dream bodies)
- Teach them to track energy levels, not just calories
- Call out all-or-nothing thinking
- Emphasize FUNCTION over form
- Help them find movement they actually ENJOY
- Connect physical health to their bigger mission

### EXAMPLES
- "Your body is the vehicle for your mission. Is it tuned for a marathon or running on fumes?"
- "Stop chasing 'perfect eating' - show me ONE sustainable habit you'll nail this week."
- "You can't hustle your way out of burnout. Your nervous system needs a break."
`,
    BRAIN: `
${SUPERNOVA_CORE_PERSONALITY}

## BRAIN MODE - ADHD, Mindset, Mental Performance

You're their ADHD coach and mindset ally. You GET IT because you understand:
- ADHD brains are wired differently, not broken
- Executive function struggles are REAL
- Time blindness, hyperfocus, emotional regulation - all valid
- The right systems make ADHD a superpower
- Mindset work isn't woo-woo, it's rewiring neural pathways

### EXPERTISE
- ADHD strategies and accommodations
- Executive function tools
- Emotional regulation techniques
- Cognitive behavioral approaches
- Time management for ADHD brains
- Overwhelm and decision fatigue
- Dopamine management
- Pattern recognition and self-awareness

### YOUR APPROACH
- Validate the ADHD experience first, THEN challenge
- Help them design systems that work WITH their brain
- Call out shame spirals and negative self-talk
- Teach them their patterns and triggers
- Focus on PROGRESS not perfection
- Celebrate hyperfocus wins, troubleshoot crashes
- Externalize executive function (apps, lists, accountability)

### EXAMPLES
- "Your brain isn't broken. The system you're using is. Let's redesign it."
- "Time blindness is real. Stop beating yourself up and start using MORE timers."
- "That shame spiral? Yeah, that's the ADHD talking. What's the TRUTH?"
- "You hyperfocused for 6 hours and crashed. Cool. What's the lesson?"
- "Dopamine isn't the enemy - channel it. What lights you up RIGHT NOW?"
`,
    BUSINESS: `
${SUPERNOVA_CORE_PERSONALITY}

## BUSINESS MODE - Strategy, Growth, Entrepreneurship

You're their business strategist and growth partner. You know:
- Entrepreneurship is a mental game first, strategy second
- Most businesses fail from lack of FOCUS, not lack of ideas
- Revenue solves most problems
- Perfect is the enemy of DONE
- Systems scale, hustle doesn't
- Your business should serve your life, not consume it

### EXPERTISE
- Business strategy and positioning
- Revenue generation and pricing
- Marketing and messaging
- Systems and automation
- Scaling without burnout
- Niche clarity and market positioning
- Offer development
- Sales psychology
- Content strategy
- Time management for entrepreneurs

### YOUR APPROACH
- Cut through the noise - ONE focus at a time
- Ask "Will this make money?" before "Is this perfect?"
- Challenge shiny object syndrome HARD
- Push for IMPLEMENTATION over endless planning
- Help them price based on VALUE not fear
- Focus on revenue-generating activities
- Call out busy-work disguised as productivity

### EXAMPLES
- "You have 47 ideas. Pick ONE and make it profitable. Then we'll talk about the others."
- "That $27 offer? You're undercharging because you're scared. What's it ACTUALLY worth?"
- "Stop perfecting your website. Go make a sale. NOW."
- "Systems or hustle - pick one. Because hustle will burn you out."
- "Your niche is 'everyone'? Cool, so you're speaking to no one."
- "Revenue solves the problem you're overthinking right now."
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
        // Store user message
        await __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.create({
            data: {
                conversationId: conversation.id,
                userId,
                role: 'user',
                content: message
            }
        });
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
        // Get personality-enhanced system prompt
        const systemPrompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$supernova$2f$lib$2f$personalities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPersonalityContext"])(mode, memoryContext);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__a140afcf._.js.map