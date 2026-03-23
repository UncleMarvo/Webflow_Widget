import { Router, Response } from 'express';
import { query } from '../../../config/database';
import { ApiV1Request } from '../../../middleware/apiKeyAuthV1';
import { apiError, validationError } from '../../../utils/apiErrors';
import { dispatchWebhookEvent } from '../../../services/webhookDelivery';

const router = Router();

// GET /api/v1/projects/:projectId/feedback — List feedback for project
router.get('/projects/:projectId/feedback', async (req: ApiV1Request, res: Response): Promise<void> => {
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
  const { roundId, status, priority } = req.query as Record<string, string>;

  try {
    // Verify ownership
    const project = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.projectId, req.apiUserId]
    );
    if (project.rows.length === 0) {
      apiError(res, 'RESOURCE_NOT_FOUND', `Project ${req.params.projectId} not found`);
      return;
    }

    let whereClause = 'WHERE f.project_id = $1 AND f.deleted_at IS NULL';
    const params: unknown[] = [req.params.projectId];

    if (status) {
      const validStatuses = ['todo', 'in-progress', 'done'];
      if (!validStatuses.includes(status)) {
        validationError(res, { status: `Must be one of: ${validStatuses.join(', ')}` });
        return;
      }
      params.push(status);
      whereClause += ` AND f.status = $${params.length}`;
    }

    if (priority) {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        validationError(res, { priority: `Must be one of: ${validPriorities.join(', ')}` });
        return;
      }
      params.push(priority);
      whereClause += ` AND f.priority = $${params.length}`;
    }

    if (roundId) {
      params.push(roundId);
      whereClause += ` AND f.round_id = $${params.length}`;
    }

    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM feedback f ${whereClause}`,
      params
    );

    const feedbackResult = await query(
      `SELECT f.id, f.url AS page_url, f.page_title, f.annotation AS title,
              f.status, f.priority, f.round_id, f.notes,
              f.browser_name, f.browser_version, f.os_name, f.os_version,
              f.viewport_width, f.viewport_height, f.screen_width, f.screen_height,
              f.device_type, f.user_agent,
              f.created_at, f.updated_at,
              r.name AS round_name
       FROM feedback f
       LEFT JOIN rounds r ON r.id = f.round_id
       ${whereClause}
       ORDER BY f.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({
      feedback: feedbackResult.rows.map(formatFeedbackResponse),
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    console.error('API list feedback error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to list feedback');
  }
});

// GET /api/v1/feedback/:feedbackId — Get single feedback with all metadata
router.get('/feedback/:feedbackId', async (req: ApiV1Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT f.*, r.name AS round_name
       FROM feedback f
       JOIN projects p ON p.id = f.project_id
       LEFT JOIN rounds r ON r.id = f.round_id
       WHERE f.id = $1 AND p.user_id = $2 AND f.deleted_at IS NULL`,
      [req.params.feedbackId, req.apiUserId]
    );

    if (result.rows.length === 0) {
      apiError(res, 'RESOURCE_NOT_FOUND', `Feedback ${req.params.feedbackId} not found`);
      return;
    }

    res.json(formatFeedbackResponse(result.rows[0]));
  } catch (err) {
    console.error('API get feedback error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to get feedback');
  }
});

// POST /api/v1/projects/:projectId/feedback — Create feedback programmatically
router.post('/projects/:projectId/feedback', async (req: ApiV1Request, res: Response): Promise<void> => {
  const { pageUrl, title, description, priority, roundId } = req.body;

  // Validate required fields
  const errors: Record<string, string> = {};
  if (!pageUrl) errors.pageUrl = 'Page URL is required';
  if (!title) errors.title = 'Title is required';
  if (Object.keys(errors).length > 0) {
    validationError(res, errors);
    return;
  }

  if (priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      validationError(res, { priority: `Must be one of: ${validPriorities.join(', ')}` });
      return;
    }
  }

  try {
    // Verify ownership
    const project = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.projectId, req.apiUserId]
    );
    if (project.rows.length === 0) {
      apiError(res, 'RESOURCE_NOT_FOUND', `Project ${req.params.projectId} not found`);
      return;
    }

    // Validate roundId if provided
    if (roundId) {
      const round = await query(
        'SELECT id FROM rounds WHERE id = $1 AND project_id = $2',
        [roundId, req.params.projectId]
      );
      if (round.rows.length === 0) {
        apiError(res, 'RESOURCE_NOT_FOUND', `Round ${roundId} not found in this project`);
        return;
      }
    }

    const result = await query(
      `INSERT INTO feedback (project_id, url, annotation, page_title, priority, round_id, assigned_to_round_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        req.params.projectId,
        pageUrl,
        title,
        description || null,
        priority || 'normal',
        roundId || null,
        roundId ? new Date() : null,
      ]
    );

    const feedback = result.rows[0];

    // Add to round_feedback junction if roundId provided
    if (roundId) {
      query(
        'INSERT INTO round_feedback (round_id, feedback_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [roundId, feedback.id]
      ).catch(err => console.error('Round assignment error:', err));
    }

    // Track monthly usage (non-blocking)
    const currentMonth = new Date().toISOString().slice(0, 7);
    query(
      `INSERT INTO usage_tracking (user_id, month, feedback_count)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, month)
       DO UPDATE SET feedback_count = usage_tracking.feedback_count + 1, updated_at = NOW()`,
      [req.apiUserId, currentMonth]
    ).catch(err => console.error('Usage tracking error:', err));

    // Dispatch webhook event (non-blocking)
    dispatchWebhookEvent(req.apiUserId!, 'feedback.created', {
      id: feedback.id,
      projectId: feedback.project_id,
      title: feedback.annotation,
      description: feedback.page_title,
      status: feedback.status,
      priority: feedback.priority,
      pageUrl: feedback.url,
      roundId: feedback.round_id,
      createdAt: feedback.created_at,
    }).catch(err => console.error('Webhook dispatch error:', err));

    res.status(201).json(formatFeedbackResponse(feedback));
  } catch (err) {
    console.error('API create feedback error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to create feedback');
  }
});

// PATCH /api/v1/feedback/:feedbackId — Update feedback
router.patch('/feedback/:feedbackId', async (req: ApiV1Request, res: Response): Promise<void> => {
  const { status, priority, notes, roundId } = req.body;

  const validStatuses = ['todo', 'in-progress', 'done'];
  const validPriorities = ['low', 'normal', 'high', 'urgent'];

  const errors: Record<string, string> = {};
  if (status && !validStatuses.includes(status)) {
    errors.status = `Must be one of: ${validStatuses.join(', ')}`;
  }
  if (priority && !validPriorities.includes(priority)) {
    errors.priority = `Must be one of: ${validPriorities.join(', ')}`;
  }
  if (Object.keys(errors).length > 0) {
    validationError(res, errors);
    return;
  }

  try {
    // Verify ownership and check frozen round
    const ownership = await query(
      `SELECT f.id, f.round_id, r.status AS round_status
       FROM feedback f
       JOIN projects p ON p.id = f.project_id
       LEFT JOIN rounds r ON r.id = f.round_id
       WHERE f.id = $1 AND p.user_id = $2 AND f.deleted_at IS NULL`,
      [req.params.feedbackId, req.apiUserId]
    );

    if (ownership.rows.length === 0) {
      apiError(res, 'RESOURCE_NOT_FOUND', `Feedback ${req.params.feedbackId} not found`);
      return;
    }

    if (ownership.rows[0].round_status === 'frozen') {
      apiError(res, 'VALIDATION_ERROR', 'Cannot modify feedback in a frozen round');
      return;
    }

    const setClauses: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];

    if (status) {
      params.push(status);
      setClauses.push(`status = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      setClauses.push(`priority = $${params.length}`);
    }
    if (notes !== undefined) {
      params.push(notes);
      setClauses.push(`notes = $${params.length}`);
    }
    if (roundId !== undefined) {
      params.push(roundId || null);
      setClauses.push(`round_id = $${params.length}`);
      setClauses.push('assigned_to_round_at = NOW()');
    }

    if (params.length === 0) {
      validationError(res, { _: 'No valid fields to update' });
      return;
    }

    params.push(req.params.feedbackId);
    const result = await query(
      `UPDATE feedback SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );

    const feedback = result.rows[0];

    // Dispatch webhook event (non-blocking)
    dispatchWebhookEvent(req.apiUserId!, 'feedback.updated', {
      id: feedback.id,
      projectId: feedback.project_id,
      title: feedback.annotation,
      description: feedback.page_title,
      status: feedback.status,
      priority: feedback.priority,
      pageUrl: feedback.url,
      roundId: feedback.round_id,
      createdAt: feedback.created_at,
    }).catch(err => console.error('Webhook dispatch error:', err));

    res.json(formatFeedbackResponse(feedback));
  } catch (err) {
    console.error('API update feedback error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to update feedback');
  }
});

// DELETE /api/v1/feedback/:feedbackId — Soft-delete feedback
router.delete('/feedback/:feedbackId', async (req: ApiV1Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `UPDATE feedback SET deleted_at = NOW(), updated_at = NOW()
       FROM projects p
       WHERE feedback.project_id = p.id AND feedback.id = $1 AND p.user_id = $2 AND feedback.deleted_at IS NULL
       RETURNING feedback.id, feedback.project_id, feedback.annotation, feedback.url, feedback.status, feedback.priority, feedback.round_id, feedback.created_at`,
      [req.params.feedbackId, req.apiUserId]
    );

    if (result.rows.length === 0) {
      apiError(res, 'RESOURCE_NOT_FOUND', `Feedback ${req.params.feedbackId} not found`);
      return;
    }

    const feedback = result.rows[0];

    // Dispatch webhook event (non-blocking)
    dispatchWebhookEvent(req.apiUserId!, 'feedback.deleted', {
      id: feedback.id,
      projectId: feedback.project_id,
      title: feedback.annotation,
      pageUrl: feedback.url,
      status: feedback.status,
      priority: feedback.priority,
      roundId: feedback.round_id,
      createdAt: feedback.created_at,
    }).catch(err => console.error('Webhook dispatch error:', err));

    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    console.error('API delete feedback error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to delete feedback');
  }
});

function formatFeedbackResponse(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.annotation,
    description: row.page_title,
    status: row.status,
    priority: row.priority,
    pageUrl: row.url || row.page_url,
    roundId: row.round_id,
    roundName: row.round_name || null,
    notes: row.notes || null,
    deviceInfo: {
      browser: row.browser_name ? `${row.browser_name} ${row.browser_version || ''}`.trim() : null,
      os: row.os_name ? `${row.os_name} ${row.os_version || ''}`.trim() : null,
      resolution: row.viewport_width ? `${row.viewport_width}x${row.viewport_height}` : null,
      screenResolution: row.screen_width ? `${row.screen_width}x${row.screen_height}` : null,
      deviceType: row.device_type || null,
      userAgent: row.user_agent || null,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at || null,
  };
}

export default router;
