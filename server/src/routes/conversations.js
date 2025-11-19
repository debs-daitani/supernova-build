import express from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import OpenAI from 'openai';
import { query } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// SUPERNova system prompts by pillar
const SYSTEM_PROMPTS = {
  body: `You are SUPERNova AI, specialising in the Confident Body pillar. You help users with health, fitness, nutrition, sleep, and physical wellbeing. You're supportive, encouraging, and ADHD-friendly in your responses - using short paragraphs, bullet points, and clear structure. Remember key facts about the user to personalise your guidance.`,

  brain: `You are SUPERNova AI, specialising in the Confident Brain pillar. You help users with mental health, learning, personal growth, ADHD management, and cognitive wellbeing. You're empathetic, patient, and ADHD-friendly - using short paragraphs, clear structure, and actionable advice. Remember the user's preferences and challenges to tailor your support.`,

  business: `You are SUPERNova AI, specialising in the Confident Business pillar. You help users with entrepreneurship, marketing, business strategy, productivity, and professional growth. You're practical, strategic, and ADHD-friendly - breaking down complex topics into clear, actionable steps. Remember the user's business goals and niche to provide relevant guidance.`,

  general: `You are SUPERNova AI, a supportive AI coach for confident living across Body, Brain, and Business. You help users achieve their goals with ADHD-friendly guidance - clear structure, short paragraphs, and practical advice. Remember key information about users to personalise your responses.`
};

// Create new conversation
router.post(
  '/',
  authenticate,
  [
    body('title').optional().trim(),
    body('pillar').optional().isIn(['body', 'brain', 'business'])
  ],
  validate,
  async (req, res) => {
    try {
      const { title = 'New Conversation', pillar = null } = req.body;

      const result = await query(
        `INSERT INTO conversations (user_id, title, pillar)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [req.user.id, title, pillar]
      );

      const conversation = result.rows[0];

      res.status(201).json({
        conversation: {
          id: conversation.id,
          title: conversation.title,
          pillar: conversation.pillar,
          isStarred: conversation.is_starred,
          isArchived: conversation.is_archived,
          folder: conversation.folder,
          messageCount: conversation.message_count,
          lastMessageAt: conversation.last_message_at,
          createdAt: conversation.created_at
        }
      });
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  }
);

// Get all conversations for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { pillar, search, folder, archived } = req.query;

    let query_text = `
      SELECT c.*,
             (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM conversations c
      WHERE c.user_id = $1
    `;
    const values = [req.user.id];
    let paramCount = 2;

    // Add filters
    if (pillar) {
      query_text += ` AND c.pillar = $${paramCount++}`;
      values.push(pillar);
    }

    if (folder) {
      query_text += ` AND c.folder = $${paramCount++}`;
      values.push(folder);
    }

    if (archived === 'true') {
      query_text += ` AND c.is_archived = true`;
    } else {
      query_text += ` AND c.is_archived = false`;
    }

    if (search) {
      query_text += ` AND c.title ILIKE $${paramCount++}`;
      values.push(`%${search}%`);
    }

    query_text += ` ORDER BY c.last_message_at DESC`;

    const result = await query(query_text, values);

    res.json({
      conversations: result.rows.map(c => ({
        id: c.id,
        title: c.title,
        pillar: c.pillar,
        folder: c.folder,
        isStarred: c.is_starred,
        isArchived: c.is_archived,
        messageCount: c.message_count,
        lastMessage: c.last_message,
        lastMessageAt: c.last_message_at,
        createdAt: c.created_at
      }))
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get single conversation with messages
router.get(
  '/:id',
  authenticate,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      // Get conversation
      const convResult = await query(
        'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );

      if (convResult.rows.length === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const conversation = convResult.rows[0];

      // Get messages
      const messagesResult = await query(
        'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [req.params.id]
      );

      res.json({
        conversation: {
          id: conversation.id,
          title: conversation.title,
          pillar: conversation.pillar,
          folder: conversation.folder,
          isStarred: conversation.is_starred,
          isArchived: conversation.is_archived,
          messageCount: conversation.message_count,
          lastMessageAt: conversation.last_message_at,
          createdAt: conversation.created_at
        },
        messages: messagesResult.rows.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.created_at
        }))
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Failed to get conversation' });
    }
  }
);

// Send message and get AI response (with streaming)
router.post(
  '/:id/messages',
  authenticate,
  [
    param('id').isUUID(),
    body('content').notEmpty().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const conversationId = req.params.id;
      const { content } = req.body;

      // Verify conversation belongs to user
      const convResult = await query(
        'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
        [conversationId, req.user.id]
      );

      if (convResult.rows.length === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const conversation = convResult.rows[0];

      // Store user message
      await query(
        `INSERT INTO messages (conversation_id, user_id, role, content)
         VALUES ($1, $2, 'user', $3)`,
        [conversationId, req.user.id, content]
      );

      // Get recent messages for context (last 10)
      const messagesResult = await query(
        `SELECT role, content FROM messages
         WHERE conversation_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [conversationId]
      );

      const recentMessages = messagesResult.rows.reverse();

      // Get user memories for context
      const memoriesResult = await query(
        `SELECT content FROM memories
         WHERE user_id = $1 AND (pillar = $2 OR pillar IS NULL)
         ORDER BY importance DESC, created_at DESC
         LIMIT 5`,
        [req.user.id, conversation.pillar]
      );

      // Build context
      const systemPrompt = SYSTEM_PROMPTS[conversation.pillar || 'general'];
      let contextPrompt = systemPrompt;

      if (memoriesResult.rows.length > 0) {
        contextPrompt += '\n\nWhat I remember about you:\n';
        memoriesResult.rows.forEach(m => {
          contextPrompt += `- ${m.content}\n`;
        });
      }

      // Build messages for OpenAI
      const messages = [
        { role: 'system', content: contextPrompt },
        ...recentMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content }
      ];

      // Set headers for SSE (Server-Sent Events)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream response from OpenAI
      const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Send done signal
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();

      // Store AI response in database
      await query(
        `INSERT INTO messages (conversation_id, user_id, role, content)
         VALUES ($1, $2, 'assistant', $3)`,
        [conversationId, req.user.id, fullResponse]
      );

      // Update conversation
      await query(
        `UPDATE conversations
         SET last_message_at = CURRENT_TIMESTAMP,
             message_count = message_count + 2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [conversationId]
      );

      // Auto-generate title if it's still "New Conversation"
      if (conversation.title === 'New Conversation' && conversation.message_count === 0) {
        // Use first user message as title (truncated)
        const title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
        await query(
          'UPDATE conversations SET title = $1 WHERE id = $2',
          [title, conversationId]
        );
      }

      // TODO: Extract and store memories in background

    } catch (error) {
      console.error('Send message error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to send message' });
      } else {
        res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
        res.end();
      }
    }
  }
);

// Update conversation
router.patch(
  '/:id',
  authenticate,
  [
    param('id').isUUID(),
    body('title').optional().trim(),
    body('pillar').optional().isIn(['body', 'brain', 'business']),
    body('folder').optional().trim(),
    body('isStarred').optional().isBoolean(),
    body('isArchived').optional().isBoolean()
  ],
  validate,
  async (req, res) => {
    try {
      const { title, pillar, folder, isStarred, isArchived } = req.body;

      // Build update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (pillar !== undefined) {
        updates.push(`pillar = $${paramCount++}`);
        values.push(pillar);
      }
      if (folder !== undefined) {
        updates.push(`folder = $${paramCount++}`);
        values.push(folder);
      }
      if (isStarred !== undefined) {
        updates.push(`is_starred = $${paramCount++}`);
        values.push(isStarred);
      }
      if (isArchived !== undefined) {
        updates.push(`is_archived = $${paramCount++}`);
        values.push(isArchived);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(req.params.id);
      values.push(req.user.id);

      const query_text = `
        UPDATE conversations
        SET ${updates.join(', ')}
        WHERE id = $${paramCount++} AND user_id = $${paramCount}
        RETURNING *
      `;

      const result = await query(query_text, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const conversation = result.rows[0];

      res.json({
        conversation: {
          id: conversation.id,
          title: conversation.title,
          pillar: conversation.pillar,
          folder: conversation.folder,
          isStarred: conversation.is_starred,
          isArchived: conversation.is_archived,
          messageCount: conversation.message_count,
          lastMessageAt: conversation.last_message_at,
          createdAt: conversation.created_at
        }
      });
    } catch (error) {
      console.error('Update conversation error:', error);
      res.status(500).json({ error: 'Failed to update conversation' });
    }
  }
);

// Delete conversation
router.delete(
  '/:id',
  authenticate,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const result = await query(
        'DELETE FROM conversations WHERE id = $1 AND user_id = $2 RETURNING id',
        [req.params.id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  }
);

// Search across all conversations
router.get('/search/messages', authenticate, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const result = await query(
      `SELECT m.*, c.title as conversation_title, c.pillar
       FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE m.user_id = $1
         AND to_tsvector('english', m.content) @@ plainto_tsquery('english', $2)
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [req.user.id, q]
    );

    res.json({
      results: result.rows.map(m => ({
        messageId: m.id,
        conversationId: m.conversation_id,
        conversationTitle: m.conversation_title,
        pillar: m.pillar,
        role: m.role,
        content: m.content,
        createdAt: m.created_at
      }))
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

export default router;
