CREATE TABLE public.workout_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text NOT NULL,
  day_slug text NOT NULL,
  completed_on date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, completed_on)
);

CREATE INDEX workout_completions_device_idx ON public.workout_completions (device_id, completed_on DESC);

GRANT SELECT, INSERT ON public.workout_completions TO anon;
GRANT SELECT, INSERT ON public.workout_completions TO authenticated;
GRANT ALL ON public.workout_completions TO service_role;

ALTER TABLE public.workout_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read workout completions"
  ON public.workout_completions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can log a workout completion"
  ON public.workout_completions FOR INSERT
  TO anon, authenticated
  WITH CHECK (char_length(device_id) BETWEEN 8 AND 64 AND day_slug IN ('dia-a','dia-b'));