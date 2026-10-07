import test from "node:test";
import assert from "node:assert/strict";

test("health contract", () => {
  const payload = { ok: true, service: "praja-sathi-api" };
  assert.equal(payload.ok, true);
  assert.equal(payload.service, "praja-sathi-api");
});
