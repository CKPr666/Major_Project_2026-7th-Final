import { redirect } from "next/navigation";
import StudentDashboardShell from "@/components/StudentDashboardShell";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getDashboardRouteForRole, normalizeRole } from "@/lib/auth";

export default async function StudentDashboardPage() {
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

  if (!normalizedRole || normalizedRole !== "student") {
    redirect(getDashboardRouteForRole(profile.role));
  }

  const displayName = user.user_metadata?.full_name || user.email || "Student";

  return <StudentDashboardShell displayName={displayName} email={user.email} />;
}
