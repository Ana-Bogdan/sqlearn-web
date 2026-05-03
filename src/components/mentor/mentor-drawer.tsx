"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

// SSR-safe: drawer only renders client-side because it's mounted inside a
// "use client" component invoked from another client tree, but createPortal
// still needs `document` to exist.
const isBrowser = typeof document !== "undefined";
import { STRINGS } from "@/lib/constants";
import { extractFirstSqlBlock, renderMentorMarkdown } from "@/lib/mentor-markdown";
import {
  useMentorStore,
  type MentorMessage,
  type MentorRequestKind,
} from "@/stores/mentor-store";

const MAX_HINTS = 3;

interface MentorDrawerProps {
  // Latest SQL the editor holds — passed as context for hints/explain.
  currentSql: string;
  // Wired by the parent so the user can paste a generated SQL block back
  // into the editor. When omitted, the "Insert into editor" button hides.
  onInsertSql?: (sql: string) => void;
}

export function MentorDrawer({ currentSql, onInsertSql }: MentorDrawerProps) {
  const isOpen = useMentorStore((s) => s.isOpen);
  const close = useMentorStore((s) => s.close);
  const context = useMentorStore((s) => s.context);
  const messages = useMentorStore((s) => s.messages);
  const sending = useMentorStore((s) => s.sending);
  const pendingKind = useMentorStore((s) => s.pendingKind);
  const hintsUsed = useMentorStore((s) => s.hintsUsed);
  const hintsRemaining = useMentorStore((s) => s.hintsRemaining);
  const lastError = useMentorStore((s) => s.lastError);
  const inputDraft = useMentorStore((s) => s.inputDraft);
  const setInputDraft = useMentorStore((s) => s.setInputDraft);
  const sendHint = useMentorStore((s) => s.sendHint);
  const sendExplainError = useMentorStore((s) => s.sendExplainError);
  const sendNLToSQL = useMentorStore((s) => s.sendNLToSQL);
  const resetThread = useMentorStore((s) => s.resetThread);

  const drawerRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  // Focus management: capture/return focus, and Esc to close.
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("keydown", handleKey);

    // Lock background scroll while open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the drawer's primary action shortly after mount.
    const t = window.setTimeout(() => {
      const target =
        drawerRef.current?.querySelector<HTMLElement>("[data-autofocus='true']") ??
        drawerRef.current?.querySelector<HTMLElement>(
          "button:not([disabled]), textarea, [tabindex]:not([tabindex='-1'])",
        );
      target?.focus();
    }, 80);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, close]);

  // Auto-scroll the thread to the bottom when messages or sending state change.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const node = threadRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [isOpen, messages.length, sending]);

  const isExerciseMode = context?.kind === "exercise";
  const isSandboxMode = context?.kind === "sandbox";
  const aiHintsUsed = hintsUsed;
  const aiHintsCapReached = aiHintsUsed >= MAX_HINTS;
  const remainingFromServer =
    hintsRemaining != null ? hintsRemaining : Math.max(0, MAX_HINTS - aiHintsUsed);

  const handleHint = useCallback(() => {
    if (sending || aiHintsCapReached) return;
    void sendHint({ sql: currentSql });
  }, [aiHintsCapReached, currentSql, sendHint, sending]);

  const handleExplainLastError = useCallback(() => {
    if (sending || !lastError) return;
    void sendExplainError({
      sql: lastError.sql,
      errorMessage: lastError.message,
    });
  }, [lastError, sendExplainError, sending]);

  const handleNLSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputDraft.trim();
      if (!trimmed || sending) return;
      void sendNLToSQL({ naturalLanguage: trimmed });
    },
    [inputDraft, sendNLToSQL, sending],
  );

  if (!isBrowser || !isOpen || !context) return null;

  return createPortal(
    <div
      className="mentor-drawer-root"
      role="presentation"
      onClick={close}
    >
      <div className="mentor-drawer-backdrop" aria-hidden="true" />
      <aside
        ref={drawerRef}
        className="mentor-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mentor-drawer-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <DrawerHeader
          context={context}
          onClose={close}
          onReset={messages.length > 0 ? resetThread : undefined}
        />

        <div className="mentor-drawer__thread" ref={threadRef} aria-live="polite">
          {messages.length === 0 ? (
            <EmptyState mode={context.kind} />
          ) : (
            <ol className="mentor-thread">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onInsertSql={onInsertSql}
                />
              ))}
              {sending ? <PendingBubble kind={pendingKind} /> : null}
            </ol>
          )}
        </div>

        <footer className="mentor-drawer__footer">
          {isExerciseMode ? (
            <ExerciseFooter
              onHint={handleHint}
              onExplain={handleExplainLastError}
              hintsUsed={aiHintsUsed}
              hintsCapReached={aiHintsCapReached}
              hintsRemaining={remainingFromServer}
              hasError={Boolean(lastError)}
              sending={sending}
              pendingKind={pendingKind}
            />
          ) : null}

          {isSandboxMode ? (
            <NLForm
              value={inputDraft}
              onChange={setInputDraft}
              onSubmit={handleNLSubmit}
              sending={sending}
            />
          ) : null}
        </footer>
      </aside>
    </div>,
    document.body,
  );
}

function DrawerHeader({
  context,
  onClose,
  onReset,
}: {
  context: { kind: "exercise" | "sandbox"; exerciseTitle?: string };
  onClose: () => void;
  onReset?: () => void;
}) {
  const subline =
    context.kind === "exercise" && context.exerciseTitle
      ? context.exerciseTitle
      : context.kind === "sandbox"
        ? "Free sandbox"
        : "";

  return (
    <header className="mentor-drawer__header">
      <div className="mentor-drawer__identity">
        <MentorMark />
        <div>
          <p className="mentor-drawer__eyebrow">{STRINGS.MENTOR.EYEBROW}</p>
          <h2 id="mentor-drawer-heading" className="mentor-drawer__heading">
            {STRINGS.MENTOR.HEADING}
          </h2>
          {subline ? (
            <p className="mentor-drawer__subline" title={subline}>
              {subline}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mentor-drawer__header-actions">
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="mentor-drawer__reset"
            aria-label={STRINGS.MENTOR.RESET}
            title={STRINGS.MENTOR.RESET}
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
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="mentor-drawer__close"
          aria-label={STRINGS.MENTOR.CLOSE}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="m4 4 8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

function MentorMark() {
  return (
    <span className="mentor-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36" width="32" height="32">
        <defs>
          <radialGradient id="mentorMarkBg" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#F6E6D6" />
            <stop offset="65%" stopColor="#E8C7B6" />
            <stop offset="100%" stopColor="#B999A4" />
          </radialGradient>
        </defs>
        <path
          d="M18 2C9 2 2 8.5 2 16.6c0 4.6 2.4 8.7 6.3 11.4l-1.3 5.6c-.2.9.7 1.6 1.5 1.2l5-2.6c1.4.3 2.9.5 4.5.5 9 0 16-6.5 16-14.6S27 2 18 2Z"
          fill="url(#mentorMarkBg)"
          stroke="#463C33"
          strokeWidth="0.6"
          strokeOpacity="0.18"
        />
        {/* Spark — three offset dots evoking a tutor's small thought pattern */}
        <circle cx="11.5" cy="17" r="1.5" fill="#3E5570" />
        <circle cx="18" cy="17" r="1.5" fill="#3E5570" />
        <circle cx="24.5" cy="17" r="1.5" fill="#3E5570" />
      </svg>
    </span>
  );
}

function EmptyState({ mode }: { mode: "exercise" | "sandbox" }) {
  return (
    <div className="mentor-empty">
      <div className="mentor-empty__visual" aria-hidden="true">
        <svg viewBox="0 0 120 88" width="120" height="88">
          <defs>
            <linearGradient id="mEmptyA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3E5570" />
              <stop offset="100%" stopColor="#5A7796" />
            </linearGradient>
          </defs>
          <rect x="14" y="18" width="64" height="42" rx="6" fill="#FFFDF8" stroke="#E2DAC2" />
          <path
            d="M22 30h48M22 38h36M22 46h28"
            stroke="#B999A4"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />
          <circle cx="92" cy="58" r="18" fill="url(#mEmptyA)" opacity="0.95" />
          <path
            d="M84 56h16M84 60h12M84 64h8"
            stroke="#F5F1E5"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="mentor-empty__title">{STRINGS.MENTOR.EMPTY_TITLE}</p>
      <p className="mentor-empty__body">{STRINGS.MENTOR.EMPTY_BODY}</p>
      {mode === "exercise" ? (
        <p className="mentor-empty__hint">{STRINGS.MENTOR.EMPTY_HINT_TIP}</p>
      ) : null}
    </div>
  );
}

function MessageBubble({
  message,
  onInsertSql,
}: {
  message: MentorMessage;
  onInsertSql?: (sql: string) => void;
}) {
  const isUser = message.role === "user";
  const html = useMemo(
    () => (isUser ? null : renderMentorMarkdown(message.content)),
    [isUser, message.content],
  );
  const sqlBlock = useMemo(
    () => (isUser ? null : extractFirstSqlBlock(message.content)),
    [isUser, message.content],
  );
  const [inserted, setInserted] = useState(false);

  const handleInsert = useCallback(() => {
    if (!sqlBlock || !onInsertSql) return;
    onInsertSql(sqlBlock);
    setInserted(true);
    window.setTimeout(() => setInserted(false), 1600);
  }, [onInsertSql, sqlBlock]);

  if (isUser) {
    return (
      <li className="mentor-bubble mentor-bubble--user">
        <span className="mentor-bubble__role">{STRINGS.MENTOR.USER_LABEL}</span>
        <div className="mentor-bubble__body">
          <p>{message.content}</p>
        </div>
      </li>
    );
  }

  return (
    <li
      className="mentor-bubble mentor-bubble--mentor"
      data-unavailable={message.unavailable ? "true" : undefined}
    >
      <span className="mentor-bubble__role">
        {STRINGS.MENTOR.MENTOR_LABEL}
        {message.kind === "hint" && message.hintLevel ? (
          <span className="mentor-bubble__role-meta">
            · Hint {message.hintLevel}
          </span>
        ) : null}
      </span>
      <div
        className="mentor-bubble__body mentor-md"
        dangerouslySetInnerHTML={{ __html: html ?? "" }}
      />
      {message.unavailable && message.outcome ? (
        <p className="mentor-bubble__outcome">{outcomeLabel(message.outcome)}</p>
      ) : null}
      {sqlBlock && onInsertSql && !message.unavailable ? (
        <div className="mentor-bubble__actions">
          <button
            type="button"
            onClick={handleInsert}
            className="mentor-bubble__insert"
            data-state={inserted ? "inserted" : "idle"}
          >
            {inserted ? (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="m4 8 3 3 5-7"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {STRINGS.MENTOR.INSERTED}
              </>
            ) : (
              <>
                {STRINGS.MENTOR.INSERT_INTO_EDITOR}
                <span aria-hidden="true">↵</span>
              </>
            )}
          </button>
        </div>
      ) : null}
    </li>
  );
}

function PendingBubble({ kind }: { kind: MentorRequestKind | null }) {
  const label =
    kind === "explain"
      ? STRINGS.MENTOR.EXPLAIN_PENDING
      : kind === "hint"
        ? STRINGS.MENTOR.HINT_PENDING
        : STRINGS.MENTOR.NL_SEND_PENDING;
  return (
    <li className="mentor-bubble mentor-bubble--mentor mentor-bubble--pending">
      <span className="mentor-bubble__role">{STRINGS.MENTOR.MENTOR_LABEL}</span>
      <div className="mentor-bubble__body mentor-bubble__body--pending">
        <span className="mentor-typing" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>{label}</span>
      </div>
    </li>
  );
}

function ExerciseFooter({
  onHint,
  onExplain,
  hintsUsed,
  hintsCapReached,
  hintsRemaining,
  hasError,
  sending,
  pendingKind,
}: {
  onHint: () => void;
  onExplain: () => void;
  hintsUsed: number;
  hintsCapReached: boolean;
  hintsRemaining: number;
  hasError: boolean;
  sending: boolean;
  pendingKind: MentorRequestKind | null;
}) {
  const hintLabel =
    hintsUsed === 0
      ? STRINGS.MENTOR.HINT_BUTTON_FIRST
      : STRINGS.MENTOR.HINT_BUTTON_NEXT;

  return (
    <div className="mentor-footer">
      <div className="mentor-footer__counter">
        <span className="mentor-footer__counter-pip">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="mentor-footer__pip"
              data-used={i < hintsUsed ? "true" : undefined}
            />
          ))}
        </span>
        <span className="mentor-footer__counter-label">
          {hintsCapReached
            ? STRINGS.MENTOR.HINT_CAP_REACHED
            : STRINGS.MENTOR.HINT_COUNTER(
                Math.min(hintsUsed + 1, MAX_HINTS),
                MAX_HINTS,
              )}
        </span>
        {!hintsCapReached ? (
          <span className="mentor-footer__counter-meta">
            {STRINGS.MENTOR.HINT_REMAINING(hintsRemaining)}
          </span>
        ) : null}
      </div>

      <div className="mentor-footer__actions">
        <button
          type="button"
          onClick={onHint}
          disabled={sending || hintsCapReached}
          className="mentor-footer__primary"
          data-autofocus={!hintsCapReached && !hasError ? "true" : undefined}
        >
          {sending && pendingKind === "hint"
            ? STRINGS.MENTOR.HINT_PENDING
            : hintLabel}
          <span aria-hidden="true" className="mentor-footer__primary-arrow">
            →
          </span>
        </button>
        {hasError ? (
          <button
            type="button"
            onClick={onExplain}
            disabled={sending}
            className="mentor-footer__secondary"
            data-autofocus="true"
          >
            {sending && pendingKind === "explain"
              ? STRINGS.MENTOR.EXPLAIN_PENDING
              : STRINGS.MENTOR.EXPLAIN_FROM_BANNER}
          </button>
        ) : null}
      </div>

      {hintsCapReached ? (
        <p className="mentor-footer__helper">
          {STRINGS.MENTOR.HINT_CAP_HELPER}
        </p>
      ) : null}
    </div>
  );
}

function NLForm({
  value,
  onChange,
  onSubmit,
  sending,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  sending: boolean;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form className="mentor-nl" onSubmit={onSubmit}>
      <label htmlFor="mentor-nl-input" className="mentor-nl__label">
        {STRINGS.MENTOR.NL_INPUT_LABEL}
      </label>
      <textarea
        id="mentor-nl-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={STRINGS.MENTOR.NL_INPUT_PLACEHOLDER}
        rows={3}
        className="mentor-nl__input"
        data-autofocus="true"
        disabled={sending}
      />
      <div className="mentor-nl__actions">
        <span className="mentor-nl__shortcut" aria-hidden="true">
          <kbd>⌘</kbd> <kbd>↵</kbd>
        </span>
        <button
          type="submit"
          disabled={sending || value.trim().length === 0}
          className="mentor-footer__primary"
        >
          {sending ? STRINGS.MENTOR.NL_SEND_PENDING : STRINGS.MENTOR.NL_SEND}
          <span aria-hidden="true" className="mentor-footer__primary-arrow">
            →
          </span>
        </button>
      </div>
    </form>
  );
}

function outcomeLabel(outcome: NonNullable<MentorMessage["outcome"]>): string {
  switch (outcome) {
    case "rate_limited":
      return STRINGS.MENTOR.OUTCOME_RATE_LIMITED;
    case "hint_cap_reached":
      return STRINGS.MENTOR.OUTCOME_HINT_CAP;
    case "gemini_error":
      return STRINGS.MENTOR.OUTCOME_GEMINI_ERROR;
    case "timeout":
      return STRINGS.MENTOR.OUTCOME_TIMEOUT;
    case "invalid_input":
      return STRINGS.MENTOR.OUTCOME_INVALID;
    default:
      return STRINGS.MENTOR.OFFLINE_TITLE;
  }
}
