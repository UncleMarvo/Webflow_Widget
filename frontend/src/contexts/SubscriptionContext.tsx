import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { subscriptionApi } from '../lib/api';
import { useAuth } from './AuthContext';

interface TierInfo {
  tier: string;
  displayName: string;
  price: string;
  priceAmount: number;
  currency: string;
  status: string;
  startedAt: string | null;
  endsAt: string | null;
  features: string[];
  featureAccess: Record<string, boolean>;
  limits: {
    maxProjects: number | null;
    maxUsers: number | null;
    maxFeedbackPerMonth: number | null;
  };
}

interface UsageInfo {
  projects: { count: number; limit: number | null };
  teamMembers: { count: number; limit: number | null };
  feedbackTotal: number;
  feedbackThisMonth: { count: number; limit: number | null };
}

interface SubscriptionContextType {
  tier: TierInfo | null;
  usage: UsageInfo | null;
  loading: boolean;
  hasFeature: (feature: string) => boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<TierInfo | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshSubscription = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [tierRes, usageRes] = await Promise.all([
        subscriptionApi.getTier(),
        subscriptionApi.getUsage(),
      ]);
      setTier(tierRes.data);
      setUsage(usageRes.data);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshSubscription();
    } else {
      setTier(null);
      setUsage(null);
    }
  }, [user, refreshSubscription]);

  const hasFeature = useCallback(
    (feature: string): boolean => {
      if (!tier) return false;
      return tier.featureAccess[feature] ?? false;
    },
    [tier]
  );

  return (
    <SubscriptionContext.Provider value={{ tier, usage, loading, hasFeature, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
