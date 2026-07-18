export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-heading text-2xl font-bold text-primary sm:text-3xl">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
