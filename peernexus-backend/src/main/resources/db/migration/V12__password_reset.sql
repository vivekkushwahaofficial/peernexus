-- =============================================================================
-- V12__password_reset.sql
-- Creates password_reset_tokens table
-- =============================================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(200) NOT NULL UNIQUE,
    expiry_date TIMESTAMPTZ NOT NULL
);
