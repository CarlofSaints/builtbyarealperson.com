import { isExpired, previewBanner, readProspect, readProspectHtml, withBanner } from "@/lib/prospects";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * A mock-up of someone else's site, on our domain.
 *
 * `sandbox` gives the page an opaque origin: whatever is in the mock-up runs
 * as a stranger to builtbyarealperson.com, so it can never ride the admin
 * session cookie into a server action. noindex because it is not ours to rank.
 */
const HEADERS = {
  "Content-Security-Policy": "sandbox allow-scripts allow-popups allow-popups-to-escape-sandbox",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function plain(status: number, heading: string, text: string): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading}</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1.5rem;color:#0b1220;"><h1>${heading}</h1><p>${text}</p><p><a href="${SITE.url}">${SITE.name}</a></p></body></html>`;
  return new Response(html, { status, headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const prospect = await readProspect(id);
  if (!prospect) return plain(404, "Preview not found", "This link does not open anything.");
  if (isExpired(prospect)) {
    return plain(410, "This preview has expired", "Mock-ups are only kept for a short while. Get in touch if you would like to see it again.");
  }

  const html = await readProspectHtml(id);
  if (!html) return plain(404, "Preview not found", "This link does not open anything.");

  return new Response(withBanner(html, previewBanner(prospect, SITE.url)), {
    headers: { ...HEADERS, "Content-Type": "text/html; charset=utf-8" },
  });
}
