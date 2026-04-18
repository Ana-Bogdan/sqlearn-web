"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { parseApiError, type FieldErrors } from "@/lib/auth";
import { STRINGS } from "@/lib/constants";
import { PASSWORD_HINT, validatePassword } from "@/lib/password";
import { useAuthStore } from "@/stores/auth-store";
import { AuthSubmitButton } from "./auth-submit-button";
import { FormAlert } from "./form-alert";
import { FormField } from "./form-field";

export function RegisterForm() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const data = new FormData(event.currentTarget);
    const first_name = String(data.get("first_name") ?? "").trim();
    const last_name = String(data.get("last_name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const nextErrors: FieldErrors = {};
    if (!first_name) nextErrors.first_name = STRINGS.REGISTER.ERRORS.FIRST_NAME_REQUIRED;
    if (!last_name) nextErrors.last_name = STRINGS.REGISTER.ERRORS.LAST_NAME_REQUIRED;
    if (!email) nextErrors.email = STRINGS.REGISTER.ERRORS.EMAIL_REQUIRED;
    if (!password) {
      nextErrors.password = STRINGS.REGISTER.ERRORS.PASSWORD_REQUIRED;
    } else {
      const complexityError = validatePassword(password);
      if (complexityError) nextErrors.password = complexityError;
    }
    if (Object.keys(nextErrors).length > 0) {
      setFormError(null);
      setFieldErrors(nextErrors);
      return;
    }

    setFormError(null);
    setFieldErrors({});
    setPending(true);

    try {
      await register({ email, password, first_name, last_name });
      router.replace("/dashboard");
    } catch (error) {
      const body = error instanceof ApiError ? error.body : null;
      const parsed = parseApiError(body);
      setFormError(parsed.formError ?? STRINGS.REGISTER.ERRORS.FALLBACK);
      setFieldErrors(parsed.fieldErrors);
      setPending(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="animate-fade-up mt-10 space-y-4"
      style={{ animationDelay: "220ms" }}
    >
      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <div className="flex gap-3">
        <div className="flex-1">
          <FormField
            label={STRINGS.REGISTER.FIRST_NAME_LABEL}
            name="first_name"
            autoComplete="given-name"
            required
            placeholder={STRINGS.REGISTER.FIRST_NAME_PLACEHOLDER}
            error={fieldErrors.first_name}
          />
        </div>
        <div className="flex-1">
          <FormField
            label={STRINGS.REGISTER.LAST_NAME_LABEL}
            name="last_name"
            autoComplete="family-name"
            required
            placeholder={STRINGS.REGISTER.LAST_NAME_PLACEHOLDER}
            error={fieldErrors.last_name}
          />
        </div>
      </div>

      <FormField
        label={STRINGS.REGISTER.EMAIL_LABEL}
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder={STRINGS.REGISTER.EMAIL_PLACEHOLDER}
        error={fieldErrors.email}
      />

      <FormField
        label={STRINGS.REGISTER.PASSWORD_LABEL}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder={STRINGS.REGISTER.PASSWORD_PLACEHOLDER}
        hint={PASSWORD_HINT}
        error={fieldErrors.password}
      />

      <AuthSubmitButton pending={pending} pendingLabel={STRINGS.REGISTER.SUBMIT_PENDING}>
        {STRINGS.REGISTER.SUBMIT}
      </AuthSubmitButton>
    </form>
  );
}
