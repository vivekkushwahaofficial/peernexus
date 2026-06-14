-- =============================================================================
-- V4__admin_module.sql
-- Admin and notification tables
-- =============================================================================

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id             BIGSERIAL PRIMARY KEY,
    recipient_id   BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id       BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    type           VARCHAR(40)  NOT NULL,
    message        VARCHAR(500) NOT NULL,
    is_read        BOOLEAN      NOT NULL DEFAULT FALSE,
    reference_type VARCHAR(50),
    reference_id   BIGINT,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread    ON notifications(recipient_id, is_read) WHERE is_read = FALSE;

-- ── Admin Ban/Suspension log ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS moderation_actions (
    id           BIGSERIAL PRIMARY KEY,
    target_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type  VARCHAR(20)  NOT NULL,
    reason       VARCHAR(500),
    expires_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
