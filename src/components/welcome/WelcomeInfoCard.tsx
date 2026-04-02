type WelcomeInfoCardProps = {
  title: string;
  children: React.ReactNode;
};

export function WelcomeInfoCard({ title, children }: WelcomeInfoCardProps) {
  return (
    <section className="glass rounded-3xl border border-border p-6">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4 text-base leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}
