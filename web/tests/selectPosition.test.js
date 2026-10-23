import test from "node:test";
import assert from "node:assert/strict";
import { getSelectPosition } from "../src/utils/selectPosition.js";

const viewport = { left: 0, top: 0, width: 440, height: 956 };

test("Popup fits the mobile viewport and opens below when there is room", () =>
{
  const rect = { left: 41, top: 557, bottom: 601, width: 358 };
  const position = getSelectPosition(rect, viewport, 84, 142);
  assert.equal(position.top, 605);
  assert.equal(position.width, 358);
  assert.ok(position.left + position.width <= 432);
  assert.ok(position.top + Math.min(position.maxHeight, 142) <= 948);
});

test("Popup flips above, stays below the navbar and limits tall results", () =>
{
  const position = getSelectPosition({ left: 24, top: 910, bottom: 954, width: 392 }, viewport, 84, 700);
  assert.equal(position.top, 626);
  assert.equal(position.maxHeight, 280);
  assert.ok(position.top >= 92);
});

test("Visual viewport offsets, narrow screens and navbar clipping are respected", () =>
{
  const visual = { left: 20, top: 100, width: 250, height: 320 };
  const position = getSelectPosition({ left: 5, top: 200, bottom: 244, width: 400 }, visual, 160, 500);
  assert.equal(position.width, 234);
  assert.equal(position.left, 28);
  assert.ok(position.top >= 168);
  assert.ok(position.top + position.maxHeight <= 412);
  assert.equal(getSelectPosition({ left: 24, top: 0, bottom: 60, width: 300 }, viewport, 84, 140), null);
});
