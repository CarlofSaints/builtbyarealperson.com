"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OptionCard, Question, TextField, Toggle } from "./Fields";
import { RunningTotal } from "./RunningTotal";
import { calculateEstimate, EMPTY_ANSWERS, type Answers } from "@/lib/estimate";
import {
  BRAND_STATES,
  COPY_MODES,
  DOMAIN_STATES,
  INTEGRATIONS,
  INTEGRATION_ADDITIONAL,
  INTEGRATION_FIRST,
  MARKETS,
  MIGRATION,
  MULTILINGUAL,
  SELL_MODES,
  SITE_SIZES,
  TIMELINES,
  formatMoney,
  type IntegrationId,
} from "@/lib/rate-card";

const STEPS = [
  { id: "today", label: "Where you are now" },
  { id: "size", label: "How big" },
  { id: "sell", label: "Selling" },
  { id: "integrations", label: "Connections" },
  { id: "design", label: "Look and words" },
  { id: "timing", label: "Timing" },
  { id: "you", label: "About you" },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidUrlish(value: string) {
  const v = value.trim();
  if (!v) return false;
  return /^([a-z]+:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(v);
}

type Errors = Partial<Record<keyof Answers, string>>;

export function EstimateForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const estimate = useMemo(() => calculateEstimate(answers), [answers]);

  const set = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const toggleIntegration = useCallback((id: IntegrationId) => {
    setAnswers((prev) => ({
      ...prev,
      integrations: prev.integrations.includes(id)
        ? prev.integrations.filter((i) => i !== id)
        : [...prev.integrations, id],
    }));
  }, []);

  function validateStep(index: number): Errors {
    const e: Errors = {};
    const a = answers;

    if (index === 0) {
      if (a.hasSite === null) e.hasSite = "Pick one so I know what I am working with.";
      if (a.hasSite === true && a.currentUrl.trim() && !isValidUrlish(a.currentUrl))
        e.currentUrl = "That does not look like a web address.";
      if (a.domain === null) e.domain = "Pick one. This is the step that most often delays a launch.";
    }
    if (index === 1 && !a.siteSize) e.siteSize = "Pick the closest size. You can change your mind on the call.";
    if (index === 2) {
      if (!a.sell) e.sell = "Pick one.";
      if (!a.market) e.market = "Pick one.";
    }
    if (index === 4) {
      if (!a.brand) e.brand = "Pick one.";
      if (!a.copy) e.copy = "Pick one.";
    }
    if (index === 5 && !a.timeline) e.timeline = "Pick one.";
    if (index === 6) {
      if (!a.name.trim()) e.name = "I need something to call you.";
      if (!a.business.trim()) e.business = "What is the business called?";
      if (!a.email.trim()) e.email = "The estimate needs somewhere to go.";
      else if (!EMAIL_RE.test(a.email.trim())) e.email = "Check that email address. The estimate goes there.";
    }
    return e;
  }

  function goTo(next: number) {
    setStep(next);
    // Move focus for screen readers and scroll the panel back to the top.
    window.requestAnimationFrame(() => {
      headingRef.current?.focus();
      const top = headingRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0 || top > window.innerHeight * 0.5) {
        headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function next() {
    const e = validateStep(step);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    if (step < STEPS.length - 1) goTo(step + 1);
  }

  function back() {
    setErrors({});
    if (step > 0) goTo(step - 1);
  }

  async function submit() {
    const e = validateStep(6);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          elapsedMs: Date.now() - startedAt.current,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reference?: string;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || `The server said no (${res.status}).`);
      }

      router.push(`/thank-you?ref=${encodeURIComponent(data.reference ?? "")}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong on my side. Please try again, or email me directly.",
      );
      setSubmitting(false);
    }
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12">
      {/* ── Questions ──────────────────────────────────────────────────── */}
      <div className="min-w-0">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-[13px]">
            <span className="font-display font-semibold text-turq">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-muted-2">{STEPS[step].label}</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-label="Estimate progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-turq to-pink transition-[width] duration-500 ease-out"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div ref={headingRef} tabIndex={-1} className="outline-none" />

        {/* Step 1 — where you are now */}
        {step === 0 && (
          <div className="space-y-10">
            <Question
              index="01"
              title="Do you have a website at the moment?"
              hint="An existing site is useful even if you hate it. It tells me what your content is and what needs to survive the move."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionCard
                  name="hasSite"
                  selected={answers.hasSite === true}
                  onSelect={() => set("hasSite", true)}
                  label="Yes, there is one"
                />
                <OptionCard
                  name="hasSite"
                  selected={answers.hasSite === false}
                  onSelect={() => {
                    set("hasSite", false);
                    set("currentUrl", "");
                    set("migrateContent", false);
                  }}
                  label="No, starting from scratch"
                />
              </div>
              {errors.hasSite ? <p className="mt-3 text-[13px] text-pink">{errors.hasSite}</p> : null}

              {answers.hasSite === true ? (
                <div className="mt-6 space-y-6 rounded-2xl border border-line bg-surface/40 p-5">
                  <TextField
                    id="currentUrl"
                    label="Paste the link"
                    value={answers.currentUrl}
                    onChange={(v) => set("currentUrl", v)}
                    placeholder="www.yourbusiness.co.za"
                    error={errors.currentUrl}
                  />
                  <Toggle
                    checked={answers.migrateContent}
                    onChange={(v) => set("migrateContent", v)}
                    label={MIGRATION.label}
                    blurb={MIGRATION.blurb}
                    price={MIGRATION.price}
                  />
                </div>
              ) : null}
            </Question>

            <Question
              index="02"
              title="What is the situation with your domain name?"
              hint="Be honest here. Waiting on somebody else's IT company to change a DNS record is the single most common reason a launch slips by two weeks."
            >
              <div className="grid gap-3">
                {DOMAIN_STATES.map((d) => (
                  <OptionCard
                    key={d.id}
                    name="domain"
                    selected={answers.domain === d.id}
                    onSelect={() => set("domain", d.id)}
                    label={d.label}
                    blurb={d.blurb}
                    price={d.price}
                  />
                ))}
              </div>
              {errors.domain ? <p className="mt-3 text-[13px] text-pink">{errors.domain}</p> : null}
            </Question>
          </div>
        )}

        {/* Step 2 — size */}
        {step === 1 && (
          <Question
            index="03"
            title="Roughly how big does the site need to be?"
            hint="A page is a separate destination with its own address: Home, About, each service, Contact. Sections inside a page do not count."
          >
            <div className="grid gap-3">
              {SITE_SIZES.map((s) => (
                <OptionCard
                  key={s.id}
                  name="siteSize"
                  selected={answers.siteSize === s.id}
                  onSelect={() => set("siteSize", s.id)}
                  label={s.label}
                  blurb={s.blurb}
                  price={s.price}
                />
              ))}
            </div>
            {errors.siteSize ? <p className="mt-3 text-[13px] text-pink">{errors.siteSize}</p> : null}
            <p className="mt-5 rounded-xl border border-line bg-surface/40 p-4 text-[13.5px] leading-relaxed text-muted-2">
              Not sure? Pick the smaller one. It is far easier to add pages later than to
              pay for ones you never fill.
            </p>
          </Question>
        )}

        {/* Step 3 — selling */}
        {step === 2 && (
          <div className="space-y-10">
            <Question
              index="04"
              title="Will you sell directly from the website?"
              hint="Taking money online is the single biggest thing that changes the price, so it gets its own question."
            >
              <div className="grid gap-3">
                {SELL_MODES.map((s) => (
                  <OptionCard
                    key={s.id}
                    name="sell"
                    selected={answers.sell === s.id}
                    onSelect={() => set("sell", s.id)}
                    label={s.label}
                    blurb={s.blurb}
                    price={s.price}
                  />
                ))}
              </div>
              {errors.sell ? <p className="mt-3 text-[13px] text-pink">{errors.sell}</p> : null}
            </Question>

            <Question
              index="05"
              title="Are your products or services South Africa only?"
              hint="Selling or shipping outside the country brings in currencies, delivery zones and foreign tax rules."
            >
              <div className="grid gap-3">
                {MARKETS.map((m) => (
                  <OptionCard
                    key={m.id}
                    name="market"
                    selected={answers.market === m.id}
                    onSelect={() => set("market", m.id)}
                    label={m.label}
                    blurb={m.blurb}
                    price={m.price}
                  />
                ))}
              </div>
              {errors.market ? <p className="mt-3 text-[13px] text-pink">{errors.market}</p> : null}
            </Question>
          </div>
        )}

        {/* Step 4 — integrations */}
        {step === 3 && (
          <Question
            index="06"
            title="Does it need to talk to anything else?"
            hint={`Pick as many as apply, or none at all. The first connection is ${formatMoney(
              INTEGRATION_FIRST,
            )} because it carries the plumbing; each one after that is ${formatMoney(
              INTEGRATION_ADDITIONAL,
            )}.`}
          >
            <div className="grid gap-2.5 sm:grid-cols-2">
              {INTEGRATIONS.map((i) => (
                <OptionCard
                  key={i.id}
                  type="checkbox"
                  selected={answers.integrations.includes(i.id)}
                  onSelect={() => toggleIntegration(i.id)}
                  label={i.label}
                />
              ))}
            </div>

            {answers.integrations.length > 0 ? (
              <div className="mt-6">
                <TextField
                  id="integrationsDetail"
                  label="What should actually happen between them?"
                  hint="For example: “when someone pays on the site, raise the invoice in Xero” or “new enquiries must appear on our Monday board”."
                  value={answers.integrationsDetail}
                  onChange={(v) => set("integrationsDetail", v)}
                  multiline
                  placeholder="A sentence or two is plenty."
                />
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-line bg-surface/40 p-4 text-[13.5px] leading-relaxed text-muted-2">
                Nothing selected is a perfectly good answer. Most small business sites do
                not need to connect to anything.
              </p>
            )}
          </Question>
        )}

        {/* Step 5 — design and words */}
        {step === 4 && (
          <div className="space-y-10">
            <Question
              index="07"
              title="What does your brand look like today?"
              hint="No logo is not a problem. It is just work that has to happen before the site can be designed."
            >
              <div className="grid gap-3">
                {BRAND_STATES.map((b) => (
                  <OptionCard
                    key={b.id}
                    name="brand"
                    selected={answers.brand === b.id}
                    onSelect={() => set("brand", b.id)}
                    label={b.label}
                    blurb={b.blurb}
                    price={b.price}
                  />
                ))}
              </div>
              {errors.brand ? <p className="mt-3 text-[13px] text-pink">{errors.brand}</p> : null}
            </Question>

            <Question
              index="08"
              title="Who writes the words?"
              hint="This is the step that stalls most website projects, not the design. Be realistic about whether you will actually sit down and write it."
            >
              <div className="grid gap-3">
                {COPY_MODES.map((c) => (
                  <OptionCard
                    key={c.id}
                    name="copy"
                    selected={answers.copy === c.id}
                    onSelect={() => set("copy", c.id)}
                    label={c.label}
                    blurb={c.blurb}
                    price={c.price}
                  />
                ))}
              </div>
              {errors.copy ? <p className="mt-3 text-[13px] text-pink">{errors.copy}</p> : null}

              <div className="mt-6">
                <Toggle
                  checked={answers.multilingual}
                  onChange={(v) => set("multilingual", v)}
                  label={MULTILINGUAL.label}
                  blurb={MULTILINGUAL.blurb}
                  price={MULTILINGUAL.price}
                />
              </div>
            </Question>
          </div>
        )}

        {/* Step 6 — timing */}
        {step === 5 && (
          <Question
            index="09"
            title="When do you need it live?"
            hint="Only the last option costs more. The other two cost exactly the same. I am asking so I can plan honestly, not to upsell you."
          >
            <div className="grid gap-3">
              {TIMELINES.map((t) => (
                <OptionCard
                  key={t.id}
                  name="timeline"
                  selected={answers.timeline === t.id}
                  onSelect={() => set("timeline", t.id)}
                  label={t.label}
                  blurb={t.blurb}
                  price={t.id === "rush" ? undefined : 0}
                />
              ))}
            </div>
            {errors.timeline ? <p className="mt-3 text-[13px] text-pink">{errors.timeline}</p> : null}

            {estimate.isPriceable ? (
              <p className="mt-5 rounded-xl border border-turq/20 bg-turq/[0.05] p-4 text-[13.5px] leading-relaxed text-muted">
                Based on what you have picked, a realistic window is{" "}
                <span className="font-semibold text-text">
                  {estimate.daysLow} to {estimate.daysHigh} working days
                </span>{" "}
                from the day I have your content.
              </p>
            ) : null}
          </Question>
        )}

        {/* Step 7 — about you */}
        {step === 6 && (
          <Question
            index="10"
            title="Where should I send the estimate?"
            hint="A PDF breakdown lands in your inbox within a minute or two. No newsletter, no list, no reselling your details to anyone."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="name"
                label="Your name"
                required
                autoComplete="name"
                value={answers.name}
                onChange={(v) => set("name", v)}
                error={errors.name}
              />
              <TextField
                id="business"
                label="Business name"
                required
                autoComplete="organization"
                value={answers.business}
                onChange={(v) => set("business", v)}
                error={errors.business}
              />
              <TextField
                id="email"
                label="Email"
                type="email"
                required
                autoComplete="email"
                value={answers.email}
                onChange={(v) => set("email", v)}
                error={errors.email}
              />
              <TextField
                id="phone"
                label="Mobile"
                type="tel"
                autoComplete="tel"
                placeholder="082 000 0000"
                value={answers.phone}
                onChange={(v) => set("phone", v)}
                hint="Only used if email bounces."
              />
            </div>

            <div className="mt-5">
              <TextField
                id="notes"
                label="Anything else I should know?"
                multiline
                value={answers.notes}
                onChange={(v) => set("notes", v)}
                placeholder="What the site has to achieve, a site you like the look of, a deadline you are working towards. Whatever is on your mind."
              />
            </div>

            {/* Honeypot. Real people never see it; bots fill it in. */}
            <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
              <label htmlFor="website-hp">Leave this field empty</label>
              <input
                id="website-hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={answers.website}
                onChange={(e) => set("website", e.target.value)}
              />
            </div>

            <p className="mt-6 text-[13px] leading-relaxed text-muted-2">
              By sending this you are asking me for an estimate, nothing more. It is not
              an order, it does not commit you to anything, and I will not add you to a
              mailing list.
            </p>

            {submitError ? (
              <div className="mt-5 rounded-xl border border-pink/40 bg-pink/[0.07] p-4">
                <p className="text-[14px] font-semibold text-pink">That did not send.</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{submitError}</p>
              </div>
            ) : null}
          </Question>
        )}

        {/* Navigation */}
        <div className="mt-10 flex items-center gap-3 border-t border-line pt-7">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              disabled={submitting}
              className="rounded-xl border border-line-2 px-5 py-3 font-display text-[15px] font-semibold text-muted transition-colors hover:border-muted-2 hover:text-text disabled:opacity-40"
            >
              Back
            </button>
          ) : null}

          {!isLast ? (
            <button
              type="button"
              onClick={next}
              className="group ml-auto inline-flex items-center gap-2 rounded-xl bg-turq px-7 py-3.5 font-display text-[15px] font-semibold text-ink shadow-[0_10px_40px_-12px_rgba(42,232,206,0.6)] transition-all duration-200 hover:-translate-y-0.5"
            >
              Continue
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="ml-auto inline-flex items-center gap-2.5 rounded-xl bg-turq px-7 py-3.5 font-display text-[15px] font-semibold text-ink shadow-[0_10px_40px_-12px_rgba(42,232,206,0.6)] transition-all duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden="true" />
                  Sending your estimate…
                </>
              ) : (
                <>Send me the estimate</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Live total ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:block lg:sticky lg:top-24">
        <RunningTotal estimate={estimate} />
        <p className="mt-4 px-1 text-[12.5px] leading-relaxed text-muted-2">
          This number updates as you answer. It is an estimate, not a quote, but the
          final quote will land inside the range shown above.
        </p>
      </aside>

      {/* Mobile: pinned summary bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/95 px-5 py-3 backdrop-blur-xl lg:hidden">
        <RunningTotal estimate={estimate} compact />
      </div>
      {/* Clears the pinned bar above, which is ~88px tall with its padding. */}
      <div className="h-24 lg:hidden" aria-hidden="true" />
    </div>
  );
}
