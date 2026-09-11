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

CREATE POLICY "Professors can read their own profile"
  ON public.professor_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
