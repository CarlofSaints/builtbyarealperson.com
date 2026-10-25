"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The cursor layer. One pointer listener for the whole site, batched to one
 * frame, so the effects cost nothing while the mouse is still.
 *
 * - `[data-pointer]` elements get `--mx`/`--my` (cursor in px, relative to the
 *   element) and `--px`/`--py` (-1 to 1 across it). CSS does the rest: the
 *   blueprint spotlight, the screenshot tilt, the drifting verbs.
 * - `[data-magnetic]` elements lean toward a nearby cursor. The value is the
 *   strength (default 0.2). Uses `translate`, not `transform`, so it never
 *   fights an element's own hover transform.
 *
 * Touch screens and reduced-motion visitors get none of it; the CSS falls back
 * to a slow automatic drift or to nothing at all.
 */
export function Pointer() {
  const pathname = usePathname();

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let y = 0;
    let raf = 0;

    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;

      document.querySelectorAll<HTMLElement>("[data-pointer]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        el.style.setProperty("--mx", `${x - r.left}px`);
        el.style.setProperty("--my", `${y - r.top}px`);
        el.style.setProperty("--px", (((x - r.left) / r.width) * 2 - 1).toFixed(3));
        el.style.setProperty("--py", (((y - r.top) / r.height) * 2 - 1).toFixed(3));
        el.dataset.pointerOn = "";
      });

      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const dx = x - (r.left + r.width / 2);
        const dy = y - (r.top + r.height / 2);
        const reach = Math.max(r.width, r.height) * 0.75 + 40;
        const k = Number(el.dataset.magnetic || 0.2);
        el.style.translate = Math.hypot(dx, dy) < reach ? `${dx * k}px ${dy * k}px` : "";
      });
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
