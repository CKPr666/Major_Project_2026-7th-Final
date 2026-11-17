"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { getDashboardRouteForRole, normalizeRole } from "@/lib/auth";

function parseHashParams(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return params;
}

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying your confirmation link...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenHash = url.searchParams.get("token_hash") ?? url.searchParams.get("tokenHash");
    const token = url.searchParams.get("token");
    const type = url.searchParams.get("type") ?? "email";
    const hashParams = parseHashParams(window.location.hash);
    const hashTokenHash = hashParams.get("token_hash") ?? hashParams.get("tokenHash");
    const hashToken = hashParams.get("token");

    const finalTokenHash = tokenHash ?? hashTokenHash;
    const finalToken = token ?? hashToken;
    const verificationType = type || "email";

    if (!finalTokenHash && !finalToken) {
      setError("Unable to verify your email because the confirmation token is missing. Please use the link from your confirmation email.");
      setStatus("Verification failed");
      return;
    }

    const verifyEmail = async () => {
      setStatus("Verifying your confirmation link...");
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const verifyParams: Record<string, unknown> = {
        type: verificationType,
      };

      if (finalTokenHash) {
        verifyParams["token_hash"] = finalTokenHash;
      } else if (finalToken) {
        verifyParams["token"] = finalToken;
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp(verifyParams as any);

      if (verifyError) {
        setError(verifyError.message || "Email verification failed. Please try again or request a new confirmation email.");
        setStatus("Verification failed");
        return;
      }

      const user = data.session?.user ?? data.user;
      if (!user) {
        setError("Email verified, but your authenticated session could not be established. Please sign in again.");
        setStatus("Verification failed");
        return;
      }

      const profileResponse = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileResponse.data && profileResponse.data.role) {
        router.push(getDashboardRouteForRole(profileResponse.data.role));
        return;
      }

      const userMeta = (user.user_metadata as any) ?? null;
      const metaFullName = userMeta?.full_name ?? userMeta?.fullName ?? "Parthi Karay";
      const metaRole = normalizeRole(userMeta?.role ?? undefined) ?? "student";

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: metaFullName,
            email: user.email ?? "",
            role: metaRole,
          },
          { onConflict: "id" }
        );

      if (upsertError) {
        setError(upsertError.message || "Your email was verified, but we could not create your profile. Please contact support.");
        setStatus("Verification failed");
        return;
      }

      router.push(getDashboardRouteForRole(metaRole));
    };

    verifyEmail();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-slate-950">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Confirming your email</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {status}
          </p>
          {error ? (
            <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
              <p>{error}</p>
              <p className="mt-3">
                If your confirmation link has expired or already been used, please sign in again or request a new confirmation email.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
