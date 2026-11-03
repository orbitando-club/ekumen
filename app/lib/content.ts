import type { AxisContent, ClusterId } from "./types";

export const intro = {
  title: "Ekumen Sandbox",
  lead: "Los valores funcionan como una estrella polar: una referencia a la que podemos acudir cuando necesitamos resolver situaciones dilemáticas del trabajo cotidiano.",
  dilemmas: [
    "¿Priorizamos las soluciones que ya conocemos o generamos espacios para explorar nuevas alternativas, aun cuando el tiempo sea limitado?",
    "¿Preferimos que una persona coordine la planificación y las estimaciones, o distribuimos esa responsabilidad entre quienes integran el equipo?",
  ],
  bridge:
    "Cuando nos cuesta ponernos de acuerdo sobre estas u otras cuestiones, contamos con principios que orientan nuestras decisiones y nuestra forma de relacionarnos.",
  question: "Pero ¿cuáles son esos principios?",
  setup:
    "Nuestros ocho valores se organizan en torno a cuatro dimensiones clave: cómo pensamos, cómo trabajamos, cómo hacemos que las cosas sucedan y cómo generamos valor agregado.",
  cta: "Vamos a explorarlos",
};

export const axes: AxisContent[] = [
  {
    id: "think",
    name: "Cómo pensamos",
    accent: "#2B65E7",
    minutes: "~2 min",
    gameTitle: "Insight",
    story: [
      "Pensemos en la siguiente situación.",
      "Al explorar un enfoque diferente, descubrimos algo que, a primera vista, parecía no estar ahí. A veces, un cambio de perspectiva alcanza para reorganizar lo que vemos y encontrar una solución que antes no podíamos imaginar.",
      "A estos momentos los llamamos insights: cuando una nueva lógica emerge y nos permite comprender un problema de otra manera.",
    ],
    gamePrompt:
      "Uní los nueve puntos con el mínimo de líneas rectas continuas. Un cambio de perspectiva suele revelar más de lo que parece a primera vista.",
    closing:
      "Si cuestionamos los enfoques actuales podemos llegar a mejores resultados. Y para desarrollar ese pensamiento, necesitamos escuchar, recibir e integrar ideas distintas de las nuestras. Pensamiento crítico, diversidad y apertura: tres conceptos que se conectan y que expresan nuestra forma de pensar en Ekumen.",
    values: [
      {
        name: "Pensamiento crítico",
        line: "Si cuestionamos los enfoques actuales podemos llegar a mejores resultados.",
      },
      {
        name: "Diversidad y apertura",
        line: "Entendemos que las mejores soluciones provienen de integrar perspectivas distintas.",
      },
    ],
  },
  {
    id: "together",
    name: "Cómo trabajamos",
    accent: "#448FF4",
    minutes: "~2 min",
    gameTitle: "El elefante",
    story: [
      "Retomemos una antigua parábola.",
      "Seis sabios ciegos se encuentran por primera vez con un elefante. Como ninguno puede verlo, deciden descubrir qué animal tienen delante utilizando únicamente el tacto.",
      "Mientras tanto, vos también podés intentar descubrirlo.",
    ],
    gamePrompt:
      "Pasá el mouse o tocá las distintas partes para descubrir qué percibe cada sabio. Cuando explores las seis, respondé qué es el conjunto.",
    closing:
      "Cada perspectiva revela una parte de la realidad, pero ninguna alcanza por sí sola para comprender el conjunto. Para construir una visión más completa, necesitamos integrar las experiencias, los conocimientos y las perspectivas de los demás. Aprender y trabajar en conjunto no es algo accesorio: es parte esencial de nuestra forma de hacer las cosas.",
    values: [
      {
        name: "Colaboración",
        line: "Fomentamos el aprendizaje colectivo.",
      },
      {
        name: "Esfuerzo colectivo",
        line: "Nos mostramos disponibles para ayudar a los otros y confiamos en la predisposición del resto para cuando necesitemos ayuda.",
      },
    ],
  },
  {
    id: "happen",
    name: "Cómo hacemos que las cosas sucedan",
    accent: "#775DFD",
    minutes: "~3 min",
    gameTitle: "Acertijo lógico",
    story: [
      "Cuando nos enfrentamos a problemas complejos, los resultados se vuelven menos predecibles. En esos contextos, muchas veces necesitamos probar, observar qué sucede y ajustar el rumbo a partir de lo que aprendemos.",
      "En Ekumen entendemos que la incertidumbre y el cambio son parte natural de nuestro trabajo. No siempre podemos anticipar lo que va a suceder, pero sí podemos confiar en nuestra capacidad para encontrar alternativas.",
    ],
    gamePrompt:
      "Resolvé este acertijo con las pistas. Podés pedir una pista extra (resta puntos). La clave es probar, observar y ajustar.",
    closing:
      "Confiamos en que, sea cual sea el desafío, vamos a poder solucionarlo o adaptarnos a las circunstancias. Y esa confianza no implica esperar a que las soluciones aparezcan solas: también requiere tomar la iniciativa y asumir un rol activo en su búsqueda. Puede que no tengamos todas las respuestas, pero tenemos la certeza de que vamos a salir a buscarlas, en conjunto.",
    values: [
      {
        name: "Vamos a encontrar la forma de resolverlo",
        line: "Confiamos en que, sea cual sea el desafío, vamos a poder solucionarlo o adaptarnos a las circunstancias.",
      },
      {
        name: "Lideramos desde nuestro lado la búsqueda de soluciones",
        line: "No esperamos que aparezcan solas.",
      },
    ],
  },
  {
    id: "deliver",
    name: "Cómo generamos valor agregado",
    accent: "#683C95",
    minutes: "~2 min",
    gameTitle: "Iterar",
    story: [
      "Trabajamos en contextos dinámicos, atravesados por cambios, nuevos requerimientos y desafíos que muchas veces no podemos anticipar.",
      "¿Cómo generamos valor en un escenario como este?",
      "En el día a día, puede suceder algo parecido a lo que vas a experimentar en el siguiente desafío.",
    ],
    gamePrompt:
      "Adiviná la palabra en hasta 6 intentos. Cada intento te da información: ajustá la estrategia y volvé a probar.",
    closing:
      "No contabas con toda la información desde el principio. Sin embargo, con autonomía, iniciativa y confianza en tus capacidades, pudiste construir una solución suficientemente buena para avanzar. Estos son los ocho valores que nos orientan. Más que respuestas predefinidas, son referencias para pensar, decidir, aprender y construir juntos.",
    values: [
      {
        name: "Espíritu emprendedor",
        line: "No nos quedamos de brazos cruzados: tomamos los desafíos colectivos y los asumimos como propios.",
      },
      {
        name: "Profesionalismo",
        line: "Hacemos esfuerzos constantes para entregar el mayor valor, priorizamos la confianza y la autonomía, y nos hacemos cargo de nuestras acciones.",
      },
    ],
  },
];

export const closingCopy = {
  title: "Powering your ingenuity",
  subtitle: "Estos son los ocho valores que nos orientan.",
  scoreLabel: "Tu puntaje",
  namePrompt: "Dejá tu nombre para el ranking",
  namePlaceholder: "Tu nombre",
  submit: "Publicar en el ranking",
  rankingTitle: "Ranking",
  rankingLocal: "Ranking de este dispositivo (Supabase opcional para compartirlo).",
  replay: "Volver a jugar",
};

export function getAxis(id: ClusterId): AxisContent {
  const axis = axes.find((item) => item.id === id);
  if (!axis) throw new Error(`Eje desconocido: ${id}`);
  return axis;
}

/** @deprecated usar axes / getAxis — alias para compat durante migración */
export const clusters = axes;
