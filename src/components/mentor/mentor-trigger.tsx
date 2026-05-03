"use client";

import { STRINGS } from "@/lib/constants";
import { useMentorStore } from "@/stores/mentor-store";

interface MentorTriggerProps {
  exerciseId: number;
  exerciseTitle?: string;
  hasError?: boolean;
  // A monotonically increasing key that changes whenever a *new* error event
  // fires. The pulse halo uses this as its React key so the CSS animation
  // replays each time, without us needing transient state inside this
  // component.
  errorEpoch?: number;
}

export function MentorTrigger({
  exerciseId,
  exerciseTitle,
  hasError,
  errorEpoch,
}: MentorTriggerProps) {
  const isOpen = useMentorStore((s) => s.isOpen);
  const openForExercise = useMentorStore((s) => s.openForExercise);
  const hintsUsed = useMentorStore((s) => s.hintsUsed);
  const context = useMentorStore((s) => s.context);

  const isCurrentExercise =
    context?.kind === "exercise" && context.exerciseId === exerciseId;
  const usedHints = isCurrentExercise ? hintsUsed : 0;

  return (
    <button
      type="button"
      onClick={() => openForExercise(exerciseId, exerciseTitle)}
      aria-label={STRINGS.MENTOR.OPEN_FAB}
      className="mentor-trigger"
      data-active={isOpen ? "true" : undefined}
      data-has-error={hasError ? "true" : undefined}
    >
      {/* Replays its own short pulse animation each time errorEpoch changes */}
      {hasError && !isOpen && errorEpoch != null ? (
        <span
          key={`pulse-${errorEpoch}`}
          className="mentor-trigger__pulse"
          aria-hidden="true"
        />
      ) : null}
      <span className="mentor-trigger__halo" aria-hidden="true" />
      <span className="mentor-trigger__face" aria-hidden="true">
        <svg viewBox="0 0 28 28" width="22" height="22">
          <path
            d="M14 3c-6 0-11 4.2-11 9.4 0 3 1.7 5.7 4.5 7.5l-1 4c-.1.6.5 1 1 .8l3.6-1.9c.9.2 1.9.3 2.9.3 6 0 11-4.2 11-9.4S20 3 14 3Z"
            fill="currentColor"
            opacity="0.95"
          />
          <circle cx="9" cy="13.5" r="1.2" fill="#FAF7F0" />
          <circle cx="14" cy="13.5" r="1.2" fill="#FAF7F0" />
          <circle cx="19" cy="13.5" r="1.2" fill="#FAF7F0" />
        </svg>
      </span>
      <span className="mentor-trigger__copy">
        <span className="mentor-trigger__title">{STRINGS.MENTOR.EYEBROW}</span>
        <span className="mentor-trigger__sub">
          {hasError
            ? STRINGS.MENTOR.OPEN_FAB_BADGE
            : usedHints > 0
              ? STRINGS.MENTOR.HINT_COUNTER(usedHints, 3)
              : "Ask anytime"}
        </span>
      </span>
    </button>
  );
}
