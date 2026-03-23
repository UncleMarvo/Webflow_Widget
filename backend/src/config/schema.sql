-- Webflow Feedback Tool - Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  page_title VARCHAR(500),
  x FLOAT,
  y FLOAT,
  annotation TEXT,
  screenshot_url TEXT,
  device_type VARCHAR(50),
  viewport_width INTEGER,
  viewport_height INTEGER,
  browser_name VARCHAR(100),
  browser_version VARCHAR(50),
  os_name VARCHAR(100),
  os_version VARCHAR(50),
  user_agent TEXT,
  device_pixel_ratio FLOAT,
  screen_width INTEGER,
  screen_height INTEGER,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email VARCHAR(255),
  invited_by UUID NOT NULL REFERENCES users(id),
  invite_token VARCHAR(64) UNIQUE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add device detection columns (safe to re-run: IF NOT EXISTS)
DO $$ BEGIN
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS browser_name VARCHAR(100);
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS browser_version VARCHAR(50);
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS os_name VARCHAR(100);
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS os_version VARCHAR(50);
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_agent TEXT;
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS device_pixel_ratio FLOAT;
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS screen_width INTEGER;
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS screen_height INTEGER;
END $$;

-- Add subscription columns to users table (safe to re-run: IF NOT EXISTS)
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'pro';
  ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active';
  ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE;
END $$;

-- Add Stripe columns to users table (safe to re-run: IF NOT EXISTS)
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
  ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_until TIMESTAMP WITH TIME ZONE;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Usage tracking table for monthly feedback counts
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- format: YYYY-MM
  feedback_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Rounds table for feedback approval workflow (Premium feature)
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'archived')),
  description TEXT,
  feedback_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Junction table for round-feedback assignments
CREATE TABLE IF NOT EXISTS round_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, feedback_id)
);

-- Add round columns to feedback table
DO $$ BEGIN
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS round_id UUID REFERENCES rounds(id) ON DELETE SET NULL;
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS assigned_to_round_at TIMESTAMP WITH TIME ZONE;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);
CREATE INDEX IF NOT EXISTS idx_feedback_project_id ON feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_round_id ON feedback(round_id);
CREATE INDEX IF NOT EXISTS idx_project_invites_token ON project_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month);
CREATE INDEX IF NOT EXISTS idx_rounds_project_id ON rounds(project_id);
CREATE INDEX IF NOT EXISTS idx_rounds_status ON rounds(status);
CREATE INDEX IF NOT EXISTS idx_round_feedback_round_id ON round_feedback(round_id);
CREATE INDEX IF NOT EXISTS idx_round_feedback_feedback_id ON round_feedback(feedback_id);

-- Add soft-delete column to feedback
DO $$ BEGIN
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;
  ALTER TABLE feedback ADD COLUMN IF NOT EXISTS notes TEXT;
END $$;

-- API Keys table for REST API v1 authentication
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(128) NOT NULL,
  last_four_chars VARCHAR(4) NOT NULL,
  name VARCHAR(255) DEFAULT 'Default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Webhooks table for event subscriptions
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  secret VARCHAR(128) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook delivery log for retry tracking
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  response_status INTEGER,
  response_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_feedback_deleted_at ON feedback(deleted_at);
