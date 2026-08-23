"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/app/(site)/setup/actions";
import { CONSENT_CHOICES, STAR_LABELS, type ReviewConsent } from "@/lib/review";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true" className="block">
      <path
        d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95L12 2.6z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReviewForm({ reference, firstName }: { reference: string; firstName: string }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [quote, setQuote] = useState("");
  const [consent, setConsent] = useState<ReviewConsent | null>(null);
  const [attributionName, setAttributionName] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const shown = hover || stars;

  function submit() {
    if (!stars) return setError("Pick a number of stars. That is the only bit I actually need.");
    if (!consent) return setError("Let me know whether I may use this, even if the answer is no.");
    setError(null);
    startTransition(async () => {
      const result = await submitReview(reference, { stars, quote, consent, attributionName, privateNote });
      if (!result.ok) return setError(result.error);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="u-card p-6 sm:p-8">
        <p className="font-display text-lg font-semibold text-text">
          How did that go, out of five?
        </p>
        <div
          className="mt-4 flex items-center gap-1 text-turq"
          onMouseLeave={() => setHover(0)}
          role="radiogroup"
          aria-label="Rating out of five"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} out of 5, ${STAR_LABELS[n]}`}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => { setStars(n); setError(null); }}
              className={`rounded-lg p-1 transition-transform ${n <= shown ? "" : "text-line-2"} hover:scale-110`}
            >
              <Star filled={n <= shown} />
            </button>
          ))}
          <span className="ml-3 text-sm text-muted">{shown ? STAR_LABELS[shown] : ""}</span>
        </div>
        {/* Honest about it: a rating is not much use without the reason. */}
        <p className="mt-3 text-sm text-muted-2">
          If it is not a five, I would genuinely rather know why than not know.
        </p>
      </div>

      <div className="u-card mt-4 p-6 sm:p-8">
        <label htmlFor="quote" className="font-display text-lg font-semibold text-text">
          Would you put it in a sentence?
        </label>
        <p className="mt-2 text-sm leading-relaxed text-muted-2">
          What you were worried about beforehand and whether it happened is more useful than
          anything complimentary. Two lines is plenty.
        </p>
        <textarea
          id="quote"
          rows={4}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="I thought it would take months and cost double..."
          className="mt-4 w-full rounded-xl border border-line-2 bg-ink px-4 py-3 text-[15px] leading-relaxed text-text placeholder:text-muted-2"
        />
      </div>

      <div className="u-card mt-4 p-6 sm:p-8">
        <p className="font-display text-lg font-semibold text-text">May I use it?</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-2">
          Saying no is completely fine and changes nothing. I would rather have an honest answer
          I cannot publish than a polite one I can.
        </p>
        <div className="mt-5 space-y-2.5">
          {CONSENT_CHOICES.map((choice) => {
            const selected = consent === choice.id;
            return (
              <label
                key={choice.id}
                className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  selected ? "border-turq bg-turq/[0.07]" : "border-line-2 hover:bg-surface-2"
                }`}
              >
                <input
                  type="radio"
                  name="consent"
                  checked={selected}
                  onChange={() => { setConsent(choice.id); setError(null); }}
                  className="mt-1 h-4 w-4 shrink-0 accent-turq"
                />
                <span>
                  <span className={`block text-[15px] ${selected ? "text-text" : "text-muted"}`}>
                    {choice.label}
                  </span>
                  <span className="mt-1 block text-[13px] text-muted-2">{choice.note}</span>
                </span>
              </label>
            );
          })}
        </div>

        {(consent === "full" || consent === "first-name") && (
          <div className="mt-4 border-t border-line pt-4">
            <label htmlFor="attributionName" className="block text-sm font-medium text-text">
              How should I sign it? Leave blank and I will use {firstName}.
            </label>
            <input
              id="attributionName"
              type="text"
              value={attributionName}
              onChange={(e) => setAttributionName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line-2 bg-ink px-4 py-3 text-[15px] text-text"
            />
          </div>
        )}
      </div>

      <div className="u-card mt-4 p-6 sm:p-8">
        <label htmlFor="privateNote" className="font-display text-lg font-semibold text-text">
          Anything you would rather say just to me?
        </label>
        <p className="mt-2 text-sm text-muted-2">
          Never published, never quoted. This is the box for the thing that annoyed you.
        </p>
        <textarea
          id="privateNote"
          rows={3}
          value={privateNote}
          onChange={(e) => setPrivateNote(e.target.value)}
          className="mt-4 w-full rounded-xl border border-line-2 bg-ink px-4 py-3 text-[15px] leading-relaxed text-text"
          placeholder="Optional."
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-pink/50 bg-pink/10 px-4 py-3 text-sm text-pink">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="mt-8 rounded-xl bg-turq px-6 py-3.5 font-display text-[15px] font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send it"}
      </button>
    </div>
  );
}
