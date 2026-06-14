-- =============================================================================
-- V8__reputation_tables.sql
-- Creates reputation_transactions table and drops obsolete reputation_events
-- =============================================================================

-- Drop obsolete reputation_events table
DROP TABLE IF EXISTS reputation_events CASCADE;

-- Create reputation_transactions table
CREATE TABLE IF NOT EXISTS reputation_transactions (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type           VARCHAR(30) NOT NULL,
    points         INTEGER NOT NULL,
    reference_type VARCHAR(40),
    reference_id   BIGINT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on user and created_at
CREATE INDEX IF NOT EXISTS idx_rep_events_user_date ON reputation_transactions(user_id, created_at DESC);
