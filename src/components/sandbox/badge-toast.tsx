"use client";

import { useEffect } from "react";
import { BadgeIcon } from "@/components/badge-icon";
import { STRINGS } from "@/lib/constants";
import type { Badge } from "@/lib/gamification";

interface BadgeToastProps {
  badge: Badge | null;
  onDismiss: () => void;
}

export function BadgeToast({ badge, onDismiss }: BadgeToastProps) {
  useEffect(() => {
    if (!badge) return;
    const t = window.setTimeout(onDismiss, 6800);
    return () => window.clearTimeout(t);
  }, [badge, onDismiss]);

  if (!badge) return null;

  return (
    <div
      className="badge-toast"
      role="status"
      aria-live="polite"
      key={badge.trigger_type}
    >
      <span className="badge-toast__sparkle" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <path
            d="M8 1.5 9.4 6 14 7.4 9.4 8.8 8 13.5 6.6 8.8 2 7.4 6.6 6Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="badge-toast__icon">
        <BadgeIcon name={badge.icon} size={26} />
      </span>
      <div className="badge-toast__copy">
        <p className="badge-toast__eyebrow">
          {STRINGS.SANDBOX.BADGE_TOAST.EYEBROW}
        </p>
        <p className="badge-toast__name">{badge.name}</p>
        <p className="badge-toast__description">{badge.description}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="badge-toast__close"
        aria-label={STRINGS.SANDBOX.BADGE_TOAST.DISMISS}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="m4 4 8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
