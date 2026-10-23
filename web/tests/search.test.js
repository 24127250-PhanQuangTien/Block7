import test from "node:test";
import assert from "node:assert/strict";
import { filterChefs, normalizeSearch } from "../src/utils/search.js";

const chefs = [
  { id: 7, name: "Đặng Văn Đạt", specialty: "Hải sản và món nướng" },
  { id: 42, name: "Nguyễn Thị Ánh", specialty: "Ẩm thực Huế truyền thống" },
  { id: 99, name: "Trần Bình", specialty: null },
];

test("Vietnamese search normalizes case, accents, đ and combining marks", () =>
{
  assert.equal(normalizeSearch("  ĐẦU BẾP PHỤ TRÁCH  "), "dau bep phu trach");
  assert.equal(normalizeSearch("ă â ê ô ơ ư đ ắ ễ ộ ự"), "a a e o o u d a e o u");
  assert.equal(normalizeSearch("Đặng".normalize("NFD")), "dang");
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
