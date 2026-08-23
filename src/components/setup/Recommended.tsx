import type { Recommendation } from "@/lib/take-on";

/**
 * What the answers came out as, said to the customer.
 *
 * Deliberately shows the exit route as prominently as the setup steps. The
 * whole point of asking is that where a site lives is a decision with
 * consequences, and the consequence people care about is whether they are
 * stuck.
 */
export function Recommended({ recommendation }: { recommendation: Recommendation }) {
  const r = recommendation;

  return (
    <div className="u-card p-6 sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.14em] text-turq">What I would do</p>
      <h3 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">{r.title}</h3>
      <p className="mt-4 leading-relaxed text-muted">{r.summary}</p>

      <div className="mt-6 rounded-xl border border-line-2 bg-ink px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-2">What it costs you monthly</p>
        <p className="mt-1 font-display text-lg font-semibold text-text">{r.monthly}</p>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="font-display text-sm font-semibold text-text">What I need from you</p>
          <ul className="mt-3 space-y-2.5">
            {r.theyDo.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-text">What I do</p>
          <ul className="mt-3 space-y-2.5">
            {r.iDo.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turq" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-turq/30 bg-turq/[0.06] px-5 py-4">
        <p className="font-display text-sm font-semibold text-turq">If you ever want to leave</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.exit}</p>
      </div>
    </div>
  );
}
