"use client";

import { useState } from "react";

/**
 * Questions on the left, the chosen answer large on the right. On a phone the
 * answer opens under its question instead. Every answer is also in the page's
 * FAQ structured data, so Google reads them all whichever is open.
 */
export function FaqIndex({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <ul className="space-y-1 lg:col-span-5">
        {items.map((item, i) => {
          const on = i === open;
          return (
            <li key={item.q}>
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(i)}
                onMouseEnter={() => setOpen(i)}
                onFocus={() => setOpen(i)}
                className={`flex w-full items-start gap-4 py-3 text-left text-lg leading-snug transition-[color,translate] duration-200 hover:translate-x-1 ${
                  on ? "text-text" : "text-muted"
                }`}
              >
                <span
                  className={`mt-[0.55em] h-2 w-2 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-turq" : "bg-muted-2"}`}
                  aria-hidden="true"
                />
                {item.q}
              </button>
              {on ? <p className="u-fade pb-4 pl-6 text-[17px] leading-relaxed text-text lg:hidden">{item.a}</p> : null}
            </li>
          );
        })}
      </ul>

      <div className="hidden lg:col-span-6 lg:col-start-7 lg:block">
        <p key={open} className="u-fade sticky top-32 text-[1.625rem] leading-[1.35] text-text">
          {items[open].a}
        </p>
      </div>
    </div>
  );
}
