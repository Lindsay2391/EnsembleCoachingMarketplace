import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ALL_SKILLS: Record<string, string[]> = {
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

const FLAT_SKILLS = Object.values(ALL_SKILLS).flat();

const ENSEMBLE_TYPES = ["Chorus", "Quartet"];
const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];

const STATE_CITIES: Record<string, string[]> = {
  NSW: ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Parramatta"],
  VIC: ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Frankston"],
  QLD: ["Brisbane", "Gold Coast", "Sunshine Coast", "Cairns", "Townsville"],
  SA: ["Adelaide", "Mount Gambier", "Victor Harbor"],
  WA: ["Perth", "Fremantle", "Mandurah", "Bunbury"],
  TAS: ["Hobart", "Launceston", "Devonport"],
  NT: ["Darwin", "Alice Springs"],
  ACT: ["Canberra", "Belconnen", "Woden"],
};

const STATES = Object.keys(STATE_CITIES);

function pick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${random}`;
}

const COACHES = [
  { name: "Sarah Mitchell", bio: "Experienced barbershop coach with over 15 years of working with choruses and quartets across Australia. Passionate about helping groups find their unique sound and achieve their competition goals." },
  { name: "David Chen", bio: "Vocal technique specialist with a background in classical and contemporary a cappella. Focused on building strong vocal foundations and healthy singing habits for ensembles of all levels." },
  { name: "Emma Fitzgerald", bio: "Performance coach and choreographer who brings energy and creativity to every session. Specialising in stage presence, visual performance, and helping groups connect with their audience." },
  { name: "James O'Brien", bio: "Contest preparation expert and certified BHA judge. Helping groups understand the scorecard, refine their performance package, and peak at the right time for competition." },
  { name: "Priya Sharma", bio: "Harmony and tuning specialist with a deep understanding of just intonation and chord locking. Dedicated to helping ensembles achieve that ringing, locked-in sound." },
  { name: "Tom Henderson", bio: "All-round barbershop coach with a focus on musicality and phrasing. Working with groups to develop expressive, dynamic performances that tell a story." },
  { name: "Lisa Nguyen", bio: "Experienced chorus director and coach specialising in group dynamics, learning processes, and building strong ensemble culture. Helping groups work smarter, not just harder." },
  { name: "Michael Wright", bio: "Quartet coaching specialist with a keen ear for blend and balance. Focused on helping small ensembles develop their unique voice and maximise their musical potential." },
  { name: "Rachel Thompson", bio: "Movement and choreography coach bringing a fresh perspective to visual performance. Working with groups to create polished, unified stage presentations that enhance the music." },
  { name: "Andrew Patel", bio: "Vocal health and technique coach with a background in speech pathology. Specialising in sustainable singing practices and helping singers overcome vocal challenges." },
  { name: "Catherine Lee", bio: "Passionate about developing the next generation of ensemble singers. Specialising in learning design, practice planning, and helping groups at the beginner and intermediate level grow." },
  { name: "Ben Morrison", bio: "High-energy performance coach focused on stage presence, storytelling, and audience engagement. Helping groups transform good singing into unforgettable performances." },
  { name: "Sophie Williams", bio: "Experienced competition coach with multiple gold medals as a performer. Bringing scorecard expertise and a practical, encouraging coaching style to every session." },
  { name: "Daniel Kim", bio: "Tuning and arranging specialist who helps ensembles understand the mechanics of great harmony. Patient, methodical approach to building pitch accuracy from the ground up." },
  { name: "Olivia Foster", bio: "Dynamic coach with expertise across vocal technique, performance, and choreography. Known for creative, high-energy sessions that leave groups feeling inspired and motivated." },
  { name: "Peter Campbell", bio: "Veteran barbershop coach with decades of experience at all levels. Specialising in repertoire selection, contest strategy, and developing a group's long-term musical identity." },
  { name: "Amanda Clarke", bio: "Breath support and resonance specialist helping singers find their full vocal potential. Combining modern vocal pedagogy with practical, ensemble-focused techniques." },
  { name: "Ryan Taylor", bio: "Young, enthusiastic coach specialising in contemporary a cappella and barbershop crossover styles. Bringing fresh ideas and modern approaches to ensemble coaching." },
  { name: "Jessica Brown", bio: "Leadership and culture coach helping ensembles build strong foundations beyond the music. Focused on communication, accountability, and creating a positive group environment." },
  { name: "Mark Sullivan", bio: "Experienced coach and arranger with a focus on musicality, dynamics, and emotional storytelling. Helping groups deliver performances that move audiences and judges alike." },
];

async function main() {
  const client = await pool.connect();

  try {
    console.log("Seeding predefined skills...\n");

    const skillMap = new Map<string, string>();

    for (const [category, skills] of Object.entries(ALL_SKILLS)) {
      for (const name of skills) {
        const existing = await client.query(
          `SELECT id FROM "Skill" WHERE name = $1 AND category = $2`,
          [name, category]
        );

        let skillId: string;
        if (existing.rows.length > 0) {
          skillId = existing.rows[0].id;
        } else {
          skillId = generateCuid();
          await client.query(
            `INSERT INTO "Skill" (id, name, category, "isCustom", "createdAt") VALUES ($1, $2, $3, false, NOW())`,
            [skillId, name, category]
          );
        }
        skillMap.set(name, skillId);
      }
    }

    console.log(`${skillMap.size} predefined skills seeded.\n`);

    console.log("Seeding 20 fictional coaches...\n");

    const passwordHash = await bcrypt.hash("CoachPass123!", 10);

    for (let i = 0; i < COACHES.length; i++) {
      const coach = COACHES[i];
      const state = STATES[i % STATES.length];
      const cities = STATE_CITIES[state];
      const city = cities[randomInt(0, cities.length - 1)];

      const skillCount = randomInt(5, 12);
      const selectedSkillNames = pick(FLAT_SKILLS, skillCount);
      const ensembleTypes = pick(ENSEMBLE_TYPES, randomInt(1, 3));
      const expLevels = pick(EXPERIENCE_LEVELS, randomInt(1, 3));
      const rateHourly = randomInt(80, 250);
      const rateHalfDay = Math.round(rateHourly * 3.5);
      const rateFullDay = Math.round(rateHourly * 6.5);

      const email = coach.name.toLowerCase().replace(/[^a-z]/g, ".").replace(/\.+/g, ".") + "@example.com";

      const userId = generateCuid();
      await client.query(
        `INSERT INTO "User" (id, email, "passwordHash", name, "userType", "emailVerified", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'coach', true, NOW(), NOW())`,
        [userId, email, passwordHash, coach.name]
      );

      const coachId = generateCuid();
      const rating = parseFloat((randomInt(35, 50) / 10).toFixed(1));
      const totalReviews = randomInt(0, 25);

      await client.query(
        `INSERT INTO "CoachProfile" (id, "userId", "fullName", city, state, bio, specialties, "ensembleTypes", "experienceLevels",
          "rateHourly", "rateHalfDay", "rateFullDay", approved, verified, rating, "totalReviews", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, $13, $14, $15, NOW(), NOW())`,
        [
          coachId, userId, coach.name, city, state, coach.bio,
          JSON.stringify(selectedSkillNames),
          JSON.stringify(ensembleTypes),
          JSON.stringify(expLevels),
          rateHourly, rateHalfDay, rateFullDay,
          randomInt(0, 1) === 1,
          rating, totalReviews,
        ]
      );

      for (let j = 0; j < selectedSkillNames.length; j++) {
        const skillId = skillMap.get(selectedSkillNames[j]);
        if (skillId) {
          const csId = generateCuid();
          await client.query(
            `INSERT INTO "CoachSkill" (id, "coachProfileId", "skillId", "displayOrder", "endorsementCount", "createdAt")
             VALUES ($1, $2, $3, $4, 0, NOW())`,
            [csId, coachId, skillId, j]
          );
        }
      }

      console.log(`  Created: ${coach.name} — ${city}, ${state} — ${selectedSkillNames.length} skills`);
    }

    console.log("\nDone! 20 coaches seeded successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
