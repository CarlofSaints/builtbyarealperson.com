import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export function AdminHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink-2/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/admin" className="font-display text-[15px] font-bold text-text">
          Built By A Real <span className="text-turq">Person</span>
          <span className="ml-2 rounded-md border border-line-2 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wider text-muted">
            Back office
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          {children}
          <Link href="/" className="text-sm text-muted transition-colors hover:text-turq">
            View site
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-line-2 px-3 py-1.5 text-sm text-muted transition-colors hover:border-pink/50 hover:text-pink"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
