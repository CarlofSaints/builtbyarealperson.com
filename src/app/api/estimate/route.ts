import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateEstimate, type Answers } from "@/lib/estimate";
import { buildEstimatePdf } from "@/lib/pdf";
import { sendCustomerEstimate, sendOwnerNotification } from "@/lib/email";
import {
  isBlobConfigured,
  makeReference,
  saveLead,
  toStoredEstimate,
  type LeadRecord,
} from "@/lib/store";
import { INTEGRATIONS } from "@/lib/rate-card";

export const runtime = "nodejs";
export const maxDuration = 60;

const integrationIds = INTEGRATIONS.map((i) => i.id) as [string, ...string[]];

const AnswersSchema = z.object({
  siteSize: z.enum(["landing", "brochure", "standard", "large"]),
  sell: z.enum(["no", "simple", "full"]),
  integrations: z.array(z.enum(integrationIds)).max(INTEGRATIONS.length).default([]),
  integrationsDetail: z.string().max(2000).default(""),
  market: z.enum(["sa", "intl"]),
  brand: z.enum(["have-all", "have-logo", "need-all"]),
  copy: z.enum(["supplied", "written"]),

  hasSite: z.boolean(),
  currentUrl: z.string().max(500).default(""),
  migrateContent: z.boolean().default(false),
  domain: z.enum(["own-access", "own-no-access", "need-domain"]),

  multilingual: z.boolean().default(false),
  timeline: z.enum(["flexible", "soon", "rush"]),

  name: z.string().trim().min(1).max(120),
  business: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().max(60).default(""),
  notes: z.string().max(4000).default(""),

  website: z.string().max(200).default(""),
});

const BodySchema = z.object({
  answers: AnswersSchema,
  elapsedMs: z.number().int().nonnegative().max(1000 * 60 * 60 * 24).default(0),
});

/** Nobody reads nine questions in under four seconds. */
const MIN_ELAPSED_MS = 4000;

export async function POST(request: Request) {
  // A stage tracker, so a failure says WHERE it failed rather than just "sorry".
  const stages: string[] = [];
  const mark = (s: string) => {
    stages.push(s);
  };

  const diagnose = new URL(request.url).searchParams.get("diagnose") === "1";
  const warnings: string[] = [];

  try {
    mark("parse-body");
    const raw = await request.json().catch(() => null);
    if (!raw) {
      return NextResponse.json({ ok: false, error: "Could not read that request.", stages }, { status: 400 });
    }

    mark("validate");
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        {
          ok: false,
          error: first ? `${first.path.join(".") || "form"}: ${first.message}` : "That form did not validate.",
          stages,
          ...(diagnose ? { issues: parsed.error.issues } : {}),
        },
        { status: 400 },
      );
    }

    const answers = parsed.data.answers as Answers;
    const elapsedMs = parsed.data.elapsedMs;

    mark("spam-checks");
    // Honeypot: a hidden field only an automated filler would touch. Return a
    // success shape so the bot has nothing to learn from, but store nothing.
    if (answers.website.trim().length > 0) {
      return NextResponse.json({ ok: true, reference: makeReference(new Date()) });
    }
    if (elapsedMs > 0 && elapsedMs < MIN_ELAPSED_MS) {
      return NextResponse.json(
        { ok: false, error: "That was submitted too quickly. Have another go.", stages },
        { status: 429 },
      );
    }

    mark("calculate");
    // Recomputed here on purpose. The number the browser showed is never trusted.
    const estimate = calculateEstimate(answers);
    if (!estimate.isPriceable || estimate.total <= 0) {
      return NextResponse.json(
        { ok: false, error: "There is not enough there to price yet.", stages },
        { status: 400 },
      );
    }

    const now = new Date();
    const reference = makeReference(now);

    mark("build-pdf");
    const pdf = await buildEstimatePdf({
      answers,
      estimate,
      reference,
      dateLabel: now.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Johannesburg",
      }),
    });

    const lead: LeadRecord = {
      reference,
      createdAt: now.toISOString(),
      answers,
      estimate: toStoredEstimate(estimate),
      meta: {
        userAgent: request.headers.get("user-agent") ?? "",
        ip:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          "",
        elapsedMs,
        referer: request.headers.get("referer") ?? "",
      },
      emails: {},
    };

    mark("send-emails");
    // Sent in parallel: the customer must not wait on the owner's copy.
    const [customerResult, ownerResult] = await Promise.all([
      sendCustomerEstimate({ answers, estimate, reference, pdf }),
      sendOwnerNotification({
        answers,
        estimate,
        reference,
        pdf,
        meta: {
          userAgent: lead.meta.userAgent,
          submittedAt: now.toISOString(),
          elapsedMs,
        },
      }),
    ]);

    lead.emails.customerEstimateId = customerResult.id;
    lead.emails.customerEstimateError = customerResult.error;
    lead.emails.ownerNotifyId = ownerResult.id;
    lead.emails.ownerNotifyError = ownerResult.error;

    if (!customerResult.ok) warnings.push(`customer email: ${customerResult.error}`);
    if (!ownerResult.ok) warnings.push(`owner email: ${ownerResult.error}`);

    mark("save-lead");
    let saved = false;
    if (isBlobConfigured()) {
      try {
        await saveLead(lead);
        saved = true;
      } catch (err) {
        warnings.push(`blob save: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      warnings.push("blob save: BLOB_READ_WRITE_TOKEN is not set");
    }

    // Every run leaves a trace, whether it worked or not. A submission that
    // vanished silently is worse than one that failed loudly.
    console.log(
      JSON.stringify({
        event: "estimate.submitted",
        reference,
        business: answers.business,
        total: estimate.total,
        saved,
        customerEmail: customerResult.ok ? "accepted" : `failed: ${customerResult.error}`,
        ownerEmail: ownerResult.ok ? "accepted" : `failed: ${ownerResult.error}`,
        stages,
      }),
    );

    // If nothing at all got through, the submission is genuinely lost and the
    // person needs to hear that rather than see a thank-you page.
    if (!saved && !customerResult.ok && !ownerResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Your answers reached me but I could not store or send them. Please email me directly — nothing was lost on your side.",
          stages,
          ...(diagnose ? { warnings } : {}),
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      reference,
      emailSent: customerResult.ok,
      ...(diagnose ? { stages, warnings, saved } : {}),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify({ event: "estimate.failed", stage: stages[stages.length - 1] ?? "start", stages, message }),
    );
    return NextResponse.json(
      {
        ok: false,
        error: `Something broke at the "${stages[stages.length - 1] ?? "start"}" step. Please email me and I will sort it out.`,
        stages,
        ...(diagnose ? { message } : {}),
      },
      { status: 500 },
    );
  }
}
