import { BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success", className)}>
      <BadgeCheck className="h-3.5 w-3.5" /> Verified
    </span>
  );
}

const planStyles: Record<string, string> = {
  free: "bg-muted text-muted-foreground border-border",
  standard: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-300",
  premium: "bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-300",
  gold: "bg-fuchsia-500/15 text-fuchsia-700 border-fuchsia-500/40 dark:text-fuchsia-300",
};

export function PlanBadge({ plan, className }: { plan: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize", planStyles[plan] ?? planStyles.free, className)}>
      {plan}
    </span>
  );
}

export function ZoneBadge({ zone, className }: { zone?: string | null; className?: string }) {
  if (!zone) return null;
  return (
    <span className={cn("inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary", className)}>
      {zone}
    </span>
  );
}

export function StarRating({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "md" }) {
  const px = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="inline-flex items-center gap-1 text-xs">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn(px, i <= Math.round(value) ? "fill-accent text-accent" : "text-muted-foreground/30")} />
        ))}
      </div>
      <span className="font-medium tabular-nums">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted-foreground">({count})</span>}
    </div>
  );
}
