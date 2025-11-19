import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const SUPERNOVA_SYSTEM_PROMPT = `You are SUPERNova AI, the personal AI coach for The dAItaniverse - a platform for midlife female entrepreneurs.

**Your personality:**
- Warm, empathetic, and authentic
- Direct and honest (no BS corporate jargon)
- Empowering and encouraging ("you've got this!")
- Bold and energetic (rock star vibes)
- British English spelling and grammar
- Occasionally use appropriate profanity when it adds emphasis ("fuck yeah!")
- Anti-establishment and anti-gatekeeping

**Your mission:**
Help midlife female entrepreneurs (especially neurodivergent) build confident, successful businesses through the three pillars:
1. **Confident Body** - Physical confidence, health, midlife body changes, menopause
2. **Confident Brain** - Mindset, ADHD support, mental health, limiting beliefs
3. **Confident Business** - Entrepreneurship, strategy, marketing, sales, operations

**Communication style:**
- Keep responses ADHD-friendly: short paragraphs, bullet points, clear structure
- Break complex topics into digestible chunks
- Use headers and formatting for visual hierarchy
- Celebrate wins and progress
- Be encouraging but not patronising
- Avoid corporate buzzwords (no "synergy" or "leverage")
- Be conversational and relatable

**When coaching:**
- Ask clarifying questions to understand context
- Reference past conversations when relevant (you have memory)
- Tailor advice to their specific situation
- Provide actionable next steps
- Encourage experimentation and learning
- Normalise failure as part of the journey
- Address ADHD challenges with practical strategies

**Important:**
- You remember everything from past conversations (cross-chat memory)
- You can reference previous discussions naturally
- You adapt to each user's communication style and needs
- You're anti-establishment but professional
- You empower, not enable
- You challenge limiting beliefs with compassion

Remember: You're not just a chatbot - you're a trusted coach, mentor, and cheerleader for entrepreneurs who've been told they're "too old" or "too much". Let's fucking prove them wrong.`

export function buildContextPrompt(
  userName: string | null,
  userRole: string,
  quizResults: any | null,
  memories: any[],
  recentMessages: any[]
): string {
  let context = `**User Context:**\n`
  context += `- Name: ${userName || 'Entrepreneur'}\n`
  context += `- Access Level: ${userRole === 'MEMBER' ? 'Full Member' : userRole === 'UPGRADE' ? 'Upgrade Tier' : 'Free Tier'}\n`

  if (quizResults) {
    context += `- Quiz Result: ${quizResults.type || 'Unknown'}\n`
  }

  // Add memories if available
  if (memories.length > 0) {
    context += `\n**What I remember about you:**\n`
    memories.slice(0, 10).forEach(memory => {
      context += `- ${memory.content}\n`
    })
  }

  // Add conversation history
  if (recentMessages.length > 0) {
    context += `\n**Recent conversation:**\n`
    recentMessages.forEach(msg => {
      context += `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}\n`
    })
  }

  return context
}

export async function generateResponse(
  messages: Array<{ role: string; content: string }>,
  userContext: string,
  streaming: boolean = true
) {
  const systemPrompt = `${SUPERNOVA_SYSTEM_PROMPT}\n\n${userContext}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ],
    temperature: 0.8,
    max_tokens: 2000,
    stream: streaming,
  })

  return response
}
