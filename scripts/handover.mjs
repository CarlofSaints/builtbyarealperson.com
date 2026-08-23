#!/usr/bin/env node
/**
 * Prepare a client handover. Run inside the client's repo.
 *
 *   node path/to/handover.mjs "Mokoena Plumbing"
 *
 * The point of this is that the customer does nothing. They do not need a
 * GitHub account, they do not need to know what a repository is, and they will
 * never type a git command. They get one file that contains their entire
 * website, and a document that tells any developer how to use it.
 *
 * Git is distributed, which is what makes that possible: a bundle is not an
 * export or a snapshot, it is the repository. Someone can clone from it years
 * later, offline, with the full history, needing nothing of mine.
 *
 * It also checks the three things that quietly break a handover:
 *
 *   1. Secrets in the history. Handing over a repo with keys in it hands over
 *      the keys, and git history remembers files you deleted.
 *   2. A public repo. Fine for my own marketing site, not for a client's.
 *   3. Which remote the deploy is wired to — because hosting that is connected
 *      to MY repo means I handed over the hosting and quietly kept the tap.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const client = process.argv[2];
if (!client) {
  console.error('Usage: node handover.mjs "Client Name"');
  process.exit(1);
}

const OUT = resolve(process.cwd(), "handover");
const slug = client.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function git(args, { allowFail = false } = {}) {
  try {
    return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch (err) {
    if (allowFail) return "";
    throw err;
  }
}

function ok(msg) { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.log(`  ! ${msg}`); }
function bad(msg) { console.log(`  ✗ ${msg}`); }

if (!existsSync(".git")) {
  console.error("Not a git repository. Run this from inside the client's repo.");
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

console.log(`\nHandover for ${client}\n`);

/* -- 1. The bundle: the entire repository as one file --------------------- */
console.log("The code");
const stamp = git(["log", "-1", "--format=%cs"]) || "undated";
const bundlePath = join(OUT, `${slug}-website-${stamp}.bundle`);
git(["bundle", "create", bundlePath, "--all"]);
// Verify it rather than trusting it. A corrupt bundle handed over is worse
// than no bundle, because nobody finds out until they need it.
//
// spawnSync rather than the git() helper because `git bundle verify` writes
// its result to STDERR, not stdout. Reading stdout alone returns an empty
// string, which reads as failure on a bundle that is perfectly good.
const check = spawnSync("git", ["bundle", "verify", bundlePath], { encoding: "utf8" });
const verified = `${check.stdout || ""}${check.stderr || ""}`;
if (check.status === 0 && /is okay/i.test(verified)) {
  const commits = git(["rev-list", "--all", "--count"]);
  ok(`${bundlePath.replace(process.cwd(), ".")} — verified, ${commits} commits, full history`);
} else {
  bad("The bundle did not verify. Do not hand it over.");
  process.exitCode = 1;
}

/* -- 2. Secrets, including ones that were deleted later ------------------- */
console.log("\nSecrets");
const addedFiles = git(["log", "--all", "--diff-filter=A", "--name-only", "--pretty=format:"], { allowFail: true })
  .split("\n").map((l) => l.trim()).filter(Boolean);
const suspiciousNames = [...new Set(addedFiles)].filter(
  (f) => /(^|\/)\.env($|\.)|\.pem$|\.p12$|\.pfx$|(^|\/)id_rsa|secret|credential/i.test(f) && !/\.env\.example$/i.test(f),
);
if (suspiciousNames.length) {
  bad(`${suspiciousNames.length} secret-shaped file(s) EVER committed. Deleting them later did not remove them:`);
  suspiciousNames.forEach((f) => console.log(`      ${f}`));
} else {
  ok("No secret-shaped filenames anywhere in the history");
}

// Content patterns, across every commit still reachable. Bounded so this stays
// quick on a large repo; the filename check above is the one that catches most.
const PATTERNS = "sk-[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9+/=]{20,}|re_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|xox[baprs]-[A-Za-z0-9-]{10,}";
const revs = git(["rev-list", "--all", "--max-count=300"], { allowFail: true }).split("\n").filter(Boolean);
const hits = revs.length
  ? git(["grep", "-I", "-n", "-E", PATTERNS, ...revs], { allowFail: true })
  : "";
if (hits) {
  bad("Secret-shaped CONTENT found in the history:");
  hits.split("\n").slice(0, 12).forEach((l) => console.log(`      ${l.slice(0, 150)}`));
  process.exitCode = 1;
} else {
  ok(`No secret-shaped content in the last ${revs.length} commits`);
}

/* -- 3. Visibility and the deploy tap ------------------------------------ */
console.log("\nThe repository");
const remote = git(["remote", "get-url", "origin"], { allowFail: true });
if (remote) {
  ok(`origin: ${remote}`);
  const mine = /CarlofSaints|builtbyarealperson/i.test(remote);
  if (mine) {
    warn("This remote is on MY account. That is fine as the default — but the");
    warn("handover document must say so, and must say the hosting is fed from it.");
  }
} else {
  warn("No origin remote. The bundle is the only copy — make sure it is stored somewhere safe.");
}

let visibility = "";
try {
  visibility = execFileSync("gh", ["repo", "view", "--json", "visibility", "-q", ".visibility"], {
    encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch { /* gh not installed or not authenticated — not fatal */ }

if (visibility === "PUBLIC") {
  bad("THIS REPOSITORY IS PUBLIC. A client's site must not be. Make it private before handover.");
  process.exitCode = 1;
} else if (visibility) {
  ok(`Visibility: ${visibility.toLowerCase()}`);
} else {
  warn("Could not check visibility (gh CLI not available). Confirm by hand that it is private.");
}

/* -- 4. The rows to paste into HANDOVER.md -------------------------------- */
console.log("\n----- paste into HANDOVER.md -----\n");
console.log(`- **Repository:** \`${remote || "local only"}\``);
console.log(`- **Your copy of the code:** \`${slug}-website-${stamp}.bundle\` (in this pack)`);
console.log(`- **Deploys are triggered from:** \`${remote || "manual"}\`, branch \`${git(["rev-parse", "--abbrev-ref", "HEAD"], { allowFail: true }) || "main"}\``);
console.log(`- **To restore the whole site from the file:** \`git clone ${slug}-website-${stamp}.bundle mysite\``);
console.log("\n-----------------------------------\n");
