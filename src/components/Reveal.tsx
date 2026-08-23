"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fades elements in as they scroll into view.
 *
 * Anything with `u-reveal` starts hidden and gets `is-in` once seen. If this
 * component never runs. JS disabled, old browser, an error elsewhere on the
 * page. The safety net below reveals everything, so content is never lost to
 * a broken animation.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".u-reveal:not(.is-in)"));

    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          window.setTimeout(() => el.classList.add("is-in"), delay);
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
