import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "AUD") {
  const localeMap: Record<string, string> = {
    AUD: "en-AU", USD: "en-US", NZD: "en-NZ", GBP: "en-GB",
    EUR: "en-IE", SEK: "sv-SE", DKK: "da-DK",
  };
  return new Intl.NumberFormat(localeMap[currency] || "en-AU", {
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
  "Performance": [
    "Characterisation",
    "Storytelling",
    "Audience Connection",
    "Stage Presence",
    "Emotional Arc",
    "Blocking",
    "Visual Unity",
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
  "Learning & Process": [
    "Repertoire Selection",
    "Rehearsal Methods",
    "Contest Preparation",
    "Goal Setting",
    "Deliberate Practice",
    "Feedback Loops",
    "Culture Development",
  ],
  "Coaching Activities": [
    "Workshops & Classes",
    "Arranger Circle",
    "PVIs",
    "Director Coaching",
    "Riser Placement",
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
  "Quartet",
  "Chorus",
];

export const VOICE_RANGES = [
  "Upper Range",
  "Mixed Range",
  "Lower Range",
];

export const SESSION_TYPES = [
  { value: "hourly", label: "Hourly Session" },
  { value: "half_day", label: "Half Day (4 hours)" },
  { value: "full_day", label: "Full Day (8 hours)" },
];

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  regions: string[];
  regionLabel: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "AU",
    name: "Australia",
    currency: "AUD",
    regionLabel: "State",
    regions: ["NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"],
  },
  {
    code: "US",
    name: "United States",
    currency: "USD",
    regionLabel: "State",
    regions: ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"],
  },
  {
    code: "NZ",
    name: "New Zealand",
    currency: "NZD",
    regionLabel: "Region",
    regions: ["Auckland", "Bay of Plenty", "Canterbury", "Gisborne", "Hawke's Bay", "Manawatu-Whanganui", "Marlborough", "Nelson", "Northland", "Otago", "Southland", "Taranaki", "Tasman", "Waikato", "Wellington", "West Coast"],
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    regionLabel: "Region",
    regions: ["East Midlands", "East of England", "London", "North East", "North West", "Northern Ireland", "Scotland", "South East", "South West", "Wales", "West Midlands", "Yorkshire"],
  },
  {
    code: "SE",
    name: "Sweden",
    currency: "SEK",
    regionLabel: "Region",
    regions: ["Blekinge", "Dalarna", "Gävleborg", "Gotland", "Halland", "Jämtland", "Jönköping", "Kalmar", "Kronoberg", "Norrbotten", "Örebro", "Östergötland", "Skåne", "Södermanland", "Stockholm", "Uppsala", "Värmland", "Västerbotten", "Västernorrland", "Västmanland", "Västra Götaland"],
  },
  {
    code: "DK",
    name: "Denmark",
    currency: "DKK",
    regionLabel: "Region",
    regions: ["Capital Region", "Central Denmark", "North Denmark", "Region Zealand", "South Denmark"],
  },
  {
    code: "DE",
    name: "Germany",
    currency: "EUR",
    regionLabel: "State",
    regions: ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"],
  },
  {
    code: "IE",
    name: "Ireland",
    currency: "EUR",
    regionLabel: "County",
    regions: ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"],
  },
];

export const COUNTRY_NAMES = COUNTRIES.map(c => c.name);

export function getCountryConfig(countryName: string): CountryConfig | undefined {
  return COUNTRIES.find(c => c.name === countryName);
}

export function getRegionsForCountry(countryName: string): string[] {
  return getCountryConfig(countryName)?.regions || [];
}

export function getDefaultCurrency(countryName: string): string {
  return getCountryConfig(countryName)?.currency || "AUD";
}

export function getRegionLabel(countryName: string): string {
  return getCountryConfig(countryName)?.regionLabel || "State";
}

export const AUSTRALIAN_STATES = COUNTRIES.find(c => c.code === "AU")!.regions;
