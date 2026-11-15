CREATE TABLE interview_results (
    interview_id    UUID PRIMARY KEY REFERENCES interviews (id) ON DELETE CASCADE,
    score           INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    summary         TEXT    NOT NULL,
    strengths       TEXT[]  NOT NULL,
    weaknesses      TEXT[]  NOT NULL,
    recommendations TEXT[]  NOT NULL,
    criteria        JSONB   NOT NULL
);
