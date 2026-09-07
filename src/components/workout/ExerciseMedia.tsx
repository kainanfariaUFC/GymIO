import { Loader2, Play, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { Exercise } from "@/lib/workouts";

type ExerciseDbResult = {
  exerciseId: string;
  name: string;
  gifUrl?: string;
  bodyParts?: string[];
  equipments?: string[];
  targetMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
};

type ExerciseDbResponse = {
  success: boolean;
  data: ExerciseDbResult[];
  meta?: {
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
  };
};

function MediaFrame({
  exercise,
  large,
  apiExercise,
}: {
  exercise: Exercise;
  large?: boolean;
  apiExercise?: ExerciseDbResult | null;
}) {
  const media = exercise.media;

  // Prioriza a mídia encontrada na ExerciseDB.
  if (apiExercise?.gifUrl) {
    return (
      <img
        src={apiExercise.gifUrl}
        alt={`Execução correta: ${exercise.name}`}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${large ? "" : "rounded-xl"}`}
      />
    );
  }

  // Fallback para a mídia que já existe no exercício.
  if (media?.video) {
    return (
      <video
        src={media.video}
        poster={media.image}
        muted
        loop
        autoPlay
        playsInline
        preload="none"
        className={`h-full w-full object-cover ${large ? "" : "rounded-xl"}`}
      />
    );
  }

  if (media?.image) {
    return (
      <img
        src={media.image}
        alt={`Execução correta: ${exercise.name}`}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${large ? "" : "rounded-xl"}`}
      />
    );
  }

  return (
    <div className="grid h-full w-full place-items-center gap-2 bg-muted px-3 text-center">
      <div className="flex flex-col items-center">
        <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-card text-muted-foreground shadow-soft">
          <Play size={18} aria-hidden />
        </span>

        <span
          className={`font-semibold leading-tight text-muted-foreground ${
            large ? "text-base" : "line-clamp-2 text-xs"
          }`}
        />
      </div>
    </div>
  );
}

async function fetchExerciseFromApi(
  exerciseName: string,
): Promise<ExerciseDbResult | null> {
  const url = new URL("https://oss.exercisedb.dev/api/v1/exercises");

  // Usa SEMPRE o nome do exercício que foi clicado.
  url.searchParams.set("search", exerciseName.trim());

  console.log("ExerciseDB - buscando:", exerciseName);
  console.log("ExerciseDB - URL:", url.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ExerciseDB API retornou ${response.status}`);
  }

  const result: ExerciseDbResponse = await response.json();

  console.log("ExerciseDB - resposta:", result);

  if (!result.success || !result.data?.length) {
    return null;
  }

  const normalizedName = exerciseName.trim().toLowerCase();

  // Primeiro tenta encontrar o nome exatamente igual.
  const exactMatch = result.data.find(
    (item) => item.name.trim().toLowerCase() === normalizedName,
  );

  if (exactMatch) {
    return exactMatch;
  }

  // Caso a API retorne resultados aproximados,
  // usamos o primeiro resultado.
  return result.data[0];
}

export function ExerciseMedia({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiExercise, setApiExercise] = useState<ExerciseDbResult | null>(
    null,
  );
  const [apiError, setApiError] = useState<string | null>(null);

  // Identifica cada requisição para impedir que uma resposta antiga
  // sobrescreva a resposta do último exercício clicado.
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleOpen = async () => {
    // Captura o exercício EXATO deste botão.
    const currentExerciseName = exercise.name.trim();

    // Gera um ID único para esta busca.
    const currentRequestId = requestId + 1;
    setRequestId(currentRequestId);

    console.log(
      "ExerciseMedia - exercício clicado:",
      currentExerciseName,
    );

    // Abre o modal.
    setOpen(true);

    // Limpa completamente os dados da busca anterior.
    setApiExercise(null);
    setApiError(null);
    setLoading(true);

    try {
      const result = await fetchExerciseFromApi(currentExerciseName);

      // Se outra busca foi iniciada enquanto essa estava acontecendo,
      // ignora esta resposta.
      if (currentRequestId !== requestId + 1) {
        return;
      }

      if (!result) {
        setApiError(
          `Não encontramos "${currentExerciseName}" na ExerciseDB.`,
        );
        return;
      }

      console.log(
        "ExerciseMedia - exercício encontrado:",
        result.name,
      );

      setApiExercise(result);
    } catch (error) {
      console.error(
        `ExerciseMedia - erro ao buscar "${currentExerciseName}":`,
        error,
      );

      setApiError(
        "Não foi possível carregar os dados do exercício. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
    setApiExercise(null);
    setApiError(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Ver execução: ${exercise.name}`}
        className="flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-card px-2.5 py-2 text-left transition-colors hover:bg-muted/60 active:scale-[0.99]"
      >
        <span className="h-12 w-16 shrink-0 overflow-hidden rounded-xl">
          <MediaFrame exercise={exercise} />
        </span>

        <span className="text-sm font-bold text-muted-foreground">
          Ver execução
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Execução: ${exercise.name}`}
          onClick={handleClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-soft"
          >
            {/* Header */}
            <div className="flex items-start gap-3 px-5 pb-3 pt-5">
              <p className="min-w-0 flex-1 text-base font-bold leading-snug text-foreground">
                {exercise.name}
              </p>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            {/* Mídia */}
            <div className="aspect-video w-full overflow-hidden bg-muted">
              {loading ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2
                    size={28}
                    aria-hidden
                    className="animate-spin"
                  />

                  <span className="text-sm font-medium">
                    Buscando exercício...
                  </span>
                </div>
              ) : apiError ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-card text-muted-foreground shadow-soft">
                    <Play size={20} aria-hidden />
                  </span>

                  <p className="text-sm font-medium text-muted-foreground">
                    {apiError}
                  </p>
                </div>
              ) : (
                <MediaFrame
                  exercise={exercise}
                  large
                  apiExercise={apiExercise}
                />
              )}
            </div>

            {/* Informações */}
            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                {exercise.sets} · {exercise.muscle}
              </p>

              {apiExercise?.equipments &&
              apiExercise.equipments.length > 0 ? (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Equipamento
                  </p>

                  <p className="text-sm text-foreground">
                    {apiExercise.equipments.join(", ")}
                  </p>
                </div>
              ) : null}

              {apiExercise?.targetMuscles &&
              apiExercise.targetMuscles.length > 0 ? (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Músculo alvo
                  </p>

                  <p className="text-sm text-foreground">
                    {apiExercise.targetMuscles.join(", ")}
                  </p>
                </div>
              ) : null}

              {apiExercise?.instructions &&
              apiExercise.instructions.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Como executar
                  </p>

                  <ol className="space-y-2">
                    {apiExercise.instructions.map((instruction, index) => (
                      <li
                        key={`${apiExercise.exerciseId}-step-${index}`}
                        className="flex gap-2 text-sm leading-relaxed text-foreground"
                      >
                        <span className="shrink-0 font-bold text-muted-foreground">
                          {index + 1}.
                        </span>

                        <span>
                          {instruction.replace(/^Step:\d+\s*/i, "")}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
