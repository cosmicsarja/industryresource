import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { BuyNowBadge, EnquireBadge, StockStatusBadge, formatINR } from "./badges";
import { ZoneBadge } from "@/components/badges";

export interface MaterialCardData {
  id: string;
  slug: string;
  title: string;
  material_type: string | null;
  grade_or_spec: string | null;
  unit: string;
  price_per_unit: number | null;
  stock_quantity: number | null;
  is_in_stock: boolean | null;
  allow_online_payment: boolean | null;

  min_order_quantity: number | null;
  zone: string | null;
  primary_photo?: string | null;
}

export function MaterialCard({ m }: { m: MaterialCardData }) {
  return (
    <Card className="group overflow-hidden border-border/70 transition hover:border-primary/40 hover:shadow-lg">
      <Link to="/materials/$slug" params={{ slug: m.slug }} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {m.primary_photo ? (
            <img src={m.primary_photo} alt={m.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <Package className="h-14 w-14" />
            </div>
          )}
          <div className="absolute left-3 top-3">
            {m.allow_online_payment ? <BuyNowBadge /> : <EnquireBadge />}
          </div>
        </div>
      </Link>
      <CardContent className="space-y-2 p-4">
        <h3 className="font-display text-base font-bold leading-tight line-clamp-2">{m.title}</h3>
        {(m.material_type || m.grade_or_spec) && (
          <p className="text-xs text-muted-foreground line-clamp-1">{[m.material_type, m.grade_or_spec].filter(Boolean).join(" · ")}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="font-display text-base font-bold text-primary">
            {m.price_per_unit ? `${formatINR(m.price_per_unit)} / ${m.unit}` : "On Enquiry"}
          </div>
          <StockStatusBadge inStock={!!m.is_in_stock} qty={m.stock_quantity ? Number(m.stock_quantity) : null} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <ZoneBadge zone={m.zone} />
          {m.min_order_quantity ? <span>Min order: {m.min_order_quantity} {m.unit}</span> : null}
        </div>
        <Button asChild size="sm" className="w-full" variant="outline">
          <Link to="/materials/$slug" params={{ slug: m.slug }}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
