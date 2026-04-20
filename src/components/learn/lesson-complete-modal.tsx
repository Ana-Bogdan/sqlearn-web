"use client";

import { useEffect, useRef } from "react";
import { BadgeIcon } from "@/components/badge-icon";
import { STRINGS } from "@/lib/constants";
import type { Badge } from "@/lib/gamification";

interface LessonCompleteModalProps {
  lessonTitle: string;
  exerciseCount: number;
  xpEarned?: number | null;
  badgesEarned?: Badge[];
  variant?: "lesson" | "quiz";
  onClose: () => void;
  onNextLesson: (() => void) | null;
  onBackToCurriculum: () => void;
}

export function LessonCompleteModal({
  lessonTitle,
  exerciseCount,
  xpEarned,
  badgesEarned,
  variant = "lesson",
  onClose,
  onNextLesson,
  onBackToCurriculum,
}: LessonCompleteModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    const t = window.setTimeout(() => {
      const primary = dialogRef.current?.querySelector<HTMLButtonElement>(
        "button[data-primary='true']",
      );
      primary?.focus();
    }, 50);
    return () => {
      window.removeEventListener("keydown", handler);
      window.clearTimeout(t);
    };
  }, [onClose]);

  const isQuiz = variant === "quiz";
  const eyebrow = isQuiz
    ? STRINGS.LESSON_COMPLETE.QUIZ_EYEBROW
    : STRINGS.EXERCISE.COMPLETE.EYEBROW;
  const heading = isQuiz
    ? STRINGS.LESSON_COMPLETE.QUIZ_HEADING
    : STRINGS.EXERCISE.COMPLETE.HEADING;
  const body = isQuiz
    ? STRINGS.LESSON_COMPLETE.QUIZ_BODY(lessonTitle)
    : STRINGS.EXERCISE.COMPLETE.BODY(lessonTitle, exerciseCount);

  return (
    <div
      className="lesson-complete-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`lesson-complete-dialog ${isQuiz ? "lesson-complete-dialog--quiz" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-complete-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <Confetti />
        <p className="lesson-complete-dialog__eyebrow">{eyebrow}</p>
        <h2
          id="lesson-complete-heading"
          className="lesson-complete-dialog__heading"
        >
          {heading}
        </h2>
        <p className="lesson-complete-dialog__body">{body}</p>

        {typeof xpEarned === "number" && xpEarned > 0 ? (
          <div className="lesson-complete-dialog__xp">
            <span className="lesson-complete-dialog__xp-amount">
              +{xpEarned}
            </span>
            <span className="lesson-complete-dialog__xp-label">
              {STRINGS.LESSON_COMPLETE.XP_EARNED}
            </span>
          </div>
        ) : null}

        {badgesEarned && badgesEarned.length > 0 ? (
          <div className="lesson-complete-dialog__badges">
            <p className="lesson-complete-dialog__badges-label">
              {STRINGS.LESSON_COMPLETE.BADGES_EARNED_LABEL}
            </p>
            <div className="lesson-complete-dialog__badges-list">
              {badgesEarned.map((badge, idx) => (
                <span
                  key={badge.id}
                  className="lesson-complete-dialog__badge"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <span
                    className="lesson-complete-dialog__badge-icon"
                    aria-hidden="true"
                  >
                    <BadgeIcon name={badge.icon} size={16} />
                  </span>
                  {badge.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="lesson-complete-dialog__actions">
          {onNextLesson ? (
            <button
              type="button"
              onClick={onNextLesson}
              data-primary="true"
              className="lesson-complete-dialog__primary"
            >
              {STRINGS.EXERCISE.COMPLETE.NEXT_LESSON}
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onBackToCurriculum}
              data-primary="true"
              className="lesson-complete-dialog__primary"
            >
              {STRINGS.EXERCISE.COMPLETE.BACK_TO_CURRICULUM}
              <span aria-hidden="true">→</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="lesson-complete-dialog__secondary"
          >
            {STRINGS.EXERCISE.COMPLETE.STAY_HERE}
          </button>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = [
    { cls: "float-a", x: 12, y: 14, fill: "#B999A4", w: 10, h: 4, r: -14 },
    { cls: "float-b", x: 86, y: 18, fill: "#3E5570", w: 8, h: 4, r: 22 },
    { cls: "float-c", x: 26, y: 40, fill: "#EFC99E", w: 12, h: 4, r: 8 },
    { cls: "float-drift", x: 74, y: 46, fill: "#B999A4", w: 6, h: 6, r: 0 },
    { cls: "float-a", x: 54, y: 12, fill: "#463C33", w: 4, h: 10, r: 0 },
    { cls: "float-b", x: 40, y: 68, fill: "#3E5570", w: 10, h: 4, r: -18 },
    { cls: "float-c", x: 64, y: 72, fill: "#B999A4", w: 4, h: 4, r: 0 },
  ];
  return (
    <svg
      className="lesson-complete-confetti"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {pieces.map((p, i) => (
        <rect
          key={i}
          x={p.x}
          y={p.y}
          width={p.w}
          height={p.h}
          rx="1.5"
          fill={p.fill}
          transform={`rotate(${p.r} ${p.x + p.w / 2} ${p.y + p.h / 2})`}
          className={p.cls}
          opacity="0.7"
        />
      ))}
    </svg>
  );
}
