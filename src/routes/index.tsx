import { useState, useEffect } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";

import { fetchStudentPlanById, type StudentPlan } from "@/lib/supabase-workouts";
import { WorkoutPage } from "@/components/workout/WorkoutPage";
import { WorkoutNavigator } from "@/components/workout/WorkoutNavigator";

type SearchParams = {
  id?: string;
};

const LAST_PLAN_ID_KEY = "gymio:last-plan-id";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  component: IndexPage,
});

function IndexPage() {
  const search = useSearch({ from: "/" });
  const [planId, setPlanId] = useState(search.id);
  const [plan, setPlan] = useState<StudentPlan | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (search.id) {
      localStorage.setItem(LAST_PLAN_ID_KEY, search.id);
      setPlanId(search.id);
      return;
    }

    const savedPlanId = localStorage.getItem(LAST_PLAN_ID_KEY);
    if (savedPlanId) {
      setPlanId(savedPlanId);
      window.history.replaceState(null, "", `/?id=${encodeURIComponent(savedPlanId)}`);
    }
  }, [search.id]);

  useEffect(() => {
    async function loadPlan() {
      if (!planId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const fetchedPlan = await fetchStudentPlanById(planId);

      if (fetchedPlan && fetchedPlan.workouts.length > 0) {
        setPlan(fetchedPlan);
        setActiveSlug(fetchedPlan.workouts[0].slug);
      }
      setLoading(false);
    }

    loadPlan();
  }, [planId]);

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
