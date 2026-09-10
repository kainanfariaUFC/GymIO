// Configuração do Supabase Storage
const SUPABASE_PROJECT_URL = "https://upbkecazclnhtpncmbbr.supabase.co";
const BUCKET_NAME = "gymio-core-exercises";

const SUPABASE_STORAGE_URL = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET_NAME}`;

export type Exercise = {
  id: string;
  name: string;
  apiName?: string;
  sets: string;
  muscle: string;
  mediaUrl?: string;
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
        id: "a-warmup",
        title: "Aquecimento & Mobilidade",
        duration: "10 min",
        kind: "warmup",

        exercises: [
          {
            id: "a-w1",
            name: "Mobilidade de tornozelo e quadril + Polichinelos + Agachamento livre solo",
            apiName: "bodyweight squat",
            sets: "2×10",
            muscle: "Corpo todo",
            mediaUrl: `${SUPABASE_STORAGE_URL}/bodyweight_squat.webp`,
          },
        ],
      },

      {
        id: "a-strength",
        title: "Treino de Força Full Body",
        duration: "50–55 min",
        kind: "strength",

        exercises: [
          {
            id: "a-s1",
            name: "Agachamento Livre com Barra ou Halter (ou Leg Press 45°)",
            apiName: "barbell low bar squat",
            sets: "4×8–10",
            muscle: "Quadríceps/Glúteos",
            mediaUrl: `${SUPABASE_STORAGE_URL}/barbell_low_bar_squat.webp`,
          },
          {
            id: "a-s2",
            name: "Supino Reto com Halteres",
            apiName: "dumbbell bench press",
            sets: "4×8–10",
            muscle: "Peitoral",
            mediaUrl: `${SUPABASE_STORAGE_URL}/dumbbell_bench_press.webp`,
          },
          {
            id: "a-s3",
            name: "Puxada Alta Frontal na Polia",
            apiName: "cable bar lateral pulldown",
            sets: "4×10–12",
            muscle: "Costas",
            mediaUrl: `${SUPABASE_STORAGE_URL}/cable_bar_lateral_pulldown.webp`,
          },
          {
            id: "a-s4",
            name: "Stiff com Halteres",
            apiName: "dumbbell romanian deadlift",
            sets: "3×10–12",
            muscle: "Posterior de coxa/Glúteos",
            mediaUrl: `${SUPABASE_STORAGE_URL}/dumbbell_romanian_deadlift.webp`,
          },
          {
            id: "a-s5",
            name: "Desenvolvimento de Ombros com Halteres",
            apiName: "lever shoulder press v. 3",
            sets: "3×10–12",
            muscle: "Ombros",
            mediaUrl: `${SUPABASE_STORAGE_URL}/lever_shoulder_press_v_3.webp`,
          },
          {
            id: "a-s6",
            name: "Rosca Direta no Pulley / Cabo",
            apiName: "barbell drag curl",
            sets: "3×12–15",
            muscle: "Bíceps",
            mediaUrl: `${SUPABASE_STORAGE_URL}/barbell_drag_curl.webp`,
          },
          {
            id: "a-s7",
            name: "Gêmeos em Pé",
            apiName: "standing calf raise",
            sets: "4×15–20",
            muscle: "Panturrilha — máquina ou degrau com halter",
            mediaUrl: `${SUPABASE_STORAGE_URL}/standing_calf_raise.webp`,
          },
          {
            id: "a-s8",
            name: "Prancha Abdominal Solo",
            apiName: "front plank",
            sets: "3×45–60s",
            muscle: "Core",
            mediaUrl: `${SUPABASE_STORAGE_URL}/front_plank.webp`,
          },
        ],
      },

      {
        id: "a-metabolic",
        title: "Bloco Metabólico",
        duration: "15 min",
        kind: "metabolic",
        timer: true,

        note: "HIIT: intervalos de 30s forte / 30s leve.",

        exercises: [
          {
            id: "b-m1",
            name: "Esteira em Inclinação ou Bicicleta Ergométrica (HIIT)",
            apiName: "treadmill walking",
            sets: "8–10 tiros de 30s forte / 30s leve",
            muscle: "Cardio",
            mediaUrl: `${SUPABASE_STORAGE_URL}/treadmill_walking.webp`,
          },
        ],
      },
    ],

    whyItWorks: [
      "A divisão A/B alterna o foco de braços entre os dias: no Dia A o bíceps entra como exercício direto (Rosca Direta), enquanto o tríceps trabalha de forma indireta nos supinos e desenvolvimento. No Dia B acontece o inverso — Tríceps Corda direto e bíceps recrutado nas remadas e puxadas. Assim cada músculo recebe estímulo direto e indireto ao longo da semana, sem sobreposição excessiva.",
      "A panturrilha recebe estímulo duplo e complementar: Gêmeos em Pé (Dia A) enfatiza o gastrocnêmio com o joelho estendido, enquanto Gêmeos Sentado (Dia B) foca no sóleo, com o joelho flexionado. Trabalhar as duas posições garante desenvolvimento completo da panturrilha.",
      "O formato full body alternado permite alta frequência semanal (cada grupo muscular estimulado 2× ou mais) com recuperação adequada entre as sessões.",
    ],
  },

  "dia-b": {
    slug: "dia-b",
    label: "Dia B",
    headline: "Full Body B",

    blocks: [
      {
        id: "b-warmup",
        title: "Aquecimento & Mobilidade",
        duration: "10 min",
        kind: "warmup",

        exercises: [
          {
            id: "b-w1",
            name: "Mobilidade de quadril/torácica + Elevação de quadril solo",
            apiName: "bridge",
            sets: "2×12",
            muscle: "Corpo todo",
            mediaUrl: `${SUPABASE_STORAGE_URL}/bridge.webp`,
          },
        ],
      },

      {
        id: "b-strength",
        title: "Treino de Força Full Body",
        duration: "50–55 min",
        kind: "strength",

        exercises: [
          {
            id: "b-s1",
            name: "Levantamento Terra RDL ou Terra Convencional",
            apiName: "barbell romanian deadlift",
            sets: "4×8–10",
            muscle: "Cadeia posterior",
            mediaUrl: `${SUPABASE_STORAGE_URL}/barbell_romanian_deadlift.webp`,
          },
          {
            id: "b-s2",
            name: "Remada Curvada com Barra ou Remada Baixa",
            apiName: "barbell bent over row",
            sets: "4×8–10",
            muscle: "Costas",
            mediaUrl: `${SUPABASE_STORAGE_URL}/barbell_bent_over_row.webp`,
          },
          {
            id: "b-s3",
            name: "Supino Inclinado com Halteres",
            apiName: "dumbbell incline bench press",
            sets: "4×10–12",
            muscle: "Peitoral Superior",
            mediaUrl: `${SUPABASE_STORAGE_URL}/dumbbell_incline_bench_press.webp`,
          },
          {
            id: "b-s4",
            name: "Cadeira Extensora",
            apiName: "lever leg extension",
            sets: "3×12–15",
            muscle: "Quadríceps — movimento controlledo",
            mediaUrl: `${SUPABASE_STORAGE_URL}/lever_leg_extension.webp`,
          },
          {
            id: "b-s5",
            name: "Elevação Lateral de Ombros",
            apiName: "dumbbell lateral raise",
            sets: "3×12–15",
            muscle: "Ombros",
            mediaUrl: `${SUPABASE_STORAGE_URL}/dumbbell_lateral_raise.webp`,
          },
          {
            id: "b-s6",
            name: "Tríceps Corda na Polia",
            apiName: "cable pushdown",
            sets: "3×12–15",
            muscle: "Tríceps",
            mediaUrl: `${SUPABASE_STORAGE_URL}/cable_pushdown.webp`,
          },
          {
            id: "b-s7",
            name: "Gêmeos Sentado na Máquina",
            apiName: "lever seated calf raise",
            sets: "4×15–20",
            muscle: "Panturrilha — foco no sóleo",
            mediaUrl: `${SUPABASE_STORAGE_URL}/lever_seated_calf_raise.webp`,
          },
          {
            id: "b-s8",
            name: "Abdominal Infra no Banco / Paralela",
            apiName: "reverse crunch",
            sets: "3×15",
            muscle: "Core",
            mediaUrl: `${SUPABASE_STORAGE_URL}/reverse_crunch.webp`,
          },
        ],
      },

      {
        id: "b-metabolic",
        title: "Bloco Metabólico",
        duration: "15 min",
        kind: "metabolic",
        timer: true,

        note: "Circuito de Core & Cardio — 3 rodadas. Descanse pouco entre as rodadas.",

        exercises: [
          {
            id: "b-m1",
            name: "Transport / Elliptical ou Remador",
            apiName: "elliptical machine",
            sets: "3 min acelerado",
            muscle: "Cardio",
            mediaUrl: `${SUPABASE_STORAGE_URL}/elliptical_machine.webp`,
          },
          {
            id: "b-m2",
            name: "Abdominal Remador",
            apiName: "tuck crunch",
            sets: "15–20 reps",
            muscle: "Core",
            mediaUrl: `${SUPABASE_STORAGE_URL}/tuck_crunch.webp`,
          },
          {
            id: "b-m3",
            name: "Polichinelo ou Corda",
            apiName: "jumping jack",
            sets: "45 seg",
            muscle: "Cardio",
            mediaUrl: `${SUPABASE_STORAGE_URL}/jumping_jack.webp`,
          },
        ],
      },
    ],

    whyItWorks: [
      "A divisão A/B alterna o foco de braços entre os dias: no Dia A o bíceps entra como exercício direto (Rosca Direta), enquanto o tríceps trabalha de forma indireta nos supinos e desenvolvimento. No Dia B acontece o inverso — Tríceps Corda direto e bíceps recrutado nas remadas e puxadas. Assim cada músculo recebe estímulo direto e indireto ao longo da semana, sem sobreposição excessiva.",
      "A panturrilha recebe estímulo duplo e complementar: Gêmeos em Pé (Dia A) enfatiza o gastrocnêmio com o joelho estendido, enquanto Gêmeos Sentado (Dia B) foca no sóleo, com o joelho flexionado. Trabalhar as duas posições garante desenvolvimento completo da panturrilha.",
      "O formato full body alternado permite alta frequência semanal (cada grupo muscular estimulado 2× ou mais) com recuperação adequada entre as sessões.",
    ],
  },
};
