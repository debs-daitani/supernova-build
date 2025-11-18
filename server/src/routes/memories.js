import express from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import { query } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Get all memories for user
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, pillar, search } = req.query;

    let query_text = `
      SELECT m.*,
             c.title as conversation_title
      FROM memories m
      LEFT JOIN conversations c ON m.conversation_id = c.id
      WHERE m.user_id = $1
    `;
    const values = [req.user.id];
    let paramCount = 2;

    if (type) {
      query_text += ` AND m.memory_type = $${paramCount++}`;
      values.push(type);
    }

    if (pillar) {
      query_text += ` AND m.pillar = $${paramCount++}`;
      values.push(pillar);
    }

    if (search) {
      query_text += ` AND to_tsvector('english', m.content) @@ plainto_tsquery('english', $${paramCount++})`;
      values.push(search);
    }

    query_text += ` ORDER BY m.importance DESC, m.created_at DESC`;

    const result = await query(query_text, values);

    res.json({
      memories: result.rows.map(m => ({
        id: m.id,
        type: m.memory_type,
        pillar: m.pillar,
        content: m.content,
        source: m.source,
        importance: m.importance,
        conversationId: m.conversation_id,
        conversationTitle: m.conversation_title,
        createdAt: m.created_at,
        updatedAt: m.updated_at
      }))
    });
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ error: 'Failed to get memories' });
  }
});

// Create memory manually
router.post(
  '/',
  authenticate,
  [
    body('type').isIn(['fact', 'preference', 'goal', 'context']),
    body('content').notEmpty().trim(),
    body('pillar').optional().isIn(['body', 'brain', 'business']),
    body('importance').optional().isInt({ min: 1, max: 10 })
  ],
  validate,
  async (req, res) => {
    try {
      const { type, content, pillar = null, importance = 5 } = req.body;

      const result = await query(
        `INSERT INTO memories (user_id, memory_type, content, pillar, importance, source)
         VALUES ($1, $2, $3, $4, $5, 'manual')
         RETURNING *`,
        [req.user.id, type, content, pillar, importance]
      );

      const memory = result.rows[0];

      res.status(201).json({
        memory: {
          id: memory.id,
          type: memory.memory_type,
          pillar: memory.pillar,
          content: memory.content,
          source: memory.source,
          importance: memory.importance,
          createdAt: memory.created_at
        }
      });
    } catch (error) {
      console.error('Create memory error:', error);
      res.status(500).json({ error: 'Failed to create memory' });
    }
  }
);

// Update memory
router.patch(
  '/:id',
  authenticate,
  [
    param('id').isUUID(),
    body('content').optional().trim(),
    body('importance').optional().isInt({ min: 1, max: 10 })
  ],
  validate,
  async (req, res) => {
    try {
      const { content, importance } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (content !== undefined) {
        updates.push(`content = $${paramCount++}`);
        values.push(content);
      }

      if (importance !== undefined) {
        updates.push(`importance = $${paramCount++}`);
        values.push(importance);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(req.params.id);
      values.push(req.user.id);

      const query_text = `
        UPDATE memories
        SET ${updates.join(', ')}
        WHERE id = $${paramCount++} AND user_id = $${paramCount}
        RETURNING *
      `;

      const result = await query(query_text, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Memory not found' });
      }

      const memory = result.rows[0];

      res.json({
        memory: {
          id: memory.id,
          type: memory.memory_type,
          pillar: memory.pillar,
          content: memory.content,
          importance: memory.importance,
          updatedAt: memory.updated_at
        }
      });
    } catch (error) {
      console.error('Update memory error:', error);
      res.status(500).json({ error: 'Failed to update memory' });
    }
  }
);

// Delete memory
router.delete(
  '/:id',
  authenticate,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const result = await query(
        'DELETE FROM memories WHERE id = $1 AND user_id = $2 RETURNING id',
        [req.params.id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Memory not found' });
      }

      res.json({ message: 'Memory deleted successfully' });
    } catch (error) {
      console.error('Delete memory error:', error);
      res.status(500).json({ error: 'Failed to delete memory' });
    }
  }
);

export default router;
