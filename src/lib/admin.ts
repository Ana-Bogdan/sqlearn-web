import { api } from "./api";
import type { Badge, BadgeCategory } from "./gamification";

export interface AdminStatsExerciseRow {
  id: number;
  title: string;
  chapter_id: number;
  lesson_id: number | null;
  attempts: number;
  failures: number;
  fail_rate: number;
}

export interface AdminStats {
  total_users: number;
  active_today: number;
  active_this_week: number;
  new_registrations_this_week: number;
  avg_exercises_per_user: number;
  highest_fail_rate_exercises: AdminStatsExerciseRow[];
  most_attempted_exercises: AdminStatsExerciseRow[];
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "learner" | "admin";
  is_active: boolean;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export type AdminBadge = Badge;

export interface AdminUserFilters {
  search?: string;
  is_active?: "true" | "false" | "";
  role?: "learner" | "admin" | "";
  page?: number;
  page_size?: number;
}

export function fetchAdminStats() {
  return api<AdminStats>("/admin/stats/");
}

export function fetchAdminUsers(filters: AdminUserFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.is_active) params.set("is_active", filters.is_active);
  if (filters.role) params.set("role", filters.role);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  const qs = params.toString();
  return api<AdminUserListResponse>(`/admin/users/${qs ? `?${qs}` : ""}`);
}

export function patchAdminUser(id: string, payload: { is_active: boolean }) {
  return api<AdminUser>(`/admin/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchAdminBadges() {
  return api<AdminBadge[]>("/admin/badges/");
}

export function patchAdminBadge(
  id: number,
  payload: { name: string; description: string; icon: string },
) {
  return api<AdminBadge>(`/admin/badges/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export const BADGE_CATEGORY_ORDER: BadgeCategory[] = [
  "milestone",
  "skill",
  "streak",
  "fun",
];
