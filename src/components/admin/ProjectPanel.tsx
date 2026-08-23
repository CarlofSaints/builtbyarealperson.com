"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rotateProjectLink, saveWaitingOn, triageChange } from "@/app/admin/actions";
import { CHANGE_META, type ChangeRequest } from "@/lib/project";

const STATUSES = Object.keys(CHANGE_META) as (keyof typeof CHANGE_META)[];

function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="rounded-lg bg-turq px-3 py-1.5 text-xs font-semibold text-ink"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

function ChangeRow({ reference, change }: { reference: string; change: ChangeRequest }) {
  const [status, setStatus] = useState(change.status);
  const [price, setPrice] = useState(typeof change.price === "number" ? String(change.price) : "");
  const [note, setNote] = useState(change.note ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await triageChange(reference, change.id, status, price, note);
      if (result.error) return setError(result.error);
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    });
  }

  return (
    <li className="rounded-xl border border-line bg-ink p-4">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{change.what}</p>
      <p className="mt-1 text-xs text-muted-2">
        {change.askedBy === "you" ? "They asked" : "You added"} ·{" "}
        {new Date(change.askedAt).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ChangeRequest["status"])}
          className="rounded-lg border border-line-2 bg-surface px-2.5 py-1.5 text-xs text-text"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-surface">
              {CHANGE_META[s].label}
            </option>
          ))}
        </select>

        <input
          type="text"
          inputMode="numeric"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (blank = none)"
          className="w-[150px] rounded-lg border border-line-2 bg-surface px-2.5 py-1.5 text-xs text-text placeholder:text-muted-2"
        />

        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-lg border border-turq/50 px-3 py-1.5 text-xs font-semibold text-turq disabled:opacity-60"
        >
          {pending ? "Saving…" : saved ? "Saved" : "Save this change"}
        </button>
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="A note they will see next to this"
        className="mt-2 w-full rounded-lg border border-line-2 bg-surface px-2.5 py-1.5 text-xs text-text placeholder:text-muted-2"
      />

      {/* A price with nothing explaining it is how an argument starts. */}
      {status === "quoted" && !note.trim() && (
        <p className="mt-2 text-xs text-amber-300">
          Priced with no note. Say why, or they will read the number as opportunism.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-pink">{error}</p>}
    </li>
  );
}

export function ProjectPanel({
  reference,
  url,
  changes,
  waitingOn,
}: {
  reference: string;
  url: string;
  changes: ChangeRequest[];
  waitingOn: { what: string; since: string }[];
}) {
  const [waiting, setWaiting] = useState(waitingOn.map((w) => w.what).join("\n"));
  const [savedWaiting, setSavedWaiting] = useState(false);
  const [pending, startTransition] = useTransition();
  const [rotating, startRotate] = useTransition();
  const router = useRouter();

  return (
    <div>
      <div className="rounded-xl border border-line bg-ink p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-2">
          Their link. No password. Send it in an email.
        </p>
        <p className="mt-2 break-all font-mono text-[11px] text-muted">{url}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyLink url={url} />
          <button
            type="button"
            disabled={rotating}
            onClick={() =>
              startRotate(async () => {
                await rotateProjectLink(reference);
                router.refresh();
              })
            }
            className="rounded-lg border border-line-2 px-3 py-1.5 text-xs text-muted hover:border-pink/50 hover:text-pink disabled:opacity-60"
          >
            {rotating ? "Rotating…" : "Rotate (kills the old one)"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-ink p-4">
        <label htmlFor="waitingOn" className="text-xs font-semibold uppercase tracking-wider text-amber-300">
          Waiting on them, one per line
        </label>
        <p className="mt-1 text-xs text-muted-2">
          Shown on their page with the date it started. Editing a line you have not changed keeps
          its original date.
        </p>
        <textarea
          id="waitingOn"
          rows={3}
          value={waiting}
          onChange={(e) => { setWaiting(e.target.value); setSavedWaiting(false); }}
          placeholder={"Photos of the workshop\nThe about page text"}
          className="mt-2 w-full rounded-lg border border-line-2 bg-surface px-3 py-2 text-xs leading-relaxed text-text placeholder:text-muted-2"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await saveWaitingOn(reference, waiting);
              setSavedWaiting(true);
              router.refresh();
            })
          }
          className="mt-2 rounded-lg border border-turq/50 px-3 py-1.5 text-xs font-semibold text-turq disabled:opacity-60"
        >
          {pending ? "Saving…" : savedWaiting ? "Saved" : "Save the list"}
        </button>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-2">
        Change requests ({changes.length})
      </p>
      {changes.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nothing asked for yet.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {[...changes].reverse().map((change) => (
            <ChangeRow key={change.id} reference={reference} change={change} />
          ))}
        </ul>
      )}
    </div>
  );
}
