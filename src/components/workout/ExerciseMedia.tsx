import { ChevronDown, ExternalLink, Image as ImageIcon, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Exercise } from "@/lib/workouts";

/**
 * Extrai o ID de um vídeo do YouTube a partir de diversos formatos de URL
 */
function getYouTubeId(url?: string): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (trimmed.length === 11 && !trimmed.includes("/")) {
    return trimmed;
  }

  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2] && match[2].length === 11 ? match[2] : null;
}

export function ExerciseMedia({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Lê todas as fontes possíveis de mídia (dando prioridade ao novo mediaUrl do Supabase)
  const mediaUrl = exercise.mediaUrl;
  const rawVideoUrl = exercise.media?.video || (exercise as any).youtubeUrl;
  const videoId = getYouTubeId(rawVideoUrl);

  // Se houver vídeo do YouTube, a thumbnail é a do YouTube. Caso contrário, usa o mediaUrl / image
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : mediaUrl || exercise.media?.image;

  // Pausa o vídeo ao fechar o accordion removendo temporariamente o conteúdo do container
  useEffect(() => {
    if (open) return;
    if (contentRef.current) {
      contentRef.current.innerHTML = "";
    }
  }, [open]);

  // Se o exercício não tiver nenhuma mídia associada, não exibe o accordion
  if (!thumbnailUrl && !videoId) {
    return null;
  }

  return (
    <div className="mt-2 overflow-hidden rounded-2xl bg-muted/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`${open ? "Ocultar" : "Ver"} execução: ${exercise.name}`}
        className="flex min-h-11 w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/80 active:bg-muted/80"
      >
        <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded-xl bg-card">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`Execução: ${exercise.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="grid h-full w-full place-items-center">
              <Play size={16} className="text-muted-foreground" />
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1 text-sm font-bold text-muted-foreground">
          Ver execução
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3">
            <div
              ref={contentRef}
              className="aspect-video w-full overflow-hidden rounded-xl bg-black/5 dark:bg-black/40 grid place-items-center"
            >
              {open && videoId ? (
                <iframe
                  key={videoId}
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1`}
                  title={`Execução: ${exercise.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : open && thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={`Demonstração: ${exercise.name}`}
                  className="h-full w-full object-contain"
                />
              ) : open ? (
                <div className="grid h-full w-full place-items-center text-muted-foreground">
                  <ImageIcon size={24} />
                </div>
              ) : null}
            </div>

            {open && videoId && (
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>Abrir diretamente no YouTube</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
