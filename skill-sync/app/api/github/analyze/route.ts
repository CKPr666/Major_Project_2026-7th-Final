import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeRole } from "@/lib/auth";

const MAX_FILES = 200;
const MAX_FILE_SIZE = 100 * 1024;
const TOTAL_BYTES_LIMIT = 5 * 1024 * 1024;

const IGNORE_DIRS = ["node_modules", ".git", "dist", "build", ".next", "coverage"];
const BINARY_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".zip",
  ".tar",
  ".gz",
  ".pdf",
  ".exe",
  ".dll",
  ".so",
  ".class",
  ".jar",
  ".bin",
];

const evidenceCache = new Map<string, any>();
const analysisCache = new Map<string, any>();

function looksBinary(path: string) {
  const lower = path.toLowerCase();
  return BINARY_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function getCacheKey(owner: string, repo: string) {
  return `${owner}/${repo}`.toLowerCase();
}

function getMissingAiConfig() {
  const missing: string[] = [];
  if (!process.env.OPENAI_API_KEY) missing.push("OPENAI_API_KEY");
  if (!process.env.OPENAI_MODEL) missing.push("OPENAI_MODEL");
  return missing;
}

async function collectRepositoryEvidence(owner: string, repo: string, githubAccessToken: string) {
  const gh = async (path: string, init?: RequestInit) => {
    return fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `token ${githubAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "skill-sync-ai",
      },
      cache: "no-store",
      ...init,
    });
  };

  const repoResp = await gh(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  if (!repoResp.ok) {
    const text = await repoResp.text();
    let msg = `GitHub repository lookup failed (status: ${repoResp.status})`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.message) msg = parsed.message;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  const repoPayload = await repoResp.json();
  const repository = {
    name: repoPayload.name,
    owner: repoPayload.owner?.login,
    description: repoPayload.description,
    language: repoPayload.language,
    stargazers_count: repoPayload.stargazers_count,
    forks_count: repoPayload.forks_count,
    default_branch: repoPayload.default_branch,
    created_at: repoPayload.created_at,
    updated_at: repoPayload.updated_at,
  };

  let readme: string | null = null;
  try {
    const readmeResp = await gh(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`);
    if (readmeResp.ok) {
      const rp = await readmeResp.json();
      if (rp?.content && rp.encoding === "base64") {
        const buffer = Buffer.from(rp.content, "base64");
        readme = buffer.toString("utf-8");
      }
    } else if (readmeResp.status !== 404) {
      console.warn("README lookup returned a non-404 status", { owner, repo, status: readmeResp.status });
    }
  } catch (error) {
    console.warn("README lookup failed", { owner, repo, error: error instanceof Error ? error.message : String(error) });
    readme = null;
  }

  const branch = repository.default_branch || "main";
  const treeResp = await gh(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
  let treeEntries: any[] = [];
  if (treeResp.ok) {
    const payload = await treeResp.json();
    treeEntries = Array.isArray(payload.tree) ? payload.tree : [];
  }

  const blobs = treeEntries.filter((entry) => entry.type === "blob" && !IGNORE_DIRS.some((dir) => entry.path.startsWith(dir + "/")));

  const dependencyFiles = [
    "package.json",
    "package-lock.json",
    "requirements.txt",
    "pyproject.toml",
    "pom.xml",
    "build.gradle",
  ];

  const dependencies: { path: string; size?: number; content?: string | null }[] = [];
  for (const depPath of dependencyFiles) {
    try {
      const depResp = await gh(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(depPath)}?ref=${encodeURIComponent(branch)}`);
      if (depResp.ok) {
        const depPayload = await depResp.json();
        if (depPayload?.content && depPayload.encoding === "base64") {
          const buffer = Buffer.from(depPayload.content, "base64");
          dependencies.push({ path: depPath, size: depPayload.size, content: buffer.toString("utf-8") });
        }
      }
    } catch (error) {
      console.warn("Dependency file fetch failed", { owner, repo, path: depPath, error: error instanceof Error ? error.message : String(error) });
    }
  }

  const files: { path: string; size?: number }[] = [];
  const sourceFiles: { path: string; size?: number; content?: string; truncated?: boolean }[] = [];
  let totalBytes = 0;
  let filesFetched = 0;

  for (const blob of blobs) {
    if (filesFetched >= MAX_FILES) break;
    const path: string = blob.path;
    const size: number = typeof blob.size === "number" ? blob.size : 0;

    if (IGNORE_DIRS.some((dir) => path.startsWith(dir + "/"))) continue;
    if (looksBinary(path)) continue;
    if (size > MAX_FILE_SIZE) continue;
    if (totalBytes + size > TOTAL_BYTES_LIMIT) break;

    try {
      const contentResp = await gh(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`);
      if (!contentResp.ok) continue;
      const contentPayload = await contentResp.json();
      if (contentPayload?.content && contentPayload.encoding === "base64") {
        const buffer = Buffer.from(contentPayload.content, "base64");
        let text = buffer.toString("utf-8");
        let truncated = false;
        if (text.length > MAX_FILE_SIZE) {
          text = text.slice(0, MAX_FILE_SIZE);
          truncated = true;
        }

        files.push({ path, size });
        sourceFiles.push({ path, size, content: text, truncated });
        totalBytes += size;
        filesFetched += 1;
      }
    } catch (error) {
      console.warn("Source file fetch failed", { owner, repo, path, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return {
    repository,
    readme,
    files,
    dependencies: dependencies.map((entry) => ({ path: entry.path, size: entry.size })),
    sourceFiles: sourceFiles.map((entry) => ({ path: entry.path, size: entry.size, truncated: entry.truncated })),
    collectedAt: new Date().toISOString(),
  };
}

async function generateAnalysisFromEvidence(owner: string, repo: string, evidence: any) {
  const missing = getMissingAiConfig();
  if (missing.length > 0) {
    const errorText = `AI analysis is not configured. Missing required environment variable(s): ${missing.join(", ")}.`;
    console.error("Repository analysis failed: missing AI configuration", { owner, repo, missing });
    throw new Error(errorText);
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "You are an expert technical reviewer. Summarize the repository evidence and explain the candidate's likely strengths, project maturity, and relevant skill signals using only the provided repo evidence.",
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              repository: evidence.repository,
              readme: evidence.readme,
              files: evidence.files,
              dependencies: evidence.dependencies,
              sourceFiles: evidence.sourceFiles,
            },
            null,
            2
          ),
        },
      ],
    }),
  });

  const responseText = await response.text();
  if (!response.ok) {
    let message = `OpenAI analysis failed (status: ${response.status})`;
    try {
      const parsed = JSON.parse(responseText);
      if (parsed?.error?.message) message = parsed.error.message;
    } catch {
      if (responseText) message = responseText;
    }
    console.error("Repository analysis failed: OpenAI API error", { owner, repo, status: response.status, message });
    throw new Error(message);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    const fallback = responseText || "No analysis output returned.";
    console.error("Repository analysis failed: invalid OpenAI response", { owner, repo, fallback });
    throw new Error(`OpenAI returned invalid JSON: ${fallback}`);
  }

  const outputText = parsed.output_text ||
    parsed.output?.map((item: any) => item.content?.map((part: any) => part.text || "").join("\n") ?? "").join("\n") ||
    "No analysis output returned.";

  const analysis = {
    summary: outputText,
    generatedAt: new Date().toISOString(),
    evidenceSummary: {
      files: Array.isArray(evidence.files) ? evidence.files.length : 0,
      dependencies: Array.isArray(evidence.dependencies) ? evidence.dependencies.length : 0,
      sourceFiles: Array.isArray(evidence.sourceFiles) ? evidence.sourceFiles.length : 0,
    },
  };

  return analysis;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo in request." }, { status: 400 });
  }

  const key = getCacheKey(owner, repo);
  const cachedAnalysis = analysisCache.get(key);
  if (cachedAnalysis) {
    return NextResponse.json(cachedAnalysis);
  }

  const cachedEvidence = evidenceCache.get(key);
  if (cachedEvidence) {
    return NextResponse.json({ ...cachedEvidence, cached: true });
  }

  return NextResponse.json({ error: "No repository analysis is available yet. Please run analysis first." }, { status: 404 });
}

export async function POST(request: Request) {
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

  const body = await request.json().catch(() => null);
  const owner = body?.owner;
  const repo = body?.repo;
  const mode = body?.mode === "analysis" ? "analysis" : "evidence";

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo in request body." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const githubAccessToken = cookieStore.get("github_access_token")?.value;
  if (!githubAccessToken) {
    return NextResponse.json({ error: "GitHub is not connected." }, { status: 401 });
  }

  const key = getCacheKey(owner, repo);

  try {
    let evidence = mode === "analysis" ? evidenceCache.get(key) : null;
    if (!evidence) {
      evidence = await collectRepositoryEvidence(owner, repo, githubAccessToken);
      evidenceCache.set(key, evidence);
    }

    if (mode === "evidence") {
      return NextResponse.json({ success: true, message: "Evidence collection complete.", evidence });
    }

    const analysis = await generateAnalysisFromEvidence(owner, repo, evidence);
    analysisCache.set(key, analysis);

    return NextResponse.json({
      success: true,
      message: "AI analysis complete.",
      analysis,
      evidence,
    });
  } catch (error) {
    const serverMessage = error instanceof Error ? error.message : "Unexpected error while generating repository analysis.";
    console.error("Repository analysis route failed", {
      owner,
      repo,
      mode,
      error: serverMessage,
    });
    return NextResponse.json({ error: serverMessage }, { status: 500 });
  }
}
