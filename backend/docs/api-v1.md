# Webflow Feedback Tool — REST API v1

## Overview

The REST API v1 provides programmatic access to your feedback data, projects, and webhook configuration. It is available to **Premium** and **Agency** tier subscribers.

**Base URL:** `https://your-server.com/api/v1`

---

## Authentication

### API Keys

API keys are the primary authentication method for the REST API. They are scoped to your user account and provide access to all your projects.

**Generate a key** via the dashboard (Settings → API Keys) or via the API itself using your JWT token:

```bash
curl -X POST https://your-server.com/api/v1/auth/keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Key"}'
```

Response:
```json
{
  "id": "uuid",
  "name": "Production Key",
  "last_four_chars": "a1b2",
  "key": "wfapi_abc123...full_key_here",
  "warning": "Store this key securely. It will not be shown again.",
  "created_at": "2026-03-23T10:00:00Z"
}
```

> **Important:** The full key is returned **only once** at creation. Store it securely.

### Using API Keys

Include the key in the `Authorization` header:

```
Authorization: Bearer wfapi_your_api_key_here
```

### Key Management Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/keys` | Generate new API key (JWT auth) |
| `GET` | `/api/v1/auth/keys` | List active keys (JWT auth) |
| `DELETE` | `/api/v1/auth/keys/{keyId}` | Revoke API key (JWT auth) |

---

## Rate Limiting

- **100 requests per 60 seconds** per API key
- Rate limit is tracked per key, not per user
- Multiple keys have separate rate limits

### Response Headers

Every API response includes:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window (100) |
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset` | Unix timestamp when window resets |

When rate-limited (HTTP 429):

| Header | Description |
|--------|-------------|
| `Retry-After` | Seconds until you can retry |

---

## Error Handling

All errors follow a standard format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Feedback with ID abc123 not found",
    "details": null
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_API_KEY` | 401 | API key is missing, invalid, or revoked |
| `INSUFFICIENT_PERMISSIONS` | 403 | Tier doesn't include API access |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid input; `details` contains field errors |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Projects

### List Projects

```
GET /api/v1/projects?limit=20&offset=0
```

**Query Parameters:**

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `limit` | int | 20 | 100 | Items per page |
| `offset` | int | 0 | — | Skip N items |

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "My Website",
      "created_at": "2026-03-20T10:00:00Z",
      "feedback_count": 42
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0
}
```

### Get Project

```
GET /api/v1/projects/{projectId}
```

### List Project Rounds

```
GET /api/v1/projects/{projectId}/rounds
```

**Response:**
```json
{
  "rounds": [
    {
      "id": "uuid",
      "name": "Round 1",
      "status": "active",
      "description": null,
      "feedback_count": 15,
      "created_at": "2026-03-20T10:00:00Z",
      "updated_at": "2026-03-22T14:00:00Z",
      "starts_at": null,
      "ends_at": null
    }
  ]
}
```

---

## Feedback

### List Feedback

```
GET /api/v1/projects/{projectId}/feedback?status=todo&priority=high&limit=20&offset=0
```

**Query Parameters:**

| Param | Type | Values | Description |
|-------|------|--------|-------------|
| `status` | string | `todo`, `in-progress`, `done` | Filter by status |
| `priority` | string | `low`, `normal`, `high`, `urgent` | Filter by priority |
| `roundId` | uuid | — | Filter by round |
| `limit` | int | 1–100 (default 20) | Items per page |
| `offset` | int | 0+ (default 0) | Skip N items |

**Response:**
```json
{
  "feedback": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "title": "Button misaligned on mobile",
      "description": "CTA overflows on iPhone SE",
      "status": "todo",
      "priority": "high",
      "pageUrl": "https://example.com/page",
      "roundId": "uuid",
      "roundName": "Round 1",
      "notes": null,
      "deviceInfo": {
        "browser": "Chrome 120",
        "os": "macOS 14.2",
        "resolution": "1920x1080",
        "screenResolution": "1920x1080",
        "deviceType": "desktop",
        "userAgent": "Mozilla/5.0..."
      },
      "createdAt": "2026-03-23T09:00:00Z",
      "updatedAt": null
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### Get Single Feedback

```
GET /api/v1/feedback/{feedbackId}
```

Returns the full feedback object with all metadata, including device info.

### Create Feedback

```
POST /api/v1/projects/{projectId}/feedback
```

**Request Body:**
```json
{
  "pageUrl": "https://example.com/page",
  "title": "Button color is wrong",
  "description": "Should be blue, not green",
  "priority": "high",
  "roundId": "uuid (optional)"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `pageUrl` | Yes | URL of the page |
| `title` | Yes | Feedback title |
| `description` | No | Additional details |
| `priority` | No | `low`, `normal` (default), `high`, `urgent` |
| `roundId` | No | Assign to specific round |

**Response:** `201` with created feedback object.

### Update Feedback

```
PATCH /api/v1/feedback/{feedbackId}
```

**Request Body:**
```json
{
  "status": "in-progress",
  "priority": "urgent",
  "notes": "Assigned to design team",
  "roundId": "uuid"
}
```

All fields are optional. Send only the fields you want to update.

### Delete Feedback (Soft-Delete)

```
DELETE /api/v1/feedback/{feedbackId}
```

Marks the feedback as deleted. It will no longer appear in listings or direct access.

---

## Webhooks

Webhooks deliver real-time event notifications to your server when feedback is created, updated, or deleted.

### Register Webhook

```
POST /api/v1/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-server.com/webhook",
  "events": ["feedback.created", "feedback.updated", "feedback.deleted"]
}
```

**Response:** `201`
```json
{
  "id": "uuid",
  "url": "https://your-server.com/webhook",
  "events": ["feedback.created", "feedback.updated", "feedback.deleted"],
  "active": true,
  "secret": "hex_string_for_signature_verification",
  "warning": "Store this secret securely. Use it to verify webhook signatures.",
  "created_at": "2026-03-23T10:00:00Z"
}
```

> **Important:** The `secret` is returned **only once** at creation. Store it to verify signatures.

### Webhook Payload

```json
{
  "event": "feedback.created",
  "timestamp": "2026-03-23T09:24:00Z",
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "Button misaligned",
    "description": "On iPhone SE",
    "status": "todo",
    "priority": "high",
    "pageUrl": "https://example.com/page",
    "roundId": "uuid",
    "createdAt": "2026-03-23T09:24:00Z"
  }
}
```

### Verifying Signatures

Every webhook request includes an `X-Webhook-Signature` header containing an HMAC-SHA256 signature of the request body using your webhook secret.

**Node.js Example:**
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(body, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your Express handler:
app.post('/webhook', express.text({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  if (!verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  const event = JSON.parse(req.body);
  console.log('Received:', event.event, event.data);
  res.sendStatus(200);
});
```

**Python Example:**
```python
import hmac, hashlib

def verify_signature(body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected)
```

### Retry Policy

- Failed deliveries are retried up to **3 times** with exponential backoff
- 4xx errors (except 429) are **not retried** (considered permanent failures)
- Maximum delivery lifetime: 24 hours

### Webhook Management

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/webhooks` | Register webhook |
| `GET` | `/api/v1/webhooks` | List webhooks |
| `PATCH` | `/api/v1/webhooks/{webhookId}` | Update URL or events |
| `DELETE` | `/api/v1/webhooks/{webhookId}` | Deactivate webhook |
| `POST` | `/api/v1/webhooks/{webhookId}/test` | Send test event |

---

## Code Examples

### curl

```bash
# List projects
curl https://your-server.com/api/v1/projects \
  -H "Authorization: Bearer wfapi_your_key"

# Create feedback
curl -X POST https://your-server.com/api/v1/projects/PROJECT_ID/feedback \
  -H "Authorization: Bearer wfapi_your_key" \
  -H "Content-Type: application/json" \
  -d '{"pageUrl": "https://example.com", "title": "Bug report", "priority": "high"}'

# Update feedback status
curl -X PATCH https://your-server.com/api/v1/feedback/FEEDBACK_ID \
  -H "Authorization: Bearer wfapi_your_key" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

### Node.js

```javascript
const API_KEY = 'wfapi_your_key';
const BASE = 'https://your-server.com/api/v1';

async function listFeedback(projectId) {
  const res = await fetch(`${BASE}/projects/${projectId}/feedback?status=todo`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function createFeedback(projectId, data) {
  const res = await fetch(`${BASE}/projects/${projectId}/feedback`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

### Python

```python
import requests

API_KEY = "wfapi_your_key"
BASE = "https://your-server.com/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

def list_projects():
    r = requests.get(f"{BASE}/projects", headers=HEADERS)
    r.raise_for_status()
    return r.json()

def create_feedback(project_id, page_url, title, priority="normal"):
    r = requests.post(
        f"{BASE}/projects/{project_id}/feedback",
        headers=HEADERS,
        json={"pageUrl": page_url, "title": title, "priority": priority},
    )
    r.raise_for_status()
    return r.json()

def update_feedback(feedback_id, **kwargs):
    r = requests.patch(
        f"{BASE}/feedback/{feedback_id}",
        headers=HEADERS,
        json=kwargs,
    )
    r.raise_for_status()
    return r.json()
```

---

## OpenAPI Specification

The full OpenAPI 3.0 spec is available at:

```
GET /api/v1/openapi.json
```

You can load this into Swagger UI or any OpenAPI-compatible tool for interactive exploration.
