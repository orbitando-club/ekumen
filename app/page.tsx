"use client";

import { Mark } from "@/app/components/Mark";
import { SiteHeader, PracticeGallery } from "@/app/components/SiteChrome";
import { Button } from "@/app/components/Button";
import { clusters } from "@/app/lib/clusters";
import { completedCount, useProgress } from "@/app/lib/progress";

export default function HomePage() {
  const { progress, ready } = useProgress();
  const done = completedCount(
    ready ? progress : { think: false, together: false, happen: false, deliver: false },
  );
  const firstOpen = clusters.find((cluster) => !(ready && progress[cluster.id]));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-10 md:py-14">
        <div className="grid items-end gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[13px] font-medium tracking-[0.16em] text-[#023D8F] uppercase">
              Valores de Ekumen
            </p>
            <h1 className="mt-4 text-[64px] leading-[0.92] font-light tracking-[-0.04em] md:text-[88px]">
              Empecemos
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[#02043E]/80">
              Cuatro prácticas cortas para explorar los nuevos valores de Ekumen
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {done === 4 ? (
                <Button href="/cierre">Ver el isologo</Button>
              ) : (
                <Button href={firstOpen ? `/jugar/${firstOpen.id}` : "/valores"}>
                  Empezar
                </Button>
              )}
              <Button href="/valores" variant="secondary">
                Ver los valores
              </Button>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <Mark
              progress={ready ? progress : undefined}
              className={`h-40 text-ink transition-opacity md:h-56 ${ready ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        </div>

        <section className="mt-14 md:mt-16" aria-label="Prácticas">
          <PracticeGallery />
        </section>
      </main>
    </div>
  );
}
