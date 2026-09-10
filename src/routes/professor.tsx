import { createFileRoute } from "@tanstack/react-router";

import { ProfessorPage } from "@/components/teacher/ProfessorPage";

export const Route = createFileRoute("/professor")({
  component: ProfessorPage,
});