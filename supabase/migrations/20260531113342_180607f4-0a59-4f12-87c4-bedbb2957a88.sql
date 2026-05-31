
-- Tables
CREATE TABLE public.document_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  pdf_name TEXT NOT NULL,
  pdf_storage_path TEXT,
  model_provider TEXT NOT NULL DEFAULT 'groq',
  model_name TEXT NOT NULL,
  api_key_mode TEXT NOT NULL CHECK (api_key_mode IN ('app','own')),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_document_runs_session ON public.document_runs(session_id);

CREATE TABLE public.extraction_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.document_runs(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  pdf_name TEXT NOT NULL,
  user_pdf_key TEXT NOT NULL,
  parameter_1 TEXT, parameter_2 TEXT, parameter_3 TEXT, parameter_4 TEXT,
  parameter_5 TEXT, parameter_6 TEXT, parameter_7 TEXT, parameter_8 TEXT,
  parameter_9 TEXT, parameter_10 TEXT, parameter_11 TEXT, parameter_12 TEXT,
  parameter_13 TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_extraction_results_session ON public.extraction_results(session_id);
CREATE INDEX idx_extraction_results_run ON public.extraction_results(run_id);

-- Grants (public app, no auth)
GRANT SELECT, INSERT, UPDATE ON public.document_runs TO anon, authenticated;
GRANT ALL ON public.document_runs TO service_role;
GRANT SELECT, INSERT ON public.extraction_results TO anon, authenticated;
GRANT ALL ON public.extraction_results TO service_role;

-- RLS
ALTER TABLE public.document_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extraction_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read runs" ON public.document_runs FOR SELECT USING (true);
CREATE POLICY "public insert runs" ON public.document_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "public update runs" ON public.document_runs FOR UPDATE USING (true);

CREATE POLICY "public read results" ON public.extraction_results FOR SELECT USING (true);
CREATE POLICY "public insert results" ON public.extraction_results FOR INSERT WITH CHECK (true);

-- Storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('pdf-uploads', 'pdf-uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public upload pdfs" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'pdf-uploads');
CREATE POLICY "public read pdfs" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'pdf-uploads');
