import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(amount);
}

export function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export const COACH_SKILLS: Record<string, string[]> = {
  "Musicality": [
    "Barbershop Style",
    "Rhythm & Groove",
    "Rubato Phrasing",
    "Interpretive Planning",
    "Dynamic Contrast",
  ],
  "Singing": [
    "Tuning",
    "Balance & Blend",
    "Just Intonation",
    "Vocal Expression",
    "Resonance Matching",
    "Vocal Health",
    "Vowel Unity",
  ],
  "Performance": [
    "Characterisation",
    "Storytelling",
    "Audience Connection",
    "Stage Presence",
    "Emotional Arc",
    "Blocking",
    "Visual Unity",
  ],
  "Learning & Process": [
    "Repertoire Selection",
    "Rehearsal Methods",
    "Contest Preparation",
    "Goal Setting",
    "Deliberate Practice",
    "Feedback Loops",
    "Culture Development",
  ],
};

export const ALL_SKILLS = Object.values(COACH_SKILLS).flat();

export function getSkillCategory(skill: string): string | null {
  for (const [category, skills] of Object.entries(COACH_SKILLS)) {
    if (skills.includes(skill)) return category;
  }
  return null;
}

export function groupSkillsByCategory(skills: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  for (const skill of skills) {
    const category = getSkillCategory(skill);
    if (category) {
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(skill);
    }
  }
  return grouped;
}

export const EXPERIENCE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Elite",
];

export const ENSEMBLE_TYPES = [
  "Chorus",
  "Quartet",
];

export const SESSION_TYPES = [
  { value: "hourly", label: "Hourly Session" },
  { value: "half_day", label: "Half Day (4 hours)" },
  { value: "full_day", label: "Full Day (8 hours)" },
];

export const AUSTRALIAN_STATES = [
  "NSW",
  "VIC",
  "QLD",
  "SA",
  "WA",
  "TAS",
  "NT",
  "ACT",
];
