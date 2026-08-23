"use client";

/**
 * Screenshots on a portfolio card, and a full-size viewer for them.
 *
 * Built on a real <dialog> rather than a hand-rolled overlay, which buys three
 * things that are tedious to get right by hand: Escape closes it, focus is
 * trapped inside it while it is open, and the page behind it stops scrolling.
 *
 * Two things learned the hard way and worth not re-learning:
 *
 *  - Tailwind's Preflight sets `margin: 0` on every element, which overrides
 *    the browser rule that centres a modal <dialog> and leaves it pinned to the
 *    top-left corner. The `.u-dialog` class in globals.css puts the centring
 *    back. Do not remove it because the dialog "looks fine" in one browser.
 *  - A click on the backdrop and a click on the image are both clicks on the
 *    dialog as far as the event is concerned. The only reliable way to tell
 *    them apart is that the backdrop click has the dialog itself as its target,
 *    so the content lives in a child element and is checked for.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type Shot = { src: string; caption: string };

export function Lightbox({ shots, label }: { shots: Shot[]; label: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const open = useCallback((i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  }, []);

  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + shots.length) % shots.length),
    [shots.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    };
    dialog.addEventListener("keydown", onKey);
    return () => dialog.removeEventListener("keydown", onKey);
  }, [step]);

  // Fetch the neighbours so arrowing through does not flash a blank frame.
  useEffect(() => {
    for (const i of [index + 1, index - 1]) {
      const shot = shots[(i + shots.length) % shots.length];
      if (shot) { const img = new Image(); img.src = shot.src; }
    }
  }, [index, shots]);

  if (!shots.length) return null;
  const current = shots[index];

  return (
    <div className="mt-6">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-2">
        The real thing
        {/* Said once, plainly, rather than stamped across every image. */}
        <span className="ml-2 normal-case tracking-normal text-muted-2">
          (details changed, everything else exactly as it runs)
        </span>
      </p>

      <ul className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
        {shots.map((shot, i) => (
          <li key={shot.src} className="shrink-0 snap-start">
            <button
              type="button"
              onClick={() => open(i)}
              className="group block w-[15rem] overflow-hidden rounded-lg border border-line-2 bg-ink transition-colors hover:border-turq/50 focus-visible:border-turq focus-visible:outline-none sm:w-[17rem]"
            >
              <img
                src={shot.src}
                alt={shot.caption}
                loading="lazy"
                decoding="async"
                className="aspect-[16/9] w-full object-cover object-left-top transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="block px-3 py-2 text-left text-[12px] leading-snug text-muted-2 group-hover:text-muted">
                {shot.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={`${label} screenshots`}
        className="u-dialog w-[min(96vw,80rem)] rounded-xl border border-line-2 bg-ink-2 p-0 text-text"
        onClick={(e) => {
          // Only the backdrop has the dialog itself as its target.
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        onTouchStart={(e) => { touchStartX.current = e.changedTouches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start === null) return;
          const dx = (e.changedTouches[0]?.clientX ?? start) - start;
          if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
        }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
          <p className="min-w-0 truncate font-display text-sm font-semibold text-text">{label}</p>
          <div className="flex shrink-0 items-center gap-1">
            <span className="mr-2 text-xs tabular-nums text-muted-2">
              {index + 1} of {shots.length}
            </span>
            <ArrowButton dir="prev" onClick={() => step(-1)} disabled={shots.length < 2} />
            <ArrowButton dir="next" onClick={() => step(1)} disabled={shots.length < 2} />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="ml-1 rounded-lg border border-line-2 px-3 py-1.5 text-sm text-muted transition-colors hover:border-turq/50 hover:text-text"
            >
              Close
            </button>
          </div>
        </div>

        <div className="bg-ink p-2 sm:p-3">
          <img
            src={current.src}
            alt={current.caption}
            className="mx-auto max-h-[72vh] w-auto max-w-full rounded-md"
          />
        </div>

        <p className="border-t border-line px-4 py-3 text-[14px] leading-relaxed text-muted">
          {current.caption}
        </p>
      </dialog>
    </div>
  );
}

function ArrowButton({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous screenshot" : "Next screenshot"}
      className="rounded-lg border border-line-2 p-1.5 text-muted transition-colors hover:border-turq/50 hover:text-text disabled:pointer-events-none disabled:opacity-40"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={dir === "prev" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
