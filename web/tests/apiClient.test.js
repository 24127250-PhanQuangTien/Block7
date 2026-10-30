import test from "node:test";
import assert from "node:assert/strict";
import { apiRequest } from "../src/apiClient.js";

test("Server diagnostics are never forwarded to the interface", async (context) =>
{
  context.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({
    message: "PostgreSQL Prisma API error. Check backend server logs.",
    stack: "private stack trace",
  }), { status: 500, headers: { "Content-Type": "application/json" } }));
  await assert.rejects(apiRequest("/dishes"), (error) =>
  {
    assert.equal(error.type, "HTTP_ERROR");
    assert.equal(error.status, 500);
    assert.equal(error.message, "Không thể hoàn tất yêu cầu lúc này. Vui lòng thử lại sau.");
    assert.doesNotMatch(error.message, /Prisma|PostgreSQL|API|backend|server|stack/i);
    return true;
  });
});

test("Useful validation messages and field errors remain available", async (context) =>
{
  context.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({
    ok: false,
    error: { code: "VALIDATION_FAILED", message: "Vui lòng chọn một đầu bếp.", fields: { chefId: "Chưa chọn đầu bếp." } },
  }), { status: 200, headers: { "Content-Type": "application/json" } }));
  await assert.rejects(apiRequest("/dishes"), (error) =>
  {
    assert.equal(error.message, "Vui lòng chọn một đầu bếp.");
    assert.equal(error.fields.chefId, "Chưa chọn đầu bếp.");
    return true;
  });
});
