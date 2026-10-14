CREATE TABLE interviews (
    id         UUID PRIMARY KEY,
    user_id    UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    position   VARCHAR(255) NOT NULL,
    level      VARCHAR(20)  NOT NULL,
    topics     VARCHAR(255)[] NOT NULL DEFAULT '{}',
    status     VARCHAR(20)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_interviews_user_id ON interviews (user_id);
