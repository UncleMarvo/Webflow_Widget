import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validateApiKey, ApiKeyRequest } from '../middleware/apiKeyAuth';
import { sendFeedbackNotification } from '../services/email';
import { getTierConfig } from '../config/tiers';

const router = Router();

// POST /feedback - Public endpoint (authenticated via API key)
router.post('/', validateApiKey, async (req: ApiKeyRequest, res: Response): Promise<void> => {
  const { url, pageTitle, x, y, annotation, screenshotUrl, deviceType, viewportWidth, viewportHeight,
    browserName, browserVersion, osName, osVersion, userAgent, devicePixelRatio, screenWidth, screenHeight } = req.body;

  if (!url || !annotation) {
    res.status(400).json({ error: 'URL and annotation are required' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO feedback (project_id, url, page_title, x, y, annotation, screenshot_url, device_type, viewport_width, viewport_height,
        browser_name, browser_version, os_name, os_version, user_agent, device_pixel_ratio, screen_width, screen_height)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [req.projectId, url, pageTitle || null, x || null, y || null, annotation, screenshotUrl || null, deviceType || null, viewportWidth || null, viewportHeight || null,
        browserName || null, browserVersion || null, osName || null, osVersion || null, userAgent || null, devicePixelRatio || null, screenWidth || null, screenHeight || null]
    );

    const feedback = result.rows[0];

    // Auto-assign to active round (non-blocking)
    (async () => {
      try {
        // Find active round for this project
        let activeRound = await query(
          `SELECT id FROM rounds WHERE project_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1`,
          [req.projectId]
        );

        // If no active round, auto-create one
        if (activeRound.rows.length === 0) {
          const roundCount = await query(
            'SELECT COUNT(*)::int AS count FROM rounds WHERE project_id = $1',
            [req.projectId]
          );
          const roundNumber = (roundCount.rows[0].count || 0) + 1;
          activeRound = await query(
            `INSERT INTO rounds (project_id, name, status) VALUES ($1, $2, 'active') RETURNING id`,
            [req.projectId, `Round ${roundNumber}`]
          );
        }

        if (activeRound.rows.length > 0) {
          const roundId = activeRound.rows[0].id;
          await query(
            `UPDATE feedback SET round_id = $1, assigned_to_round_at = NOW() WHERE id = $2`,
            [roundId, feedback.id]
          );
          await query(
            `INSERT INTO round_feedback (round_id, feedback_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [roundId, feedback.id]
          );
        }
      } catch (roundErr) {
        console.error('Round assignment error:', roundErr);
      }
    })();

    // Track monthly usage (non-blocking)
    const currentMonth = new Date().toISOString().slice(0, 7);
    query(
      `INSERT INTO usage_tracking (user_id, month, feedback_count)
       SELECT p.user_id, $2, 1 FROM projects p WHERE p.id = $1
       ON CONFLICT (user_id, month)
       DO UPDATE SET feedback_count = usage_tracking.feedback_count + 1, updated_at = NOW()`,
      [req.projectId, currentMonth]
    ).catch(err => console.error('Usage tracking error:', err));

    // Send email notification (non-blocking)
    sendFeedbackNotification(req.projectId!, feedback).catch(err =>
      console.error('Failed to send feedback notification:', err)
    );

    res.status(201).json(feedback);
  } catch (err) {
    console.error('Create feedback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /projects/:projectId/feedback - Authenticated, list feedback
router.get('/projects/:projectId/feedback', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = (page - 1) * limit;
  const status = req.query.status as string;
  const roundId = req.query.roundId as string;

  try {
    // Verify ownership
    const project = await query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [projectId, req.userId]);
    if (project.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    let whereClause = 'WHERE f.project_id = $1';
    const params: unknown[] = [projectId];

    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      whereClause += ` AND f.status = $${params.length + 1}`;
      params.push(status);
    }

    if (roundId) {
      if (roundId === 'unassigned') {
        whereClause += ' AND f.round_id IS NULL';
      } else {
        whereClause += ` AND f.round_id = $${params.length + 1}`;
        params.push(roundId);
      }
    }

    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM feedback f ${whereClause}`,
      params
    );

    const feedbackResult = await query(
      `SELECT f.*, r.name AS round_name, r.status AS round_status
       FROM feedback f
       LEFT JOIN rounds r ON r.id = f.round_id
       ${whereClause} ORDER BY f.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({
      feedback: feedbackResult.rows,
      pagination: {
        page,
        limit,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
  } catch (err) {
    console.error('List feedback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /feedback/:id - Update feedback status/priority
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, priority } = req.body;

  const validStatuses = ['todo', 'in-progress', 'done'];
  const validPriorities = ['low', 'normal', 'high', 'urgent'];

  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  if (priority && !validPriorities.includes(priority)) {
    res.status(400).json({ error: `Priority must be one of: ${validPriorities.join(', ')}` });
    return;
  }

  try {
    // Verify ownership via project and check round status
    const ownership = await query(
      `SELECT f.id, f.round_id, r.status AS round_status FROM feedback f
       JOIN projects p ON p.id = f.project_id
       LEFT JOIN rounds r ON r.id = f.round_id
       WHERE f.id = $1 AND p.user_id = $2`,
      [req.params.id, req.userId]
    );

    if (ownership.rows.length === 0) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    // Prevent modifications to feedback in frozen rounds
    if (ownership.rows[0].round_status === 'frozen') {
      res.status(400).json({ error: 'Cannot modify feedback in a frozen round' });
      return;
    }

    const setClauses: string[] = [];
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      setClauses.push(`status = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      setClauses.push(`priority = $${params.length}`);
    }

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'Nothing to update' });
      return;
    }

    params.push(req.params.id);
    const result = await query(
      `UPDATE feedback SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update feedback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /feedback/:id - Delete feedback
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `DELETE FROM feedback f
       USING projects p
       WHERE f.project_id = p.id AND f.id = $1 AND p.user_id = $2
       RETURNING f.id`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    console.error('Delete feedback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /feedback/tier?apiKey=... — Public: returns tier features for widget gating
router.get('/tier', async (req: Request, res: Response): Promise<void> => {
  const apiKey = req.query.apiKey as string;
  if (!apiKey) {
    res.status(400).json({ error: 'Missing apiKey parameter' });
    return;
  }

  try {
    const result = await query(
      `SELECT u.subscription_tier FROM users u
       JOIN projects p ON p.user_id = u.id
       WHERE p.api_key = $1`,
      [apiKey]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const tier = result.rows[0].subscription_tier || 'starter';
    const config = getTierConfig(tier);

    res.json({
      tier: config.name,
      features: config.features,
    });
  } catch (err) {
    console.error('Get widget tier error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
