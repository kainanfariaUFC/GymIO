import type { WorkoutDay } from "@/lib/workout-types";

interface WorkoutNavigatorProps {
  workouts: WorkoutDay[];
  activeSlug: string;
  onSelectWorkout: (slug: string) => void;
}

export function WorkoutNavigator({
  workouts,
  activeSlug,
  onSelectWorkout,
}: WorkoutNavigatorProps) {
  if (workouts.length <= 1) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 bg-background/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-xl gap-2 overflow-x-auto rounded-2xl bg-muted p-1.5 shadow-inner">
        {workouts.map((workout) => {
          const isActive = workout.slug === activeSlug;
          return (
            <button
              key={workout.slug}
              type="button"
              onClick={() => onSelectWorkout(workout.slug)}
              className={`flex-1 min-w-[90px] rounded-xl py-2.5 px-3 text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {workout.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
