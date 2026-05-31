
ALTER TABLE public.extraction_results
  ADD COLUMN IF NOT EXISTS user_name_key text,
  ADD COLUMN IF NOT EXISTS user_name_display text,
  ADD COLUMN IF NOT EXISTS selected_model text,
  ADD COLUMN IF NOT EXISTS api_key_mode text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'complete',
  ADD COLUMN IF NOT EXISTS pdf_storage_path text,
  ADD COLUMN IF NOT EXISTS age text,
  ADD COLUMN IF NOT EXISTS step_therapy_requirements_documented_in_policy text,
  ADD COLUMN IF NOT EXISTS number_of_steps_through_brands text,
  ADD COLUMN IF NOT EXISTS number_of_steps_through_generic text,
  ADD COLUMN IF NOT EXISTS step_through_phototherapy text,
  ADD COLUMN IF NOT EXISTS tb_test_required text,
  ADD COLUMN IF NOT EXISTS quantity_limits text,
  ADD COLUMN IF NOT EXISTS specialist_types text,
  ADD COLUMN IF NOT EXISTS initial_authorization_duration_in_months text,
  ADD COLUMN IF NOT EXISTS reauthorization_duration_in_months text,
  ADD COLUMN IF NOT EXISTS reauthorization_required text,
  ADD COLUMN IF NOT EXISTS reauthorization_requirements_documented_in_policy text,
  ADD COLUMN IF NOT EXISTS access_score text;

CREATE INDEX IF NOT EXISTS idx_extraction_results_user_name_key
  ON public.extraction_results (user_name_key, created_at DESC);

-- Backfill key/display from existing user_name so older rows are discoverable
UPDATE public.extraction_results
  SET user_name_key = lower(trim(user_name))
  WHERE user_name_key IS NULL AND user_name IS NOT NULL;

UPDATE public.extraction_results
  SET user_name_display = user_name
  WHERE user_name_display IS NULL AND user_name IS NOT NULL;
