const stats = [
  { value: "25,000+", label: "Customers" },
  { value: "40,000+", label: "Bank accounts" },
  { value: "1.2M", label: "Transactions" },
  { value: "99.9%", label: "Uptime" },
];

export default function Stats() {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-heading text-3xl font-bold text-primary sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}