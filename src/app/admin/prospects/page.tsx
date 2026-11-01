import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/admin-auth";
import { isBlobConfigured } from "@/lib/store";
import { isExpired, listProspects, PREVIEW_DAYS } from "@/lib/prospects";
import { SITE } from "@/lib/site";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AddProspectForm, ProspectButtons } from "@/components/admin/Prospects";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  if (!(await isSignedIn())) redirect("/admin/login");
  const prospects = isBlobConfigured() ? await listProspects() : [];
  const now = new Date();

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">Prospects</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Businesses you have made a mock-up for. Each gets ONE email with a screenshot and no link.
          When they reply yes, send them their preview link from Outlook. Links stop working after{" "}
          {PREVIEW_DAYS} days.
        </p>

        <AddProspectForm />

        <div className="mt-8 overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-[11px] uppercase tracking-wider text-muted-2">
              <tr>
                <th className="px-4 py-2.5">Business</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Preview link</th>
                <th className="px-4 py-2.5">First email</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {prospects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">No prospects yet.</td>
                </tr>
              )}
              {prospects.map((p) => {
                const expired = isExpired(p, now);
                const url = `${SITE.url}/preview/${p.id}`;
                return (
                  <tr key={p.id} className="border-t border-line align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-text">{p.business}</div>
                      <a href={p.currentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-turq">
                        {p.currentUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {p.contactName && <div className="text-text">{p.contactName}</div>}
                      {p.email}
                    </td>
                    <td className="px-4 py-3">
                      {expired ? (
                        <span className="text-pink">Expired</span>
                      ) : (
                        <a href={url} target="_blank" rel="noopener" className="break-all text-turq hover:underline">{url}</a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {p.intro?.id ? (
                        <span className="text-turq">Sent {new Date(p.intro.sentAt).toLocaleDateString("en-ZA")}</span>
                      ) : p.intro?.error ? (
                        <span className="text-pink">Failed: {p.intro.error}</span>
                      ) : (
                        "Not sent"
                      )}
                      <a href={`/admin/prospects/${p.id}/email`} target="_blank" rel="noopener" className="mt-1 block text-xs text-turq hover:underline">
                        Preview email
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <ProspectButtons id={p.id} email={p.email} canSend={!p.intro?.id && !expired} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
