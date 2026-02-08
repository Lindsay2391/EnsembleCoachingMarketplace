import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const COACH_SKILLS: Record<string, string[]> = {
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

function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${random}`;
}

async function main() {
  const client = await pool.connect();

  try {
    console.log("Seeding predefined skills...\n");

    const skillMap = new Map<string, string>();

    for (const [category, skills] of Object.entries(COACH_SKILLS)) {
      for (const name of skills) {
        const existing = await client.query(
          `SELECT id FROM "Skill" WHERE name = $1 AND category = $2`,
          [name, category]
        );

        let skillId: string;
        if (existing.rows.length > 0) {
          skillId = existing.rows[0].id;
          console.log(`  Exists: ${name} (${category})`);
        } else {
          skillId = generateCuid();
          await client.query(
            `INSERT INTO "Skill" (id, name, category, "isCustom", "createdAt") VALUES ($1, $2, $3, false, NOW())`,
            [skillId, name, category]
          );
          console.log(`  Created: ${name} (${category})`);
        }

        skillMap.set(name, skillId);
      }
    }

    console.log(`\n${skillMap.size} predefined skills ready.\n`);

    console.log("Migrating existing coach specialties to CoachSkill records...\n");

    const coaches = await client.query(
      `SELECT id, "fullName", specialties FROM "CoachProfile"`
    );

    let totalMigrated = 0;
    let totalSkipped = 0;

    for (const coach of coaches.rows) {
      let specialties: string[] = [];
      try {
        specialties = JSON.parse(coach.specialties || "[]");
      } catch {
        console.log(`  Skipping ${coach.fullName}: could not parse specialties`);
        continue;
      }

      if (!Array.isArray(specialties) || specialties.length === 0) {
        console.log(`  Skipping ${coach.fullName}: no specialties`);
        continue;
      }

      let order = 0;
      let migrated = 0;
      let skipped = 0;

      for (const skillName of specialties) {
        const skillId = skillMap.get(skillName);
        if (!skillId) {
          skipped++;
          continue;
        }

        const existingLink = await client.query(
          `SELECT id FROM "CoachSkill" WHERE "coachProfileId" = $1 AND "skillId" = $2`,
          [coach.id, skillId]
        );

        if (existingLink.rows.length > 0) {
          await client.query(
            `UPDATE "CoachSkill" SET "displayOrder" = $1 WHERE id = $2`,
            [order, existingLink.rows[0].id]
          );
        } else {
          const csId = generateCuid();
          await client.query(
            `INSERT INTO "CoachSkill" (id, "coachProfileId", "skillId", "displayOrder", "endorsementCount", "createdAt") VALUES ($1, $2, $3, $4, 0, NOW())`,
            [csId, coach.id, skillId, order]
          );
        }
        migrated++;
        order++;
      }

      console.log(`  ${coach.fullName}: ${migrated} skills migrated, ${skipped} skipped (no match)`);
      totalMigrated += migrated;
      totalSkipped += skipped;
    }

    console.log(`\nDone! ${totalMigrated} coach-skill links created, ${totalSkipped} old skills skipped.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
