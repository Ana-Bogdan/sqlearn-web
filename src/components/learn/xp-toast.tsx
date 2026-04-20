"use client";

import { useEffect, useState } from "react";
import { STRINGS } from "@/lib/constants";

interface XpToastProps {
  xp: number;
  firstAttempt: boolean;
  streakBonus?: boolean;
  onDone: () => void;
}

export function XpToast({
  xp,
  firstAttempt,
  streakBonus,
  onDone,
}: XpToastProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 2400);
    const removeTimer = window.setTimeout(() => onDone(), 3100);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`xp-toast ${leaving ? "xp-toast--leaving" : ""}`}
    >
      <span className="xp-toast__spark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            d="M12 3l2.2 5.5L20 10l-5.8 1.5L12 17l-2.2-5.5L4 10l5.8-1.5L12 3z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="xp-toast__amount">+{xp}</span>
      <span className="xp-toast__label">{STRINGS.XP.LABEL}</span>

      {firstAttempt || streakBonus ? (
        <span className="xp-toast__breakdown" aria-hidden="true">
          {firstAttempt ? (
            <span className="xp-toast__flag">{STRINGS.XP.FIRST_ATTEMPT}</span>
          ) : null}
          {streakBonus ? (
            <span className="xp-toast__flag">{STRINGS.XP.STREAK}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
