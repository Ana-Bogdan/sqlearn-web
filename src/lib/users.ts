import { api } from "./api";
import type { User } from "@/stores/auth-store";

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export function updateProfileRequest(payload: UpdateProfilePayload) {
  return api<User>("/users/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function changePasswordRequest(payload: ChangePasswordPayload) {
  return api<void>("/users/me/password/", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
