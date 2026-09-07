import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { Exercise } from "@/lib/workouts";

function MediaFrame({ exercise, large }: { exercise: Exercise; large?: boolean }) {
  const media = exercise.media;

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
      <div className="flex flex-col items-center gap-2">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-card text-muted-foreground shadow-soft">
          <Play size={18} aria-hidden />
        </span>
        <span
          className={`font-semibold leading-tight text-muted-foreground ${
            large ? "text-base" : "line-clamp-2 text-xs"
          }`}
        >
          {large ? exercise.name : "Exemplo em breve"}
        </span>
      </div>
    </div>
  );
}

export function ExerciseMedia({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ver execução: ${exercise.name}`}
        className="flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-card px-2.5 py-2 text-left transition-colors hover:bg-muted/60 active:scale-[0.99]"
      >
        <span className="h-12 w-16 shrink-0 overflow-hidden rounded-xl">
          <MediaFrame exercise={exercise} />
        </span>
        <span className="text-sm font-bold text-muted-foreground">Ver execução</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Execução: ${exercise.name}`}
          onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <MediaFrame exercise={exercise} large />
            </div>
            <p className="px-5 py-4 text-sm text-muted-foreground">
              {exercise.sets} · {exercise.muscle}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
