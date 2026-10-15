import { notFound } from "next/navigation";
import { clusters, isClusterId } from "@/app/lib/clusters";
import { GameExperience } from "./GameExperience";

export function generateStaticParams() {
  return clusters.map((cluster) => ({ cluster: cluster.id }));
}

export default async function ClusterPage({
  params,
}: {
  params: Promise<{ cluster: string }>;
}) {
  const { cluster } = await params;
  if (!isClusterId(cluster)) {
    notFound();
  }
  return <GameExperience id={cluster} />;
}
