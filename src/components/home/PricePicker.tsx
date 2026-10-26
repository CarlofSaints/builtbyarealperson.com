"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ACCURACY_BAND,
  OFFERED_SITE_SIZES,
  SELL_MODES,
  formatMoney,
  type SellMode,
  type SiteSize,
} from "@/lib/rate-card";

/** Short names for the picker. The prices still come from the rate card. */
const SELL_SHORT: Record<SellMode, string> = { no: "No", simple: "A small catalogue", full: "A full shop" };

/** "Small site (4 to 5 pages)" → ["Small site", "4 to 5 pages"] */
function splitLabel(label: string): [string, string] {
  const m = label.match(/^(.*?)\s*\((.*)\)$/);
  return m ? [m[1], m[2]] : [label, ""];
}

/** Counts from the old figure to the new one, so a change reads as a change. */
function useTween(target: number) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (start === target || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = target;
      setShown(target);
      return;
    }
    const t0 = performance.now();
    let raf = requestAnimationFrame(function step(now) {
      const p = Math.min(1, (now - t0) / 450);
      const v = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return shown;
}

export function PricePicker() {
  const [size, setSize] = useState<SiteSize>(OFFERED_SITE_SIZES[0].id);
  const [sell, setSell] = useState<SellMode>("no");

  const sizeChoice = OFFERED_SITE_SIZES.find((s) => s.id === size)!;
  const sellChoice = SELL_MODES.find((s) => s.id === sell)!;
  const total = sizeChoice.price + sellChoice.price;
  const shown = useTween(total);

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-6" role="radiogroup" aria-label="Site size">
        {OFFERED_SITE_SIZES.map((s) => {
          const [name, pages] = splitLabel(s.label);
          const on = s.id === size;
          return (
            <label
              key={s.id}
              className={`group flex w-full cursor-pointer items-baseline rounded-2xl has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-turq gap-4 py-2 text-left font-display text-[clamp(2.25rem,4.6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] transition-[color,translate] duration-200 hover:translate-x-2 ${
                on ? "text-text" : "text-muted-2 hover:text-muted"
              }`}
            >
              <input
                type="radio"
                name="site-size"
                value={s.id}
                checked={on}
                onChange={() => setSize(s.id)}
                className="sr-only"
              />
              <span
                className={`inline-block h-[0.28em] w-[0.28em] shrink-0 -translate-y-[0.12em] rounded-full bg-turq transition-transform duration-300 ${on ? "scale-100" : "scale-0"}`}
                aria-hidden="true"
              />
              <span>
                {name}
                <span className="block font-sans text-base font-medium tracking-normal text-muted">{pages}</span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        <div className="lg:sticky lg:top-28">
          <p
            className="font-display text-[clamp(3.5rem,8vw,8rem)] font-extrabold leading-none tracking-[-0.04em] text-turq tabular-nums"
            aria-hidden="true"
          >
            {formatMoney(shown)}
          </p>
          <span className="sr-only" aria-live="polite">
            {formatMoney(total)}
          </span>
          <p className="mt-3 text-base text-muted">From, once-off, excluding VAT</p>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-text">{sizeChoice.blurb}</p>

          <fieldset className="mt-8">
            <legend className="text-base text-muted">Selling online?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {SELL_MODES.map((m) => {
                const on = m.id === sell;
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSell(m.id)}
                    className={`rounded-full px-4 py-2.5 text-[15px] font-semibold transition-[background-color,color,scale] duration-200 active:scale-95 ${
                      on ? "bg-text text-ink" : "bg-surface-2 text-muted hover:text-text"
                    }`}
                  >
                    {SELL_SHORT[m.id]}
                    {m.price ? ` +${formatMoney(m.price)}` : ""}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/estimate"
              data-magnetic="0.15"
              className="inline-flex items-center justify-center rounded-full bg-turq px-7 py-4 font-display text-base font-bold text-ink transition-[background-color,scale] duration-200 hover:bg-white active:scale-95"
            >
              Price my whole site
            </Link>
            <Link href="/pricing" className="text-base font-semibold text-text underline-offset-4 hover:text-turq hover:underline">
              Read the full rate card
            </Link>
          </div>
          <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted">
            Logos, words, bookings and connections to Xero and the like are on the rate card too. Estimates land
            within {Math.round(ACCURACY_BAND * 100)}% of the final quote, and after our call the quote is fixed.
          </p>
        </div>
      </div>
    </div>
  );
}
