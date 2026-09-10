import { useEffect, useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";

import { WorkoutNavigator } from "@/components/workout/WorkoutNavigator";
import { WorkoutPage } from "@/components/workout/WorkoutPage";
import { fetchStudentPlanById, type StudentPlan } from "@/lib/supabase-workouts";

type SearchParams = { id?: string };

export const Route = createFileRoute("/aluno")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: AlunoPage,
});

function AlunoPage() {
  const { id } = useSearch({ from: "/aluno" });
  const [plan, setPlan] = useState<StudentPlan | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchStudentPlanById(id)
      .then((nextPlan) => {
        if (!active) return;
        setPlan(nextPlan);
        setActiveSlug(nextPlan?.workouts[0]?.slug ?? null);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center p-4"><p className="animate-pulse text-sm font-medium text-muted-foreground">Carregando treino...</p></div>;
  }

  if (!plan || plan.workouts.length === 0) {
    return <div className="flex min-h-screen items-center justify-center p-4 text-center"><p className="text-muted-foreground">Nenhum treino encontrado. Verifique o link compartilhado.</p></div>;
  }

  const activeWorkout = plan.workouts.find((workout) => workout.slug === activeSlug) ?? plan.workouts[0];
  return <main className="min-h-screen bg-background"><WorkoutNavigator workouts={plan.workouts} activeSlug={activeWorkout.slug} onSelectWorkout={setActiveSlug} /><WorkoutPage day={activeWorkout} alunoNome={plan.alunoNome} workoutId={plan.id} /></main>;
}