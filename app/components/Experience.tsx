"use client";

import { useEffect, useState } from "react";
import { AxisScoreGrid, ValueCardList, type AxisScoreItem } from "@/app/components/AxisScoreCard";
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
import { clearAssignedWords } from "@/app/lib/wordleWords";

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
  const [localeMotion, setLocaleMotion] = useState(false);

  const axes = t.axes;
  const axis = axes[axisIndex];
  const done = completedCount(progress);
  const score = totalScore(scores);

  function axisItems(ids?: ClusterId[]): AxisScoreItem[] {
    return t.axisCards
      .filter((card) => !ids || ids.includes(card.id))
      .map((card) => ({
        id: card.id,
        emoji: card.emoji,
        label: card.label,
        color: card.color,
        points: scores[card.id],
        values: axes.find((item) => item.id === card.id)?.values ?? [],
      }));
  }

  useEffect(() => {
    if (!ready) return;
    if (done === 4 && phase === "intro") {
      setPhase("closing");
    }
  }, [ready, done, phase]);

  useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  function changeLocale(next: "es" | "en") {
    if (next === locale) return;
    setLocaleMotion(true);
    setLocale(next);
    window.setTimeout(() => setLocaleMotion(false), 420);
  }

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
        setExpandedCard(null);
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
    clearAssignedWords();
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

  const allowScroll = phase === "closing";

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="mx-auto flex w-full max-w-[1100px] shrink-0 items-center justify-between gap-2 px-4 py-2 sm:gap-3 sm:px-6">
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
            className={`h-5 text-[18px] transition-opacity sm:h-6 sm:text-[20px] ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          />
        </button>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="hidden text-xs text-[#02043E]/50 sm:inline" suppressHydrationWarning>
            {ready ? `${done}/4` : "\u00a0"}
          </span>
          <div
            role="group"
            aria-label="Language"
            className="relative flex h-8 items-stretch border border-[#02043E]/15 bg-white p-0.5"
          >
            <span
              aria-hidden
              className={`lang-knob pointer-events-none absolute inset-y-0.5 w-[calc(50%-2px)] bg-[#02043E] ${
                locale === "en" ? "translate-x-[calc(100%+2px)]" : "translate-x-0"
              }`}
              style={{ left: 2 }}
            />
            <button
              type="button"
              onClick={() => changeLocale("es")}
              className={`relative z-10 min-w-8 px-2 text-[11px] font-semibold tracking-wide transition-colors ${
                locale === "es" ? "text-white" : "text-[#02043E]/55 hover:text-[#02043E]"
              }`}
              aria-pressed={locale === "es"}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => changeLocale("en")}
              className={`relative z-10 min-w-8 px-2 text-[11px] font-semibold tracking-wide transition-colors ${
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
            className="min-h-8 rounded-sm border border-[#02043E]/15 bg-white px-2.5 py-1.5 text-xs font-medium text-[#02043E] transition-colors hover:border-[#02043E]/35 sm:px-3"
          >
            {t.ui.reset}
          </button>
        </div>
      </header>

      <main
        className={`mx-auto flex min-h-0 w-full max-w-[1100px] flex-1 flex-col px-4 pt-1 sm:px-6 transition-opacity duration-300 ${
          allowScroll ? "overflow-y-auto pb-10" : "overflow-hidden pb-3"
        } ${fade ? "opacity-100" : "opacity-0"} ${localeMotion ? "locale-swap" : ""}`}
      >
        {phase === "intro" ? (
          <section className="grid min-h-0 flex-1 items-center gap-4 md:grid-cols-[auto_1fr] md:gap-8 lg:gap-10">
            <div className="hidden justify-center md:flex md:justify-start">
              <Mark
                progress={ready ? progress : undefined}
                className="mark-stagger h-28 lg:h-36"
              />
            </div>
            <div className="min-h-0">
              <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#023D8F]">
                {t.intro.title}
              </p>
              <h1 className="mt-1.5 text-[22px] font-light leading-[1.15] tracking-[-0.03em] sm:text-[26px] md:text-[32px]">
                {t.intro.headline}
              </h1>
              <p className="mt-2 max-w-xl text-[13px] leading-snug text-[#02043E]/80 sm:text-[14px]">
                {t.intro.lead}
              </p>
              <ul className="mt-2 max-w-xl space-y-1.5 text-[12px] leading-snug text-[#02043E]/70 sm:text-[13px]">
                {t.intro.dilemmas.map((d) => (
                  <li key={d} className="border-l border-[#02043E]/15 pl-2.5">
                    {d}
                  </li>
                ))}
              </ul>
              <p className="mt-2 max-w-xl text-[12px] leading-snug text-[#02043E]/75 sm:text-[13px]">
                {t.intro.bridge}
              </p>
              <p className="mt-2 text-[14px] font-medium tracking-tight sm:text-[15px]">
                {t.intro.question}
              </p>
              <p className="mt-1.5 max-w-xl text-[12px] leading-snug text-[#02043E]/75 sm:text-[13px]">
                {t.intro.setup}
              </p>
              <p className="mt-2 max-w-xl border-l-2 border-[#023D8F] pl-3 text-[12px] leading-snug text-[#023D8F] sm:text-[13px]">
                {t.intro.ekuthon}
              </p>
              <div className="mt-3">
                <Button type="button" onClick={startJourney} className="w-full sm:w-auto">
                  {t.intro.cta}
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {phase === "axis" && axis ? (
          <section className="mx-auto flex min-h-0 w-full max-w-[820px] flex-1 flex-col">
            <div className="shrink-0">
              <ProgressBar
                current={axisIndex + 1}
                total={4}
                accent={axis.accent}
                label={axis.name}
              />
            </div>

            <article
              className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm bg-white p-3.5 shadow-[0_8px_30px_rgba(2,4,62,0.05)] sm:p-5"
              style={{ boxShadow: `inset 3px 0 0 ${axis.accent}, 0 8px 30px rgba(2,4,62,0.05)` }}
            >
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                <p
                  className="text-[11px] font-medium tracking-[0.14em] uppercase"
                  style={{ color: axis.accent }}
                >
                  {axis.gameTitle} · {axis.minutes}
                </p>
                <Mark progress={progress} animate={animateFacet} className="h-7 sm:h-8" />
              </div>

              {axisStep === "story" ? (
                <div className="mt-3 flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 space-y-2.5 overflow-hidden">
                    <h2 className="text-[22px] font-light tracking-[-0.03em] sm:text-[26px] md:text-[30px]">
                      {axis.name}
                    </h2>
                    {axis.story.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-[13px] leading-snug text-[#02043E]/80 sm:text-[14px]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="shrink-0 pt-3">
                    <Button type="button" onClick={goPlay} className="w-full sm:w-auto">
                      {axis.startChallenge}
                    </Button>
                  </div>
                </div>
              ) : null}

              {axisStep === "play" ? (
                <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden">
                  <p className="mb-2 shrink-0 text-[13px] font-semibold leading-snug text-[#02043E] sm:text-[14px]">
                    {axis.gamePrompt}
                  </p>
                  <div className="min-h-0 flex-1 overflow-hidden">
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
                </div>
              ) : null}

              {axisStep === "reveal" ? (
                <div className="mt-3 flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 space-y-2.5 overflow-hidden">
                    <h2 className="text-[20px] font-light tracking-[-0.03em] sm:text-[24px]">
                      {t.ui.valuesReveal}
                    </h2>
                    <p className="text-[13px] leading-snug text-[#02043E]/80 sm:text-[14px]">
                      {axis.closing}
                    </p>
                    <ValueCardList
                      items={axis.values.map((value, index) => ({
                        id: `${axis.id}-${index}`,
                        name: value.name,
                        line: value.line,
                        color: axis.accent,
                        startOpen: true,
                      }))}
                    />
                    <p className="text-xs text-[#02043E]/55">
                      +{scores[axis.id]} {t.ui.axisPoints}
                    </p>
                  </div>
                  <div className="shrink-0 pt-3">
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
          <section className="mx-auto w-full max-w-[820px] space-y-6">
            <div className="rounded-sm bg-white p-5 text-center shadow-[0_8px_30px_rgba(2,4,62,0.05)] sm:p-7 md:p-10">
              <Mark progress={progress} className="mx-auto h-20 sm:h-24 md:h-28" />
              <h2 className="mt-4 text-[24px] font-light tracking-[-0.03em] sm:text-[28px] md:text-[36px]">
                {t.closing.title}
              </h2>
              <p className="mt-2 text-[14px] text-[#02043E]/75">{t.closing.subtitle}</p>

              <div id="closing-score" className="mt-7">
                <p className="text-xs tracking-[0.14em] uppercase text-[#02043E]/45">
                  {t.closing.scoreLabel}
                </p>
                <p className="mt-1.5 text-[56px] font-light leading-none tracking-[-0.04em] text-[#023D8F] sm:text-[64px] md:text-[80px]">
                  {score}
                </p>
                <p className="mt-1.5 text-xs text-[#02043E]/45">
                  {t.ui.outOf} 1000
                </p>
              </div>

              <div className="mt-6">
                <AxisScoreGrid
                  items={axisItems()}
                  pointsSuffix={t.ui.pts}
                  expandedId={expandedCard}
                  onToggle={(id) => setExpandedCard(expandedCard === id ? null : id)}
                />
              </div>

              <div className="mx-auto mt-8 max-w-lg border-t border-[#02043E]/08 pt-6">
                <p className="text-[18px] font-medium tracking-tight text-[#023D8F] sm:text-[20px]">
                  {t.closing.ekuthonTicket}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-[#02043E]/70 sm:text-[14px]">
                  {t.closing.ekuthonDetail}
                </p>
                <p className="mt-3 text-[13px] font-medium leading-relaxed text-[#023D8F] sm:text-[14px]">
                  {t.closing.ekuthonSpoiler}
                </p>
              </div>

              <div className="mx-auto mt-8 max-w-md text-left">
                {!submitted ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">
                      {t.closing.namePrompt}
                      <input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        maxLength={24}
                        placeholder={t.closing.namePlaceholder}
                        className="mt-2 w-full rounded-sm border border-[#02043E]/15 px-4 py-2.5 text-sm outline-none focus:border-[#023D8F]"
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
                  <p className="text-center text-[14px] text-[#023D8F]">
                    {t.ui.ready}
                    {displayName ? `, ${displayName}` : ""}.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-sm bg-white p-5 shadow-[0_8px_30px_rgba(2,4,62,0.05)] sm:p-6 md:p-8">
              <h3 className="text-lg font-medium tracking-tight">{t.closing.rankingTitle}</h3>
              {!configured ? (
                <p className="mt-2 text-sm text-[#02043E]/55">{t.closing.rankingLocal}</p>
              ) : null}
              {rows.length === 0 ? (
                <p className="mt-4 text-sm text-[#02043E]/55">{t.ui.emptyRanking}</p>
              ) : (
                <ol className="mt-4 space-y-1.5">
                  {rows.map((row, index) => (
                    <li
                      key={row.id}
                      className={`flex items-center justify-between rounded-sm px-3 py-2.5 text-[14px] ${
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

            <div className="flex justify-center pb-2">
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
