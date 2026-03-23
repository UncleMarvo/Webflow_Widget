import Stripe from 'stripe';
import { env } from '../config/env';
import { pool } from '../config/database';

export const stripe = new Stripe(env.stripeSecretKey);

// Map tier names to Stripe price IDs
// Products in Stripe:
//   - Webflow Feedback Starter: €24/month (STRIPE_PRICE_STARTER)
//   - Webflow Feedback Pro: €49/month (STRIPE_PRICE_PRO)
//   - Webflow Feedback Agency: €99/month (STRIPE_PRICE_AGENCY)
const TIER_PRICE_IDS: Record<string, string> = {
  starter: env.stripePriceStarter,
  pro: env.stripePricePro,
  agency: env.stripePriceAgency,
};

const PRICE_ID_TO_TIER: Record<string, string> = {};
for (const [tier, priceId] of Object.entries(TIER_PRICE_IDS)) {
  if (priceId) PRICE_ID_TO_TIER[priceId] = tier;
}

export function getTierFromPriceId(priceId: string): string | null {
  return PRICE_ID_TO_TIER[priceId] || null;
}

export function getPriceIdForTier(tier: string): string | null {
  return TIER_PRICE_IDS[tier] || null;
}

export async function getStripeCustomer(userId: string): Promise<string | null> {
  const result = await pool.query(
    'SELECT stripe_customer_id FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0]?.stripe_customer_id || null;
}

export async function createCustomerFromUser(userId: string): Promise<string> {
  const userResult = await pool.query(
    'SELECT id, email, stripe_customer_id FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) throw new Error('User not found');

  if (user.stripe_customer_id) return user.stripe_customer_id;

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user.id },
  });

  await pool.query(
    'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
    [customer.id, userId]
  );

  console.log(`[Stripe] Created customer ${customer.id} for user ${userId}`);
  return customer.id;
}

export async function createCheckoutSession(
  userId: string,
  tier: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const priceId = getPriceIdForTier(tier);
  if (!priceId) throw new Error(`No Stripe price configured for tier: ${tier}`);

  const customerId = await createCustomerFromUser(userId);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId, tier },
  });

  console.log(`[Stripe] Created checkout session ${session.id} for user ${userId}, tier ${tier}`);
  return session;
}

export async function createBillingPortalSession(
  userId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const customerId = await getStripeCustomer(userId);
  if (!customerId) throw new Error('No Stripe customer found for this user');

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  console.log(`[Stripe] Created portal session for user ${userId}`);
  return session;
}
