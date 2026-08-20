"use client";

import type { ReactNode } from "react";
import { formatMoney } from "@/lib/rate-card";

/* Defined at module scope on purpose. A component declared inside another
   component is a brand new type on every render, which remounts it and kills
   focus, carets and animations mid-typing. */

export function Question({
  index,
  title,
  hint,
  children,
}: {
  index?: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-1 flex items-baseline gap-3 p-0">
        {index ? (
          <span className="font-display text-xs font-bold tracking-[0.14em] text-turq">{index}</span>
        ) : null}
        <span className="font-display text-xl font-bold leading-snug text-text sm:text-2xl">
          {title}
        </span>
      </legend>
      {hint ? <p className="mb-5 mt-2 text-[15px] leading-relaxed text-muted">{hint}</p> : <div className="mb-5" />}
      {children}
    </fieldset>
  );
}

export function OptionCard({
  selected,
  onSelect,
  label,
  blurb,
  price,
  type = "radio",
  name,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  blurb?: string;
  price?: number;
  type?: "radio" | "checkbox";
  name?: string;
}) {
  return (
    <label
      className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200 sm:p-5 ${
        selected
          ? "border-turq/60 bg-turq/[0.07] shadow-[0_0_0_1px_rgba(42,232,206,0.25)]"
          : "border-line bg-surface/50 hover:border-line-2 hover:bg-surface"
      }`}
    >
      <input
        type={type}
        name={name}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-all duration-200 ${
          type === "radio" ? "rounded-full" : "rounded-md"
        } ${selected ? "border-turq bg-turq" : "border-line-2 bg-ink/60 group-hover:border-muted-2"}`}
      >
        {selected ? (
          type === "radio" ? (
            <span className="h-2 w-2 rounded-full bg-ink" />
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6.2l2.3 2.3L9.5 3.8" stroke="#05070b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className={`font-display text-[16px] font-semibold ${selected ? "text-text" : "text-text/90"}`}>
            {label}
          </span>
          {price !== undefined ? (
            <span
              className={`shrink-0 font-display text-sm font-bold tabular-nums ${
                price === 0 ? "text-muted-2" : "text-turq"
              }`}
            >
              {price === 0 ? "No charge" : `+${formatMoney(price)}`}
            </span>
          ) : null}
        </span>
        {blurb ? <span className="mt-1.5 block text-[14px] leading-relaxed text-muted">{blurb}</span> : null}
      </span>
    </label>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  error,
  id,
  autoComplete,
  multiline,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  id: string;
  autoComplete?: string;
  multiline?: boolean;
}) {
  const cls = `w-full rounded-xl border bg-ink/60 px-4 py-3 text-[15px] text-text placeholder:text-muted-2/70 transition-colors ${
    error ? "border-pink/70" : "border-line focus:border-turq/60"
  }`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-display text-sm font-semibold text-text">
        {label}
        {required ? <span className="ml-1 text-pink">*</span> : <span className="ml-2 text-xs font-normal text-muted-2">optional</span>}
      </label>
      {hint ? <p className="mb-2 text-[13px] leading-relaxed text-muted-2">{hint}</p> : null}
      {multiline ? (
        <textarea
          id={id}
          value={value}
          rows={4}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${cls} resize-y`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cls}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[13px] text-pink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  blurb,
  price,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  blurb?: string;
  price?: number;
}) {
  return (
    <OptionCard
      type="checkbox"
      selected={checked}
      onSelect={() => onChange(!checked)}
      label={label}
      blurb={blurb}
      price={price}
    />
  );
}
