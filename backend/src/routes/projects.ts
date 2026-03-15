import { Router, Response } from 'express';
import crypto from 'crypto';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

function generateApiKey(): string {
  return 'wf_' + crypto.randomBytes(24).toString('hex');
}

function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// POST /projects - Create a project
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;

  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: 'Project name is required' });
    return;
  }

  try {
    const apiKey = generateApiKey();
    const result = await query(
      'INSERT INTO projects (user_id, name, api_key) VALUES ($1, $2, $3) RETURNING id, name, api_key, created_at',
      [req.userId, name.trim(), apiKey]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /projects - List user's projects
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.api_key, p.created_at,
              COUNT(f.id)::int AS feedback_count
       FROM projects p
       LEFT JOIN feedback f ON f.project_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List projects error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /projects/:id - Get project details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT id, user_id, name, api_key, created_at FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /projects/:id - Update project
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;

  try {
    const result = await query(
      'UPDATE projects SET name = COALESCE($1, name) WHERE id = $2 AND user_id = $3 RETURNING id, name, api_key, created_at',
      [name?.trim() || null, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /projects/:id - Delete project
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /projects/:id/api-key - Regenerate API key
router.post('/:id/api-key', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newApiKey = generateApiKey();
    const result = await query(
      'UPDATE projects SET api_key = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name, api_key, created_at',
      [newApiKey, req.params.id, req.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Regenerate API key error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /projects/:id/invite - Create invite link
router.post('/:id/invite', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    // Verify project ownership
    const project = await query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (project.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const inviteToken = generateInviteToken();
    const result = await query(
      'INSERT INTO project_invites (project_id, email, invited_by, invite_token) VALUES ($1, $2, $3, $4) RETURNING id, invite_token, created_at',
      [req.params.id, email?.toLowerCase() || null, req.userId, inviteToken]
    );

    res.status(201).json({
      ...result.rows[0],
      inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${inviteToken}`,
    });
  } catch (err) {
    console.error('Create invite error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
