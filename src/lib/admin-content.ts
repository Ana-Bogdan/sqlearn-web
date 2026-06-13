import { api } from "./api";
import type { Difficulty } from "./curriculum";

export interface AdminLessonSummary {
  id: number;
  title: string;
  order: number;
  is_active: boolean;
  exercise_count: number;
}

export interface AdminChapter {
  id: number;
  title: string;
  description: string;
  order: number;
  is_active: boolean;
  lesson_count: number;
  exercise_count: number;
  lessons: AdminLessonSummary[];
  created_at: string;
  updated_at: string;
}

export interface AdminExerciseSummary {
  id: number;
  title: string;
  order: number;
  difficulty: Difficulty;
  is_chapter_quiz: boolean;
  is_published: boolean;
  is_active: boolean;
}

export interface AdminLesson {
  id: number;
  chapter: number;
  chapter_title: string;
  title: string;
  theory_content: string;
  order: number;
  is_active: boolean;
  exercise_count: number;
  exercises: AdminExerciseSummary[];
  created_at: string;
  updated_at: string;
}

export interface AdminExerciseHint {
  id?: number;
  order: number;
  hint_text: string;
}

export interface AdminExerciseDatasetLink {
  id: number;
  sandbox_schema: number;
  sandbox_schema_name: string;
}

export interface AdminExpectedResult {
  columns: string[];
  rows: Array<Array<string | number | boolean | null>>;
}

export interface AdminExercise {
  id: number;
  chapter: number;
  chapter_title: string;
  lesson: number | null;
  lesson_title: string | null;
  title: string;
  instructions: string;
  difficulty: Difficulty;
  starter_code: string;
  solution_query: string;
  expected_result: AdminExpectedResult | Record<string, never>;
  is_chapter_quiz: boolean;
  is_published: boolean;
  is_active: boolean;
  order: number;
  hints: AdminExerciseHint[];
  datasets: AdminExerciseDatasetLink[];
  created_at: string;
  updated_at: string;
}

export interface AdminDataset {
  id: number;
  name: string;
  description: string;
  schema_sql: string;
  is_playground: boolean;
  exercise_count: number;
  created_at: string;
}

export interface TestSolutionResult {
  columns: string[];
  rows: Array<Array<string | number | boolean | null>>;
  rowcount: number;
}

export function fetchAdminChapters() {
  return api<AdminChapter[]>("/admin/chapters/");
}

export function fetchAdminChapter(id: number | string) {
  return api<AdminChapter>(`/admin/chapters/${id}/`);
}

export function createAdminChapter(payload: {
  title: string;
  description: string;
  order: number;
  is_active?: boolean;
}) {
  return api<AdminChapter>("/admin/chapters/", {
    method: "POST",
    body: JSON.stringify({ is_active: true, ...payload }),
  });
}

export function updateAdminChapter(
  id: number | string,
  payload: Partial<{
    title: string;
    description: string;
    order: number;
    is_active: boolean;
  }>,
) {
  return api<AdminChapter>(`/admin/chapters/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminChapter(id: number | string) {
  return api<void>(`/admin/chapters/${id}/`, { method: "DELETE" });
}

export function reorderAdminChapter(id: number | string, order: number) {
  return api<AdminChapter>(`/admin/chapters/${id}/reorder/`, {
    method: "PATCH",
    body: JSON.stringify({ order }),
  });
}

export function fetchAdminLesson(id: number | string) {
  return api<AdminLesson>(`/admin/lessons/${id}/`);
}

export function createAdminLesson(payload: {
  chapter: number;
  title: string;
  theory_content?: string;
  order: number;
  is_active?: boolean;
}) {
  return api<AdminLesson>("/admin/lessons/", {
    method: "POST",
    body: JSON.stringify({
      is_active: true,
      theory_content: "",
      ...payload,
    }),
  });
}

export function updateAdminLesson(
  id: number | string,
  payload: Partial<{
    chapter: number;
    title: string;
    theory_content: string;
    order: number;
    is_active: boolean;
  }>,
) {
  return api<AdminLesson>(`/admin/lessons/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminLesson(id: number | string) {
  return api<void>(`/admin/lessons/${id}/`, { method: "DELETE" });
}

export function fetchAdminExercise(id: number | string) {
  return api<AdminExercise>(`/admin/exercises/${id}/`);
}

export interface CreateExercisePayload {
  chapter: number;
  lesson: number | null;
  title: string;
  instructions: string;
  difficulty: Difficulty;
  starter_code?: string;
  solution_query: string;
  is_chapter_quiz?: boolean;
  is_published?: boolean;
  order?: number;
}

export function createAdminExercise(payload: CreateExercisePayload) {
  return api<AdminExercise>("/admin/exercises/", {
    method: "POST",
    body: JSON.stringify({
      starter_code: "",
      is_chapter_quiz: false,
      is_published: false,
      order: 1,
      expected_result: {},
      ...payload,
    }),
  });
}

export interface UpdateExercisePayload {
  title?: string;
  instructions?: string;
  difficulty?: Difficulty;
  starter_code?: string;
  solution_query?: string;
  expected_result?: AdminExpectedResult | Record<string, never>;
  is_chapter_quiz?: boolean;
  is_published?: boolean;
  is_active?: boolean;
  order?: number;
  hints?: AdminExerciseHint[];
  sandbox_schema_ids?: number[];
}

export function updateAdminExercise(
  id: number | string,
  payload: UpdateExercisePayload,
) {
  return api<AdminExercise>(`/admin/exercises/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminExercise(id: number | string) {
  return api<void>(`/admin/exercises/${id}/`, { method: "DELETE" });
}

export function testAdminExerciseSolution(id: number | string) {
  return api<TestSolutionResult>(`/admin/exercises/${id}/test-solution/`, {
    method: "POST",
  });
}

export function fetchAdminDatasets() {
  return api<AdminDataset[]>("/admin/datasets/");
}

export function fetchAdminDataset(id: number | string) {
  return api<AdminDataset>(`/admin/datasets/${id}/`);
}

export function createAdminDataset(payload: {
  name: string;
  description: string;
  schema_sql: string;
  is_playground?: boolean;
}) {
  return api<AdminDataset>("/admin/datasets/", {
    method: "POST",
    body: JSON.stringify({ is_playground: false, ...payload }),
  });
}

export function updateAdminDataset(
  id: number | string,
  payload: Partial<{
    name: string;
    description: string;
    schema_sql: string;
    is_playground: boolean;
  }>,
) {
  return api<AdminDataset>(`/admin/datasets/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminDataset(id: number | string) {
  return api<void>(`/admin/datasets/${id}/`, { method: "DELETE" });
}
