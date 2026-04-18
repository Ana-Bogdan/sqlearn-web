"use client";

import { cn } from "@/lib/utils";

interface AuthSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
  pendingLabel?: string;
}

export function AuthSubmitButton({
  children,
  pending = false,
  pendingLabel,
  className,
  disabled,
  ...props
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(
        "shadow-dusk shadow-dusk-hover relative inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-dusk px-5 text-[0.9375rem] font-semibold tracking-[-0.005em] text-primary-foreground",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-[1px] hover:bg-dusk/95",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-dusk/30",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0",
        className
      )}
      {...props}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
          />
          <span>{pendingLabel ?? children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
