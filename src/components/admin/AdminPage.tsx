import { BarChart3, Edit3, LayoutDashboard, LogIn, LogOut, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import {
  fetchAdminAnalytics,
  fetchAdminProfessors,
  isAdmin,
  removeAdminProfessor,
  saveAdminProfessor,
  type AdminProfessor,
} from "@/lib/admin";

function AdminLogin({ onLogin }: { onLogin: (session: Session) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.session) {
      setError("E-mail ou senha inválidos.");
    } else if (!(await isAdmin(data.session.user.id))) {
      await supabase.auth.signOut();
      setError("Este usuário não tem acesso administrativo.");
    } else {
      onLogin(data.session);
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-card p-7 shadow-soft">
        <ShieldCheck className="text-primary" size={28} />
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Administração</p>
        <h1 className="mt-2 text-3xl font-extrabold text-foreground">Acesso da academia</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use a conta do dono ou administrador da empresa.</p>
        <label className="mt-7 block text-sm font-bold">E-mail<input className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3 font-normal" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="mt-4 block text-sm font-bold">Senha<input className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3 font-normal" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <button disabled={loading} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground disabled:opacity-50"><LogIn size={18} />{loading ? "Entrando..." : "Entrar"}</button>
      </form>
    </main>
  );
}

type Analytics = Awaited<ReturnType<typeof fetchAdminAnalytics>>;
const ADMIN_HINT_KEY = "gymio:admin-user-hint";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Carregando dashboard">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-2xl bg-card p-5 shadow-soft">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-3 h-9 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-72 rounded-2xl bg-card p-5 shadow-soft">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="mt-3 h-4 w-56 rounded bg-muted" />
          <div className="mt-8 h-40 rounded-xl bg-muted/70" />
        </div>
        <div className="h-72 rounded-2xl bg-card p-5 shadow-soft">
          <div className="h-5 w-52 rounded bg-muted" />
          <div className="mt-3 h-4 w-48 rounded bg-muted" />
          <div className="mt-8 space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-4 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
      <div className="h-40 rounded-2xl bg-card p-5 shadow-soft">
        <div className="h-5 w-48 rounded bg-muted" />
        <div className="mt-6 h-12 rounded-xl bg-muted/70" />
      </div>
    </div>
  );
}

function Dashboard({ data }: { data: Analytics }) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
  const monthRows = data.completions.filter((row) => new Date(`${row.completed_on}T00:00:00`) >= monthStart);
  const quarterRows = data.completions.filter((row) => new Date(`${row.completed_on}T00:00:00`) >= quarterStart);
  const activeStudents = new Set(monthRows.map((row) => data.workouts.find((workout) => workout.id === row.workout_id)?.aluno_nome).filter(Boolean));
  const usedStudents = new Set(data.completions.map((row) => data.workouts.find((workout) => workout.id === row.workout_id)?.aluno_nome).filter(Boolean));
  const inactiveStudents = Math.max(0, new Set(data.workouts.map((workout) => workout.aluno_nome)).size - usedStudents.size);
  const byHour = Array.from({ length: 24 }, (_, hour) => ({ hour, count: data.completions.filter((row) => new Date(row.created_at).getHours() === hour).length }));
  const peak = Math.max(1, ...byHour.map((row) => row.count));
  const professorCounts = new Map<string, number>();
  data.workouts.forEach((workout) => professorCounts.set(workout.professor_id, (professorCounts.get(workout.professor_id) ?? 0) + 1));

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[['Alunos cadastrados', new Set(data.workouts.map((workout) => workout.aluno_nome)).size], ['Ativos no mês', activeStudents.size], ['Sem uso', inactiveStudents], ['Treinos no trimestre', quarterRows.length]].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-card p-5 shadow-soft"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-extrabold text-foreground">{value}</p></div>)}
    </div>
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-2xl bg-card p-5 shadow-soft"><div className="flex items-center justify-between"><div><h2 className="font-bold">Atividade mensal</h2><p className="text-sm text-muted-foreground">Conclusões por dia</p></div><span className="text-sm font-bold text-primary">{monthRows.length} registros</span></div><div className="mt-6 flex h-44 items-end gap-1">{Array.from({ length: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() }, (_, index) => { const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`; const value = monthRows.filter((row) => row.completed_on === date).length; return <div key={date} title={`${index + 1}: ${value}`} className="flex-1 rounded-t bg-primary/70" style={{ height: `${Math.max(4, (value / Math.max(1, ...monthRows.map((row) => monthRows.filter((item) => item.completed_on === row.completed_on).length))) * 100)}%` }} />; })}</div></section>
      <section className="rounded-2xl bg-card p-5 shadow-soft"><h2 className="font-bold">Horários de maior movimento</h2><p className="text-sm text-muted-foreground">Baseado nos registros de uso</p><div className="mt-5 space-y-2">{byHour.filter((row) => row.count > 0).sort((a, b) => b.count - a.count).slice(0, 6).map((row) => <div key={row.hour} className="flex items-center gap-3 text-sm"><span className="w-12 font-bold">{String(row.hour).padStart(2, '0')}h</span><div className="h-3 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${(row.count / peak) * 100}%` }} /></div><span className="w-8 text-right font-bold">{row.count}</span></div>)}</div></section>
    </div>
    <section className="rounded-2xl bg-card p-5 shadow-soft"><h2 className="font-bold">Alunos por professor</h2><p className="mt-1 text-sm text-muted-foreground">Quantidade de planos atribuídos</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from(professorCounts.entries()).map(([professorId, count]) => <div key={professorId} className="flex items-center justify-between rounded-xl border border-border px-4 py-3"><span className="truncate text-sm">{data.professors.find((professor) => professor.user_id === professorId)?.name ?? professorId}</span><strong>{count}</strong></div>)}</div></section>
  </div>;
}

function Professors() {
  const [items, setItems] = useState<AdminProfessor[]>([]);
  const [editing, setEditing] = useState<AdminProfessor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchAdminProfessors().then(setItems).catch(() => setError("Não foi possível carregar os professores.")).finally(() => setLoading(false)); }, []);
  async function remove(item: AdminProfessor) { if (!window.confirm(`Desativar ${item.name}?`)) return; await removeAdminProfessor(item.user_id); setItems((current) => current.map((entry) => entry.user_id === item.user_id ? { ...entry, active: false } : entry)); }
  return <section className="rounded-2xl bg-card p-5 shadow-soft"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Equipe</p><h1 className="mt-1 text-3xl font-extrabold">Professores</h1></div><button onClick={() => setEditing({ user_id: "", name: "", email: "", active: true })} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground"><Plus size={18} /> Adicionar</button></div>{editing && <form className="mt-5 grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={async (event) => { event.preventDefault(); try { const saved = await saveAdminProfessor(editing); setItems((current) => [...current.filter((item) => item.user_id !== saved.user_id), saved]); setEditing(null); } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar."); } }}><input className="h-11 rounded-lg border border-input bg-background px-3" placeholder="Nome do professor" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required /><input className="h-11 rounded-lg border border-input bg-background px-3" placeholder="E-mail" type="email" value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} required /><input className="h-11 rounded-lg border border-input bg-background px-3" placeholder={editing.user_id ? "Nova senha (opcional)" : "Senha"} type="password" minLength={6} value={editing.password ?? ""} onChange={(event) => setEditing({ ...editing, password: event.target.value })} required={!editing.user_id} /><button className="h-11 rounded-lg bg-primary px-4 font-bold text-primary-foreground">Salvar</button></form>}{error && <p className="mt-3 text-sm text-destructive">{error}</p>}{loading ? <p className="mt-6 text-sm text-muted-foreground">Carregando...</p> : <div className="mt-5 divide-y divide-border">{items.map((item) => <div key={item.user_id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-bold">{item.name}</p><p className="text-sm text-muted-foreground">{item.email}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.active ? 'bg-sage text-sage-foreground' : 'bg-muted text-muted-foreground'}`}>{item.active ? 'Ativo' : 'Inativo'}</span><button onClick={() => setEditing(item)} aria-label={`Editar ${item.name}`} className="rounded-lg p-2 hover:bg-muted"><Edit3 size={17} /></button><button onClick={() => remove(item)} aria-label={`Remover ${item.name}`} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 size={17} /></button></div></div>)}</div>}</section>;
}

export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<"dashboard" | "professors">("dashboard");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data.session) {
        setAuthLoading(false);
        return;
      }

      const cachedAdminId = window.localStorage.getItem(ADMIN_HINT_KEY);
      if (cachedAdminId === data.session.user.id) {
        setAllowed(true);
        setSession(data.session);
        setAuthLoading(false);

        const stillAdmin = await isAdmin(data.session.user.id);
        if (!active) return;
        if (!stillAdmin) {
          window.localStorage.removeItem(ADMIN_HINT_KEY);
          await supabase.auth.signOut();
          return;
        }
        return;
      }

      const userIsAdmin = await isAdmin(data.session.user.id);
      if (!active) return;
      setAllowed(userIsAdmin);
      setSession(userIsAdmin ? data.session : null);
      if (userIsAdmin) window.localStorage.setItem(ADMIN_HINT_KEY, data.session.user.id);
      setAuthLoading(false);
    }

    restoreSession().catch(() => {
      if (active) {
        setAllowed(false);
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession) {
        window.localStorage.removeItem(ADMIN_HINT_KEY);
        setSession(null);
        setAllowed(false);
        setAuthLoading(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => { if (session) fetchAdminAnalytics().then(setAnalytics).catch(() => setAnalytics({ workouts: [], completions: [], professors: [] })); }, [session]);
  if (authLoading) return <main className="flex min-h-screen items-center justify-center bg-background"><p className="text-sm text-muted-foreground">Restaurando sessão...</p></main>;
  if (allowed === false) return <AdminLogin onLogin={(nextSession) => { window.localStorage.setItem(ADMIN_HINT_KEY, nextSession.user.id); setAllowed(true); setSession(nextSession); }} />;
  if (!session) return <AdminLogin onLogin={(nextSession) => { window.localStorage.setItem(ADMIN_HINT_KEY, nextSession.user.id); setAllowed(true); setSession(nextSession); }} />;
  return <main className="min-h-screen bg-background px-4 py-6 sm:px-6"><div className="mx-auto max-w-7xl"><header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><BarChart3 size={21} /></span><div><p className="font-extrabold">GymIO Admin</p><p className="text-xs text-muted-foreground">{session.user.email}</p></div></div><button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-semibold"><LogOut size={16} /> Sair</button></header><nav className="mb-6 flex gap-2 rounded-2xl bg-muted p-1.5"><button onClick={() => setView("dashboard")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${view === 'dashboard' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}><LayoutDashboard size={17} /> Dashboard</button><button onClick={() => setView("professors")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${view === 'professors' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}><Users size={17} /> Professores</button></nav>{view === "dashboard" ? analytics ? <Dashboard data={analytics} /> : <DashboardSkeleton /> : <Professors />}</div></main>;
}
