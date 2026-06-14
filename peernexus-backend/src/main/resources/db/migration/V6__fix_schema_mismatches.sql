-- =============================================================================
-- V6__fix_schema_mismatches.sql
-- Fixes mismatches in users, connections, doubts, moderation_actions, and refresh_tokens
-- =============================================================================

-- ── 1. Users table additions ──────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_level VARCHAR(20) NOT NULL DEFAULT 'BEGINNER';

-- ── 2. Connections table corrections ──────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'connections' AND column_name = 'addressee_id'
    ) THEN
        ALTER TABLE connections RENAME COLUMN addressee_id TO recipient_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'connections' AND constraint_name = 'connections_requester_id_recipient_id_key'
    ) THEN
        ALTER TABLE connections ADD CONSTRAINT connections_requester_id_recipient_id_key UNIQUE (requester_id, recipient_id);
    END IF;
END $$;
ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_requester_id_addressee_id_key;

-- ── 3. Moderation Actions corrections ──────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'moderation_actions' AND column_name = 'target_id'
    ) THEN
        ALTER TABLE moderation_actions RENAME COLUMN target_id TO target_user_id;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'moderation_actions' AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE moderation_actions RENAME COLUMN expires_at TO suspend_until;
    END IF;
END $$;
ALTER TABLE moderation_actions ADD COLUMN IF NOT EXISTS target_content_id BIGINT;
ALTER TABLE moderation_actions ADD COLUMN IF NOT EXISTS target_content_type VARCHAR(20);
ALTER TABLE moderation_actions ALTER COLUMN reason TYPE VARCHAR(1000);

-- ── 4. Refresh Tokens corrections ─────────────────────────────────────────────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'refresh_tokens' AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE refresh_tokens RENAME COLUMN expires_at TO expiry_date;
    END IF;
END $$;
ALTER TABLE refresh_tokens DROP COLUMN IF EXISTS revoked;
ALTER TABLE refresh_tokens DROP COLUMN IF EXISTS created_at;
ALTER TABLE refresh_tokens ALTER COLUMN token TYPE VARCHAR(200);

-- ── 5. New Doubt sub-tables: categories, tags, doubt_tags, doubt_images ──────
CREATE TABLE IF NOT EXISTS categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tags (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS doubt_tags (
    doubt_id BIGINT NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
    tag_id   BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (doubt_id, tag_id)
);

CREATE TABLE IF NOT EXISTS doubt_images (
    id       BIGSERIAL PRIMARY KEY,
    url      VARCHAR(500) NOT NULL,
    doubt_id BIGINT NOT NULL REFERENCES doubts(id) ON DELETE CASCADE
);

-- ── 6. Doubts table adjustments ──────────────────────────────────────────────
-- Insert default category
INSERT INTO categories (name, description) VALUES ('General', 'General category') ON CONFLICT DO NOTHING;

-- Add category_id to doubts
ALTER TABLE doubts ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE;
UPDATE doubts SET category_id = (SELECT id FROM categories LIMIT 1) WHERE category_id IS NULL;
ALTER TABLE doubts ALTER COLUMN category_id SET NOT NULL;

-- Remove obsolete columns
ALTER TABLE doubts DROP COLUMN IF EXISTS subject;
ALTER TABLE doubts DROP COLUMN IF EXISTS tags;
ALTER TABLE doubts DROP COLUMN IF EXISTS image_url;

-- Alter column sizes
ALTER TABLE doubts ALTER COLUMN title TYPE VARCHAR(150);
ALTER TABLE doubts ALTER COLUMN content TYPE VARCHAR(5000);


CREATE INDEX IF NOT EXISTS idx_connections_recipient
ON connections(recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_users_enabled
ON users(enabled)
WHERE enabled = TRUE;