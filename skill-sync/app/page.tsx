import Link from "next/link";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Students", href: "#students" },
  { label: "For Recruiters", href: "#recruiters" },
  { label: "For Colleges", href: "#colleges" },
];

const processSteps = [
  {
    number: "01",
    title: "Connect GitHub",
    description: "Link your GitHub account to surface real project evidence and contribution metadata.",
  },
  {
    number: "02",
    title: "Analyze Evidence",
    description: "Review repository signals, README context, languages, and activity patterns.",
  },
  {
    number: "03",
    title: "Build Skill Profile",
    description: "Turn code work into a structured profile of demonstrated technical skills.",
  },
  {
    number: "04",
    title: "Match Opportunities",
    description: "Find roles that are aligned to proven capabilities, not just resume claims.",
  },
];

const Home = () => {
  return (
    <div className="min-h-full bg-[#f8f7f5] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <a href="#top" className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-950 text-white">SS</span>
            Skill-Sync AI
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-medium text-slate-700 transition hover:text-slate-950">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="text-sm font-medium text-slate-700 transition hover:text-slate-950">
              Log In
            </Link>
            <a
              href="#product"
              className="inline-flex items-center justify-center rounded-md border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get Started
            </a>
          </div>

          <details className="md:hidden">
            <summary className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900">
              Menu
            </summary>
            <div className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {navLinks.map((item) => (
                <a key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  {item.label}
                </a>
              ))}
              <a href="#" className="block rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                Get Started
              </a>
            </div>
          </details>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700">
              Evidence-based recruitment
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Don’t Hire the Resume.
              <br />
              Hire the Proof.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700 sm:text-xl">
              Skill-Sync AI analyzes real GitHub work to build evidence-based technical profiles and connect candidates with opportunities that actually match their skills.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#product"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Get Started
              </a>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50">
                See How It Works
              </a>
            </div>
          </div>

          <aside className="relative isolate overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-slate-950/10 to-transparent" aria-hidden="true" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Candidate preview</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">GitHub evidence summary</p>
                </div>
                <span className="inline-flex rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white">Demo</span>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Readiness score</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">82</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white">
                    Skill Match
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Top evidence</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Active repository contributions, strong README context, and recent project updates.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Languages", value: "TypeScript, React, Node.js" },
                      { label: "Focus", value: "Front-end systems & deployment" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Project evidence", value: "README clarity, repo topics" },
                  { label: "Skill indicators", value: "Component design, testing, CI" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-slate-200 bg-white px-4 py-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section id="product" className="mt-20 space-y-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Product</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Resumes tell you what candidates claim.
              <br />
              Their work tells you what they can do.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700">
              Traditional resumes make it hard to separate marketing from capability. Skill-Sync puts actual GitHub work at the center of candidate evaluation so teams can prioritize proven skill and real project output.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
            {[
              "Skills can be listed without evidence.",
              "Project descriptions are often vague.",
              "Recruiters spend too much time manually evaluating candidates.",
              "Students struggle to understand which skills truly matter.",
            ].map((text) => (
              <div key={text} className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
                <p className="text-base font-semibold text-slate-950">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mt-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                A concise process for evidence-backed matching.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-700 sm:text-base">
              From GitHub connection to opportunity matching, every step is designed to turn code work into reliable candidate signals.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => (
              <article key={step.number} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-slate-950 text-sm font-semibold text-white">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="students" className="mt-20 grid gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">For Students</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Turn your GitHub into your technical profile.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-700">
              Connect your work, analyze projects, and discover which skills you have demonstrated through real code. Skill-Sync helps you understand readiness, identify gaps, and present proof rather than promises.
            </p>
            <ul className="mt-8 space-y-4 text-sm leading-7 text-slate-700">
              {[
                "Analyze repositories, README files, languages, and activity.",
                "Discover demonstrated skills and project evidence.",
                "Identify skill gaps and readiness signals.",
                "Understand where to focus before applying.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-slate-950" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-600">Dashboard preview</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">Student readiness at a glance</p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white">Demo</span>
            </div>
            <div className="space-y-5">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Readiness score</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">78%</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Skill map
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {['React', 'TypeScript', 'Testing'].map((skill) => (
                    <div key={skill} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Skill gaps</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">Areas to strengthen are clearly surfaced so preparation stays focused and meaningful.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Project evidence</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">Review repositories, documentation quality, and activity signals in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recruiters" className="mt-20 grid gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-600">For Recruiters</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">Find candidates by what they can actually build.</p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white">Demo</span>
            </div>
            <div className="space-y-4">
              <p className="text-sm leading-7 text-slate-700">
                Enter a job description and see candidates matched against the evidence in their GitHub work. Compare demonstrated skills, relevant projects, and confidence signals without relying only on resume text.
              </p>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Candidate rank</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">1. Front-End Engineer</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Match score 87
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-700">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">Relevant evidence</p>
                    <p className="mt-2">Live app code, deployment config, and README details aligned with the job goals.</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">Skill focus</p>
                    <p className="mt-2">React architecture, testing, and CI workflow experience.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {[
              "Enter job descriptions and get evidence-driven matches.",
              "See the materials behind every candidate recommendation.",
              "Shortlist based on demonstrated skills and project fit.",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-950">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] xl:gap-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Evidence over claims</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Evidence signal, not a plagiarism detector.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-700">
                Skill-Sync evaluates repository activity, project history, metadata, README information, and contribution patterns to present evidence of technical work. It is an activity-based indicator designed to highlight demonstrated capability.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Repository activity",
                "Project history",
                "GitHub metadata",
                "README and project context",
              ].map((signal) => (
                <div key={signal} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">{signal}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="semantic" className="mt-20 rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] xl:gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Semantic matching</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Match skills by meaning, not just keywords.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Skill-Sync compares job requirements with student evidence to create matches that reflect what candidates can actually build, not just what they say on a resume.
              </p>
            </div>
            <div className="space-y-5 rounded-3xl border border-slate-700/70 bg-slate-900/80 p-6">
              {[
                "Job Description",
                "Semantic Understanding",
                "Student Evidence",
                "Match Score",
              ].map((stage, index) => (
                <div key={stage} className="flex items-center gap-4 rounded-3xl border border-slate-700/70 bg-slate-950/80 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-700 text-sm font-semibold text-white">{index + 1}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{stage}</p>
                    <p className="mt-1 text-xs text-slate-400">{stage === "Semantic Understanding" ? "Interpret intent and skills." : stage === "Match Score" ? "Evaluate fit from evidence." : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="colleges" className="mt-20 grid gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">For Colleges</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Understand your students beyond their resumes.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-700">
              Monitor readiness, identify skill gaps, and understand distributions so administrators can support placement preparation and industry readiness with evidence-based insight.
            </p>
            <ul className="mt-8 space-y-4 text-sm leading-7 text-slate-700">
              {[
                "Monitor student readiness across portfolios.",
                "Identify skill gaps and distribution patterns.",
                "Spot industry-ready students with evidence-backed signals.",
                "Support placement preparation with real project data.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-slate-950" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-600">College dashboard</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { title: "Readiness overview", detail: "Evidence-based student readiness segmentation." },
                { title: "Gap analysis", detail: "Quantify where cohorts need support." },
                { title: "Distribution", detail: "Understand skill strength across programs." },
                { title: "Industry fit", detail: "Identify students with proven project outcomes." },
              ].map((card) => (
                <div key={card.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-950">{card.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-[2rem] border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-8 sm:py-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Final call</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Build proof. Discover opportunities.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-700">
              Turn real project work into meaningful career opportunities with a platform that prioritizes evidence over resume claims.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="#product" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Get Started
              </a>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50">
                Explore the Platform
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Skill-Sync AI</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-700">Evidence-based recruitment intelligence.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2 text-sm text-slate-700">
              <a href="#product" className="transition hover:text-slate-950">Product</a>
              <a href="#how-it-works" className="transition hover:text-slate-950">How It Works</a>
              <a href="#students" className="transition hover:text-slate-950">Students</a>
            </div>
            <div className="grid gap-2 text-sm text-slate-700">
              <a href="#recruiters" className="transition hover:text-slate-950">Recruiters</a>
              <a href="#colleges" className="transition hover:text-slate-950">Colleges</a>
              <a href="#" className="transition hover:text-slate-950">Privacy</a>
              <a href="#" className="transition hover:text-slate-950">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
