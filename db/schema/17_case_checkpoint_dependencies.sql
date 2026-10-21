-- Checkpoint Studio: explicit dependency graph.
-- `depends_on` stores checkpoint_id values of prerequisite checkpoints.
-- Runtime gameplay still reads Google Sheets; this column is Studio-only for now.

ALTER TABLE public.case_checkpoints
  ADD COLUMN IF NOT EXISTS depends_on TEXT[] NOT NULL DEFAULT '{}'::text[];

-- Backfill Case #000 from the explicit relationships already encoded in the CMS:
-- follow-up questions depend on their parent checkpoint, convergence depends on
-- two required checkpoints, indictment depends on a required checkpoint plus
-- convergence, and the four epilogues open after the indictment.
-- These are data-specific rows; graph code itself has no character-name constants.
UPDATE public.case_checkpoints
SET depends_on = ARRAY['cp-000-1a']
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1a-followup' AND depends_on = '{}';

UPDATE public.case_checkpoints
SET depends_on = ARRAY['cp-000-1b']
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1b-followup' AND depends_on = '{}';

UPDATE public.case_checkpoints
SET depends_on = ARRAY['cp-000-1c']
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-1c-followup' AND depends_on = '{}';

UPDATE public.case_checkpoints
SET depends_on = ARRAY['cp-000-1a', 'cp-000-1b']
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-convergence' AND depends_on = '{}';

UPDATE public.case_checkpoints
SET depends_on = ARRAY['cp-000-1c-followup']
WHERE case_id = 'case_000' AND checkpoint_id = 'cp-000-2b';

UPDATE public.case_checkpoints
SET depends_on = ARRAY['cp-000-2b']
WHERE case_id = 'case_000'
  AND checkpoint_id IN ('cp-epilogue-ha', 'cp-epilogue-mai-vu', 'cp-epilogue-tung', 'cp-epilogue-closure')
  AND depends_on = '{}';

CREATE INDEX IF NOT EXISTS idx_case_checkpoints_depends_on
  ON public.case_checkpoints USING GIN (depends_on);
