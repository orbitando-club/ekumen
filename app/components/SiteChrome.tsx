"use client";

import Link from "next/link";
import { clusters } from "@/app/lib/clusters";
import { completedCount, useProgress } from "@/app/lib/progress";
import { Mark } from "./Mark";

export function SiteHeader() {
  const { progress, ready } = useProgress();
  const done = completedCount(progress);

  return (
    <header className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-6 py-5">
      <Link href="/" className="text-ink" aria-label="Inicio">
        <Mark
          progress={ready ? progress : undefined}
          wordmark
          className={`h-8 text-[28px] transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}
        />
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link href="/valores" className="hover:text-[#023D8F]">
          Valores
        </Link>
        {ready && done === 4 ? (
          <Link href="/cierre" className="font-medium text-[#023D8F] hover:underline">
            Isologo
          </Link>
        ) : (
          <span className="min-w-[2.5rem] text-right text-[#02043E]/50" suppressHydrationWarning>
            {ready ? `${done}/4` : "\u00a0"}
          </span>
        )}
      </nav>
    </header>
  );
}

export function PracticeGallery() {
  const { progress, ready } = useProgress();

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {clusters.map((cluster) => {
        const done = ready && progress[cluster.id];
        return (
          <li key={cluster.id}>
            <Link
              href={`/jugar/${cluster.id}`}
              className="group flex h-full min-h-[180px] flex-col justify-between rounded-3xl bg-white p-7 shadow-[0_8px_30px_rgba(2,4,62,0.05)] transition-transform duration-200 hover:-translate-y-0.5 md:p-8"
              style={{ boxShadow: `inset 4px 0 0 ${cluster.accent}, 0 8px 30px rgba(2,4,62,0.05)` }}
            >
              <div>
                <p
                  className="text-[12px] font-medium tracking-[0.16em] uppercase"
                  style={{ color: cluster.accent }}
                >
                  Práctica
                </p>
                <h2 className="mt-3 text-2xl font-medium tracking-tight md:text-[28px]">
                  {cluster.name}
                </h2>
              </div>
              <p className="mt-8 text-sm text-[#02043E]/60" suppressHydrationWarning>
                {done ? "Hecha" : cluster.minutes}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ClusterIndex({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const { progress, ready } = useProgress();

  if (variant === "compact") {
    return <PracticeGallery />;
  }

  return (
    <div className="flex flex-col gap-5">
      {clusters.map((cluster) => {
        const done = ready && progress[cluster.id];
        return (
          <article
            key={cluster.id}
            className="rounded-3xl bg-white p-7 shadow-[0_8px_30px_rgba(2,4,62,0.05)] md:p-9"
            style={{ boxShadow: `inset 3px 0 0 ${cluster.accent}` }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                className="text-[13px] font-medium tracking-[0.16em] uppercase"
                style={{ color: cluster.accent }}
              >
                {cluster.name}
              </h2>
              <p className="text-sm text-[#02043E]/55" suppressHydrationWarning>
                {done ? "Hecha" : cluster.minutes}
              </p>
            </div>
            <ul className="mt-5 space-y-3">
              {cluster.values.map((value) => (
                <li key={value.name}>
                  <p className="font-medium">{value.name}</p>
                  <p className="text-[15px] leading-relaxed text-[#02043E]/75">{value.line}</p>
                </li>
              ))}
            </ul>
            <Link
              href={`/jugar/${cluster.id}`}
              className="mt-6 inline-flex rounded-full bg-[#02043E] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#023D8F]"
              suppressHydrationWarning
            >
              {ready ? (done ? "Volver a practicar" : "Practicar") : "Practicar"}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
