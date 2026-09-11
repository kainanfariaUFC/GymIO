import { supabase } from "@/integrations/supabase/client";
import { createAdminProfessor } from "@/lib/admin.functions";

export type AdminProfessor = {
  user_id: string;
  name: string;
  email: string;
  active: boolean;
  password?: string;
};

export type AdminCompletion = {
  workout_id: string | null;
  completed_on: string;
  created_at: string;
  status: string;
};

export async function isAdmin(userId: string) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function fetchAdminProfessors() {
  const { data, error } = await supabase
    .from("professor_profiles")
    .select("user_id, name, email, active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as AdminProfessor[];
}

export async function saveAdminProfessor(professor: Omit<AdminProfessor, "user_id"> & { user_id?: string }) {
  if (professor.user_id) {
    const { data, error } = await supabase
      .from("professor_profiles")
      .update({ name: professor.name.trim(), email: professor.email.trim(), active: professor.active })
      .eq("user_id", professor.user_id)
      .select("user_id, name, email, active")
      .single();
    if (error) throw error;

    if (professor.password?.trim()) {
      await createAdminProfessor({
        data: {
          name: professor.name,
          email: professor.email,
          password: professor.password,
          active: professor.active,
          userId: professor.user_id,
        },
      });
    }

    return data as AdminProfessor;
  }

  return createAdminProfessor({
    data: {
      name: professor.name,
      email: professor.email,
      password: professor.password,
      active: professor.active,
      ...(professor.user_id ? { userId: professor.user_id } : {}),
    },
  });
}

export async function removeAdminProfessor(userId: string) {
  const { error } = await supabase
    .from("professor_profiles")
    .update({ active: false })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function fetchAdminAnalytics() {
  const [{ data: workouts, error: workoutsError }, { data: completions, error: completionsError }] = await Promise.all([
    supabase.from("treinos").select("id, aluno_nome, professor_id"),
    supabase.from("workout_completions").select("workout_id, completed_on, created_at, status"),
  ]);
  if (workoutsError) throw workoutsError;
  if (completionsError) throw completionsError;
  const { data: professors, error: professorsError } = await supabase
    .from("professor_profiles")
    .select("user_id, name, email, active");
  if (professorsError) throw professorsError;
  return {
    workouts: (workouts ?? []) as { id: string; aluno_nome: string; professor_id: string }[],
    completions: (completions ?? []) as AdminCompletion[],
    professors: (professors ?? []) as AdminProfessor[],
  };
}