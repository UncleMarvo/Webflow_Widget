import { Resend } from 'resend';
import { env } from '../config/env';
import { query } from '../config/database';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

interface FeedbackData {
  id: string;
  url: string;
  page_title: string | null;
  annotation: string;
  device_type: string | null;
  screenshot_url: string | null;
  created_at: string;
}

export async function sendFeedbackNotification(projectId: string, feedback: FeedbackData): Promise<void> {
  if (!resend) {
    console.log('Resend not configured, skipping email notification');
    return;
  }

  try {
    // Get project owner email
    const result = await query(
      `SELECT u.email, p.name AS project_name
       FROM projects p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [projectId]
    );

    if (result.rows.length === 0) return;

    const { email, project_name } = result.rows[0];

    await resend.emails.send({
      from: 'Webflow Feedback <notifications@feedback.app>',
      to: email,
      subject: `New feedback on ${project_name} - ${feedback.page_title || feedback.url}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">New Feedback Received</h2>
          <p style="color: #666;">Project: <strong>${project_name}</strong></p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px;"><strong>Page:</strong> ${feedback.page_title || feedback.url}</p>
            <p style="margin: 0 0 8px;"><strong>URL:</strong> <a href="${feedback.url}">${feedback.url}</a></p>
            <p style="margin: 0 0 8px;"><strong>Comment:</strong> ${feedback.annotation}</p>
            ${feedback.device_type ? `<p style="margin: 0;"><strong>Device:</strong> ${feedback.device_type}</p>` : ''}
          </div>
          ${feedback.screenshot_url && !feedback.screenshot_url.startsWith('data:') ? `<img src="${feedback.screenshot_url}" alt="Screenshot" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e5e5;" />` : (feedback.screenshot_url ? '<p style="color: #999; font-size: 13px;">[Screenshot available in dashboard]</p>' : '')}
          <p style="margin-top: 24px;">
            <a href="${env.frontendUrl}/projects" style="background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
              View in Dashboard
            </a>
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email send error:', err);
  }
}
