"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { BadgeIcon } from "@/components/badge-icon";
import { STRINGS } from "@/lib/constants";
import type { Badge } from "@/lib/gamification";

interface BadgeCelebrationProps {
  badge: Badge | null;
  // 1-based position of the active badge in this batch.
  current: number;
  // Total badges in this batch (queued + active).
  total: number;
  onDismiss: () => void;
}

// Tinted paper scraps drawn from the brand palette. Confetti reads as torn
// craft paper falling, not the carnival-rainbow default.
const CONFETTI_COLORS = [
  "#DECAA9", // pale oak
  "#EAD4C0", // warm pale oak
  "#F5F1E5", // cream
  "#B999A4", // light mauve
  "#C58B6F", // amber accent
  "#3E5570", // dusk (rare)
];

interface ConfettiPiece {
  id: number;
  left: number;
  width: number;
  height: number;
  color: string;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
  rounded: boolean;
}

// Deterministic per-badge so a given badge always produces the same shower —
// keeps the visual feeling considered, not noisy.
function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateConfetti(seed: number): ConfettiPiece[] {
  const rng = mulberry32(seed * 9173 + 7);
  const count = 64;
  return Array.from({ length: count }, (_, i) => {
    const w = 4 + rng() * 4;
    const h = w + rng() * 10;
    return {
      id: i,
      left: rng() * 100,
      width: w,
      height: h,
      color: CONFETTI_COLORS[Math.floor(rng() * CONFETTI_COLORS.length)],
      duration: 3500 + rng() * 2500,
      delay: rng() * 600,
      drift: (rng() - 0.5) * 160,
      rotation: (360 + rng() * 720) * (rng() > 0.5 ? 1 : -1),
      rounded: rng() > 0.78,
    };
  });
}

export function BadgeCelebration({
  badge,
  current,
  total,
  onDismiss,
}: BadgeCelebrationProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const open = !!badge;

  useEffect(() => {
    if (!badge) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", handler);
    const t = window.setTimeout(() => {
      dialogRef.current
        ?.querySelector<HTMLButtonElement>(".badge-celebration-card__cta")
        ?.focus();
    }, 80);
    return () => {
      window.removeEventListener("keydown", handler);
      window.clearTimeout(t);
    };
  }, [badge, onDismiss]);

  // Lock background scroll while the overlay is open. Pad the body to
  // compensate for the disappearing scrollbar so the page underneath
  // doesn't visibly shift when the modal opens.
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbar =
      window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) {
      body.style.paddingRight = `${scrollbar}px`;
    }
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  const confetti = useMemo(
    () => (badge ? generateConfetti(badge.id) : []),
    [badge],
  );

  if (!badge || typeof document === "undefined") return null;

  const categoryLabel =
    STRINGS.EXERCISE.BADGE_CELEBRATION.CATEGORY[badge.category];

  return createPortal(
    <div
      className="badge-celebration-backdrop"
      onClick={onDismiss}
      role="presentation"
    >
      <div className="badge-celebration-confetti" aria-hidden="true">
        {confetti.map((p) => (
          <span
            key={p.id}
            className={
              "badge-celebration-confetti__piece" +
              (p.rounded ? " badge-celebration-confetti__piece--round" : "")
            }
            style={{
              left: `${p.left}%`,
              width: `${p.width}px`,
              height: `${p.height}px`,
              background: p.color,
              animationDuration: `${p.duration}ms`,
              animationDelay: `${p.delay}ms`,
              ["--drift" as string]: `${p.drift}px`,
              ["--rot" as string]: `${p.rotation}deg`,
            }}
          />
        ))}
      </div>

      <div
        // Re-keying by badge.id forces a fresh mount per badge so the
        // medallion settle + staggered rise animations replay on each one.
        key={badge.id}
        ref={dialogRef}
        className="badge-celebration-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="badge-celebration-name"
        aria-describedby="badge-celebration-description"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onDismiss}
          className="badge-celebration-card__close"
          aria-label={STRINGS.EXERCISE.BADGE_CELEBRATION.DISMISS}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="m4 4 8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {total > 1 ? (
          <p className="badge-celebration-card__counter">
            {STRINGS.EXERCISE.BADGE_CELEBRATION.COUNTER(current, total)}
          </p>
        ) : null}

        <p className="badge-celebration-card__eyebrow">
          {STRINGS.EXERCISE.BADGE_CELEBRATION.EYEBROW}
        </p>

        <div className="badge-celebration-card__medallion" aria-hidden="true">
          <span className="badge-celebration-card__medallion-ring" />
          <span className="badge-celebration-card__medallion-icon">
            <BadgeIcon name={badge.icon} size={56} strokeWidth={1.5} />
          </span>
        </div>

        <h2
          id="badge-celebration-name"
          className="badge-celebration-card__name"
        >
          {badge.name}
        </h2>

        <p className="badge-celebration-card__category">{categoryLabel}</p>

        <p
          id="badge-celebration-description"
          className="badge-celebration-card__description"
        >
          {badge.description}
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="badge-celebration-card__cta"
        >
          {STRINGS.EXERCISE.BADGE_CELEBRATION.CONTINUE}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
