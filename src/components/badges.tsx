import { BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full backdrop-blur-sm px-2 py-0.5 text-xs font-semibold",
        "bg-success/15 border border-success/35 text-success",
        "shadow-[0_0_12px_rgba(16,185,129,0.3)]",
        className,
      )}
    >
      <BadgeCheck className="h-3.5 w-3.5" /> Verified
    </span>
  );
}

const planStyles: Record<string, string> = {
  free: "bg-white/8 border-white/15 text-muted-foreground backdrop-blur-sm",
  standard:
    "bg-blue-500/15 border-blue-400/30 text-blue-300 backdrop-blur-sm shadow-[0_0_10px_rgba(59,130,246,0.2)]",
  premium:
    "bg-amber-500/15 border-amber-400/35 text-amber-300 backdrop-blur-sm shadow-[0_0_10px_rgba(245,158,11,0.25)]",
  gold: "bg-fuchsia-500/15 border-fuchsia-400/35 text-fuchsia-300 backdrop-blur-sm shadow-[0_0_10px_rgba(217,70,239,0.25)]",
};

export function PlanBadge({ plan, className }: { plan: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
        planStyles[plan] ?? planStyles.free,
        className,
      )}
    >
      {plan}
    </span>
  );
}

export function ZoneBadge({ zone, className }: { zone?: string | null; className?: string }) {
  if (!zone) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg backdrop-blur-sm px-2 py-0.5 text-xs font-medium",
        "bg-primary/15 border border-primary/25 text-primary",
        className,
      )}
    >
      {zone}
    </span>
  );
}

export function StarRating({
  value,
  count,
  size = "sm",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const px = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="inline-flex items-center gap-1 text-xs">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              px,
              i <= Math.round(value)
                ? "fill-accent text-accent"
                : "text-white/15",
            )}
          />
        ))}
      </div>
      <span className="font-medium tabular-nums text-foreground">{value.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
