// Subscription Tier Configuration
// Tier names and prices are configurable here for easy changes.

export interface TierConfig {
  name: string;
  displayName: string;
  price: number; // monthly price in EUR cents (2400 = €24)
  currency: string;
  maxProjects: number | null; // null = unlimited
  maxUsers: number | null;
  maxFeedbackPerMonth: number | null;
  features: string[];
}

export const TIERS: Record<string, TierConfig> = {
  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 2400, // €24/month
    currency: 'EUR',
    maxProjects: null,
    maxUsers: null,
    maxFeedbackPerMonth: null,
    features: ['feedback', 'email', 'csv_export', 'mobile_widget'],
  },
  premium: {
    name: 'premium',
    displayName: 'Premium',
    price: 4900, // €49/month (placeholder)
    currency: 'EUR',
    maxProjects: null,
    maxUsers: null,
    maxFeedbackPerMonth: null,
    features: ['feedback', 'email', 'csv_export', 'mobile_widget', 'rounds'],
  },
  agency: {
    name: 'agency',
    displayName: 'Agency',
    price: 9900, // €99/month (placeholder)
    currency: 'EUR',
    maxProjects: null,
    maxUsers: null,
    maxFeedbackPerMonth: null,
    features: ['feedback', 'email', 'csv_export', 'mobile_widget', 'rounds', 'api_access'],
  },
};

export const DEFAULT_TIER = 'pro';

export const VALID_TIERS = Object.keys(TIERS);

export const VALID_SUBSCRIPTION_STATUSES = ['active', 'trial', 'canceled'] as const;

export function getTierConfig(tier: string): TierConfig {
  return TIERS[tier] || TIERS[DEFAULT_TIER];
}

export function hasFeature(tier: string, feature: string): boolean {
  const config = getTierConfig(tier);
  return config.features.includes(feature);
}

export function formatPrice(tier: string): string {
  const config = getTierConfig(tier);
  const amount = (config.price / 100).toFixed(0);
  return `€${amount}/month`;
}
