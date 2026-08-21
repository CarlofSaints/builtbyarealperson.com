import { DELIVERY_META, type DeliveryStatus } from "@/lib/delivery";

const TONES: Record<"good" | "bad" | "warn" | "neutral", string> = {
  good: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  bad: "border-pink/50 bg-pink/10 text-pink",
  warn: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  neutral: "border-line-2 bg-ink text-muted-2",
};

/**
 * What happened to an email.
 *
 * `null` renders as "No word yet" rather than as nothing at all. A blank here
 * would read as "not delivered", when it actually means the webhook has not
 * spoken — and those two are the whole reason this exists.
 */
export function DeliveryBadge({
  status,
  detail,
  className = "",
}: {
  status: DeliveryStatus | null;
  detail?: string | null;
  className?: string;
}) {
  if (!status) {
    return (
      <span
        title="No delivery event has arrived for this message yet."
        className={`inline-block whitespace-nowrap rounded-md border border-line-2 bg-ink px-1.5 py-0.5 text-[11px] text-muted-2 ${className}`}
      >
        No word yet
      </span>
    );
  }

  const meta = DELIVERY_META[status];

  return (
    <span
      title={detail ? `${meta.blurb} — ${detail}` : meta.blurb}
      className={`inline-block whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${TONES[meta.tone]} ${className}`}
    >
      {meta.label}
    </span>
  );
}
