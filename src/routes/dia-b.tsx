import { createFileRoute } from "@tanstack/react-router";

import { WorkoutPage } from "@/components/workout/WorkoutPage";
import { workouts } from "@/lib/workouts";

export const Route = createFileRoute("/dia-b")({
  head: () => ({
    meta: [
      { title: "Dia B — Treino Full Body | Minha Rotina de Treino" },
      {
        name: "description",
        content:
          "Treino do Dia B: aquecimento, força full body e circuito metabólico de core e cardio. Marque os exercícios conforme avança.",
      },
      { property: "og:title", content: "Dia B — Treino Full Body" },
      {
        property: "og:description",
        content:
          "Treino do Dia B: aquecimento, força full body e circuito metabólico de core e cardio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DiaBPage,
});

function DiaBPage() {
  return <WorkoutPage day={workouts["dia-b"]} />;
}
