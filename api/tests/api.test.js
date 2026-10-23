const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/prisma");

test.after(async () => {
  await prisma.$disconnect();
});

test("1. CORS Headers: Response phải có Access-Control-Allow-Origin đúng origin của SPA", async () => {
  const res = await request(app).get("/api/dishes");
  assert.equal(res.headers["access-control-allow-origin"], "http://localhost:5173");
});

test("2. CORS Preflight: OPTIONS request phải trả về 204 kèm các headers cho phép", async () => {
  const res = await request(app)
    .options("/api/dishes/1")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "PATCH");

  assert.equal(res.status, 204);
  assert.equal(res.headers["access-control-allow-origin"], "http://localhost:5173");
  assert.match(res.headers["access-control-allow-methods"], /PATCH/);
});

test("3. Lỗi Kỹ thuật 404: Gọi sai URL route phải trả về HTTP 404 và KHÔNG có trường ok", async () => {
  const res = await request(app).get("/api/bok");
  assert.equal(res.status, 404);
  assert.equal(res.body.ok, undefined);
  assert.equal(res.body.statusCode, 404);
});

test("4. GET /api/dishes: Trả về danh sách món ăn với status 200 và response shape { ok: true, data }", async () => {
  const res = await request(app).get("/api/dishes");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.ok(Array.isArray(res.body.data));
});

test("5. GET /api/dishes/:id (Không tồn tại): Trả về status 200 và lỗi nghiệp vụ NOT_FOUND", async () => {
  const res = await request(app).get("/api/dishes/9999999");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, false);
  assert.equal(res.body.error.code, "NOT_FOUND");
});

test("6. GET /api/dishes/:id (ID sai định dạng chữ): Xử lý như không tồn tại (status 200, NOT_FOUND)", async () => {
  const res = await request(app).get("/api/dishes/abc_not_an_id");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, false);
  assert.equal(res.body.error.code, "NOT_FOUND");
});

test("7. POST /api/dishes (Dữ liệu không hợp lệ): Trả về status 200 và lỗi nghiệp vụ VALIDATION_FAILED kèm fields", async () => {
  const res = await request(app)
    .post("/api/dishes")
    .send({ name: "", price: -100 });

  assert.equal(res.status, 200);
  assert.equal(res.body.ok, false);
  assert.equal(res.body.error.code, "VALIDATION_FAILED");
  assert.ok(res.body.error.fields.name);
  assert.ok(res.body.error.fields.price);
});

test("8. GET /api/chefs: Trả về status 200 và response shape { ok: true, data }", async () => {
  const res = await request(app).get("/api/chefs");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.ok(Array.isArray(res.body.data));
});

test("9. GET /api/ingredients: Trả về status 200 và response shape { ok: true, data }", async () => {
  const res = await request(app).get("/api/ingredients");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.ok(Array.isArray(res.body.data));
});
