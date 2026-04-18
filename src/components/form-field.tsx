"use client";

import { Eye, EyeClosed } from "lucide-react";
import { forwardRef, useState } from "react";
import { STRINGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    { label, error, hint, id, className, type, ...props },
    ref
  ) {
    const inputId =
      id ?? (props.name ? `field-${props.name}` : undefined);
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    const isPassword = type === "password";
    const [revealed, setRevealed] = useState(false);
    const effectiveType = isPassword && revealed ? "text" : type;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-[0.8125rem] font-medium text-taupe/85"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "block h-12 w-full rounded-[10px] border border-border/80 bg-popover/70 px-3.5 text-[0.9375rem] text-taupe",
              "placeholder:text-muted-foreground/70",
              "transition-colors duration-200",
              "focus:border-dusk/60 focus:outline-none focus:ring-4 focus:ring-dusk/15",
              "aria-[invalid=true]:border-destructive/70 aria-[invalid=true]:focus:ring-destructive/15",
              "disabled:cursor-not-allowed disabled:opacity-60",
              isPassword && "pr-11",
              className
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-label={
                revealed
                  ? STRINGS.FORM.HIDE_PASSWORD
                  : STRINGS.FORM.SHOW_PASSWORD
              }
              aria-pressed={revealed}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[10px] text-muted-foreground/70 transition-colors duration-200 hover:text-taupe focus-visible:outline-none focus-visible:text-taupe"
            >
              {revealed ? (
                <EyeClosed className="h-[18px] w-[18px]" aria-hidden="true" />
              ) : (
                <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
        {error ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-[0.8125rem] leading-snug text-destructive"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${inputId}-hint`}
            className="text-[0.8125rem] leading-snug text-muted-foreground"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
