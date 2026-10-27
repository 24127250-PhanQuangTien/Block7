require("dotenv").config();
const prisma = require("../src/prisma");
const { Prisma } = require("@prisma/client");

const SEED_MARKER = "[block7-seed:v1]";
const categories = [
  "Món Nước",
  "Món Khô",
  "Món Cơm",
  "Khai Vị",
  "Tráng Miệng",
  "Món Lẩu",
  "Món Nướng",
  "Đồ Uống",
];
const names = [
  "Phở Bò Tái",
  "Bún Chả Hà Nội",
  "Cơm Tấm Sườn",
  "Gỏi Cuốn Tôm",
  "Chè Hạt Sen",
  "Mì Quảng Gà",
  "Lẩu Nấm Thanh Vị",
  "Trà Sen Đá",
];
const prices = [0, 25000, 30000, 45000, 50000, 55000, 70000, 85000, 120000];
const deterministicCreatedAt = new Date("2026-01-01T00:00:00.000Z");

function normalizeName(value) {
  return value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const ingredientHints = [
  { dish: /\b(bo|beef)\b/, ingredient: /\b(bo|beef)\b/ },
  { dish: /\b(heo|suon|cha|pork)\b/, ingredient: /\b(heo|suon|cha|pork|thit)\b/ },
  { dish: /\b(ga|chicken)\b/, ingredient: /\b(ga|chicken)\b/ },
  { dish: /\b(tom|shrimp)\b/, ingredient: /\b(tom|shrimp)\b/ },
  { dish: /\b(cua|crab)\b/, ingredient: /\b(cua|crab)\b/ },
  { dish: /\b(ca|fish)\b/, ingredient: /\b(ca|fish)\b/ },
  { dish: /\b(nam|mushroom)\b/, ingredient: /\b(nam|mushroom)\b/ },
  { dish: /\b(sen|lotus)\b/, ingredient: /\b(sen|lotus)\b/ },
  { dish: /\b(com|gao|rice)\b/, ingredient: /\b(com|gao|rice)\b/ },
  { dish: /\b(pho|bun|mi|mien|hu tieu)\b/, ingredient: /\b(pho|bun|mi|mien|hu tieu)\b/ },
];

function chooseIngredients(dish, ingredients, index) {
  const normalizedDishName = normalizeName(dish.name);
  const selected = [];
  for (const hint of ingredientHints) {
    if (!hint.dish.test(normalizedDishName)) continue;
    for (const ingredient of ingredients) {
      if (hint.ingredient.test(normalizeName(ingredient.name)) && !selected.includes(ingredient.id)) {
        selected.push(ingredient.id);
        break;
      }
    }
  }

  const targetCount = Math.min(ingredients.length, 2 + (index % 5));
  selected.length = Math.min(selected.length, targetCount);
  for (let offset = 0; selected.length < targetCount; offset += 1) {
    const ingredient = ingredients[(index + offset) % ingredients.length];
    if (!selected.includes(ingredient.id)) selected.push(ingredient.id);
  }
  return selected;
}

async function main() {
  await prisma.dish.deleteMany({
    where: {
      OR: [
        { name: { startsWith: "B7 Seed " } },
        { description: { startsWith: SEED_MARKER } },
      ],
    },
  });

  const dishes = Array.from({ length: 1000 }, (_, index) => {
    const number = String(index + 1).padStart(4, "0");
    const baseName = names[index % names.length];
    return {
      name: `B7 Seed ${number} - ${baseName}`,
      description:
        index % 13 === 0
          ? null
          : `${SEED_MARKER} ${baseName} với rau thơm tươi, nước dùng đậm đà và hương vị truyền thống.`,
      category: categories[index % categories.length],
      price: prices[index % prices.length],
      available: index % 3 !== 0,
    };
  });

  dishes.push(
    {
      name: "100% Beef Burger",
      description: `${SEED_MARKER} Smoky patty layered with crisp lettuce and fresh basil.`,
      category: "Món Nướng",
      price: 0,
      available: false,
    },
    {
      name: "Pho_Special",
      description: `${SEED_MARKER} Phở đặc biệt với bánh phở mềm và nước dùng bò.`,
      category: "Món Nước",
      price: 55000,
      available: true,
    },
    {
      name: "Bun!Bo Hue",
      description: `${SEED_MARKER} Bún bò Huế cay thơm với sả và rau sống.`,
      category: "Món Nước",
      price: 55000,
      available: true,
    },
    {
      name: "Pho Bo Hue",
      description: `${SEED_MARKER} Phở bò Huế nấu cùng quế hồi thơm.`,
      category: "Món Nước",
      price: 55000,
      available: true,
    },
    {
      name: "Pho Bo Hanoi",
      description: `${SEED_MARKER} Phở bò Hà Nội với nước dùng trong và gừng nướng.`,
      category: "Món Nước",
      price: 55000,
      available: true,
    },
    {
      name: "Garden Bowl Fixture",
      description: `${SEED_MARKER} A smoky roasted bowl with fresh vegetables and basil.`,
      category: "Khai Vị",
      price: 30000,
      available: true,
    },
  );
  dishes.forEach((dish) => {
    dish.createdAt = deterministicCreatedAt;
  });
  await prisma.dish.createMany({ data: dishes });

  const [chefs, ingredients, allDishes] = await Promise.all([
    prisma.chef.findMany({ orderBy: { id: "asc" }, take: 4, select: { id: true, name: true } }),
    prisma.ingredient.findMany({ orderBy: { id: "asc" }, select: { id: true, name: true } }),
    prisma.dish.findMany({ orderBy: { id: "asc" }, select: { id: true, name: true } }),
  ]);
  if (chefs.length !== 4) {
    throw new Error(`Block 7 backfill requires 4 existing chefs; found ${chefs.length}.`);
  }
  if (ingredients.length === 0) {
    throw new Error("Block 7 backfill requires existing ingredients; none were found.");
  }

  const chefAssignments = allDishes.map((dish, index) => [
    dish.id,
    chefs[index % chefs.length].id,
  ]);
  const ingredientAssignments = allDishes.flatMap((dish, index) =>
    chooseIngredients(dish, ingredients, index).map((ingredientId) => [dish.id, ingredientId]),
  );
  const backfillOperations = [
    prisma.$executeRaw`
      UPDATE dishes AS dish
      SET "chefId" = assignment.chef_id
      FROM (VALUES ${Prisma.join(chefAssignments.map(([dishId, chefId]) => Prisma.sql`(${dishId}, ${chefId})`))})
        AS assignment(dish_id, chef_id)
      WHERE dish.id = assignment.dish_id
    `,
    prisma.$executeRaw`DELETE FROM "_DishToIngredient"`,
  ];
  const relationBatchSize = 500;
  for (let offset = 0; offset < ingredientAssignments.length; offset += relationBatchSize) {
    const batch = ingredientAssignments.slice(offset, offset + relationBatchSize);
    backfillOperations.push(prisma.$executeRaw`
      INSERT INTO "_DishToIngredient" ("A", "B")
      VALUES ${Prisma.join(batch.map(([dishId, ingredientId]) => Prisma.sql`(${dishId}, ${ingredientId})`))}
    `);
  }
  await prisma.$transaction(backfillOperations, { timeout: 30000 });

  const [{ count }] = await prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM dishes`;
  console.log(`Block 7 seed complete. SELECT count(*) = ${count}.`);
  const [withoutIngredients, withoutChef, chefCounts] = await Promise.all([
    prisma.dish.count({ where: { ingredients: { none: {} } } }),
    prisma.dish.count({ where: { chefId: null } }),
    prisma.dish.groupBy({ by: ["chefId"], _count: { _all: true }, orderBy: { chefId: "asc" } }),
  ]);
  console.log(`Dishes without ingredients: ${withoutIngredients}`);
  console.log(`Dishes without chef: ${withoutChef}`);
  for (const chef of chefs) {
    const chefCount = chefCounts.find((entry) => entry.chefId === chef.id)?._count._all || 0;
    console.log(`Dishes assigned to ${chef.name} (ID ${chef.id}): ${chefCount}`);
  }
  if (withoutIngredients !== 0 || withoutChef !== 0) {
    throw new Error("Block 7 backfill verification failed: every dish must have ingredients and one chef.");
  }
}

main()
  .catch((error) => {
    console.error("Block 7 seed failed.", { type: error.name, code: /^P\d{4}$/.test(error.code) ? error.code : undefined });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
