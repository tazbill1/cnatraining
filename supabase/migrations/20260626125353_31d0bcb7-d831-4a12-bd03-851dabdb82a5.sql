
ALTER TABLE public.bug_reports
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS error_type TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS error_stack TEXT,
  ADD COLUMN IF NOT EXISTS error_context JSONB;

-- Allow manual description to be empty for auto-captured errors
ALTER TABLE public.bug_reports ALTER COLUMN description DROP NOT NULL;

CREATE INDEX IF NOT EXISTS bug_reports_source_idx ON public.bug_reports(source);
CREATE INDEX IF NOT EXISTS bug_reports_created_idx ON public.bug_reports(created_at DESC);
