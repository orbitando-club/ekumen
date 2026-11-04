"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/Button";
import { Mark } from "@/app/components/Mark";
import { ProgressBar } from "@/app/components/ProgressBar";
import { ElephantGame } from "@/app/games/ElephantGame";
import { InsightGame } from "@/app/games/InsightGame";
import { LogicRiddleGame } from "@/app/games/LogicRiddleGame";
import { WordleGame } from "@/app/games/WordleGame";
import { useLocale } from "@/app/lib/i18n/LocaleProvider";
import {
  fetchTopScores,
  isLeaderboardConfigured,
  sanitizeName,
  submitScore,
  type LeaderboardRow,
} from "@/app/lib/leaderboard";
import { completedCount, totalScore, useProgress } from "@/app/lib/progress";
import type { ClusterId, GameResult } from "@/app/lib/types";

type Phase = "intro" | "axis" | "closing";
type AxisStep = "story" | "play" | "reveal";

export function Experience() {
  const { t, locale, setLocale } = useLocale();
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
  const [expandedCard, setExpandedCard] = useState<ClusterId | null>(null);

  const axes = t.axes;
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
      setPublishError(result.error ?? "Error");
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
      <header className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
        <button
          type="button"
          className="min-w-0 text-ink"
          aria-label="Home"
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
            className={`h-7 text-[24px] transition-opacity sm:h-8 sm:text-[28px] ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          />
        </button>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-sm text-[#02043E]/50 sm:inline" suppressHydrationWarning>
            {ready ? `${done}/4` : "\u00a0"}
          </span>
          <div
            role="group"
            aria-label="Language"
            className="relative flex h-10 items-stretch border border-[#02043E]/15 bg-white p-0.5"
          >
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-y-0.5 w-[calc(50%-2px)] bg-[#02043E] transition-transform duration-200 ${
                locale === "en" ? "translate-x-[calc(100%+2px)]" : "translate-x-0"
              }`}
              style={{ left: 2 }}
            />
            <button
              type="button"
              onClick={() => setLocale("es")}
              className={`relative z-10 min-w-10 px-2.5 text-xs font-semibold tracking-wide transition-colors ${
                locale === "es" ? "text-white" : "text-[#02043E]/55 hover:text-[#02043E]"
              }`}
              aria-pressed={locale === "es"}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`relative z-10 min-w-10 px-2.5 text-xs font-semibold tracking-wide transition-colors ${
                locale === "en" ? "text-white" : "text-[#02043E]/55 hover:text-[#02043E]"
              }`}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            onClick={replay}
            className="min-h-10 rounded-sm border border-[#02043E]/15 bg-white px-3 py-2 text-sm font-medium text-[#02043E] transition-colors hover:border-[#02043E]/35 sm:px-4"
          >
            {t.ui.reset}
          </button>
        </div>
      </header>

      <main
        className={`mx-auto w-full max-w-[1100px] px-4 pb-16 pt-2 sm:px-6 sm:pb-20 sm:pt-4 transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {phase === "intro" ? (
          <section className="grid items-center gap-8 md:grid-cols-[1fr_1.4fr] md:gap-14">
            <div className="flex justify-center md:justify-start">
              <Mark
                progress={ready ? progress : undefined}
                className="mark-stagger h-28 sm:h-36 md:h-44"
              />
            </div>
            <div>
              <p className="text-[12px] font-medium tracking-[0.18em] uppercase text-[#023D8F]">
                {t.intro.title}
              </p>
              <h1 className="mt-4 text-[30px] font-light leading-[1.15] tracking-[-0.03em] sm:text-[34px] md:text-[48px]">
                {t.intro.headline}
              </h1>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[#02043E]/80 sm:text-[17px]">
                {t.intro.lead}
              </p>
              <ul className="mt-5 max-w-xl space-y-3 text-[15px] leading-relaxed text-[#02043E]/70">
                {t.intro.dilemmas.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#02043E]/75">
                {t.intro.bridge}
              </p>
              <p className="mt-4 text-[18px] font-medium tracking-tight">{t.intro.question}</p>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#02043E]/75">
                {t.intro.setup}
              </p>
              <p className="mt-5 max-w-xl border-l-2 border-[#023D8F] pl-4 text-[15px] leading-relaxed text-[#023D8F]">
                {t.intro.ekuthon}
              </p>
              <div className="mt-8">
                <Button type="button" onClick={startJourney} className="w-full sm:w-auto">
                  {t.intro.cta}
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
              className="mt-6 rounded-sm bg-white p-5 shadow-[0_8px_30px_rgba(2,4,62,0.05)] sm:p-7 md:p-10"
              style={{ boxShadow: `inset 4px 0 0 ${axis.accent}, 0 8px 30px rgba(2,4,62,0.05)` }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p
                  className="text-[12px] font-medium tracking-[0.16em] uppercase"
                  style={{ color: axis.accent }}
                >
                  {axis.gameTitle} · {axis.minutes}
                </p>
                <Mark progress={progress} animate={animateFacet} className="h-9 sm:h-10" />
              </div>

              {axisStep === "story" ? (
                <div className="mt-6 space-y-4">
                  <h2 className="text-[28px] font-light tracking-[-0.03em] sm:text-3xl md:text-[40px]">
                    {axis.name}
                  </h2>
                  {axis.story.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[15px] leading-relaxed text-[#02043E]/80 sm:text-[16px]"
                    >
                      {paragraph}
                    </p>
                  ))}
                  <div className="pt-4">
                    <Button type="button" onClick={goPlay} className="w-full sm:w-auto">
                      {axis.startChallenge}
                    </Button>
                  </div>
                </div>
              ) : null}

              {axisStep === "play" ? (
                <div className="mt-6">
                  <h2 className="mb-3 text-2xl font-light tracking-tight md:text-3xl">
                    {axis.gameTitle}
                  </h2>
                  <p className="mb-6 text-[16px] font-bold leading-relaxed text-[#02043E]">
                    {axis.gamePrompt}
                  </p>
                  {axis.id === "think" ? (
                    <InsightGame key={`think-${t.locale}`} onFinish={onGameFinish} />
                  ) : null}
                  {axis.id === "together" ? (
                    <ElephantGame key={`together-${t.locale}`} onFinish={onGameFinish} />
                  ) : null}
                  {axis.id === "happen" ? (
                    <LogicRiddleGame key={`happen-${t.locale}`} onFinish={onGameFinish} />
                  ) : null}
                  {axis.id === "deliver" ? (
                    <WordleGame key={`deliver-${t.locale}`} onFinish={onGameFinish} />
                  ) : null}
                </div>
              ) : null}

              {axisStep === "reveal" ? (
                <div className="mt-6 space-y-5">
                  <h2 className="text-[28px] font-light tracking-[-0.03em] sm:text-3xl">
                    {t.ui.valuesReveal}
                  </h2>
                  <p className="text-[15px] leading-relaxed text-[#02043E]/80 sm:text-[16px]">
                    {axis.closing}
                  </p>
                  <ul className="space-y-4">
                    {axis.values.map((value) => (
                      <li
                        key={value.name}
                        className="rounded-sm border border-[#02043E]/08 bg-[#f7f8fc] p-4 sm:p-5"
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
                    +{scores[axis.id]} {t.ui.axisPoints}
                  </p>
                  <div className="pt-2">
                    <Button type="button" onClick={goNextAfterReveal} className="w-full sm:w-auto">
                      {axisIndex >= axes.length - 1 ? t.ui.seeClosing : t.ui.nextAxis}
                    </Button>
                  </div>
                </div>
              ) : null}
            </article>
          </section>
        ) : null}

        {phase === "closing" ? (
          <section className="mx-auto max-w-[820px] space-y-8">
            <div className="rounded-sm bg-white p-6 text-center shadow-[0_8px_30px_rgba(2,4,62,0.05)] sm:p-8 md:p-12">
              <Mark progress={progress} className="mx-auto h-24 sm:h-28 md:h-36" />
              <h2 className="mt-6 text-[28px] font-light tracking-[-0.03em] sm:text-3xl md:text-[42px]">
                {t.closing.title}
              </h2>
              <p className="mt-3 text-[16px] text-[#02043E]/75">{t.closing.subtitle}</p>

              <div id="closing-score" className="mt-10">
                <p className="text-sm tracking-[0.14em] uppercase text-[#02043E]/45">
                  {t.closing.scoreLabel}
                </p>
                <p className="mt-2 text-[64px] font-light leading-none tracking-[-0.04em] text-[#023D8F] sm:text-[72px] md:text-[96px]">
                  {score}
                </p>
                <p className="mt-2 text-sm text-[#02043E]/45">
                  {t.ui.outOf} 1000
                </p>
              </div>

              <ul className="mt-8 grid grid-cols-1 gap-2 text-left sm:grid-cols-2">
                {t.axisCards.map((card) => {
                  const open = expandedCard === card.id;
                  const axisValues = axes.find((a) => a.id === card.id)?.values ?? [];
                  return (
                    <li key={card.id} className="min-w-0">
                      <button
                        type="button"
                        onClick={() => setExpandedCard(open ? null : card.id)}
                        aria-expanded={open}
                        className="flex w-full min-h-[108px] flex-col justify-between p-4 text-left text-white transition-opacity hover:opacity-95 sm:min-h-[120px] sm:p-5"
                        style={{ background: card.color }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-2xl leading-none" aria-hidden>
                            {card.emoji}
                          </span>
                          <span className="text-lg leading-none text-white/80" aria-hidden>
                            {open ? "−" : "+"}
                          </span>
                        </div>
                        <div className="mt-4 flex items-end justify-between gap-3">
                          <span className="text-[11px] font-semibold tracking-[0.08em] uppercase leading-snug sm:text-[12px]">
                            {card.label}
                          </span>
                          <span className="shrink-0 text-sm tabular-nums text-white/85">
                            {scores[card.id]} {t.ui.pts}
                          </span>
                        </div>
                      </button>
                      {open ? (
                        <div
                          className="space-y-3 border border-t-0 border-[#02043E]/10 bg-white p-4 text-[#02043E]"
                          style={{ borderColor: `${card.color}55` }}
                        >
                          {axisValues.map((value) => (
                            <div key={value.name}>
                              <p className="font-semibold" style={{ color: card.color }}>
                                {value.name}
                              </p>
                              <p className="mt-1 text-[14px] leading-relaxed text-[#02043E]/75">
                                {value.line}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              <div className="mx-auto mt-10 max-w-lg border-t border-[#02043E]/08 pt-8">
                <p className="text-[22px] font-medium tracking-tight text-[#023D8F] sm:text-[24px]">
                  {t.closing.ekuthonTicket}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#02043E]/70">
                  {t.closing.ekuthonDetail}
                </p>
              </div>

              <div className="mx-auto mt-10 max-w-md text-left">
                {!submitted ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">
                      {t.closing.namePrompt}
                      <input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        maxLength={24}
                        placeholder={t.closing.namePlaceholder}
                        className="mt-2 w-full rounded-sm border border-[#02043E]/15 px-4 py-3 text-base outline-none focus:border-[#023D8F]"
                      />
                    </label>
                    <Button
                      type="button"
                      onClick={publish}
                      disabled={publishing || sanitizeName(nameInput).length < 2}
                      className="w-full"
                    >
                      {t.closing.submit}
                    </Button>
                    {publishError ? (
                      <p className="text-sm text-[#02043E]/65">{publishError}</p>
                    ) : null}
                    {!configured ? (
                      <p className="text-sm text-[#02043E]/55">{t.closing.rankingLocal}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-center text-[15px] text-[#023D8F]">
                    {t.ui.ready}
                    {displayName ? `, ${displayName}` : ""}.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-sm bg-white p-6 shadow-[0_8px_30px_rgba(2,4,62,0.05)] sm:p-7 md:p-9">
              <h3 className="text-xl font-medium tracking-tight">{t.closing.rankingTitle}</h3>
              {!configured ? (
                <p className="mt-2 text-sm text-[#02043E]/55">{t.closing.rankingLocal}</p>
              ) : null}
              {rows.length === 0 ? (
                <p className="mt-4 text-sm text-[#02043E]/55">{t.ui.emptyRanking}</p>
              ) : (
                <ol className="mt-5 space-y-2">
                  {rows.map((row, index) => (
                    <li
                      key={row.id}
                      className={`flex items-center justify-between rounded-sm px-4 py-3 text-[15px] ${
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
              <Button type="button" variant="secondary" onClick={replay} className="w-full sm:w-auto">
                {t.closing.replay}
              </Button>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
