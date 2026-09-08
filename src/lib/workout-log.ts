import { supabase } from "@/integrations/supabase/client";

const DEVICE_KEY = "treino:device-id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID().replace(/-/g, "");
    window.localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

/** Data local (São Paulo) em formato YYYY-MM-DD */
export function todayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

export type Completion = { day_slug: string; completed_on: string };

export async function fetchCompletions(): Promise<Completion[]> {
  const deviceId = getDeviceId();
  if (!deviceId) return [];
  const { data, error } = await supabase
    .from("workout_completions")
    .select("day_slug, completed_on")
    .eq("device_id", deviceId)
    .order("completed_on", { ascending: false })
    .limit(120);
  if (error) throw error;
  return data ?? [];
}

export async function finishWorkout(daySlug: string): Promise<Completion> {
  const deviceId = getDeviceId();
  const row = { device_id: deviceId, day_slug: daySlug, completed_on: todayKey() };
  const { error } = await supabase.from("workout_completions").insert(row);
  if (error && error.code !== "23505") throw error;
  return { day_slug: daySlug, completed_on: row.completed_on };
}
