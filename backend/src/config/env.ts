import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePriceStarter: process.env.STRIPE_PRICE_STARTER || '',
  stripePricePro: process.env.STRIPE_PRICE_PRO || '',
  stripePriceAgency: process.env.STRIPE_PRICE_AGENCY || '',
  webhookMaxRetries: parseInt(process.env.WEBHOOK_MAX_RETRIES || '3', 10),
  webhookTimeoutMs: parseInt(process.env.WEBHOOK_TIMEOUT_MS || '10000', 10),
};
