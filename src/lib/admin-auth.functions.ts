import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credentials = z.object({ email: z.string().email(), password: z.string().min(1) });
const professor = z.object({ userId: z.string().uuid(), name: z.string().min(2), email: z.string().email(), active: z.boolean(), password: z.string().min(6).optional() });

export const adminLogin = createServerFn({ method: "POST" }).validator(credentials).handler(async ({ data }) => (await import("./admin-auth.server")).login(data));
export const adminRestore = createServerFn({ method: "GET" }).handler(async () => (await import("./admin-auth.server")).restore());
export const adminLogout = createServerFn({ method: "POST" }).handler(async () => (await import("./admin-auth.server")).logout());
export const fetchAdminProfessorsServer = createServerFn({ method: "GET" }).handler(async () => (await import("./admin-auth.server")).fetchProfessors());
export const saveAdminProfessorServer = createServerFn({ method: "POST" }).validator(professor).handler(async ({ data }) => (await import("./admin-auth.server")).saveProfessor(data));
export const removeAdminProfessorServer = createServerFn({ method: "POST" }).validator(z.object({ userId: z.string().uuid() })).handler(async ({ data }) => (await import("./admin-auth.server")).removeProfessor(data.userId));
export const fetchAdminAnalyticsServer = createServerFn({ method: "GET" }).handler(async () => (await import("./admin-auth.server")).fetchAnalytics());
