"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { STRINGS } from "@/lib/constants";
import {
  fetchChapter,
  fetchLesson,
  type ChapterDetail,
  type ExerciseSummary,
  type LessonDetail,
  type LessonListItem,
} from "@/lib/curriculum";
import { renderTheoryMarkdown } from "@/lib/markdown";

interface LessonPageProps {
  params: Promise<{ chapterId: string; lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const { chapterId, lessonId } = use(params);

  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setChapter(null);
    setLesson(null);
    setError(null);

    (async () => {
      try {
        const [chapterData, lessonData] = await Promise.all([
          fetchChapter(chapterId),
          fetchLesson(lessonId),
        ]);
        if (!active) return;
        setChapter(chapterData);
        setLesson(lessonData);
      } catch {
        if (!active) return;
        setError(STRINGS.LESSON.LOAD_ERROR);
      }
    })();

    return () => {
      active = false;
    };
  }, [chapterId, lessonId]);

  const navigation = useMemo(() => {
    if (!chapter || !lesson) return { prev: null, next: null };
    const sorted = [...chapter.lessons].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((l) => l.id === lesson.id);
    return {
      prev: index > 0 ? sorted[index - 1] : null,
      next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null,
    };
  }, [chapter, lesson]);

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Link
            href="/learn"
            className="mt-4 inline-block text-sm font-medium text-dusk underline underline-offset-4"
          >
            {STRINGS.LESSON.BACK}
          </Link>
        </div>
      </div>
    );
  }

  if (!chapter || !lesson) {
    return <LessonSkeleton />;
  }

  const theoryHtml = lesson.theory_content
    ? renderTheoryMarkdown(lesson.theory_content)
    : "";
  const totalExercises = lesson.exercises.length;
  const completedExercises = lesson.exercises.filter(
    (ex) => ex.user_status === "completed",
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-10 lg:pt-14">
      <Breadcrumbs chapter={chapter} lesson={lesson} />

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="animate-fade-up min-w-0">
          <header>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-dusk/70">
              {STRINGS.LEARN.CHAPTER_LABEL} {String(chapter.order).padStart(2, "0")} ·
              Lesson {lesson.order}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.022em] text-taupe lg:text-[2.25rem]">
              {lesson.title}
            </h1>
          </header>

          <div className="mt-8">
            {theoryHtml ? (
              <div
                className="theory-prose"
                dangerouslySetInnerHTML={{ __html: theoryHtml }}
              />
            ) : (
              <p className="italic text-muted-foreground">
                {STRINGS.LESSON.THEORY_EMPTY}
              </p>
            )}
          </div>

          <LessonNav
            chapterId={chapter.id}
            prev={navigation.prev}
            next={navigation.next}
          />
        </article>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <ExerciseSidebar
            exercises={lesson.exercises}
            quizzes={chapter.chapter_quizzes}
            completedExercises={completedExercises}
            totalExercises={totalExercises}
          />
        </aside>
      </div>
    </div>
  );
}

function Breadcrumbs({
  chapter,
  lesson,
}: {
  chapter: ChapterDetail;
  lesson: LessonDetail;
}) {
  return (
    <nav
      className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-muted-foreground"
      aria-label="Breadcrumb"
    >
      <Link
        href="/learn"
        className="font-medium text-dusk transition-colors duration-200 hover:text-dusk/80"
      >
        {STRINGS.LEARN.EYEBROW}
      </Link>
      <Separator />
      <Link
        href={`/learn/${chapter.id}`}
        className="transition-colors duration-200 hover:text-taupe"
      >
        {chapter.title}
      </Link>
      <Separator />
      <span className="text-taupe" aria-current="page">
        {lesson.title}
      </span>
    </nav>
  );
}

function Separator() {
  return (
    <span className="text-taupe/30" aria-hidden="true">
      /
    </span>
  );
}

function ExerciseSidebar({
  exercises,
  quizzes,
  completedExercises,
  totalExercises,
}: {
  exercises: ExerciseSummary[];
  quizzes: ExerciseSummary[];
  completedExercises: number;
  totalExercises: number;
}) {
  return (
    <div
      className="animate-fade-up rounded-2xl border border-border/70 bg-card/85 p-5"
      style={{ animationDelay: "120ms" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-taupe">
          {STRINGS.LESSON.EXERCISES_HEADING}
        </h2>
        <span className="font-mono text-[0.6875rem] tabular-nums text-taupe/60">
          {STRINGS.LESSON.LESSON_PROGRESS(completedExercises, totalExercises)}
        </span>
      </div>

      <div className="mt-4">
        {exercises.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">
            {STRINGS.LESSON.NO_EXERCISES}
          </p>
        ) : (
          <ol className="space-y-1.5">
            {exercises.map((exercise, index) => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                index={index + 1}
              />
            ))}
          </ol>
        )}
      </div>

      {quizzes.length > 0 ? (
        <div className="mt-6 border-t border-border/70 pt-5">
          <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-light-mauve">
            {STRINGS.LESSON.QUIZZES_HEADING}
          </h3>
          <ol className="mt-3 space-y-1.5">
            {quizzes.map((quiz, index) => (
              <ExerciseItem
                key={quiz.id}
                exercise={quiz}
                index={index + 1}
                quiz
              />
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

function ExerciseItem({
  exercise,
  index,
  quiz = false,
}: {
  exercise: ExerciseSummary;
  index: number;
  quiz?: boolean;
}) {
  return (
    <li
      className="group/item flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-200 hover:bg-muted/60"
      data-status={exercise.user_status}
    >
      <span className="lesson-dot" data-status={exercise.user_status} />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="font-mono text-[0.6875rem] tabular-nums text-taupe/45">
          {String(index).padStart(2, "0")}
        </span>
        <span className="min-w-0 truncate text-[0.875rem] font-medium text-taupe">
          {exercise.title}
        </span>
      </span>
      {quiz ? (
        <span className="difficulty-chip" data-level="medium">
          {STRINGS.LESSON.CHAPTER_QUIZ_BADGE}
        </span>
      ) : (
        <span className="difficulty-chip" data-level={exercise.difficulty}>
          {STRINGS.LESSON.DIFFICULTY[exercise.difficulty]}
        </span>
      )}
    </li>
  );
}

function LessonNav({
  chapterId,
  prev,
  next,
}: {
  chapterId: number;
  prev: LessonListItem | null;
  next: LessonListItem | null;
}) {
  if (!prev && !next) return null;

  return (
    <nav
      className="mt-14 grid gap-3 border-t border-border/70 pt-6 sm:grid-cols-2"
      aria-label="Lesson navigation"
    >
      {prev ? (
        <Link
          href={`/learn/${chapterId}/${prev.id}`}
          className="group/nav flex flex-col rounded-xl border border-transparent px-4 py-3 transition-all duration-300 ease-out hover:border-border/70 hover:bg-card/70"
        >
          <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-transform duration-300 group-hover/nav:-translate-x-0.5">
            <ArrowLeft /> {STRINGS.LESSON.PREV_LESSON}
          </span>
          <span className="mt-1 truncate text-[0.9375rem] font-semibold text-taupe">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/learn/${chapterId}/${next.id}`}
          className="group/nav flex flex-col rounded-xl border border-transparent px-4 py-3 text-right transition-all duration-300 ease-out hover:border-border/70 hover:bg-card/70 sm:col-start-2"
        >
          <span className="ml-auto inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-dusk transition-transform duration-300 group-hover/nav:translate-x-0.5">
            {STRINGS.LESSON.NEXT_LESSON} <ArrowRight />
          </span>
          <span className="mt-1 truncate text-[0.9375rem] font-semibold text-taupe">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

function ArrowRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8h10m-3.5-3.5L13 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M13 8H3m3.5-3.5L3 8l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LessonSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-10 lg:pt-14"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{STRINGS.LESSON.LOADING}</span>
      <div className="h-3 w-48 rounded-md bg-dusk/10" />
      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="h-3 w-32 rounded-md bg-dusk/10" />
          <div className="h-9 w-3/4 rounded-md bg-taupe/15" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-full rounded-md bg-taupe/8" />
            <div className="h-3 w-11/12 rounded-md bg-taupe/8" />
            <div className="h-3 w-10/12 rounded-md bg-taupe/8" />
          </div>
          <div className="mt-6 h-28 rounded-xl bg-dusk/10" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-full rounded-md bg-taupe/8" />
            <div className="h-3 w-11/12 rounded-md bg-taupe/8" />
          </div>
        </div>
        <div className="h-72 rounded-2xl border border-border/70 bg-card/60" />
      </div>
    </div>
  );
}
