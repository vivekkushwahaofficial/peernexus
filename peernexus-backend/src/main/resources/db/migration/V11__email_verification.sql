-- =============================================================================
-- V11__email_verification.sql
-- Creates email_verification_tokens table
-- =============================================================================

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(200) NOT NULL UNIQUE,
    expiry_date TIMESTAMPTZ NOT NULL
);
