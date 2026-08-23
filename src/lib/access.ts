/**
 * Unguessable links, used instead of asking a customer to log in.
 *
 * A password is a barrier: a plumber will not remember one to report a typo,
 * and a portal nobody opens is worse than no portal. So the link IS the
 * credential. This is the same pattern as a password reset email, a Calendly
 * invitation or a shared document, and like those, it lives or dies on
 * entropy.
 *
 * WHY NOT THE REFERENCE. The lead reference is four characters from a 26 letter
 * alphabet behind a predictable prefix: about 457,000 possibilities, walkable by
 * a script in minutes. Fine as a human-readable label to quote in an email.
 * Useless as a secret. These tokens are 32 random bytes, which is not walkable
 * by anything.
 *
 * WHAT THIS MEANS FOR THE PAGE. A link in an email gets forwarded, screenshotted
 * and left in browser history. So a page behind one of these may show progress,
 * change requests and what is waiting on the customer. It may never show
 * credentials, bank details, or anything that would matter in a stranger's
 * hands.
 *
 * NO CLOCK EXPIRY. A link that dies on a timer sends the customer back to email,
 * which is the thing it exists to avoid. Access is revoked by ME rotating the
 * token, and the page decides what to show based on where the project is.
 */

import { randomBytes, timingSafeEqual, createHash } from "node:crypto";

/** 32 bytes. Long enough that guessing is not a threat model. */
export function makeAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Loose enough to accept any token we would ever mint, tight enough for a path. */
export function looksLikeToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{32,64}$/.test(value);
}

/**
 * Never log a whole token: logs get pasted into chats and support tickets, and
 * a token in a log is a working link in a log. Eight characters is plenty to
 * match one request to another.
 */
export function tokenFingerprint(token: string): string {
  return createHash("sha256").update(token).digest("base64url").slice(0, 8);
}

export function tokensMatch(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
