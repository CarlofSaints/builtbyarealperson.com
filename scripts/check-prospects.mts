// Run: node --experimental-strip-types scripts/check-prospects.mts
import assert from "node:assert/strict";
import { makeProspectId, PROSPECT_ID, withBanner, previewBanner, isExpired } from "../src/lib/prospects.ts";

const id = makeProspectId("Joe's Plumbing & Sons (Pty) Ltd");
assert.match(id, /^joe-s-plumbing-sons-pty-ltd-[0-9a-f]{8}$/);
assert.ok(PROSPECT_ID.test(id));
assert.ok(PROSPECT_ID.test(makeProspectId("!!!")), "empty slug falls back");
assert.ok(PROSPECT_ID.test(makeProspectId("x".repeat(200))), "long names are cut");
assert.ok(!PROSPECT_ID.test("../leads/BRP-2611-AAAAAA"), "no path tricks");

const p = { id, business: "<Joe>", expiresAt: "2030-01-01T00:00:00Z" } as never;
const b = previewBanner(p, "https://builtbyarealperson.com");
assert.ok(b.includes("&lt;Joe&gt;") && !b.includes("<Joe>"), "business name escaped");
assert.equal(withBanner('<html><body class="x"><h1>Hi</h1>', "[B]"), '<html><body class="x">[B]<h1>Hi</h1>');
assert.equal(withBanner("<h1>Hi</h1>", "[B]"), "[B]<h1>Hi</h1>");
assert.ok(isExpired({ expiresAt: "2020-01-01T00:00:00Z" } as never));
console.log("prospects: all checks pass");
