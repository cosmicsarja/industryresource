import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import {
  Phone, MapPin, Clock, Zap, Tag, ShoppingBag, Megaphone,
  Wrench, Package, ArrowLeft, ChevronLeft, ChevronRight,
  MessageCircle, Building2, Star,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/listings_/$id")({
  component: ListingDetailPage,
});

const LISTING_TYPES: Record<string, { label: string; color: string; bgColor: string }> = {
  job_work:     { label: "Job Work",     color: "text-blue-600",   bgColor: "bg-blue-500/10 border-blue-200" },
  for_sale:     { label: "For Sale",     color: "text-green-600",  bgColor: "bg-green-500/10 border-green-200" },
  wanted:       { label: "Wanted",       color: "text-amber-600",  bgColor: "bg-amber-500/10 border-amber-200" },
  announcement: { label: "Announcement", color: "text-purple-600", bgColor: "bg-purple-500/10 border-purple-200" },
};

function formatPrice(listing: { price_type: string; price: number | null; price_unit: string | null }) {
  if (listing.price_type === "contact" || !listing.price) return "Contact for price";
  if (listing.price_type === "free") return "Free";
  const formatted = "₹" + Number(listing.price).toLocaleString("en-IN");
  if (listing.price_type === "negotiable") return `${formatted} (Negotiable)`;
  return listing.price_unit ? `${formatted} / ${listing.price_unit}` : formatted;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? "s" : ""} ago`;
}

function ListingDetailPage() {
  const { id } = Route.useParams();
  const [activePhoto, setActivePhoto] = useState(0);

  const { data: listing, isLoading } = useQuery({
    queryKey: ["classified-listing", id],
    queryFn: async () => {
      const { data, error } = await db
        .from("classified_listings")
        .select(`
          *, 
          vendor:vendors(id, business_name, slug, zone, phone, whatsapp, rating_avg, rating_count, employee_count, description),
          category:categories(name)
        `)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      // increment view count
      void db.from("classified_listings").update({ view_count: (data?.view_count ?? 0) + 1 }).eq("id", id);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!listing) throw notFound();

  const typeConfig = LISTING_TYPES[listing.listing_type] ?? LISTING_TYPES.job_work;
  const photos: string[] = listing.photo_urls ?? [];
  const vendor = listing.vendor as any;
  const contactPhone = listing.contact_phone ?? vendor?.phone ?? "";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 py-6">
        {/* Back link */}
        <Link to="/listings" className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Classifieds
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main content */}
          <div className="space-y-5">
            {/* Photo gallery */}
            {photos.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative aspect-[4/3] bg-muted">
                  <img src={photos[activePhoto]} alt={listing.title} className="h-full w-full object-cover" />
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setActivePhoto((p) => (p - 1 + photos.length) % photos.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setActivePhoto((p) => (p + 1) % photos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                        {activePhoto + 1}/{photos.length}
                      </span>
                    </>
                  )}
                </div>
                {photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-3">
                    {photos.map((url, i) => (
                      <button key={i} onClick={() => setActivePhoto(i)}
                        className={`h-16 w-20 shrink-0 overflow-hidden rounded border-2 transition ${i === activePhoto ? "border-primary" : "border-transparent"}`}
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-[4/3] max-h-72 items-center justify-center rounded-xl border border-dashed border-border bg-card">
                <div className="text-center text-muted-foreground/40">
                  <Package className="mx-auto h-16 w-16" />
                  <p className="mt-2 text-sm">No photos</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    <Tag className="h-3 w-3" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm text-foreground leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* About vendor */}
            {vendor && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-bold">About the Vendor</h2>
                <div className="mt-4 flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <Link to="/vendor/$slug" params={{ slug: vendor.slug }} className="font-display text-lg font-bold hover:text-primary hover:underline">
                      {vendor.business_name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {vendor.zone && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{vendor.zone}</span>}
                      {vendor.employee_count && <span>{vendor.employee_count} employees</span>}
                      {vendor.rating_avg > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {Number(vendor.rating_avg).toFixed(1)} ({vendor.rating_count} reviews)
                        </span>
                      )}
                    </div>
                    <Button asChild size="sm" variant="outline" className="mt-3">
                      <Link to="/vendor/$slug" params={{ slug: vendor.slug }}>View Full Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="space-y-4">
            <div className="sticky top-24 space-y-4">
              {/* Title & price card */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${typeConfig.bgColor} ${typeConfig.color}`}>
                    {typeConfig.label}
                  </span>
                  {listing.is_urgent && (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                      <Zap className="h-3 w-3" /> Urgent
                    </span>
                  )}
                  {listing.category && (
                    <span className="rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">
                      {listing.category.name}
                    </span>
                  )}
                </div>

                <h1 className="mt-3 font-display text-2xl font-bold leading-snug">{listing.title}</h1>

                <div className="mt-3 font-display text-3xl font-bold text-primary">
                  {formatPrice(listing)}
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {listing.zone && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{listing.zone}, Belagavi</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>Posted {timeAgo(listing.created_at)}</span>
                  </div>
                  {listing.contact_name && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span>Contact: {listing.contact_name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-2">
                  <a
                    href={`tel:${contactPhone}`}
                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-primary py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
                  >
                    <Phone className="h-4 w-4" />
                    Call Now — {contactPhone}
                  </a>
                  <a
                    href={`https://wa.me/91${contactPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Safety tips */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Safety Tips</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Meet in a public/industrial location</li>
                  <li>Don't pay before inspecting the work/item</li>
                  <li>Get a written quotation for job work</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
