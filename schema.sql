create table if not exists public.videos (
  video_id text primary key,
  username text,
  description text,
  published_at timestamptz not null,
  video_url text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
create table if not exists public.video_hashtags (
  video_id text not null references public.videos(video_id) on delete cascade,
  hashtag text not null check (hashtag in ('nzao','nzao10k')),
  primary key(video_id, hashtag)
);
create table if not exists public.metric_snapshots (
  id bigint generated always as identity primary key,
  video_id text not null references public.videos(video_id) on delete cascade,
  views bigint not null default 0,
  likes bigint not null default 0,
  comments bigint not null default 0,
  shares bigint not null default 0,
  collected_at timestamptz not null default now()
);
create index if not exists videos_published_at_idx on public.videos(published_at);
create index if not exists snapshots_video_time_idx on public.metric_snapshots(video_id,collected_at desc);
create index if not exists hashtags_tag_idx on public.video_hashtags(hashtag);
alter table public.videos enable row level security;
alter table public.video_hashtags enable row level security;
alter table public.metric_snapshots enable row level security;
-- O painel lê via rota server-side usando service role; não exponha a service role no navegador.
