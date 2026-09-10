import { useState, useEffect } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";

import { fetchStudentPlanById, type StudentPlan } from "@/lib/supabase-workouts";
import { WorkoutPage } from "@/components/workout/WorkoutPage";
import { WorkoutNavigator } from "@/components/workout/WorkoutNavigator";

type SearchParams = {
  id?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: IndexPage,
});

function IndexPage() {
  const search = useSearch({ from: "/" });
  const [plan, setPlan] = useState<StudentPlan | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      if (!search.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const fetchedPlan = await fetchStudentPlanById(search.id);

      if (fetchedPlan && fetchedPlan.workouts.length > 0) {
        setPlan(fetchedPlan);
        setActiveSlug(fetchedPlan.workouts[0].slug);
      }
      setLoading(false);
    }

    loadPlan();
  }, [search.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          Carregando treino...
        </p>
      </div>
    );
  }

  if (!plan || plan.workouts.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <p className="text-muted-foreground">
          Nenhum treino encontrado. Acesse o link enviado pelo seu personal.
        </p>
      </div>
    );
  }

  const activeWorkout =
    plan.workouts.find((w) => w.slug === activeSlug) || plan.workouts[0];

  return (
    <main className="min-h-screen bg-background">
      {/* Navegador baseado unicamente nos dias do JSON */}
      <WorkoutNavigator
        workouts={plan.workouts}
        activeSlug={activeWorkout.slug}
        onSelectWorkout={(slug) => setActiveSlug(slug)}
      />

      {/* Renderiza o conteúdo do dia selecionado */}
      <WorkoutPage day={activeWorkout} />
    </main>
  );
}
