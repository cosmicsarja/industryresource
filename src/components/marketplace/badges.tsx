import { cn } from "@/lib/utils";

const conditionMap: Record<string, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-success/15 text-success border-success/30" },
  like_new: { label: "Like New", cls: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300" },
  used_good: { label: "Used – Good", cls: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300" },
  used_fair: { label: "Used – Fair", cls: "bg-orange-500/15 text-orange-700 border-orange-500/30 dark:text-orange-300" },
  for_parts: { label: "For Parts", cls: "bg-muted text-muted-foreground border-border" },
};

export function ConditionBadge({ condition, className }: { condition: string; className?: string }) {
  const m = conditionMap[condition] ?? conditionMap.for_parts;
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", m.cls, className)}>
      {m.label}
    </span>
  );
}

export function StockStatusBadge({ inStock, qty }: { inStock: boolean; qty?: number | null }) {
  if (!inStock) {
    return <span className="inline-flex items-center rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">Out of Stock</span>;
  }
  const low = qty != null && qty > 0 && qty <= 5;
  if (low) {
    return <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">Low Stock ({qty})</span>;
  }
  return <span className="inline-flex items-center rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">In Stock</span>;
}

export function BuyNowBadge() {
  return <span className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">Buy Online</span>;
}

export function EnquireBadge() {
  return <span className="inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-xs font-semibold text-muted-foreground">Enquire for Price</span>;
}

export function formatINR(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
}
