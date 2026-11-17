import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getDashboardRouteForRole, normalizeRole } from "@/lib/auth";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const normalizedRole = normalizeRole(profile.role);

  if (!normalizedRole || normalizedRole !== "student") {
    return NextResponse.redirect(new URL(getDashboardRouteForRole(profile.role), request.url));
  }

  const githubClientId = process.env.GITHUB_CLIENT_ID;

  if (!githubClientId) {
    const errorUrl = new URL("/student/dashboard", request.url);
    errorUrl.searchParams.set("github", "error");
    errorUrl.searchParams.set("message", "GitHub OAuth is not configured yet.");
    return NextResponse.redirect(errorUrl);
  }

  const cookieStore = await cookies();
  const state = crypto.randomUUID();

  const githubAuthorizeUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthorizeUrl.searchParams.set("client_id", githubClientId);
  githubAuthorizeUrl.searchParams.set("redirect_uri", new URL("/api/auth/github/callback", request.url).toString());
  githubAuthorizeUrl.searchParams.set("scope", "read:user");
  githubAuthorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(githubAuthorizeUrl.toString());
  response.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
  });

  return response;
}
