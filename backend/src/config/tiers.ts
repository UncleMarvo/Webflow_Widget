// Subscription Tier Configuration
// Tier names and prices are configurable here for easy changes.

export interface TierFeatures {
  feedback: boolean;
  email: boolean;
  csv_export: boolean;
  mobile_widget: boolean;
  rounds: boolean;
  api_access: boolean;
  webhooks: boolean;
  priority_support: boolean;
}

export interface TierConfig {
  name: string;
  displayName: string;
  price: number; // monthly price in EUR cents (2400 = €24)
  currency: string;
  projects: { min: number; max: number | null }; // null = unlimited
  maxUsers: number | null;
  maxFeedbackPerMonth: number | null;
  features: TierFeatures;
}

export const TIERS: Record<string, TierConfig> = {
  starter: {
    name: 'starter',
    displayName: 'Starter',
    price: 2400, // €24/month
    currency: 'EUR',
    projects: { min: 1, max: 10 },
    maxUsers: null,
    maxFeedbackPerMonth: null,
    features: {
      feedback: true,
      email: true,
      csv_export: true,
      mobile_widget: true,
      rounds: false,
      api_access: false,
      webhooks: false,
      priority_support: false,
    },
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 4900, // €49/month
    currency: 'EUR',
    projects: { min: 11, max: 50 },
    maxUsers: null,
    maxFeedbackPerMonth: null,
    features: {
      feedback: true,
      email: true,
      csv_export: true,
      mobile_widget: true,
      rounds: true,
      api_access: true,
      webhooks: true,
      priority_support: false,
    },
  },
  agency: {
    name: 'agency',
    displayName: 'Agency',
    price: 9900, // €99/month
    currency: 'EUR',
    projects: { min: 51, max: null }, // unlimited
    maxUsers: null,
    maxFeedbackPerMonth: null,
    features: {
      feedback: true,
      email: true,
      csv_export: true,
      mobile_widget: true,
      rounds: true,
      api_access: true,
      webhooks: true,
      priority_support: true,
    },
  },
};

export const DEFAULT_TIER = 'starter';

export const VALID_TIERS = Object.keys(TIERS);

export const VALID_SUBSCRIPTION_STATUSES = ['active', 'trial', 'canceled'] as const;

export function getTierConfig(tier: string): TierConfig {
  return TIERS[tier] || TIERS[DEFAULT_TIER];
}

export function hasFeature(tier: string, feature: string): boolean {
  const config = getTierConfig(tier);
  return config.features[feature as keyof TierFeatures] ?? false;
}

export function getProjectLimit(tier: string): number | null {
  const config = getTierConfig(tier);
  return config.projects.max;
}

export function formatPrice(tier: string): string {
  const config = getTierConfig(tier);
  const amount = (config.price / 100).toFixed(0);
  return `€${amount}/month`;
}
