"use client";

import { useMemo } from "react";
import { STRINGS } from "@/lib/constants";
import type {
  IncorrectReason,
  QueryResultSet,
  SubmissionOutcome,
} from "@/lib/exercises";

interface ResultsPanelProps {
  state:
    | { kind: "idle" }
    | { kind: "running" }
    | { kind: "result"; outcome: SubmissionOutcome };
}

export function ResultsPanel({ state }: ResultsPanelProps) {
  if (state.kind === "idle") {
    return (
      <div className="results-panel results-panel--idle">
        <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
          <div className="results-idle-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <path
                d="M4 7h16M4 12h10M4 17h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="max-w-sm text-[0.875rem] leading-relaxed text-taupe/65">
            {STRINGS.EXERCISE.RESULTS.IDLE_BODY}
          </p>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-taupe/35">
            {STRINGS.EXERCISE.RESULTS.IDLE_HINT}
          </p>
        </div>
      </div>
    );
  }

  if (state.kind === "running") {
    return (
      <div className="results-panel results-panel--running" aria-live="polite">
        <div className="flex h-full flex-col items-center justify-center gap-3 py-10">
          <span className="running-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <p className="text-[0.8125rem] font-medium text-taupe/70">
            {STRINGS.EXERCISE.RESULTS.RUNNING}
          </p>
        </div>
      </div>
    );
  }

  return <OutcomeView outcome={state.outcome} />;
}

function OutcomeView({ outcome }: { outcome: SubmissionOutcome }) {
  const hasResult = Boolean(outcome.result);
  return (
    <div className="results-panel">
      <OutcomeBanner outcome={outcome} />
      {outcome.status === "correct" && hasResult ? (
        <div className="mt-4">
          <ResultTable caption={STRINGS.EXERCISE.RESULTS.YOUR_RESULT} data={outcome.result!} tone="correct" />
        </div>
      ) : null}
      {outcome.status === "incorrect" ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ResultTable
            caption={STRINGS.EXERCISE.RESULTS.YOUR_RESULT}
            data={outcome.result ?? { columns: [], rows: [] }}
            tone="incorrect"
            highlight={outcome.reason ?? null}
          />
          <ResultTable
            caption={STRINGS.EXERCISE.RESULTS.EXPECTED_RESULT}
            data={outcome.expected ?? { columns: [], rows: [] }}
            tone="expected"
          />
        </div>
      ) : null}
      {outcome.status !== "correct" && outcome.status !== "incorrect" && hasResult ? (
        <div className="mt-4">
          <ResultTable caption={STRINGS.EXERCISE.RESULTS.YOUR_RESULT} data={outcome.result!} tone="neutral" />
        </div>
      ) : null}
    </div>
  );
}

function OutcomeBanner({ outcome }: { outcome: SubmissionOutcome }) {
  if (outcome.status === "correct") {
    return (
      <div className="outcome-banner" data-tone="correct" role="status">
        <BannerIcon kind="correct" />
        <div className="min-w-0">
          <p className="outcome-banner__title">
            {STRINGS.EXERCISE.BANNER.CORRECT_TITLE}
          </p>
          <p className="outcome-banner__body">
            {STRINGS.EXERCISE.BANNER.CORRECT_BODY}
          </p>
        </div>
      </div>
    );
  }

  if (outcome.status === "incorrect") {
    return (
      <div className="outcome-banner" data-tone="incorrect" role="status">
        <BannerIcon kind="incorrect" />
        <div className="min-w-0">
          <p className="outcome-banner__title">
            {reasonTitle(outcome.reason ?? null)}
          </p>
          <p className="outcome-banner__body">{outcome.message}</p>
        </div>
      </div>
    );
  }

  if (outcome.status === "syntax_error" || outcome.status === "execution_error") {
    return (
      <div className="outcome-banner" data-tone="error" role="alert">
        <BannerIcon kind="error" />
        <div className="min-w-0">
          <p className="outcome-banner__title">
            {outcome.status === "syntax_error"
              ? STRINGS.EXERCISE.BANNER.SYNTAX_TITLE
              : STRINGS.EXERCISE.BANNER.EXECUTION_TITLE}
          </p>
          <pre className="outcome-banner__code">{outcome.message}</pre>
        </div>
      </div>
    );
  }

  if (outcome.status === "timeout") {
    return (
      <div className="outcome-banner" data-tone="warning" role="alert">
        <BannerIcon kind="warning" />
        <div className="min-w-0">
          <p className="outcome-banner__title">
            {STRINGS.EXERCISE.BANNER.TIMEOUT_TITLE}
          </p>
          <p className="outcome-banner__body">{outcome.message}</p>
        </div>
      </div>
    );
  }

  // forbidden
  return (
    <div className="outcome-banner" data-tone="warning" role="alert">
      <BannerIcon kind="warning" />
      <div className="min-w-0">
        <p className="outcome-banner__title">
          {STRINGS.EXERCISE.BANNER.FORBIDDEN_TITLE}
        </p>
        <p className="outcome-banner__body">{outcome.message}</p>
      </div>
    </div>
  );
}

function reasonTitle(reason: SubmissionOutcome["reason"] | null): string {
  switch (reason) {
    case "columns_mismatch":
      return STRINGS.EXERCISE.BANNER.INCORRECT_COLUMNS;
    case "row_count_mismatch":
      return STRINGS.EXERCISE.BANNER.INCORRECT_ROW_COUNT;
    case "rows_mismatch":
      return STRINGS.EXERCISE.BANNER.INCORRECT_ROWS;
    default:
      return STRINGS.EXERCISE.BANNER.INCORRECT_GENERIC;
  }
}

function BannerIcon({ kind }: { kind: "correct" | "incorrect" | "error" | "warning" }) {
  const paths: Record<typeof kind, React.ReactNode> = {
    correct: (
      <path
        d="m5.5 10 3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    incorrect: (
      <>
        <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M10 7v3.5M10 13v.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </>
    ),
    error: (
      <>
        <path
          d="M10 3.25 3.25 16h13.5L10 3.25z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M10 8v4M10 14v.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </>
    ),
    warning: (
      <>
        <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M10 6.75v4M10 13v.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </>
    ),
  };
  return (
    <span className="outcome-banner__icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="22" height="22">
        {paths[kind]}
      </svg>
    </span>
  );
}

interface ResultTableProps {
  caption: string;
  data: QueryResultSet;
  tone: "correct" | "incorrect" | "expected" | "neutral";
  highlight?: IncorrectReason;
}

function ResultTable({ caption, data, tone, highlight }: ResultTableProps) {
  const rowCount = data.rows.length;
  const colCount = data.columns.length;
  const preview = useMemo(() => data.rows.slice(0, 200), [data.rows]);

  return (
    <figure className="result-table" data-tone={tone}>
      <figcaption className="result-table__caption">
        <span className="result-table__caption-title">{caption}</span>
        <span className="result-table__caption-meta">
          {STRINGS.EXERCISE.RESULTS.TABLE_META(rowCount, colCount)}
        </span>
      </figcaption>
      {colCount === 0 ? (
        <p className="result-table__empty">{STRINGS.EXERCISE.RESULTS.EMPTY}</p>
      ) : (
        <div className="result-table__scroll">
          <table>
            <thead>
              <tr>
                {data.columns.map((col) => (
                  <th key={col} data-flag={highlight === "columns_mismatch" ? "flagged" : undefined}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="result-table__no-rows">
                    {STRINGS.EXERCISE.RESULTS.NO_ROWS}
                  </td>
                </tr>
              ) : (
                preview.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} data-null={cell === null ? "true" : undefined}>
                        {cell === null ? "NULL" : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {rowCount > preview.length ? (
        <p className="result-table__truncation">
          {STRINGS.EXERCISE.RESULTS.TRUNCATED(preview.length, rowCount)}
        </p>
      ) : null}
    </figure>
  );
}
