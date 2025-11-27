/**
 * Quiz Scoring Engine
 * Calculates scores, determines result tiers, and recommends programs
 */

import { prisma } from './prisma'

export interface QuizAnswer {
  questionId: string
  answer: string | number | string[] // Supports multiple choice, scale, text
}

export interface ScoringResult {
  totalScore: number
  resultTierId: string | null
  resultTier: {
    id: string
    name: string
    description: string
    imageUrl: string | null
    ctaText: string | null
    ctaUrl: string | null
    recommendedPrograms: string[]
  } | null
  recommendedPrograms: Array<{
    id: string
    title: string
    description: string
    pillar: string
    priority: number
  }>
  tags: string[] // All tags collected from answers
}

/**
 * Calculate quiz score and determine results
 */
export async function calculateQuizScore(
  quizId: string,
  answers: QuizAnswer[]
): Promise<ScoringResult> {
  // Get all questions with their options and scoring rules
  const questions = await prisma.question.findMany({
    where: { quizId },
    include: {
      options: true,
      scoringRules: {
        include: {
          resultTier: true,
          program: true,
        },
      },
    },
  })

  let totalScore = 0
  const collectedTags: string[] = []

  // Calculate score from each answer
  for (const answerData of answers) {
    const question = questions.find((q) => q.id === answerData.questionId)
    if (!question) continue

    // For multiple choice questions
    if (question.type === 'MULTIPLE_CHOICE') {
      const selectedOptionId = answerData.answer as string
      const option = question.options.find((opt) => opt.id === selectedOptionId)

      if (option) {
        totalScore += option.points
        collectedTags.push(...option.tags)
      }
    }

    // For scale questions
    if (question.type === 'SCALE') {
      const scaleValue = answerData.answer as number
      totalScore += scaleValue

      // Apply scoring rules for scale questions
      for (const rule of question.scoringRules) {
        const condition = JSON.parse(rule.condition)

        if (condition.operator === 'range') {
          const [min, max] = condition.value
          if (scaleValue >= min && scaleValue <= max) {
            totalScore += rule.points
          }
        } else if (condition.operator === 'equals') {
          if (scaleValue === condition.value) {
            totalScore += rule.points
          }
        }
      }
    }

    // For YES/NO questions
    if (question.type === 'YES_NO') {
      const yesNoAnswer = answerData.answer as string
      const option = question.options.find((opt) => opt.text.toLowerCase() === yesNoAnswer.toLowerCase())

      if (option) {
        totalScore += option.points
        collectedTags.push(...option.tags)
      }
    }
  }

  // Get result tiers for this quiz
  const resultTiers = await prisma.resultTier.findMany({
    where: { quizId },
    orderBy: { minScore: 'asc' },
  })

  // Find matching tier
  const matchingTier = resultTiers.find(
    (tier) => totalScore >= tier.minScore && totalScore <= tier.maxScore
  )

  // Get program recommendations
  const programRecommendations = await getProgramRecommendations(
    quizId,
    collectedTags,
    matchingTier?.recommendedPrograms || []
  )

  return {
    totalScore,
    resultTierId: matchingTier?.id || null,
    resultTier: matchingTier
      ? {
          id: matchingTier.id,
          name: matchingTier.name,
          description: matchingTier.description,
          imageUrl: matchingTier.imageUrl,
          ctaText: matchingTier.ctaText,
          ctaUrl: matchingTier.ctaUrl,
          recommendedPrograms: matchingTier.recommendedPrograms,
        }
      : null,
    recommendedPrograms: programRecommendations,
    tags: Array.from(new Set(collectedTags)), // Unique tags
  }
}

/**
 * Get recommended programs based on tags and tier recommendations
 */
async function getProgramRecommendations(
  quizId: string,
  tags: string[],
  tierProgramIds: string[]
) {
  // Get program recommendations configured for this quiz
  const quizRecommendations = await prisma.programRecommendation.findMany({
    where: { quizId },
    include: { program: true },
    orderBy: { priority: 'desc' },
  })

  const recommendations: Array<{
    id: string
    title: string
    description: string
    pillar: string
    priority: number
  }> = []

  // Match programs based on tags
  for (const rec of quizRecommendations) {
    const matchCount = rec.triggerTags.filter((tag) => tags.includes(tag)).length

    if (matchCount >= rec.minMatches) {
      recommendations.push({
        id: rec.program.id,
        title: rec.program.title,
        description: rec.program.description,
        pillar: rec.program.pillar,
        priority: rec.priority,
      })
    }
  }

  // Add tier-recommended programs
  if (tierProgramIds.length > 0) {
    const tierPrograms = await prisma.knowledgeProgram.findMany({
      where: { id: { in: tierProgramIds } },
    })

    for (const program of tierPrograms) {
      // Avoid duplicates
      if (!recommendations.find((r) => r.id === program.id)) {
        recommendations.push({
          id: program.id,
          title: program.title,
          description: program.description,
          pillar: program.pillar,
          priority: 50, // Medium priority for tier recommendations
        })
      }
    }
  }

  // Sort by priority (descending)
  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 3) // Top 3
}

/**
 * Generate embed code for a quiz
 */
export function generateEmbedCode(quizId: string, domain: string): string {
  const embedUrl = `${domain}/quiz/${quizId}/embed`

  return `<!-- dAItaniverse Quiz Embed -->
<div id="daitaniverse-quiz-${quizId}" style="width: 100%; min-height: 600px;"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${embedUrl}';
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '600px';
    iframe.onload = function() {
      // Auto-resize iframe based on content
      window.addEventListener('message', function(e) {
        if (e.data.type === 'quiz-resize') {
          iframe.style.height = e.data.height + 'px';
        }
      });
    };
    document.getElementById('daitaniverse-quiz-${quizId}').appendChild(iframe);
  })();
</script>`
}

/**
 * Track quiz analytics
 */
export async function trackQuizView(quizId: string) {
  await prisma.quiz.update({
    where: { id: quizId },
    data: { totalViews: { increment: 1 } },
  })

  // Update daily analytics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.quizAnalytics.upsert({
    where: {
      quizId_date: {
        quizId,
        date: today,
      },
    },
    create: {
      quizId,
      date: today,
      views: 1,
    },
    update: {
      views: { increment: 1 },
    },
  })
}

export async function trackQuizStart(quizId: string) {
  await prisma.quiz.update({
    where: { id: quizId },
    data: { totalStarts: { increment: 1 } },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.quizAnalytics.upsert({
    where: {
      quizId_date: {
        quizId,
        date: today,
      },
    },
    create: {
      quizId,
      date: today,
      starts: 1,
    },
    update: {
      starts: { increment: 1 },
    },
  })
}

export async function trackQuizCompletion(quizId: string, resultTierId: string | null, timeSpent: number) {
  await prisma.quiz.update({
    where: { id: quizId },
    data: { totalCompletions: { increment: 1 } },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const analytics = await prisma.quizAnalytics.findUnique({
    where: {
      quizId_date: {
        quizId,
        date: today,
      },
    },
  })

  if (analytics) {
    // Update existing analytics
    const currentTopResults = (analytics.topResultTiers as any) || {}
    if (resultTierId) {
      currentTopResults[resultTierId] = (currentTopResults[resultTierId] || 0) + 1
    }

    // Calculate new average time
    const totalTime = (analytics.avgTimeSpent || 0) * analytics.completions
    const newAvgTime = Math.round((totalTime + timeSpent) / (analytics.completions + 1))

    await prisma.quizAnalytics.update({
      where: {
        quizId_date: {
          quizId,
          date: today,
        },
      },
      data: {
        completions: { increment: 1 },
        avgTimeSpent: newAvgTime,
        topResultTiers: currentTopResults,
      },
    })
  } else {
    // Create new analytics record
    const topResults = resultTierId ? { [resultTierId]: 1 } : {}

    await prisma.quizAnalytics.create({
      data: {
        quizId,
        date: today,
        completions: 1,
        avgTimeSpent: timeSpent,
        topResultTiers: topResults,
      },
    })
  }
}
