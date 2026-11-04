import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isSignedIn } from "@/lib/admin-auth";
import { readProspect } from "@/lib/prospects";
import { defaultIntroDraft, SCREENSHOT_MARK } from "@/lib/email";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { EditEmailForm } from "@/components/admin/Prospects";

export const dynamic = "force-dynamic";

export default async function EditProspectEmail({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isSignedIn())) redirect("/admin/login");
  const { id } = await params;
  const p = await readProspect(id);
  if (!p) notFound();
  const draft = p.draft ?? defaultIntroDraft(p);

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-[800px] px-4 py-7 sm:px-6">
        <Link href="/admin/prospects" className="text-sm text-muted hover:text-turq">&larr; Prospects</Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-text">Email to {p.business}</h1>
        <p className="mt-1 text-sm text-muted">
          To {p.email}. A blank line starts a new paragraph. The <code className="text-text">{SCREENSHOT_MARK}</code> line is
          where the picture goes. The only links allowed are to builtbyarealperson.com, such as their preview link.
        </p>
        {p.intro?.id ? (
          <p className="mt-6 text-sm text-pink">Already sent, so it can&rsquo;t be edited.</p>
        ) : (
          <EditEmailForm id={p.id} subject={draft.subject} body={draft.body} />
        )}
      </main>
    </>
  );
}
