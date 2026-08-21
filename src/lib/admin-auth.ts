/**
 * Admin authentication. One operator, one password, one signed cookie.
 *
 * Design notes worth not re-deriving:
 *
 *  - The session cookie is SIGNED (HMAC-SHA256 over the payload). A cookie that
 *    merely says `admin=1` is forgeable by anyone who can type into devtools,
 *    which is not authentication at all.
 *  - The signature covers an expiry, so an old cookie cannot be replayed for
 *    ever, and it covers a hash of the current password, so CHANGING
 *    `ADMIN_PASSWORD` immediately invalidates every session that was minted
 *    with the old one.
 *  - The password is compared in constant time. A plain `===` on a secret leaks
 *    its length and prefix through timing.
 *  - Every entry point calls `requireAdmin()` itself. There is deliberately no
 *    "public paths" list matched by prefix: `startsWith("/admin/login")` is the
 *    kind of rule that quietly exempts `/admin/login-anything-else`.
 */

// No `import "server-only"` here: that package is not a dependency of this
// project. The `next/headers` import below gives the same protection anyway —
// Next refuses to build if a Client Component reaches this file.
import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "brp_admin";
const SESSION_DAYS = 14;

type ConfigProblem = "no-password" | "no-secret" | "weak-password";

/**
 * What is missing, if anything. Returned rather than thrown so the login page
 * can say precisely which environment variable to set instead of failing with
 * a blank "something went wrong".
 */
export function adminConfigProblem(): ConfigProblem | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return "no-password";
  if (password.length < 12) return "weak-password";
  if (!process.env.ADMIN_SESSION_SECRET) return "no-secret";
  return null;
}

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not set");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** A fingerprint of the current password, so rotating it kills live sessions. */
function passwordFingerprint(): string {
  return createHmac("sha256", secret())
    .update(process.env.ADMIN_PASSWORD ?? "")
    .digest("base64url")
    .slice(0, 16);
}

function safeEqual(a: string, b: string): boolean {
  // Hash both sides first: timingSafeEqual throws on a length mismatch, and the
  // throw itself would leak the length of the secret.
  const ha = createHmac("sha256", "compare").update(a).digest();
  const hb = createHmac("sha256", "compare").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(attempt: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(attempt, expected);
}

function mintToken(now: Date): string {
  const payload = [
    "v1",
    String(now.getTime() + SESSION_DAYS * 86_400_000),
    passwordFingerprint(),
    randomBytes(9).toString("base64url"),
  ].join(".");
  return `${payload}.${sign(payload)}`;
}

function tokenIsValid(token: string, now: Date): boolean {
  const parts = token.split(".");
  if (parts.length !== 5) return false;
  const [version, expiry, fingerprint] = parts;
  const payload = parts.slice(0, 4).join(".");
  const signature = parts[4];

  if (version !== "v1") return false;
  if (!safeEqual(signature, sign(payload))) return false;
  if (fingerprint !== passwordFingerprint()) return false;

  const expiresAt = Number(expiry);
  if (!Number.isFinite(expiresAt) || expiresAt <= now.getTime()) return false;

  return true;
}

export async function startSession(now: Date): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, mintToken(now), {
    httpOnly: true,
    // Secure everywhere except a plain-HTTP localhost, where it would mean the
    // cookie is set and then never sent back and login would silently loop.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isSignedIn(now: Date = new Date()): Promise<boolean> {
  if (adminConfigProblem()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    return tokenIsValid(token, now);
  } catch {
    return false;
  }
}

/**
 * Call this at the top of every admin page, server action and route handler.
 *
 * Rendering a page only when signed in is not a security boundary — a server
 * action is a public POST endpoint whether or not the form that calls it was
 * ever rendered.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isSignedIn())) {
    throw new Error("Not signed in");
  }
}
