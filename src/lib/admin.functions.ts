import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const createAdminProfessor = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), active: z.boolean().optional() }))
  .handler(async ({ data }) => (await import("./admin-auth.server")).createProfessor({ ...data, active: data.active ?? true }));
