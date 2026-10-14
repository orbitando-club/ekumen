"use client";

import { SiteHeader } from "@/app/components/SiteChrome";
import { Mark } from "@/app/components/Mark";
import { Button } from "@/app/components/Button";
import { clusters } from "@/app/lib/clusters";
import { completedCount, useProgress } from "@/app/lib/progress";

export default function CierrePage() {
  const { progress, ready, reset } = useProgress();
  const done = completedCount(progress);

  if (!ready) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
      </div>
    );
  }

  const pending = clusters.filter((cluster) => !progress[cluster.id]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[860px] flex-col items-start px-6 py-12 md:py-20">
        <Mark progress={progress} wordmark className="h-28 text-[72px] md:h-36 md:text-[92px]" />
        {done === 4 ? (
          <>
            <p className="mt-10 text-[13px] font-medium tracking-[0.16em] text-[#023D8F] uppercase">
              Powering your ingenuity
            </p>
            <h1 className="mt-4 text-5xl leading-[0.95] font-light tracking-[-0.04em] md:text-6xl">
              El isologo completo
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#02043E]/85">
              Pasaste por las cuatro prácticas, ordenaste cada serie y el isologo quedó completo.
              Esa es la dinámica del sitio: entrar, practicar, marcar un triángulo, seguir.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/">Volver al inicio</Button>
              <Button variant="secondary" onClick={reset}>
                Volver a practicar
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-10 text-5xl leading-[0.95] font-light tracking-[-0.04em] md:text-6xl">
              Todavía faltan triángulos
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#02043E]/80">
              El isologo se completa cuando las cuatro prácticas tienen cierre.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {pending.map((cluster) => (
                <li key={cluster.id}>
                  <Button href={`/jugar/${cluster.id}`} variant="secondary">
                    {cluster.name}
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
