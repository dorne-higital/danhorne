-- Posts had no draft-preview mechanism, unlike pages — a draft post could
-- only be seen by a logged-in admin, so it couldn't be shared with a client
-- for review the way an unpublished page can via ?preview=<token>.
alter table posts add column if not exists preview_token uuid not null default gen_random_uuid();
