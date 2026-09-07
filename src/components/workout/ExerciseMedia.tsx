import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { Exercise } from "@/lib/workouts";

/**
 * Função utilitária para extrair o ID de um vídeo do YouTube
 */
function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function ExerciseMedia({
  exercise,
}: {
  exercise: Exercise;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const youtubeUrl = exercise.youtubeUrl || exercise.media?.video;
  const videoId = getYouTubeId(youtubeUrl);

  // URL da capa/thumbnail estática do YouTube
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : exercise.media?.image;

  return (
    <>
      {/* Botão de abertura com thumbnail estática */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ver execução: ${exercise.name}`}
        className="flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-card px-2.5 py-2 text-left transition-colors hover:bg-muted/60 active:scale-[0.99]"
      >
        <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`Execução: ${exercise.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <Play size={16} className="text-muted-foreground" />
            </div>
          )}
        </span>

        <span className="text-sm font-bold text-muted-foreground">
          Ver execução
        </span>
      </button>

      {/* Modal contendo o Iframe/Player */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Execução: ${exercise.name}`}
          onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            {/* Mídia dentro do Modal */}
            <div className="aspect-video w-full overflow-hidden bg-black">
              {videoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                  title={`Execução: ${exercise.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={`Execução: ${exercise.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground">
                  <Play size={24} />
                </div>
              )}
            </div>

            <div className="space-y-4 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                {exercise.sets} · {exercise.muscle}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
