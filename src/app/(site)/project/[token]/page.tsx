import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isBlobConfigured, leadByAccessToken } from "@/lib/store";
import { leadStatus } from "@/lib/store";
import { CHANGE_META, needsTheirDecision, stageForClient } from "@/lib/project";
import { formatMoney } from "@/lib/rate-card";
import { AddChange } from "@/components/project/AddChange";
import { Section, H2, Lead } from "@/components/ui";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your project",
  // The link is the credential, so it must never be in an index. Nothing on the
  // page is worth stealing, but that is not a reason to publish it.
  robots: { index: false, follow: false, nocache: true },
};

function when(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "long" });
}

export default async function ProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isBlobConfigured()) notFound();

  const lead = await leadByAccessToken(token);
  // A dead, rotated, malformed or invented token all end here. Telling them
  // apart would let somebody map the space.
  if (!lead) notFound();

  const stage = stageForClient(leadStatus(lead));
  const changes = lead.changes ?? [];
  const waiting = lead.waitingOn ?? [];
  const decisions = needsTheirDecision(changes);
  const first = lead.answers.name.trim().split(/\s+/)[0] || "there";

  return (
    <Section className="u-glow">
      <div className="relative z-10 mx-auto max-w-3xl">
        <p className="font-mono text-xs text-muted-2">{lead.reference}</p>
        <H2 className="mt-2">
          {lead.answers.business.trim() || `${first}'s site`}
        </H2>

        {stage ? (
          <div className="mt-6 rounded-xl2 border border-turq/30 bg-turq/[0.06] px-5 py-4">
            <p className="font-display text-lg font-semibold text-turq">{stage.title}</p>
            <p className="mt-1.5 leading-relaxed text-muted">{stage.detail}</p>
          </div>
        ) : (
          <Lead className="mt-6">
            Nothing is under way yet. Once you have accepted a quote this page will show you
            exactly where things are.
          </Lead>
        )}

        {/* The honest answer to "why is this late". */}
        {waiting.length > 0 && (
          <div className="mt-6 rounded-xl2 border border-amber-400/40 bg-amber-400/10 px-5 py-4">
            <p className="font-display text-lg font-semibold text-amber-300">
              I am waiting on you for
            </p>
            <ul className="mt-3 space-y-2">
              {waiting.map((item) => (
                <li key={item.id} className="flex flex-wrap gap-x-2 text-[15px] leading-relaxed text-amber-100">
                  <span>{item.what}</span>
                  <span className="text-amber-300/70">since {when(item.since)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-amber-200/80">
              Not a telling off. It is just the thing holding the rest up, so you can see it.
            </p>
          </div>
        )}

        {decisions.length > 0 && (
          <div className="mt-6 rounded-xl2 border border-pink/40 bg-pink/10 px-5 py-4">
            <p className="font-display text-lg font-semibold text-pink">
              {decisions.length === 1 ? "One thing needs a yes or no" : `${decisions.length} things need a yes or no`}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              They are outside what we agreed, so they have a price on them. Nothing happens, and
              nothing is charged, until you tell me to go ahead. Reply to my email or ring me.
            </p>
          </div>
        )}

        <div className="mt-10">
          <AddChange token={token} />
        </div>

        <div className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-2">
            Everything asked for
          </p>

          {changes.length === 0 ? (
            <p className="mt-4 rounded-xl2 border border-line bg-surface px-5 py-8 text-center text-muted">
              Nothing yet. Anything you ask for will appear here with what it costs, if anything.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {[...changes].reverse().map((change) => {
                const meta = CHANGE_META[change.status];
                return (
                  <li key={change.id} className="u-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="max-w-xl whitespace-pre-wrap text-[15px] leading-relaxed text-text">
                        {change.what}
                      </p>
                      <span
                        className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.tone}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted-2">
                      {change.askedBy === "you" ? "You asked" : "I spotted this"} on {when(change.askedAt)}
                      {" · "}
                      {meta.blurb}
                    </p>

                    {typeof change.price === "number" && (
                      <p className="mt-3 font-display text-lg font-bold text-pink">
                        {change.price === 0 ? "No charge" : formatMoney(change.price)}
                      </p>
                    )}

                    {change.note && (
                      <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-muted">
                        {change.note}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="mt-10 text-sm leading-relaxed text-muted-2">
          This page is yours and it does not expire. Keep the link. If you would rather just phone
          me, that has not stopped being an option: {SITE.email}
          {SITE.phone ? ` or ${SITE.phone}` : ""}.
        </p>
      </div>
    </Section>
  );
}
