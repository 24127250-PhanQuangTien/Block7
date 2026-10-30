import test from "node:test";
import assert from "node:assert/strict";
import { buildDishSearchParams, filterChefNames, filterChefs, filterIngredientNames, normalizeSearch } from "../src/utils/search.js";

const chefs = [
  { id: 7, name: "Đặng Văn Đạt", specialty: "Hải sản và món nướng" },
  { id: 42, name: "Nguyễn Thị Ánh", specialty: "Ẩm thực Huế truyền thống" },
  { id: 99, name: "Trần Bình", specialty: null },
];

test("Client chef search uses names, ignores Vietnamese accents and leaves source data intact", () =>
{
  assert.deepEqual(filterChefNames(chefs, "dang van dat"), [chefs[0]]);
  assert.deepEqual(filterChefNames(chefs, "HẢI SẢN"), []);
  assert.deepEqual(filterChefNames(chefs, ""), chefs);
  assert.equal(chefs.length, 3);
});

test("Client ingredient search combines typo-tolerant names with category and unit filters", () =>
{
  const ingredients = [
    { id: 3, name: "Thịt ba chỉ heo", category: "Thịt", unit: "kg" },
    { id: 2, name: "Bánh hỏi heo quay", category: "Khác", unit: "gam" },
    { id: 1, name: "Thịt thăn bò Úc", category: "Thịt", unit: "kg" },
  ];
  assert.deepEqual(filterIngredientNames(ingredients, { q: "thit than bo uc" }), [ingredients[2]]);
  assert.deepEqual(filterIngredientNames(ingredients, { q: "banh qauy" }), [ingredients[1]]);
  assert.deepEqual(filterIngredientNames(ingredients, { q: "banh heo" }), [ingredients[1]]);
  assert.deepEqual(filterIngredientNames(ingredients, { q: "banh hoe" }), []);
  assert.deepEqual(filterIngredientNames(ingredients, { q: "thit", category: "THIT", unit: "KG" }), [ingredients[2], ingredients[0]]);
  assert.deepEqual(filterIngredientNames(ingredients, { q: "thit", unit: "gam" }), []);
  assert.deepEqual(filterIngredientNames(ingredients, { q: "!!!" }), []);
  assert.deepEqual(ingredients.map((item) => item.id), [3, 2, 1]);
});

test("Vietnamese search normalizes case, accents, đ and combining marks", () =>
{
  assert.equal(normalizeSearch("  ĐẦU BẾP PHỤ TRÁCH  "), "dau bep phu trach");
  assert.equal(normalizeSearch("ă â ê ô ơ ư đ ắ ễ ộ ự"), "a a e o o u d a e o u");
  assert.equal(normalizeSearch("Đặng".normalize("NFD")), "dang");
});

test("Dish search combines the fixed text rule with every advanced filter and keeps zero/false", () =>
{
  const params = new URLSearchParams("mode=basic&q=Pho&category=Món+Nước&minPrice=0&maxPrice=100000&available=false&page=3&pageSize=20");
  for (const match of ["fuzzy", "fulltext"])
  {
    assert.deepEqual(buildDishSearchParams(params, match), {
      mode: "advanced", match, q: "Pho", category: "Món Nước", minPrice: "0", maxPrice: "100000",
      available: "false", page: "3", pageSize: "20", sort: "id_asc",
    });
  }
  assert.equal(buildDishSearchParams(params, "fulltext", 1).page, 1);
  assert.equal(buildDishSearchParams(new URLSearchParams("status=unavailable"), "fuzzy").available, "false");
  assert.equal(buildDishSearchParams(new URLSearchParams("q=+&minPrice="), "fuzzy").q, undefined);
});

test("Chef search matches names and specialties without changing ids or data", () =>
{
  for (const query of ["ĐẶNG", "dang", "hai san", "NƯỚNG", "dat hai"])
  {
    assert.deepEqual(filterChefs(chefs, query), [chefs[0]]);
  }
  assert.deepEqual(filterChefs(chefs, "am thuc hue"), [chefs[1]]);
  assert.deepEqual(filterChefs(chefs, " "), chefs);
  assert.deepEqual(filterChefs(chefs, "không tồn tại"), []);
  assert.equal(filterChefs(chefs, "binh")[0].id, 99);
});
