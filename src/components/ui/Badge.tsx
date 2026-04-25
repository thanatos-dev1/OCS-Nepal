import { cn } from "@/lib/utils";

type BadgeVariant = "new" | "popular" | "sale" | "default";

const variants: Record<BadgeVariant, string> = {
  new:     "bg-blue-100 text-blue-700",
  popular: "bg-warning-light text-warning",
  sale:    "bg-accent text-white",
  default: "bg-accent text-white",
};

function inferVariant(label: string): BadgeVariant {
  const l = label.toLowerCase();
  if (l === "new") return "new";
  if (l === "popular") return "popular";
  if (l === "sale") return "sale";
  return "default";
}

type Props = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

export default function Badge({ label, variant, className }: Props) {
  const v = variant ?? inferVariant(label);
  return (
    <span
      className={cn(
        "px-2 py-0.5 text-xs font-semibold rounded-sm",
        variants[v],
        className
      )}
    >
      {label}
    </span>
  );
}
