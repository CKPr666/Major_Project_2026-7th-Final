import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getDashboardRouteForRole, normalizeRole } from "@/lib/auth";
import RepositoryAnalysisSection from "@/components/RepositoryAnalysisSection";
import RepositoryDetailsClient from "@/components/RepositoryDetailsClient";

type PageProps = {
  params: {
    owner: string;
    repo: string;
  };
};

type RepositoryInfo = {
  name: string;
  owner: string;
  description: string | null;
  html_url: string;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

export default async function RepositoryPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/login");
  }

  const normalizedRole = normalizeRole(profile.role);
  if (!normalizedRole || normalizedRole !== "student") {
    redirect(getDashboardRouteForRole(profile.role));
  }

  // The server component keeps the Supabase authentication checks,
  // but repository fetching is delegated to a client component that
  // reads the dynamic route params reliably and calls the secure
  // server API which uses the same cookie-based GitHub token.

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.15),_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#f8f7f5_100%)] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Repository Analysis</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Repository details</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              View repository metadata and access the analysis placeholder.
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Back to Repositories
          </Link>
        </div>

        <RepositoryDetailsClient />
      </div>
    </div>
  );
}
