"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STRINGS } from "@/lib/constants";
import type { SandboxTable } from "@/lib/sandbox";

interface SchemaBrowserProps {
  tables: SandboxTable[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

interface CopyState {
  identifier: string;
  ok: boolean;
  // Bumped on each copy so the same identifier triggers a fresh toast
  // animation instead of reusing the last one.
  epoch: number;
}

export function SchemaBrowser({
  tables,
  loading,
  error,
  onRefresh,
}: SchemaBrowserProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    return new Set(tables.length > 0 ? [tables[0]!.name] : []);
  });
  const [copy, setCopy] = useState<CopyState | null>(null);
  const dismissTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!copy) return;
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    dismissTimer.current = window.setTimeout(() => setCopy(null), 1800);
    return () => {
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    };
  }, [copy]);

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const copyIdentifier = useCallback(async (identifier: string) => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(identifier);
      ok = true;
    } catch {
      ok = false;
    }
    setCopy((prev) => ({
      identifier,
      ok,
      epoch: (prev?.epoch ?? 0) + 1,
    }));
  }, []);

  const totalRows = useMemo(
    () => tables.reduce((sum, t) => sum + t.row_count, 0),
    [tables],
  );

  return (
    <aside className="schema-browser" aria-label={STRINGS.SANDBOX.SCHEMA_HEADING}>
      <header className="schema-browser__header">
        <div>
          <p className="schema-browser__eyebrow">
            {STRINGS.SANDBOX.SCHEMA_HEADING}
          </p>
          <p className="schema-browser__meta">
            {tables.length > 0
              ? `${STRINGS.SANDBOX.SCHEMA_TABLES(tables.length)} · ${STRINGS.SANDBOX.SCHEMA_ROWS(totalRows)}`
              : STRINGS.SANDBOX.SCHEMA_HINT}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="schema-browser__refresh"
          disabled={loading}
          aria-label={STRINGS.SANDBOX.SCHEMA_REFRESH}
          title={STRINGS.SANDBOX.SCHEMA_REFRESH}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M3.5 8a4.5 4.5 0 1 1 1.32 3.18M3.5 4.5v3.4h3.4"
              stroke="currentColor"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <div
        className="schema-browser__copy-flash"
        data-state={copy ? "visible" : "hidden"}
        data-tone={copy?.ok === false ? "error" : "ok"}
        role="status"
        aria-live="polite"
        key={copy?.epoch ?? 0}
      >
        {copy ? (
          copy.ok
            ? STRINGS.SANDBOX.SCHEMA_COPIED(copy.identifier)
            : STRINGS.SANDBOX.SCHEMA_COPY_FAILED
        ) : null}
      </div>

      {loading && tables.length === 0 ? (
        <p className="schema-browser__status">{STRINGS.SANDBOX.SCHEMA_LOADING}</p>
      ) : null}
      {error ? (
        <p className="schema-browser__status schema-browser__status--error" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && tables.length === 0 ? (
        <p className="schema-browser__status">{STRINGS.SANDBOX.SCHEMA_EMPTY}</p>
      ) : null}

      <ul className="schema-browser__list">
        {tables.map((table) => {
          const isOpen = expanded.has(table.name);
          return (
            <li key={table.name} className="schema-table" data-open={isOpen}>
              <button
                type="button"
                className="schema-table__row"
                aria-expanded={isOpen}
                onClick={() => toggle(table.name)}
              >
                <span className="schema-table__caret" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 12 12">
                    <path
                      d="m4 3 4 3-4 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="schema-table__name" title={table.name}>
                  {table.name}
                </span>
                <span className="schema-table__rows">
                  {STRINGS.SANDBOX.SCHEMA_ROWS(table.row_count)}
                </span>
              </button>
              {isOpen ? (
                <ul className="schema-columns">
                  {table.columns.map((column) => {
                    const identifier = `${table.name}.${column.name}`;
                    return (
                      <li key={column.name} className="schema-column">
                        <button
                          type="button"
                          className="schema-column__row"
                          onClick={() => void copyIdentifier(identifier)}
                          title={`Copy ${identifier} to clipboard`}
                        >
                          <span className="schema-column__name">
                            {column.name}
                          </span>
                          <span className="schema-column__type">
                            {column.data_type}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
