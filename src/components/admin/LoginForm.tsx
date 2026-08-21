"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const INITIAL: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  return (
    <form action={formAction} className="u-card p-6">
      <label htmlFor="password" className="block font-display text-sm font-semibold text-text">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        className="mt-2 w-full rounded-xl border border-line-2 bg-ink px-4 py-3 text-text placeholder:text-muted-2"
        placeholder="••••••••••••"
      />

      {state.error && (
        <p role="alert" className="mt-3 text-sm text-pink">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-xl bg-turq px-5 py-3 font-display font-semibold text-ink transition-opacity disabled:opacity-60"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
