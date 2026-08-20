-- Create job_applications table for manual and AI automated applications
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_url TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT,
  platform TEXT NOT NULL,
  apply_mode TEXT NOT NULL DEFAULT 'auto'
    CHECK (apply_mode IN ('manual', 'auto')),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN (
      'PENDING',
      'DETECTING_FIELDS',
      'MISSING_INFO',
      'READY_TO_SUBMIT',
      'SUBMITTING',
      'APPLIED',
      'FAILED'
    )),
  detected_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  browserbase_session_id TEXT,
  browserbase_session_url TEXT,
  error_message TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS job_applications_user_id_idx ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS job_applications_job_id_idx ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS job_applications_status_idx ON public.job_applications(user_id, status);
CREATE INDEX IF NOT EXISTS job_applications_created_at_idx ON public.job_applications(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own job applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own job applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job applications"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own job applications"
  ON public.job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS job_applications_updated_at ON public.job_applications;
CREATE TRIGGER job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
