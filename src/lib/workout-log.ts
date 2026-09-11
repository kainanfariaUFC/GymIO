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

export type Completion = {
  day_slug: string;
  completed_on: string;
  workout_id?: string | null;
  status: "complete" | "incomplete";
};

export async function fetchCompletions(workoutId?: string): Promise<Completion[]> {
  const deviceId = getDeviceId();
  if (!deviceId) return [];
  let query = supabase
    .from("workout_completions")
    .select("day_slug, completed_on, workout_id, status")
    .order("completed_on", { ascending: false })
    .limit(120);
  if (workoutId) query = query.eq("workout_id", workoutId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    status: row.status === "incomplete" ? "incomplete" : "complete",
  }));
}

export async function finishWorkout(
  daySlug: string,
  workoutId: string,
  status: Completion["status"],
): Promise<Completion> {
  const deviceId = getDeviceId();
  const row = {
    device_id: deviceId,
    day_slug: daySlug,
    workout_id: workoutId,
    completed_on: todayKey(),
    status,
  };
  const { error } = await supabase.from("workout_completions").insert(row);
  if (error && error.code !== "23505") throw error;
  return { ...row };
}
