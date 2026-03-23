import { Router, Response } from 'express';
import { query } from '../../../config/database';
import { ApiV1Request } from '../../../middleware/apiKeyAuthV1';
import { apiError } from '../../../utils/apiErrors';

const router = Router();

// GET /api/v1/projects — List all projects for authenticated user
router.get('/', async (req: ApiV1Request, res: Response): Promise<void> => {
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

  try {
    const countResult = await query(
      'SELECT COUNT(*)::int AS total FROM projects WHERE user_id = $1',
      [req.apiUserId]
    );

    const result = await query(
      `SELECT p.id, p.name, p.created_at,
              COUNT(f.id) FILTER (WHERE f.deleted_at IS NULL)::int AS feedback_count
       FROM projects p
       LEFT JOIN feedback f ON f.project_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.apiUserId, limit, offset]
    );

    res.json({
      projects: result.rows,
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    console.error('API list projects error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to list projects');
  }
});

// GET /api/v1/projects/:projectId — Get single project details
router.get('/:projectId', async (req: ApiV1Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.created_at,
              COUNT(f.id) FILTER (WHERE f.deleted_at IS NULL)::int AS feedback_count
       FROM projects p
       LEFT JOIN feedback f ON f.project_id = p.id
       WHERE p.id = $1 AND p.user_id = $2
       GROUP BY p.id`,
      [req.params.projectId, req.apiUserId]
    );

    if (result.rows.length === 0) {
      apiError(res, 'RESOURCE_NOT_FOUND', `Project ${req.params.projectId} not found`);
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('API get project error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to get project');
  }
});

// GET /api/v1/projects/:projectId/rounds — List all rounds in project
router.get('/:projectId/rounds', async (req: ApiV1Request, res: Response): Promise<void> => {
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

    const result = await query(
      `SELECT r.id, r.name, r.status, r.description, r.feedback_count,
              r.created_at, r.updated_at, r.starts_at, r.ends_at
       FROM rounds r
       WHERE r.project_id = $1 AND r.status != 'archived'
       ORDER BY r.created_at DESC`,
      [req.params.projectId]
    );

    res.json({ rounds: result.rows });
  } catch (err) {
    console.error('API list rounds error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to list rounds');
  }
});

export default router;
