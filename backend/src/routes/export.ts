import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /projects/:id/export/csv
router.post('/:id/export/csv', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify ownership
    const project = await query('SELECT id, name FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (project.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const feedbackResult = await query(
      `SELECT url, page_title, annotation, device_type, viewport_width, viewport_height,
        browser_name, browser_version, os_name, os_version, user_agent, device_pixel_ratio, screen_width, screen_height,
        status, priority, created_at FROM feedback WHERE project_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );

    const headers = ['URL', 'Page Title', 'Annotation', 'Device Type', 'Viewport Width', 'Viewport Height',
      'Browser', 'Browser Version', 'OS', 'OS Version', 'User Agent', 'Device Pixel Ratio', 'Screen Width', 'Screen Height',
      'Status', 'Priority', 'Created At'];

    const csvRows = [headers.join(',')];

    for (const row of feedbackResult.rows) {
      const values = [
        row.url,
        row.page_title || '',
        row.annotation || '',
        row.device_type || '',
        row.viewport_width || '',
        row.viewport_height || '',
        row.browser_name || '',
        row.browser_version || '',
        row.os_name || '',
        row.os_version || '',
        row.user_agent || '',
        row.device_pixel_ratio || '',
        row.screen_width || '',
        row.screen_height || '',
        row.status,
        row.priority,
        row.created_at,
      ].map(val => `"${String(val).replace(/"/g, '""')}"`);

      csvRows.push(values.join(','));
    }

    const csv = csvRows.join('\n');
    const projectName = project.rows[0].name.replace(/[^a-zA-Z0-9]/g, '_');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}_feedback.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
