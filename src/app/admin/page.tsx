import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/admin-auth";
import { isBlobConfigured, listLeads } from "@/lib/store";
import { toRow } from "@/lib/lead-view";
import { isClosed } from "@/lib/pipeline";
import { formatMoney } from "@/lib/rate-card";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { LeadsTable } from "@/components/admin/LeadsTable";

/**
 * Never cached. Every load reads the blob store, because a stale pipeline is
 * worse than a slow one. It is the difference between "I have chased them"
 * and "I have not".
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isSignedIn())) redirect("/admin/login");

  if (!isBlobConfigured()) {
    return (
      <>
        <AdminHeader />
        <main className="mx-auto max-w-2xl px-5 py-16">
          <div className="rounded-xl2 border border-pink/40 bg-pink/10 p-6">
            <h1 className="font-display text-lg font-bold text-pink">Blob storage is not configured</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Neither <code className="text-text">BLOB_STORE_ID</code> nor{" "}
              <code className="text-text">BLOB_READ_WRITE_TOKEN</code> is set on this deployment, so
              there is nowhere to read leads from. An empty list here would look identical to
              &ldquo;no one has enquired&rdquo;, which is why this says so instead.
            </p>
          </div>
        </main>
      </>
    );
  }

  const now = new Date();
  const leads = await listLeads();
  const rows = leads.map((lead) => toRow(lead, now));

  // "Open" means still live: neither delivered nor written off.
  const open = rows.filter((r) => !isClosed(r.status));
  const pipelineValue = open.reduce((sum, r) => sum + r.total, 0);
  const won = rows.filter((r) =>
    ["quote-accepted", "in-progress", "client-review", "iterating", "complete"].includes(r.status),
  );

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Pipeline</h1>
            <p className="mt-1 text-sm text-muted">
              Every estimate anyone has submitted. Change a stage and it saves immediately.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Stat label="Open" value={String(open.length)} />
            <Stat label="Open value" value={formatMoney(pipelineValue)} tone="turq" />
            <Stat label="Accepted or building" value={String(won.length)} />
          </div>
        </div>

        <LeadsTable rows={rows} />
      </main>
    </>
  );
}

function Stat({ label, value, tone = "plain" }: { label: string; value: string; tone?: "plain" | "turq" }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-muted-2">{label}</div>
      <div
        className={`font-display text-lg font-bold ${tone === "turq" ? "text-turq" : "text-text"}`}
      >
        {value}
      </div>
    </div>
  );
}
