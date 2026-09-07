import {
  Activity,
  Check,
  ChevronDown,
  CircleHelp,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  PersonStanding,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { useSessionChecks } from "@/hooks/use-session-checks";
import type { Exercise, WorkoutBlock, WorkoutDay } from "@/lib/workouts";
import { IntervalTimer } from "@/components/workout/IntervalTimer";
import { ExerciseMedia } from "@/components/workout/ExerciseMedia";

function muscleIcon(muscle: string): ReactNode {
  const m = muscle.toLowerCase();
  const props = { size: 16, className: "shrink-0 text-muted-foreground", "aria-hidden": true } as const;
  if (m.includes("cardio")) return <HeartPulse {...props} />;
  if (m.includes("core")) return <Activity {...props} />;
  if (m.includes("panturrilha")) return <Footprints {...props} />;
  if (m.includes("corpo todo")) return <PersonStanding {...props} />;
  return <Dumbbell {...props} />;
}

const kindStyles: Record<WorkoutBlock["kind"], { chip: string; icon: ReactNode; step: string }> = {
  warmup: {
    chip: "bg-dusty text-dusty-foreground",
    icon: <PersonStanding size={18} aria-hidden />,
    step: "1",
  },
  strength: {
    chip: "bg-primary/25 text-primary-foreground",
    icon: <Dumbbell size={18} aria-hidden />,
    step: "2",
  },
  metabolic: {
    chip: "bg-sage text-sage-foreground",
    icon: <Flame size={18} aria-hidden />,
    step: "3",
  },
};

function ExerciseRow({
  exercise,
  done,
  onToggle,
}: {
  exercise: Exercise;
  done: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onToggle(exercise.id)}
        aria-pressed={done}
        className="flex w-full items-start gap-4 rounded-xl px-2 py-3.5 text-left transition-colors hover:bg-muted/60 active:bg-muted"
      >
        <span
          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition-colors ${
            done ? "border-accent bg-accent" : "border-input bg-card"
          }`}
          aria-hidden
        >
          {done && <Check size={18} strokeWidth={3} className="text-accent-foreground" />}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block text-base font-semibold leading-snug ${
              done ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {exercise.name}
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              {muscleIcon(exercise.muscle)}
              {exercise.muscle}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
              {exercise.sets}
            </span>
          </span>
        </span>
      </button>
      <div className="pb-3 pl-13 pr-2">
        <ExerciseMedia exercise={exercise} />
      </div>
    </li>
  );
}

function BlockCard({
  block,
  open,
  onOpenChange,
  checked,
  onToggle,
  defaultOpen,
}: {
  block: WorkoutBlock;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const style = kindStyles[block.kind];

  const doneCount = block.exercises.filter((e) => checked[e.id]).length;

  return (
    <section className="overflow-hidden rounded-3xl bg-card shadow-soft">
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 px-5 py-5 text-left"
      >
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${style.chip}`}
          aria-hidden
        >
          {style.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold leading-tight text-foreground">
            {block.title}
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            Bloco {style.step} · {block.duration}
            {doneCount > 0 && ` · ${doneCount}/${block.exercises.length} feitos`}
          </span>
        </span>
        <ChevronDown
          size={22}
          aria-hidden
          className={`shrink-0 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5">
            {block.note && (
              <p className="mx-1 mb-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                {block.note}
              </p>
            )}
            <ul className="divide-y divide-border/60">
              {block.exercises.map((ex) => (
                <ExerciseRow key={ex.id} exercise={ex} done={!!checked[ex.id]} onToggle={onToggle} />
              ))}
            </ul>
            {block.timer && isOpen && <IntervalTimer />}
          </div>
        </div>
      </div>
    </section>
  );
}

export function WorkoutPage({ day }: { day: WorkoutDay }) {
  const { checked, toggle, reset } = useSessionChecks(`treino:${day.slug}`);
  const [whyOpen, setWhyOpen] = useState(false);

  const allExercises = useMemo(() => day.blocks.flatMap((b) => b.exercises), [day]);
  const doneTotal = allExercises.filter((e) => checked[e.id]).length;
  const pct = allExercises.length === 0 ? 0 : Math.round((doneTotal / allExercises.length) * 100);

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-32 pt-8 sm:px-6">
      {/* Topo: título + progresso */}
      <header className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {day.label}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
          {day.headline}
        </h1>

        <div className="mt-5 rounded-2xl bg-card p-4 shadow-soft">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">
              {doneTotal}/{allExercises.length} concluídos
            </p>
            <p className="text-sm font-bold text-accent-foreground">{pct}%</p>
          </div>
          <div
            className="mt-2.5 h-3 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do treino"
          >
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      {/* Blocos do treino */}
      <div className="flex flex-col gap-5">
        {day.blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            checked={checked}
            onToggle={toggle}
            defaultOpen={block.kind === "strength"}
          />
        ))}
      </div>

      {/* Por que essa divisão funciona */}
      <section className="mt-8 overflow-hidden rounded-3xl bg-sand shadow-soft">
        <button
          type="button"
          onClick={() => setWhyOpen((o) => !o)}
          aria-expanded={whyOpen}
          className="flex w-full items-center gap-3 px-5 py-5 text-left"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card text-sand-foreground">
            <CircleHelp size={20} aria-hidden />
          </span>
          <span className="min-w-0 flex-1 text-lg font-bold leading-tight text-foreground">
            Por que essa divisão funciona
          </span>
          <ChevronDown
            size={22}
            aria-hidden
            className={`shrink-0 text-sand-foreground transition-transform duration-300 ${
              whyOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        <div
          className={`grid transition-all duration-300 ease-out ${
            whyOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-3 px-5 pb-6">
              {day.whyItWorks.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-sand-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reiniciar treino */}
      <button
        type="button"
        onClick={reset}
        className="mt-8 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-card px-5 py-4 text-base font-bold text-muted-foreground shadow-soft transition-colors hover:text-foreground active:scale-[0.99]"
      >
        <RotateCcw size={20} aria-hidden />
        Reiniciar treino de hoje
      </button>
    </div>
  );
}
