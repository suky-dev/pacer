CREATE TABLE source_cvs (
    id          UUID         PRIMARY KEY,
    user_id     UUID         NOT NULL REFERENCES users(id),
    version     INT          NOT NULL DEFAULT 1,
    label       VARCHAR(255),
    data        JSONB        NOT NULL DEFAULT '{"sections":[]}',
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    UNIQUE (user_id, version)
);
