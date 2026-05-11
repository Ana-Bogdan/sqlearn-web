"use client";

import Link from "next/link";
import { useEffect } from "react";
import { STRINGS } from "@/lib/constants";

export default function PublicSegmentError({
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
    <div className="status-shell status-shell--public">
      <div className="grain-overlay" aria-hidden="true" />
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
          <Link href="/" className="status-cta status-cta--ghost">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
