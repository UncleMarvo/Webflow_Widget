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

-- Usage tracking table for monthly feedback counts
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- format: YYYY-MM
  feedback_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);
CREATE INDEX IF NOT EXISTS idx_feedback_project_id ON feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_project_invites_token ON project_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month);
