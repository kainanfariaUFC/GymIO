import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import type { Completion } from "@/lib/workout-log";
import { todayKey } from "@/lib/workout-log";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function key(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function HistoryCalendar({
  completions,
  loading,
}: {
  completions: Completion[];
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const today = todayKey();
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split("-").map(Number);
    return { y: y ?? 2026, m: (m ?? 1) - 1 };
  });

  const map = useMemo(() => {
    const m = new Map<string, Completion>();
    for (const c of completions) m.set(c.completed_on, c);
    return m;
  }, [completions]);

  const first = new Date(cursor.y, cursor.m, 1).getDay();
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate();

  const move = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <section className="mt-5 overflow-hidden rounded-3xl bg-card shadow-soft">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-5 text-left"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-dusty text-dusty-foreground" aria-hidden>
          <CalendarDays size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold leading-tight text-foreground">
            Meu histórico
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {loading ? "Carregando…" : `${completions.length} treinos finalizados`}
          </span>
        </span>
        <ChevronDown
          size={22}
          aria-hidden
          className={`shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-6">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Mês anterior"
                className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <ChevronLeft size={18} />
              </button>
              <p className="text-sm font-bold text-foreground">
                {MONTHS[cursor.m]} {cursor.y}
              </p>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Próximo mês"
                className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEK.map((w, i) => (
                <span key={i} className="py-1 text-xs font-semibold text-muted-foreground">
                  {w}
                </span>
              ))}
              {Array.from({ length: first }).map((_, i) => (
                <span key={`e${i}`} />
              ))}
              {Array.from({ length: days }).map((_, i) => {
                const k = key(cursor.y, cursor.m, i + 1);
                const completion = map.get(k);
                const isToday = k === today;
                const isComplete = completion?.status === "complete";
                return (
                  <span
                    key={k}
                    title={
                      completion
                        ? `Treino ${completion.day_slug === "dia-a" ? "A" : "B"} ${isComplete ? "completo" : "incompleto"}`
                        : undefined
                    }
                    className={`grid aspect-square place-items-center rounded-xl text-sm font-semibold ${
                      completion
                        ? isComplete
                          ? "bg-green-500 text-white"
                          : "bg-yellow-400 text-yellow-950"
                        : isToday
                          ? "border border-border text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-green-500" aria-hidden />
                Completo
              </p>
              <p className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-yellow-400" aria-hidden />
                Incompleto
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
