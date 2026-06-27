export default function PageHeader({ title, subtitle, children }) {
  return (
    <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </header>
  );
}
