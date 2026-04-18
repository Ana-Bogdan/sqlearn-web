import { cn } from "@/lib/utils";

interface FormAlertProps {
  tone?: "error" | "success";
  children: React.ReactNode;
  className?: string;
}

export function FormAlert({
  tone = "error",
  children,
  className,
}: FormAlertProps) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "rounded-[10px] border px-3.5 py-2.5 text-[0.8125rem] leading-snug",
        isError
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-dusk/25 bg-dusk/5 text-dusk",
        className
      )}
    >
      {children}
    </div>
  );
}
