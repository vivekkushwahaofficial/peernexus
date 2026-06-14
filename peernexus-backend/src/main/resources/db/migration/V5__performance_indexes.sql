-- Doubts
CREATE INDEX IF NOT EXISTS idx_doubts_created_desc
ON doubts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_doubts_title_status
ON doubts(title, status);

-- Answers
CREATE INDEX IF NOT EXISTS idx_answers_author
ON answers(author_id);

CREATE INDEX IF NOT EXISTS idx_answers_accepted
ON answers(doubt_id, accepted)
WHERE accepted = TRUE;

-- Connections
CREATE INDEX IF NOT EXISTS idx_connections_status
ON connections(status);

-- Created in V6 after addressee_id is renamed to recipient_id

-- Created in V10 after messages table exists

-- Group Messages
CREATE INDEX IF NOT EXISTS idx_group_msgs_not_deleted
ON group_messages(group_id, sent_at DESC)
WHERE deleted = FALSE;

-- Reputation
CREATE INDEX IF NOT EXISTS idx_rep_events_user_date
ON reputation_transactions(user_id, created_at DESC);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_enabled
ON users(enabled)
WHERE enabled = TRUE;