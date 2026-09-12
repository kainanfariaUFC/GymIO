import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const deviceIdSchema = z.string().min(8).max(64).regex(/^[a-zA-Z0-9_-]+$/);

export const listCompletions = createServerFn({ method: "POST" })
  .validator(
    z.object({
      deviceId: deviceIdSchema,
      workoutId: z.string().uuid().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let query = supabaseAdmin
      .from("workout_completions")
      .select("day_slug, completed_on, workout_id, status")
      .eq("device_id", data.deviceId)
      .order("completed_on", { ascending: false })
      .limit(120);
    if (data.workoutId) query = query.eq("workout_id", data.workoutId);
    const { data: rows, error } = await query;
    if (error) {
      console.error("[workout-log] list failed", error);
      throw new Error("Não foi possível carregar o histórico.");
    }
    return rows ?? [];
  });

export const logCompletion = createServerFn({ method: "POST" })
  .validator(
    z.object({
      deviceId: deviceIdSchema,
      daySlug: z.string().min(1).max(80),
      workoutId: z.string().uuid(),
      completedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      status: z.enum(["complete", "incomplete"]),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // O plano precisa existir antes de registrar uma conclusão.
    const { data: workout, error: workoutError } = await supabaseAdmin
      .from("treinos")
      .select("id")
      .eq("id", data.workoutId)
      .maybeSingle();
    if (workoutError) {
      console.error("[workout-log] workout lookup failed", workoutError);
      throw new Error("Não foi possível registrar o treino.");
    }
    if (!workout) throw new Error("Treino não encontrado.");

    const { error } = await supabaseAdmin.from("workout_completions").insert({
      device_id: data.deviceId,
      day_slug: data.daySlug,
      workout_id: data.workoutId,
      completed_on: data.completedOn,
      status: data.status,
    });
    if (error && error.code !== "23505") {
      console.error("[workout-log] insert failed", error);
      throw new Error("Não foi possível registrar o treino.");
    }
    const { data: completion, error: completionError } = await supabaseAdmin
      .from("workout_completions")
      .select("day_slug, completed_on, workout_id, status")
      .eq("device_id", data.deviceId)
      .eq("workout_id", data.workoutId)
      .eq("day_slug", data.daySlug)
      .eq("completed_on", data.completedOn)
      .maybeSingle();
    if (completionError || !completion) {
      console.error("[workout-log] completion verification failed", completionError);
      throw new Error("Não foi possível confirmar o registro do treino.");
    }
    return completion;
  });
