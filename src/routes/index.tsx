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
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const id = search["id"];
    return typeof id === "string" ? { id } : {};
  },
  component: IndexPage,
});

function IndexPage() {
  const search = useSearch({ from: "/" });
  const [planId, setPlanId] = useState(search.id);
  const [plan, setPlan] = useState<StudentPlan | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(search.id));

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (search.id) {
      setPlanId(search.id);
      window.localStorage.setItem(LAST_PLAN_ID_KEY, search.id);
      return;
    }

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const savedPlanId = isStandalone ? window.localStorage.getItem(LAST_PLAN_ID_KEY) : null;
    setPlanId(savedPlanId ?? undefined);
    setPlan(null);
    setActiveSlug(null);
    setLoading(Boolean(savedPlanId));
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
        setActiveSlug(fetchedPlan.workouts[0]?.slug ?? null);
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
      <main className="min-h-screen bg-background px-5 py-8 sm:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between gap-12">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground font-extrabold">G</span>
              <span className="text-lg font-extrabold tracking-tight text-foreground">GymIO</span>
            </div>
            <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-sage-foreground">Treino inteligente</span>
          </header>
          <section className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Sua rotina, em movimento</p>
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">Bem-vindo à GymIO.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">Uma plataforma simples para academias, professores e alunos organizarem treinos personalizados, acompanharem a evolução e manterem a constância.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/admin" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 font-bold text-primary-foreground shadow-soft">Empresas</a>
              <a href="/professor" className="inline-flex h-12 items-center justify-center rounded-xl border border-input bg-card px-5 font-bold text-foreground shadow-soft">Professores</a>
            </div>
          </section>
          <footer className="grid gap-3 border-t border-border pt-5 text-sm text-muted-foreground sm:grid-cols-3">
            <span>Planos personalizados</span>
            <span>Acompanhamento claro</span>
            <span>Mais consistência no treino</span>
          </footer>
        </div>
      </main>
    );
  }

  const activeWorkout =
    plan.workouts.find((w) => w.slug === activeSlug) || plan.workouts[0];

  if (!activeWorkout) return null;

  return (
    <main className="min-h-screen bg-background">
      {/* Navegador baseado unicamente nos dias do JSON */}
      <WorkoutNavigator
        workouts={plan.workouts}
        activeSlug={activeWorkout.slug}
        onSelectWorkout={(slug) => setActiveSlug(slug)}
      />

      {/* Renderiza o conteúdo do dia selecionado */}
      <WorkoutPage day={activeWorkout} alunoNome={plan.alunoNome} workoutId={plan.id} />
    </main>
  );
}
