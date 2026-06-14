-- =============================================================================
-- V7__chat_tables.sql
-- Creates chat_rooms, messages tables, and drops obsolete chat_messages
-- =============================================================================

-- Drop obsolete chat_messages table and its indexes if they exist
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id                     BIGSERIAL PRIMARY KEY,
    user1_id               BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id               BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_content   VARCHAR(500),
    last_message_at        TIMESTAMPTZ,
    last_message_sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id           BIGSERIAL PRIMARY KEY,
    chat_room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content      VARCHAR(2000) NOT NULL,
    type         VARCHAR(10) NOT NULL DEFAULT 'TEXT',
    file_name    VARCHAR(255),
    read_at      TIMESTAMPTZ,
    deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on messages room and sent_at
CREATE INDEX IF NOT EXISTS idx_messages_room_sent ON messages(chat_room_id, sent_at DESC);
