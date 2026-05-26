import { seedDatabase } from "../lib/db/seed";

const force = process.argv.includes("--force");

const counts = seedDatabase({ force });

const seeded = Object.entries(counts).filter(([, count]) => count > 0);

if (seeded.length === 0) {
  console.log("Database already seeded. Use --force to reset and re-seed.");
} else {
  for (const [table, count] of seeded) {
    console.log(`Seeded ${count} ${table}`);
  }
}

console.log("Done.");
