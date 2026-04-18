"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { parseApiError, type FieldErrors } from "@/lib/auth";
import { STRINGS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { AuthSubmitButton } from "./auth-submit-button";
import { FormAlert } from "./form-alert";
import { FormField } from "./form-field";

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const nextErrors: FieldErrors = {};
    if (!email) nextErrors.email = STRINGS.LOGIN.ERRORS.EMAIL_REQUIRED;
    if (!password) nextErrors.password = STRINGS.LOGIN.ERRORS.PASSWORD_REQUIRED;
    if (Object.keys(nextErrors).length > 0) {
      setFormError(null);
      setFieldErrors(nextErrors);
      return;
    }

    setFormError(null);
    setFieldErrors({});
    setPending(true);

    try {
      await login({ email, password });
      router.replace("/dashboard");
    } catch (error) {
      const body = error instanceof ApiError ? error.body : null;
      const parsed = parseApiError(body);
      setFormError(parsed.formError ?? STRINGS.LOGIN.ERRORS.FALLBACK);
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

      <FormField
        label={STRINGS.LOGIN.EMAIL_LABEL}
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder={STRINGS.LOGIN.EMAIL_PLACEHOLDER}
        error={fieldErrors.email}
      />

      <FormField
        label={STRINGS.LOGIN.PASSWORD_LABEL}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder={STRINGS.LOGIN.PASSWORD_PLACEHOLDER}
        error={fieldErrors.password}
      />

      <div className="flex justify-end pt-0.5">
        <Link
          href="/forgot-password"
          className="text-[0.8125rem] font-medium text-dusk underline-offset-4 hover:underline"
        >
          {STRINGS.LOGIN.FORGOT_LINK}
        </Link>
      </div>

      <AuthSubmitButton pending={pending} pendingLabel={STRINGS.LOGIN.SUBMIT_PENDING}>
        {STRINGS.LOGIN.SUBMIT}
      </AuthSubmitButton>
    </form>
  );
}
