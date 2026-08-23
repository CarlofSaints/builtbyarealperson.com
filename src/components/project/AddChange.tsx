"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addChange } from "@/app/(site)/project/actions";

export function AddChange({ token }: { token: string }) {
  const [what, setWhat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    if (!what.trim()) return setError("Tell me what you would like changed.");
    setError(null);
    startTransition(async () => {
      const result = await addChange(token, what);
      if (!result.ok) return setError(result.error);
      setWhat("");
      setSent(true);
      router.refresh();
    });
  }

  return (
    <div className="u-card p-5 sm:p-7">
      <label htmlFor="what" className="font-display text-lg font-semibold text-text">
        Want something changed?
      </label>
      <p className="mt-2 text-sm leading-relaxed text-muted-2">
        Put it here rather than in an email and it will not get lost. I will tell you whether it is
        part of what you are already paying for or whether it costs extra, before I do anything.
      </p>
      <textarea
        id="what"
        rows={3}
        value={what}
        onChange={(e) => { setWhat(e.target.value); setSent(false); }}
        placeholder="The photo on the about page should be the newer one..."
        className="mt-4 w-full rounded-xl border border-line-2 bg-ink px-4 py-3 text-[15px] leading-relaxed text-text placeholder:text-muted-2"
      />
      {error && (
        <p role="alert" className="mt-3 text-sm text-pink">{error}</p>
      )}
      {sent && !error && (
        <p className="mt-3 text-sm text-turq">Got it. It is on the list below.</p>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="mt-4 rounded-xl bg-turq px-5 py-3 font-display text-[15px] font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send it to me"}
      </button>
    </div>
  );
}
