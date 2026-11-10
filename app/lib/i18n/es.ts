import type { Dictionary } from "./types";

export const es: Dictionary = {
  locale: "es",
  localeLabel: "ES",
  otherLocale: "en",
  otherLocaleLabel: "EN",
  intro: {
    title: "Ekumen Sandbox",
    headline: "Una estrella polar para decidir juntos",
    lead: "Los <b>valores</b> funcionan como una estrella polar: una referencia a la cual podemos acudir cuando necesitamos resolver situaciones dilemáticas del trabajo cotidiano.",
    dilemmas: [
      "<i>¿Priorizamos las soluciones que ya conocemos, o generamos espacios para explorar nuevas alternativas, aun cuando el tiempo sea limitado?</i>",
      "<i>¿Preferimos que una persona coordine la planificación y las estimaciones, o distribuimos esa responsabilidad entre quienes integran el equipo?</i>",
    ],
    bridge:
      "Cuando nos cuesta ponernos de acuerdo sobre estas u otras cuestiones, contamos con principios que orientan nuestras decisiones y forma de relacionarnos.",
    question: "Pero ¿cuáles son esos principios?",
    setup:
      "Nuestros <b>ocho valores</b> se organizan en torno a <b>cuatro dimensiones</b> clave:",
    dimensions: [
      "Cómo pensamos",
      "Cómo trabajamos",
      "Cómo hacemos que las cosas sucedan",
      "Cómo generamos valor agregado",
    ],
    ekuthon:
      "",
    cta: "Vamos a explorarlos",
  },
  ui: {
    reset: "Reiniciar",
    valuesReveal: "Dos valores de este eje",
    axisPoints: "pts en este eje",
    nextAxis: "Siguiente eje",
    seeClosing: "Ver cierre y ranking",
    outOf: "sobre",
    pts: "pts",
    ready: "Listo",
    emptyRanking: "Todavía no hay puntajes publicados.",
  },
  closing: {
    title: "Powering your ingenuity",
    subtitle: "Estos son los ocho valores que nos orientan.",
    scoreLabel: "Tu puntaje",
    ekuthonTicket: "Ya tenés tu entrada para el Ekuthon",
    ekuthonDetail: "El viaje de Ekumen es el 23 de noviembre. Nos vemos ahí.",
    ekuthonSpoiler: "Hay un spoiler de la Ekuthon en este sitio. ¿Ya lo encontraste?",
    namePrompt: "Dejá tu nombre para el ranking",
    namePlaceholder: "Tu nombre",
    submit: "Publicar en el ranking",
    rankingTitle: "Ranking",
    rankingLocal: "Ranking de este dispositivo (Supabase opcional para compartirlo).",
    replay: "Volver a jugar",
  },
  insight: {
    hint: "Hacé click para empezar o terminar de dibujar una línea.",
    undoHint: "",
    lines: "Líneas",
    dots: "Puntos",
    check: "Comprobar",
    clear: "Borrar todo",
    needAll: "Todavía faltan puntos. Seguí dibujando.",
    tooMany: "Hay una forma más directa. Mirá una solución posible.",
    success: "¡Insight! Un cambio de perspectiva alcanza.",
    solutionTitle: "",
  },
  elephant: {
    scrubHint:
      "Pasá el mouse o el dedo por los puntos: se van uniendo al recorrerlos. Cuando revelás un cuarto, ya podés intentar adivinar. Si los completás, aparece el ojo.",
    revealed: "Revelado",
    question: "¿Qué es el conjunto?",
    options: ["Una serpiente", "Un elefante", "Un rinoceronte", "Una araña"],
    correct: "Un elefante",
  },
  axisCards: [
    { id: "think", emoji: "🧠", label: "CÓMO PENSAMOS", color: "#2B65E7" },
    { id: "together", emoji: "🤝", label: "CÓMO TRABAJAMOS JUNTOS", color: "#448FF4" },
    { id: "happen", emoji: "🚀", label: "CÓMO HACEMOS QUE LAS COSAS SUCEDAN", color: "#775DFD" },
    { id: "deliver", emoji: "⭐", label: "CÓMO GENERAMOS VALOR AGREGADO", color: "#683C95" },
  ],
  riddle: {
    clues: "Pistas",
    extraHintBtn: "Pedir una pista (−40 pts)",
    extraHint: "Carla es Dev y Diego es QA. Con eso el resto encaja por eliminación.",
    assign: "Asigná un rol a cada persona",
    check: "Comprobar",
    needAll: "Asigná un rol a cada persona.",
    uniqueRoles: "Cada rol solo puede usarse una vez.",
    wrong: "Todavía no cierra. Revisá las pistas y ajustá.",
    success: "¡Resolviste el acertijo! Probar, observar y ajustar: esa es la forma.",
    people: ["Ana", "Bruno", "Carla", "Diego"],
    roles: ["Dev", "Design", "PM", "QA"],
  },
  wordle: {
    needFive: "La palabra tiene 5 letras.",
    success: "Lo resolviste iterando: probar, leer la señal, ajustar.",
    fail: "La palabra era {word}. Igual, el proceso iterativo cuenta.",
    legendPresent: "Letra correcta, posición incorrecta",
    legendCorrect: "Letra y posición correctas",
    legendAbsent: "Letra incorrecta",
  },
  axes: [
    {
      id: "think",
      name: "Cómo pensamos",
      accent: "#2B65E7",
      minutes: "~2 min",
      gameTitle: "Desafío",
      story: [
        "Al explorar un enfoque diferente, descubrimos algo que a primera vista parecía no estar ahí. A veces, un <b>cambio de perspectiva</b> alcanza para reorganizar lo que vemos y encontrar una solución que antes no podíamos imaginar.",
        "A estos momentos los llamamos <b>insights</b>: cuando una nueva lógica emerge y nos permite comprender un problema de otra manera. Pero, ¿cómo funciona esto en la vida cotidiana?",
        "<b>Vamos a explorarlo en un desafío sencillo.</b>",
      ],
      gamePrompt:
        "Intentá unir todos los puntos usando la menor cantidad de líneas rectas posibles.",
      closing:
        "En el desafío anterior descubrimos que al descentrarnos de una de las perspectivas posibles pudimos encontrar una solución que no podíamos imaginar antes. De esta forma arribamos a nuestros primeros dos valores:",
      startChallenge: "Empezar desafío",
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
      gameTitle: "",
      story: [
        "Retomemos una antigua parábola.",
        "Seis sabios ciegos se encuentran por primera vez con determinado animal. Como ninguno puede verlo, deciden descubrir qué criatura tienen delante utilizando únicamente el tacto.",
        "Mientras tanto, vos también podés intentar descubrirlo.",
      ],
      gamePrompt:
        "Pasá por los puntos del contorno. Con el 25% ya podés intentar adivinar qué es.",
      closing:
        "Cada perspectiva revela una parte de la realidad, pero ninguna alcanza por sí sola para comprender el conjunto. Para construir una visión más completa, necesitamos integrar las experiencias, los conocimientos y las perspectivas de los demás.",
      startChallenge: "Empezar desafío",
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
        "En Ekumen entendemos que la incertidumbre y el cambio son parte natural de nuestro trabajo.",
      ],
      gamePrompt:
        "Resolvé este acertijo con las pistas. Podés pedir una pista extra (resta puntos).",
      closing:
        "Confiamos en que, sea cual sea el desafío, vamos a poder solucionarlo o adaptarnos a las circunstancias. Esa confianza también requiere tomar la iniciativa y asumir un rol activo en su búsqueda.",
      startChallenge: "Empezar desafío",
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
      ],
      gamePrompt:
        "Adiviná la palabra en hasta 6 intentos. ",
      closing:
        "No contabas con toda la información desde el principio. Sin embargo, con autonomía, iniciativa y confianza en tus capacidades, pudiste construir una solución suficientemente buena para avanzar.",
      startChallenge: "Empezar desafío",
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
  ],
};
