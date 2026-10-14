import type { Cluster, ClusterId, Progress } from "./types";

export const clusters: Cluster[] = [
  {
    id: "think",
    name: "How we think",
    minutes: "~1 min",
    accent: "#2B65E7",
    gameTitle: "Ordenar números",
    scene: "Una práctica corta: ordenar una serie de números.",
    opening:
      "Vas a ordenar una serie de números de menor a mayor. Al cerrar, se completa este triángulo del isologo.",
    closing:
      "Ordenar es una forma chica de pensar en crítico: no te quedás con el primer orden que ves, lo revisás y lo corregís. Critical thinking es desafiar lo que parece dado. Diversity and open-mindedness es aceptar que hay más de una forma de mirar la misma serie hasta encontrar la que cierra.",
    values: [
      {
        name: "Critical thinking",
        line: "Challenge the established order, form opinions and find solutions based on actual needs.",
      },
      {
        name: "Diversity and open-mindedness",
        line: "Every idea, point of view and background count when trying to find the best solution.",
      },
    ],
  },
  {
    id: "together",
    name: "How we work together",
    minutes: "~1 min",
    accent: "#448FF4",
    gameTitle: "Ordenar números",
    scene: "Misma mecánica: ordenar números y completar el triángulo.",
    opening:
      "Otra serie de números, misma mecánica. Ordenalos de menor a mayor para marcar este triángulo.",
    closing:
      "Acá cada número solo vale en relación con los demás: el orden aparece cuando los piezas se leen juntas. Collaboration es aprovechar ese conocimiento colectivo. Help others succeed es no dejar un hueco vacío: si falta un número, la secuencia no cierra para nadie.",
    values: [
      {
        name: "Collaboration",
        line: "Leverage the collective knowledge.",
      },
      {
        name: "Help others succeed",
        line: "If we all succeed… We all succeed!",
      },
    ],
  },
  {
    id: "happen",
    name: "How we make things happen",
    minutes: "~1 min",
    accent: "#775DFD",
    gameTitle: "Ordenar números",
    scene: "Una serie más corta: ordenar y cerrar la práctica.",
    opening:
      "Serie corta. Ordená de menor a mayor y cerrá la práctica para marcar el triángulo.",
    closing:
      "Empezaste por el primer número sin esperar a que la serie se ordene sola. Can do attitude es dar ese paso. Proactive engagement es no quedarte mirando los disponibles: marcar el siguiente y hacer que la secuencia avance.",
    values: [
      {
        name: "Can do attitude",
        line: "Yes you can!",
      },
      {
        name: "Proactive engagement",
        line: "Step-up and lead with the example.",
      },
    ],
  },
  {
    id: "deliver",
    name: "How we deliver",
    minutes: "~1 min",
    accent: "#683C95",
    gameTitle: "Ordenar números",
    scene: "Última variante: ordenar números y completar el isologo.",
    opening:
      "Última serie. Ordená de menor a mayor. Si ya hiciste las otras, el isologo se completa.",
    closing:
      "Comprobar antes de cerrar es calidad que se puede verificar: Professionalism. Ajustar el orden cuando algo no cierra —y proponer una secuencia que sí avance— es Entrepreneurship: usar lo que sabés para que la entrega quede bien.",
    values: [
      {
        name: "Professionalism",
        line: "Strive to convey and adopt the highest level of work quality and ethics with customers and peers.",
      },
      {
        name: "Entrepreneurship",
        line: "Use your own skills for the benefit of you and the company.",
      },
    ],
  },
];

const ids = new Set<string>(clusters.map((cluster) => cluster.id));

export function isClusterId(value: string): value is ClusterId {
  return ids.has(value);
}

export function getCluster(id: ClusterId): Cluster {
  const cluster = clusters.find((item) => item.id === id);
  if (!cluster) {
    throw new Error(`Cluster desconocido: ${id}`);
  }
  return cluster;
}

/** Siguiente práctica incompleta, empezando después de `from`. */
export function getNextCluster(from: ClusterId, progress: Progress): ClusterId | null {
  const order = clusters.map((cluster) => cluster.id);
  const start = order.indexOf(from);
  for (let offset = 1; offset <= order.length; offset += 1) {
    const candidate = order[(start + offset) % order.length];
    if (!progress[candidate]) return candidate;
  }
  return null;
}
