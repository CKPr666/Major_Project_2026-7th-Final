"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthPageShell from "@/components/AuthPageShell";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { getAuthErrorMessage, getDashboardRouteForRole, normalizeRole } from "@/lib/auth";

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Log in to Skill-Sync AI"
      description="Access your account and continue building evidence-backed candidate matching."
    >
      <LoginForm />
    </AuthPageShell>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(getAuthErrorMessage(signInError.message));
      return;
    }

    const user = data.session?.user ?? data.user;

    if (!user) {
      setError("Unable to sign in. Please try again.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile && profile.role) {
      router.push(getDashboardRouteForRole(profile.role));
      return;
    }

    // Profile missing: try to create it from the user's auth metadata (if present)
    const metadataUser = data.session?.user ?? data.user;
    const userMeta = (metadataUser?.user_metadata as any) ?? null;
    const metaFullName = userMeta?.full_name ?? userMeta?.fullName ?? null;
    const metaRole = userMeta?.role ?? null;
    const normalized = normalizeRole(metaRole ?? undefined);

    if (metaFullName && normalized) {
      // Create profile client-side using the authenticated browser Supabase client
      // so the request carries the user's JWT and RLS allows the insert.
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: metaFullName,
            email: user.email ?? "",
            role: normalized,
          },
          { onConflict: "id" }
        );

      if (!upsertError) {
        router.push(getDashboardRouteForRole(normalized));
        return;
      }

      setError(upsertError.message || "Failed to create your profile after sign-in. Please contact support.");
      return;
    }

    // No metadata available — attempt a safe fallback profile for this prototype.
    const fallbackFullName = "Parthi Karay";
    const fallbackRole = normalizeRole("student") ?? "student";

    const { error: fallbackError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: fallbackFullName,
          email: user.email ?? "",
          role: fallbackRole,
        },
        { onConflict: "id" }
      );

    if (!fallbackError) {
      router.push(getDashboardRouteForRole(fallbackRole));
      return;
    }

    setError(fallbackError.message || "No profile found for this account. Please complete your profile or contact support.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
          required
        />
      </div>

      {error ? <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading ? "Signing in…" : "Sign in"}
      </button>

      <div className="flex flex-col gap-3 text-center text-sm text-slate-600 sm:flex-row sm:justify-between">
        <Link href="/forgot-password" className="font-medium text-slate-950 transition hover:text-slate-700">
          Forgot password?
        </Link>
        <p>
          New here?{' '}
          <Link href="/signup" className="font-semibold text-slate-950 transition hover:text-slate-700">
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}
