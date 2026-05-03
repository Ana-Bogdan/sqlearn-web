"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MentorDrawer } from "@/components/mentor/mentor-drawer";
import { MentorTrigger } from "@/components/mentor/mentor-trigger";
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
import type { GamificationResult } from "@/lib/gamification";
import { useMentorStore } from "@/stores/mentor-store";
import { HintsPanel } from "./hints-panel";
import { ResultsPanel } from "./results-panel";
import { SqlEditor } from "./sql-editor";

export interface CorrectSubmissionInfo {
  exerciseId: number;
  isChapterQuiz: boolean;
  gamification: GamificationResult | null;
}

interface ExerciseWorkspaceProps {
  exerciseId: number;
  // Lets the parent update the sidebar status when the user completes / attempts an exercise.
  onStatusChange: (exerciseId: number, status: ExerciseSummary["user_status"]) => void;
  // Fires when the user completes the last remaining exercise so the lesson
  // page can celebrate and offer a "Next lesson" action.
  onLessonLikelyComplete: (info: CorrectSubmissionInfo) => void;
  // Fires on any successful correct submission so the parent can raise a toast.
  onCorrect: (info: CorrectSubmissionInfo) => void;
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
  const [errorEpoch, setErrorEpoch] = useState(0);
  const onCorrectRef = useRef(onCorrect);
  const onStatusRef = useRef(onStatusChange);
  const onLessonLikelyRef = useRef(onLessonLikelyComplete);

  const setMentorLastError = useMentorStore((s) => s.setLastError);
  const closeMentor = useMentorStore((s) => s.close);
  const openMentor = useMentorStore((s) => s.openForExercise);

  // When the workspace mounts for a new exercise, drop any stale error/drawer
  // state from the previous exercise.
  useEffect(() => {
    closeMentor();
    setMentorLastError(null);
    return () => {
      // Leaving this exercise — close drawer so it doesn't reappear in a
      // half-stale state if the user lands on a sibling exercise.
      closeMentor();
      setMentorLastError(null);
    };
  }, [exerciseId, closeMentor, setMentorLastError]);

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
        setMentorLastError(null);
        const info: CorrectSubmissionInfo = {
          exerciseId: detail.id,
          isChapterQuiz: detail.is_chapter_quiz,
          gamification: outcome.gamification,
        };
        onCorrectRef.current(info);
        onLessonLikelyRef.current(info);
      } else {
        // Track the latest failure so the drawer's "Explain with AI"
        // button knows what to feed the model.
        setMentorLastError({
          sql,
          message: humanFailureSummary(outcome),
        });
        // Bumping epoch makes the trigger's pulse halo replay (it's keyed
        // by this number).
        setErrorEpoch((n) => n + 1);
      }
    } catch {
      setSubmission({ kind: "idle" });
      setSubmitError(STRINGS.EXERCISE.EDITOR.SUBMIT_ERROR);
    }
  }, [detail, setMentorLastError, sql]);

  const handleExplainWithAI = useCallback(() => {
    if (!detail) return;
    const state = submission;
    if (state.kind !== "result") return;
    setMentorLastError({
      sql,
      message: humanFailureSummary(state.outcome),
    });
    openMentor(detail.id, detail.title);
    // Defer one frame so the drawer's effect runs before we trigger the
    // explain action (the drawer reads lastError from the store).
    queueMicrotask(() => {
      void useMentorStore.getState().sendExplainError({
        sql,
        errorMessage: humanFailureSummary(state.outcome),
      });
    });
  }, [detail, submission, sql, setMentorLastError, openMentor]);

  const handleInsertSql = useCallback((generated: string) => {
    setSql(generated);
    setSubmission({ kind: "idle" });
    setSubmitError(null);
  }, []);

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

          <ResultsPanel
            state={submission}
            onExplainWithAI={handleExplainWithAI}
          />
        </section>
      </div>

      <MentorTrigger
        exerciseId={detail.id}
        exerciseTitle={detail.title}
        hasError={
          submission.kind === "result" &&
          submission.outcome.status !== "correct"
        }
        errorEpoch={errorEpoch}
      />
      <MentorDrawer currentSql={sql} onInsertSql={handleInsertSql} />
    </div>
  );
}

function humanFailureSummary(outcome: SubmissionOutcome): string {
  switch (outcome.status) {
    case "syntax_error":
      return `Syntax error from PostgreSQL:\n${outcome.message}`;
    case "execution_error":
      return `PostgreSQL refused to run the query:\n${outcome.message}`;
    case "timeout":
      return `Query timed out: ${outcome.message}`;
    case "forbidden":
      return `Forbidden operation: ${outcome.message}`;
    case "incorrect": {
      const reason = outcome.reason
        ? ` (${outcome.reason.replace(/_/g, " ")})`
        : "";
      return `My result didn't match the expected one${reason}. ${outcome.message}`;
    }
    default:
      return outcome.message;
  }
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
