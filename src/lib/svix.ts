/**
 * Verification for Svix-signed webhooks, which is what Resend sends.
 *
 * Done by hand rather than by pulling in the `svix` package: the scheme is
 * small, well specified, and the alternative is a dependency in the request
 * path of an endpoint whose entire job is to be trusted.
 *
 * The scheme:
 *   signedContent = "{svix-id}.{svix-timestamp}.{raw body}"
 *   secret        = base64-decode(everything after "whsec_")
 *   signature     = base64(HMAC-SHA256(secret, signedContent))
 *   header        = space-separated list of "v1,<signature>" — a list, because
 *                   during a secret rotation more than one is valid at once.
 *
 * Two things this must get right, and both are easy to get wrong:
 *
 *  - The body must be the EXACT bytes that were signed. Parsing the JSON and
 *    re-serialising it changes key order and whitespace, and every signature
 *    fails for reasons that look like a configuration problem.
 *  - Comparison is constant time. A fast string compare on a signature leaks
 *    it a byte at a time.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/** Reject anything older than this. Blocks replay of a captured request. */
const TOLERANCE_SECONDS = 5 * 60;

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: string };

function constantTimeEquals(a: string, b: string): boolean {
  // Hash both sides first: timingSafeEqual throws when the lengths differ, and
  // the throw itself would leak the length.
  const ha = createHmac("sha256", "compare").update(a).digest();
  const hb = createHmac("sha256", "compare").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifySvixSignature(opts: {
  /** The raw request body, exactly as received. Not a re-serialised object. */
  body: string;
  id: string | null;
  timestamp: string | null;
  signature: string | null;
  /** The signing secret from the provider, with or without the whsec_ prefix. */
  secret: string;
  now?: Date;
}): VerifyResult {
  const { body, id, timestamp, signature, secret } = opts;
  const now = opts.now ?? new Date();

  if (!id || !timestamp || !signature) {
    return { ok: false, reason: "missing svix-id, svix-timestamp or svix-signature header" };
  }

  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt)) return { ok: false, reason: "svix-timestamp is not a number" };

  const driftSeconds = Math.abs(now.getTime() / 1000 - sentAt);
  if (driftSeconds > TOLERANCE_SECONDS) {
    return { ok: false, reason: `timestamp is ${Math.round(driftSeconds)}s away from now` };
  }

  let key: Buffer;
  try {
    key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  } catch {
    return { ok: false, reason: "signing secret is not valid base64" };
  }
  if (key.length === 0) return { ok: false, reason: "signing secret decoded to nothing" };

  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");

  // The header carries one or more "v1,<sig>" pairs. Any match is a pass.
  const candidates = signature
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("v1,"))
    .map((part) => part.slice(3));

  if (candidates.length === 0) return { ok: false, reason: "no v1 signature in svix-signature" };
  if (!candidates.some((candidate) => constantTimeEquals(candidate, expected))) {
    return { ok: false, reason: "signature does not match" };
  }

  return { ok: true };
}
