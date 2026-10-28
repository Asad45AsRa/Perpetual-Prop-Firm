// Temporary page body; replace with the real section components
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-site px-6 py-20">
      <h1 className="text-4xl font-medium">{title}</h1>
    </div>
  );
}
