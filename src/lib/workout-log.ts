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
  const rows = (await listCompletions({
    data: { deviceId, ...(workoutId ? { workoutId } : {}) },
  })) as unknown as Array<Completion>;
  return (rows ?? []).map((row) => {
    return {
      day_slug: row.day_slug,
      completed_on: row.completed_on,
      workout_id: row.workout_id,
      status: row.status === "incomplete" ? "incomplete" : "complete",
    };
  });
}

export async function finishWorkout(
  daySlug: string,
  workoutId: string,
  status: Completion["status"],
): Promise<Completion> {
  const deviceId = getDeviceId();
  const completedOn = todayKey();
  const completion = (await logCompletion({
    data: { deviceId, daySlug, workoutId, completedOn, status },
  })) as Completion;
  return completion;
}
