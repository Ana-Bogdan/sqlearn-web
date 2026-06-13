import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {/* App shell: the viewport is locked to its height and the navbar sits
          outside the scroll area, so the page scrollbar starts *below* the
          sticky navbar instead of running alongside it. */}
      <div className="flex h-dvh flex-col overflow-hidden">
        <Navbar />
        <main id="app-scroll" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
