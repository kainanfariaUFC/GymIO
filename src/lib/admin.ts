import {
  adminLogin,
  adminLogout,
  adminRestore,
  fetchAdminAnalyticsServer,
  fetchAdminProfessorsServer as fetchProfessors,
  removeAdminProfessorServer,
  saveAdminProfessorServer,
} from "@/lib/admin-auth.functions";
import { createAdminProfessor } from "@/lib/admin.functions";

export type AdminProfessor = {
  user_id: string;
  name: string;
  email: string;
  active: boolean;
  password?: string;
};

export type AdminCompletion = {
  workout_id: string | null;
  completed_on: string;
  created_at: string;
  status: string;
};

export async function isAdmin(userId: string) {
  const session = await adminRestore();
  return session?.userId === userId;
}

export async function fetchAdminProfessors() {
  return (await fetchProfessors()) as AdminProfessor[];
}

export async function saveAdminProfessor(professor: Omit<AdminProfessor, "user_id"> & { user_id?: string }) {
  if (professor.user_id) {
    return (await saveAdminProfessorServer({
      data: {
        userId: professor.user_id,
        name: professor.name,
        email: professor.email,
        active: professor.active,
        ...(professor.password?.trim() ? { password: professor.password } : {}),
      },
    })) as AdminProfessor;
  }

  if (!professor.password?.trim()) throw new Error("Informe uma senha para o novo professor.");
  return createAdminProfessor({
    data: {
      name: professor.name,
      email: professor.email,
      password: professor.password,
      ...(professor.active !== undefined ? { active: professor.active } : {}),
      ...(professor.user_id ? { userId: professor.user_id } : {}),
    },
  });
}

export async function removeAdminProfessor(userId: string) {
  await removeAdminProfessorServer({ data: { userId } });
}

export async function fetchAdminAnalytics() {
  return (await fetchAdminAnalyticsServer()) as {
    workouts: { id: string; aluno_nome: string; professor_id: string }[];
    completions: AdminCompletion[];
    professors: AdminProfessor[];
  };
}

export { adminLogin, adminLogout, adminRestore };