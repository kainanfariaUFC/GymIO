CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professor_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 120),
  email text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.professor_profiles (user_id, name, email)
SELECT
  users.id,
  COALESCE(
    NULLIF(btrim(users.raw_user_meta_data ->> 'name'), ''),
    NULLIF(split_part(users.email, '@', 1), ''),
    'Professor'
  ),
  users.email
FROM auth.users AS users
WHERE users.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_users AS admins WHERE admins.user_id = users.id
  )
ON CONFLICT (user_id) DO NOTHING;

GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.professor_profiles TO authenticated;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read their own access"
  ON public.admin_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage professor profiles"
  ON public.professor_profiles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can read all workouts"
  ON public.treinos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can read completion analytics"
  ON public.workout_completions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS treinos_professor_id_idx ON public.treinos (professor_id);
CREATE INDEX IF NOT EXISTS workout_completions_completed_on_idx ON public.workout_completions (completed_on DESC);