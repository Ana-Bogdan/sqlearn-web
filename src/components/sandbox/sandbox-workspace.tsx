"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MentorDrawer } from "@/components/mentor/mentor-drawer";
import { SqlEditor } from "@/components/learn/sql-editor";
import { STRINGS } from "@/lib/constants";
import type { Badge } from "@/lib/gamification";
import {
  executeSandboxQuery,
  fetchSandboxSchema,
  resetSandbox,
  type SandboxExecuteResponse,
  type SandboxTable,
} from "@/lib/sandbox";
import { useMentorStore } from "@/stores/mentor-store";
import { BadgeToast } from "./badge-toast";
import { SandboxResults, type SandboxResultState } from "./sandbox-results";
import { SchemaBrowser } from "./schema-browser";

const DEFAULT_QUERY = `SELECT
  c.country,
  COUNT(*) AS customer_count
FROM customers AS c
GROUP BY c.country
ORDER BY customer_count DESC;`;

interface BadgeQueueState {
  active: Badge | null;
  pending: Badge[];
}

function dequeue(state: BadgeQueueState): BadgeQueueState {
  const [next, ...rest] = state.pending;
  return { active: next ?? null, pending: rest };
}

export function SandboxWorkspace() {
  const [sql, setSql] = useState<string>(DEFAULT_QUERY);
  const [tables, setTables] = useState<SandboxTable[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [schemaReloadTick, setSchemaReloadTick] = useState(0);
  const [resultState, setResultState] = useState<SandboxResultState>({
    kind: "idle",
  });
  const [runError, setRunError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetFlash, setResetFlash] = useState(false);
  const [badgeState, setBadgeState] = useState<BadgeQueueState>({
    active: null,
    pending: [],
  });

  const openMentorForSandbox = useMentorStore((s) => s.openForSandbox);
  const isMentorOpen = useMentorStore((s) => s.isOpen);

  // Schema fetch — re-runs whenever schemaReloadTick changes (initial mount,
  // reset, or post-write refresh).
  useEffect(() => {
    let cancelled = false;
    fetchSandboxSchema().then(
      (data) => {
        if (cancelled) return;
        setTables(data.tables);
        setSchemaError(null);
        setSchemaLoading(false);
      },
      () => {
        if (cancelled) return;
        setSchemaError(STRINGS.SANDBOX.SCHEMA_ERROR);
        setSchemaLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [schemaReloadTick]);

  const reloadSchema = useCallback(() => {
    setSchemaLoading(true);
    setSchemaReloadTick((tick) => tick + 1);
  }, []);

  const handleRun = useCallback(async () => {
    const trimmed = sql.trim();
    if (!trimmed) {
      setRunError(STRINGS.SANDBOX.EDITOR.EMPTY_SQL);
      return;
    }
    setRunError(null);
    setResultState({ kind: "running" });
    try {
      const outcome: SandboxExecuteResponse =
        await executeSandboxQuery(trimmed);
      setResultState({ kind: "result", outcome });
      if (outcome.badges_earned.length > 0) {
        setBadgeState((state) => {
          const merged = [...state.pending, ...outcome.badges_earned];
          if (state.active) return { active: state.active, pending: merged };
          return dequeue({ active: null, pending: merged });
        });
      }
      // Refresh schema in the background — writes may have changed row counts.
      if (outcome.status === "ok" && outcome.result?.columns.length === 0) {
        reloadSchema();
      }
    } catch {
      setResultState({ kind: "idle" });
      setRunError(STRINGS.SANDBOX.EDITOR.RUN_ERROR);
    }
  }, [reloadSchema, sql]);

  const handleReset = useCallback(async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await resetSandbox();
      reloadSchema();
      setResultState({ kind: "idle" });
      setResetFlash(true);
      window.setTimeout(() => setResetFlash(false), 2400);
    } finally {
      setResetting(false);
    }
  }, [reloadSchema, resetting]);

  const handleDismissBadge = useCallback(() => {
    setBadgeState((state) => dequeue({ active: null, pending: state.pending }));
  }, []);

  const handleAskMentor = useCallback(() => {
    openMentorForSandbox();
  }, [openMentorForSandbox]);

  const handleExplainWithAI = useCallback(
    (errorMessage: string) => {
      // Mirror the lesson flow: open the drawer and immediately fire an
      // explain-error request. The store handles the rest — message bubble,
      // pending state, and Gemini fallback. No prefilled NL textarea, since
      // that would route through the NL-to-SQL strategy and return code
      // instead of an explanation.
      openMentorForSandbox();
      const store = useMentorStore.getState();
      store.setLastError({ sql, message: errorMessage });
      void store.sendExplainError({ sql, errorMessage });
    },
    [openMentorForSandbox, sql],
  );

  const handleInsertSql = useCallback((sqlBlock: string) => {
    setSql(sqlBlock);
  }, []);

  const heroSubtext = useMemo(() => STRINGS.SANDBOX.SUBHEADING, []);

  return (
    <div className="sandbox-shell">
      <div className="sandbox-shell__inner">
        <header className="sandbox-hero">
          <div>
            <p className="sandbox-hero__eyebrow">{STRINGS.SANDBOX.EYEBROW}</p>
            <h1 className="sandbox-hero__heading">{STRINGS.SANDBOX.HEADING}</h1>
            <p className="sandbox-hero__sub">{heroSubtext}</p>
          </div>
          <button
            type="button"
            onClick={handleAskMentor}
            className="sandbox-hero__ai"
            data-active={isMentorOpen ? "true" : undefined}
          >
            <span className="sandbox-hero__ai-mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" width="20" height="20">
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
            <span className="sandbox-hero__ai-copy">
              <span className="sandbox-hero__ai-title">
                {STRINGS.SANDBOX.AI_LAUNCH}
              </span>
              <span className="sandbox-hero__ai-sub">
                {STRINGS.SANDBOX.AI_LAUNCH_SUB}
              </span>
            </span>
          </button>
        </header>

        <div className="sandbox-grid">
          <SchemaBrowser
            tables={tables}
            loading={schemaLoading}
            error={schemaError}
            onRefresh={reloadSchema}
          />

          <section className="sandbox-stage">
            <div className="editor-shell sandbox-editor">
              <div className="editor-shell__bar">
                <span className="editor-shell__label">
                  <span className="editor-shell__dot" data-pos="a" aria-hidden="true" />
                  <span className="editor-shell__dot" data-pos="b" aria-hidden="true" />
                  <span className="editor-shell__dot" data-pos="c" aria-hidden="true" />
                  <span className="editor-shell__path">
                    {STRINGS.SANDBOX.EDITOR.TAB_LABEL}
                  </span>
                </span>
                <span className="editor-shell__kbd" aria-hidden="true">
                  <kbd>⌘</kbd>
                  <kbd>↵</kbd>
                  <span className="editor-shell__kbd-note">
                    {STRINGS.SANDBOX.EDITOR.RUN_SHORTCUT_NOTE}
                  </span>
                </span>
              </div>
              <div className="editor-shell__body sandbox-editor__body">
                <SqlEditor
                  value={sql}
                  onChange={setSql}
                  onRun={handleRun}
                  placeholder={STRINGS.SANDBOX.EDITOR.PLACEHOLDER}
                  ariaLabel="Free sandbox SQL editor"
                />
              </div>
              <div className="editor-shell__actions">
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={resultState.kind === "running"}
                  className="editor-action editor-action--primary"
                >
                  {resultState.kind === "running"
                    ? STRINGS.SANDBOX.EDITOR.RUN_PENDING
                    : STRINGS.SANDBOX.EDITOR.RUN}
                  <span aria-hidden="true" className="editor-action__arrow">
                    →
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting || resultState.kind === "running"}
                  className="editor-action editor-action--secondary"
                  title={STRINGS.SANDBOX.EDITOR.RESET_TOOLTIP}
                >
                  {resetting
                    ? STRINGS.SANDBOX.EDITOR.RESET_PENDING
                    : STRINGS.SANDBOX.EDITOR.RESET}
                </button>
                {resetFlash ? (
                  <span className="sandbox-reset-flash" role="status">
                    {STRINGS.SANDBOX.RESULTS.RESET_DONE}
                  </span>
                ) : null}
              </div>
              {runError ? (
                <p className="editor-shell__error" role="alert">
                  {runError}
                </p>
              ) : null}
            </div>

            <SandboxResults
              state={resultState}
              onExplainWithAI={handleExplainWithAI}
            />
          </section>
        </div>
      </div>

      <BadgeToast
        badge={badgeState.active}
        onDismiss={handleDismissBadge}
      />
      <MentorDrawer currentSql={sql} onInsertSql={handleInsertSql} />
    </div>
  );
}
