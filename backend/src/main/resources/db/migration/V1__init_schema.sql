CREATE TABLE search_profiles (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    keywords JSONB NOT NULL DEFAULT '[]',
    exclude_keywords JSONB NOT NULL DEFAULT '[]',
    locations JSONB NOT NULL DEFAULT '[]',
    remote_options JSONB NOT NULL DEFAULT '[]',
    experience_levels JSONB NOT NULL DEFAULT '[]',
    timeframe_days INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    url VARCHAR(1000) NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL,
    description TEXT,
    tags JSONB NOT NULL DEFAULT '[]',
    posted_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE job_inbox_items (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id),
    search_profile_id UUID NOT NULL REFERENCES search_profiles(id),
    status VARCHAR(50) NOT NULL DEFAULT 'UNREAD',
    is_saved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE (job_id, search_profile_id)
);
