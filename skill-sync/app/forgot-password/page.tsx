"use client";

import Link from "next/link";
import { useState } from "react";
import AuthPageShell from "@/components/AuthPageShell";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { getAuthErrorMessage } from "@/lib/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Reset your password"
      description="Enter your account email and we’ll send a password reset link right away."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setIsLoading(false);

    if (resetError) {
      setError(getAuthErrorMessage(resetError.message));
      return;
    }

    setMessage("A password reset link has been sent to your email.");
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

      {error ? <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Remembered your password?{' '}
        <Link href="/login" className="font-semibold text-slate-950 transition hover:text-slate-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
