"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type RepositoryInfo = {
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

export default function RepositoryDetailsClient() {
  const params = useParams();
  const rawOwner = params?.owner;
  const rawRepo = params?.repo;
  const ownerParam = Array.isArray(rawOwner) ? rawOwner[0] : rawOwner ?? "";
  const repoParam = Array.isArray(rawRepo) ? rawRepo[0] : rawRepo ?? "";
  const owner = decodeURIComponent(ownerParam || "");
  const repoName = decodeURIComponent(repoParam || "");

  const [repository, setRepository] = useState<RepositoryInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!owner || !repoName) {
      setErrorMessage("Missing owner or repository name in the URL.");
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const resp = await fetch(`/api/github/repository?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(
          repoName
        )}`, { cache: "no-store" });
        const payload = await resp.json();

        if (!resp.ok) {
          throw new Error(payload.error || "Unable to load repository details right now.");
        }

        if (!isMounted) return;
        setRepository(payload.repository ?? null);
      } catch (err) {
        if (!isMounted) return;
        setRepository(null);
        setErrorMessage(err instanceof Error ? err.message : String(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [ownerParam, repoParam, owner, repoName]);

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-950 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.12)]">
        <p className="text-sm font-semibold">Loading repository details...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-slate-950 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.12)]">
        <p className="text-sm font-semibold text-rose-700">Unable to load repository</p>
        <p className="mt-3 text-base leading-7 text-slate-700">{errorMessage}</p>
        <p className="mt-3 text-sm text-slate-600">Attempted repository: <strong>{owner}/{repoName}</strong></p>
        <p className="mt-5 text-sm text-slate-600">Check the owner and repository name in the URL, or reconnect your GitHub account from the dashboard.</p>
      </div>
    );
  }

  if (!repository) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.2)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">Repository overview</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{repository.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{repository.owner}</p>
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {repository.private ? "Private" : "Public"}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Primary language</p>
            <p className="mt-3 text-base font-semibold text-slate-900">{repository.language || "Unknown"}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Stars</p>
            <p className="mt-3 text-base font-semibold text-slate-900">{repository.stargazers_count}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Forks</p>
            <p className="mt-3 text-base font-semibold text-slate-900">{repository.forks_count}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Last updated</p>
            <p className="mt-3 text-base font-semibold text-slate-900">{new Date(repository.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Description</p>
          <p className="mt-3">{repository.description || "No description provided."}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <a href={repository.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">View on GitHub</a>
            <AnalyzeButton owner={owner} repoName={repoName} onAnalysisResult={setAnalysisResult} />
          </div>
          <p className="text-sm text-slate-600">This page is powered by your secure GitHub connection.</p>
        </div>
      </div>

      {analysisResult ? (
        <div id="repo-analysis-placeholder">
          <AnalysisResultSummary analysis={analysisResult} />
        </div>
      ) : null}
    </div>
  );
}

function AnalyzeButton({ owner, repoName, onAnalysisResult }: { owner: string; repoName: string; onAnalysisResult: (analysis: any | null) => void }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasEvidence, setHasEvidence] = useState(false);

  const runAnalyze = async (mode: "evidence" | "analysis" = "evidence") => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);

    try {
      const resp = await fetch("/api/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo: repoName, mode }),
        cache: "no-store",
      });
      const payload = await resp.json();
      if (!resp.ok) throw new Error(payload.error || "Analysis failed");

      if (mode === "evidence") {
        setHasEvidence(true);
        setSuccess("Evidence collection complete. Continue to analysis.");
        return;
      }

      onAnalysisResult(payload.analysis ?? null);
      setSuccess("AI analysis complete.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      onAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      {hasEvidence ? (
        <button
          type="button"
          onClick={() => runAnalyze("analysis")}
          disabled={isAnalyzing}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {isAnalyzing ? "Analyzing…" : "Continue to Analysis"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => runAnalyze("evidence")}
          disabled={isAnalyzing}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {isAnalyzing ? "Analyzing…" : "Analyze Repository"}
        </button>
      )}
      {error ? <div className="mt-2 max-w-xs text-xs text-rose-600">{error}</div> : null}
      {success ? <div className="mt-2 max-w-xs text-xs text-emerald-700">{success}</div> : null}
    </div>
  );
}

function AnalysisResultSummary({ analysis }: { analysis: any | null }) {
  if (!analysis) return null;

  const summary = typeof analysis.summary === "string" ? analysis.summary : "No analysis summary was returned.";
  const evidenceSummary = analysis.evidenceSummary || {};

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      <p className="font-semibold text-slate-900">Analysis results</p>
      <p className="mt-3 leading-7 text-slate-700">{summary}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Files</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{evidenceSummary.files ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dependencies</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{evidenceSummary.dependencies ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Source files</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{evidenceSummary.sourceFiles ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
