import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate unique slug from title
const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substr(2, 6);
};

// Calculate quiz result based on answers
const calculateResult = (quiz, answers) => {
  let totalScore = 0;
  const resultTypes = quiz.resultTypes;

  // Calculate total score from answers
  Object.values(answers).forEach(answer => {
    if (typeof answer === 'number') {
      totalScore += answer;
    }
  });

  // Find matching result type based on score
  const sortedResults = resultTypes.sort((a, b) => a.minScore - b.minScore);
  for (const result of sortedResults) {
    if (totalScore >= result.minScore && totalScore <= result.maxScore) {
      return { resultType: result.name, score: totalScore };
    }
  }

  return { resultType: sortedResults[0].name, score: totalScore };
};

// GET /api/quizzes - Get user's quizzes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: {
            questions: true,
            responses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// POST /api/quizzes - Create quiz
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, coverImage, primaryColor, resultTypes } = req.body;

    const slug = generateSlug(title);

    const quiz = await prisma.quiz.create({
      data: {
        userId: req.user.id,
        title,
        description,
        slug,
        coverImage,
        primaryColor: primaryColor || '#FF1493',
        resultTypes: resultTypes || [],
      },
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// GET /api/quizzes/:id - Get specific quiz
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// PATCH /api/quizzes/:id - Update quiz
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const quiz = await prisma.quiz.updateMany({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: req.body,
    });

    if (quiz.count === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const updated = await prisma.quiz.findUnique({
      where: { id: req.params.id },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// DELETE /api/quizzes/:id - Delete quiz
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.quiz.deleteMany({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// POST /api/quizzes/:id/questions - Add question
router.post('/:id/questions', authenticateToken, async (req, res) => {
  try {
    const { questionText, questionType, options, scaleMin, scaleMax, scaleMinLabel, scaleMaxLabel, required } = req.body;

    // Verify quiz ownership
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get next order
    const maxOrder = await prisma.quizQuestion.aggregate({
      where: { quizId: req.params.id },
      _max: { order: true },
    });

    const question = await prisma.quizQuestion.create({
      data: {
        quizId: req.params.id,
        order: (maxOrder._max.order || 0) + 1,
        questionText,
        questionType,
        options: options || null,
        scaleMin,
        scaleMax,
        scaleMinLabel,
        scaleMaxLabel,
        required: required !== false,
      },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// PATCH /api/quizzes/:quizId/questions/:id - Update question
router.patch('/:quizId/questions/:id', authenticateToken, async (req, res) => {
  try {
    const question = await prisma.quizQuestion.findFirst({
      where: { id: req.params.id },
      include: { quiz: true },
    });

    if (!question || question.quiz.userId !== req.user.id) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const updated = await prisma.quizQuestion.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE /api/quizzes/:quizId/questions/:id - Delete question
router.delete('/:quizId/questions/:id', authenticateToken, async (req, res) => {
  try {
    const question = await prisma.quizQuestion.findFirst({
      where: { id: req.params.id },
      include: { quiz: true },
    });

    if (!question || question.quiz.userId !== req.user.id) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await prisma.quizQuestion.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// GET /api/quizzes/slug/:slug - Get quiz by slug (PUBLIC)
router.get('/slug/:slug', async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { slug: req.params.slug, published: true },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Increment view count
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// POST /api/quizzes/:id/responses - Submit quiz response (PUBLIC)
router.post('/:id/responses', async (req, res) => {
  try {
    const { answers, respondentEmail, respondentName } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
    });

    if (!quiz || !quiz.published) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate result
    const { resultType, score } = calculateResult(quiz, answers);

    const response = await prisma.quizResponse.create({
      data: {
        quizId: req.params.id,
        answers,
        respondentEmail,
        respondentName,
        resultType,
        score,
      },
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

// GET /api/quizzes/:id/responses - Get quiz responses
router.get('/:id/responses', authenticateToken, async (req, res) => {
  try {
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const responses = await prisma.quizResponse.findMany({
      where: { quizId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// GET /api/quizzes/:id/analytics - Get quiz analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const totalResponses = await prisma.quizResponse.count({
      where: { quizId: req.params.id },
    });

    const resultBreakdown = await prisma.quizResponse.groupBy({
      by: ['resultType'],
      where: { quizId: req.params.id },
      _count: true,
    });

    res.json({
      views: quiz.viewCount,
      responses: totalResponses,
      completionRate: quiz.viewCount > 0 ? (totalResponses / quiz.viewCount) * 100 : 0,
      resultBreakdown,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
