import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Navbar />
      <main className="flex-1">{children}</main>
    </AuthGuard>
  );
}
