import { Router, Response } from 'express';
import { query } from '../../../config/database';
import { authenticate, AuthRequest } from '../../../middleware/auth';
import { loadSubscription, requireFeature, SubscriptionRequest } from '../../../middleware/featureGate';
import { generateApiKeyV1 } from '../../../middleware/apiKeyAuthV1';
import { apiError, validationError } from '../../../utils/apiErrors';

const router = Router();

// All key management endpoints require JWT auth + api_access tier
router.use(authenticate, loadSubscription, requireFeature('api_access'));

// POST /api/v1/auth/keys — Generate new API key
router.post('/keys', async (req: SubscriptionRequest, res: Response): Promise<void> => {
  const { name } = req.body;

  try {
    // Limit to 10 active keys per user
    const countResult = await query(
      'SELECT COUNT(*)::int AS count FROM api_keys WHERE user_id = $1 AND revoked_at IS NULL',
      [req.userId]
    );
    if (countResult.rows[0].count >= 10) {
      apiError(res, 'VALIDATION_ERROR', 'Maximum of 10 active API keys allowed');
      return;
    }

    const { plaintext, hash, lastFour } = generateApiKeyV1();

    const result = await query(
      `INSERT INTO api_keys (user_id, key_hash, last_four_chars, name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, last_four_chars, created_at`,
      [req.userId, hash, lastFour, (name || 'Default').slice(0, 255)]
    );

    // Return plaintext key ONLY on creation
    res.status(201).json({
      ...result.rows[0],
      key: plaintext,
      warning: 'Store this key securely. It will not be shown again.',
    });
  } catch (err) {
    console.error('Generate API key error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to generate API key');
  }
});

// GET /api/v1/auth/keys — List active keys (last 4 chars only)
router.get('/keys', async (req: SubscriptionRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, name, last_four_chars, created_at, last_used_at
       FROM api_keys
       WHERE user_id = $1 AND revoked_at IS NULL
       ORDER BY created_at DESC`,
      [req.userId]
    );

    res.json({ keys: result.rows });
  } catch (err) {
    console.error('List API keys error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to list API keys');
  }
});

// DELETE /api/v1/auth/keys/:keyId — Revoke API key
router.delete('/keys/:keyId', async (req: SubscriptionRequest, res: Response): Promise<void> => {
  const { keyId } = req.params;

  try {
    const result = await query(
      `UPDATE api_keys SET revoked_at = NOW()
       WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
       RETURNING id`,
      [keyId, req.userId]
    );

    if (result.rows.length === 0) {
      apiError(res, 'RESOURCE_NOT_FOUND', `API key ${keyId} not found or already revoked`);
      return;
    }

    res.json({ message: 'API key revoked successfully' });
  } catch (err) {
    console.error('Revoke API key error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Failed to revoke API key');
  }
});

export default router;
