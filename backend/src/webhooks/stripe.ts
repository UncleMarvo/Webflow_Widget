import Stripe from 'stripe';
import { pool } from '../config/database';
import { getTierFromPriceId } from '../services/stripe';

export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }
    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  const priceId = subscription.items.data[0]?.price?.id;
  const tier = priceId ? getTierFromPriceId(priceId) : null;

  if (!tier) {
    console.warn(`[Stripe Webhook] Unknown price ID: ${priceId}`);
    return;
  }

  const status = mapStripeStatus(subscription.status);
  const periodEnd = subscription.ended_at
    ? new Date(subscription.ended_at * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const result = await pool.query(
    `UPDATE users
     SET subscription_tier = $1,
         subscription_status = $2,
         subscription_started_at = COALESCE(subscription_started_at, NOW()),
         subscription_ends_at = $3,
         stripe_subscription_id = $4
     WHERE stripe_customer_id = $5
     RETURNING id, email`,
    [tier, status, periodEnd.toISOString(), subscription.id, customerId]
  );

  if (result.rows.length === 0) {
    console.warn(`[Stripe Webhook] No user found for customer: ${customerId}`);
    return;
  }

  const user = result.rows[0];
  console.log(`[Stripe Webhook] Updated user ${user.id} (${user.email}): tier=${tier}, status=${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  const result = await pool.query(
    `UPDATE users
     SET subscription_status = 'canceled',
         subscription_ends_at = NOW(),
         stripe_subscription_id = NULL
     WHERE stripe_customer_id = $1
     RETURNING id, email`,
    [customerId]
  );

  if (result.rows.length === 0) {
    console.warn(`[Stripe Webhook] No user found for customer: ${customerId}`);
    return;
  }

  const user = result.rows[0];
  console.log(`[Stripe Webhook] Subscription canceled for user ${user.id} (${user.email})`);
}

function mapStripeStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'active';
  }
}
