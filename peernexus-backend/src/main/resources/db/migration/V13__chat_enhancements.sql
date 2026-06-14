-- =============================================================================
-- V13__chat_enhancements.sql
-- Chat module upgrade: presence tracking, reactions, edit history, pins, and attachments
-- =============================================================================

-- ── 1. User Presence ──────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS online BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITHOUT TIME ZONE;

-- ── 2. Message status and attachment metadata ───────────────────────────────
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'SENT';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_url VARCHAR(500);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing messages status
UPDATE messages SET status = 'READ' WHERE read_at IS NOT NULL;

-- ── 3. Chat Room last message type ───────────────────────────────────────────
ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS last_message_type VARCHAR(10);

-- ── 4. Message Reactions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_reactions (
    id         BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction   VARCHAR(10) NOT NULL,
    CONSTRAINT unique_message_user_reaction UNIQUE (message_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_msg ON message_reactions(message_id);

-- ── 5. Message Edit History ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_edits (
    id          BIGSERIAL PRIMARY KEY,
    message_id  BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    old_content VARCHAR(2000) NOT NULL,
    edited_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_edits_msg ON message_edits(message_id);

-- ── 6. Local Message Deletions ("Delete for me") ─────────────────────────────
CREATE TABLE IF NOT EXISTS user_deleted_messages (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_deleted_message UNIQUE (user_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_user_deleted_msg ON user_deleted_messages(user_id, message_id);
