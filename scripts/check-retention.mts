// Run: node --experimental-strip-types scripts/check-retention.mts
import assert from "node:assert/strict";
import { classifyLead, prospectIsDue, retentionCutoff } from "../src/lib/retention.ts";

const cutoff = retentionCutoff(new Date("2026-11-09T05:30:00Z"));
assert.equal(cutoff.toISOString(), "2025-11-09T05:30:00.000Z");

const OLD = "2025-11-09T05:29:59Z";
const lead = (extra: object) => ({ createdAt: OLD, ...extra }) as never;
const prospect = (extra: object) => ({ createdAt: OLD, ...extra }) as never;

assert.equal(classifyLead(lead({}), cutoff), "due", "untouched old lead");
assert.equal(classifyLead(lead({ createdAt: cutoff.toISOString() }), cutoff), null, "exactly 12 months is not past it");
assert.equal(classifyLead(lead({ status: "lost" }), cutoff), "due");
assert.equal(classifyLead(lead({ statusChangedAt: "2026-06-01T00:00:00Z" }), cutoff), null, "recent activity restarts the clock");
assert.equal(classifyLead(lead({ createdAt: "garbage" }), cutoff), null, "bad date is kept");

for (const status of ["quote-accepted", "in-progress", "client-review", "iterating", "complete", "renamed-stage"]) {
  assert.equal(classifyLead(lead({ status }), cutoff), "projectKept", status);
}
const kept = [
  { status: "lost", statusHistory: [{ from: "quote-accepted", to: "lost", at: OLD }] },
  { takeOn: {} },
  { review: {} },
  { changes: [{}] },
  { waitingOn: [{}] },
];
for (const extra of kept) assert.equal(classifyLead(lead(extra), cutoff), "projectKept", JSON.stringify(extra));

assert.equal(prospectIsDue(prospect({}), cutoff), true);
assert.equal(prospectIsDue(prospect({ createdAt: cutoff.toISOString() }), cutoff), false);
assert.equal(prospectIsDue(prospect({ intro: { sentAt: "2026-06-01T00:00:00Z" } }), cutoff), false, "emailed recently");
assert.equal(prospectIsDue(prospect({ createdAt: "garbage" }), cutoff), false, "bad date is kept");
console.log("retention: all checks pass");
