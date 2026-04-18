import Link from "next/link";
import { AuthPageShell } from "@/components/auth-page-shell";
import { RegisterIllustration } from "@/components/illustrations";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { STRINGS } from "@/lib/constants";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ uid: string; token: string }>;
}) {
  const { uid, token } = await params;

  return (
    <AuthPageShell
      illustration={
        <RegisterIllustration className="h-auto w-[300px] xl:w-[340px]" />
      }
      radialTint="rgba(185,153,164,0.08)"
      caption={STRINGS.RESET_PASSWORD.CAPTION}
      heading={STRINGS.RESET_PASSWORD.HEADING}
      subheading={STRINGS.RESET_PASSWORD.SUBHEADING}
      footer={
        <Link
          href="/login"
          className="font-semibold text-dusk underline-offset-4 transition-colors hover:underline"
        >
          {STRINGS.RESET_PASSWORD.BACK_TO_LOGIN}
        </Link>
      }
    >
      <ResetPasswordForm uid={uid} token={token} />
    </AuthPageShell>
  );
}
