export type Exercise = {
  id: string;
  name: string;
  sets: string;
  muscle: string;
  rest?: string;
  mediaUrl?: string;
  media?: {
    video?: string;
    image?: string;
  };
  youtubeUrl?: string;
};

export type WorkoutBlock = {
  id: string;
  title: string;
  duration: string;
  kind: "warmup" | "strength" | "metabolic";
  note?: string;
  timer?: boolean;
  exercises: Exercise[];
};

export type WorkoutDay = {
  slug: string;
  label: string;
  headline: string;
  blocks: WorkoutBlock[];
  whyItWorks: string[];
};