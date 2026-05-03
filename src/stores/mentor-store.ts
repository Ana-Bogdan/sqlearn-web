import { create } from "zustand";
import {
  explainErrorRequest,
  hintRequest,
  nlToSqlRequest,
  type ChatMessage,
  type MentorOutcome,
  type MentorResponse,
} from "@/lib/mentor";

export type MentorContextKind = "exercise" | "sandbox";
export type MentorMessageRole = "user" | "assistant";
export type MentorRequestKind = "explain" | "hint" | "nl-to-sql";

export interface MentorMessage {
  id: string;
  role: MentorMessageRole;
  content: string;
  kind?: MentorRequestKind;
  hintLevel?: number;
  unavailable?: boolean;
  outcome?: MentorOutcome;
  retryAfterSeconds?: number;
  createdAt: number;
}

interface MentorContext {
  kind: MentorContextKind;
  exerciseId: number | null;
  exerciseTitle?: string;
}

interface MentorState {
  isOpen: boolean;
  context: MentorContext | null;
  messages: MentorMessage[];
  hintsRemaining: number | null;
  hintsUsed: number;
  sending: boolean;
  pendingKind: MentorRequestKind | null;
  inputDraft: string;
  // Tracks the last error context, so the drawer can offer a one-click
  // "Explain this error" trigger from outside (e.g. the results panel).
  lastError: { sql: string; message: string } | null;

  openForExercise: (exerciseId: number, title?: string) => void;
  openForSandbox: () => void;
  close: () => void;
  resetThread: () => void;
  setInputDraft: (value: string) => void;
  setLastError: (err: { sql: string; message: string } | null) => void;

  sendExplainError: (params: { sql: string; errorMessage: string }) => Promise<void>;
  sendHint: (params: { sql: string }) => Promise<void>;
  sendNLToSQL: (params: { naturalLanguage: string }) => Promise<void>;
}

function makeId(): string {
  // Avoid `crypto.randomUUID` for older browsers and keep tests deterministic-ish.
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function toBackendHistory(messages: MentorMessage[]): ChatMessage[] {
  // Only forward turns the model can act on. Skip fallback/unavailable
  // assistant turns so the model isn't confused by its own error responses.
  return messages
    .filter((m) => !m.unavailable && m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));
}

function applyResponse(
  set: (partial: Partial<MentorState> | ((s: MentorState) => Partial<MentorState>)) => void,
  get: () => MentorState,
  response: MentorResponse,
  kind: MentorRequestKind,
) {
  const message: MentorMessage = {
    id: makeId(),
    role: "assistant",
    content: response.message,
    kind,
    hintLevel: response.hint_level,
    unavailable: !response.available,
    outcome: response.outcome,
    retryAfterSeconds: response.retry_after_seconds,
    createdAt: Date.now(),
  };

  set((state) => ({
    messages: [...state.messages, message],
    sending: false,
    pendingKind: null,
    hintsRemaining:
      kind === "hint"
        ? response.hints_remaining ?? state.hintsRemaining
        : state.hintsRemaining,
    hintsUsed:
      kind === "hint" && response.available
        ? state.hintsUsed + 1
        : state.hintsUsed,
  }));

  void get; // satisfy linter; reserved for future analytics tap
}

export const useMentorStore = create<MentorState>((set, get) => ({
  isOpen: false,
  context: null,
  messages: [],
  hintsRemaining: null,
  hintsUsed: 0,
  sending: false,
  pendingKind: null,
  inputDraft: "",
  lastError: null,

  openForExercise(exerciseId, title) {
    const current = get().context;
    const switchingExercise =
      current?.kind !== "exercise" || current.exerciseId !== exerciseId;

    if (switchingExercise) {
      set({
        context: { kind: "exercise", exerciseId, exerciseTitle: title },
        messages: [],
        hintsRemaining: null,
        hintsUsed: 0,
        sending: false,
        pendingKind: null,
        inputDraft: "",
        lastError: null,
      });
    }

    set({ isOpen: true });
  },

  openForSandbox() {
    const current = get().context;
    if (current?.kind !== "sandbox") {
      set({
        context: { kind: "sandbox", exerciseId: null },
        messages: [],
        hintsRemaining: null,
        hintsUsed: 0,
        sending: false,
        pendingKind: null,
        inputDraft: "",
        lastError: null,
      });
    }
    set({ isOpen: true });
  },

  close() {
    set({ isOpen: false });
  },

  resetThread() {
    set({
      messages: [],
      hintsRemaining: null,
      hintsUsed: 0,
      sending: false,
      pendingKind: null,
      inputDraft: "",
    });
  },

  setInputDraft(value) {
    set({ inputDraft: value });
  },

  setLastError(err) {
    set({ lastError: err });
  },

  async sendExplainError({ sql, errorMessage }) {
    const ctx = get().context;
    if (!ctx || ctx.kind !== "exercise" || ctx.exerciseId == null) return;
    if (get().sending) return;

    const userMsg: MentorMessage = {
      id: makeId(),
      role: "user",
      content: `Can you explain this error?\n\n${errorMessage}`,
      kind: "explain",
      createdAt: Date.now(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg],
      sending: true,
      pendingKind: "explain",
    }));

    try {
      const response = await explainErrorRequest({
        exercise_id: ctx.exerciseId,
        sql_text: sql,
        error_message: errorMessage,
        history: toBackendHistory(get().messages.slice(0, -1)),
      });
      applyResponse(set, get, response, "explain");
    } catch {
      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: makeId(),
            role: "assistant",
            content:
              "The AI Mentor is offline right now. Try the static hints, or check your connection and try again.",
            kind: "explain",
            unavailable: true,
            outcome: "gemini_error",
            createdAt: Date.now(),
          },
        ],
        sending: false,
        pendingKind: null,
      }));
    }
  },

  async sendHint({ sql }) {
    const ctx = get().context;
    if (!ctx || ctx.kind !== "exercise" || ctx.exerciseId == null) return;
    if (get().sending) return;

    const nextHintNumber = get().hintsUsed + 1;
    const userMsg: MentorMessage = {
      id: makeId(),
      role: "user",
      content: `Give me hint ${nextHintNumber}.`,
      kind: "hint",
      createdAt: Date.now(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg],
      sending: true,
      pendingKind: "hint",
    }));

    try {
      const response = await hintRequest({
        exercise_id: ctx.exerciseId,
        sql_text: sql,
        history: toBackendHistory(get().messages.slice(0, -1)),
      });
      applyResponse(set, get, response, "hint");
    } catch {
      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: makeId(),
            role: "assistant",
            content:
              "The AI Mentor is offline right now. The static hints below still work.",
            kind: "hint",
            unavailable: true,
            outcome: "gemini_error",
            createdAt: Date.now(),
          },
        ],
        sending: false,
        pendingKind: null,
      }));
    }
  },

  async sendNLToSQL({ naturalLanguage }) {
    const ctx = get().context;
    if (!ctx) return;
    if (get().sending) return;

    const userMsg: MentorMessage = {
      id: makeId(),
      role: "user",
      content: naturalLanguage,
      kind: "nl-to-sql",
      createdAt: Date.now(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg],
      sending: true,
      pendingKind: "nl-to-sql",
      inputDraft: "",
    }));

    try {
      const response = await nlToSqlRequest({
        natural_language: naturalLanguage,
        exercise_id: ctx.kind === "exercise" ? ctx.exerciseId : null,
        history: toBackendHistory(get().messages.slice(0, -1)),
      });
      applyResponse(set, get, response, "nl-to-sql");
    } catch {
      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: makeId(),
            role: "assistant",
            content:
              "The AI Mentor is offline right now. Try again in a moment.",
            kind: "nl-to-sql",
            unavailable: true,
            outcome: "gemini_error",
            createdAt: Date.now(),
          },
        ],
        sending: false,
        pendingKind: null,
      }));
    }
  },
}));
