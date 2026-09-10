import {
  Check,
  Clipboard,
  LogOut,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import {
  createTeacherWorkout,
  EXERCISES_PAGE_SIZE,
  fetchExerciseCatalog,
  fetchTeacherWorkouts,
  type CatalogExercise,
  type TeacherWorkout,
  type WorkoutExerciseDraft,
  type WorkoutSectionDraft,
} from "@/lib/teacher-workouts";

type SectionKey = "forca" | "mobilidade" | "metabolico";
type SectionState = Record<SectionKey, { enabled: boolean; exercises: WorkoutExerciseDraft[] }>;

const sectionInfo: Record<SectionKey, { label: string; headline: string }> = {
  forca: { label: "Força", headline: "Treino de Força" },
  mobilidade: { label: "Mobilidade", headline: "Aquecimento e Mobilidade" },
  metabolico: { label: "Metabólico", headline: "Bloco Metabólico" },
};

const emptySections = (): SectionState => ({
  forca: { enabled: true, exercises: [] },
  mobilidade: { enabled: false, exercises: [] },
  metabolico: { enabled: false, exercises: [] },
});

function AuthPanel({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError || !data.session) {
      setError(signInError?.message ?? "Não foi possível entrar.");
      return;
    }
    onAuthenticated(data.session);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-card p-6 shadow-soft sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Área do Professor</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Acesse seus treinos</h1>
          <p className="mt-2 text-sm text-muted-foreground">Entre para criar e compartilhar planos com seus alunos.</p>
        </div>
        <label className="block text-sm font-semibold text-foreground">
          E-mail
          <input className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="mt-4 block text-sm font-semibold text-foreground">
          Senha
          <input className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
        </label>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={loading} className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 font-bold text-primary-foreground disabled:opacity-50">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}

function WorkoutList({ onCreate }: { onCreate: () => void }) {
  const [workouts, setWorkouts] = useState<TeacherWorkout[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTeacherWorkouts(page, pageSize)
      .then((result) => {
        if (!active) return;
        setWorkouts(result.workouts);
        setTotal(result.total);
      })
      .catch(() => active && setError("Não foi possível carregar seus treinos."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, pageSize]);

  async function copyLink(id: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/?id=${id}`);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Seus planos</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">Treinos salvos</h1>
        </div>
        <button type="button" onClick={onCreate} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"><Plus size={18} /> Novo treino</button>
      </div>
      <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
        {loading ? <p className="p-6 text-sm text-muted-foreground">Carregando treinos...</p> : workouts.length === 0 ? <p className="p-6 text-sm text-muted-foreground">Nenhum treino criado ainda.</p> : (
          <div className="divide-y divide-border">
            {workouts.map((workout) => (
              <div key={workout.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                <div><p className="font-bold text-foreground">{workout.aluno_nome}</p><p className="mt-1 text-xs text-muted-foreground">Criado em {new Date(workout.created_at).toLocaleDateString("pt-BR")}</p></div>
                <button type="button" onClick={() => copyLink(workout.id)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-input px-3 text-sm font-semibold text-foreground hover:bg-muted"><Clipboard size={16} />{copiedId === workout.id ? "Link copiado" : "Copiar link"}</button>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <label className="flex items-center gap-2">Itens por página<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} className="h-9 rounded-lg border border-input bg-background px-2 text-foreground"><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></label>
        <div className="flex items-center gap-2"><button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-input px-3 py-2 disabled:opacity-40">Anterior</button><span>Página {page + 1} de {pages}</span><button type="button" disabled={page + 1 >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-input px-3 py-2 disabled:opacity-40">Próxima</button></div>
      </div>
    </section>
  );
}

function WorkoutForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [alunoNome, setAlunoNome] = useState("");
  const [sections, setSections] = useState<SectionState>(emptySections);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [catalog, setCatalog] = useState<CatalogExercise[]>([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogPage, setCatalogPage] = useState(0);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCatalogPage(0);
  }, [deferredSearch]);

  useEffect(() => {
    let active = true;
    setLoadingCatalog(true);
    fetchExerciseCatalog(catalogPage, deferredSearch)
      .then((result) => { if (active) { setCatalog(result.exercises); setCatalogTotal(result.total); } })
      .catch(() => active && setError("Não foi possível carregar o catálogo."))
      .finally(() => active && setLoadingCatalog(false));
    return () => { active = false; };
  }, [catalogPage, deferredSearch]);

  function addExercise(exercise: CatalogExercise, section: SectionKey) {
    setSections((current) => {
      if (current[section].exercises.some((item) => item.exerciseId === exercise.id)) return current;
      return { ...current, [section]: { ...current[section], enabled: true, exercises: [...current[section].exercises, { exerciseId: exercise.id, name: exercise.name, muscle: exercise.muscle_group, mediaUrl: exercise.media_url ?? undefined, sets: "3 x 10", rest: "60s" }] } };
    });
  }

  function updateExercise(section: SectionKey, exerciseId: string, field: "sets" | "rest", value: string) {
    setSections((current) => ({ ...current, [section]: { ...current[section], exercises: current[section].exercises.map((item) => item.exerciseId === exerciseId ? { ...item, [field]: value } : item) } }));
  }

  function removeExercise(section: SectionKey, exerciseId: string) {
    setSections((current) => ({ ...current, [section]: { ...current[section], exercises: current[section].exercises.filter((item) => item.exerciseId !== exerciseId) } }));
  }

  async function saveWorkout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activeSections = (Object.keys(sectionInfo) as SectionKey[]).filter((key) => sections[key].enabled);
    if (!alunoNome.trim() || sections.forca.exercises.length === 0) { setError("Informe o nome do aluno e adicione pelo menos um exercício de força."); return; }
    setSaving(true); setError(null);
    try {
      const payload: WorkoutSectionDraft[] = activeSections.map((key) => ({ slug: key, label: sectionInfo[key].label, headline: sectionInfo[key].headline, exercises: sections[key].exercises }));
      await createTeacherWorkout(alunoNome, payload);
      onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o treino.");
    } finally { setSaving(false); }
  }

  const catalogPages = Math.max(1, Math.ceil(catalogTotal / EXERCISES_PAGE_SIZE));

  return (
    <form onSubmit={saveWorkout}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Novo plano</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">Montar treino</h1></div><button type="button" onClick={onCancel} className="rounded-xl border border-input px-4 py-2 text-sm font-bold">Cancelar</button></div>
      <label className="block rounded-2xl bg-card p-5 shadow-soft text-sm font-bold">Nome do aluno<input value={alunoNome} onChange={(event) => setAlunoNome(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring" required /></label>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {(Object.keys(sectionInfo) as SectionKey[]).map((key) => (
            <section key={key} className="rounded-2xl bg-card p-4 shadow-soft"><div className="flex items-center justify-between gap-3"><h2 className="font-bold text-foreground">{sectionInfo[key].label}{key === "forca" && <span className="ml-2 text-xs font-semibold text-destructive">obrigatório</span>}</h2>{key !== "forca" && <input type="checkbox" checked={sections[key].enabled} onChange={(event) => setSections((current) => ({ ...current, [key]: { ...current[key], enabled: event.target.checked } }))} className="h-5 w-5 accent-primary" />}</div>{sections[key].enabled && <div className="mt-4 space-y-3">{sections[key].exercises.length === 0 ? <p className="text-sm text-muted-foreground">Adicione exercícios pelo catálogo.</p> : sections[key].exercises.map((exercise) => <div key={exercise.exerciseId} className="rounded-xl border border-border p-3"><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-foreground">{exercise.name}</p><button type="button" onClick={() => removeExercise(key, exercise.exerciseId)} aria-label={`Remover ${exercise.name}`} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></button></div><div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs font-semibold text-muted-foreground">Repetições<input value={exercise.sets} onChange={(event) => updateExercise(key, exercise.exerciseId, "sets", event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Descanso<input value={exercise.rest} onChange={(event) => updateExercise(key, exercise.exerciseId, "rest", event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground" /></label></div></div>)}</div>}</section>
          ))}
        </div>
        <section className="rounded-2xl bg-card p-4 shadow-soft"><div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-foreground">Catálogo de exercícios</h2><p className="mt-1 text-xs text-muted-foreground">Carregando até 100 por página</p></div></div><div className="relative mt-4"><Search size={17} className="absolute left-3 top-3 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar exercício" className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></div><div className="mt-4 max-h-[620px] space-y-2 overflow-y-auto">{loadingCatalog ? <p className="text-sm text-muted-foreground">Carregando catálogo...</p> : catalog.map((exercise) => <div key={exercise.id} className="rounded-xl border border-border p-3"><p className="text-sm font-semibold text-foreground">{exercise.name}</p><p className="mt-1 text-xs text-muted-foreground">{exercise.muscle_group}</p><div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => addExercise(exercise, "forca")} className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground">+ Força</button><button type="button" onClick={() => addExercise(exercise, "mobilidade")} className="rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-bold text-secondary-foreground">+ Mobilidade</button><button type="button" onClick={() => addExercise(exercise, "metabolico")} className="rounded-lg bg-accent px-2.5 py-1.5 text-xs font-bold text-accent-foreground">+ Metabólico</button></div></div>)}</div><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><button type="button" disabled={catalogPage === 0} onClick={() => setCatalogPage((page) => page - 1)} className="rounded-lg border border-input px-2 py-1.5 disabled:opacity-40">Anterior</button><span>{catalogPage + 1}/{catalogPages}</span><button type="button" disabled={catalogPage + 1 >= catalogPages} onClick={() => setCatalogPage((page) => page + 1)} className="rounded-lg border border-input px-2 py-1.5 disabled:opacity-40">Próxima</button></div></section>
      </div>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={saving} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground disabled:opacity-50"><Check size={18} />{saving ? "Salvando..." : "Salvar treino"}</button>
    </form>
  );
}

export function ProfessorPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<"list" | "form">("list");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!session) return <AuthPanel onAuthenticated={setSession} />;

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl"><header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><UserRound size={20} /></span><div><p className="text-sm font-bold text-foreground">Área do Professor</p><p className="text-xs text-muted-foreground">{session.user.email}</p></div></div><button type="button" onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-semibold"><LogOut size={16} /> Sair</button></header>{view === "list" ? <WorkoutList onCreate={() => setView("form")} /> : <WorkoutForm onCancel={() => setView("list")} onSaved={() => setView("list")} />}</div>
    </main>
  );
}