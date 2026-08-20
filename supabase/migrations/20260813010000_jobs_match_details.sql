-- Store structured resume-match metadata on cached job results
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS match_details JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS jobs_match_score_idx
  ON public.jobs(user_id, match_score DESC);
