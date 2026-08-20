-- Publication and discovery timestamps for cross-platform job feed
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at_text TEXT,
  ADD COLUMN IF NOT EXISTS discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS jobs_user_published_at_idx
  ON public.jobs(user_id, published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS jobs_user_discovered_at_idx
  ON public.jobs(user_id, discovered_at DESC);
