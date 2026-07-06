-- Duckert Design — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- Chat sessions: full transcripts, kept 30 days then deleted (see /api/cron/cleanup).
create table if not exists chat_sessions (
  id uuid primary key,
  status text not null default 'ai' check (status in ('ai', 'inactive', 'closed', 'archived')),
  messages jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  archived_at timestamptz,
  expires_at timestamptz not null default now() + interval '30 days',
  learned boolean not null default false
);

create index if not exists chat_sessions_updated_idx on chat_sessions (updated_at desc);
create index if not exists chat_sessions_expires_idx on chat_sessions (expires_at);
create index if not exists chat_sessions_learned_idx on chat_sessions (learned) where learned = false;

-- Feedback ratings (1–5), same 30-day retention as chats.
create table if not exists chat_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid,
  rating int not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);

create index if not exists chat_feedback_expires_idx on chat_feedback (expires_at);

-- FAQ / AI knowledge base. source = 'manual' (admin-entered) or 'learned'
-- (distilled automatically from chats by /api/cron/learn).
create table if not exists faq_entries (
  id text not null,
  category text not null check (category in ('admin', 'customer')),
  question text not null,
  answer text not null,
  source text not null default 'manual' check (source in ('manual', 'learned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (category, id)
);

-- Lock everything down: RLS on, no policies. Only the server's
-- service_role key can read/write; anon/authenticated clients get nothing.
alter table chat_sessions enable row level security;
alter table chat_feedback enable row level security;
alter table faq_entries enable row level security;
