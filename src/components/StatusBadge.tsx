const styles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  under_review: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  completed: "bg-green-50 text-green-700",
  active: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
  failed: "bg-red-50 text-red-600",
  blocked: "bg-red-50 text-red-600",
  frozen: "bg-slate-100 text-slate-600",
  reversed: "bg-slate-100 text-slate-600",
  inactive: "bg-slate-100 text-slate-600",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = styles[status] ?? "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${style}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}