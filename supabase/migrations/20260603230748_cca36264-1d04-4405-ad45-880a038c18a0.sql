ALTER TABLE public.document_runs ADD COLUMN IF NOT EXISTS display_created_at timestamptz;
ALTER TABLE public.extraction_results ADD COLUMN IF NOT EXISTS display_created_at timestamptz;
UPDATE public.document_runs SET display_created_at = created_at WHERE display_created_at IS NULL;
UPDATE public.extraction_results SET display_created_at = created_at WHERE display_created_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_extraction_results_display_created_at ON public.extraction_results (display_created_at DESC);
ALTER TABLE public.extraction_results REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.extraction_results;