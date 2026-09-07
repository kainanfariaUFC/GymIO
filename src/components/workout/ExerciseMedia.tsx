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

  // Quando a API encontrar o exercício, prioriza o GIF da ExerciseDB.
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
  const params = new URLSearchParams({
    search: exerciseName,
  });

  const response = await fetch(
    `https://oss.exercisedb.dev/api/v1/exercises?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`ExerciseDB API retornou ${response.status}`);
  }

  const result: ExerciseDbResponse = await response.json();

  if (!result.success || !result.data?.length) {
    return null;
  }

  // Primeiro tenta encontrar correspondência exata.
  const normalizedName = exerciseName.trim().toLowerCase();

  const exactMatch = result.data.find(
    (item) => item.name.trim().toLowerCase() === normalizedName,
  );

  return exactMatch ?? result.data[0];
}

export function ExerciseMedia({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiExercise, setApiExercise] = useState<ExerciseDbResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleOpen = async () => {
    // Abre imediatamente o modal para mostrar o loading.
    setOpen(true);
    setLoading(true);
    setApiExercise(null);
    setApiError(null);

    try {
      const result = await fetchExerciseFromApi(exercise.name);

      if (!result) {
        setApiError("Não encontramos esse exercício na ExerciseDB.");
        return;
      }

      setApiExercise(result);
    } catch (error) {
      console.error("Erro ao buscar exercício na ExerciseDB:", error);

      setApiError(
        "Não foi possível carregar os dados do exercício. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
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
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-soft"
          >
            <div className="flex items-start gap-3 px-5 pb-3 pt-5">
              <p className="min-w-0 flex-1 text-base font-bold leading-snug text-foreground">
                {exercise.name}
              </p>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

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
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
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

            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                {exercise.sets} · {exercise.muscle}
              </p>

              {apiExercise && (
                <>
                  {apiExercise.equipments?.length ? (
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Equipamento
                      </p>

                      <p className="text-sm text-foreground">
                        {apiExercise.equipments.join(", ")}
                      </p>
                    </div>
                  ) : null}

                  {apiExercise.targetMuscles?.length ? (
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Músculo alvo
                      </p>

                      <p className="text-sm text-foreground">
                        {apiExercise.targetMuscles.join(", ")}
                      </p>
                    </div>
                  ) : null}

                  {apiExercise.instructions?.length ? (
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
