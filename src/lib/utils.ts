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
  "Barbershop",
  "Classical/Choral",
  "Jazz",
  "Contemporary A Cappella",
  "Musical Theatre",
  "Gospel",
  "Folk",
  "Pop/Rock",
  "World Music",
  "Vocal Pedagogy",
  "Performance Coaching",
  "Contest Preparation",
  "Choreography/Staging",
  "Music Theory",
  "Sight Reading",
  "Vocal Health",
];

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
