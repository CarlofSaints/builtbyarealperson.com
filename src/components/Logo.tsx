import Link from "next/link";

/**
 * Wordmark. The pulsing dot is the whole idea in one element: something alive
 * is behind this site.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5 font-display font-semibold tracking-tight"
      aria-label="Built By A Real Person — home"
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-turq opacity-60 [animation-duration:2.4s]" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-turq to-pink" />
      </span>
      <span className={compact ? "text-[15px]" : "text-[15px] sm:text-base"}>
        <span className="text-text">built by a </span>
        <span className="u-grad-text">real person</span>
      </span>
    </Link>
  );
}
