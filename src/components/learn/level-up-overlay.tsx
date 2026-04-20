"use client";

import { useEffect, useRef } from "react";
import { STRINGS } from "@/lib/constants";

interface LevelUpOverlayProps {
  level: number;
  title: string;
  onDismiss: () => void;
}

export function LevelUpOverlay({
  level,
  title,
  onDismiss,
}: LevelUpOverlayProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onDismiss();
    };
    window.addEventListener("keydown", handler);
    const t = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    }, 50);
    return () => {
      window.removeEventListener("keydown", handler);
      window.clearTimeout(t);
    };
  }, [onDismiss]);

  return (
    <div
      className="level-up-backdrop"
      onClick={onDismiss}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="level-up-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-up-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <LevelUpOrbit />
        <p className="level-up-card__eyebrow">
          {STRINGS.XP.LEVEL_UP_EYEBROW}
        </p>
        <p className="level-up-card__num">{level}</p>
        <h2 id="level-up-heading" className="level-up-card__title">
          {STRINGS.XP.LEVEL_UP_HEADING(level)}
        </h2>
        <p className="level-up-card__body">
          {STRINGS.XP.LEVEL_UP_BODY(title)}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="level-up-card__cta"
        >
          Keep learning
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

function LevelUpOrbit() {
  // Abstract decorative SVG — concentric rings with small motes drifting
  // around the level number. Uses existing motion utilities.
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
    >
      <g stroke="#EAD4C0" strokeWidth="0.8" fill="none">
        <circle cx="200" cy="200" r="120" opacity="0.25" />
        <circle cx="200" cy="200" r="160" opacity="0.15" />
        <circle cx="200" cy="200" r="80" opacity="0.35" />
      </g>
      <g>
        <circle cx="80" cy="100" r="3" fill="#EAD4C0" className="twinkle" />
        <circle cx="330" cy="90" r="2" fill="#B999A4" className="twinkle-slow" />
        <circle cx="340" cy="300" r="2.5" fill="#EAD4C0" className="twinkle" />
        <circle cx="70" cy="320" r="2" fill="#B999A4" className="twinkle-slow" />
        <circle cx="60" cy="210" r="1.5" fill="#F5F1E5" className="twinkle" />
        <circle cx="340" cy="200" r="1.5" fill="#F5F1E5" className="twinkle-slow" />
      </g>
    </svg>
  );
}
