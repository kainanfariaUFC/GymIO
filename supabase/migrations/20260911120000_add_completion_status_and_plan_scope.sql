CREATE TABLE IF NOT EXISTS public.workout_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text NOT NULL,
  day_slug text NOT NULL,
  completed_on date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, completed_on)
);

GRANT SELECT, INSERT ON public.workout_completions TO anon, authenticated;
GRANT ALL ON public.workout_completions TO service_role;

ALTER TABLE public.workout_completions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'workout_completions'
      AND policyname = 'Anyone can read workout completions'
  ) THEN
    CREATE POLICY "Anyone can read workout completions"
      ON public.workout_completions FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END
$$;

ALTER TABLE public.workout_completions
  ADD COLUMN IF NOT EXISTS workout_id uuid REFERENCES public.treinos(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'complete'
  CHECK (status IN ('complete', 'incomplete'));

DROP INDEX IF EXISTS public.workout_completions_unique_plan_day;
ALTER TABLE public.workout_completions
  DROP CONSTRAINT IF EXISTS workout_completions_device_id_completed_on_key;

DELETE FROM public.workout_completions older
USING public.workout_completions newer
WHERE older.workout_id IS NOT NULL
  AND older.workout_id = newer.workout_id
  AND older.day_slug = newer.day_slug
  AND older.completed_on = newer.completed_on
  AND older.id > newer.id;

CREATE UNIQUE INDEX workout_completions_unique_plan_day
  ON public.workout_completions (workout_id, day_slug, completed_on)
  WHERE workout_id IS NOT NULL;

DROP POLICY IF EXISTS "Anyone can log a workout completion" ON public.workout_completions;
CREATE POLICY "Anyone can log a workout completion"
ON public.workout_completions FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(device_id) BETWEEN 8 AND 64
  AND workout_id IS NOT NULL
  AND char_length(day_slug) BETWEEN 1 AND 80
  AND status IN ('complete', 'incomplete')
);