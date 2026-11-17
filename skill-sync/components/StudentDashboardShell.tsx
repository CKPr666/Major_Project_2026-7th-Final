"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

type GitHubRepository = {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

type StudentDashboardShellProps = {
  displayName: string;
  email?: string | null;
};

type NavItem = {
  label: string;
  description: string;
  isActive?: boolean;
};

const navItems: NavItem[] = [
  { label: "Dashboard", description: "Overview", isActive: true },
  { label: "GitHub", description: "Connect account" },
  { label: "Projects", description: "Repositories" },
  { label: "Skills", description: "Verified strengths" },
  { label: "Evidence", description: "Proof points" },
  { label: "Profile", description: "Public profile" },
];

function MetricCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)]">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

export default function StudentDashboardShell({ displayName, email }: StudentDashboardShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const githubStatus = searchParams?.get("github") ?? null;
  const githubMessage = searchParams?.get("message") ?? null;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [githubNotice, setGithubNotice] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoadingRepositories, setIsLoadingRepositories] = useState(false);
  const [repositoriesError, setRepositoriesError] = useState<string | null>(null);
  const [hasGitHubConnected, setHasGitHubConnected] = useState(false);

  useEffect(() => {
    if (githubStatus === "success" && githubMessage) {
      setGithubNotice(githubMessage);
      return;
    }

    if (githubStatus === "error" && githubMessage) {
      setGithubNotice(githubMessage);
    }
  }, [githubStatus, githubMessage]);

  useEffect(() => {
    if (!hasGitHubConnected) {
      return;
    }

    let isMounted = true;
    const loadRepositories = async () => {
      setIsLoadingRepositories(true);
      setRepositoriesError(null);

      try {
        const response = await fetch("/api/github/repositories", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load repositories right now.");
        }
        if (!isMounted) {
          return;
        }

        setRepositories(Array.isArray(payload.repositories) ? payload.repositories : []);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setRepositories([]);
        setRepositoriesError(error instanceof Error ? error.message : "Unable to load repositories right now.");
      } finally {
        if (isMounted) {
          setIsLoadingRepositories(false);
        }
      }
    };

    loadRepositories();

    return () => {
      isMounted = false;
    };
  }, [hasGitHubConnected]);

  useEffect(() => {
    if (githubStatus === "success") {
      setHasGitHubConnected(true);
    }
  }, [githubStatus]);

  const initials = useMemo(() => {
    const cleaned = displayName.trim();
    if (!cleaned) return "S";

    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [displayName]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.15),_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#f8f7f5_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-slate-950 px-5 py-6 text-slate-100 transition-transform duration-200 lg:static lg:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white ring-1 ring-white/10">
                S
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">Skill-Sync AI</p>
                <p className="text-sm text-slate-400">Student workspace</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close navigation"
            >
              ✕
            </button>
          </div>

          <nav className="mt-8 space-y-1" aria-label="Student sections">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  item.isActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>
                  <span className="mr-2">{item.isActive ? "●" : "○"}</span>
                  {item.label}
                </span>
                <span className="text-xs opacity-70">{item.description}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">Ready to turn code into evidence?</p>
            <p className="mt-1 text-sm text-slate-400">Connect GitHub to build a verified skill profile.</p>
          </div>

          <div className="mt-4">
            <LogoutButton />
          </div>
        </aside>

        {mobileSidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
            aria-label="Close navigation overlay"
            onClick={() => setMobileSidebarOpen(false)}
          />
        ) : null}

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 p-2 text-slate-700 lg:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open navigation"
                >
                  ☰
                </button>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Student Dashboard</p>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">Welcome back, {displayName}</h1>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-950">{displayName}</p>
                  <p className="text-xs text-slate-500">{email || "Student"}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.35)] sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Skill-Sync AI</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Welcome back, {displayName} 👋
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                    Turn your coding activity into verified skills and evidence.
                  </p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 text-sm ${hasGitHubConnected ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                  {hasGitHubConnected ? "GitHub connected successfully." : "GitHub connection is coming next."}
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Skills Identified" value="0" hint="No repositories analyzed yet" />
              <MetricCard title="Projects Analyzed" value="0" hint="Waiting for GitHub activity" />
              <MetricCard title="Evidence Collected" value="0" hint="Proof points will appear here" />
              <MetricCard title="Skill-Sync Score" value="--" hint="Score will be available after analysis" />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_25px_80px_-40px_rgba(15,23,42,0.45)] sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">GitHub</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">{hasGitHubConnected ? "Your GitHub Repositories" : "Connect your GitHub"}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                      {hasGitHubConnected
                        ? "Your repositories are now available for review from the secure GitHub connection."
                        : "Connect your GitHub account to analyze your repositories, technologies, project documentation and coding evidence."}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    onClick={() => {
                      window.location.href = "/api/auth/github";
                    }}
                  >
                    {hasGitHubConnected ? "Refresh repositories" : "Connect GitHub"}
                  </button>
                </div>
                {githubNotice ? (
                  <p className="mt-5 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200">
                    {githubNotice}
                  </p>
                ) : null}

                {hasGitHubConnected ? (
                  <div className="mt-6 space-y-3">
                    {isLoadingRepositories ? (
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-slate-200">
                        Loading your repositories...
                      </div>
                    ) : repositoriesError ? (
                      <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
                        {repositoriesError}
                      </div>
                    ) : repositories.length > 0 ? (
                      <div className="space-y-3">
                        {repositories.map((repository) => (
                          <Link
                            key={repository.id}
                            href={`/student/repository/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}`}
                            className="group block rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:border-white/20 hover:bg-white/20"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-white group-hover:text-slate-50">
                                  {repository.name}
                                </p>
                                <p className="mt-1 text-sm text-slate-300 group-hover:text-slate-200">
                                  {repository.description || "No description provided."}
                                </p>
                                <p className="mt-2 text-xs text-slate-400 group-hover:text-slate-200">
                                  {repository.owner} / {repository.name}
                                </p>
                              </div>
                              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300 group-hover:border-slate-200">
                                {repository.private ? "Private" : "Public"}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                              {repository.language ? <span>Language: {repository.language}</span> : null}
                              <span>⭐ {repository.stargazers_count}</span>
                              <span>↺ {repository.forks_count}</span>
                              <span>Updated {new Date(repository.updated_at).toLocaleDateString()}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-slate-200">
                        No GitHub repositories found.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.3)] sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Recent Analysis</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">No repositories analyzed yet.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Connect GitHub to start building your evidence-based skill profile.
                </p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  onClick={() => {
                    window.location.href = "/api/auth/github";
                  }}
                >
                  {hasGitHubConnected ? "Refresh repositories" : "Start with GitHub"}
                </button>
              </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.3)] sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Your Skill Profile</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Your verified skills will appear here.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Your verified skills will appear here after your GitHub repositories are analyzed.
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.3)] sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Evidence</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Evidence is still being gathered.</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Repository activity, README content, dependencies and project work will eventually contribute evidence toward your skills.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
