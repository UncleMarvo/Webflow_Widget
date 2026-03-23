import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { loadSubscription, requireFeature, SubscriptionRequest } from '../middleware/featureGate';

const router = Router();

// Helper: verify project ownership, returns project row or null
async function verifyProjectOwnership(projectId: string, userId: string) {
  const result = await query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
  return result.rows[0] || null;
}

// Helper: get the next round number for a project
async function getNextRoundNumber(projectId: string): Promise<number> {
  const result = await query(
    'SELECT COUNT(*)::int AS count FROM rounds WHERE project_id = $1',
    [projectId]
  );
  return (result.rows[0].count || 0) + 1;
}

// GET /projects/:id/rounds — list all rounds for a project
router.get('/projects/:id/rounds', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const includeArchived = req.query.includeArchived === 'true';

  try {
    const project = await verifyProjectOwnership(id, req.userId!);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    let whereClause = 'WHERE r.project_id = $1';
    if (!includeArchived) {
      whereClause += " AND r.status != 'archived'";
    }

    const result = await query(
      `SELECT r.*,
              (SELECT COUNT(*)::int FROM feedback f WHERE f.round_id = r.id) AS feedback_count
       FROM rounds r
       ${whereClause}
       ORDER BY r.created_at ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('List rounds error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /projects/:id/rounds — create new round (requires Premium)
router.post(
  '/projects/:id/rounds',
  authenticate,
  loadSubscription,
  requireFeature('rounds'),
  async (req: SubscriptionRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { name, description, startsAt, endsAt } = req.body;

    try {
      const project = await verifyProjectOwnership(id, req.userId!);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const roundNumber = await getNextRoundNumber(id);
      const roundName = name?.trim() || `Round ${roundNumber}`;

      const result = await query(
        `INSERT INTO rounds (project_id, name, status, description, starts_at, ends_at)
         VALUES ($1, $2, 'active', $3, $4, $5)
         RETURNING *`,
        [id, roundName, description || null, startsAt || null, endsAt || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Create round error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PATCH /rounds/:id — update round (name, description, status)
router.patch(
  '/rounds/:id',
  authenticate,
  loadSubscription,
  async (req: SubscriptionRequest, res: Response): Promise<void> => {
    const { name, description, status, startsAt, endsAt } = req.body;

    try {
      // Verify ownership via project
      const round = await query(
        `SELECT r.* FROM rounds r
         JOIN projects p ON p.id = r.project_id
         WHERE r.id = $1 AND p.user_id = $2`,
        [req.params.id, req.userId]
      );

      if (round.rows.length === 0) {
        res.status(404).json({ error: 'Round not found' });
        return;
      }

      const currentRound = round.rows[0];

      // If changing status, require Premium
      if (status && status !== currentRound.status) {
        const tier = req.subscriptionTier || 'pro';
        const { hasFeature } = await import('../config/tiers');
        if (!hasFeature(tier, 'rounds')) {
          res.status(403).json({
            error: 'Feature not available',
            message: 'Upgrade to Premium to manage round statuses.',
            code: 'FEATURE_NOT_AVAILABLE',
          });
          return;
        }
      }

      const setClauses: string[] = [];
      const params: unknown[] = [];

      if (name !== undefined) {
        params.push(name.trim());
        setClauses.push(`name = $${params.length}`);
      }
      if (description !== undefined) {
        params.push(description);
        setClauses.push(`description = $${params.length}`);
      }
      if (status !== undefined) {
        const validStatuses = ['active', 'frozen', 'archived'];
        if (!validStatuses.includes(status)) {
          res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
          return;
        }
        params.push(status);
        setClauses.push(`status = $${params.length}`);
      }
      if (startsAt !== undefined) {
        params.push(startsAt || null);
        setClauses.push(`starts_at = $${params.length}`);
      }
      if (endsAt !== undefined) {
        params.push(endsAt || null);
        setClauses.push(`ends_at = $${params.length}`);
      }

      if (setClauses.length === 0) {
        res.status(400).json({ error: 'Nothing to update' });
        return;
      }

      setClauses.push('updated_at = NOW()');
      params.push(req.params.id);

      const result = await query(
        `UPDATE rounds SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Update round error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /rounds/:id — archive round (soft delete)
router.delete('/rounds/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `UPDATE rounds r SET status = 'archived', updated_at = NOW()
       FROM projects p
       WHERE r.project_id = p.id AND r.id = $1 AND p.user_id = $2
       RETURNING r.*`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Round not found' });
      return;
    }

    // Unassign feedback from this round (move to unassigned)
    await query(
      `UPDATE feedback SET round_id = NULL, assigned_to_round_at = NULL WHERE round_id = $1`,
      [req.params.id]
    );

    res.json({ message: 'Round archived', round: result.rows[0] });
  } catch (err) {
    console.error('Delete round error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /rounds/:id/freeze — freeze a round
router.post(
  '/rounds/:id/freeze',
  authenticate,
  loadSubscription,
  requireFeature('rounds'),
  async (req: SubscriptionRequest, res: Response): Promise<void> => {
    try {
      const round = await query(
        `SELECT r.* FROM rounds r
         JOIN projects p ON p.id = r.project_id
         WHERE r.id = $1 AND p.user_id = $2`,
        [req.params.id, req.userId]
      );

      if (round.rows.length === 0) {
        res.status(404).json({ error: 'Round not found' });
        return;
      }

      if (round.rows[0].status === 'frozen') {
        res.status(400).json({ error: 'Round is already frozen' });
        return;
      }

      if (round.rows[0].status === 'archived') {
        res.status(400).json({ error: 'Cannot freeze an archived round' });
        return;
      }

      const result = await query(
        `UPDATE rounds SET status = 'frozen', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [req.params.id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Freeze round error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /rounds/:id/unfreeze — unfreeze a round
router.post(
  '/rounds/:id/unfreeze',
  authenticate,
  loadSubscription,
  requireFeature('rounds'),
  async (req: SubscriptionRequest, res: Response): Promise<void> => {
    try {
      const round = await query(
        `SELECT r.* FROM rounds r
         JOIN projects p ON p.id = r.project_id
         WHERE r.id = $1 AND p.user_id = $2`,
        [req.params.id, req.userId]
      );

      if (round.rows.length === 0) {
        res.status(404).json({ error: 'Round not found' });
        return;
      }

      if (round.rows[0].status !== 'frozen') {
        res.status(400).json({ error: 'Round is not frozen' });
        return;
      }

      const result = await query(
        `UPDATE rounds SET status = 'active', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [req.params.id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Unfreeze round error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /rounds/:id/assign-feedback — assign feedback items to a round
router.post('/rounds/:id/assign-feedback', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { feedbackIds } = req.body;

  if (!Array.isArray(feedbackIds) || feedbackIds.length === 0) {
    res.status(400).json({ error: 'feedbackIds must be a non-empty array' });
    return;
  }

  try {
    // Verify round ownership and check status
    const round = await query(
      `SELECT r.* FROM rounds r
       JOIN projects p ON p.id = r.project_id
       WHERE r.id = $1 AND p.user_id = $2`,
      [req.params.id, req.userId]
    );

    if (round.rows.length === 0) {
      res.status(404).json({ error: 'Round not found' });
      return;
    }

    if (round.rows[0].status === 'frozen') {
      res.status(400).json({ error: 'Cannot add feedback to a frozen round' });
      return;
    }

    if (round.rows[0].status === 'archived') {
      res.status(400).json({ error: 'Cannot add feedback to an archived round' });
      return;
    }

    // Update feedback to point to this round
    const result = await query(
      `UPDATE feedback SET round_id = $1, assigned_to_round_at = NOW()
       WHERE id = ANY($2::uuid[]) AND project_id = $3
       RETURNING id`,
      [req.params.id, feedbackIds, round.rows[0].project_id]
    );

    // Also insert into round_feedback junction table
    for (const feedbackId of result.rows.map((r: { id: string }) => r.id)) {
      await query(
        `INSERT INTO round_feedback (round_id, feedback_id)
         VALUES ($1, $2)
         ON CONFLICT (round_id, feedback_id) DO NOTHING`,
        [req.params.id, feedbackId]
      ).catch(() => {}); // Ignore duplicates
    }

    res.json({ assigned: result.rows.length, feedbackIds: result.rows.map((r: { id: string }) => r.id) });
  } catch (err) {
    console.error('Assign feedback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /feedback/:id/move-to-round — move a single feedback to a different round (or unassign)
router.post('/feedback/:id/move-to-round', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { roundId } = req.body; // null to unassign

  try {
    // Verify feedback ownership
    const feedback = await query(
      `SELECT f.id, f.project_id, f.round_id FROM feedback f
       JOIN projects p ON p.id = f.project_id
       WHERE f.id = $1 AND p.user_id = $2`,
      [req.params.id, req.userId]
    );

    if (feedback.rows.length === 0) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    if (roundId) {
      // Verify the target round exists, belongs to the same project, and is not frozen
      const targetRound = await query(
        `SELECT id, status, project_id FROM rounds WHERE id = $1`,
        [roundId]
      );

      if (targetRound.rows.length === 0) {
        res.status(404).json({ error: 'Target round not found' });
        return;
      }

      if (targetRound.rows[0].project_id !== feedback.rows[0].project_id) {
        res.status(400).json({ error: 'Round belongs to a different project' });
        return;
      }

      if (targetRound.rows[0].status === 'frozen') {
        res.status(400).json({ error: 'Cannot move feedback to a frozen round' });
        return;
      }

      if (targetRound.rows[0].status === 'archived') {
        res.status(400).json({ error: 'Cannot move feedback to an archived round' });
        return;
      }
    }

    // Remove old junction entry
    if (feedback.rows[0].round_id) {
      await query(
        'DELETE FROM round_feedback WHERE feedback_id = $1 AND round_id = $2',
        [req.params.id, feedback.rows[0].round_id]
      );
    }

    // Update feedback
    const result = await query(
      `UPDATE feedback SET round_id = $1, assigned_to_round_at = $2 WHERE id = $3 RETURNING *`,
      [roundId || null, roundId ? new Date().toISOString() : null, req.params.id]
    );

    // Add new junction entry
    if (roundId) {
      await query(
        `INSERT INTO round_feedback (round_id, feedback_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [roundId, req.params.id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Move feedback to round error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
