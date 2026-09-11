import { createClient } from "@supabase/supabase-js";
import { clearSession, getRequestProtocol, getSession, updateSession, useSession } from "@tanstack/react-start/server";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

function getSessionConfig() {
  let protocol = "https";
  try {
    protocol = getRequestProtocol({ xForwardedProto: true });
  } catch {
    protocol = process.env["NODE_ENV"] === "production" ? "https" : "http";
  }
  const secure = protocol.startsWith("https");

  return {
    password: process.env["SESSION_SECRET"] ?? "",
    name: "gymio-admin-session",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure, sameSite: secure ? ("none" as const) : ("lax" as const), path: "/" },
  };
}

export async function requireAdmin() {
  const sessionConfig = getSessionConfig();
  if (!sessionConfig.password) throw new Error("SESSION_SECRET não configurada no servidor.");
  const session = await useSession<{ userId: string; email: string }>(sessionConfig);
  if (!session.data.userId) throw new Error("Sessão administrativa não encontrada.");
  const { data: admin, error } = await supabaseAdmin.from("admin_users").select("user_id").eq("user_id", session.data.userId).maybeSingle();
  if (error || !admin) throw new Error("Acesso administrativo negado.");
}

export async function createProfessor(data: { name: string; email: string; password: string; active: boolean | undefined }) {
  await requireAdmin();
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({ email, password: data.password, email_confirm: true, user_metadata: { name } });
  if (error || !created.user) throw error ?? new Error("Não foi possível criar o professor.");
  const { data: profile, error: profileError } = await supabaseAdmin.from("professor_profiles").upsert({ user_id: created.user.id, name, email, active: data.active ?? true }).select("user_id, name, email, active").single();
  if (profileError) throw profileError;
  return profile;
}

export async function login(data: { email: string; password: string }) {
  const sessionConfig = getSessionConfig();
  if (!sessionConfig.password) throw new Error("SESSION_SECRET não configurada no servidor.");
  const url = process.env["SUPABASE_URL"];
  const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !publishableKey) throw new Error("Configuração do Supabase ausente no servidor.");
  const authClient = createClient<Database>(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false, storage: undefined } });
  const { data: authData, error } = await authClient.auth.signInWithPassword(data);
  if (error || !authData.user) throw new Error("E-mail ou senha inválidos.");
  if (!authData.session) throw new Error("Sessão do Supabase não foi criada.");
  const sessionClient = createClient<Database>(url, publishableKey, {
    global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  const { data: admin, error: adminError } = await sessionClient.from("admin_users").select("user_id").eq("user_id", authData.user.id).maybeSingle();
  if (adminError || !admin) throw new Error("Este usuário não tem acesso administrativo.");
  const result = { userId: authData.user.id, email: authData.user.email ?? data.email };
  await updateSession(sessionConfig, result);
  return result;
}

export async function restore() {
  const sessionConfig = getSessionConfig();
  if (!sessionConfig.password) throw new Error("SESSION_SECRET não configurada no servidor.");
  const session = await getSession<{ userId: string; email: string }>(sessionConfig);
  if (!session.data.userId || !session.data.email) return null;
  const { data: admin } = await supabaseAdmin.from("admin_users").select("user_id").eq("user_id", session.data.userId).maybeSingle();
  if (!admin) { await clearSession(sessionConfig); return null; }
  return { userId: session.data.userId, email: session.data.email };
}

export async function logout() {
  const sessionConfig = getSessionConfig();
  if (sessionConfig.password) await clearSession(sessionConfig);
  return { success: true };
}

export async function fetchProfessors() {
  await requireAdmin();
  const { data, error } = await supabaseAdmin.from("professor_profiles").select("user_id, name, email, active").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function saveProfessor(data: { userId: string; name: string; email: string; active: boolean; password?: string | undefined }) {
  await requireAdmin();
  if (data.password) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) throw error;
  }
  const { data: profile, error } = await supabaseAdmin.from("professor_profiles").update({ name: data.name.trim(), email: data.email.trim(), active: data.active }).eq("user_id", data.userId).select("user_id, name, email, active").single();
  if (error) throw error;
  return profile;
}

export async function removeProfessor(userId: string) {
  await requireAdmin();
  const { error } = await supabaseAdmin.from("professor_profiles").update({ active: false }).eq("user_id", userId);
  if (error) throw error;
  return { success: true };
}

export async function fetchAnalytics() {
  await requireAdmin();
  const [{ data: workouts, error: workoutsError }, { data: completions, error: completionsError }, { data: professors, error: professorsError }] = await Promise.all([
    supabaseAdmin.from("treinos").select("id, aluno_nome, professor_id"),
    supabaseAdmin.from("workout_completions").select("workout_id, completed_on, created_at, status"),
    supabaseAdmin.from("professor_profiles").select("user_id, name, email, active"),
  ]);
  if (workoutsError) throw workoutsError;
  if (completionsError) throw completionsError;
  if (professorsError) throw professorsError;
  return { workouts: workouts ?? [], completions: completions ?? [], professors: professors ?? [] };
}
