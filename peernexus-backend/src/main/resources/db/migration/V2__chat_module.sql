-- =============================================================================
-- V2__chat_module.sql
-- Private direct-message (chat) tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id          BIGSERIAL PRIMARY KEY,
    sender_id   BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     VARCHAR(2000) NOT NULL,
    type        VARCHAR(10)   NOT NULL DEFAULT 'TEXT',
    file_name   VARCHAR(255),
    read_at     TIMESTAMPTZ,
    deleted     BOOLEAN       NOT NULL DEFAULT FALSE,
    sent_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sender_receiver ON chat_messages(sender_id, receiver_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_receiver        ON chat_messages(receiver_id, sent_at DESC);
