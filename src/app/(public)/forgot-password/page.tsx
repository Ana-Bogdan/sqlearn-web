import Link from "next/link";
import { AuthPageShell } from "@/components/auth-page-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { LoginIllustration } from "@/components/illustrations";
import { STRINGS } from "@/lib/constants";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      illustration={
        <LoginIllustration className="h-auto w-[300px] xl:w-[340px]" />
      }
      radialTint="rgba(62,85,112,0.06)"
      caption={STRINGS.FORGOT_PASSWORD.CAPTION}
      heading={STRINGS.FORGOT_PASSWORD.HEADING}
      subheading={STRINGS.FORGOT_PASSWORD.SUBHEADING}
      footer={
        <>
          {STRINGS.FORGOT_PASSWORD.BACK_PROMPT}{" "}
          <Link
            href="/login"
            className="font-semibold text-dusk underline-offset-4 transition-colors hover:underline"
          >
            {STRINGS.FORGOT_PASSWORD.BACK_LINK}
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
