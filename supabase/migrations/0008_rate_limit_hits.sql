-- Backs a database-backed rate limit for form submissions — the in-memory
-- limiter resets on cold start and isn't shared across concurrent
-- serverless instances, which matters because it's the only real spam guard
-- once reCAPTCHA is off (the default). `key` never stores a raw IP.
create table if not exists rate_limit_hits (
	id uuid primary key default gen_random_uuid(),
	key text not null,
	created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_key_created_at_idx on rate_limit_hits (key, created_at);

alter table rate_limit_hits enable row level security;
