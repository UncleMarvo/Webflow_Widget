/**
 * Tests for project limit enforcement per subscription tier
 *
 * Prerequisites:
 *   - PostgreSQL running with DATABASE_URL configured
 *   - Run schema migrations before tests
 *
 * Run: npx tsx tests/project-limits.test.ts
 */

import { query } from '../src/config/database';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const testPassword = 'TestPassword123!';

async function api(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json: unknown;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  ✓ ${message}`);
}

async function createUserWithTier(tier: string): Promise<{ userId: string; jwt: string }> {
  const email = `test-limit-${tier}-${Date.now()}@example.com`;
  const res = await api('/auth/signup', {
    method: 'POST',
    body: { email, password: testPassword },
  });
  const data = res.json as any;
  const userId = data.user.id;
  const jwt = data.accessToken;

  await query(
    'UPDATE users SET subscription_tier = $1, subscription_status = $2 WHERE id = $3',
    [tier, 'active', userId]
  );

  return { userId, jwt };
}

async function createProjects(jwt: string, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await api('/projects', {
      method: 'POST',
      body: { name: `Test Project ${i + 1}` },
      token: jwt,
    });
  }
}

// ---------- Tests ----------

async function testStarterProjectLimit() {
  console.log('--- Starter: 11th project gets 403 ---');

  const { jwt } = await createUserWithTier('starter');

  // Create 10 projects (the limit for Starter)
  await createProjects(jwt, 10);

  // 11th project should fail
  const res = await api('/projects', {
    method: 'POST',
    body: { name: 'Over Limit Project' },
    token: jwt,
  });

  assert(res.status === 403, 'Starter user with 10 projects gets 403 on 11th');
  const data = res.json as any;
  assert(data.code === 'PROJECT_LIMIT_REACHED', 'Error code is PROJECT_LIMIT_REACHED');
  assert(data.projectLimit === 10, 'Project limit is 10');
}

async function testProProjectLimit() {
  console.log('--- Pro: 51st project gets 403 ---');

  const { userId, jwt } = await createUserWithTier('pro');

  // Insert 50 projects directly via DB for speed
  for (let i = 0; i < 50; i++) {
    await query(
      "INSERT INTO projects (user_id, name, api_key) VALUES ($1, $2, $3)",
      [userId, `Bulk Project ${i + 1}`, `wf_test_${Date.now()}_${i}`]
    );
  }

  // 51st project should fail
  const res = await api('/projects', {
    method: 'POST',
    body: { name: 'Over Limit Project' },
    token: jwt,
  });

  assert(res.status === 403, 'Pro user with 50 projects gets 403 on 51st');
  const data = res.json as any;
  assert(data.code === 'PROJECT_LIMIT_REACHED', 'Error code is PROJECT_LIMIT_REACHED');
  assert(data.projectLimit === 50, 'Project limit is 50');
}

async function testAgencyUnlimitedProjects() {
  console.log('--- Agency: unlimited projects ---');

  const { userId, jwt } = await createUserWithTier('agency');

  // Insert 60 projects directly via DB
  for (let i = 0; i < 60; i++) {
    await query(
      "INSERT INTO projects (user_id, name, api_key) VALUES ($1, $2, $3)",
      [userId, `Agency Project ${i + 1}`, `wf_agency_${Date.now()}_${i}`]
    );
  }

  // 61st project should succeed
  const res = await api('/projects', {
    method: 'POST',
    body: { name: 'Agency Extra Project' },
    token: jwt,
  });

  assert(res.status === 201, 'Agency user can create projects beyond 60');
}

async function testTierBadgeInSubscription() {
  console.log('--- Tier badge data for all tiers ---');

  for (const tierName of ['starter', 'pro', 'agency']) {
    const { jwt } = await createUserWithTier(tierName);

    const res = await api('/subscription/tier', { token: jwt });
    assert(res.status === 200, `${tierName} tier info returns 200`);

    const data = res.json as any;
    assert(data.tier === tierName, `${tierName}: tier name matches`);
    assert(data.displayName !== undefined, `${tierName}: displayName present`);
    assert(data.featureAccess !== undefined, `${tierName}: featureAccess present`);
  }
}

// ---------- Cleanup ----------

async function cleanup() {
  console.log('\n=== CLEANUP ===');
  try {
    await query('DELETE FROM users WHERE email LIKE $1', ['test-limit-%-example.com']);
    console.log('  Test data cleaned up\n');
  } catch (err) {
    console.error('  Cleanup error:', err);
  }
}

// ---------- Runner ----------

async function run() {
  let failures = 0;

  const tests = [
    testStarterProjectLimit,
    testProProjectLimit,
    testAgencyUnlimitedProjects,
    testTierBadgeInSubscription,
  ];

  try {
    for (const test of tests) {
      try {
        await test();
      } catch (err) {
        console.error(`  ✗ ${test.name}: ${(err as Error).message}`);
        failures++;
      }
    }
  } finally {
    await cleanup();
  }

  console.log(`\n=== RESULTS: ${failures === 0 ? 'ALL PASSED' : `${failures} FAILED`} ===\n`);
  process.exit(failures > 0 ? 1 : 0);
}

run();
