"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import {
  ExerciseWorkspace,
  type CorrectSubmissionInfo,
} from "@/components/learn/exercise-workspace";
import { LessonCompleteModal } from "@/components/learn/lesson-complete-modal";
import { LevelUpOverlay } from "@/components/learn/level-up-overlay";
import { XpToast } from "@/components/learn/xp-toast";
import { STRINGS } from "@/lib/constants";
import {
  fetchChapter,
  type ChapterDetail,
  type ExerciseSummary,
} from "@/lib/curriculum";
import type { Badge } from "@/lib/gamification";

interface QuizPageProps {
  params: Promise<{ chapterId: string; exerciseId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const { chapterId, exerciseId } = use(params);
  const router = useRouter();

  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    id: number;
    xp: number;
    firstAttempt: boolean;
    streakBonus: boolean;
  } | null>(null);
  const [levelUp, setLevelUp] = useState<{
    id: number;
    level: number;
    title: string;
  } | null>(null);
  const [completion, setCompletion] = useState<{
    xp: number;
    badges: Badge[];
  } | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchChapter(chapterId);
        if (!active) return;
        setChapter(data);
      } catch {
        if (!active) return;
        setError(STRINGS.QUIZ_PAGE.LOAD_ERROR);
      }
    })();
    return () => {
      active = false;
    };
  }, [chapterId]);

  const exerciseIdNum = useMemo(() => Number(exerciseId), [exerciseId]);

  const quiz: ExerciseSummary | undefined = useMemo(() => {
    if (!chapter) return undefined;
    return chapter.chapter_quizzes.find((q) => q.id === exerciseIdNum);
  }, [chapter, exerciseIdNum]);

  const allLessonsDone = useMemo(() => {
    if (!chapter) return false;
    return (
      chapter.lessons.length > 0 &&
      chapter.lessons.every((l) => l.is_completed)
    );
  }, [chapter]);

  const handleStatusChange = useCallback(() => {
    // Single-exercise page — nothing to update in a sibling list.
  }, []);

  const handleCorrect = useCallback((info: CorrectSubmissionInfo) => {
    const gam = info.gamification;
    const xp = gam?.xp_earned ?? 0;
    const firstAttempt = Boolean(
      gam?.xp_breakdown.some((line) => line.label.includes("first attempt")),
    );
    const streakBonus = Boolean(
      gam?.xp_breakdown.some((line) => line.label.includes("streak")),
    );

    if (xp > 0) {
      setToast({
        id: Date.now(),
        xp,
        firstAttempt,
        streakBonus,
      });
    }

    if (gam?.level_up) {
      window.setTimeout(() => {
        setLevelUp({
          id: Date.now(),
          level: gam.level,
          title: gam.level_title,
        });
      }, 600);
    }
  }, []);

  // The workspace fires this on every correct submission. For the quiz page
  // the "lesson" is the quiz itself, so any correct submission is also a
  // chapter-mastery moment.
  const handleQuizComplete = useCallback((info: CorrectSubmissionInfo) => {
    setCompletion({
      xp: info.gamification?.xp_earned ?? 0,
      badges: info.gamification?.badges_earned ?? [],
    });
    window.setTimeout(
      () => setShowComplete(true),
      info.gamification?.level_up ? 1400 : 900,
    );
  }, []);

  const handleBackToChapter = useCallback(() => {
    router.push(`/learn/${chapterId}`);
  }, [router, chapterId]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Link
            href={`/learn/${chapterId}`}
            className="mt-4 inline-block text-sm font-medium text-dusk underline underline-offset-4"
          >
            {STRINGS.QUIZ_PAGE.BACK}
          </Link>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return <QuizSkeleton />;
  }

  // The quiz might exist on the backend but not yet be unlocked for this
  // user — render a friendly locked state instead of the workspace so they
  // don't see exercise content they aren't supposed to attempt.
  if (!quiz || quiz.is_locked || !allLessonsDone) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <Link
          href={`/learn/${chapterId}`}
          className="chapter-overview__back animate-fade-up"
        >
          <span aria-hidden="true">←</span>
          {STRINGS.QUIZ_PAGE.BACK}
        </Link>
        <div className="mt-8 rounded-2xl border border-border/70 bg-card/80 p-8 text-center">
          <h1 className="text-2xl font-bold text-taupe">
            {STRINGS.QUIZ_PAGE.LOCKED_HEADING}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {STRINGS.QUIZ_PAGE.LOCKED_BODY(chapter.title)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[88rem] px-6 pb-20 pt-8 lg:px-10 lg:pt-10">
      <Link
        href={`/learn/${chapterId}`}
        className="chapter-overview__back animate-fade-up"
      >
        <span aria-hidden="true">←</span>
        {STRINGS.QUIZ_PAGE.BACK}
      </Link>

      <header className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div className="min-w-0">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-dusk/70">
            {STRINGS.LEARN.CHAPTER_LABEL} {String(chapter.order).padStart(2, "0")} ·{" "}
            {STRINGS.QUIZ_PAGE.EYEBROW}
          </p>
          <h1 className="mt-2 text-[1.875rem] font-bold leading-tight tracking-[-0.02em] text-taupe lg:text-[2.125rem]">
            {quiz.title}
          </h1>
        </div>
      </header>

      <div className="mt-7">
        <ExerciseWorkspace
          key={exerciseIdNum}
          exerciseId={exerciseIdNum}
          onStatusChange={handleStatusChange}
          onCorrect={handleCorrect}
          onLessonLikelyComplete={handleQuizComplete}
          lessonExerciseOrder={[exerciseIdNum]}
        />
      </div>

      {toast ? (
        <XpToast
          key={toast.id}
          xp={toast.xp}
          firstAttempt={toast.firstAttempt}
          streakBonus={toast.streakBonus}
          onDone={() => setToast(null)}
        />
      ) : null}

      {levelUp ? (
        <LevelUpOverlay
          key={levelUp.id}
          level={levelUp.level}
          title={levelUp.title}
          onDismiss={() => setLevelUp(null)}
        />
      ) : null}

      {showComplete ? (
        <LessonCompleteModal
          lessonTitle={chapter.title}
          exerciseCount={1}
          xpEarned={completion?.xp ?? null}
          badgesEarned={completion?.badges ?? []}
          variant="quiz"
          onClose={() => setShowComplete(false)}
          // No "next lesson" from a quiz — the modal will fall back to the
          // back-to-chapter button via this prop.
          onNextLesson={null}
          onBackToCurriculum={handleBackToChapter}
        />
      ) : null}
    </div>
  );
}

function QuizSkeleton() {
  return (
    <div
      className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-3 w-32 animate-pulse rounded-md bg-taupe/10" />
      <div className="mt-5 h-9 w-2/3 animate-pulse rounded-md bg-taupe/15" />
      <div className="mt-8 h-[420px] animate-pulse rounded-2xl bg-taupe/5" />
    </div>
  );
}
