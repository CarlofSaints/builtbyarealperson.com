"use client";

import { useEffect, useRef, useState } from "react";
import { groupLines, type Estimate } from "@/lib/estimate";
import { ACCURACY_BAND, CARE_PLAN, formatMoney } from "@/lib/rate-card";

const DURATION_MS = 420;

/**
 * Counts up to a new total instead of snapping, so changes feel deliberate.
 *
 * The animation is decoration; landing on the correct number is not. Two things
 * guarantee it:
 *
 *  - `shown` tracks what is actually on screen, so an interrupted animation
 *    resumes from where the eye left off rather than from a stale target.
 *  - a timeout backstop settles on the true figure even if no frame ever
 *    arrives. requestAnimationFrame does not run in a background tab, and
 *    without this the headline price froze on a stale number the moment
 *    somebody switched tabs mid-answer — and never recovered.
 */
function useAnimatedNumber(target: number) {
  const [display, setDisplay] = useState(target);
  const shown = useRef(target);
  const frame = useRef<number | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (shown.current === target) return;

    const settle = () => {
      shown.current = target;
      setDisplay(target);
    };

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || document.visibilityState !== "visible") {
      settle();
      return;
    }

    const origin = shown.current;
    const delta = target - origin;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      // easeOutCubic
      const value = t >= 1 ? target : origin + delta * (1 - Math.pow(1 - t, 3));
      shown.current = value;
      setDisplay(value);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    timer.current = setTimeout(settle, DURATION_MS + 250);

    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      if (timer.current !== undefined) clearTimeout(timer.current);
    };
  }, [target]);

  return display;
}

export function RunningTotal({ estimate, compact = false }: { estimate: Estimate; compact?: boolean }) {
  const animated = useAnimatedNumber(estimate.total);
  const groups = groupLines(estimate.lines);

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-2">Running estimate</p>
          <p className="font-display text-2xl font-extrabold tabular-nums leading-tight text-text">
            {estimate.isPriceable ? formatMoney(animated) : "—"}
          </p>
        </div>
        {estimate.isPriceable ? (
          <p className="shrink-0 text-right text-[12px] leading-snug text-muted-2">
            {formatMoney(estimate.low)} – {formatMoney(estimate.high)}
            <br />
            <span className="text-muted-2/70">± {Math.round(ACCURACY_BAND * 100)}% band</span>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="u-card overflow-hidden">
      <div className="border-b border-line bg-gradient-to-br from-turq/[0.09] to-pink/[0.06] p-6">
        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-turq">
          Your running estimate
        </p>

        {estimate.isPriceable ? (
          <>
            <p className="mt-3 font-display text-[2.6rem] font-extrabold leading-none tabular-nums tracking-tight text-text">
              {formatMoney(animated)}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              Final quote will land between{" "}
              <span className="font-semibold text-text">{formatMoney(estimate.low)}</span> and{" "}
              <span className="font-semibold text-text">{formatMoney(estimate.high)}</span>.
            </p>
            <p className="mt-4 flex items-center gap-2 border-t border-line/60 pt-3 text-[13px] text-muted-2">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-turq">
                <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 4.6V8l2.2 1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Roughly {estimate.daysLow}–{estimate.daysHigh} working days
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 font-display text-[2.6rem] font-extrabold leading-none tracking-tight text-line-2">
              R—
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              Pick how big the site needs to be and the number starts working.
            </p>
          </>
        )}
      </div>

      {groups.length > 0 ? (
        <div className="max-h-[42vh] overflow-y-auto p-5">
          {groups.map((g) => (
            <div key={g.group} className="mb-4 last:mb-0">
              <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
                {g.group}
              </p>
              <ul className="space-y-1.5">
                {g.lines.map((line, i) => (
                  <li key={`${line.label}-${i}`} className="flex items-start justify-between gap-3 text-[13.5px]">
                    <span className="min-w-0 flex-1 text-muted">{line.label}</span>
                    <span className="shrink-0 font-medium tabular-nums text-text">
                      {formatMoney(line.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      <div className="border-t border-line bg-ink/50 p-5">
        <p className="text-[12px] leading-relaxed text-muted-2">
          Excludes VAT. {CARE_PLAN.label} is {formatMoney(CARE_PLAN.monthly)}/month and is never
          included in the total above.
        </p>
      </div>
    </div>
  );
}
