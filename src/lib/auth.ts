import { api } from "./api";
import type { User } from "@/stores/auth-store";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  uid: string;
  token: string;
  new_password: string;
}

interface AuthResponse {
  user: User;
}

export function ensureCsrfCookie() {
  return api<{ detail: string }>("/auth/csrf/");
}

export function meRequest() {
  return api<User>("/auth/me/");
}

export function loginRequest(payload: LoginPayload) {
  return api<AuthResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerRequest(payload: RegisterPayload) {
  return api<AuthResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutRequest() {
  return api<void>("/auth/logout/", { method: "POST" });
}

export function forgotPasswordRequest(payload: ForgotPasswordPayload) {
  return api<void>("/auth/password-reset/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resetPasswordRequest(payload: ResetPasswordPayload) {
  return api<void>("/auth/password-reset/confirm/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type FieldErrors = Record<string, string>;

interface DrfErrorBody {
  detail?: string;
  [field: string]: unknown;
}

export function parseApiError(body: unknown): {
  formError: string | null;
  fieldErrors: FieldErrors;
} {
  const fieldErrors: FieldErrors = {};
  let formError: string | null = null;

  if (body && typeof body === "object") {
    const drf = body as DrfErrorBody;
    if (typeof drf.detail === "string") formError = drf.detail;

    for (const [key, value] of Object.entries(drf)) {
      if (key === "detail") continue;
      const message = Array.isArray(value)
        ? value.map(String).join(" ")
        : typeof value === "string"
          ? value
          : null;
      if (message) {
        if (key === "non_field_errors") {
          formError = message;
        } else {
          fieldErrors[key] = message;
        }
      }
    }
  }

  return { formError, fieldErrors };
}
