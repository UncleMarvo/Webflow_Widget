import { Router, Response } from 'express';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { TIERS, getTierConfig, hasFeature, formatPrice } from '../config/tiers';

const router = Router();

// GET /subscription/tier — returns current tier + feature access map
router.get('/tier', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT subscription_tier, subscription_status, subscription_started_at, subscription_ends_at
       FROM users WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    const tier = user.subscription_tier || 'pro';
    const config = getTierConfig(tier);

    // Build feature access map for all known features
    const allFeatures = ['feedback', 'email', 'csv_export', 'mobile_widget', 'rounds', 'api_access'];
    const featureAccess: Record<string, boolean> = {};
    for (const feature of allFeatures) {
      featureAccess[feature] = hasFeature(tier, feature);
    }

    res.json({
      tier: config.name,
      displayName: config.displayName,
      price: formatPrice(tier),
      priceAmount: config.price,
      currency: config.currency,
      status: user.subscription_status || 'active',
      startedAt: user.subscription_started_at,
      endsAt: user.subscription_ends_at,
      features: config.features,
      featureAccess,
      limits: {
        maxProjects: config.maxProjects,
        maxUsers: config.maxUsers,
        maxFeedbackPerMonth: config.maxFeedbackPerMonth,
      },
    });
  } catch (err) {
    console.error('Get tier error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /subscription/usage — returns project count, user count, feedback count
router.get('/usage', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Run all counts in parallel
    const [projectsResult, membersResult, feedbackResult, monthlyFeedbackResult] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM projects WHERE user_id = $1', [req.userId]),
      query(
        `SELECT COUNT(DISTINCT pi.email)::int AS count
         FROM project_invites pi
         JOIN projects p ON p.id = pi.project_id
         WHERE p.user_id = $1 AND pi.accepted_at IS NOT NULL`,
        [req.userId]
      ),
      query(
        `SELECT COUNT(*)::int AS count
         FROM feedback f
         JOIN projects p ON p.id = f.project_id
         WHERE p.user_id = $1`,
        [req.userId]
      ),
      query(
        `SELECT COALESCE(feedback_count, 0)::int AS count
         FROM usage_tracking
         WHERE user_id = $1 AND month = $2`,
        [req.userId, currentMonth]
      ),
    ]);

    const tier = (await query('SELECT subscription_tier FROM users WHERE id = $1', [req.userId]))
      .rows[0]?.subscription_tier || 'pro';
    const config = getTierConfig(tier);

    res.json({
      projects: {
        count: projectsResult.rows[0].count,
        limit: config.maxProjects,
      },
      teamMembers: {
        count: membersResult.rows[0].count,
        limit: config.maxUsers,
      },
      feedbackTotal: feedbackResult.rows[0].count,
      feedbackThisMonth: {
        count: monthlyFeedbackResult.rows[0]?.count || 0,
        limit: config.maxFeedbackPerMonth,
      },
    });
  } catch (err) {
    console.error('Get usage error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /subscription/tiers — returns all available tiers for display
router.get('/tiers', (_req, res: Response): void => {
  const tiers = Object.values(TIERS).map(t => ({
    name: t.name,
    displayName: t.displayName,
    price: formatPrice(t.name),
    priceAmount: t.price,
    currency: t.currency,
    features: t.features,
    limits: {
      maxProjects: t.maxProjects,
      maxUsers: t.maxUsers,
      maxFeedbackPerMonth: t.maxFeedbackPerMonth,
    },
  }));
  res.json({ tiers });
});

export default router;
