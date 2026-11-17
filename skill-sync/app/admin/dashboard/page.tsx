import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getDashboardRouteForRole } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  if (profile.role !== "College/TPO") {
    redirect(getDashboardRouteForRole(profile.role));
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">College / TPO Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Admin workspace</h1>
          </div>
          <LogoutButton />
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
          <p className="text-sm text-slate-600">This is a protected College/TPO dashboard placeholder for Skill-Sync AI.</p>
        </div>
      </div>
    </div>
  );
}
