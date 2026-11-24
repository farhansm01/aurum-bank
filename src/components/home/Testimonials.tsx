import { Star } from "lucide-react";
import SectionHeading from "./SectionHeading";

const reviews = [
  {
    name: "Rahim Uddin",
    role: "Shop owner",
    text: "Sending money to my supplier takes seconds now. The history is very clear.",
  },
  {
    name: "Nusrat Jahan",
    role: "Teacher",
    text: "I like the monthly charts. I can see where my money goes without any effort.",
  },
  {
    name: "Karim Hossain",
    role: "Freelancer",
    text: "The loan calculator helped me plan before I applied. Simple and honest.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Testimonials"
          title="Loved by our customers"
          text="Sample reviews for this demo project."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-line bg-page p-6"
            >
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="mt-4 text-sm text-primary">{r.text}</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-gold">
                  {r.name[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {r.name}
                  </p>
                  <p className="text-xs text-muted">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}