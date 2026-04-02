type SimplePageCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function SimplePageCard({
  title,
  description,
  children,
}: SimplePageCardProps) {
  return (
    <section className="glass rounded-3xl border border-border p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description ? <p className="text-base leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
