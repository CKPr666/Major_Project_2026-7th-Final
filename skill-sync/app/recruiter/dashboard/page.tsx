import { redirect } from "next/navigation";
import RecruiterDashboardShell from "@/components/RecruiterDashboardShell";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getDashboardRouteForRole, normalizeRole } from "@/lib/auth";

export default async function RecruiterDashboardPage() {
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

  const normalizedRole = normalizeRole(profile.role);

  if (normalizedRole !== "recruiter") {
    redirect(getDashboardRouteForRole(profile.role));
  }

  return <RecruiterDashboardShell />;
}
