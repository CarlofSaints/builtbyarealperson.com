"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateLeadStatus } from "@/app/admin/actions";
import { LEAD_STATUSES, STATUS_META, type LeadStatus } from "@/lib/pipeline";

/**
 * Inline stage picker.
 *
 * A native <select> on purpose: it is keyboard accessible for free, it closes on
 * Escape and on a click away without any of that having to be written, and on a
 * phone it opens the OS picker instead of a cramped custom menu.
 *
 * Two things here were arrived at the hard way, by watching the control lie in a
 * browser rather than by reasoning about it:
 *
 *  1. The optimistic value is `useOptimistic`, driven INSIDE the transition that
 *     runs the action. Holding it in ordinary state and syncing it back from
 *     the `status` prop, whether in an effect or during render, races the
 *     action's own re-render: the picker settles on the previous stage while the
 *     stored stage is the new one. A control that disagrees with the data is
 *     worse than no control.
 *  2. Nothing wrapping the <select> may carry a key that changes. A remounted
 *     select falls back to displaying its FIRST option while holding a different
 *     value underneath, which reads as "everything is a Fresh Lead again".
 *
 * The stored value is always one of the options. An unknown status is read back
 * as "fresh-lead" before it reaches here, so the select can never sit showing
 * an option that does not match the data.
 */
export function StatusSelect({
  reference,
  status,
  compact = false,
}: {
  reference: string;
  status: LeadStatus;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(status);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const meta = STATUS_META[shown];

  function choose(next: LeadStatus) {
    if (next === status) return;
    startTransition(async () => {
      setShown(next);
      setError(null);
      const result = await updateLeadStatus(reference, next);
      // On failure the optimistic value falls back to `status` on its own, so
      // the picker cannot be left claiming a stage that was never written.
      setError(result.error);
      setSavedAt(result.error ? null : Date.now());
    });
  }

  return (
    <div className="inline-block">
      <div className="relative inline-block">
        <select
          value={shown}
          disabled={pending}
          aria-label={`Stage for ${reference}`}
          onChange={(event) => choose(event.target.value as LeadStatus)}
          className={`w-full appearance-none rounded-full border py-1.5 pl-6 pr-7 font-semibold transition-opacity disabled:opacity-60 ${meta.pill} ${
            compact ? "text-xs" : "text-[13px]"
          }`}
        >
          {LEAD_STATUSES.map((id) => (
            <option key={id} value={id} className="bg-surface text-text">
              {STATUS_META[id].label}
            </option>
          ))}
        </select>
        <span
          className={`pointer-events-none absolute left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${meta.dot}`}
          aria-hidden="true"
        />
        <svg
          viewBox="0 0 12 12"
          width="10"
          height="10"
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70"
        >
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        {/* Confirmation pulse. A SIBLING overlay, never a wrapper. See note 2. */}
        {savedAt !== null && !pending && (
          <span
            key={savedAt}
            aria-hidden="true"
            className="u-saved pointer-events-none absolute inset-0 rounded-full"
          />
        )}
      </div>

      {/* Live region so a failure is announced, not only coloured. */}
      <span aria-live="polite" className="sr-only">
        {pending ? "Saving" : error ? error : savedAt ? "Saved" : ""}
      </span>
      {error && (
        <p role="alert" className="mt-1 max-w-[220px] text-xs leading-snug text-pink">
          {error}
        </p>
      )}
    </div>
  );
}
