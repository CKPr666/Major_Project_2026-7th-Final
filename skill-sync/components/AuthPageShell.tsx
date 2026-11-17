import type { ReactNode } from "react";

interface AuthPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
  cta?: ReactNode;
}

export default function AuthPageShell({ title, description, children, cta }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f7f5] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-xl shadow-slate-200/40">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Skill-Sync AI</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
          </div>

          <div className="space-y-8">{children}</div>

          {cta ? <div className="mt-8 text-center">{cta}</div> : null}
        </div>
      </div>
    </div>
  );
}
