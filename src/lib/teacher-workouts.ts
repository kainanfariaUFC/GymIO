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

export type TeacherWorkout = {
  id: string;
  aluno_nome: string;
  created_at: string;
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

export async function fetchExerciseCatalog(page: number, search: string) {
  const from = page * EXERCISES_PAGE_SIZE;
  const to = from + EXERCISES_PAGE_SIZE - 1;
  let query = supabase
    .from("exercises")
    .select("id, name, media_url, muscle_group", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { exercises: (data ?? []) as CatalogExercise[], total: count ?? 0 };
}

export async function createTeacherWorkout(
  alunoNome: string,
  sections: WorkoutSectionDraft[],
) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw userError ?? new Error("Sessão do professor não encontrada.");
  }

  const dias = [
    {
      slug: "treino-1",
      label: "Treino",
      headline: "Treino personalizado",
      whyItWorks: [],
      forca: sections.find((section) => section.slug === "forca")?.exercises,
      mobilidade: sections.find((section) => section.slug === "mobilidade")?.exercises,
      metabolico: sections.find((section) => section.slug === "metabolico")?.exercises,
    },
  ] as unknown as Json;

  const { data, error } = await supabase
    .from("treinos")
    .insert({ aluno_nome: alunoNome.trim(), professor_id: userData.user.id, dias })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}