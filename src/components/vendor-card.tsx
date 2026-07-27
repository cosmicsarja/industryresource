import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanBadge, VerifiedBadge, ZoneBadge, StarRating } from "@/components/badges";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Factory } from "lucide-react";

export interface VendorCardData {
  id: string;
  slug: string;
  business_name: string;
  description: string | null;
  zone: string | null;
  subscription_plan: string;
  is_verified: boolean;
  rating_avg: number;
  rating_count: number;
  phone: string;
  whatsapp: string | null;
  category?: { name: string } | null;
  primary_photo?: string | null;
}

export function VendorCard({ v }: { v: VendorCardData }) {
  return (
    <Card className="group overflow-hidden border-border/70 transition hover:border-primary/40 hover:shadow-lg flex flex-col">
      <Link to="/vendor/$slug" params={{ slug: v.slug }} className="flex-1 flex flex-col cursor-pointer">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted shrink-0">
          {v.primary_photo ? (
            <img src={v.primary_photo} alt={v.business_name} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <Factory className="h-16 w-16" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-1.5">
            <PlanBadge plan={v.subscription_plan} />
            {v.is_verified && <VerifiedBadge />}
          </div>
        </div>
        <CardContent className="space-y-3 p-4 flex-1">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-lg font-bold leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">{v.business_name}</h3>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {v.category && <span className="text-xs text-muted-foreground">{v.category.name}</span>}
              {v.zone && <ZoneBadge zone={v.zone} />}
            </div>
          </div>
          {v.description && <p className="line-clamp-2 text-sm text-muted-foreground">{v.description}</p>}
          <StarRating value={Number(v.rating_avg) || 0} count={v.rating_count} />
        </CardContent>
      </Link>
      <div className="p-4 pt-0 shrink-0">
        <div className="flex items-center gap-2 pt-1 border-t border-transparent">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/vendor/$slug" params={{ slug: v.slug }}>View Profile</Link>
          </Button>
          <WhatsAppButton phone={v.whatsapp || v.phone} vendorId={v.id} label="" />
        </div>
      </div>
    </Card>
  );
}
