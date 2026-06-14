-- =============================================================================
-- V10__missing_indexes.sql
-- Optimizes query performance by creating missing foreign key and search indexes
-- =============================================================================

-- Doubts indexes
CREATE INDEX IF NOT EXISTS idx_doubts_category_created ON doubts(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doubts_author_created ON doubts(author_id, created_at DESC);

-- Answers indexes
CREATE INDEX IF NOT EXISTS idx_answers_doubt_created ON answers(doubt_id, created_at DESC);

-- Connections indexes
CREATE INDEX IF NOT EXISTS idx_connections_requester_status ON connections(requester_id, status);

-- Group Members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON group_members(user_id, group_id);

-- Chat Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(chat_room_id, read_at) WHERE read_at IS NULL;
