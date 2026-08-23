"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { NAV_LINKS } from "@/lib/site";

/**
 * Points at /admin, not at /admin/login, on purpose: /admin sends you to the
 * login page when there is no session and straight to the pipeline when there
 * is, so one link is both "sign in" and "go to my leads".
 *
 * It also means the header does NOT have to check the session, which is what
 * keeps the marketing pages static. Reading a cookie up here would make every
 * page dynamic to render one link.
 */
const ADMIN_HREF = "/admin";

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10.5" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape and click-away both have to work, or the menu is a trap on mobile.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-ink/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={ADMIN_HREF}
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-2 transition-colors hover:text-turq"
          >
            <LockIcon />
            Sign in
          </Link>
          <Link
            href="/estimate"
            className="ml-2 rounded-lg bg-turq px-4 py-2 text-sm font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5 hover:bg-turq/90"
          >
            Get an estimate
          </Link>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 rounded-lg p-2 text-text md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 8h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M4 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div ref={panelRef} id="mobile-nav" className="border-t border-line bg-ink/95 px-5 pb-5 pt-2 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-line/60 py-3.5 text-[15px] text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/estimate"
              className="mt-4 rounded-xl bg-turq px-4 py-3 text-center text-[15px] font-semibold text-ink"
            >
              Get an estimate
            </Link>
            <Link
              href={ADMIN_HREF}
              className="mt-3 inline-flex items-center justify-center gap-1.5 py-2 text-sm text-muted-2 transition-colors hover:text-turq"
            >
              <LockIcon />
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
