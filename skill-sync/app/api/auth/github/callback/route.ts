import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    const redirectUrl = new URL("/student/dashboard", request.url);
    redirectUrl.searchParams.set("github", "error");
    redirectUrl.searchParams.set("message", errorDescription || "GitHub authorization was cancelled or failed.");
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    const redirectUrl = new URL("/student/dashboard", request.url);
    redirectUrl.searchParams.set("github", "error");
    redirectUrl.searchParams.set("message", "GitHub authorization did not return a valid code.");
    return NextResponse.redirect(redirectUrl);
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("github_oauth_state")?.value;

  if (!storedState || storedState !== state) {
    const redirectUrl = new URL("/student/dashboard", request.url);
    redirectUrl.searchParams.set("github", "error");
    redirectUrl.searchParams.set("message", "GitHub authorization state could not be verified.");
    return NextResponse.redirect(redirectUrl);
  }

  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!githubClientId || !githubClientSecret) {
    const redirectUrl = new URL("/student/dashboard", request.url);
    redirectUrl.searchParams.set("github", "error");
    redirectUrl.searchParams.set("message", "GitHub OAuth is not configured yet.");
    return NextResponse.redirect(redirectUrl);
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: githubClientId,
      client_secret: githubClientSecret,
      code,
      redirect_uri: new URL("/api/auth/github/callback", request.url).toString(),
    }),
  });

  if (!tokenResponse.ok) {
    const redirectUrl = new URL("/student/dashboard", request.url);
    redirectUrl.searchParams.set("github", "error");
    redirectUrl.searchParams.set("message", "GitHub token exchange failed.");
    return NextResponse.redirect(redirectUrl);
  }

  const tokenPayload = await tokenResponse.json();
  const accessToken = tokenPayload.access_token;

  if (!accessToken) {
    const redirectUrl = new URL("/student/dashboard", request.url);
    redirectUrl.searchParams.set("github", "error");
    redirectUrl.searchParams.set("message", "GitHub did not return an access token.");
    return NextResponse.redirect(redirectUrl);
  }

  const redirectUrl = new URL("/student/dashboard", request.url);
  redirectUrl.searchParams.set("github", "success");
  redirectUrl.searchParams.set("message", "GitHub connected successfully.");

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("github_access_token", accessToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
