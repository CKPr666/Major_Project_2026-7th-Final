import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeRole } from "@/lib/auth";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile could not be verified." }, { status: 401 });
  }

  const normalizedRole = normalizeRole(profile.role);
  if (!normalizedRole || normalizedRole !== "student") {
    return NextResponse.json({ error: "Student access required." }, { status: 403 });
  }

  const cookieStore = await cookies();
  const githubAccessToken = cookieStore.get("github_access_token")?.value;

  if (!githubAccessToken) {
    return NextResponse.json({ error: "GitHub is not connected yet." }, { status: 404 });
  }

  const githubResponse = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `token ${githubAccessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "skill-sync-ai",
    },
    cache: "no-store",
  });

  if (!githubResponse.ok) {
    const githubErrorText = await githubResponse.text();
    let githubErrorMessage = "Unable to load GitHub repositories right now.";

    try {
      const githubErrorPayload = JSON.parse(githubErrorText);
      if (typeof githubErrorPayload?.message === "string") {
        githubErrorMessage = githubErrorPayload.message;
      }
    } catch {
      // Ignore JSON parse failures and fall back to the default message.
    }

    console.error("GitHub repositories request failed", {
      status: githubResponse.status,
      statusText: githubResponse.statusText,
      message: githubErrorMessage,
      hasToken: Boolean(githubAccessToken),
    });

    return NextResponse.json({ error: githubErrorMessage }, { status: githubResponse.status });
  }

  const repositories = await githubResponse.json();

  const safeRepositories = Array.isArray(repositories)
    ? repositories.map((repo: any) => ({
        id: repo.id,
        owner: repo.owner?.login ?? "",
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description ?? "",
        html_url: repo.html_url,
        private: Boolean(repo.private),
        language: repo.language ?? null,
        stargazers_count: repo.stargazers_count ?? 0,
        forks_count: repo.forks_count ?? 0,
        updated_at: repo.updated_at,
      }))
    : [];

  return NextResponse.json({ repositories: safeRepositories });
}
