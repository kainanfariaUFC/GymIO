// Configuração do Supabase Storage
const SUPABASE_PROJECT_URL = "https://upbkecazclnhtpncmbbr.supabase.co";
const BUCKET_NAME = "gymio-core-exercises";

/**
 * Converte qualquer nome de exercício para o formato snake_case em webp
 * Ex: "Agachamento Barra" -> "agachamento_barra.webp"
 */
export const getExerciseMediaUrl = (name: string): string => {
  const cleanName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")    // Substitui caracteres especiais e espaços por "_"
    .replace(/^_+|_+$/g, "");       // Remove "_" sobressalentes no início ou fim

  return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}/${cleanName}.webp`;
};

export type Exercise = {
  id: string;
  name: string;
  sets: string;
  muscle: string;
  mediaUrl?: string;
  media?: {
    video?: string;
    image?: string;
  };
  youtubeUrl?: string;
};

export type WorkoutBlock = {
  id: string;
  title: string;
  duration: string;
  kind: "warmup" | "strength" | "metabolic";
  note?: string;
  timer?: boolean;
  exercises: Exercise[];
};

export type WorkoutDay = {
  slug: string;
  label: string;
  headline: string;
  blocks: WorkoutBlock[];
  whyItWorks: string[];
};

export const workouts: Record<"dia-a" | "dia-b", WorkoutDay> = {
  "dia-a": {
    slug: "dia-a",
    label: "Dia A",
    headline: "Full Body A",

    blocks: [
      {
        id: "a-strength",
        title: "Treino de Força Full Body A",
        duration: "50–60 min",
        kind: "strength",

        exercises: [
          {
            id: "a-s1",
            name: "Agachamento Barra",
            sets: "3 × 6–10 (Descanso: 90–120s)",
            muscle: "Quadríceps/Glúteos",
            mediaUrl: getExerciseMediaUrl("Agachamento Barra"),
          },
          {
            id: "a-s2",
            name: "Supino Inclinado com Barra",
            sets: "3 × 8–12 (Descanso: 60–90s)",
            muscle: "Peitoral Superior",
            mediaUrl: getExerciseMediaUrl("Supino Inclinado com Barra"),
          },
          {
            id: "a-s3",
            name: "Remada Sentada com Cabo",
            sets: "3 × 8–12 (Descanso: 60–90s)",
            muscle: "Costas",
            mediaUrl: getExerciseMediaUrl("Remada Sentada com Cabo"),
          },
          {
            id: "a-s4",
            name: "Cadeira Flexora",
            sets: "2 × 10–15 (Descanso: 60–90s)",
            muscle: "Posterior de Coxa",
            mediaUrl: getExerciseMediaUrl("Cadeira Flexora"),
          },
          {
            id: "a-s5",
            name: "Desenvolvimento de Ombros na Máquina",
            sets: "2 × 8–12 (Descanso: 60–90s)",
            muscle: "Ombros",
            mediaUrl: getExerciseMediaUrl("Desenvolvimento de Ombros na Máquina"),
          },
          {
            id: "a-s6",
            name: "Extensão de Glúteo em Pé",
            sets: "2 × 12–15/cada (Descanso: 45–60s)",
            muscle: "Glúteos",
            mediaUrl: getExerciseMediaUrl("Extensão de Glúteo em Pé"),
          },
          {
            id: "a-s7",
            name: "Abdômen",
            sets: "3 × 10–15 (Descanso: 45–60s)",
            muscle: "Core / Abdômen",
            mediaUrl: getExerciseMediaUrl("Abdômen"),
          },
        ],
      },
    ],

    whyItWorks: [
      "Trabalho composto com agachamento livre pesado e supino inclinado focado no volume do terço superior do peitoral e pernas.",
      "A remada sentada no cabo promove suporte lombar seguro mantendo alta sobrecarga tensional para as costas.",
      "Volume ajustado para hipertrofia com tempos de descanso calculados por exercício.",
    ],
  },

  "dia-b": {
    slug: "dia-b",
    label: "Dia B",
    headline: "Full Body B",

    blocks: [
      {
        id: "b-strength",
        title: "Treino de Força Full Body B",
        duration: "50–60 min",
        kind: "strength",

        exercises: [
          {
            id: "b-s1",
            name: "Agachamento na Máquina Hack",
            sets: "3 × 8–12 (Descanso: 90–120s)",
            muscle: "Quadríceps",
            mediaUrl: getExerciseMediaUrl("Agachamento na Máquina Hack"),
          },
          {
            id: "b-s2",
            name: "Supino Reto com Halteres",
            sets: "3 × 8–12 (Descanso: 60–90s)",
            muscle: "Peitoral",
            mediaUrl: getExerciseMediaUrl("Supino Reto com Halteres"),
          },
          {
            id: "b-s3",
            name: "Remada T com Alavanca",
            sets: "3 × 8–12 (Descanso: 60–90s)",
            muscle: "Costas",
            mediaUrl: getExerciseMediaUrl("Remada T com Alavanca"),
          },
          {
            id: "b-s4",
            name: "Cadeira Flexora",
            sets: "2 × 10–15 (Descanso: 60–90s)",
            muscle: "Posterior de Coxa",
            mediaUrl: getExerciseMediaUrl("Cadeira Flexora"),
          },
          {
            id: "b-s5",
            name: "Desenvolvimento Lateral com Gymstick",
            sets: "2 × 12–15 (Descanso: 45–60s)",
            muscle: "Ombros (Deltoide Lateral)",
            mediaUrl: getExerciseMediaUrl("Desenvolvimento Lateral com Gymstick"),
          },
          {
            id: "b-s6",
            name: "Extensão de Glúteo em Pé",
            sets: "2 × 12–15/cada (Descanso: 45–60s)",
            muscle: "Glúteos",
            mediaUrl: getExerciseMediaUrl("Extensão de Glúteo em Pé"),
          },
          {
            id: "b-s7",
            name: "Abdômen",
            sets: "3 × 10–15 (Descanso: 45–60s)",
            muscle: "Core / Abdômen",
            mediaUrl: getExerciseMediaUrl("Abdômen"),
          },
        ],
      },
    ],

    whyItWorks: [
      "O Hack Squat permite maior isolamento de quadríceps com segurança guiada.",
      "Combinação de Supino Reto com Halteres para máxima amplitude do peitoral e Desenvolvimento Lateral direcionado ao deltoide.",
      "Trabalho focado na cadeia posterior com Cadeira Flexora e Extensão de Glúteos em Pé.",
    ],
  },
};
