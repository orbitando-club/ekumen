import { SiteHeader, ClusterIndex } from "@/app/components/SiteChrome";

export default function ValoresPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[860px] px-6 py-12 md:py-16">
        <p className="text-[13px] font-medium tracking-[0.16em] text-[#023D8F] uppercase">
          Ocho valores
        </p>
        <h1 className="mt-4 max-w-xl text-5xl leading-[0.95] font-light tracking-[-0.04em] md:text-6xl">
          Cuatro maneras de trabajar
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#02043E]/80">
          Ocho valores, cuatro maneras de trabajar. Podés entrar por cualquiera. El
          isologo se va completando a medida que terminás cada práctica.
        </p>
        <div className="mt-12">
          <ClusterIndex variant="full" />
        </div>
      </main>
    </div>
  );
}
