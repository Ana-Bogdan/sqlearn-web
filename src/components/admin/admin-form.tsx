"use client";

import type { ReactNode, TextareaHTMLAttributes, InputHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  error?: string | null;
  width?: "full" | "narrow";
}

export function AdminField({
  label,
  hint,
  htmlFor,
  children,
  error,
  width = "full",
}: FieldProps) {
  return (
    <div className="admin-field" data-width={width}>
      <label className="admin-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {hint ? <p className="admin-field__hint">{hint}</p> : null}
      {children}
      {error ? (
        <p className="admin-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AdminTextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`admin-input ${props.className ?? ""}`} />;
}

export function AdminTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`admin-input admin-input--area ${props.className ?? ""}`}
    />
  );
}

export function AdminNumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="number"
      className={`admin-input admin-input--num ${props.className ?? ""}`}
    />
  );
}
