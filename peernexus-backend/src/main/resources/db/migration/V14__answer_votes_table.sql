CREATE TABLE IF NOT EXISTS answer_votes (
    id BIGSERIAL PRIMARY KEY,

    answer_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    type VARCHAR(10) NOT NULL,

    CONSTRAINT fk_answer_votes_answer
        FOREIGN KEY (answer_id)
        REFERENCES answers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_answer_votes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_answer_votes_answer_user
        UNIQUE (answer_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_answer_votes_answer
ON answer_votes(answer_id);

CREATE INDEX IF NOT EXISTS idx_answer_votes_user
ON answer_votes(user_id);