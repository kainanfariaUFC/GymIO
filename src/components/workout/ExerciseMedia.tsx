import { ExternalLink, Play, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { Exercise } from "@/lib/workouts";

/**
 * Extrai o ID de um vídeo do YouTube a partir de diversos formatos de URL
 */
function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function ExerciseMedia({ exercise }: { exercise: Exercise }) {
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

  // Aceita tanto exercise.youtubeUrl quanto exercise.media.video
  const rawUrl = exercise.youtubeUrl || exercise.media?.video;
  const videoId = getYouTubeId(rawUrl);

  // Capa estática do vídeo do YouTube
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

      {/* Modal contendo o vídeo */}
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
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&enablejsapi=1`}
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

            {/* Rodapé do Modal com Fallback para abrir no YouTube */}
            <div className="space-y-3 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                {exercise.sets} · {exercise.muscle}
              </p>

              {videoId && (
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>Não está carregando? Abrir no YouTube</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
