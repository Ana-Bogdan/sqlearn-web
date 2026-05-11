"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { STRINGS } from "@/lib/constants";
import {
  fetchChapter,
  pickResumeLesson,
  type ChapterDetail,
  type ExerciseSummary,
  type LessonListItem,
} from "@/lib/curriculum";

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function ordinal(n: number): string {
  return String(n).padStart(2, "0");
}

export default function ChapterOverviewPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = use(params);
  const [detail, setDetail] = useState<ChapterDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchChapter(chapterId);
        if (!active) return;
        setDetail(data);
      } catch {
        if (!active) return;
        setError(STRINGS.CHAPTER_OVERVIEW.LOAD_ERROR);
      }
    })();
    return () => {
      active = false;
    };
  }, [chapterId]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Link
            href="/learn"
            className="mt-4 inline-block text-sm font-medium text-dusk underline underline-offset-4"
          >
            {STRINGS.CHAPTER_OVERVIEW.BACK}
          </Link>
        </div>
      </div>
    );
  }

  if (!detail) {
    return <OverviewSkeleton />;
  }

  const lessonsByOrder = [...detail.lessons].sort((a, b) => a.order - b.order);
  const resume = pickResumeLesson(detail.lessons);
  const percent = clampPercent(detail.completion_percent);
  const continueHref = resume ? `/learn/${detail.id}/${resume.id}` : null;
  const allLessonsDone =
    lessonsByOrder.length > 0 && lessonsByOrder.every((l) => l.is_completed);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
      <Link
        href="/learn"
        className="chapter-overview__back animate-fade-up"
      >
        <span aria-hidden="true">←</span>
        {STRINGS.CHAPTER_OVERVIEW.BACK}
      </Link>

      <header className="animate-fade-up mt-6">
        <p className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-dusk/70">
          {STRINGS.LEARN.CHAPTER_LABEL} {ordinal(detail.order)}
        </p>
        <h1 className="mt-2 text-4xl font-bold leading-tight tracking-[-0.025em] text-taupe lg:text-[2.75rem]">
          {detail.title}
        </h1>
        {detail.description ? (
          <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed text-muted-foreground">
            {detail.description}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="progress-track w-64 max-w-full">
            <div
              className="progress-fill"
              data-complete={percent >= 100 ? "true" : "false"}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="font-mono text-xs tabular-nums text-taupe/65">
            {STRINGS.CHAPTER_OVERVIEW.OVERALL_PROGRESS(
              detail.completed_exercises,
              detail.total_exercises,
            )}
          </p>
          {continueHref ? (
            <Link
              href={continueHref}
              className="chapter-overview__continue ml-auto"
            >
              {STRINGS.CHAPTER_OVERVIEW.CONTINUE}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </header>

      <section className="mt-10">
        <h2 className="chapter-overview__section-label">
          {STRINGS.CHAPTER_OVERVIEW.LESSONS_HEADING}
        </h2>
        <ul className="mt-4 flex flex-col gap-3">
          {lessonsByOrder.map((lesson, idx) => (
            <li
              key={lesson.id}
              className="stagger-in"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <LessonRow chapterId={detail.id} lesson={lesson} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="chapter-overview__section-label">
          {STRINGS.CHAPTER_OVERVIEW.QUIZ_HEADING}
        </h2>
        <div
          className="mt-4 stagger-in"
          style={{ animationDelay: `${lessonsByOrder.length * 60}ms` }}
        >
          {detail.chapter_quizzes.length === 0 ? (
            <div className="chapter-overview__quiz chapter-overview__quiz--empty">
              <p>{STRINGS.CHAPTER_OVERVIEW.QUIZ_NONE}</p>
            </div>
          ) : (
            detail.chapter_quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                chapterId={detail.id}
                quiz={quiz}
                allLessonsDone={allLessonsDone}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function LessonRow({
  chapterId,
  lesson,
}: {
  chapterId: number;
  lesson: LessonListItem;
}) {
  const href = `/learn/${chapterId}/${lesson.id}`;
  const status = lesson.is_completed
    ? "done"
    : lesson.completed_exercises > 0
      ? "in_progress"
      : "not_started";
  const statusLabel =
    status === "done"
      ? STRINGS.CHAPTER_OVERVIEW.LESSON_DONE
      : status === "in_progress"
        ? STRINGS.CHAPTER_OVERVIEW.LESSON_RESUME
        : STRINGS.CHAPTER_OVERVIEW.LESSON_START;

  const inner = (
    <>
      <span className="chapter-ord chapter-ord--sm">
        {ordinal(lesson.order)}
        <small>L</small>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[1.0625rem] font-bold leading-tight tracking-[-0.005em] text-taupe">
          {lesson.title}
        </p>
        <p className="mt-1 font-mono text-[0.75rem] tabular-nums text-taupe/55">
          {STRINGS.CHAPTER_OVERVIEW.LESSON_COUNTER(
            lesson.completed_exercises,
            lesson.total_exercises,
          )}
        </p>
      </div>
      <span
        className="chapter-overview__lesson-status"
        data-status={status}
        data-locked={lesson.is_locked ? "true" : "false"}
      >
        {lesson.is_locked
          ? STRINGS.CHAPTER_OVERVIEW.LESSON_LOCKED
          : statusLabel}
      </span>
    </>
  );

  if (lesson.is_locked) {
    return (
      <div className="chapter-overview__lesson chapter-overview__lesson--locked">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="chapter-overview__lesson group block no-underline"
    >
      {inner}
    </Link>
  );
}

function QuizCard({
  chapterId,
  quiz,
  allLessonsDone,
}: {
  chapterId: number;
  quiz: ExerciseSummary;
  allLessonsDone: boolean;
}) {
  const locked = quiz.is_locked || !allLessonsDone;
  const completed = quiz.user_status === "completed";
  const href = `/learn/${chapterId}/quiz/${quiz.id}`;
  const ctaLabel = completed
    ? STRINGS.CHAPTER_OVERVIEW.QUIZ_RETAKE
    : STRINGS.CHAPTER_OVERVIEW.QUIZ_TAKE;
  const note = locked
    ? STRINGS.CHAPTER_OVERVIEW.QUIZ_LOCKED_NOTE
    : STRINGS.CHAPTER_OVERVIEW.QUIZ_UNLOCKED_NOTE;

  const inner = (
    <>
      <span className="chapter-overview__quiz-mark" aria-hidden="true">
        QZ
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[1.125rem] font-bold leading-tight tracking-[-0.005em] text-taupe">
          {quiz.title}
        </p>
        <p className="mt-1 text-[0.875rem] leading-relaxed text-taupe/65">
          {note}
        </p>
        <span className="chapter-overview__quiz-meta">
          <span className="difficulty-chip" data-level={quiz.difficulty}>
            {STRINGS.LESSON.DIFFICULTY[quiz.difficulty]}
          </span>
          {completed ? (
            <span className="chapter-overview__quiz-badge">
              {STRINGS.LEARN.STATUS.completed}
            </span>
          ) : null}
        </span>
      </div>
      <span
        className="chapter-overview__quiz-cta"
        data-locked={locked ? "true" : "false"}
      >
        {locked ? STRINGS.CHAPTER_OVERVIEW.QUIZ_LOCKED_TAG : ctaLabel}
        {locked ? null : <span aria-hidden="true">→</span>}
      </span>
    </>
  );

  if (locked) {
    return (
      <div
        className="chapter-overview__quiz chapter-overview__quiz--locked"
        aria-disabled="true"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="chapter-overview__quiz chapter-overview__quiz--ready group block no-underline"
    >
      {inner}
    </Link>
  );
}

function OverviewSkeleton() {
  return (
    <div
      className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-3 w-24 animate-pulse rounded-md bg-taupe/10" />
      <div className="mt-5 h-9 w-3/5 animate-pulse rounded-md bg-taupe/15" />
      <div className="mt-3 h-4 w-2/3 animate-pulse rounded-md bg-taupe/10" />
      <div className="mt-6 h-2 w-64 animate-pulse rounded-full bg-taupe/10" />
      <div className="mt-10 flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[88px] animate-pulse rounded-2xl bg-taupe/5"
          />
        ))}
      </div>
    </div>
  );
}
