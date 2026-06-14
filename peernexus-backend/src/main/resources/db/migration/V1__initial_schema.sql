-- =============================================================================
-- V1__initial_schema.sql
-- Core tables: users, auth tokens, reputations, doubts, answers, votes
-- =============================================================================

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(100)  NOT NULL,
    email            VARCHAR(150)  NOT NULL UNIQUE,
    password         VARCHAR(255)  NOT NULL,
    profile_picture  VARCHAR(500),
    bio              VARCHAR(500),
    role             VARCHAR(20)   NOT NULL DEFAULT 'STUDENT',
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Refresh tokens ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(512) NOT NULL UNIQUE,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Reputations ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reputations (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    points     INTEGER     NOT NULL DEFAULT 0,
    level      VARCHAR(30) NOT NULL DEFAULT 'BEGINNER',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reputation_events (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type  VARCHAR(50) NOT NULL,
    delta       INTEGER     NOT NULL,
    reference_id BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Connections ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS connections (
    id           BIGSERIAL PRIMARY KEY,
    requester_id BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(requester_id, addressee_id)
);

-- ── Doubts ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doubts (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(300) NOT NULL,
    content     TEXT         NOT NULL,
    subject     VARCHAR(100),
    tags        VARCHAR(500),
    status      VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    image_url   VARCHAR(500),
    author_id   BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Answers ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS answers (
    id          BIGSERIAL PRIMARY KEY,
    content     TEXT        NOT NULL,
    doubt_id    BIGINT      NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
    author_id   BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accepted    BOOLEAN     NOT NULL DEFAULT FALSE,
    accepted_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Votes ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS votes (
    id         BIGSERIAL PRIMARY KEY,
    answer_id  BIGINT      NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    user_id    BIGINT      NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    type       VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(answer_id, user_id)
);

-- ── Performance Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_doubts_author       ON doubts(author_id);
CREATE INDEX IF NOT EXISTS idx_doubts_status       ON doubts(status);
CREATE INDEX IF NOT EXISTS idx_answers_doubt       ON answers(doubt_id);
CREATE INDEX IF NOT EXISTS idx_votes_answer        ON votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_reputation_user     ON reputations(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_users   ON connections(requester_id, addressee_id);
