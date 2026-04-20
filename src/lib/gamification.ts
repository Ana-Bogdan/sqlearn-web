import { api } from "./api";

export type BadgeCategory = "milestone" | "skill" | "streak" | "fun";

export interface Badge {
  id: number;
  trigger_type: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
}

export interface BadgeWithStatus extends Badge {
  earned: boolean;
  awarded_at: string | null;
}

export interface UserBadge {
  badge: Badge;
  awarded_at: string;
}

export interface ProgressSummary {
  xp: number;
  level: number;
  level_title: string;
  level_start_xp: number;
  next_level_xp: number | null;
  current_streak: number;
  longest_streak: number;
  total_chapters: number;
  completed_chapters: number;
  total_lessons: number;
  completed_lessons: number;
  total_exercises: number;
  completed_exercises: number;
  badges_earned: number;
  total_badges: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  first_name: string;
  last_name: string;
  level: number;
  xp: number;
  badge_count: number;
}

export interface LeaderboardResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LeaderboardEntry[];
  current_user: LeaderboardEntry;
}

export interface PublicProfile {
  id: string;
  first_name: string;
  last_name: string;
  level: number;
  level_title: string;
  xp: number;
  current_streak: number;
  longest_streak: number;
  exercises_completed: number;
  badges_earned: number;
  next_level_xp: number | null;
  badges: UserBadge[];
}

export interface XpBreakdownLine {
  label: string;
  amount: number;
}

export interface GamificationResult {
  xp_earned: number;
  xp_breakdown: XpBreakdownLine[];
  total_xp: number;
  level: number;
  level_title: string;
  level_up: boolean;
  previous_level: number;
  next_level_xp: number | null;
  current_streak: number;
  longest_streak: number;
  streak_updated: boolean;
  badges_earned: Badge[];
}

export function fetchMyProgress() {
  return api<ProgressSummary>("/users/me/progress/");
}

export function fetchLeaderboard(page = 1) {
  const qs = page > 1 ? `?page=${page}` : "";
  return api<LeaderboardResponse>(`/leaderboard/${qs}`);
}

export function fetchPublicProfile(userId: string) {
  return api<PublicProfile>(`/users/${userId}/profile/`);
}

export function fetchBadges() {
  return api<BadgeWithStatus[]>("/badges/");
}

export function levelProgressPercent(
  xp: number,
  levelStartXp: number,
  nextLevelXp: number | null,
): number {
  if (nextLevelXp === null || nextLevelXp <= levelStartXp) return 100;
  const span = nextLevelXp - levelStartXp;
  const progressed = xp - levelStartXp;
  const ratio = progressed / span;
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

export function xpToNextLevel(
  xp: number,
  nextLevelXp: number | null,
): number | null {
  if (nextLevelXp === null) return null;
  return Math.max(0, nextLevelXp - xp);
}

export function fullName(first: string, last: string): string {
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name || "Learner";
}

export function initials(first: string, last: string): string {
  const a = (first || "").trim().charAt(0);
  const b = (last || "").trim().charAt(0);
  return (a + b).toUpperCase() || "??";
}
