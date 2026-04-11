export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-taupe">
          Dashboard
        </h1>
        <p className="mt-1.5 text-[0.9375rem] text-muted-foreground">
          Your learning progress at a glance.
        </p>
      </div>

      {/* Dashboard content will be added in Milestone 12 */}
      <div
        className="animate-fade-up mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex h-36 flex-col justify-between rounded-xl border border-border/60 bg-card/80 p-5">
          <div className="h-3 w-16 rounded-full bg-dusk/15" />
          <div className="space-y-2">
            <div className="h-6 w-20 rounded-md bg-dusk/10" />
            <div className="h-2.5 w-28 rounded-full bg-muted/60" />
          </div>
        </div>
        <div className="flex h-36 flex-col justify-between rounded-xl border border-border/60 bg-card/80 p-5">
          <div className="h-3 w-20 rounded-full bg-light-mauve/20" />
          <div className="space-y-2">
            <div className="h-6 w-14 rounded-md bg-light-mauve/15" />
            <div className="h-2.5 w-32 rounded-full bg-muted/60" />
          </div>
        </div>
        <div className="flex h-36 flex-col justify-between rounded-xl border border-border/60 bg-card/80 p-5">
          <div className="h-3 w-12 rounded-full bg-dusk/15" />
          <div className="space-y-2">
            <div className="h-6 w-24 rounded-md bg-dusk/10" />
            <div className="h-2.5 w-24 rounded-full bg-muted/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
