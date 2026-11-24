export default function SectionHeading({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">
        {label}
      </p>
      <h2 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-4 text-muted">{text}</p>}
    </div>
  );
}