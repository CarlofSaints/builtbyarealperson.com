import Link from "next/link";
import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-turq">
      <span className="inline-block h-1 w-1 rounded-full bg-turq" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`font-display text-3xl font-bold leading-[1.1] tracking-tight text-text sm:text-4xl md:text-[2.75rem] ${className}`}
    >
      {children}
    </h2>
  );
}

export function Lead({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`mt-5 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-lg ${className}`}>
      {children}
    </p>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-display text-[15px] font-semibold transition-all duration-200";
  const styles =
    variant === "primary"
      ? "bg-turq text-ink shadow-[0_10px_40px_-12px_rgba(42,232,206,0.6)] hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-12px_rgba(42,232,206,0.75)]"
      : "border border-line-2 text-text hover:-translate-y-0.5 hover:border-turq/50 hover:text-turq";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      >
        <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export function Card({
  children,
  className = "",
  lift = true,
}: {
  children: ReactNode;
  className?: string;
  lift?: boolean;
}) {
  return (
    <div className={`u-card ${lift ? "u-card-lift" : ""} p-6 sm:p-7 ${className}`}>{children}</div>
  );
}

export function Check({ tone = "turq" }: { tone?: "turq" | "pink" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`mt-0.5 shrink-0 ${tone === "turq" ? "text-turq" : "text-pink"}`}
    >
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
      <path d="M6 10.2l2.6 2.6L14 7.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Cross() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-muted-2">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.2" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
