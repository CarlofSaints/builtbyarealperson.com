import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  // Belt and braces with robots.ts: a header on the page itself, in case the
  // route is ever reached by a crawler that ignores robots.txt.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Deliberately no shared chrome here.
 *
 * The header lives in the signed-in pages, not in this layout, because the
 * login page must not render a nav bar that implies a session exists. Auth is
 * checked page by page rather than in this layout — a layout is not a security
 * boundary you want to be the only one.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink-2">{children}</div>;
}
