-- =============================================================================
-- V9__admin_tables.sql
-- Creates reports and audit_logs tables
-- =============================================================================

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id                     BIGSERIAL PRIMARY KEY,
    reporter_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                   VARCHAR(20) NOT NULL,
    target_id              BIGINT NOT NULL,
    reason                 VARCHAR(1000) NOT NULL,
    status                 VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    reviewed_by_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    admin_notes            VARCHAR(1000),
    resolved_by_action_id  BIGINT REFERENCES moderation_actions(id) ON DELETE SET NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at            TIMESTAMPTZ
);

-- Index on reports status and created_at
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports(status, created_at DESC);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGSERIAL PRIMARY KEY,
    actor_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action       VARCHAR(60) NOT NULL,
    target_type  VARCHAR(20),
    target_id    BIGINT,
    details      VARCHAR(2000),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
