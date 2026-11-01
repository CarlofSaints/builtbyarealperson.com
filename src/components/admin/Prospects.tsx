"use client";

import { useRef, useState, useTransition } from "react";
import { addProspect, removeProspect, sendIntro } from "@/app/admin/prospects/actions";

const input =
  "mt-1 w-full rounded-lg border border-line-2 bg-ink-2 px-3 py-2 text-sm text-text outline-none focus:border-turq";

/**
 * Submitted by hand, not as a form action: a React 19 form action resets every
 * field on return, so one typo in the email would wipe the whole form.
 */
export function AddProspectForm() {
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  return (
    <form
      ref={form}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSaved(false);
        start(async () => {
          const r = await addProspect(data);
          setError(r.error);
          if (!r.error) {
            form.current?.reset();
            setSaved(true);
          }
        });
      }}
      className="mt-6 grid gap-4 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2"
    >
      <h2 className="font-display text-lg font-bold text-text sm:col-span-2">Add a prospect</h2>
      <label className="text-sm text-muted">
        Business name
        <input name="business" required maxLength={120} className={input} />
      </label>
      <label className="text-sm text-muted">
        Their current website
        <input name="currentUrl" type="url" required placeholder="https://" className={input} />
      </label>
      <label className="text-sm text-muted">
        Email address (the one on their site)
        <input name="email" type="email" required className={input} />
      </label>
      <label className="text-sm text-muted">
        Contact first name (optional, else &ldquo;Hi there&rdquo;)
        <input name="contactName" maxLength={80} className={input} />
      </label>
      <label className="text-sm text-muted sm:col-span-2">
        Where you found them, finishing &ldquo;I came across the [business] website &hellip;&rdquo;
        <input name="foundVia" required maxLength={160} placeholder="while looking for plumbers in Randburg" className={input} />
      </label>
      <label className="text-sm text-muted">
        Mock-up (one .html file)
        <input name="html" type="file" accept=".html,text/html" required className={input} />
      </label>
      <label className="text-sm text-muted">
        Screenshot for the email (PNG or JPG, under 900 KB)
        <input name="screenshot" type="file" accept="image/png,image/jpeg" required className={input} />
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-turq px-4 py-2 text-sm font-bold text-ink transition-opacity disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save prospect"}
        </button>
        {error && <p role="alert" className="text-sm text-pink">{error}</p>}
        {saved && <p className="text-sm text-turq">Saved. Open the preview link below to check it.</p>}
      </div>
    </form>
  );
}

/** Two clicks for anything that cannot be undone: the email and the delete. */
export function ProspectButtons({ id, email, canSend }: { id: string; email: string; canSend: boolean }) {
  const [confirm, setConfirm] = useState<"send" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ error: string | null }>) =>
    start(async () => {
      const r = await fn();
      setError(r.error);
      setConfirm(null);
    });

  const btn = "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {canSend &&
          (confirm === "send" ? (
            <button disabled={pending} onClick={() => run(() => sendIntro(id))} className={`${btn} border-turq bg-turq text-ink`}>
              {pending ? "Sending..." : `Yes, email ${email}`}
            </button>
          ) : (
            <button onClick={() => setConfirm("send")} className={`${btn} border-turq/50 text-turq hover:bg-turq/10`}>
              Send first email
            </button>
          ))}
        {confirm === "delete" ? (
          <button disabled={pending} onClick={() => run(() => removeProspect(id))} className={`${btn} border-pink bg-pink text-ink`}>
            Yes, delete for good
          </button>
        ) : (
          <button onClick={() => setConfirm("delete")} className={`${btn} border-line-2 text-muted hover:border-pink/50 hover:text-pink`}>
            Delete
          </button>
        )}
        {confirm && (
          <button onClick={() => setConfirm(null)} className={`${btn} border-line-2 text-muted`}>
            Cancel
          </button>
        )}
      </div>
      {error && <p role="alert" className="max-w-xs text-right text-xs text-pink">{error}</p>}
    </div>
  );
}
