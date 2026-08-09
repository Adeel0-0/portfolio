export default function SectionHeading({
  index,
  title,
}: {
  index: string;
  title: string;
}) {
  return (
    <div className="mb-14 flex items-end gap-4">
      <span className="font-mono text-sm text-primary">/{index}</span>
      <h2 className="text-4xl font-bold uppercase tracking-tighter md:text-6xl">
        {title}
      </h2>
      <div className="mb-2 h-px flex-1 bg-border" />
    </div>
  );
}
