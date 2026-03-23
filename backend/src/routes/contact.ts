import { Router, Request, Response } from 'express';
import { Resend } from 'resend';
import { env } from '../config/env';

const router = Router();
const resend = new Resend(env.resendApiKey);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, priority } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (message.length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' });
    }

    // Sanitize user input for HTML embedding
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const safeName = esc(name);
    const safeEmail = esc(email);
    const safeSubject = esc(subject);
    const safePriority = esc(priority || 'Normal');
    const safeMessage = esc(message).replace(/\n/g, '<br />');

    // Send email to inbox
    await resend.emails.send({
      from: 'noreply@webflowfeedback.com',
      to: 'hello@webflowfeedback.com',
      subject: `[${subject}] Contact from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Priority:</strong> ${safePriority}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
        <hr />
        <p><strong>Reply to:</strong> ${safeEmail}</p>
      `,
      replyTo: email,
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: 'noreply@webflowfeedback.com',
      to: email,
      subject: 'We received your message',
      html: `
        <h2>Thanks for reaching out!</h2>
        <p>Hi ${safeName},</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p>In the meantime, check out our <a href="https://webflowfeedback.com/how-to">How To guide</a> or <a href="https://webflowfeedback.com/faq">FAQ</a> — you might find the answer there.</p>
        <p>Best,<br />The Webflow Feedback Team</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully. We'll get back to you soon!",
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to send email. Please try again later or email hello@webflowfeedback.com',
    });
  }
});

export default router;
