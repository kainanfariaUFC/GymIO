import { createFileRoute, redirect } from "@tanstack/react-router";

type SearchParams = { id?: string };

export const Route = createFileRoute("/aluno")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/",
      search: { id: search.id },
      replace: true,
    });
  },
});