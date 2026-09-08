import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const OPTIONS = [60, 75, 90];

export function RestTimer() {
  const [duration, setDuration] = useState(60);
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setRunning(false);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [running]);

  const pick = (s: number) => {
    setDuration(s);
    setLeft(s);
    setRunning(false);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const done = left === 0;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl bg-muted/60 px-3 py-2.5">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Timer size={14} aria-hidden />
        Descanso
      </span>

      <span
        className={`font-mono text-lg font-bold tabular-nums ${
          done ? "text-accent-foreground" : "text-foreground"
        }`}
        aria-live="polite"
      >
        {done ? "Pronto!" : `${mm}:${ss}`}
      </span>

      <div className="flex gap-1" role="group" aria-label="Tempo de descanso">
        {OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => pick(s)}
            aria-pressed={duration === s}
            className={`min-h-9 rounded-full px-3 text-xs font-bold transition-colors ${
              duration === s
                ? "bg-accent text-accent-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}s
          </button>
        ))}
      </div>
      
      <button
        type="button"
        onClick={() => (done ? pick(duration) : setRunning((r) => !r))}
        className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-primary/30 text-foreground transition-colors hover:bg-primary/50"
        aria-label={done ? "Reiniciar descanso" : running ? "Pausar descanso" : "Iniciar descanso"}
      >
        {done ? <RotateCcw size={18} /> : running ? <Pause size={18} /> : <Play size={18} />}
      </button>
    </div>
  );
}
