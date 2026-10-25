import Image from "next/image";
import Link from "next/link";
import { Logo } from "./Logo";
import { SITE, NAV_LINKS } from "@/lib/site";

const MENU = [...NAV_LINKS, { href: "/guides", label: "Guides" }, { href: "/estimate", label: "Get an estimate" }];

/**
 * Half real work, half menu. The picture is a hard crop of a system I built,
 * larger than anywhere above it: the footer is the last proof, not a sitemap.
 */
export function Footer() {
  return (
    <footer className="grid bg-ink-2 lg:min-h-[90svh] lg:grid-cols-2">
      <div className="relative h-[50svh] overflow-hidden lg:h-auto">
        <Image
          src="/work/iram-routes/map.jpg"
          alt="The route planner I built for a field sales team, with 2,250 stores across South Africa on one map"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[62%_40%] [transform:scale(1.6)] [transform-origin:62%_40%]"
        />
      </div>

      <div className="flex flex-col px-4 pb-8 pt-12 sm:px-8 lg:px-16 lg:pt-20">
        <Logo />
        <nav aria-label="Footer" className="group/menu mt-10">
          <ul className="space-y-2 lg:space-y-3">
            {MENU.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-block font-display text-[clamp(1.75rem,2.8vw,2.75rem)] font-extrabold leading-tight tracking-[-0.025em] text-text transition-[color,translate] duration-300 hover:translate-x-3 hover:!text-turq group-hover/menu:text-muted-2"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-14 grid gap-8 text-[15px] leading-relaxed sm:grid-cols-2">
          <div>
            <p className="font-semibold text-text">Get hold of me</p>
            <a href={`mailto:${SITE.email}`} className="mt-1 block break-all text-muted transition-colors hover:text-turq">
              {SITE.email}
            </a>
            {SITE.phone ? (
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="block text-muted transition-colors hover:text-turq">
                {SITE.phone}
              </a>
            ) : null}
          </div>
          <div>
            <p className="font-semibold text-text">One person</p>
            <p className="mt-1 text-muted">
              Building websites for South African small businesses, and answerable to you when something
              breaks.
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-14 text-[13px] text-muted sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Built, obviously, by a real person.
          </p>
          <p>This very site is a live sample of the work.</p>
        </div>
      </div>
    </footer>
  );
}
