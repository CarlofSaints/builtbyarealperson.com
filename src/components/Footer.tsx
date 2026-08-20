import Link from "next/link";
import { Logo } from "./Logo";
import { SITE, NAV_LINKS } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-2">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              One person, building websites for South African small businesses.
              Fast, fairly priced, and answerable to you when something breaks.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-2">
                Site
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-muted transition-colors hover:text-turq">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/estimate" className="text-muted transition-colors hover:text-turq">
                    Get an estimate
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-2">
                Get hold of me
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href={`mailto:${SITE.email}`} className="text-muted transition-colors hover:text-turq">
                    {SITE.email}
                  </a>
                </li>
                {SITE.phone ? (
                  <li>
                    <a
                      href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                      className="text-muted transition-colors hover:text-turq"
                    >
                      {SITE.phone}
                    </a>
                  </li>
                ) : null}
                <li className="text-muted-2">{SITE.builder.location}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Built, obviously, by a real person.
          </p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-turq" aria-hidden="true" />
            This very site is a live sample of the work.
          </p>
        </div>
      </div>
    </footer>
  );
}
