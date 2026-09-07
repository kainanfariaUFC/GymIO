import { Pause, Play, TimerReset } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function format(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Cronômetro simples com start/pause para acompanhar os intervalos do HIIT/circuito. */
export function IntervalTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-sand px-5 py-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-sand-foreground/70">
          Cronômetro
        </p>
        <p
          className="font-mono text-4xl font-bold tabular-nums tracking-tight text-foreground"
          aria-live="polite"
        >
          {format(seconds)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
          aria-label="Zerar cronômetro"
          className="grid h-12 w-12 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <TimerReset size={22} />
        </button>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? "Pausar cronômetro" : "Iniciar cronômetro"}
          className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft transition-transform active:scale-95"
        >
          {running ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
