import { isSignedIn } from "@/lib/admin-auth";
import { readProspect, readProspectScreenshot } from "@/lib/prospects";
import { prospectIntroEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Exactly what the prospect will receive, for a look before pressing send.
 * The screenshot is inlined as a data URL here; in the real email it is a cid: attachment.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isSignedIn())) return new Response("Signed out.", { status: 401 });

  const { id } = await ctx.params;
  const p = await readProspect(id);
  if (!p) return new Response("Not found.", { status: 404 });
  const shot = await readProspectScreenshot(id);
  const src = shot ? `data:${p.screenshotType};base64,${shot.toString("base64")}` : "";

  const email = prospectIntroEmail(p, src);
  const top = `<div style="font:14px system-ui,sans-serif;padding:12px 16px;background:#fff8d6;border-bottom:1px solid #e6d77a;">
<strong>Preview only, nothing sent.</strong> To: ${p.email.replace(/</g, "&lt;")}<br>Subject: ${email.subject.replace(/</g, "&lt;")}</div>`;

  return new Response(top + email.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
