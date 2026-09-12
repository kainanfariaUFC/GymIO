import { listCompletions, logCompletion } from "@/lib/workout-log.functions";

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
  const rows = await listCompletions({
    data: { deviceId, ...(workoutId ? { workoutId } : {}) },
  });
  return (rows ?? []).map((row) => ({
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
  const completedOn = todayKey();
  await logCompletion({
    data: { deviceId, daySlug, workoutId, completedOn, status },
  });
  const rows = await fetchCompletions(workoutId);
  const completion = rows.find(
    (row) => row.day_slug === daySlug && row.completed_on === completedOn,
  );
  if (!completion) throw new Error("Não foi possível confirmar o registro do treino.");
  return completion;
}
