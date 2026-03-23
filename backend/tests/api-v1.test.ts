/**
 * Integration tests for REST API v1
 *
 * Prerequisites:
 *   - PostgreSQL running with DATABASE_URL configured
 *   - Run schema migrations before tests
 *
 * Run: npx tsx tests/api-v1.test.ts
 *
 * These tests exercise the full request/response cycle against the Express app.
 * They use a real database connection (no mocks).
 */

import crypto from 'crypto';
import { query } from '../src/config/database';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

// ---------- Helpers ----------

let testUserId: string;
let testJwt: string;
let testProjectId: string;
let testApiKey: string;
let testApiKeyId: string;
let testFeedbackId: string;
let testWebhookId: string;

const testEmail = `test-api-${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';

async function api(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
    apiKey?: string;
  } = {}
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
  if (options.apiKey) headers['Authorization'] = `Bearer ${options.apiKey}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  return { status: res.status, json, headers: res.headers };
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  ✓ ${message}`);
}

// ---------- Setup ----------

async function setup() {
  console.log('\n=== SETUP ===');

  // Create test user
  const signupRes = await api('/auth/signup', {
    method: 'POST',
    body: { email: testEmail, password: testPassword },
  });
  assert(signupRes.status === 201, 'User signup succeeds');
  const signupData = signupRes.json as any;
  testUserId = signupData.user.id;
  testJwt = signupData.accessToken;

  // Upgrade user to pro tier (has API access)
  await query(
    "UPDATE users SET subscription_tier = 'pro', subscription_status = 'active' WHERE id = $1",
    [testUserId]
  );

  // Create a test project
  const projRes = await api('/projects', {
    method: 'POST',
    body: { name: 'API Test Project' },
    token: testJwt,
  });
  assert(projRes.status === 201, 'Project created');
  testProjectId = (projRes.json as any).id;

  console.log('  Setup complete\n');
}

// ---------- Tests ----------

async function testApiKeyGeneration() {
  console.log('--- API Key Generation ---');

  // Generate key
  const res = await api('/api/v1/auth/keys', {
    method: 'POST',
    body: { name: 'Test Key' },
    token: testJwt,
  });
  assert(res.status === 201, 'API key generated (201)');
  const data = res.json as any;
  assert(data.key.startsWith('wfapi_'), 'Key has wfapi_ prefix');
  assert(data.last_four_chars.length === 4, 'Last four chars present');
  assert(data.warning !== undefined, 'Warning message present');
  testApiKey = data.key;
  testApiKeyId = data.id;
}

async function testApiKeyList() {
  console.log('--- API Key List ---');

  const res = await api('/api/v1/auth/keys', { token: testJwt });
  assert(res.status === 200, 'Key list returns 200');
  const data = res.json as any;
  assert(data.keys.length >= 1, 'At least one key returned');
  assert(!data.keys[0].key, 'Full key is NOT returned in list');
  assert(data.keys[0].last_four_chars !== undefined, 'Last four chars shown');
}

async function testTierGating() {
  console.log('--- Tier Gating ---');

  // Create a starter-tier user (no API access)
  const starterEmail = `test-starter-${Date.now()}@example.com`;
  const starterRes = await api('/auth/signup', {
    method: 'POST',
    body: { email: starterEmail, password: testPassword },
  });
  const starterJwt = (starterRes.json as any).accessToken;

  // Starter tier should be blocked from generating keys
  const keyRes = await api('/api/v1/auth/keys', {
    method: 'POST',
    body: { name: 'Should Fail' },
    token: starterJwt,
  });
  assert(keyRes.status === 403, 'Starter tier gets 403 on key generation');
}

async function testInvalidApiKey() {
  console.log('--- Invalid API Key ---');

  const res = await api('/api/v1/projects', { apiKey: 'wfapi_invalid_key_12345' });
  assert(res.status === 401, 'Invalid key returns 401');
  const data = res.json as any;
  assert(data.error.code === 'INVALID_API_KEY', 'Error code is INVALID_API_KEY');
}

async function testProjectsList() {
  console.log('--- Projects List ---');

  const res = await api('/api/v1/projects', { apiKey: testApiKey });
  assert(res.status === 200, 'Projects list returns 200');
  const data = res.json as any;
  assert(data.projects.length >= 1, 'At least one project');
  assert(data.total >= 1, 'Total count present');
  assert(data.limit === 20, 'Default limit is 20');
  assert(data.offset === 0, 'Default offset is 0');
}

async function testProjectsListPagination() {
  console.log('--- Projects Pagination ---');

  const res = await api('/api/v1/projects?limit=1&offset=0', { apiKey: testApiKey });
  assert(res.status === 200, 'Paginated request returns 200');
  const data = res.json as any;
  assert(data.projects.length <= 1, 'Respects limit=1');
  assert(data.limit === 1, 'Limit echoed back');
}

async function testProjectDetail() {
  console.log('--- Project Detail ---');

  const res = await api(`/api/v1/projects/${testProjectId}`, { apiKey: testApiKey });
  assert(res.status === 200, 'Project detail returns 200');
  const data = res.json as any;
  assert(data.id === testProjectId, 'Correct project returned');
  assert(data.name === 'API Test Project', 'Project name matches');
}

async function testProjectNotFound() {
  console.log('--- Project Not Found ---');

  const fakeId = '00000000-0000-0000-0000-000000000000';
  const res = await api(`/api/v1/projects/${fakeId}`, { apiKey: testApiKey });
  assert(res.status === 404, '404 for non-existent project');
  const data = res.json as any;
  assert(data.error.code === 'RESOURCE_NOT_FOUND', 'Error code is RESOURCE_NOT_FOUND');
}

async function testProjectRounds() {
  console.log('--- Project Rounds ---');

  const res = await api(`/api/v1/projects/${testProjectId}/rounds`, { apiKey: testApiKey });
  assert(res.status === 200, 'Rounds list returns 200');
  const data = res.json as any;
  assert(Array.isArray(data.rounds), 'Rounds is an array');
}

async function testCreateFeedback() {
  console.log('--- Create Feedback ---');

  const res = await api(`/api/v1/projects/${testProjectId}/feedback`, {
    method: 'POST',
    body: {
      pageUrl: 'https://example.com/page',
      title: 'Button misaligned on mobile',
      description: 'The CTA button overflows on iPhone SE',
      priority: 'high',
    },
    apiKey: testApiKey,
  });
  assert(res.status === 201, 'Feedback created (201)');
  const data = res.json as any;
  assert(data.id !== undefined, 'Feedback ID returned');
  assert(data.title === 'Button misaligned on mobile', 'Title matches');
  assert(data.priority === 'high', 'Priority matches');
  assert(data.status === 'todo', 'Default status is todo');
  assert(data.deviceInfo !== undefined, 'deviceInfo object present');
  testFeedbackId = data.id;
}

async function testCreateFeedbackValidation() {
  console.log('--- Create Feedback Validation ---');

  const res = await api(`/api/v1/projects/${testProjectId}/feedback`, {
    method: 'POST',
    body: { description: 'Missing required fields' },
    apiKey: testApiKey,
  });
  assert(res.status === 400, 'Validation error returns 400');
  const data = res.json as any;
  assert(data.error.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');
  assert(data.error.details.pageUrl !== undefined, 'Missing pageUrl flagged');
  assert(data.error.details.title !== undefined, 'Missing title flagged');
}

async function testListFeedback() {
  console.log('--- List Feedback ---');

  const res = await api(`/api/v1/projects/${testProjectId}/feedback`, { apiKey: testApiKey });
  assert(res.status === 200, 'Feedback list returns 200');
  const data = res.json as any;
  assert(data.feedback.length >= 1, 'At least one feedback');
  assert(data.total >= 1, 'Total count present');
}

async function testFilterFeedback() {
  console.log('--- Filter Feedback ---');

  const res = await api(
    `/api/v1/projects/${testProjectId}/feedback?status=todo&priority=high`,
    { apiKey: testApiKey }
  );
  assert(res.status === 200, 'Filtered request returns 200');
  const data = res.json as any;
  for (const f of data.feedback) {
    assert(f.status === 'todo', 'Status filter applied');
    assert(f.priority === 'high', 'Priority filter applied');
  }
}

async function testGetSingleFeedback() {
  console.log('--- Get Single Feedback ---');

  const res = await api(`/api/v1/feedback/${testFeedbackId}`, { apiKey: testApiKey });
  assert(res.status === 200, 'Single feedback returns 200');
  const data = res.json as any;
  assert(data.id === testFeedbackId, 'Correct feedback returned');
  assert(data.deviceInfo !== undefined, 'Device info included');
}

async function testUpdateFeedback() {
  console.log('--- Update Feedback ---');

  const res = await api(`/api/v1/feedback/${testFeedbackId}`, {
    method: 'PATCH',
    body: { status: 'in-progress', notes: 'Working on this' },
    apiKey: testApiKey,
  });
  assert(res.status === 200, 'Update returns 200');
  const data = res.json as any;
  assert(data.status === 'in-progress', 'Status updated');
  assert(data.notes === 'Working on this', 'Notes updated');
}

async function testDeleteFeedback() {
  console.log('--- Soft-Delete Feedback ---');

  // Create another feedback to delete
  const createRes = await api(`/api/v1/projects/${testProjectId}/feedback`, {
    method: 'POST',
    body: { pageUrl: 'https://example.com/delete-me', title: 'To be deleted' },
    apiKey: testApiKey,
  });
  const deleteId = (createRes.json as any).id;

  const res = await api(`/api/v1/feedback/${deleteId}`, {
    method: 'DELETE',
    apiKey: testApiKey,
  });
  assert(res.status === 200, 'Delete returns 200');

  // Verify it's gone from list
  const listRes = await api(`/api/v1/projects/${testProjectId}/feedback`, { apiKey: testApiKey });
  const data = listRes.json as any;
  const found = data.feedback.find((f: any) => f.id === deleteId);
  assert(!found, 'Deleted feedback not in list (soft-deleted)');

  // Verify direct access also fails
  const getRes = await api(`/api/v1/feedback/${deleteId}`, { apiKey: testApiKey });
  assert(getRes.status === 404, 'Deleted feedback returns 404 on direct access');
}

async function testOrgIsolation() {
  console.log('--- Org Isolation ---');

  // Create another user with pro tier
  const otherEmail = `test-other-${Date.now()}@example.com`;
  const otherRes = await api('/auth/signup', {
    method: 'POST',
    body: { email: otherEmail, password: testPassword },
  });
  const otherUserId = (otherRes.json as any).user.id;
  const otherJwt = (otherRes.json as any).accessToken;

  await query(
    "UPDATE users SET subscription_tier = 'pro', subscription_status = 'active' WHERE id = $1",
    [otherUserId]
  );

  // Generate API key for other user
  const keyRes = await api('/api/v1/auth/keys', {
    method: 'POST',
    body: { name: 'Other User Key' },
    token: otherJwt,
  });
  const otherApiKey = (keyRes.json as any).key;

  // Try to access first user's project
  const projRes = await api(`/api/v1/projects/${testProjectId}`, { apiKey: otherApiKey });
  assert(projRes.status === 404, 'Other user cannot access project (404)');

  // Try to access first user's feedback
  const fbRes = await api(`/api/v1/feedback/${testFeedbackId}`, { apiKey: otherApiKey });
  assert(fbRes.status === 404, 'Other user cannot access feedback (404)');
}

async function testRateLimitHeaders() {
  console.log('--- Rate Limit Headers ---');

  const res = await api('/api/v1/projects', { apiKey: testApiKey });
  assert(res.headers.get('X-RateLimit-Limit') === '100', 'X-RateLimit-Limit header present');
  assert(res.headers.get('X-RateLimit-Remaining') !== null, 'X-RateLimit-Remaining header present');
  assert(res.headers.get('X-RateLimit-Reset') !== null, 'X-RateLimit-Reset header present');
}

async function testWebhookCreate() {
  console.log('--- Webhook Create ---');

  const res = await api('/api/v1/webhooks', {
    method: 'POST',
    body: {
      url: 'https://example.com/webhook',
      events: ['feedback.created', 'feedback.updated'],
    },
    apiKey: testApiKey,
  });
  assert(res.status === 201, 'Webhook created (201)');
  const data = res.json as any;
  assert(data.id !== undefined, 'Webhook ID returned');
  assert(data.secret !== undefined, 'Secret returned on creation');
  assert(data.active === true, 'Webhook is active');
  testWebhookId = data.id;
}

async function testWebhookList() {
  console.log('--- Webhook List ---');

  const res = await api('/api/v1/webhooks', { apiKey: testApiKey });
  assert(res.status === 200, 'Webhook list returns 200');
  const data = res.json as any;
  assert(data.webhooks.length >= 1, 'At least one webhook');
}

async function testWebhookUpdate() {
  console.log('--- Webhook Update ---');

  const res = await api(`/api/v1/webhooks/${testWebhookId}`, {
    method: 'PATCH',
    body: { events: ['feedback.created'] },
    apiKey: testApiKey,
  });
  assert(res.status === 200, 'Webhook updated');
  const data = res.json as any;
  const events = data.events as string[];
  assert(events.length === 1, 'Events updated to single event');
}

async function testWebhookDeactivate() {
  console.log('--- Webhook Deactivate ---');

  const res = await api(`/api/v1/webhooks/${testWebhookId}`, {
    method: 'DELETE',
    apiKey: testApiKey,
  });
  assert(res.status === 200, 'Webhook deactivated');
}

async function testApiKeyRevocation() {
  console.log('--- API Key Revocation ---');

  // Generate a key to revoke
  const genRes = await api('/api/v1/auth/keys', {
    method: 'POST',
    body: { name: 'To Revoke' },
    token: testJwt,
  });
  const revokeKeyId = (genRes.json as any).id;
  const revokeKey = (genRes.json as any).key;

  // Revoke it
  const revokeRes = await api(`/api/v1/auth/keys/${revokeKeyId}`, {
    method: 'DELETE',
    token: testJwt,
  });
  assert(revokeRes.status === 200, 'Key revoked');

  // Verify it no longer works
  const useRes = await api('/api/v1/projects', { apiKey: revokeKey });
  assert(useRes.status === 401, 'Revoked key returns 401');
}

// ---------- Cleanup ----------

async function cleanup() {
  console.log('\n=== CLEANUP ===');
  try {
    // Delete test data (cascading deletes handle most things)
    await query('DELETE FROM users WHERE email LIKE $1', ['test-%-example.com']);
    console.log('  Test data cleaned up\n');
  } catch (err) {
    console.error('  Cleanup error:', err);
  }
}

// ---------- Runner ----------

async function run() {
  let failures = 0;

  try {
    await setup();

    const tests = [
      testApiKeyGeneration,
      testApiKeyList,
      testTierGating,
      testInvalidApiKey,
      testProjectsList,
      testProjectsListPagination,
      testProjectDetail,
      testProjectNotFound,
      testProjectRounds,
      testCreateFeedback,
      testCreateFeedbackValidation,
      testListFeedback,
      testFilterFeedback,
      testGetSingleFeedback,
      testUpdateFeedback,
      testDeleteFeedback,
      testOrgIsolation,
      testRateLimitHeaders,
      testWebhookCreate,
      testWebhookList,
      testWebhookUpdate,
      testWebhookDeactivate,
      testApiKeyRevocation,
    ];

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
