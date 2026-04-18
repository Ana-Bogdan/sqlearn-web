"use client";

import { useState } from "react";
import { STRINGS } from "@/lib/constants";
import type { ExerciseHint } from "@/lib/exercises";

interface HintsPanelProps {
  hints: ExerciseHint[];
  revealed: number;
  onReveal: (next: number) => void;
}

export function HintsPanel({ hints, revealed, onReveal }: HintsPanelProps) {
  const [expanded, setExpanded] = useState<boolean>(revealed > 0);
  if (hints.length === 0) return null;

  const canReveal = revealed < hints.length;
  const count = hints.length;

  return (
    <section className="hints-panel" aria-label={STRINGS.EXERCISE.HINTS.HEADING}>
      <header className="hints-panel__head">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="hints-panel__toggle"
        >
          <span className="hints-panel__icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="14" height="14">
              <path
                d="M10 2.5a5 5 0 0 0-3 9v1.25a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V11.5a5 5 0 0 0-3-9Zm-1.5 13h3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </span>
          <span className="hints-panel__title">
            {STRINGS.EXERCISE.HINTS.HEADING}
          </span>
          <span className="hints-panel__counter">
            {STRINGS.EXERCISE.HINTS.COUNTER(revealed, count)}
          </span>
          <span
            className="hints-panel__chevron"
            aria-hidden="true"
            data-expanded={expanded ? "true" : "false"}
          >
            <svg viewBox="0 0 16 16" width="12" height="12">
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </span>
        </button>
      </header>

      {expanded ? (
        <div className="hints-panel__body">
          {revealed === 0 ? (
            <p className="hints-panel__empty">
              {STRINGS.EXERCISE.HINTS.EMPTY_BODY}
            </p>
          ) : (
            <ol className="hints-panel__list">
              {hints.slice(0, revealed).map((hint, idx) => (
                <li key={hint.id} className="hint-item" style={{ animationDelay: `${idx * 40}ms` }}>
                  <span className="hint-item__num">{String(idx + 1).padStart(2, "0")}</span>
                  <p className="hint-item__text">{hint.hint_text}</p>
                </li>
              ))}
            </ol>
          )}

          <div className="hints-panel__footer">
            {canReveal ? (
              <button
                type="button"
                onClick={() => onReveal(revealed + 1)}
                className="hints-panel__reveal"
              >
                {revealed === 0
                  ? STRINGS.EXERCISE.HINTS.REVEAL_FIRST
                  : STRINGS.EXERCISE.HINTS.REVEAL_NEXT}
                <span aria-hidden="true" className="hints-panel__arrow">→</span>
              </button>
            ) : (
              <p className="hints-panel__exhausted">
                {STRINGS.EXERCISE.HINTS.ALL_REVEALED}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
