"use client";

import { useEffect, useState } from "react";
import { AxisScoreGrid, ValueCardList, type AxisScoreItem } from "@/app/components/AxisScoreCard";
import { Button } from "@/app/components/Button";
import { Mark } from "@/app/components/Mark";
import { ProgressBar } from "@/app/components/ProgressBar";
import { RichText } from "@/app/components/RichText";
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

  useEffect(() => {
    const lock = phase !== "closing";
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
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

  const isClosing = phase === "closing";

  return (
    <div className={isClosing ? "min-h-dvh" : "flex h-dvh flex-col overflow-hidden"}>
      <header className="site-header mx-auto flex w-full max-w-[1100px] shrink-0 items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
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
            className={`h-6 text-[20px] transition-opacity sm:h-7 sm:text-[24px] ${
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
              className={`lang-knob pointer-events-none absolute inset-y-0.5 w-[calc(50%-2px)] bg-[#02043E] ${
                locale === "en" ? "translate-x-[calc(100%+2px)]" : "translate-x-0"
              }`}
              style={{ left: 2 }}
            />
            <button
              type="button"
              onClick={() => changeLocale("es")}
              className={`relative z-10 min-w-10 px-2.5 text-xs font-semibold tracking-wide transition-colors ${
                locale === "es" ? "text-white" : "text-[#02043E]/55 hover:text-[#02043E]"
              }`}
              aria-pressed={locale === "es"}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => changeLocale("en")}
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
        className={`site-main mx-auto w-full max-w-[1100px] px-4 pt-2 sm:px-6 sm:pt-4 transition-opacity duration-300 ${
          isClosing
            ? "pb-16 sm:pb-20"
            : "min-h-0 flex-1 overflow-hidden pb-3 sm:pb-4"
        } ${fade ? "opacity-100" : "opacity-0"} ${localeMotion ? "locale-swap" : ""}`}
      >
        {phase === "intro" ? (
          <section className="intro-screen grid h-full items-center gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] md:gap-8 lg:gap-12">
            <div className="flex justify-center md:justify-start">
              <Mark
                progress={ready ? progress : undefined}
                className="intro-mark mark-stagger h-[clamp(7.5rem,22vh,16rem)]"
              />
            </div>
            <div className="intro-copy min-w-0">
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-[#023D8F] sm:text-[12px]">
                {t.intro.title}
              </p>
              <RichText
                as="h1"
                html={t.intro.headline}
                className="intro-h1 mt-3 text-[clamp(1.35rem,1.6vw+0.85rem,2.1rem)] font-light leading-[1.15] tracking-[-0.03em]"
              />
              <RichText
                as="p"
                html={t.intro.lead}
                className="intro-p mt-3 max-w-2xl text-[clamp(0.8125rem,0.25vw+0.7rem,0.9375rem)] leading-snug text-[#02043E]/80"
              />
              <ul className="intro-list mt-3 max-w-2xl space-y-2 text-[clamp(0.75rem,0.2vw+0.68rem,0.875rem)] leading-snug text-[#02043E]/70">
                {t.intro.dilemmas.map((d) => (
                  <RichText as="li" key={d} html={d} />
                ))}
              </ul>
              <RichText
                as="p"
                html={t.intro.bridge}
                className="intro-p mt-3 max-w-2xl text-[clamp(0.75rem,0.2vw+0.68rem,0.875rem)] leading-snug text-[#02043E]/75"
              />
              <RichText
                as="p"
                html={t.intro.question}
                className="intro-q mt-2.5 text-[clamp(0.9375rem,0.3vw+0.75rem,1.0625rem)] font-medium tracking-tight"
              />
              <RichText
                as="p"
                html={t.intro.setup}
                className="intro-p mt-2 max-w-2xl text-[clamp(0.75rem,0.2vw+0.68rem,0.875rem)] leading-snug text-[#02043E]/75"
              />
              <ul className="intro-dims mt-2 max-w-2xl space-y-1.5 text-[clamp(0.75rem,0.2vw+0.68rem,0.875rem)] leading-snug text-[#02043E]/75">
                {t.intro.dimensions.map((label, index) => {
                  const color = t.axisCards[index]?.color ?? "#023D8F";
                  return (
                    <li key={label} className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-[0.4em] h-2 w-2 shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <span>{label}</span>
                    </li>
                  );
                })}
              </ul>
              <RichText
                as="p"
                html={t.intro.ekuthon}
                className="intro-p mt-3 max-w-2xl border-l-2 border-[#023D8F] pl-3 text-[clamp(0.75rem,0.2vw+0.68rem,0.875rem)] leading-snug text-[#023D8F]"
              />
              <div className="intro-cta mt-5">
                <Button type="button" onClick={startJourney} className="w-full sm:w-auto">
                  {t.intro.cta}
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {phase === "axis" && axis ? (
          <section
            className={`axis-screen mx-auto flex h-full flex-col ${
              axisStep === "play" ? "max-w-[1100px]" : "max-w-[820px]"
            }`}
          >
            <ProgressBar
              current={axisIndex + 1}
              total={4}
              accent={axis.accent}
              label={axis.name}
            />

            <article
              className="axis-card mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm bg-white p-5 shadow-[0_8px_30px_rgba(2,4,62,0.05)] sm:p-7 md:p-10"
              style={{ boxShadow: `inset 4px 0 0 ${axis.accent}, 0 8px 30px rgba(2,4,62,0.05)` }}
            >
              <div className="axis-card-meta flex shrink-0 flex-wrap items-baseline justify-between gap-3">
                <p
                  className="text-[11px] font-medium tracking-[0.16em] uppercase sm:text-[12px]"
                  style={{ color: axis.accent }}
                >
                  {axis.gameTitle} · {axis.minutes}
                </p>
                <Mark progress={progress} animate={animateFacet} className="axis-card-mark h-9 sm:h-10" />
              </div>

              {axisStep === "story" ? (
                <div className="axis-story mt-6 flex min-h-0 flex-1 flex-col gap-4">
                  <h2 className="axis-story-title shrink-0 text-[clamp(1.5rem,1.8vw+1.5rem,2rem)] font-medium tracking-[-0.03em]">
                    {axis.name}
                  </h2>
                  <div className="axis-story-body flex min-h-0 flex-1 flex-col gap-3">
                    {axis.story.map((paragraph) => (
                      <RichText
                        as="p"
                        key={paragraph}
                        html={paragraph}
                        className="text-[clamp(0.8125rem,0.3vw+0.7rem,0.9375rem)] leading-relaxed text-[#02043E]/80"
                      />
                    ))}
                  </div>
                  <div className="axis-story-cta shrink-0 pt-1">
                    <Button type="button" onClick={goPlay} className="w-full sm:w-auto">
                      {axis.startChallenge}
                    </Button>
                  </div>
                </div>
              ) : null}

              {axisStep === "play" ? (
                <div className="mt-4 flex min-h-0 flex-1 flex-col">
                  {axis.id === "think" ? (
                    <InsightGame
                      key={`think-${t.locale}`}
                      title={axis.gameTitle}
                      prompt={axis.gamePrompt}
                      onFinish={onGameFinish}
                    />
                  ) : null}
                  {axis.id === "together" ? (
                    <ElephantGame
                      key={`together-${t.locale}`}
                      title={axis.gameTitle}
                      prompt={axis.gamePrompt}
                      onFinish={onGameFinish}
                    />
                  ) : null}
                  {axis.id === "happen" ? (
                    <LogicRiddleGame
                      key={`happen-${t.locale}`}
                      title={axis.gameTitle}
                      prompt={axis.gamePrompt}
                      onFinish={onGameFinish}
                    />
                  ) : null}
                  {axis.id === "deliver" ? (
                    <WordleGame
                      key={`deliver-${t.locale}`}
                      title={axis.gameTitle}
                      prompt={axis.gamePrompt}
                      onFinish={onGameFinish}
                    />
                  ) : null}
                </div>
              ) : null}

              {axisStep === "reveal" ? (
                <div className="axis-reveal mt-6 flex min-h-0 flex-1 flex-col gap-4">
                  <div className="flex min-h-0 flex-1 flex-col gap-3">
                    <h2 className="axis-story-title shrink-0 text-[clamp(1.375rem,1.8vw+0.8rem,1.875rem)] font-light tracking-[-0.03em]">
                      {t.ui.valuesReveal}
                    </h2>
                    <RichText
                      as="p"
                      html={axis.closing}
                      className="text-[clamp(0.8125rem,0.3vw+0.7rem,0.9375rem)] leading-relaxed text-[#02043E]/80"
                    />
                    <ValueCardList
                      items={axis.values.map((value, index) => ({
                        id: `${axis.id}-${index}`,
                        name: value.name,
                        line: value.line,
                        color: axis.accent,
                        startOpen: true,
                      }))}
                    />
                    <p className="text-sm text-[#02043E]/55">
                      +{scores[axis.id]} {t.ui.axisPoints}
                    </p>
                  </div>
                  <div className="axis-story-cta shrink-0">
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
              <h2 className="mt-6 text-[clamp(1.5rem,2vw+0.8rem,2.25rem)] font-light tracking-[-0.03em]">
                {t.closing.title}
              </h2>
              <p className="mt-3 text-[clamp(0.875rem,0.35vw+0.7rem,1rem)] text-[#02043E]/75">
                {t.closing.subtitle}
              </p>

              <div id="closing-score" className="mt-10">
                <p className="text-sm tracking-[0.14em] uppercase text-[#02043E]/45">
                  {t.closing.scoreLabel}
                </p>
                <p className="mt-2 text-[clamp(3.5rem,6vw+1rem,5.5rem)] font-light leading-none tracking-[-0.04em] text-[#023D8F]">
                  {score}
                </p>
                <p className="mt-2 text-sm text-[#02043E]/45">
                  {t.ui.outOf} 1000
                </p>
              </div>

              <div className="mt-8">
                <AxisScoreGrid
                  items={axisItems()}
                  pointsSuffix={t.ui.pts}
                  expandedId={expandedCard}
                  onToggle={(id) => setExpandedCard(expandedCard === id ? null : id)}
                />
              </div>

              <div className="mx-auto mt-10 max-w-lg border-t border-[#02043E]/08 pt-8">
                <p className="text-[clamp(1.125rem,0.8vw+0.8rem,1.375rem)] font-medium tracking-tight text-[#023D8F]">
                  {t.closing.ekuthonTicket}
                </p>
                <p className="mt-2 text-[clamp(0.8125rem,0.3vw+0.7rem,0.9375rem)] leading-relaxed text-[#02043E]/70">
                  {t.closing.ekuthonDetail}
                </p>
                <p className="mt-4 text-[clamp(0.8125rem,0.3vw+0.7rem,0.9375rem)] font-medium leading-relaxed text-[#023D8F]">
                  {t.closing.ekuthonSpoiler}
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
