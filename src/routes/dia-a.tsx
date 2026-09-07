import { createFileRoute } from "@tanstack/react-router";

import { WorkoutPage } from "@/components/workout/WorkoutPage";
import { workouts } from "@/lib/workouts";

export const Route = createFileRoute("/dia-a")({
  head: () => ({
    meta: [
      { title: "Dia A — Treino Full Body | Minha Rotina de Treino" },
      {
        name: "description",
        content:
          "Treino do Dia A: aquecimento, força full body e bloco metabólico HIIT. Marque os exercícios conforme avança.",
      },
      { property: "og:title", content: "Dia A — Treino Full Body" },
      {
        property: "og:description",
        content:
          "Treino do Dia A: aquecimento, força full body e bloco metabólico HIIT.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DiaAPage,
});

function DiaAPage() {
  return <WorkoutPage day={workouts["dia-a"]} />;
}
