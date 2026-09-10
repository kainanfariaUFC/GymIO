import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export const EXERCISES_PAGE_SIZE = 100;

export type CatalogExercise = {
  id: string;
  name: string;
  media_url: string | null;
  muscle_group: string;
};

export type WorkoutExerciseDraft = {
  exerciseId: string;
  name: string;
  muscle: string;
  mediaUrl?: string;
  sets: string;
  rest: string;
};

export type WorkoutSectionDraft = {
  slug: "mobilidade" | "forca" | "metabolico";
  label: string;
  headline: string;
  exercises: WorkoutExerciseDraft[];
};

export type WorkoutDayDraft = {
  label: string;
  sections: WorkoutSectionDraft[];
};

export type TeacherWorkout = {
  id: string;
  aluno_nome: string;
  created_at: string;
  dias?: Json;
};

export async function fetchTeacherWorkouts(page: number, pageSize: number) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from("treinos")
    .select("id, aluno_nome, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { workouts: (data ?? []) as TeacherWorkout[], total: count ?? 0 };
}

export async function fetchTeacherWorkoutById(id: string) {
  const { data, error } = await supabase
    .from("treinos")
    .select("id, aluno_nome, dias")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as TeacherWorkout;
}

export async function fetchExerciseCatalog(page: number, search: string) {
  const from = page * EXERCISES_PAGE_SIZE;
  const to = from + EXERCISES_PAGE_SIZE - 1;
  let query = supabase
    .from("exercicios")
    .select("id, nome, media_url", { count: "exact" })
    .order("nome", { ascending: true })
    .range(from, to);

  if (search.trim()) {
    query = query.ilike("nome", `%${search.trim()}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    exercises: (data ?? []).map((exercise) => ({
      id: exercise.id,
      name: exercise.nome,
      media_url: exercise.media_url,
      muscle_group: "Geral",
    })),
    total: count ?? 0,
  };
}

export async function createTeacherWorkout(
  alunoNome: string,
  days: WorkoutDayDraft[],
) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw userError ?? new Error("Sessão do professor não encontrada.");
  }

  const dias = days.map((day, dayIndex) => ({
    slug: `dia-${String.fromCharCode(97 + dayIndex)}`,
    label: day.label,
    headline: `Treino ${day.label}`,
    whyItWorks: [],
    forca: day.sections.find((section) => section.slug === "forca")?.exercises,
    mobilidade: day.sections.find((section) => section.slug === "mobilidade")?.exercises,
    metabolico: day.sections.find((section) => section.slug === "metabolico")?.exercises,
  })) as unknown as Json;

  const { data, error } = await supabase
    .from("treinos")
    .insert({ aluno_nome: alunoNome.trim(), professor_id: userData.user.id, dias })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateTeacherWorkout(
  id: string,
  alunoNome: string,
  days: WorkoutDayDraft[],
) {
  const dias = days.map((day, dayIndex) => ({
    slug: `dia-${String.fromCharCode(97 + dayIndex)}`,
    label: day.label,
    headline: `Treino ${day.label}`,
    whyItWorks: [],
    forca: day.sections.find((section) => section.slug === "forca")?.exercises,
    mobilidade: day.sections.find((section) => section.slug === "mobilidade")?.exercises,
    metabolico: day.sections.find((section) => section.slug === "metabolico")?.exercises,
  })) as unknown as Json;

  const { error } = await supabase
    .from("treinos")
    .update({ aluno_nome: alunoNome.trim(), dias })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteTeacherWorkout(id: string) {
  const { error } = await supabase.from("treinos").delete().eq("id", id);
  if (error) throw error;
}