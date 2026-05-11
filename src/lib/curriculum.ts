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
  is_locked: boolean;
}

export interface ExerciseSummary {
  id: number;
  title: string;
  difficulty: Difficulty;
  order: number;
  is_chapter_quiz: boolean;
  user_status: ExerciseStatus;
  is_locked: boolean;
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
  // Skip locked lessons — they can't be resumed even if marked incomplete.
  const firstIncomplete = sorted.find((l) => !l.is_completed && !l.is_locked);
  if (firstIncomplete) return firstIncomplete;
  // No unlocked-but-incomplete lesson: fall back to the last unlocked one (so
  // the dashboard "resume" link still lands on something the learner can open).
  const reversed = [...sorted].reverse();
  const lastUnlocked = reversed.find((l) => !l.is_locked);
  return lastUnlocked ?? sorted[0];
}
