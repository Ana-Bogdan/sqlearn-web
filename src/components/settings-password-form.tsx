"use client";

import { useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { parseApiError, type FieldErrors } from "@/lib/auth";
import { STRINGS } from "@/lib/constants";
import { PASSWORD_HINT, validatePassword } from "@/lib/password";
import { changePasswordRequest } from "@/lib/users";
import { AuthSubmitButton } from "./auth-submit-button";
import { FormAlert } from "./form-alert";
import { FormField } from "./form-field";

export function SettingsPasswordForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const data = new FormData(event.currentTarget);
    const current = String(data.get("current_password") ?? "");
    const next = String(data.get("new_password") ?? "");
    const confirm = String(data.get("confirm_password") ?? "");

    const nextErrors: FieldErrors = {};
    if (!current)
      nextErrors.current_password = STRINGS.SETTINGS.PASSWORD.ERRORS.CURRENT_REQUIRED;
    if (!next) {
      nextErrors.new_password = STRINGS.SETTINGS.PASSWORD.ERRORS.NEW_REQUIRED;
    } else {
      const complexity = validatePassword(next);
      if (complexity) nextErrors.new_password = complexity;
    }
    if (!nextErrors.new_password && next !== confirm) {
      nextErrors.confirm_password = STRINGS.SETTINGS.PASSWORD.ERRORS.MISMATCH;
    }
    if (Object.keys(nextErrors).length) {
      setFormError(null);
      setSuccess(null);
      setFieldErrors(nextErrors);
      return;
    }

    setFormError(null);
    setSuccess(null);
    setFieldErrors({});
    setPending(true);

    try {
      await changePasswordRequest({
        current_password: current,
        new_password: next,
      });
      setSuccess(STRINGS.SETTINGS.PASSWORD.SUCCESS);
      formRef.current?.reset();
    } catch (error) {
      const body = error instanceof ApiError ? error.body : null;
      const parsed = parseApiError(body);
      setFormError(parsed.formError ?? STRINGS.SETTINGS.PASSWORD.ERRORS.FALLBACK);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      ref={formRef}
      className="settings-form"
    >
      {formError ? <FormAlert>{formError}</FormAlert> : null}
      {success ? <FormAlert tone="success">{success}</FormAlert> : null}

      <FormField
        label={STRINGS.SETTINGS.PASSWORD.CURRENT_LABEL}
        name="current_password"
        type="password"
        autoComplete="current-password"
        placeholder={STRINGS.SETTINGS.PASSWORD.CURRENT_PLACEHOLDER}
        error={fieldErrors.current_password}
        required
      />

      <div className="settings-form__row">
        <FormField
          label={STRINGS.SETTINGS.PASSWORD.NEW_LABEL}
          name="new_password"
          type="password"
          autoComplete="new-password"
          placeholder={STRINGS.SETTINGS.PASSWORD.NEW_PLACEHOLDER}
          hint={PASSWORD_HINT}
          error={fieldErrors.new_password}
          required
        />
        <FormField
          label={STRINGS.SETTINGS.PASSWORD.CONFIRM_LABEL}
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          placeholder={STRINGS.SETTINGS.PASSWORD.CONFIRM_PLACEHOLDER}
          error={fieldErrors.confirm_password}
          required
        />
      </div>

      <div className="settings-form__actions">
        <AuthSubmitButton
          pending={pending}
          pendingLabel={STRINGS.SETTINGS.PASSWORD.SUBMIT_PENDING}
          className="settings-form__submit"
        >
          {STRINGS.SETTINGS.PASSWORD.SUBMIT}
        </AuthSubmitButton>
      </div>
    </form>
  );
}
