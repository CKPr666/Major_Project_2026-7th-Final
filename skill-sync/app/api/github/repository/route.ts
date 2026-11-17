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

  const url = new URL(request.url);
  const owner = url.searchParams.get("owner") || "";
  const repo = url.searchParams.get("repo") || "";

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo query parameters." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const githubAccessToken = cookieStore.get("github_access_token")?.value;

  if (!githubAccessToken) {
    return NextResponse.json({ error: "GitHub is not connected yet." }, { status: 404 });
  }

  const githubResponse = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `token ${githubAccessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "skill-sync-ai",
    },
    cache: "no-store",
  });

  if (!githubResponse.ok) {
    const text = await githubResponse.text();
    let githubErrorMessage = `GitHub API error (status: ${githubResponse.status})`;
    try {
      const payload = JSON.parse(text);
      if (payload && typeof payload.message === "string") {
        githubErrorMessage = payload.message;
      }
    } catch {
      if (text) githubErrorMessage = text;
    }

    return NextResponse.json({ error: githubErrorMessage }, { status: githubResponse.status });
  }

  const repoPayload = await githubResponse.json();

  const safeRepository = {
    id: repoPayload.id,
    owner: repoPayload.owner?.login ?? owner,
    name: repoPayload.name,
    full_name: repoPayload.full_name,
    description: repoPayload.description ?? "",
    html_url: repoPayload.html_url,
    private: Boolean(repoPayload.private),
    language: repoPayload.language ?? null,
    stargazers_count: repoPayload.stargazers_count ?? 0,
    forks_count: repoPayload.forks_count ?? 0,
    updated_at: repoPayload.updated_at,
  };

  return NextResponse.json({ repository: safeRepository });
}
