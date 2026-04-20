import { api } from "./api";
import type { Difficulty, ExerciseStatus } from "./curriculum";
import type { GamificationResult } from "./gamification";

export interface ExerciseDetail {
  id: number;
  chapter_id: number;
  lesson_id: number | null;
  title: string;
  instructions: string;
  difficulty: Difficulty;
  starter_code: string;
  is_chapter_quiz: boolean;
  order: number;
  user_status: ExerciseStatus;
  hint_count: number;
}

export interface ExerciseHint {
  id: number;
  order: number;
  hint_text: string;
}

export interface QueryResultSet {
  columns: string[];
  rows: Array<Array<string | number | boolean | null>>;
}

export type SubmissionStatus =
  | "correct"
  | "incorrect"
  | "syntax_error"
  | "execution_error"
  | "timeout"
  | "forbidden";

export type IncorrectReason =
  | "columns_mismatch"
  | "row_count_mismatch"
  | "rows_mismatch"
  | null;

export interface SubmissionOutcome {
  status: SubmissionStatus;
  message: string;
  result?: QueryResultSet;
  expected?: QueryResultSet;
  reason?: IncorrectReason;
  user_status: ExerciseStatus;
  was_first_attempt: boolean;
  submission_count: number;
  gamification: GamificationResult | null;
}

export function fetchExercise(id: number | string) {
  return api<ExerciseDetail>(`/exercises/${id}/`);
}

export function fetchExerciseHints(id: number | string) {
  return api<ExerciseHint[]>(`/exercises/${id}/hints/`);
}

export function submitExerciseQuery(id: number | string, sqlText: string) {
  return api<SubmissionOutcome>(`/exercises/${id}/submit/`, {
    method: "POST",
    body: JSON.stringify({ sql_text: sqlText }),
  });
}
