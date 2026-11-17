"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type Candidate = {
  id: string;
  name: string;
  skills: string[];
  projects: string[];
  githubStatus: "Connected" | "Pending";
  evidenceCount: number;
};

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "1",
    name: "Sarah Chen",
    skills: ["React", "TypeScript", "Node.js"],
    projects: ["E-commerce Platform", "Real-time Chat App"],
    githubStatus: "Connected",
    evidenceCount: 12,
  },
  {
    id: "2",
    name: "James Rodriguez",
    skills: ["Python", "Django", "PostgreSQL"],
    projects: ["Data Pipeline", "REST API"],
    githubStatus: "Connected",
    evidenceCount: 8,
  },
  {
    id: "3",
    name: "Priya Patel",
    skills: ["Full-Stack", "React", "Express"],
    projects: ["Portfolio Site", "Task Manager"],
    githubStatus: "Connected",
    evidenceCount: 15,
  },
  {
    id: "4",
    name: "Marcus Johnson",
    skills: ["Python", "Machine Learning", "TensorFlow"],
    projects: ["Image Classification", "Recommendation Engine"],
    githubStatus: "Pending",
    evidenceCount: 0,
  },
];

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.35)] transition hover:border-slate-300 hover:shadow-[0_15px_50px_-20px_rgba(15,23,42,0.4)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-950">{candidate.name}</h3>
          <div className="mt-4 flex gap-2 flex-wrap">
            {candidate.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            candidate.githubStatus === "Connected"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {candidate.githubStatus}
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Projects</p>
          <p className="mt-1 text-sm text-slate-700">{candidate.projects.slice(0, 2).join(", ")}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">AI Score</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">Pending</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Evidence</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{candidate.evidenceCount} items</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        View Candidate
      </button>
    </div>
  );
}

export default function RecruiterDashboardShell() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_CANDIDATES;

    const query = searchQuery.toLowerCase();
    return MOCK_CANDIDATES.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.skills.some((skill) => skill.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Recruiter Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Review Evidence-Backed Candidates</h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600">
              Explore candidates with AI-analyzed GitHub evidence, verified skills, and project portfolios.
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Search and Filter */}
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder-slate-500 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="text-sm font-medium text-slate-600">
              {filteredCandidates.length} of {MOCK_CANDIDATES.length} candidates
            </div>
          </div>
        </div>

        {/* Candidates Grid */}
        {filteredCandidates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            {filteredCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-base text-slate-600">No candidates found matching "{searchQuery}".</p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm text-center">
          <p className="text-sm text-slate-600">
            Candidate scores are being generated by AI analysis of GitHub repositories and project evidence.
          </p>
        </div>
      </div>
    </div>
  );
}
