"use client";

import Link from "next/link";
import { useEffect } from "react";
import { STRINGS } from "@/lib/constants";

export default function AppSegmentError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="status-shell">
      <div
        className="status-card animate-fade-up"
        style={{ animationDelay: "60ms" }}
      >
        <span className="status-glyph" data-tone="error">
          {STRINGS.ERROR.EYEBROW}
        </span>
        <h1 className="status-heading">{STRINGS.ERROR.HEADING}</h1>
        <p className="status-body">{STRINGS.ERROR.BODY}</p>

        <div className="status-actions">
          <button
            type="button"
            className="status-cta status-cta--primary"
            onClick={() => unstable_retry()}
          >
            {STRINGS.ERROR.RETRY}
            <span className="status-cta__arrow" aria-hidden="true">
              ↻
            </span>
          </button>
          <Link href="/dashboard" className="status-cta status-cta--ghost">
            {STRINGS.ERROR.BACK_HOME}
          </Link>
        </div>
      </div>
    </div>
  );
}
