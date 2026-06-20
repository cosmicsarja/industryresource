import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hammer } from "lucide-react";
import { ConditionBadge, formatINR } from "./badges";
import { ZoneBadge } from "@/components/badges";

export interface MachineCardData {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  model: string | null;
  condition: string;
  asking_price: number | null;
  price_type: string;
  zone: string | null;
  primary_photo?: string | null;
}

export function MachineCard({ m }: { m: MachineCardData }) {
  return (
    <Card className="group overflow-hidden border-border/70 transition hover:border-primary/40 hover:shadow-lg">
      <Link to="/machines/$slug" params={{ slug: m.slug }} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {m.primary_photo ? (
            <img src={m.primary_photo} alt={m.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <Hammer className="h-14 w-14" />
            </div>
          )}
          <div className="absolute left-3 top-3"><ConditionBadge condition={m.condition} /></div>
        </div>
      </Link>
      <CardContent className="space-y-2 p-4">
        <h3 className="font-display text-base font-bold leading-tight line-clamp-2">{m.title}</h3>
        {(m.brand || m.model) && (
          <p className="text-xs text-muted-foreground">{[m.brand, m.model].filter(Boolean).join(" · ")}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="font-display text-lg font-bold text-primary">
            {m.price_type === "on_request" ? "Price on Request" : formatINR(m.asking_price)}
          </div>
          <ZoneBadge zone={m.zone} />
        </div>
        <Button asChild size="sm" className="w-full" variant="outline">
          <Link to="/machines/$slug" params={{ slug: m.slug }}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
