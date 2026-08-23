"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteLeadAction } from "@/app/admin/actions";

/**
 * Delete one lead, permanently.
 *
 * Three deliberate choices:
 *
 *  - It is a real `<dialog showModal()>`, not a `confirm()`. A native confirm
 *    blocks the whole page, cannot show which record is about to go, and reads
 *    as a browser warning rather than as a decision about someone's enquiry.
 *  - It is modal rather than a box tucked into the grid row. The delete control
 *    sits in the last column of a table that scrolls sideways, so an inline
 *    confirmation opens where you cannot see it. Centred in the viewport, it is
 *    always in front of you.
 *  - `<dialog>` earns Escape-to-close and a focus trap for free, which a
 *    hand-rolled overlay has to reimplement and usually gets wrong.
 *
 * It names the customer and the reference before asking, because the whole risk
 * here is deleting the wrong row, and there is no trash to fish it back out of.
 */
export function DeleteLead({
  reference,
  who,
  variant = "inline",
  onDeleted,
}: {
  reference: string;
  /** Whatever identifies this lead to a human. A name, or the business. */
  who: string;
  /** "inline" sits in a grid row; "panel" is the block on the detail page. */
  variant?: "inline" | "panel";
  /** Where to go afterwards. Omitted means stay put and let the list refresh. */
  onDeleted?: "back-to-list";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function open() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteLeadAction(reference);
      if (result.error) {
        setError(result.error);
        return;
      }
      dialogRef.current?.close();
      if (onDeleted === "back-to-list") router.push("/admin");
      else router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={
          variant === "panel"
            ? "rounded-xl border border-pink/50 px-4 py-2 font-display text-sm font-semibold text-pink transition-colors hover:bg-pink/10"
            : "rounded-lg px-2 py-1 text-xs text-muted-2 transition-colors hover:bg-pink/10 hover:text-pink"
        }
      >
        {variant === "panel" ? "Delete this lead" : "Delete"}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`delete-title-${reference}`}
        className="u-dialog w-[min(26rem,calc(100vw-2rem))] rounded-xl2 border border-pink/50 bg-surface p-5 text-left text-text"
      >
        <h2 id={`delete-title-${reference}`} className="font-display text-lg font-bold text-text">
          Delete {who || reference}?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          <span className="font-mono text-text">{reference}</span> and everything they told you goes
          for good. There is no undo and no trash.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={confirmDelete}
            disabled={pending}
            className="rounded-xl bg-pink px-4 py-2 font-display text-sm font-semibold text-ink transition-opacity disabled:opacity-60"
          >
            {pending ? "Deleting…" : "Yes, delete for good"}
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={pending}
            className="rounded-xl border border-line-2 px-4 py-2 font-display text-sm font-semibold text-muted transition-colors hover:text-text"
          >
            Keep it
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm leading-snug text-pink">
            {error}
          </p>
        )}
      </dialog>
    </>
  );
}
