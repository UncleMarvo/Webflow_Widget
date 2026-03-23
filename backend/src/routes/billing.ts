import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { stripe, createCheckoutSession, createBillingPortalSession, getPriceIdForTier } from '../services/stripe';
import { handleStripeWebhook } from '../webhooks/stripe';
import { env } from '../config/env';
import { VALID_TIERS } from '../config/tiers';

const router = Router();

// POST /billing/checkout — create Stripe checkout session
router.post('/checkout', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tier } = req.body;

    if (!tier || !VALID_TIERS.includes(tier)) {
      res.status(400).json({ error: `Invalid tier. Must be one of: ${VALID_TIERS.join(', ')}` });
      return;
    }

    if (!getPriceIdForTier(tier)) {
      res.status(400).json({ error: `Stripe price not configured for tier: ${tier}` });
      return;
    }

    const successUrl = `${env.frontendUrl}/pricing?success=true`;
    const cancelUrl = `${env.frontendUrl}/pricing?canceled=true`;

    const session = await createCheckoutSession(req.userId!, tier, successUrl, cancelUrl);

    res.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error('[Billing] Checkout error:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /billing/portal — get Stripe customer portal URL
router.post('/portal', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const returnUrl = `${env.frontendUrl}/settings`;
    const session = await createBillingPortalSession(req.userId!, returnUrl);
    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[Billing] Portal error:', err.message);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

export default router;

// Separate webhook handler — needs raw body, exported for use in index.ts
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'] as string;
  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body, // raw body buffer
      sig,
      env.stripeWebhookSecret
    );

    await handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err: any) {
    console.error('[Stripe Webhook] Verification failed:', err.message);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
}
