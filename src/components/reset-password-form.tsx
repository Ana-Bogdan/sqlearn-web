"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  parseApiError,
  resetPasswordRequest,
  type FieldErrors,
} from "@/lib/auth";
import { STRINGS } from "@/lib/constants";
import { PASSWORD_HINT, validatePassword } from "@/lib/password";
import { AuthSubmitButton } from "./auth-submit-button";
import { FormAlert } from "./form-alert";
import { FormField } from "./form-field";

interface ResetPasswordFormProps {
  uid: string;
  token: string;
}

export function ResetPasswordForm({ uid, token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const data = new FormData(event.currentTarget);
    const password = String(data.get("new_password") ?? "");
    const confirm = String(data.get("confirm_password") ?? "");

    const nextErrors: FieldErrors = {};
    if (!password) {
      nextErrors.new_password = STRINGS.RESET_PASSWORD.ERRORS.PASSWORD_REQUIRED;
    } else {
      const complexityError = validatePassword(password);
      if (complexityError) nextErrors.new_password = complexityError;
    }
    if (!nextErrors.new_password && confirm !== password) {
      nextErrors.confirm_password = STRINGS.RESET_PASSWORD.ERRORS.PASSWORD_MISMATCH;
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
      await resetPasswordRequest({ uid, token, new_password: password });
      setDone(true);
    } catch (error) {
      const body = error instanceof ApiError ? error.body : null;
      const parsed = parseApiError(body);
      const fieldMap: FieldErrors = {};
      if (parsed.fieldErrors.new_password) {
        fieldMap.new_password = parsed.fieldErrors.new_password;
      }
      const linkError =
        parsed.fieldErrors.uid ?? parsed.fieldErrors.token ?? null;
      setFormError(
        linkError ??
          parsed.formError ??
          STRINGS.RESET_PASSWORD.ERRORS.FALLBACK
      );
      setFieldErrors(fieldMap);
      setPending(false);
    }
  }

  if (done) {
    return (
      <div
        className="animate-fade-up mt-10 space-y-4"
        style={{ animationDelay: "220ms" }}
      >
        <FormAlert tone="success">{STRINGS.RESET_PASSWORD.SUCCESS}</FormAlert>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="shadow-dusk shadow-dusk-hover inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-dusk px-5 text-[0.9375rem] font-semibold tracking-[-0.005em] text-primary-foreground transition-all duration-300 ease-out hover:-translate-y-[1px] hover:bg-dusk/95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-dusk/30"
        >
          {STRINGS.RESET_PASSWORD.BACK_TO_LOGIN}
        </button>
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
      {formError ? (
        <FormAlert>
          {formError}
          {formError.toLowerCase().includes("invalid") ||
          formError.toLowerCase().includes("expired") ? (
            <>
              {" "}
              <Link
                href="/forgot-password"
                className="font-semibold underline underline-offset-2"
              >
                {STRINGS.RESET_PASSWORD.REQUEST_NEW_LINK}
              </Link>
            </>
          ) : null}
        </FormAlert>
      ) : null}

      <FormField
        label={STRINGS.RESET_PASSWORD.NEW_PASSWORD_LABEL}
        name="new_password"
        type="password"
        autoComplete="new-password"
        required
        placeholder={STRINGS.RESET_PASSWORD.NEW_PASSWORD_PLACEHOLDER}
        hint={PASSWORD_HINT}
        error={fieldErrors.new_password}
      />

      <FormField
        label={STRINGS.RESET_PASSWORD.CONFIRM_PASSWORD_LABEL}
        name="confirm_password"
        type="password"
        autoComplete="new-password"
        required
        placeholder={STRINGS.RESET_PASSWORD.CONFIRM_PASSWORD_PLACEHOLDER}
        error={fieldErrors.confirm_password}
      />

      <AuthSubmitButton
        pending={pending}
        pendingLabel={STRINGS.RESET_PASSWORD.SUBMIT_PENDING}
      >
        {STRINGS.RESET_PASSWORD.SUBMIT}
      </AuthSubmitButton>
    </form>
  );
}
