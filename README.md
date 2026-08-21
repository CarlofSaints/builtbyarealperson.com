# builtbyarealperson.com

Consumer-facing site selling fast, fairly-priced website builds to South African
small businesses. The positioning is deliberate and load-bearing: **AI speeds up
the work, a person does the work.** Copy anywhere on this site should reinforce
that, never blur it.

Next.js 16 (App Router) · Tailwind 4 · Resend · Vercel Blob · pdf-lib.

---

## The one file that matters

**`src/lib/rate-card.ts` is the single source of truth for every price.**

The published rate card page, the live estimator and the emailed PDF all read
from it. Change a number there and it changes in all three. No rand amount
should exist anywhere else in the codebase — if you find one, it is a bug.

`src/lib/estimate.ts` turns answers into line items and a total. It is a pure
function, imported by the browser, the PDF generator and the notification email,
so the three can never disagree.

---

## The flow

1. Visitor fills in the estimator at `/estimate`. The total updates live as they
   answer — nine questions, seven steps.
2. `POST /api/estimate` **recomputes the estimate server-side** (the browser's
   number is never trusted), generates a PDF, and sends two emails immediately:
   - to the customer: confirmation + the PDF attached, with a bold "this is NOT
     a quote, but the final quote will be within 20%" block;
   - to you: the full answers + the same PDF.
3. The lead is stored on Vercel Blob as one private JSON file.
4. `GET /api/cron/followup` runs hourly. Roughly two hours after a submission it
   sends the customer a second, shorter email asking them to book the 30-minute
   Teams call. Staged on purpose — three emails inside a minute reads as an
   automated sequence, which is exactly the impression this business exists to
   avoid.

### Why the follow-up is a separate cron

So the customer gets a confirmation instantly and a human-feeling nudge later.
`FOLLOWUP_DELAY_MINUTES` controls the gap; the cron fires hourly, so the actual
delay is that value rounded up to the next hour.

---

## Environment variables

Copy `.env.example` to `.env.local`, and set the same keys in Vercel for
**Production *and* Preview** — a key set only in Production makes every preview
deploy quietly lie to you.

| Key | Required | What breaks without it |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | No email goes out at all. |
| `EMAIL_FROM` | Yes | Sends are rejected unless the domain matches the one verified in Resend, exactly. |
| `NOTIFY_EMAIL` | Yes | You never hear about a submission. |
| `BLOB_STORE_ID` *or* `BLOB_READ_WRITE_TOKEN` | Yes | Leads are not stored and the follow-up cron has nothing to work from. Connecting the store sets `BLOB_STORE_ID` and authenticates via OIDC; the static token is only needed off-Vercel. |
| `CRON_SECRET` | Yes | The follow-up route refuses to run rather than run unauthenticated. |
| `FOLLOWUP_DELAY_MINUTES` | No | Defaults to 120. |
| `NEXT_PUBLIC_BOOKING_URL` | No | The booking email falls back to asking the customer to reply with times. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Falls back to `hello@builtbyarealperson.com`. Must be an address that actually **receives** — sending as an address and receiving at it are separate problems. |
| `NEXT_PUBLIC_PHONE` | No | No phone number is shown anywhere. |
| `ADMIN_PASSWORD` | For /admin | Nobody can sign in to the back office. Minimum 12 characters. |
| `ADMIN_SESSION_SECRET` | For /admin | The session cookie cannot be signed, so nobody can sign in. |

---

## The back office (`/admin`)

One operator, one password. Everything under `/admin` is behind it.

- **`/admin`** — the pipeline. Every lead ever submitted, with the customer's
  contact details, what they asked for, the estimate, and a stage picker that
  saves the moment it changes. Filter by stage, search, and sort. It opens
  sorted by **longest untouched, overdue first** — the page exists so a lead
  cannot quietly go cold.
- **`/admin/<reference>`** — one lead in full: every answer, the estimate line
  by line, the message ids of each email, the stage history, and how they found
  the site.

### Stages

`src/lib/pipeline.ts` is the single source of truth for the stage list, in the
same spirit as the rate card. Nine forward stages, Fresh Lead through Complete,
each with the number of days it may sit there before the grid flags it as
overdue — plus **Lost**.

Lost is deliberately not the tenth step. It is an outcome, so it has no place on
the progress bar, never counts as "furthest along", and is never overdue. It is
"closed" alongside Complete: out of the Open filter and out of the open pipeline
value, but the record of who asked and what for is kept.

A brand new lead has **no stored status at all**. That absence means "nothing
has happened yet" and is rendered as Fresh Lead; writing the default in at
creation would make "never touched" and "moved back to Fresh Lead by hand"
indistinguishable. Everything after Fresh Lead is set by hand — nothing in the
funnel can currently prove a human conversation happened.

### Deleting

A lead can be deleted from its row in the grid or from the bottom of its own
page. It is **permanent** — Vercel Blob has no trash and the lead is the only
copy of what that person told us. The confirmation is a modal `<dialog>` naming
the customer and the reference, because the risk is deleting the wrong row.

It is meant for test submissions and duplicates. A real enquiry that came to
nothing belongs in **Lost**, which gets it out of the way without throwing away
who asked and what for.

What was deleted is written to the function logs as one `lead.deleted` line
before it goes, since afterwards that line is the only trace it ever existed.

### Auth

`ADMIN_PASSWORD` (minimum 12 characters, enforced) and `ADMIN_SESSION_SECRET`.
Without both, the login page says which one is missing rather than silently
refusing everyone.

The session cookie is **signed** — HMAC over an expiry and a fingerprint of the
current password — so it cannot be forged from devtools, cannot be replayed for
ever, and every session dies the moment either variable changes. The password is
compared in constant time.

Every admin page and **every server action checks the session itself**. Rendering
a control only when signed in is not a security boundary: each export of a
`"use server"` file is a public POST endpoint whether or not any form calls it.
There is no public-path prefix list, because `startsWith` allowlists exempt more
than they mean to.

### Known limits

- The grid is one blob read per lead — there is no index file, by design, since
  a shared one loses writes. Fine at this volume, and the fix when it is not is
  a summary blob written alongside each lead, not a shared index.
- Stage writes are a read-modify-write with no lock. One operator and an hourly
  cron do not collide in practice; a second login would change that.
- The login has no shared rate limit. Failures are slowed by a fixed delay, but
  serverless instances do not share a counter.

---

## Diagnosing a failed submission

`POST /api/estimate?diagnose=1` returns the stage tracker and the underlying
warnings instead of just a friendly apology:

```json
{"ok":false,"stages":["parse-body","validate","spam-checks","calculate","build-pdf","send-emails","save-lead"],
 "warnings":["customer email: RESEND_API_KEY is not set"]}
```

Every submission also writes one `estimate.submitted` JSON line to the function
logs, whether it succeeded or not.

`GET /api/cron/followup?dry=1` (with the `Authorization: Bearer $CRON_SECRET`
header) lists which leads *would* be chased without sending anything. Every run
logs a `cron.followup.ran` line including the runs that do nothing — a cron that
silently stopped firing is otherwise invisible until the leads dry up.

---

## Spam handling

A hidden honeypot field plus a minimum time-on-form. A tripped honeypot returns
a normal-looking success response and stores nothing, so a bot learns nothing
from the difference.

---

## Known gaps

- **Email delivery is unproven.** A successful send means Resend *accepted* the
  message, not that anyone received it. Message ids are stored on each lead so a
  bounce can be traced. Wiring the Resend delivery webhook to flip a `delivered`
  flag is the next thing worth building.
- **The mobile layout has not been clicked through on a real narrow viewport.**
  The responsive classes are conventional and the desktop and wide layouts were
  exercised in a browser, but the phone layout has only been reasoned about.
- **The back office has never run against the real Blob store.** Every screen
  and the stage round-trip were exercised in a browser against fixtures; the
  reads and writes against Vercel Blob are the same code paths the estimator
  already uses, but they have not been watched working here.
- No analytics yet.
- No portfolio or testimonials yet — the site currently argues from its own
  quality, which only works until there is something better to point at.
