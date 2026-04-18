import { api } from "./api";

export type Difficulty = "easy" | "medium" | "hard";
export type ExerciseStatus = "not_started" | "attempted" | "completed";

export interface ChapterListItem {
  id: number;
  title: string;
  description: string;
  order: number;
  total_exercises: number;
  completed_exercises: number;
  completion_percent: number;
}

export interface LessonListItem {
  id: number;
  chapter_id: number;
  title: string;
  order: number;
  total_exercises: number;
  completed_exercises: number;
  is_completed: boolean;
}

export interface ExerciseSummary {
  id: number;
  title: string;
  difficulty: Difficulty;
  order: number;
  is_chapter_quiz: boolean;
  user_status: ExerciseStatus;
}

export interface ChapterDetail extends ChapterListItem {
  lessons: LessonListItem[];
  chapter_quizzes: ExerciseSummary[];
}

export interface LessonDetail extends LessonListItem {
  theory_content: string;
  description: string;
  exercises: ExerciseSummary[];
}

export function fetchChapters() {
  return api<ChapterListItem[]>("/chapters/");
}

export function fetchChapter(id: number | string) {
  return api<ChapterDetail>(`/chapters/${id}/`);
}

export function fetchLesson(id: number | string) {
  return api<LessonDetail>(`/lessons/${id}/`);
}

export function pickResumeLesson(lessons: LessonListItem[]): LessonListItem | null {
  if (lessons.length === 0) return null;
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const firstIncomplete = sorted.find((l) => !l.is_completed);
  return firstIncomplete ?? sorted[sorted.length - 1];
}
