import type { Dictionary } from "./types";

export const en: Dictionary = {
  locale: "en",
  localeLabel: "EN",
  otherLocale: "es",
  otherLocaleLabel: "ES",
  intro: {
    title: "Ekumen Sandbox",
    headline: "A north star for deciding together",
    lead: "Values work like a north star: a reference we can turn to when we need to resolve everyday dilemmas at work.",
    dilemmas: [
      "Do we prioritize solutions we already know, or make room to explore new alternatives—even when time is limited?",
      "Do we prefer one person to own planning and estimates, or share that responsibility across the team?",
    ],
    bridge:
      "When we struggle to agree on these or other questions, we have principles that guide our decisions and how we relate to one another.",
    question: "But what are those principles?",
    setup:
      "Our <b>eight values</b> are organized around <b>four key dimensions</b>:",
    dimensions: [
      "how we think",
      "how we work together",
      "how we make things happen",
      "how we deliver",
    ],
    ekuthon: "This sandbox is the warm-up for Ekuthon: Ekumen's journey on November 23.",
    cta: "Let's explore them",
  },
  ui: {
    reset: "Reset",
    valuesReveal: "Two values on this axis",
    axisPoints: "pts on this axis",
    nextAxis: "Next axis",
    seeClosing: "See closing & ranking",
    outOf: "out of",
    pts: "pts",
    ready: "Done",
    emptyRanking: "No scores published yet.",
  },
  closing: {
    title: "Powering your ingenuity",
    subtitle: "These are the eight values that guide us.",
    scoreLabel: "Your score",
    ekuthonTicket: "You've got your ticket to Ekuthon",
    ekuthonDetail: "Ekumen's journey is on November 23. See you there.",
    ekuthonSpoiler: "There's an Ekuthon spoiler on this site. Have you found it yet?",
    namePrompt: "Leave your name for the ranking",
    namePlaceholder: "Your name",
    submit: "Publish to ranking",
    rankingTitle: "Ranking",
    rankingLocal: "Ranking on this device (Supabase optional to share it).",
    replay: "Play again",
  },
  insight: {
    hint: "Tap to place anchors: straight lines are drawn between them. You can go outside the square.",
    undoHint: "Tap an anchor (or a lit puzzle dot) to undock from there. Also Backspace / Delete.",
    lines: "Lines",
    dots: "Dots",
    check: "Check",
    clear: "Clear all",
    needAll: "Some dots are still missing. Keep drawing.",
    tooMany: "There's a more direct way. Here's one possible solution.",
    success: "Insight! A shift in perspective is enough.",
    solutionTitle: "A more direct way to connect them",
  },
  elephant: {
    scrubHint:
      "Move your mouse or finger over the dots: they connect as you go. Once a quarter of them are revealed, you can try to guess. Finish them all and the eye appears.",
    question: "What is the whole?",
    options: ["A wall", "An elephant", "Six different animals", "A snake"],
    correct: "An elephant",
    success: "You saw the whole: an elephant! Integrating perspectives builds the picture.",
    fail: "It was an elephant. Each part matters, but the whole matters more.",
  },
  axisCards: [
    { id: "think", icon: "/icons/brain.png", label: "HOW WE THINK", color: "#2B65E7" },
    { id: "together", icon: "/icons/handshake.png", label: "HOW WE WORK TOGETHER", color: "#448FF4" },
    { id: "happen", icon: "/icons/rocket.png", label: "HOW WE MAKE THINGS HAPPEN", color: "#775DFD" },
    { id: "deliver", icon: "/icons/star.png", label: "HOW WE DELIVER", color: "#683C95" },
  ],
  riddle: {
    clues: "Clues",
    extraHintBtn: "Ask for a hint (−40 pts)",
    extraHint: "Carla is Dev and Diego is QA. The rest falls into place by elimination.",
    assign: "Assign a role to each person",
    check: "Check",
    needAll: "Assign a role to each person.",
    uniqueRoles: "Each role can only be used once.",
    wrong: "Not quite yet. Review the clues and adjust.",
    success: "You solved it! Try, observe, adjust—that's the way.",
    people: ["Ana", "Bruno", "Carla", "Diego"],
    roles: ["Dev", "Design", "PM", "QA"],
  },
  wordle: {
    needFive: "The word has 5 letters.",
    success: "You solved it by iterating: try, read the signal, adjust.",
    fail: "The word was {word}. The iterative process still counts.",
    legendPresent: "Right letter, wrong position",
    legendCorrect: "Right letter and position",
    legendAbsent: "Wrong letter",
  },
  axes: [
    {
      id: "think",
      name: "How we think",
      accent: "#2B65E7",
      minutes: "~2 min",
      gameTitle: "Insight",
      story: [
        "Consider the following situation.",
        "By exploring a different approach, we discover something that, at first glance, did not seem to be there. Sometimes a shift in perspective is enough to reorganize what we see.",
        "We call these moments insights: when a new logic emerges and lets us understand a problem differently.",
      ],
      gamePrompt:
        "Draw lines to connect the nine dots. A change of perspective often reveals more than first meets the eye.",
      closing:
        "If we challenge current approaches we can reach better results. Developing that thinking also means listening to and integrating ideas different from our own.",
      startChallenge: "Start challenge",
      values: [
        {
          name: "Critical thinking",
          line: "If we challenge current approaches, we can reach better results.",
        },
        {
          name: "Diversity and open-mindedness",
          line: "We believe the best solutions come from integrating different perspectives.",
        },
      ],
    },
    {
      id: "together",
      name: "How we work together",
      accent: "#448FF4",
      minutes: "~2 min",
      gameTitle: "The elephant",
      story: [
        "Let's revisit an old parable.",
        "Six blind sages meet an elephant for the first time. Since none can see it, they try to discover what animal stands before them using only touch.",
        "Meanwhile, you can try to discover it too.",
      ],
      gamePrompt:
        "Pass over the outline dots. At 25% you can already try to guess what it is.",
      closing:
        "Each perspective reveals part of reality, but none alone is enough to understand the whole. We need to integrate others' experiences, knowledge and perspectives.",
      startChallenge: "Start challenge",
      values: [
        {
          name: "Collaboration",
          line: "We foster collective learning.",
        },
        {
          name: "Collective effort",
          line: "We make ourselves available to help others, and we trust others will do the same when we need help.",
        },
      ],
    },
    {
      id: "happen",
      name: "How we make things happen",
      accent: "#775DFD",
      minutes: "~3 min",
      gameTitle: "Logic riddle",
      story: [
        "Facing complex problems, outcomes become less predictable. Often we need to try, observe what happens, and adjust course from what we learn.",
        "At Ekumen we understand that uncertainty and change are a natural part of our work.",
      ],
      gamePrompt: "Solve this riddle with the clues. You can ask for an extra hint (it costs points).",
      closing:
        "We trust that whatever the challenge, we can solve it or adapt to circumstances. That trust also means taking initiative.",
      startChallenge: "Start challenge",
      values: [
        {
          name: "We'll find a way to solve it",
          line: "We trust that whatever the challenge, we can solve it or adapt to the circumstances.",
        },
        {
          name: "We lead the search for solutions from our side",
          line: "We don't wait for them to appear on their own.",
        },
      ],
    },
    {
      id: "deliver",
      name: "How we deliver",
      accent: "#683C95",
      minutes: "~2 min",
      gameTitle: "Iterate",
      story: [
        "We work in dynamic contexts—changes, new requirements, and challenges we often cannot anticipate.",
        "How do we create value in a scenario like this?",
      ],
      gamePrompt:
        "Guess the word in up to 6 tries. Each attempt gives you information: adjust your strategy and try again.",
      closing:
        "You did not have all the information at the start. With autonomy, initiative and confidence you built a good-enough solution to move forward.",
      startChallenge: "Start challenge",
      values: [
        {
          name: "Entrepreneurial spirit",
          line: "We don't sit with our arms crossed: we take collective challenges and own them.",
        },
        {
          name: "Professionalism",
          line: "We constantly strive to deliver the most value, prioritize trust and autonomy, and take ownership of our actions.",
        },
      ],
    },
  ],
};
