"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { submitTakeOn } from "@/app/(site)/setup/actions";
import { EMPTY_TAKE_ON, QUESTIONS, type TakeOnAnswers } from "@/lib/take-on";

/**
 * One page, every question visible.
 *
 * The estimator is a stepper because it has nine questions that change a number
 * as you go. This has seven that change nothing until the end, and a stepper
 * would only hide how short it is. Somebody who can see the whole thing knows
 * it is three minutes; somebody clicking Next has no idea.
 */
export function TakeOnForm({ reference }: { reference: string }) {
  const [answers, setAnswers] = useState<TakeOnAnswers>(EMPTY_TAKE_ON);
  const [error, setError] = useState<string | null>(null);
  const [showGaps, setShowGaps] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const missing = useMemo(
    () => QUESTIONS.filter((q) => answers[q.id] === null).map((q) => q.id),
    [answers],
  );

  function pick(id: keyof TakeOnAnswers, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
    setError(null);
  }

  function submit() {
    if (missing.length) {
      setShowGaps(true);
      // Take them to the first thing they have not answered rather than making
      // them hunt for it.
      document.getElementById(`q-${missing[0]}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    startTransition(async () => {
      const result = await submitTakeOn(reference, answers);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  // Worked out up front rather than by mutating a running variable inside the
  // map. Reassigning during render is a real bug waiting to happen: React can
  // render a component twice, and the second pass would see the section already
  // "used" and drop every heading.
  const items = QUESTIONS.map((q, i) => ({
    q,
    heading: i === 0 || QUESTIONS[i - 1].section !== q.section ? q.section : null,
  }));

  return (
    <div>
      {items.map(({ q, heading }) => {
        const unanswered = showGaps && answers[q.id] === null;
        const followUpOpen =
          q.followUp && typeof answers[q.id] === "string" && q.followUp.when.includes(answers[q.id] as string);

        return (
          <div key={q.id}>
            {heading && (
              <p className="mb-5 mt-12 text-[11px] uppercase tracking-[0.14em] text-turq first:mt-0">
                {heading}
              </p>
            )}

            <fieldset
              id={`q-${q.id}`}
              className={`u-card mb-4 p-5 sm:p-6 ${unanswered ? "border-pink/60" : ""}`}
            >
              <legend className="font-display text-lg font-semibold leading-snug text-text">
                {q.question}
              </legend>
              <p className="mt-2 text-sm leading-relaxed text-muted-2">{q.why}</p>

              <div className="mt-5 space-y-2.5">
                {q.choices.map((choice) => {
                  const selected = answers[q.id] === choice.id;
                  return (
                    <label
                      key={choice.id}
                      className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors ${
                        selected ? "border-turq bg-turq/[0.07]" : "border-line-2 hover:border-line-2 hover:bg-surface-2"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={choice.id}
                        checked={selected}
                        onChange={() => pick(q.id, choice.id)}
                        className="mt-1 h-4 w-4 shrink-0 accent-turq"
                      />
                      <span>
                        <span className={`block text-[15px] leading-snug ${selected ? "text-text" : "text-muted"}`}>
                          {choice.label}
                        </span>
                        {choice.note && (
                          <span className="mt-1 block text-[13px] leading-snug text-muted-2">{choice.note}</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>

              {followUpOpen && q.followUp && (
                <div className="mt-4 border-t border-line pt-4">
                  <label
                    htmlFor={q.followUp.id}
                    className="block text-sm font-medium text-text"
                  >
                    {q.followUp.label}
                  </label>
                  <input
                    id={q.followUp.id}
                    type="text"
                    value={String(answers[q.followUp.id] ?? "")}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.followUp!.id]: e.target.value }))}
                    placeholder={q.followUp.placeholder}
                    className="mt-2 w-full rounded-xl border border-line-2 bg-ink px-4 py-3 text-[15px] text-text placeholder:text-muted-2"
                  />
                </div>
              )}

              {unanswered && (
                <p role="alert" className="mt-3 text-sm text-pink">
                  Pick one of these. If none of them fit, say so in the box at the bottom.
                </p>
              )}
            </fieldset>
          </div>
        );
      })}

      <div className="u-card mt-4 p-5 sm:p-6">
        <label htmlFor="notes" className="font-display text-lg font-semibold text-text">
          Anything else I should know?
        </label>
        <p className="mt-2 text-sm text-muted-2">
          Someone who needs to be involved, a deadline, a bad experience with a previous web person.
          Anything at all, or nothing.
        </p>
        <textarea
          id="notes"
          rows={4}
          value={answers.notes}
          onChange={(e) => setAnswers((a) => ({ ...a, notes: e.target.value }))}
          className="mt-4 w-full rounded-xl border border-line-2 bg-ink px-4 py-3 text-[15px] leading-relaxed text-text placeholder:text-muted-2"
          placeholder="Optional."
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-pink/50 bg-pink/10 px-4 py-3 text-sm text-pink">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-xl bg-turq px-6 py-3.5 font-display text-[15px] font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {pending ? "Sending…" : "Send this to Carl"}
        </button>
        <p className="text-sm text-muted-2">
          {missing.length === 0
            ? "All answered."
            : `${missing.length} question${missing.length === 1 ? "" : "s"} left.`}
        </p>
      </div>
    </div>
  );
}
