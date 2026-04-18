"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  forgotPasswordRequest,
  parseApiError,
  type FieldErrors,
} from "@/lib/auth";
import { STRINGS } from "@/lib/constants";
import { AuthSubmitButton } from "./auth-submit-button";
import { FormAlert } from "./form-alert";
import { FormField } from "./form-field";

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();

    if (!email) {
      setFormError(null);
      setFieldErrors({ email: STRINGS.FORGOT_PASSWORD.ERRORS.EMAIL_REQUIRED });
      return;
    }

    setFormError(null);
    setFieldErrors({});
    setPending(true);

    try {
      await forgotPasswordRequest({ email });
      setSubmitted(true);
    } catch (error) {
      const body = error instanceof ApiError ? error.body : null;
      const parsed = parseApiError(body);
      setFormError(parsed.formError ?? STRINGS.FORGOT_PASSWORD.ERRORS.FALLBACK);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="animate-fade-up mt-10"
        style={{ animationDelay: "220ms" }}
      >
        <FormAlert tone="success">{STRINGS.FORGOT_PASSWORD.SUCCESS}</FormAlert>
      </div>
    );
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
        label={STRINGS.FORGOT_PASSWORD.EMAIL_LABEL}
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder={STRINGS.FORGOT_PASSWORD.EMAIL_PLACEHOLDER}
        error={fieldErrors.email}
      />

      <AuthSubmitButton
        pending={pending}
        pendingLabel={STRINGS.FORGOT_PASSWORD.SUBMIT_PENDING}
      >
        {STRINGS.FORGOT_PASSWORD.SUBMIT}
      </AuthSubmitButton>
    </form>
  );
}
