import { api } from "./api";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type MentorOutcome =
  | "rate_limited"
  | "hint_cap_reached"
  | "gemini_error"
  | "timeout"
  | "invalid_input";

export interface MentorResponse {
  available: boolean;
  message: string;
  prompt_tokens?: number;
  response_tokens?: number;
  latency_ms?: number;
  hint_level?: number;
  hints_remaining?: number;
  outcome?: MentorOutcome;
  retry_after_seconds?: number;
}

interface BaseRequest {
  history?: ChatMessage[];
}

export interface ExplainErrorRequest extends BaseRequest {
  exercise_id: number;
  sql_text: string;
  error_message: string;
}

export interface HintRequest extends BaseRequest {
  exercise_id: number;
  sql_text?: string;
}

export interface NLToSQLRequest extends BaseRequest {
  natural_language: string;
  exercise_id?: number | null;
}

export function explainErrorRequest(payload: ExplainErrorRequest) {
  return api<MentorResponse>("/mentor/explain-error/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function hintRequest(payload: HintRequest) {
  return api<MentorResponse>("/mentor/hint/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function nlToSqlRequest(payload: NLToSQLRequest) {
  return api<MentorResponse>("/mentor/nl-to-sql/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
