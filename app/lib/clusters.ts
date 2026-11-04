import type { ClusterId } from "./types";
import { es } from "./i18n/es";

/** Compat: ejes del locale ES por defecto. */
export const clusters = es.axes;

export function getCluster(id: ClusterId) {
  const axis = clusters.find((item) => item.id === id);
  if (!axis) throw new Error(`Cluster desconocido: ${id}`);
  return axis;
}
