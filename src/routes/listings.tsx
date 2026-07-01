import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

// Type cast helper for new tables not yet in generated Supabase types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { useAuth } from "@/lib/use-auth";
import {
  Search, Phone, MapPin, Clock, Zap, Tag, ShoppingBag,
  Megaphone, Wrench, Plus, MessageCircle, ArrowRight, Package,
} from "lucide-react";

const searchSchema = z.object({
  q: z.string().optional(),
  type: z.string().optional(),
  zone: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/listings")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Industrial Classifieds Belagavi | IndustrialBelgaum.com" },
      { name: "description", content: "Browse job work offers, machines for sale, materials wanted, and announcements from Belagavi industrial vendors. Free OLX-style classifieds." },
    ],
  }),
  component: ListingsPage,
});

const ZONES = ["Udyambag", "Auto Nagar", "Machhe KIADB", "Gokul Road", "Khanapur Road", "Bogarves", "Shahapur", "Other"];

const LISTING_TYPES = [
  { value: "job_work",     label: "Job Work",     icon: Wrench,     color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { value: "for_sale",     label: "For Sale",     icon: ShoppingBag, color: "bg-green-500/10 text-green-600 border-green-200" },
  { value: "wanted",       label: "Wanted",       icon: Package,    color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  { value: "announcement", label: "Announcement", icon: Megaphone,  color: "bg-purple-500/10 text-purple-600 border-purple-200" },
];

function getTypeConfig(type: string) {
  return LISTING_TYPES.find((t) => t.value === type) ?? LISTING_TYPES[0];
}

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
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function ListingsPage() {
  const sp = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState(sp.q ?? "");

  const setFilter = (patch: Record<string, unknown>) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }) as never });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name,slug").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const categoryId = categories.find((c) => c.slug === sp.category)?.id;

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["classified-listings", sp, categoryId],
    queryFn: async () => {
      let qb = db
        .from("classified_listings")
        .select(`
          id, listing_type, title, description, zone, price_type, price, price_unit,
          photo_urls, contact_phone, contact_name, is_urgent, tags, created_at, expires_at,
          vendor:vendors(id, business_name, slug, zone, phone, whatsapp),
          category:categories(name)
        `)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString());

      if (sp.q) qb = qb.ilike("title", `%${sp.q}%`);
      if (sp.type) qb = qb.eq("listing_type", sp.type);
      if (sp.zone) qb = qb.eq("zone", sp.zone);
      if (categoryId) qb = qb.eq("category_id", categoryId);

      qb = qb.order("is_urgent", { ascending: false }).order("created_at", { ascending: false }).limit(60);
      const { data } = await qb;
      return data ?? [];
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Tag className="h-3 w-3" /> Industrial Classifieds — Belagavi
              </div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">
                Industrial Classifieds
              </h1>
              <p className="mt-2 text-sm text-white/80">
                Job work offers, machines for sale, materials wanted — all in one place.
              </p>
            </div>
            {user && (
              <Button asChild className="bg-white text-orange-700 hover:bg-white/90 font-semibold">
                <Link to="/listings/new">
                  <Plus className="mr-2 h-4 w-4" /> Post a Listing
                </Link>
              </Button>
            )}
          </div>

          {/* Type filter pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter({ type: undefined })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${!sp.type ? "bg-white text-orange-700" : "bg-white/20 text-white hover:bg-white/30"}`}
            >
              All Types
            </button>
            {LISTING_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter({ type: sp.type === t.value ? undefined : t.value })}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${sp.type === t.value ? "bg-white text-orange-700" : "bg-white/20 text-white hover:bg-white/30"}`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & filters bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center gap-2 px-4 py-3">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setFilter({ q: q || undefined })}
              placeholder="Search listings…"
              className="pl-9 h-9"
            />
          </div>
          <Select value={sp.zone ?? "all"} onValueChange={(v) => setFilter({ zone: v === "all" ? undefined : v })}>
            <SelectTrigger className="h-9 w-40">
              <MapPin className="mr-2 h-3.5 w-3.5 shrink-0" />
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sp.category ?? "all"} onValueChange={(v) => setFilter({ category: v === "all" ? undefined : v })}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {(sp.q || sp.type || sp.zone || sp.category) && (
            <Button size="sm" variant="ghost" className="h-9 text-muted-foreground" onClick={() => navigate({ search: {} })}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <main className="container mx-auto flex-1 px-4 py-6">
        {/* Count */}
        <p className="mb-5 text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${listings.length} listing${listings.length !== 1 ? "s" : ""} found`}
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
            <Megaphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold text-foreground">No listings found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {user ? "Be the first to post a listing!" : "Login to post a listing."}
            </p>
            {user ? (
              <Button asChild className="mt-4" size="sm">
                <Link to="/listings/new"><Plus className="mr-2 h-3.5 w-3.5" />Post a Listing</Link>
              </Button>
            ) : (
              <Button asChild className="mt-4" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* CTA for non-logged-in users */}
        {!user && listings.length > 0 && (
          <div className="mt-10 rounded-xl border border-orange-200 bg-orange-50 p-6 text-center dark:border-orange-900 dark:bg-orange-950/30">
            <Megaphone className="mx-auto mb-2 h-8 w-8 text-orange-600" />
            <h3 className="font-display text-lg font-bold text-foreground">Are you a vendor in Belagavi?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Register your business and post listings for free.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Button asChild size="sm" variant="outline"><Link to="/auth">Sign In</Link></Button>
              <Button asChild size="sm"><Link to="/register-vendor">Register Business <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ListingCard({ listing }: { listing: any }) {
  const typeConfig = getTypeConfig(listing.listing_type);
  const Icon = typeConfig.icon;
  const vendor = listing.vendor;
  const photo = listing.photo_urls?.[0];

  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      {/* Photo or placeholder */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {photo ? (
          <img src={photo} alt={listing.title} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {/* Type badge */}
        <span className={`absolute left-3 top-3 flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold backdrop-blur ${typeConfig.color}`}>
          <Icon className="h-3 w-3" />
          {typeConfig.label}
        </span>
        {listing.is_urgent && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            <Zap className="h-3 w-3" /> Urgent
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">
          {listing.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{listing.description}</p>

        {/* Price */}
        <div className="mt-2 font-display text-lg font-bold text-primary">
          {formatPrice(listing)}
        </div>

        {/* Meta row */}
        <div className="mt-auto pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {listing.zone && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {listing.zone}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {timeAgo(listing.created_at)}
            </span>
          </div>
          {vendor && (
            <span className="font-medium text-foreground truncate max-w-[130px]">{vendor.business_name}</span>
          )}
        </div>

        {/* Contact buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={`tel:${listing.contact_phone ?? vendor?.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium hover:bg-muted transition"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/91${(listing.contact_phone ?? vendor?.whatsapp ?? vendor?.phone ?? "").replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-medium text-white hover:bg-green-700 transition"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </Link>
  );
}
