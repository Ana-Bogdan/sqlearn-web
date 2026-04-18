import { create } from "zustand";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/auth";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "learner" | "admin";
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
}

type Status = "idle" | "pending" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: Status;

  fetchUser: () => Promise<User | null>;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",

  async fetchUser() {
    set({ status: "pending" });
    try {
      const user = await meRequest();
      set({ user, status: "authenticated" });
      return user;
    } catch {
      set({ user: null, status: "unauthenticated" });
      return null;
    }
  },

  async login(payload) {
    const { user } = await loginRequest(payload);
    set({ user, status: "authenticated" });
    return user;
  },

  async register(payload) {
    const { user } = await registerRequest(payload);
    set({ user, status: "authenticated" });
    return user;
  },

  async logout() {
    try {
      await logoutRequest();
    } finally {
      set({ user: null, status: "unauthenticated" });
    }
  },
}));
