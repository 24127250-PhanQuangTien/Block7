require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Prisma } = require("@prisma/client");
const prisma = require("../src/prisma");

async function main() {
  const migrationPath = path.join(__dirname, "migrations", "20261026000000_block7_search", "migration.sql");
  const statements = fs
    .readFileSync(migrationPath, "utf8")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await prisma.$executeRaw(Prisma.raw(statement));
  }
  console.log(`Block 7 migration applied (${statements.length} idempotent statements).`);
}

main()
  .catch((error) => {
    console.error("Block 7 migration failed.", {
      type: error.name,
      code: /^P\d{4}$/.test(error.code) ? error.code : undefined,
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
