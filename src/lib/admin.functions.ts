import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createAdminProfessor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().optional(),
      userId: z.string().uuid().optional(),
      active: z.boolean().optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: admin } = await supabaseAdmin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!admin) throw new Error("Acesso administrativo negado.");

    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    if (name.length < 2 || !email || (!data.userId && (!data.password || data.password.length < 6))) {
      throw new Error("Informe nome, e-mail e uma senha com pelo menos 6 caracteres.");
    }

    let userId = data.userId;
    if (!userId) {
      if (!data.password) throw new Error("Informe uma senha para o novo professor.");
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
        user_metadata: { name },
      });
      if (error || !created.user) throw error ?? new Error("Não foi possível criar o professor.");
      userId = created.user.id;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("professor_profiles")
      .upsert({ user_id: userId, name, email, active: data.active ?? true })
      .select("user_id, name, email, active")
      .single();
    if (profileError) throw profileError;
    return profile;
  });