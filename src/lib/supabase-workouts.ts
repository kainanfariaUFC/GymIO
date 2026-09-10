import { supabase } from "@/lib/supabase"; // Ajuste para a sua instância do cliente Supabase
import type { WorkoutBlock, WorkoutDay, Exercise } from "@/lib/workouts";

// Interface do formato bruto do banco de dados
export type RawExercise = {
  name: string;
  mediaUrl?: string;
  sets: string;
  muscle?: string;
};

export type TreinoRow = {
  id: string;
  aluno_nome: string;
  headline?: string;
  mobilidade: RawExercise[];
  forca: RawExercise[];
  metabolico: RawExercise[];
};

/**
 * Converte o formato do Supabase no formato interno do app (WorkoutDay)
 */
export function mapTreinoToWorkoutDay(data: TreinoRow): WorkoutDay {
  const blocks: WorkoutBlock[] = [];

  const mapExercises = (items: RawExercise[], prefix: string): Exercise[] => {
    return (items || []).map((item, index) => ({
      id: `${prefix}-${index}`,
      name: item.name,
      sets: item.sets,
      muscle: item.muscle || "Geral",
      mediaUrl: item.mediaUrl,
    }));
  };

  // 1. Aquecimento & Mobilidade
  if (data.mobilidade && data.mobilidade.length > 0) {
    blocks.push({
      id: "block-mobilidade",
      title: "Aquecimento & Mobilidade",
      duration: "10 min",
      kind: "warmup",
      exercises: mapExercises(data.mobilidade, "mob"),
    });
  }

  // 2. Treino de Força
  if (data.forca && data.forca.length > 0) {
    blocks.push({
      id: "block-forca",
      title: "Treino de Força",
      duration: "40 min",
      kind: "strength",
      exercises: mapExercises(data.forca, "str"),
    });
  }

  // 3. Bloco Metabólico
  if (data.metabolico && data.metabolico.length > 0) {
    blocks.push({
      id: "block-metabolico",
      title: "Bloco Metabólico",
      duration: "15 min",
      kind: "metabolic",
      exercises: mapExercises(data.metabolico, "met"),
    });
  }

  return {
    slug: data.id,
    label: `Treino de ${data.aluno_nome}`,
    headline: data.headline || `Foco & Performance — ${data.aluno_nome}`,
    blocks,
    whyItWorks: [
      `Treino personalizado sob medida para ${data.aluno_nome}.`,
      "Siga a sequência de blocos e respeite as séries e intervalos indicados.",
    ],
  };
}

/**
 * Busca um treino no Supabase a partir do ID
 */
export async function fetchWorkoutById(id: string): Promise<WorkoutDay | null> {
  const { data, error } = await supabase
    .from("treinos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar treino no Supabase:", error);
    return null;
  }

  return mapTreinoToWorkoutDay(data as TreinoRow);
}
