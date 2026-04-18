"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STRINGS } from "@/lib/constants";
import {
  fetchChapter,
  fetchChapters,
  pickResumeLesson,
  type ChapterListItem,
} from "@/lib/curriculum";

interface ChapterWithResume extends ChapterListItem {
  resumeHref: string | null;
  hasLessons: boolean;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function ordinal(n: number): string {
  return String(n).padStart(2, "0");
}

export default function LearnChaptersPage() {
  const [chapters, setChapters] = useState<ChapterWithResume[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const list = await fetchChapters();
        const sorted = [...list].sort((a, b) => a.order - b.order);

        const details = await Promise.all(
          sorted.map(async (chapter) => {
            try {
              const detail = await fetchChapter(chapter.id);
              const resume = pickResumeLesson(detail.lessons);
              const href = resume
                ? `/learn/${chapter.id}/${resume.id}`
                : null;
              return {
                ...chapter,
                resumeHref: href,
                hasLessons: detail.lessons.length > 0,
              } satisfies ChapterWithResume;
            } catch {
              return {
                ...chapter,
                resumeHref: null,
                hasLessons: false,
              } satisfies ChapterWithResume;
            }
          }),
        );

        if (!active) return;
        setChapters(details);
      } catch {
        if (!active) return;
        setLoadError(STRINGS.LEARN.LOAD_ERROR);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const totals = (chapters ?? []).reduce(
    (acc, ch) => {
      acc.total += ch.total_exercises;
      acc.done += ch.completed_exercises;
      return acc;
    },
    { total: 0, done: 0 },
  );

  return (
    <div className="relative mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-16">
      <header className="animate-fade-up max-w-3xl">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-dusk/70">
          {STRINGS.LEARN.EYEBROW}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.025em] text-taupe lg:text-[2.75rem]">
          {STRINGS.LEARN.HEADING}
        </h1>
        <p className="mt-3 max-w-xl text-[1rem] leading-relaxed text-muted-foreground">
          {STRINGS.LEARN.SUBHEADING}
        </p>

        {chapters && chapters.length > 0 ? (
          <p
            className="animate-fade-up mt-5 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-taupe/70"
            style={{ animationDelay: "120ms" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-dusk" />
            {STRINGS.LEARN.SUMMARY_EXERCISES(totals.done, totals.total)}
          </p>
        ) : null}
      </header>

      <div className="mt-10 flex flex-col gap-4">
        {loadError ? (
          <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-5 text-sm text-destructive">
            {loadError}
          </div>
        ) : null}

        {!chapters && !loadError ? (
          <ChaptersSkeleton />
        ) : null}

        {chapters && chapters.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card/80 p-10 text-center">
            <h2 className="text-lg font-bold text-taupe">
              {STRINGS.LEARN.EMPTY_HEADING}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {STRINGS.LEARN.EMPTY_BODY}
            </p>
          </div>
        ) : null}

        {chapters && chapters.length > 0
          ? chapters.map((chapter, index) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                index={index}
              />
            ))
          : null}
      </div>
    </div>
  );
}

function ChapterCard({
  chapter,
  index,
}: {
  chapter: ChapterWithResume;
  index: number;
}) {
  const percent = clampPercent(chapter.completion_percent);
  const complete = chapter.total_exercises > 0 && percent >= 100;
  const started = chapter.completed_exercises > 0 && !complete;

  const ctaLabel = complete
    ? STRINGS.LEARN.COMPLETE
    : started
      ? STRINGS.LEARN.IN_PROGRESS
      : STRINGS.LEARN.NOT_STARTED;

  const href = chapter.resumeHref;

  const content = (
    <>
      <div className="chapter-ord">
        {ordinal(chapter.order)}
        <small>{STRINGS.LEARN.CHAPTER_LABEL}</small>
      </div>

      <div className="min-w-0">
        <h2 className="text-[1.375rem] font-bold leading-tight tracking-[-0.01em] text-taupe">
          {chapter.title}
        </h2>
        {chapter.description ? (
          <p className="mt-1.5 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
            {chapter.description}
          </p>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <div className="progress-track flex-1 max-w-sm">
            <div
              className="progress-fill"
              data-complete={complete ? "true" : "false"}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="font-mono text-xs tabular-nums text-taupe/70">
            {chapter.completed_exercises}
            <span className="text-taupe/35"> / </span>
            {chapter.total_exercises}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 text-right">
        <span
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-dusk/80"
          aria-hidden={!href}
        >
          {ctaLabel}
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-dusk/25 bg-white/60 text-dusk transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:bg-dusk group-hover:text-white">
          <Arrow />
        </span>
      </div>
    </>
  );

  if (!href || !chapter.hasLessons) {
    return (
      <div
        className="chapter-row stagger-in opacity-70 cursor-not-allowed"
        style={{ animationDelay: `${index * 80}ms` }}
        aria-disabled="true"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="chapter-row stagger-in group block no-underline"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {content}
    </Link>
  );
}

function Arrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 8h9m-3.5-3.5L12.5 8 9 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChaptersSkeleton() {
  return (
    <div aria-live="polite" aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">{STRINGS.LEARN.LOADING}</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="chapter-row stagger-in pointer-events-none opacity-75"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="chapter-ord text-light-mauve/40">
            {ordinal(i + 1)}
            <small className="invisible">{STRINGS.LEARN.CHAPTER_LABEL}</small>
          </div>
          <div className="min-w-0">
            <div className="h-5 w-48 rounded-md bg-dusk/10" />
            <div className="mt-2 h-3 w-80 max-w-full rounded-md bg-taupe/10" />
            <div className="mt-5 h-1.5 w-full max-w-sm rounded-full bg-taupe/10" />
          </div>
          <div className="h-9 w-9 rounded-full bg-dusk/10" />
        </div>
      ))}
    </div>
  );
}
