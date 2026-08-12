-- Jobs table for AI-powered job discovery
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  company_logo TEXT,
  location TEXT,
  salary TEXT,
  job_type TEXT CHECK (job_type IN (
    'full-time', 'part-time', 'internship', 'contract', 'unknown'
  )),
  work_mode TEXT CHECK (work_mode IN (
    'remote', 'hybrid', 'on-campus', 'onsite', 'unknown'
  )),
  experience_level TEXT,
  description TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  match_score INTEGER NOT NULL DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  job_url TEXT NOT NULL,
  source_url TEXT,
  applied_status BOOLEAN NOT NULL DEFAULT false,
  saved_status BOOLEAN NOT NULL DEFAULT false,
  search_key TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, job_url)
);

CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS jobs_user_search_key_idx ON public.jobs(user_id, search_key);
CREATE INDEX IF NOT EXISTS jobs_user_fetched_at_idx ON public.jobs(user_id, fetched_at DESC);
CREATE INDEX IF NOT EXISTS jobs_user_saved_idx ON public.jobs(user_id, saved_status)
  WHERE saved_status = true;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS jobs_updated_at ON public.jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
