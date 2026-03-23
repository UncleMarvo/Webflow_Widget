import { Router, Response } from 'express';
import crypto from 'crypto';
import { query } from '../../../config/database';
import { ApiV1Request } from '../../../middleware/apiKeyAuthV1';
import { apiError, validationError } from '../../../utils/apiErrors';
import { sendTestWebhookEvent } from '../../../services/webhookDelivery';

const router = Router();

const VALID_EVENTS = ['feedback.created', 'feedback.updated', 'feedback.deleted'];

// POST /api/v1/webhooks — Register webhook endpoint
router.post('/', async (req: ApiV1Request, res: Response): Promise<void> => {
  const { url, events } = req.body;

  const errors: Record<string, string> = {};
  if (!url || typeof url !== 'string') {
    errors.url = 'URL is required';
  } else {
    try {
      new URL(url);
    } catch {
      errors.url = 'Must be a valid URL';
    }
  }

  if (!events || !Array.isArray(events) || events.length === 0) {
    errors.events = 'At least one event is required';
  } else {
    const invalid = events.filter((e: string) => !VALID_EVENTS.includes(e));
    if (invalid.length > 0) {
      errors.events = `Invalid events: ${invalid.join(', ')}. Valid: ${VALID_EVENTS.join(', ')}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    validationError(res, errors);
    return;
  }

  try {
    // Limit to 10 webhooks per user
    const countResult = await query(
      'SELECT COUNT(*)::int AS count FROM webhooks WHERE user_id = $1 AND active = true',
      [req.apiUserId]
    );
    if (countResult.rows[0].count >= 10) {
      apiError(res, 'VALIDATION_ERROR', 'Maximum of 10 active webhooks allowed');
      return;
    }

    const secret = crypto.randomBytes(32).toString('hex');

    const result = await query(
      `INSERT INTO webhooks (user_id, url, events, secret)
       VALUES ($1, $2, $3, $4)
       RETURNING id, url, events, active, created_at`,
      [req.apiUserId, url, JSON.stringify(events), secret]
    );

    res.status(201).json({
      ...result.rows[0],
      secret,
      warning: 'Store this secret securely. Use it to verify webhook signatures.',
    });
  } catch (err) {
    console.error('Create webhook error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to create webhook');
  }
});

// GET /api/v1/webhooks — List registered webhooks
router.get('/', async (req: ApiV1Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, url, events, active, created_at, updated_at
       FROM webhooks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.apiUserId]
    );

    res.json({ webhooks: result.rows });
  } catch (err) {
    console.error('List webhooks error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to list webhooks');
  }
});

// PATCH /api/v1/webhooks/:webhookId — Update webhook
router.patch('/:webhookId', async (req: ApiV1Request, res: Response): Promise<void> => {
  const { url, events } = req.body;

  const errors: Record<string, string> = {};
  if (url !== undefined) {
    if (typeof url !== 'string') {
      errors.url = 'URL must be a string';
    } else {
      try {
        new URL(url);
      } catch {
        errors.url = 'Must be a valid URL';
      }
    }
  }

  if (events !== undefined) {
    if (!Array.isArray(events) || events.length === 0) {
      errors.events = 'Events must be a non-empty array';
    } else {
      const invalid = events.filter((e: string) => !VALID_EVENTS.includes(e));
      if (invalid.length > 0) {
        errors.events = `Invalid events: ${invalid.join(', ')}. Valid: ${VALID_EVENTS.join(', ')}`;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    validationError(res, errors);
    return;
  }

  try {
    const setClauses: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];

    if (url !== undefined) {
      params.push(url);
      setClauses.push(`url = $${params.length}`);
    }
    if (events !== undefined) {
      params.push(JSON.stringify(events));
      setClauses.push(`events = $${params.length}`);
    }

    if (params.length === 0) {
      validationError(res, { _: 'No valid fields to update' });
      return;
    }

    params.push(req.params.webhookId, req.apiUserId);
    const result = await query(
      `UPDATE webhooks SET ${setClauses.join(', ')}
       WHERE id = $${params.length - 1} AND user_id = $${params.length}
       RETURNING id, url, events, active, created_at, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      apiError(res, 'RESOURCE_NOT_FOUND', `Webhook ${req.params.webhookId} not found`);
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update webhook error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to update webhook');
  }
});

// DELETE /api/v1/webhooks/:webhookId — Deactivate webhook
router.delete('/:webhookId', async (req: ApiV1Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `UPDATE webhooks SET active = false, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.webhookId, req.apiUserId]
    );

    if (result.rows.length === 0) {
      apiError(res, 'RESOURCE_NOT_FOUND', `Webhook ${req.params.webhookId} not found`);
      return;
    }

    res.json({ message: 'Webhook deactivated' });
  } catch (err) {
    console.error('Deactivate webhook error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to deactivate webhook');
  }
});

// POST /api/v1/webhooks/:webhookId/test — Send test event
router.post('/:webhookId/test', async (req: ApiV1Request, res: Response): Promise<void> => {
  try {
    const webhook = await query(
      'SELECT id, url, secret FROM webhooks WHERE id = $1 AND user_id = $2 AND active = true',
      [req.params.webhookId, req.apiUserId]
    );

    if (webhook.rows.length === 0) {
      apiError(res, 'RESOURCE_NOT_FOUND', `Webhook ${req.params.webhookId} not found or inactive`);
      return;
    }

    const { url, secret } = webhook.rows[0];
    const result = await sendTestWebhookEvent(req.params.webhookId as string, url, secret);

    res.json({
      success: result.success,
      statusCode: result.statusCode || null,
      error: result.error || null,
    });
  } catch (err) {
    console.error('Test webhook error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to test webhook');
  }
});

export default router;
