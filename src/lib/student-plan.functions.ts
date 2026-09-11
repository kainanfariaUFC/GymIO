import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Leitura pública de um plano compartilhado, apenas pelo UUID exato. */
export const getSharedPlan = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("treinos")
      .select("id, aluno_nome, dias")
      .eq("id", data.id)
      .maybeSingle();
    if (error) {
      console.error("[student-plan] fetch failed", error);
      throw new Error("Não foi possível carregar o treino.");
    }
    return row ?? null;
  });
