CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  media_url text,
  muscle_group text NOT NULL DEFAULT 'Geral',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exercises_name_unique UNIQUE (name)
);
GRANT SELECT ON public.exercises TO anon, authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercise catalog is publicly readable"
ON public.exercises FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.treinos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL,
  aluno_nome text NOT NULL CHECK (char_length(btrim(aluno_nome)) BETWEEN 2 AND 120),
  dias jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(dias) = 'array' AND jsonb_array_length(dias) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.treinos TO authenticated;
GRANT ALL ON public.treinos TO service_role;
ALTER TABLE public.treinos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can read their workouts"
ON public.treinos FOR SELECT TO authenticated USING (auth.uid() = professor_id);
CREATE POLICY "Teachers can create their workouts"
ON public.treinos FOR INSERT TO authenticated WITH CHECK (auth.uid() = professor_id);
CREATE POLICY "Teachers can update their workouts"
ON public.treinos FOR UPDATE TO authenticated USING (auth.uid() = professor_id) WITH CHECK (auth.uid() = professor_id);
CREATE POLICY "Teachers can delete their workouts"
ON public.treinos FOR DELETE TO authenticated USING (auth.uid() = professor_id);

CREATE OR REPLACE FUNCTION public.get_shared_workout(_workout_id uuid)
RETURNS TABLE (id uuid, aluno_nome text, dias jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.aluno_nome, t.dias
  FROM public.treinos t
  WHERE t.id = _workout_id
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.get_shared_workout(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_workout(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER set_treinos_updated_at
BEFORE UPDATE ON public.treinos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.workout_completions
  ADD COLUMN workout_id uuid REFERENCES public.treinos(id) ON DELETE CASCADE;
DROP INDEX IF EXISTS workout_completions_device_day_idx;
ALTER TABLE public.workout_completions
  DROP CONSTRAINT workout_completions_device_id_completed_on_key;
CREATE UNIQUE INDEX workout_completions_unique_plan_day
  ON public.workout_completions (device_id, workout_id, day_slug, completed_on)
  WHERE workout_id IS NOT NULL;
CREATE INDEX workout_completions_device_plan_date_idx
  ON public.workout_completions (device_id, workout_id, completed_on DESC);
DROP POLICY IF EXISTS "Anyone can log a workout completion" ON public.workout_completions;
CREATE POLICY "Anyone can log a workout completion"
ON public.workout_completions FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(device_id) BETWEEN 8 AND 64
  AND workout_id IS NOT NULL
  AND char_length(day_slug) BETWEEN 1 AND 80
);
