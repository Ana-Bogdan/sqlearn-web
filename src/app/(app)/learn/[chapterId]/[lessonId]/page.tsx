"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { ExerciseWorkspace } from "@/components/learn/exercise-workspace";
import { LessonCompleteModal } from "@/components/learn/lesson-complete-modal";
import { XpToast } from "@/components/learn/xp-toast";
import { STRINGS } from "@/lib/constants";
import {
  fetchChapter,
  fetchLesson,
  type ChapterDetail,
  type ExerciseSummary,
  type ExerciseStatus,
  type LessonDetail,
  type LessonListItem,
} from "@/lib/curriculum";
import { renderTheoryMarkdown } from "@/lib/markdown";

type TabKey = "theory" | `ex-${number}`;

interface LessonPageProps {
  params: Promise<{ chapterId: string; lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const { chapterId, lessonId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEx = searchParams.get("ex");

  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Local copy of exercises so we can reflect status changes instantly after
  // submissions without refetching the whole lesson.
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (initialEx && /^\d+$/.test(initialEx)) return `ex-${Number(initialEx)}`;
    return "theory";
  });

  const [toast, setToast] = useState<{
    id: number;
    xp: number;
    firstAttempt: boolean;
  } | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    let active = true;
    setChapter(null);
    setLesson(null);
    setError(null);
    setShowComplete(false);

    (async () => {
      try {
        const [chapterData, lessonData] = await Promise.all([
          fetchChapter(chapterId),
          fetchLesson(lessonId),
        ]);
        if (!active) return;
        setChapter(chapterData);
        setLesson(lessonData);
        setExercises(lessonData.exercises);
      } catch {
        if (!active) return;
        setError(STRINGS.LESSON.LOAD_ERROR);
      }
    })();

    return () => {
      active = false;
    };
  }, [chapterId, lessonId]);

  // Sync tab state → URL query so the view is shareable.
  useEffect(() => {
    if (!lesson) return;
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    if (activeTab === "theory") {
      sp.delete("ex");
    } else {
      const exId = Number(activeTab.slice(3));
      sp.set("ex", String(exId));
    }
    const query = sp.toString();
    const nextUrl = query
      ? `/learn/${chapterId}/${lessonId}?${query}`
      : `/learn/${chapterId}/${lessonId}`;
    router.replace(nextUrl, { scroll: false });
    // Only react to active tab changes — don't loop off searchParams edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, chapterId, lessonId, lesson]);

  // If user lands with ?ex=123 but that id isn't in this lesson, fall back to theory.
  useEffect(() => {
    if (!lesson) return;
    if (activeTab === "theory") return;
    const exId = Number(activeTab.slice(3));
    const exists = exercises.some((e) => e.id === exId);
    if (!exists) setActiveTab("theory");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, lesson]);

  const navigation = useMemo(() => {
    if (!chapter || !lesson) return { prev: null, next: null };
    const sorted = [...chapter.lessons].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((l) => l.id === lesson.id);
    return {
      prev: index > 0 ? sorted[index - 1] : null,
      next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null,
    };
  }, [chapter, lesson]);

  const handleStatusChange = useCallback(
    (exerciseId: number, status: ExerciseStatus) => {
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId ? { ...ex, user_status: status } : ex,
        ),
      );
    },
    [],
  );

  const handleCorrect = useCallback(
    (info: { xp: number; firstAttempt: boolean }) => {
      setToast({
        id: Date.now(),
        xp: info.xp,
        firstAttempt: info.firstAttempt,
      });
    },
    [],
  );

  const handleLessonLikelyComplete = useCallback(() => {
    // Defer one microtask so the exercise list status update from
    // `handleStatusChange` is already in state before we decide.
    queueMicrotask(() => {
      setExercises((prev) => {
        const allDone =
          prev.length > 0 &&
          prev.every((ex) => ex.user_status === "completed");
        if (allDone) {
          // Slight delay so the XP toast has a moment to appear first.
          window.setTimeout(() => setShowComplete(true), 900);
        }
        return prev;
      });
    });
  }, []);

  const handleGoToNextLesson = useCallback(() => {
    if (!navigation.next) return;
    router.push(`/learn/${chapterId}/${navigation.next.id}`);
  }, [navigation.next, chapterId, router]);

  const handleBackToCurriculum = useCallback(() => {
    router.push("/learn");
  }, [router]);

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
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(
    (ex) => ex.user_status === "completed",
  ).length;
  const lessonExerciseOrder = exercises.map((ex) => ex.id);

  const activeExerciseId =
    activeTab === "theory" ? null : Number(activeTab.slice(3));

  return (
    <div className="mx-auto w-full max-w-[88rem] px-6 pb-20 pt-8 lg:px-10 lg:pt-10">
      <Breadcrumbs chapter={chapter} lesson={lesson} />

      <header className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div className="min-w-0">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-dusk/70">
            {STRINGS.LEARN.CHAPTER_LABEL} {String(chapter.order).padStart(2, "0")} ·
            Lesson {lesson.order}
          </p>
          <h1 className="mt-2 text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-taupe lg:text-[2.125rem]">
            {lesson.title}
          </h1>
        </div>
        <p className="font-mono text-[0.75rem] tabular-nums text-taupe/60">
          {STRINGS.LESSON.LESSON_PROGRESS(completedExercises, totalExercises)}
        </p>
      </header>

      <LessonTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        exercises={exercises}
      />

      <div className="mt-7">
        {activeTab === "theory" ? (
          <TheoryView
            theoryHtml={theoryHtml}
            exercises={exercises}
            onPickExercise={(id) => setActiveTab(`ex-${id}`)}
          />
        ) : activeExerciseId ? (
          <ExerciseWorkspace
            key={activeExerciseId}
            exerciseId={activeExerciseId}
            onStatusChange={handleStatusChange}
            onCorrect={handleCorrect}
            onLessonLikelyComplete={handleLessonLikelyComplete}
            lessonExerciseOrder={lessonExerciseOrder}
          />
        ) : null}
      </div>

      <LessonNav
        chapterId={chapter.id}
        prev={navigation.prev}
        next={navigation.next}
      />

      {toast ? (
        <XpToast
          key={toast.id}
          xp={toast.xp}
          firstAttempt={toast.firstAttempt}
          onDone={() => setToast(null)}
        />
      ) : null}

      {showComplete ? (
        <LessonCompleteModal
          lessonTitle={lesson.title}
          exerciseCount={totalExercises}
          onClose={() => setShowComplete(false)}
          onNextLesson={navigation.next ? handleGoToNextLesson : null}
          onBackToCurriculum={handleBackToCurriculum}
        />
      ) : null}
    </div>
  );
}

function LessonTabs({
  activeTab,
  onTabChange,
  exercises,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  exercises: ExerciseSummary[];
}) {
  return (
    <nav className="lesson-tabs" aria-label="Lesson sections">
      <button
        type="button"
        className="lesson-tab"
        data-active={activeTab === "theory" ? "true" : "false"}
        onClick={() => onTabChange("theory")}
      >
        <span className="lesson-tab__icon" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="12" height="12">
            <path
              d="M3 3h10v10H3z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M5.5 6h5M5.5 8h5M5.5 10h3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span>{STRINGS.EXERCISE.TABS.THEORY}</span>
      </button>

      <span className="lesson-tabs__divider" aria-hidden="true" />

      <div className="lesson-tabs__exercises" role="tablist">
        {exercises.map((exercise, idx) => {
          const key: TabKey = `ex-${exercise.id}`;
          return (
            <button
              key={exercise.id}
              type="button"
              role="tab"
              className="lesson-tab lesson-tab--exercise"
              data-active={activeTab === key ? "true" : "false"}
              data-status={exercise.user_status}
              aria-selected={activeTab === key}
              onClick={() => onTabChange(key)}
              title={exercise.title}
            >
              <span className="lesson-tab__ord">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="lesson-tab__name">{exercise.title}</span>
              <span
                className="lesson-tab__dot"
                data-status={exercise.user_status}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function TheoryView({
  theoryHtml,
  exercises,
  onPickExercise,
}: {
  theoryHtml: string;
  exercises: ExerciseSummary[];
  onPickExercise: (id: number) => void;
}) {
  const firstIncomplete = exercises.find(
    (ex) => ex.user_status !== "completed",
  );
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_360px]">
      <article className="animate-fade-up min-w-0">
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

        {firstIncomplete ? (
          <button
            type="button"
            onClick={() => onPickExercise(firstIncomplete.id)}
            className="theory-cta"
          >
            <span className="theory-cta__label">
              {exercises.some((ex) => ex.user_status === "completed")
                ? "Continue with"
                : "Start with"}
            </span>
            <span className="theory-cta__title">{firstIncomplete.title}</span>
            <span className="theory-cta__arrow" aria-hidden="true">
              →
            </span>
          </button>
        ) : exercises.length > 0 ? (
          <div className="theory-completed">
            <span className="theory-completed__badge" aria-hidden="true">
              ✓
            </span>
            <p>You&apos;ve completed every exercise in this lesson.</p>
          </div>
        ) : null}
      </article>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <ExerciseSidebar
          exercises={exercises}
          onPick={onPickExercise}
        />
      </aside>
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
  onPick,
}: {
  exercises: ExerciseSummary[];
  onPick: (id: number) => void;
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
      </div>

      <div className="mt-4">
        {exercises.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">
            {STRINGS.LESSON.NO_EXERCISES}
          </p>
        ) : (
          <ol className="space-y-1">
            {exercises.map((exercise, index) => (
              <li key={exercise.id}>
                <button
                  type="button"
                  onClick={() => onPick(exercise.id)}
                  className="group/item flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-200 hover:bg-muted/60"
                  data-status={exercise.user_status}
                >
                  <span
                    className="lesson-dot"
                    data-status={exercise.user_status}
                  />
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="font-mono text-[0.6875rem] tabular-nums text-taupe/45">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 truncate text-[0.875rem] font-medium text-taupe">
                      {exercise.title}
                    </span>
                  </span>
                  <span
                    className="difficulty-chip"
                    data-level={exercise.difficulty}
                  >
                    {STRINGS.LESSON.DIFFICULTY[exercise.difficulty]}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
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
      className="mx-auto max-w-[88rem] px-6 pb-20 pt-10 lg:px-10 lg:pt-14"
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
