"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LeadRow } from "@/lib/lead-view";
import { LEAD_STATUSES, STATUS_META, isClosed, statusIndex, type LeadStatus } from "@/lib/pipeline";
import { StatusSelect } from "./StatusSelect";
import { DeleteLead } from "./DeleteLead";
import { DeliveryBadge } from "./DeliveryBadge";

type SortKey = "idle" | "arrived" | "stage" | "value" | "name";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "idle", label: "Longest untouched" },
  { id: "arrived", label: "Newest first" },
  { id: "stage", label: "Furthest along" },
  { id: "value", label: "Biggest first" },
  { id: "name", label: "Name A-Z" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "no date";
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "2-digit" });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "no date";
  return d.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function idleLabel(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function ContactLinks({ row, className = "" }: { row: LeadRow; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${className}`}>
      {row.email ? (
        <a href={`mailto:${row.email}`} className="break-all text-turq underline-offset-2 hover:underline">
          {row.email}
        </a>
      ) : (
        <span className="text-muted-2">no email</span>
      )}
      {row.whatsapp ? (
        <a
          href={`https://wa.me/${row.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`WhatsApp ${row.phone}`}
          className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20"
        >
          WhatsApp
        </a>
      ) : row.phone ? (
        <a href={`tel:${row.phone}`} className="text-muted hover:text-turq">
          {row.phone}
        </a>
      ) : null}
    </div>
  );
}

export function LeadsTable({ rows }: { rows: LeadRow[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LeadStatus | "all" | "open">("open");
  const [sort, setSort] = useState<SortKey>("idle");

  const counts = useMemo(() => {
    const map = new Map<LeadStatus, number>();
    for (const status of LEAD_STATUSES) map.set(status, 0);
    for (const row of rows) map.set(row.status, (map.get(row.status) ?? 0) + 1);
    return map;
  }, [rows]);

  const openCount = rows.filter((r) => !isClosed(r.status)).length;
  const staleCount = rows.filter((r) => r.stale).length;
  // A bounced email is a lead that never heard from you and never will, which
  // is a worse dropped ball than one that has merely gone quiet.
  const undeliveredCount = rows.filter((r) => r.deliveryProblem || r.emailFailed).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      if (filter === "open" && isClosed(row.status)) return false;
      if (filter !== "all" && filter !== "open" && row.status !== filter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.business.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.reference.toLowerCase().includes(q) ||
        row.wants.toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case "idle":
          // Stale first, then longest untouched. That ordering is the whole
          // point of the page: the thing most likely to be dropped is on top.
          if (a.stale !== b.stale) return a.stale ? -1 : 1;
          return b.daysInStage - a.daysInStage;
        case "arrived":
          return b.createdAt.localeCompare(a.createdAt);
        case "stage":
          return statusIndex(b.status) - statusIndex(a.status);
        case "value":
          return b.total - a.total;
        case "name":
          return (a.name || a.business).localeCompare(b.name || b.business);
      }
    });
    return sorted;
  }, [rows, query, filter, sort]);

  return (
    <div>
      {/* Stage counts. Each one filters the list. */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <FilterChip active={filter === "open"} onClick={() => setFilter("open")} label="Open" count={openCount} />
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" count={rows.length} />
        <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
        {LEAD_STATUSES.map((status) => (
          <FilterChip
            key={status}
            active={filter === status}
            onClick={() => setFilter(status)}
            label={STATUS_META[status].label}
            count={counts.get(status) ?? 0}
            dot={STATUS_META[status].dot}
          />
        ))}
      </div>

      {staleCount > 0 && (
        <p className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-200">
          <strong className="font-semibold">{staleCount}</strong>{" "}
          {staleCount === 1 ? "lead has" : "leads have"} sat in the same stage longer than they
          should have. Sorted to the top.
        </p>
      )}

      {undeliveredCount > 0 && (
        <p className="mb-5 rounded-xl border border-pink/40 bg-pink/10 px-4 py-2.5 text-sm text-pink">
          <strong className="font-semibold">{undeliveredCount}</strong>{" "}
          {undeliveredCount === 1 ? "lead" : "leads"} never received their email. Check the address
          and reach them another way. They are waiting on something that is not coming.
        </p>
      )}

      {/* Search and sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, business, email, phone, reference..."
          aria-label="Search leads"
          className="w-full flex-1 rounded-xl border border-line-2 bg-ink px-4 py-2.5 text-sm text-text placeholder:text-muted-2"
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <span className="whitespace-nowrap">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-xl border border-line-2 bg-ink px-3 py-2.5 text-sm text-text"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id} className="bg-surface">
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mb-3 text-sm text-muted">
        Showing {visible.length} of {rows.length}
      </p>

      {visible.length === 0 ? (
        <div className="rounded-xl2 border border-line bg-surface px-6 py-14 text-center">
          <p className="font-display text-lg text-text">Nothing here</p>
          <p className="mt-1 text-sm text-muted">
            {rows.length === 0
              ? "No estimate has been submitted yet. The first one appears here on its own."
              : "No lead matches that filter."}
          </p>
        </div>
      ) : (
        <>
          {/* Wide screens: the grid */}
          <div className="hidden overflow-x-auto rounded-xl2 border border-line bg-surface md:block">
            <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-muted-2">
                  <Th className="w-[195px]">Stage</Th>
                  <Th className="w-[95px]">Idle</Th>
                  <Th>Customer</Th>
                  <Th>Contact</Th>
                  <Th className="w-[135px]">Estimate</Th>
                  <Th>Wants</Th>
                  <Th className="w-[125px]">Arrived</Th>
                  <Th className="w-[130px]">
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr
                    key={row.reference}
                    className="border-b border-line/60 align-top transition-colors last:border-0 hover:bg-surface-2"
                  >
                    <Td>
                      <StatusSelect reference={row.reference} status={row.status} compact />
                    </Td>
                    <Td>
                      <span
                        title={`In this stage since ${formatDateTime(row.statusChangedAt)}`}
                        className={`whitespace-nowrap ${row.stale ? "font-semibold text-amber-300" : "text-muted"}`}
                      >
                        {row.stale ? "! " : ""}
                        {idleLabel(row.daysInStage)}
                      </span>
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/${row.reference}`}
                        className="font-semibold text-text hover:text-turq"
                      >
                        {row.name || "(no name given)"}
                      </Link>
                      {row.business && <div className="text-muted">{row.business}</div>}
                      <div className="mt-0.5 font-mono text-[11px] text-muted-2">{row.reference}</div>
                    </Td>
                    <Td>
                      <ContactLinks row={row} />
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {row.emailFailed ? (
                          <span className="text-xs text-pink">estimate email never sent</span>
                        ) : (
                          <DeliveryBadge status={row.estimateDelivery} detail={row.deliveryDetail} />
                        )}
                      </div>
                      {row.deliveryDetail && row.deliveryProblem && (
                        <div className="mt-1 max-w-[260px] text-xs leading-snug text-pink">
                          {row.deliveryDetail}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <div className="font-display font-semibold text-text">{row.totalLabel}</div>
                      <div className="text-xs text-muted-2">{row.bandLabel}</div>
                    </Td>
                    <Td>
                      <div className="max-w-[330px] text-[13px] leading-snug text-muted">
                        {row.wants || "nothing specified"}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {row.timeline && <Tag>{row.timeline}</Tag>}
                        {row.hasNotes && <Tag tone="turq">has notes</Tag>}
                      </div>
                    </Td>
                    <Td>
                      <div className="whitespace-nowrap text-muted">{formatDate(row.createdAt)}</div>
                      <div className="text-xs text-muted-2">{idleLabel(row.daysSinceArrival)} ago</div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/${row.reference}`}
                          aria-label={`Open ${row.reference}`}
                          className="rounded-lg px-2 py-1 text-xs text-muted hover:text-turq"
                        >
                          Open &rarr;
                        </Link>
                        <DeleteLead reference={row.reference} who={row.name || row.business} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phones: the same data, stacked */}
          <ul className="space-y-3 md:hidden">
            {visible.map((row) => (
              <li key={row.reference} className="rounded-xl2 border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/${row.reference}`}
                      className="font-display font-semibold text-text"
                    >
                      {row.name || "(no name given)"}
                    </Link>
                    {row.business && <div className="truncate text-sm text-muted">{row.business}</div>}
                  </div>
                  <div
                    className={`whitespace-nowrap text-xs ${row.stale ? "font-semibold text-amber-300" : "text-muted-2"}`}
                  >
                    {row.stale ? "! " : ""}
                    {idleLabel(row.daysInStage)}
                  </div>
                </div>

                <div className="mt-3">
                  <StatusSelect reference={row.reference} status={row.status} />
                </div>

                <ContactLinks row={row} className="mt-3" />
                <div className="mt-2">
                  {row.emailFailed ? (
                    <span className="text-xs text-pink">estimate email never sent</span>
                  ) : (
                    <DeliveryBadge status={row.estimateDelivery} detail={row.deliveryDetail} />
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-line/60 pt-3">
                  <div>
                    <span className="font-display font-semibold text-text">{row.totalLabel}</span>
                    <span className="ml-2 text-xs text-muted-2">{row.bandLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DeleteLead reference={row.reference} who={row.name || row.business} />
                    <Link href={`/admin/${row.reference}`} className="text-sm text-turq">
                      Open &rarr;
                    </Link>
                  </div>
                </div>

                <div className="mt-2 font-mono text-[11px] text-muted-2">
                  {row.reference} &middot; {formatDate(row.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2.5 font-semibold ${className}`}>{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-3.5">{children}</td>;
}

function Tag({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "turq" }) {
  const styles =
    tone === "turq" ? "border-turq/40 bg-turq/10 text-turq" : "border-line-2 bg-ink text-muted";
  return <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[11px] ${styles}`}>{children}</span>;
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-turq bg-turq/15 text-turq"
          : "border-line-2 bg-surface text-muted hover:border-line-2 hover:text-text"
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />}
      {label}
      <span className={active ? "text-turq" : "text-muted-2"}>{count}</span>
    </button>
  );
}
