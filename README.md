# Spartans of 235 (Vercel + Supabase)

## Supabase SQL (run in SQL Editor)
```sql
create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  invite_code text,
  player_id text,
  hq_level int,
  buildings jsonb,
  tech jsonb,
  heroes jsonb,
  tanks jsonb,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_applications_created_at on applications(created_at desc);
create index if not exists idx_applications_invite_code on applications(invite_code);
