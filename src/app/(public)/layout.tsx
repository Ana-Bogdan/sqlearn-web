export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex flex-1 flex-col">
      <div className="grain-overlay" aria-hidden="true" />
      {children}
    </main>
  );
}
