/**
 * What actually happened to an email after Resend accepted it.
 *
 * Until now a lead carried a provider message id and nothing else, which proves
 * the message was *accepted* and says nothing about whether anyone received it.
 * These are the states the delivery webhook fills in.
 *
 * Webhook events arrive out of order and more than once. Retries are normal,
 * `sent` can land after `delivered`, and `opened` can beat `delivered`. So the
 * state is MERGED by rank rather than overwritten — a stale event can never
 * drag a lead backwards from "delivered" to "sent".
 */

/** Which of the three messages an event is about. */
export const EMAIL_KINDS = ["customerEstimate", "ownerNotify", "bookingRequest"] as const;
export type EmailKind = (typeof EMAIL_KINDS)[number];

export const EMAIL_KIND_LABELS: Record<EmailKind, string> = {
  customerEstimate: "Estimate + PDF",
  ownerNotify: "Your notification",
  bookingRequest: "Booking request",
};

export const DELIVERY_STATUSES = [
  "sent",
  "delayed",
  "delivered",
  "complained",
  "bounced",
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

/**
 * Higher wins when two events disagree.
 *
 * `bounced` is top because it is the only one that needs you to do something:
 * the customer never got it and never will. `complained` outranks `delivered`
 * for the same reason — it implies delivery, and it is the more useful fact.
 */
const RANK: Record<DeliveryStatus, number> = {
  sent: 1,
  delayed: 2,
  delivered: 3,
  complained: 4,
  bounced: 5,
};

export type EmailDelivery = {
  status: DeliveryStatus;
  /** When the provider says the state was reached. */
  at: string;
  /** Bounce reason, complaint type, whatever the provider gave us. */
  detail?: string;
  /** Engagement. Not a status: opening implies delivery, it does not replace it. */
  openedAt?: string;
  clickedAt?: string;
};

export const DELIVERY_META: Record<
  DeliveryStatus,
  { label: string; blurb: string; tone: "good" | "bad" | "warn" | "neutral" }
> = {
  sent: {
    label: "Accepted",
    blurb: "Resend took the message. Nothing has confirmed it arrived.",
    tone: "neutral",
  },
  delayed: {
    label: "Delayed",
    blurb: "The receiving server is deferring it. It may still arrive.",
    tone: "warn",
  },
  delivered: {
    label: "Delivered",
    blurb: "The receiving mail server accepted it.",
    tone: "good",
  },
  complained: {
    label: "Marked as spam",
    blurb: "It arrived and they reported it. Do not email this address again.",
    tone: "bad",
  },
  bounced: {
    label: "Bounced",
    blurb: "It did not arrive and will not. The address is wrong or blocking you.",
    tone: "bad",
  },
};

/** Resend event name -> what it means here. Unknown names return null. */
export function statusFromEvent(type: string): DeliveryStatus | null {
  switch (type) {
    case "email.sent":
      return "sent";
    case "email.delivery_delayed":
      return "delayed";
    case "email.delivered":
      return "delivered";
    case "email.complained":
      return "complained";
    case "email.bounced":
    case "email.failed":
      return "bounced";
    default:
      return null;
  }
}

/**
 * Fold one event into whatever is already known.
 *
 * `opened` and `clicked` are timestamps rather than statuses, but an open is
 * proof of delivery, so it lifts the status to `delivered` if nothing better is
 * recorded yet — otherwise a message whose `delivered` event was lost would sit
 * on "Accepted" for ever while the customer is demonstrably reading it.
 */
export function mergeDelivery(
  current: EmailDelivery | undefined,
  event: { type: string; at: string; detail?: string },
): EmailDelivery {
  const base: EmailDelivery = current ?? { status: "sent", at: event.at };

  if (event.type === "email.opened") {
    return {
      ...base,
      status: RANK[base.status] >= RANK.delivered ? base.status : "delivered",
      openedAt: base.openedAt ?? event.at,
    };
  }

  if (event.type === "email.clicked") {
    return {
      ...base,
      status: RANK[base.status] >= RANK.delivered ? base.status : "delivered",
      openedAt: base.openedAt ?? event.at,
      clickedAt: base.clickedAt ?? event.at,
    };
  }

  const next = statusFromEvent(event.type);
  if (!next) return base;
  if (RANK[next] <= RANK[base.status]) return base;

  return { ...base, status: next, at: event.at, detail: event.detail ?? base.detail };
}

/** True when this email needs a human to do something about it. */
export function needsAttention(delivery: EmailDelivery | undefined): boolean {
  return delivery?.status === "bounced" || delivery?.status === "complained";
}
