import crypto from 'crypto';
import { query } from '../config/database';
import { env } from '../config/env';

interface WebhookEvent {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export async function dispatchWebhookEvent(
  userId: string,
  eventType: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    // Find all active webhooks for this user subscribed to this event
    const result = await query(
      `SELECT id, url, secret, events FROM webhooks
       WHERE user_id = $1 AND active = true`,
      [userId]
    );

    const event: WebhookEvent = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    for (const webhook of result.rows) {
      const events = webhook.events as string[];
      if (!events.includes(eventType)) continue;

      // Create delivery record
      const delivery = await query(
        `INSERT INTO webhook_deliveries (webhook_id, event, payload, status, next_retry_at)
         VALUES ($1, $2, $3, 'pending', NOW())
         RETURNING id`,
        [webhook.id, eventType, JSON.stringify(event)]
      );

      // Attempt immediate delivery (non-blocking)
      deliverWebhook(delivery.rows[0].id, webhook.url, webhook.secret, event).catch(err =>
        console.error('Webhook delivery error:', err)
      );
    }
  } catch (err) {
    console.error('Dispatch webhook event error:', err);
  }
}

async function deliverWebhook(
  deliveryId: string,
  url: string,
  secret: string,
  event: WebhookEvent
): Promise<void> {
  const payload = JSON.stringify(event);
  const signature = signPayload(payload, secret);

  for (let attempt = 1; attempt <= env.webhookMaxRetries; attempt++) {
    try {
      await query(
        'UPDATE webhook_deliveries SET attempts = $1, last_attempt_at = NOW() WHERE id = $2',
        [attempt, deliveryId]
      );

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), env.webhookTimeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event.event,
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseBody = await response.text().catch(() => '');

      if (response.ok) {
        await query(
          `UPDATE webhook_deliveries SET status = 'delivered', response_status = $1, response_body = $2 WHERE id = $3`,
          [response.status, responseBody.slice(0, 1000), deliveryId]
        );
        return;
      }

      await query(
        `UPDATE webhook_deliveries SET response_status = $1, response_body = $2 WHERE id = $3`,
        [response.status, responseBody.slice(0, 1000), deliveryId]
      );

      // Don't retry on 4xx (client errors) except 429
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        break;
      }
    } catch (err) {
      console.error(`Webhook delivery attempt ${attempt} failed for ${deliveryId}:`, err);
    }

    // Exponential backoff before retry
    if (attempt < env.webhookMaxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Mark as failed after all retries exhausted
  await query(
    `UPDATE webhook_deliveries SET status = 'failed' WHERE id = $1`,
    [deliveryId]
  ).catch(() => {});
}

export async function sendTestWebhookEvent(
  webhookId: string,
  url: string,
  secret: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const event: WebhookEvent = {
    event: 'test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'This is a test webhook event from the Webflow Feedback Tool API.',
    },
  };

  const payload = JSON.stringify(event);
  const signature = signPayload(payload, secret);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.webhookTimeoutMs);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': 'test',
      },
      body: payload,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return { success: response.ok, statusCode: response.status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}
