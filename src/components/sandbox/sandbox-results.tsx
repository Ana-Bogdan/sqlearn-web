"use client";

import { useMemo } from "react";
import { STRINGS } from "@/lib/constants";
import type { SandboxExecuteResponse, SandboxQueryResult } from "@/lib/sandbox";

export type SandboxResultState =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "result"; outcome: SandboxExecuteResponse };

interface SandboxResultsProps {
  state: SandboxResultState;
  onExplainWithAI?: (errorMessage: string) => void;
}

export function SandboxResults({ state, onExplainWithAI }: SandboxResultsProps) {
  if (state.kind === "idle") {
    return (
      <div className="sandbox-results sandbox-results--idle">
        <div className="sandbox-results__idle-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28">
            <path
              d="M5 8h22M5 14h14M5 20h22M5 26h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="sandbox-results__idle-title">
          {STRINGS.SANDBOX.RESULTS.IDLE_TITLE}
        </p>
        <p className="sandbox-results__idle-body">
          {STRINGS.SANDBOX.RESULTS.IDLE_BODY}
        </p>
      </div>
    );
  }

  if (state.kind === "running") {
    return (
      <div className="sandbox-results sandbox-results--running" aria-live="polite">
        <span className="running-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <p>{STRINGS.SANDBOX.RESULTS.RUNNING}</p>
      </div>
    );
  }

  return <Outcome outcome={state.outcome} onExplainWithAI={onExplainWithAI} />;
}

function Outcome({
  outcome,
  onExplainWithAI,
}: {
  outcome: SandboxExecuteResponse;
  onExplainWithAI?: (errorMessage: string) => void;
}) {
  if (outcome.status === "ok") {
    return <SuccessView result={outcome.result} />;
  }
  return <ErrorView outcome={outcome} onExplainWithAI={onExplainWithAI} />;
}

function SuccessView({ result }: { result: SandboxQueryResult | undefined }) {
  if (!result) return null;
  const isWrite = result.columns.length === 0;

  return (
    <div className="sandbox-results">
      <header className="sandbox-results__banner" data-tone="ok">
        <span className="sandbox-results__banner-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 20 20">
            <path
              d="m5.5 10 3 3 6-7"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
        <div>
          <p className="sandbox-results__banner-title">
            {STRINGS.SANDBOX.RESULTS.OK_TITLE}
          </p>
          <p className="sandbox-results__banner-body">
            {isWrite
              ? STRINGS.SANDBOX.RESULTS.WRITE_BODY(result.rowcount)
              : STRINGS.SANDBOX.RESULTS.OK_BODY(result.rows.length)}
          </p>
        </div>
      </header>

      {!isWrite ? <ResultTable result={result} /> : null}
    </div>
  );
}

function ErrorView({
  outcome,
  onExplainWithAI,
}: {
  outcome: SandboxExecuteResponse;
  onExplainWithAI?: (errorMessage: string) => void;
}) {
  const tone =
    outcome.status === "syntax_error" || outcome.status === "execution_error"
      ? "error"
      : "warning";
  const title =
    outcome.status === "syntax_error"
      ? STRINGS.SANDBOX.BANNER.SYNTAX_TITLE
      : outcome.status === "execution_error"
        ? STRINGS.SANDBOX.BANNER.EXECUTION_TITLE
        : outcome.status === "timeout"
          ? STRINGS.SANDBOX.BANNER.TIMEOUT_TITLE
          : STRINGS.SANDBOX.BANNER.FORBIDDEN_TITLE;

  return (
    <div className="sandbox-results">
      <header className="sandbox-results__banner" data-tone={tone} role="alert">
        <span className="sandbox-results__banner-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 20 20">
            {tone === "error" ? (
              <>
                <path
                  d="M10 3.25 3.25 16h13.5L10 3.25z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M10 8v4M10 14v.25"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <circle
                  cx="10"
                  cy="10"
                  r="6.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M10 6.75v4M10 13v.25"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </span>
        <div>
          <p className="sandbox-results__banner-title">{title}</p>
          {tone === "error" ? (
            <pre className="sandbox-results__banner-code">
              {outcome.message ?? ""}
            </pre>
          ) : (
            <p className="sandbox-results__banner-body">
              {outcome.message ?? ""}
            </p>
          )}
          {onExplainWithAI && outcome.message ? (
            <button
              type="button"
              onClick={() => onExplainWithAI(outcome.message ?? "")}
              className="sandbox-results__explain"
            >
              <span aria-hidden="true">→</span> Ask AI to explain
            </button>
          ) : null}
        </div>
      </header>
    </div>
  );
}

function ResultTable({ result }: { result: SandboxQueryResult }) {
  const preview = useMemo(() => result.rows.slice(0, 200), [result.rows]);
  const cols = result.columns;
  const total = result.rows.length;

  return (
    <figure className="sandbox-table">
      <figcaption className="sandbox-table__caption">
        <span>{STRINGS.SANDBOX.RESULTS.TABLE_META(total, cols.length)}</span>
      </figcaption>
      {cols.length === 0 ? (
        <p className="sandbox-table__empty">
          {STRINGS.SANDBOX.RESULTS.EMPTY}
        </p>
      ) : (
        <div className="sandbox-table__scroll">
          <table>
            <thead>
              <tr>
                {cols.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.length === 0 ? (
                <tr>
                  <td colSpan={cols.length} className="sandbox-table__no-rows">
                    {STRINGS.SANDBOX.RESULTS.NO_ROWS}
                  </td>
                </tr>
              ) : (
                preview.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        data-null={cell === null ? "true" : undefined}
                      >
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
      {total > preview.length ? (
        <p className="sandbox-table__truncation">
          {STRINGS.SANDBOX.RESULTS.TRUNCATED(preview.length, total)}
        </p>
      ) : null}
    </figure>
  );
}
