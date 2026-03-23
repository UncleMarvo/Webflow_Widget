/**
 * BACKEND STATIC TESTS: Tier Configuration
 * Verifies tier pricing, features, and consistency without needing a running server.
 */
import { TIERS, VALID_TIERS, getTierConfig, hasFeature, getProjectLimit, formatPrice } from '../src/config/tiers';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

console.log('\n=== Tier Configuration Tests ===\n');

// Tier existence
console.log('Tier Definitions:');
assert(VALID_TIERS.includes('starter'), 'Starter tier exists');
assert(VALID_TIERS.includes('pro'), 'Pro tier exists');
assert(VALID_TIERS.includes('agency'), 'Agency tier exists');
assert(VALID_TIERS.length === 3, 'Exactly 3 tiers defined');

// Pricing (values in cents)
console.log('\nPricing:');
assert(TIERS.starter.price === 2400, 'Starter is €24/month (2400 cents)');
assert(TIERS.pro.price === 4900, 'Pro is €49/month (4900 cents)');
assert(TIERS.agency.price === 9900, 'Agency is €99/month (9900 cents)');
assert(TIERS.starter.currency === 'EUR', 'Starter currency is EUR');
assert(TIERS.pro.currency === 'EUR', 'Pro currency is EUR');
assert(TIERS.agency.currency === 'EUR', 'Agency currency is EUR');

// Format price
console.log('\nFormatted Prices:');
assert(formatPrice('starter') === '€24/month', 'Starter formats to €24/month');
assert(formatPrice('pro') === '€49/month', 'Pro formats to €49/month');
assert(formatPrice('agency') === '€99/month', 'Agency formats to €99/month');

// Project limits
console.log('\nProject Limits:');
assert(getProjectLimit('starter') === 10, 'Starter: max 10 projects');
assert(getProjectLimit('pro') === 50, 'Pro: max 50 projects');
assert(getProjectLimit('agency') === null, 'Agency: unlimited projects');

// Feature gating
console.log('\nFeature Gating:');
assert(hasFeature('starter', 'feedback'), 'Starter has feedback');
assert(hasFeature('starter', 'email'), 'Starter has email');
assert(!hasFeature('starter', 'api_access'), 'Starter does NOT have API access');
assert(!hasFeature('starter', 'webhooks'), 'Starter does NOT have webhooks');
assert(!hasFeature('starter', 'rounds'), 'Starter does NOT have rounds');

assert(hasFeature('pro', 'api_access'), 'Pro has API access');
assert(hasFeature('pro', 'webhooks'), 'Pro has webhooks');
assert(hasFeature('pro', 'rounds'), 'Pro has rounds');
assert(!hasFeature('pro', 'priority_support'), 'Pro does NOT have priority support');

assert(hasFeature('agency', 'api_access'), 'Agency has API access');
assert(hasFeature('agency', 'webhooks'), 'Agency has webhooks');
assert(hasFeature('agency', 'rounds'), 'Agency has rounds');
assert(hasFeature('agency', 'priority_support'), 'Agency has priority support');

// Display names
console.log('\nDisplay Names:');
assert(getTierConfig('starter').displayName === 'Starter', 'Starter displayName correct');
assert(getTierConfig('pro').displayName === 'Pro', 'Pro displayName correct');
assert(getTierConfig('agency').displayName === 'Agency', 'Agency displayName correct');

// Fallback
console.log('\nFallback:');
assert(getTierConfig('nonexistent').name === 'starter', 'Unknown tier falls back to starter');

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
