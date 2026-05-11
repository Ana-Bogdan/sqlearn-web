"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { parseApiError, type FieldErrors } from "@/lib/auth";
import { STRINGS } from "@/lib/constants";
import { updateProfileRequest } from "@/lib/users";
import { useAuthStore } from "@/stores/auth-store";
import { AuthSubmitButton } from "./auth-submit-button";
import { FormAlert } from "./form-alert";
import { FormField } from "./form-field";

export function SettingsProfileForm() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");

  if (!user) return null;

  const dirty =
    firstName.trim() !== user.first_name ||
    lastName.trim() !== user.last_name;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    const nextErrors: FieldErrors = {};
    if (!trimmedFirst)
      nextErrors.first_name = STRINGS.SETTINGS.PROFILE.ERRORS.FIRST_NAME_REQUIRED;
    if (!trimmedLast)
      nextErrors.last_name = STRINGS.SETTINGS.PROFILE.ERRORS.LAST_NAME_REQUIRED;
    if (Object.keys(nextErrors).length) {
      setFormError(null);
      setSuccess(null);
      setFieldErrors(nextErrors);
      return;
    }

    if (!dirty) {
      setFormError(null);
      setFieldErrors({});
      setSuccess(STRINGS.SETTINGS.PROFILE.NO_CHANGES);
      return;
    }

    setFormError(null);
    setSuccess(null);
    setFieldErrors({});
    setPending(true);

    try {
      const updated = await updateProfileRequest({
        first_name: trimmedFirst,
        last_name: trimmedLast,
      });
      setUser(updated);
      setFirstName(updated.first_name);
      setLastName(updated.last_name);
      setSuccess(STRINGS.SETTINGS.PROFILE.SUCCESS);
    } catch (error) {
      const body = error instanceof ApiError ? error.body : null;
      const parsed = parseApiError(body);
      setFormError(parsed.formError ?? STRINGS.SETTINGS.PROFILE.ERRORS.FALLBACK);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setPending(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="settings-form">
      {formError ? <FormAlert>{formError}</FormAlert> : null}
      {success ? <FormAlert tone="success">{success}</FormAlert> : null}

      <div className="settings-form__row">
        <FormField
          label={STRINGS.SETTINGS.PROFILE.FIRST_NAME_LABEL}
          name="first_name"
          autoComplete="given-name"
          value={firstName}
          onChange={(event) => {
            setFirstName(event.target.value);
            setFieldErrors((prev) => ({ ...prev, first_name: "" }));
          }}
          error={fieldErrors.first_name || undefined}
          required
        />
        <FormField
          label={STRINGS.SETTINGS.PROFILE.LAST_NAME_LABEL}
          name="last_name"
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => {
            setLastName(event.target.value);
            setFieldErrors((prev) => ({ ...prev, last_name: "" }));
          }}
          error={fieldErrors.last_name || undefined}
          required
        />
      </div>

      <FormField
        label={STRINGS.SETTINGS.PROFILE.EMAIL_LABEL}
        type="email"
        autoComplete="email"
        value={user.email}
        onChange={() => {}}
        hint={STRINGS.SETTINGS.PROFILE.EMAIL_LOCKED_HINT}
        disabled
        readOnly
      />

      <div className="settings-form__actions">
        <AuthSubmitButton
          pending={pending}
          pendingLabel={STRINGS.SETTINGS.PROFILE.SUBMIT_PENDING}
          disabled={!dirty}
          className="settings-form__submit"
        >
          {STRINGS.SETTINGS.PROFILE.SUBMIT}
        </AuthSubmitButton>
      </div>
    </form>
  );
}
