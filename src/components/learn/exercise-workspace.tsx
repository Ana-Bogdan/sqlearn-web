"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STRINGS } from "@/lib/constants";
import type { ExerciseSummary } from "@/lib/curriculum";
import {
  fetchExercise,
  fetchExerciseHints,
  submitExerciseQuery,
  type ExerciseDetail,
  type ExerciseHint,
  type SubmissionOutcome,
} from "@/lib/exercises";
import { HintsPanel } from "./hints-panel";
import { ResultsPanel } from "./results-panel";
import { SqlEditor } from "./sql-editor";

const PLACEHOLDER_XP_BY_DIFFICULTY: Record<
  ExerciseSummary["difficulty"],
  number
> = {
  easy: 20,
  medium: 40,
  hard: 60,
};

interface ExerciseWorkspaceProps {
  exerciseId: number;
  // Lets the parent update the sidebar status when the user completes / attempts an exercise.
  onStatusChange: (exerciseId: number, status: ExerciseSummary["user_status"]) => void;
  // Fires when the user completes the last remaining exercise so the lesson
  // page can celebrate and offer a "Next lesson" action.
  onLessonLikelyComplete: (exerciseId: number) => void;
  // Fires on any successful correct submission so the parent can raise a toast.
  onCorrect: (info: { xp: number; firstAttempt: boolean }) => void;
  // Used to adapt the "next exercise" CTA when completing mid-lesson.
  lessonExerciseOrder: number[];
}

export function ExerciseWorkspace({
  exerciseId,
  onStatusChange,
  onLessonLikelyComplete,
  onCorrect,
  lessonExerciseOrder,
}: ExerciseWorkspaceProps) {
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sql, setSql] = useState<string>("");
  const [hints, setHints] = useState<ExerciseHint[]>([]);
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [submission, setSubmission] = useState<
    | { kind: "idle" }
    | { kind: "running" }
    | { kind: "result"; outcome: SubmissionOutcome }
  >({ kind: "idle" });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const onCorrectRef = useRef(onCorrect);
  const onStatusRef = useRef(onStatusChange);
  const onLessonLikelyRef = useRef(onLessonLikelyComplete);

  useEffect(() => {
    onCorrectRef.current = onCorrect;
  }, [onCorrect]);
  useEffect(() => {
    onStatusRef.current = onStatusChange;
  }, [onStatusChange]);
  useEffect(() => {
    onLessonLikelyRef.current = onLessonLikelyComplete;
  }, [onLessonLikelyComplete]);

  // Parent keys this component by exerciseId, so each id gets a fresh instance.
  // The effect only runs once, fetching the exercise + hints in parallel.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [ex, hintsData] = await Promise.all([
          fetchExercise(exerciseId),
          fetchExerciseHints(exerciseId).catch(() => []),
        ]);
        if (!active) return;
        setDetail(ex);
        setHints(hintsData);
        setSql(ex.starter_code ?? "");
      } catch {
        if (!active) return;
        setLoadError(STRINGS.EXERCISE.LOAD_ERROR);
      }
    })();

    return () => {
      active = false;
    };
  }, [exerciseId]);

  const handleRun = useCallback(async () => {
    if (!detail) return;
    if (!sql.trim()) {
      setSubmitError(STRINGS.EXERCISE.EDITOR.EMPTY_SQL);
      return;
    }
    setSubmitError(null);
    setSubmission({ kind: "running" });

    try {
      const outcome = await submitExerciseQuery(detail.id, sql);
      setSubmission({ kind: "result", outcome });
      onStatusRef.current(detail.id, outcome.user_status);

      if (outcome.status === "correct") {
        const xp = PLACEHOLDER_XP_BY_DIFFICULTY[detail.difficulty] ?? 20;
        onCorrectRef.current({
          xp,
          firstAttempt: outcome.was_first_attempt,
        });
        onLessonLikelyRef.current(detail.id);
      }
    } catch {
      setSubmission({ kind: "idle" });
      setSubmitError(STRINGS.EXERCISE.EDITOR.SUBMIT_ERROR);
    }
  }, [detail, sql]);

  const handleReset = useCallback(() => {
    if (!detail) return;
    setSql(detail.starter_code ?? "");
    setSubmission({ kind: "idle" });
    setSubmitError(null);
  }, [detail]);

  const instructions = useMemo(() => detail?.instructions ?? "", [detail]);
  const positionLabel = useMemo(() => {
    if (!detail) return null;
    const idx = lessonExerciseOrder.indexOf(detail.id);
    if (idx < 0) return null;
    return `${String(idx + 1).padStart(2, "0")} / ${String(
      lessonExerciseOrder.length,
    ).padStart(2, "0")}`;
  }, [detail, lessonExerciseOrder]);

  if (loadError) {
    return (
      <div className="exercise-workspace-error">
        <p>{loadError}</p>
      </div>
    );
  }

  if (!detail) {
    return <WorkspaceSkeleton />;
  }

  const completed = detail.user_status === "completed";

  return (
    <div className="exercise-workspace animate-fade-up">
      <div className="exercise-workspace__grid">
        <section className="exercise-workspace__brief">
          <header className="exercise-brief__head">
            <div>
              <p className="exercise-brief__eyebrow">
                {detail.is_chapter_quiz
                  ? STRINGS.EXERCISE.BRIEF.QUIZ_EYEBROW
                  : STRINGS.EXERCISE.BRIEF.EXERCISE_EYEBROW}
                {positionLabel ? (
                  <>
                    <span className="exercise-brief__sep" aria-hidden="true">·</span>
                    <span className="exercise-brief__position">{positionLabel}</span>
                  </>
                ) : null}
              </p>
              <h2 className="exercise-brief__title">{detail.title}</h2>
            </div>
            <span className="difficulty-chip" data-level={detail.difficulty}>
              {STRINGS.LESSON.DIFFICULTY[detail.difficulty]}
            </span>
          </header>

          <div className="exercise-brief__status" data-status={detail.user_status}>
            <span className="exercise-brief__status-dot" aria-hidden="true" />
            <span>{STRINGS.LEARN.STATUS[detail.user_status]}</span>
            {completed ? (
              <span className="exercise-brief__status-meta">
                {STRINGS.EXERCISE.BRIEF.ALREADY_SOLVED}
              </span>
            ) : null}
          </div>

          {instructions ? (
            <div
              className="exercise-brief__instructions"
              // Instructions are plain text; preserve line breaks.
            >
              {instructions.split(/\n{2,}/).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          ) : (
            <p className="exercise-brief__empty">
              {STRINGS.EXERCISE.BRIEF.EMPTY_INSTRUCTIONS}
            </p>
          )}

          <HintsPanel
            hints={hints}
            revealed={hintsRevealed}
            onReveal={(next) => setHintsRevealed(next)}
          />
        </section>

        <section className="exercise-workspace__stage">
          <div className="editor-shell">
            <div className="editor-shell__bar">
              <div className="editor-shell__label">
                <span className="editor-shell__dot" data-pos="a" aria-hidden="true" />
                <span className="editor-shell__dot" data-pos="b" aria-hidden="true" />
                <span className="editor-shell__dot" data-pos="c" aria-hidden="true" />
                <span className="editor-shell__path">
                  {STRINGS.EXERCISE.EDITOR.TAB_LABEL}
                </span>
              </div>
              <span className="editor-shell__kbd" aria-hidden="true">
                <kbd>⌘</kbd>
                <kbd>↵</kbd>
                <span className="editor-shell__kbd-note">
                  {STRINGS.EXERCISE.EDITOR.RUN_SHORTCUT_NOTE}
                </span>
              </span>
            </div>
            <div className="editor-shell__body">
              <SqlEditor
                value={sql}
                onChange={setSql}
                onRun={handleRun}
                placeholder={STRINGS.EXERCISE.EDITOR.PLACEHOLDER}
                ariaLabel={`${detail.title} — SQL editor`}
              />
            </div>
            <div className="editor-shell__actions">
              <button
                type="button"
                onClick={handleRun}
                disabled={submission.kind === "running"}
                className="editor-action editor-action--primary"
              >
                {submission.kind === "running"
                  ? STRINGS.EXERCISE.EDITOR.RUN_PENDING
                  : STRINGS.EXERCISE.EDITOR.RUN}
                <span aria-hidden="true" className="editor-action__arrow">→</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={submission.kind === "running"}
                className="editor-action editor-action--secondary"
              >
                {STRINGS.EXERCISE.EDITOR.RESET}
              </button>
            </div>
            {submitError ? (
              <p className="editor-shell__error" role="alert">
                {submitError}
              </p>
            ) : null}
          </div>

          <ResultsPanel state={submission} />
        </section>
      </div>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="exercise-workspace exercise-workspace--loading" aria-busy="true">
      <div className="exercise-workspace__grid">
        <div className="exercise-brief-skeleton">
          <div className="h-3 w-28 rounded-md bg-taupe/10" />
          <div className="mt-4 h-7 w-3/5 rounded-md bg-taupe/15" />
          <div className="mt-6 space-y-2">
            <div className="h-3 w-full rounded-md bg-taupe/8" />
            <div className="h-3 w-11/12 rounded-md bg-taupe/8" />
            <div className="h-3 w-9/12 rounded-md bg-taupe/8" />
          </div>
        </div>
        <div className="editor-skeleton">
          <div className="editor-skeleton__body" />
          <div className="editor-skeleton__bar" />
        </div>
      </div>
    </div>
  );
}
