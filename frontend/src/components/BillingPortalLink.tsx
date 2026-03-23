import { useState } from 'react';
import { billingApi } from '../lib/api';

export function BillingPortalLink({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const { data } = await billingApi.getPortalUrl();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className || 'text-sm text-gray-600 hover:text-gray-900 underline'}
    >
      {loading ? 'Opening...' : 'Manage Subscription'}
    </button>
  );
}
