import { STRINGS } from "./constants";

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_HINT = STRINGS.PASSWORD.HINT;

export function validatePassword(password: string): string | null {
  const missing: string[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) {
    missing.push(STRINGS.PASSWORD.MISSING_LENGTH(PASSWORD_MIN_LENGTH));
  }
  if (!/[A-Z]/.test(password)) missing.push(STRINGS.PASSWORD.MISSING_UPPERCASE);
  if (!/[a-z]/.test(password)) missing.push(STRINGS.PASSWORD.MISSING_LOWERCASE);
  if (!/[0-9]/.test(password)) missing.push(STRINGS.PASSWORD.MISSING_NUMBER);
  if (!/[^A-Za-z0-9\s]/.test(password)) missing.push(STRINGS.PASSWORD.MISSING_SYMBOL);
  if (missing.length === 0) return null;
  return (
    STRINGS.PASSWORD.MISSING_PREFIX +
    missing.join(", ") +
    STRINGS.PASSWORD.MISSING_SUFFIX
  );
}
