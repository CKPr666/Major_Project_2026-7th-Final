"use client";

import { useState } from "react";

type RepositoryAnalysisSectionProps = {
  repoName: string;
  owner: string;
};

type AnalyzeResult = {
  repository?: any;
  readme?: string | null;
  files?: { path: string; size?: number; type?: string }[];
  dependencies?: { path: string; size?: number }[];
  sourceFiles?: { path: string; size?: number }[];
};

export default function RepositoryAnalysisSection({ repoName, owner }: RepositoryAnalysisSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const analyze = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch("/api/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo: repoName }),
        cache: "no-store",
      });

      const payload = await resp.json();
      if (!resp.ok) {
        throw new Error(payload.error || "Analysis failed");
      }

      setResult(payload as AnalyzeResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.3)] sm:p-8">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Repository Analysis</p>
        <button
          type="button"
          onClick={analyze}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? "Analyzing…" : "Analyze Repository"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 text-sm text-rose-600">Error: {error}</div>
      ) : result ? (
        <div className="mt-4 text-sm text-slate-700">
          <p className="font-semibold">Analysis complete</p>
          <p className="mt-2">Files indexed: {result.files?.length ?? 0}</p>
          <p>Dependencies found: {result.dependencies?.length ?? 0}</p>
          <p>Source files collected: {result.sourceFiles?.length ?? 0}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">Click the button above to collect repository evidence.</p>
      )}
    </div>
  );
}
