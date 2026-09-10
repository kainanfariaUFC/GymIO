import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { StudentPlan } from "@/lib/supabase-workouts";
import { fetchStudentPlanById } from "@/lib/supabase-workouts";
import { WorkoutPage } from "@/components/workout/WorkoutPage";

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
  const [loading, setLoading] = useState<boolean>(true);

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
        // Define o primeiro dia disponível como ativo por padrão
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
          Nenhum treino encontrado. Verifique o link enviado pelo seu professor.
        </p>
      </div>
    );
  }

  // Identifica o treino selecionado de acordo com o slug ativo na navegação
  const activeWorkout =
    plan.workouts.find((w) => w.slug === activeSlug) || plan.workouts[0];

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* SELETOR/NAVEGADOR DE DIAS (Gerado dinamicamente do JSON) */}
      {plan.workouts.length > 1 && (
        <nav className="sticky top-0 z-10 bg-background/80 px-4 pt-4 backdrop-blur-md">
          <div className="flex gap-2 overflow-x-auto rounded-2xl bg-muted p-1">
            {plan.workouts.map((workout) => {
              const isActive = workout.slug === activeWorkout.slug;
              return (
                <button
                  key={workout.slug}
                  type="button"
                  onClick={() => setActiveSlug(workout.slug)}
                  className={`flex-1 min-w-[80px] rounded-xl py-2.5 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {workout.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* RENDERIZAÇÃO DO TREINO SELECIONADO */}
      <WorkoutPage day={activeWorkout} />
    </div>
  );
}
