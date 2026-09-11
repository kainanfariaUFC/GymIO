DROP POLICY IF EXISTS "Anyone can log a workout completion" ON public.workout_completions;
DROP POLICY IF EXISTS "Anyone can read workout completions" ON public.workout_completions;

REVOKE ALL ON public.workout_completions FROM anon;
REVOKE ALL ON public.workout_completions FROM authenticated;
GRANT ALL ON public.workout_completions TO service_role;

ALTER TABLE public.workout_completions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON FUNCTION public.get_shared_workout(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_shared_workout(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.get_shared_workout(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_workout(uuid) TO service_role;