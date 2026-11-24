import { Landmark } from "lucide-react";

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-gold">
        <Landmark size={20} />
      </span>
      <span className="font-heading text-xl font-bold tracking-wide text-primary">
        AURUM <span className="text-gold">BANK</span>
      </span>
    </span>
  );
}