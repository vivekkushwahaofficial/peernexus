-- =============================================================================
-- V3__group_module.sql
-- Study groups, memberships, join requests, group chat messages and read receipts
-- =============================================================================

-- ── Study Groups ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_groups (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(100)  NOT NULL,
    description      VARCHAR(1000),
    image_url        VARCHAR(500),
    image_public_id  VARCHAR(300),
    topic            VARCHAR(100),
    is_private       BOOLEAN       NOT NULL DEFAULT FALSE,
    member_count     INTEGER       NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Group Members ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_members (
    id         BIGSERIAL PRIMARY KEY,
    group_id   BIGINT      NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id    BIGINT      NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    role       VARCHAR(10) NOT NULL DEFAULT 'MEMBER',
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- ── Group Join Requests ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_join_requests (
    id            BIGSERIAL PRIMARY KEY,
    group_id      BIGINT      NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    requester_id  BIGINT      NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    message       VARCHAR(500),
    status        VARCHAR(10) NOT NULL DEFAULT 'PENDING',
    reviewed_by   BIGINT      REFERENCES users(id),
    reviewed_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Group Chat Messages ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_messages (
    id         BIGSERIAL PRIMARY KEY,
    group_id   BIGINT        NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
    sender_id  BIGINT        NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    content    VARCHAR(2000) NOT NULL,
    type       VARCHAR(10)   NOT NULL DEFAULT 'TEXT',
    file_name  VARCHAR(255),
    deleted    BOOLEAN       NOT NULL DEFAULT FALSE,
    sent_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Group Message Read Receipts ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_message_reads (
    id         BIGSERIAL PRIMARY KEY,
    message_id BIGINT      NOT NULL REFERENCES group_messages(id) ON DELETE CASCADE,
    reader_id  BIGINT      NOT NULL REFERENCES users(id)          ON DELETE CASCADE,
    read_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, reader_id)
);

-- ── Performance Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_group_members_group    ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user     ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group   ON group_messages(group_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_reads_message    ON group_message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_group    ON group_join_requests(group_id, status);
