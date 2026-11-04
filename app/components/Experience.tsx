"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/Button";
import { Mark } from "@/app/components/Mark";
import { ProgressBar } from "@/app/components/ProgressBar";
import { ElephantGame } from "@/app/games/ElephantGame";
import { InsightGame } from "@/app/games/InsightGame";
import { LogicRiddleGame } from "@/app/games/LogicRiddleGame";
import { WordleGame } from "@/app/games/WordleGame";
import { axes, closingCopy, intro } from "@/app/lib/content";
import {
  fetchTopScores,
  isLeaderboardConfigured,
  sanitizeName,
  submitScore,
  type LeaderboardRow,
} from "@/app/lib/leaderboard";
import { completedCount, totalScore, useProgress } from "@/app/lib/progress";
import { CLUSTER_ORDER, type ClusterId, type GameResult } from "@/app/lib/types";

type Phase = "intro" | "axis" | "closing";
type AxisStep = "story" | "play" | "reveal";

export function Experience() {
  const {
    progress,
    scores,
    displayName,
    submitted,
    ready,
    markComplete,
    setDisplayName,
    markSubmitted,
    reset,
  } = useProgress();

  const [phase, setPhase] = useState<Phase>("intro");
  const [axisIndex, setAxisIndex] = useState(0);
  const [axisStep, setAxisStep] = useState<AxisStep>("story");
  const [fade, setFade] = useState(true);
  const [animateFacet, setAnimateFacet] = useState<ClusterId | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [configured] = useState(() => isLeaderboardConfigured());

  const axis = axes[axisIndex];
  const done = completedCount(progress);
  const score = totalScore(scores);

  useEffect(() => {
    if (!ready) return;
    if (done === 4 && phase === "intro") {
      setPhase("closing");
    }
  }, [ready, done, phase]);

  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  function transition(next: () => void) {
    setFade(false);
    window.setTimeout(() => {
      next();
      setFade(true);
    }, 280);
  }

  function startJourney() {
    transition(() => {
      setPhase("axis");
      setAxisIndex(0);
      setAxisStep("story");
    });
  }

  function goPlay() {
    transition(() => setAxisStep("play"));
  }

  function onGameFinish(result: GameResult) {
    const id = axis.id;
    markComplete(id, result.score);
    setAnimateFacet(id);
    transition(() => setAxisStep("reveal"));
  }

  function goNextAfterReveal() {
    if (axisIndex >= axes.length - 1) {
      transition(() => {
        setPhase("closing");
        setAnimateFacet(null);
      });
      return;
    }
    transition(() => {
      setAxisIndex((i) => i + 1);
      setAxisStep("story");
      setAnimateFacet(null);
    });
  }

  async function publish() {
    const name = sanitizeName(nameInput);
    setDisplayName(name);
    setPublishError(null);
    setPublishing(true);
    const result = await submitScore({
      displayName: name,
      total: score,
      breakdown: scores,
    });
    setPublishing(false);
    if (!result.ok) {
      setPublishError(result.error ?? "Error al publicar");
      return;
    }
    if (result.error) setPublishError(result.error);
    markSubmitted();
    const top = await fetchTopScores(10);
    setRows(top);
  }

  useEffect(() => {
    if (phase !== "closing") return;
    let cancelled = false;
    fetchTopScores(10).then((top) => {
      if (!cancelled) setRows(top);
    });
    return () => {
      cancelled = true;
    };
  }, [phase, submitted]);

  useEffect(() => {
    if (phase !== "closing") return;
    const el = document.getElementById("closing-score");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [phase]);

  function replay() {
    reset();
    transition(() => {
      setPhase("intro");
      setAxisIndex(0);
      setAxisStep("story");
      setAnimateFacet(null);
      setRows([]);
      setPublishError(null);
    });
  }

  return (
    <div className="min-h-full">
      <header className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-4 px-6 py-5">
        <button
          type="button"
          className="text-ink"
          aria-label="Inicio"
          onClick={() =>
            transition(() => {
              setPhase("intro");
              setAxisStep("story");
            })
          }
        >
          <Mark
            progress={ready ? progress : undefined}
            wordmark
            animate={animateFacet}
            className={`h-8 text-[28px] transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}
          />
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#02043E]/50" suppressHydrationWarning>
            {ready ? `${done}/4` : "\u00a0"}
          </span>
          <button
            type="button"
            onClick={replay}
            className="rounded-full border border-[#02043E]/15 bg-white px-4 py-2 text-sm font-medium text-[#02043E] transition-colors hover:border-[#02043E]/35"
          >
            Reiniciar
          </button>
        </div>
      </header>

      <main
        className={`mx-auto w-full max-w-[1100px] px-6 pb-20 pt-4 transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {phase === "intro" ? (
          <section className="grid items-center gap-10 md:grid-cols-[1fr_1.4fr] md:gap-14">
            <div className="flex justify-center md:justify-start">
              <Mark
                progress={ready ? progress : undefined}
                className="mark-stagger h-36 md:h-44"
              />
            </div>
            <div>
              <p className="text-[12px] font-medium tracking-[0.18em] uppercase text-[#023D8F]">
                {intro.title}
              </p>
              <h1 className="mt-4 text-[34px] font-light leading-[1.15] tracking-[-0.03em] md:text-[48px]">
                Una estrella polar para decidir juntos
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[#02043E]/80">
                {intro.lead}
              </p>
              <ul className="mt-5 max-w-xl space-y-3 text-[15px] leading-relaxed text-[#02043E]/70">
                {intro.dilemmas.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#02043E]/75">
                {intro.bridge}
              </p>
              <p className="mt-4 text-[18px] font-medium tracking-tight">{intro.question}</p>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#02043E]/75">
                {intro.setup}
              </p>
              <div className="mt-8">
                <Button type="button" onClick={startJourney}>
                  {intro.cta}
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {phase === "axis" && axis ? (
          <section className="mx-auto max-w-[820px]">
            <ProgressBar
              current={axisIndex + 1}
              total={4}
              accent={axis.accent}
              label={axis.name}
            />

            <article
              className="mt-6 rounded-[24px] bg-white p-7 shadow-[0_8px_30px_rgba(2,4,62,0.05)] md:p-10"
              style={{ boxShadow: `inset 4px 0 0 ${axis.accent}, 0 8px 30px rgba(2,4,62,0.05)` }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p
                  className="text-[12px] font-medium tracking-[0.16em] uppercase"
                  style={{ color: axis.accent }}
                >
                  {axis.gameTitle} · {axis.minutes}
                </p>
                <Mark
                  progress={progress}
                  animate={animateFacet}
                  className="h-10"
                />
              </div>

              {axisStep === "story" ? (
                <div className="mt-6 space-y-4">
                  <h2 className="text-3xl font-light tracking-[-0.03em] md:text-[40px]">
                    {axis.name}
                  </h2>
                  {axis.story.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[16px] leading-relaxed text-[#02043E]/80"
                    >
                      {paragraph}
                    </p>
                  ))}
                  <p className="text-[16px] leading-relaxed text-[#02043E]/90">
                    {axis.gamePrompt}
                  </p>
                  <div className="pt-4">
                    <Button type="button" onClick={goPlay}>
                      Empezar desafío
                    </Button>
                  </div>
                </div>
              ) : null}

              {axisStep === "play" ? (
                <div className="mt-6">
                  <h2 className="mb-5 text-2xl font-light tracking-tight md:text-3xl">
                    {axis.gameTitle}
                  </h2>
                  {axis.id === "think" ? (
                    <InsightGame key="think" onFinish={onGameFinish} />
                  ) : null}
                  {axis.id === "together" ? (
                    <ElephantGame key="together" onFinish={onGameFinish} />
                  ) : null}
                  {axis.id === "happen" ? (
                    <LogicRiddleGame key="happen" onFinish={onGameFinish} />
                  ) : null}
                  {axis.id === "deliver" ? (
                    <WordleGame key="deliver" onFinish={onGameFinish} />
                  ) : null}
                </div>
              ) : null}

              {axisStep === "reveal" ? (
                <div className="mt-6 space-y-5">
                  <h2 className="text-3xl font-light tracking-[-0.03em]">Dos valores de este eje</h2>
                  <p className="text-[16px] leading-relaxed text-[#02043E]/80">{axis.closing}</p>
                  <ul className="space-y-4">
                    {axis.values.map((value) => (
                      <li
                        key={value.name}
                        className="rounded-2xl border border-[#02043E]/08 bg-[#f7f8fc] p-5"
                      >
                        <p className="font-medium" style={{ color: axis.accent }}>
                          {value.name}
                        </p>
                        <p className="mt-1 text-[15px] leading-relaxed text-[#02043E]/75">
                          {value.line}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-[#02043E]/55">
                    +{scores[axis.id]} pts en este eje
                  </p>
                  <div className="pt-2">
                    <Button type="button" onClick={goNextAfterReveal}>
                      {axisIndex >= axes.length - 1 ? "Ver cierre y ranking" : "Siguiente eje"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </article>
          </section>
        ) : null}

        {phase === "closing" ? (
          <section className="mx-auto max-w-[820px] space-y-8">
            <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_8px_30px_rgba(2,4,62,0.05)] md:p-12">
              <Mark progress={progress} className="mx-auto h-28 md:h-36" />
              <h2 className="mt-6 text-3xl font-light tracking-[-0.03em] md:text-[42px]">
                {closingCopy.title}
              </h2>
              <p className="mt-3 text-[16px] text-[#02043E]/75">{closingCopy.subtitle}</p>

              <div id="closing-score" className="mt-10">
                <p className="text-sm tracking-[0.14em] uppercase text-[#02043E]/45">
                  {closingCopy.scoreLabel}
                </p>
                <p className="mt-2 text-[72px] font-light leading-none tracking-[-0.04em] text-[#023D8F] md:text-[96px]">
                  {score}
                </p>
                <p className="mt-2 text-sm text-[#02043E]/45">sobre 1000</p>
              </div>

              <ul className="mt-8 grid gap-2 text-left sm:grid-cols-2">
                {CLUSTER_ORDER.map((id) => {
                  const item = axes.find((a) => a.id === id)!;
                  return (
                    <li
                      key={id}
                      className="rounded-2xl border border-[#02043E]/08 px-4 py-3 text-sm"
                    >
                      <span style={{ color: item.accent }} className="font-medium">
                        {item.name}
                      </span>
                      <span className="float-right text-[#02043E]/55">{scores[id]} pts</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mx-auto mt-10 max-w-md text-left">
                {!submitted ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">
                      {closingCopy.namePrompt}
                      <input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        maxLength={24}
                        placeholder={closingCopy.namePlaceholder}
                        className="mt-2 w-full rounded-2xl border border-[#02043E]/15 px-4 py-3 text-base outline-none focus:border-[#023D8F]"
                      />
                    </label>
                    <Button
                      type="button"
                      onClick={publish}
                      disabled={publishing || sanitizeName(nameInput).length < 2}
                      className="w-full"
                    >
                      {closingCopy.submit}
                    </Button>
                    {publishError ? (
                      <p className="text-sm text-[#02043E]/65">{publishError}</p>
                    ) : null}
                    {!configured ? (
                      <p className="text-sm text-[#02043E]/55">{closingCopy.rankingLocal}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-center text-[15px] text-[#023D8F]">
                    Listo{displayName ? `, ${displayName}` : ""}.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[24px] bg-white p-7 shadow-[0_8px_30px_rgba(2,4,62,0.05)] md:p-9">
              <h3 className="text-xl font-medium tracking-tight">{closingCopy.rankingTitle}</h3>
              {!configured ? (
                <p className="mt-2 text-sm text-[#02043E]/55">{closingCopy.rankingLocal}</p>
              ) : null}
              {rows.length === 0 ? (
                <p className="mt-4 text-sm text-[#02043E]/55">Todavía no hay puntajes publicados.</p>
              ) : (
                <ol className="mt-5 space-y-2">
                  {rows.map((row, index) => (
                    <li
                      key={row.id}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] ${
                        displayName &&
                        row.display_name.toLowerCase() === displayName.toLowerCase()
                          ? "bg-[#023D8F]/08"
                          : "bg-[#f7f8fc]"
                      }`}
                    >
                      <span>
                        <span className="mr-3 text-[#02043E]/40">{index + 1}.</span>
                        {row.display_name}
                      </span>
                      <span className="font-medium tabular-nums">{row.total}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="flex justify-center">
              <Button type="button" variant="secondary" onClick={replay}>
                {closingCopy.replay}
              </Button>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
