
-- 1. Make pdf-uploads bucket private
UPDATE storage.buckets SET public = false WHERE id = 'pdf-uploads';

-- Ensure only anon uploads are allowed (no public read/list)
DROP POLICY IF EXISTS "Public read pdf-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload pdfs" ON storage.objects;
DROP POLICY IF EXISTS "anon upload pdf-uploads" ON storage.objects;

CREATE POLICY "anon upload pdf-uploads"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'pdf-uploads');

-- 2. Tighten document_runs: drop wide-open update policy
DROP POLICY IF EXISTS "public update runs" ON public.document_runs;

-- Provide a SECURITY DEFINER function so clients can only update
-- a run's status when they supply the matching session_id.
CREATE OR REPLACE FUNCTION public.update_run_status(
  p_run_id uuid,
  p_session_id text,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('pending','uploading','extracting','saving','complete','failed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.document_runs
  SET status = p_status
  WHERE id = p_run_id
    AND session_id = p_session_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_run_status(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_run_status(uuid, text, text) TO anon, authenticated;
