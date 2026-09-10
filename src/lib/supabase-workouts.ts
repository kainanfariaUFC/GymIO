import { supabase } from "@/integrations/supabase/client";
import type { WorkoutBlock, WorkoutDay, Exercise } from "@/lib/workouts";

// Estrutura de cada exercício preenchido pelo professor
export type RawExercise = {
  name: string;
  sets: string;         // ex: "3 × 8–12"
  rest: string;         // ex: "60s", "90s", "45–60s"
  mediaUrl?: string;
  muscle?: string;
};

export type RawWorkoutDay = {
  slug: string;        // ex: "dia-a", "dia-b"
  label: string;       // ex: "Treino A"
  headline?: string;    // ex: "Peito e Tríceps"
  mobilidade?: RawExercise[];
  forca?: RawExercise[];
  metabolico?: RawExercise[];
};

export type StudentPlanRow = {
  id: string;
  aluno_nome: string;
  dias: RawWorkoutDay[];
};

export type StudentPlan = {
  id: string;
  alunoNome: string;
  workouts: WorkoutDay[];
};

/**
 * Converte strings de tempo como "60s", "90–120s" ou 60 para um número estimado de segundos
 */
function parseRestInSeconds(rest: string | number): number {
  if (typeof rest === "number") return rest;
  const match = rest.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

/**
 * Extrai a quantidade de séries numéricas de strings como "3 × 8–12", "3x10"
 */
function parseSetsCount(setsStr: string): number {
  const match = setsStr.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 3;
}

/**
 * Calcula a duração aproximada do bloco somando (séries * 45s de execução) + (séries * descanso escolhido pelo professor)
 */
function calculateBlockDuration(exercises: RawExercise[] = []): string {
  if (!exercises.length) return "0 min";

  let totalSeconds = 0;

  exercises.forEach((ex) => {
    const numSets = parseSetsCount(ex.sets);
    const restSec = parseRestInSeconds(ex.rest);
    const executionSec = 45; // Média estimada de tempo sob tensão por série

    totalSeconds += numSets * (executionSec + restSec);
  });

  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
  return `${totalMinutes} min`;
}

export function mapPlanToWorkoutDays(data: StudentPlanRow): StudentPlan {
  const workouts: WorkoutDay[] = (data.dias || []).map((dia, dayIndex) => {
    const blocks: WorkoutBlock[] = [];

    const mapExercises = (items: RawExercise[] = [], prefix: string): Exercise[] => {
      return items.map((item, index) => ({
        id: `${data.id}-${dayIndex}-${prefix}-${index}`,
        name: item.name,
        // Exibe "3 × 8–12 (Descanso: 60s)"
        sets: item.rest ? `${item.sets} (Descanso: ${item.rest})` : item.sets,
        muscle: item.muscle || "Geral",
        mediaUrl: item.mediaUrl,
      }));
    };

    // 1. Mobilidade
    if (dia.mobilidade && dia.mobilidade.length > 0) {
      blocks.push({
        id: `mob-${dayIndex}`,
        title: "Aquecimento & Mobilidade",
        duration: calculateBlockDuration(dia.mobilidade),
        kind: "warmup",
        exercises: mapExercises(dia.mobilidade, "mob"),
      });
    }

    // 2. Treino de Força
    if (dia.forca && dia.forca.length > 0) {
      blocks.push({
        id: `str-${dayIndex}`,
        title: "Treino de Força",
        duration: calculateBlockDuration(dia.forca),
        kind: "strength",
        exercises: mapExercises(dia.forca, "str"),
      });
    }

    // 3. Metabólico
    if (dia.metabolico && dia.metabolico.length > 0) {
      blocks.push({
        id: `met-${dayIndex}`,
        title: "Bloco Metabólico",
        duration: calculateBlockDuration(dia.metabolico),
        kind: "metabolic",
        exercises: mapExercises(dia.metabolico, "met"),
      });
    }

    return {
      slug: dia.slug || `dia-${dayIndex + 1}`,
      label: dia.label || `Treino ${String.fromCharCode(65 + dayIndex)}`,
      headline: dia.headline || "Foco & Performance",
      blocks,
      whyItWorks: [
        `Treino ${dia.label} personalizado para ${data.aluno_nome}.`,
        "Siga a ordem dos exercícios e respeite os tempos de descanso definidos.",
      ],
    };
  });

  return {
    id: data.id,
    alunoNome: data.aluno_nome,
    workouts,
  };
}

export async function fetchStudentPlanById(id: string): Promise<StudentPlan | null> {
  const { data, error } = await supabase
    .from("treinos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar plano no Supabase:", error);
    return null;
  }

  return mapPlanToWorkoutDays(data as unknown as StudentPlanRow);
}
