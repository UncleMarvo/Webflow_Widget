import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { query } from '../config/database';
import { hasFeature, getTierConfig, getProjectLimit } from '../config/tiers';

export interface SubscriptionRequest extends AuthRequest {
  subscriptionTier?: string;
  subscriptionStatus?: string;
}

/**
 * Middleware that loads the user's subscription info onto the request.
 * Must be used after authenticate().
 */
export async function loadSubscription(
  req: SubscriptionRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await query(
      'SELECT subscription_tier, subscription_status FROM users WHERE id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    req.subscriptionTier = result.rows[0].subscription_tier || 'starter';
    req.subscriptionStatus = result.rows[0].subscription_status || 'active';
    next();
  } catch (err) {
    console.error('Load subscription error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware factory that checks if the user's tier includes a specific feature.
 * Returns 403 if the feature is not available.
 */
export function requireFeature(feature: string) {
  return (req: SubscriptionRequest, res: Response, next: NextFunction): void => {
    const tier = req.subscriptionTier || 'starter';
    const status = req.subscriptionStatus || 'active';

    if (status === 'canceled') {
      res.status(403).json({
        error: 'Subscription inactive',
        message: 'Your subscription has been canceled. Please reactivate to access this feature.',
        code: 'SUBSCRIPTION_INACTIVE',
      });
      return;
    }

    if (!hasFeature(tier, feature)) {
      const tierConfig = getTierConfig(tier);
      res.status(403).json({
        error: 'Feature not available',
        message: `The "${feature}" feature is not included in your ${tierConfig.displayName} plan. Please upgrade to access this feature.`,
        code: 'FEATURE_NOT_AVAILABLE',
        currentTier: tier,
        requiredFeature: feature,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware that validates the user has not exceeded their tier's project limit.
 * Must be used after authenticate() and loadSubscription().
 * Returns 403 if the user is at or above their tier's project limit.
 */
export async function validateProjectLimit(
  req: SubscriptionRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const tier = req.subscriptionTier || 'starter';
    const limit = getProjectLimit(tier);

    // null = unlimited (Agency tier)
    if (limit === null) {
      next();
      return;
    }

    const result = await query(
      'SELECT COUNT(*)::int AS count FROM projects WHERE user_id = $1',
      [req.userId]
    );
    const projectCount = result.rows[0].count;

    if (projectCount >= limit) {
      const config = getTierConfig(tier);
      const nextTier = tier === 'starter' ? 'Pro' : 'Agency';
      res.status(403).json({
        error: 'Project limit reached',
        message: `You've reached the project limit for your ${config.displayName} tier. Upgrade to ${nextTier} or Agency.`,
        code: 'PROJECT_LIMIT_REACHED',
        currentTier: tier,
        projectCount,
        projectLimit: limit,
      });
      return;
    }

    next();
  } catch (err) {
    console.error('Validate project limit error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Utility: check feature access without middleware (for use in route handlers).
 */
export function checkFeatureAccess(tier: string, feature: string): {
  allowed: boolean;
  reason?: string;
} {
  if (!hasFeature(tier, feature)) {
    const config = getTierConfig(tier);
    return {
      allowed: false,
      reason: `"${feature}" is not included in the ${config.displayName} plan.`,
    };
  }
  return { allowed: true };
}
