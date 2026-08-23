import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminConfigProblem, isSignedIn } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isSignedIn()) redirect("/admin");

  const problem = adminConfigProblem();

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-display text-xl font-bold text-text">
            Built By A Real <span className="text-turq">Person</span>
          </div>
          <p className="mt-1 text-sm text-muted">Back office</p>
        </div>

        {problem ? (
          <div className="rounded-xl2 border border-pink/40 bg-pink/10 p-5 text-sm text-text">
            <p className="font-display font-semibold text-pink">Not set up yet</p>
            <p className="mt-2 leading-relaxed text-muted">
              {problem === "no-password" &&
                "ADMIN_PASSWORD is not set on this deployment. Set it in the Vercel project's environment variables and redeploy."}
              {problem === "weak-password" &&
                "ADMIN_PASSWORD is set but shorter than 12 characters. This is the only lock on every customer's contact details. Set a longer one."}
              {problem === "no-secret" &&
                "ADMIN_SESSION_SECRET is not set, so a session cookie cannot be signed. Set it to a long random string and redeploy."}
            </p>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}
