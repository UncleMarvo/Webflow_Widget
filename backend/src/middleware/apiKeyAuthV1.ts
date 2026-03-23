import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { query } from '../config/database';
import { apiError } from '../utils/apiErrors';
import { hasFeature } from '../config/tiers';

export interface ApiV1Request extends Request {
  apiKeyId?: string;
  apiUserId?: string;
  apiUserTier?: string;
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function authenticateApiKey(
  req: ApiV1Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    apiError(res, 'INVALID_API_KEY', 'Missing or invalid Authorization header. Use: Bearer {api_key}');
    return;
  }

  const key = authHeader.slice(7);
  if (!key) {
    apiError(res, 'INVALID_API_KEY', 'API key is required');
    return;
  }

  const keyHash = hashKey(key);

  try {
    const result = await query(
      `SELECT ak.id, ak.user_id, u.subscription_tier, u.subscription_status
       FROM api_keys ak
       JOIN users u ON u.id = ak.user_id
       WHERE ak.key_hash = $1 AND ak.revoked_at IS NULL`,
      [keyHash]
    );

    if (result.rows.length === 0) {
      apiError(res, 'INVALID_API_KEY', 'Invalid or revoked API key');
      return;
    }

    const row = result.rows[0];

    // Check subscription status
    if (row.subscription_status === 'canceled') {
      apiError(res, 'INSUFFICIENT_PERMISSIONS', 'Your subscription has been canceled');
      return;
    }

    // Check tier has api_access
    if (!hasFeature(row.subscription_tier || 'pro', 'api_access')) {
      apiError(res, 'INSUFFICIENT_PERMISSIONS', 'API access requires Premium tier or higher');
      return;
    }

    req.apiKeyId = row.id;
    req.apiUserId = row.user_id;
    req.apiUserTier = row.subscription_tier;

    // Update last_used_at (non-blocking)
    query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [row.id]).catch(() => {});

    next();
  } catch (err) {
    console.error('API key auth error:', err);
    apiError(res, 'INTERNAL_ERROR', 'Authentication failed');
  }
}

export function generateApiKeyV1(): { plaintext: string; hash: string; lastFour: string } {
  const bytes = crypto.randomBytes(32);
  const plaintext = `wfapi_${bytes.toString('hex')}`;
  const hash = hashKey(plaintext);
  const lastFour = plaintext.slice(-4);
  return { plaintext, hash, lastFour };
}
