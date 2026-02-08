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

export const SPECIALTIES = [
  "Barbershop Style",
  "Contest Prep",
  "Vocal Technique",
  "Tuning & Harmony",
  "Performance & Interpretation",
  "Choreography",
  "Leadership & Culture",
];

export const COACH_SKILLS: Record<string, string[]> = {
  "Style & Contest": [
    "Barbershop Style",
    "Scorecard Strategy",
    "Contest Prep",
    "Swing Feel",
    "Musicality",
    "Phrasing",
    "Dynamics",
    "Repertoire Curation",
  ],
  "Vocal Technique": [
    "Resonance",
    "Breath Support",
    "Registration",
    "Stamina",
    "Vocal Health",
    "Tone Matching",
    "Blend",
    "Vibrato Control",
    "Articulation",
    "Warmups",
  ],
  "Tuning & Harmony": [
    "Just Intonation",
    "Chord Locking",
    "Pitch Accuracy",
    "Interval Tuning",
    "Balance",
    "Lead Support",
    "Listening Skills",
    "Vertical Tuning",
    "Ensemble Timing",
    "Pitch Correction",
  ],
  "Performance & Interpretation": [
    "Performance Energy",
    "Stage Presence",
    "Storytelling",
    "Character Work",
    "Emotional Arc",
    "Micro-Expressions",
    "Audience Connection",
    "Interpretation",
  ],
  "Visual & Choreography": [
    "Choreography",
    "Stagecraft",
    "Blocking",
    "Movement Cleanup",
    "Visual Unity",
    "Body Alignment",
  ],
  "Learning & Process": [
    "Learning Design",
    "Sectionals",
    "Memorization",
    "Practice Planning",
    "Goal Setting",
  ],
  "Leadership & Culture": [
    "Group Dynamics",
    "Communication",
    "Accountability",
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
  "Elite/Competition",
];

export const ENSEMBLE_TYPES = [
  "Chorus",
  "Quartet",
  "Octet",
  "A Cappella Group",
  "Chamber Ensemble",
  "Other",
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
