import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanBadge, VerifiedBadge, ZoneBadge, StarRating } from "@/components/badges";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { toast } from "sonner";
import {
  Phone, MapPin, Globe, Building2, Calendar, Users, Factory,
  ShieldCheck, Clock, TrendingUp, Award, Tag, Package,
  ChevronRight, Zap, IndianRupee, Star, MessageCircle,
  Briefcase, Layers,
} from "lucide-react";

export const Route = createFileRoute("/vendor/$slug")({
  component: VendorPage,
});

interface Machine { name: string; count?: number; brand?: string }
interface CatalogItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  price_type: string;
  price?: number;
  price_max?: number;
  price_unit?: string;
  min_order?: string;
  lead_time?: string;
  photo_url?: string;
}

function VendorPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*, category:categories(name,name_kn,slug)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: photos = [] } = useQuery({
    enabled: !!vendor?.id,
    queryKey: ["vendor-photos", vendor?.id],
    queryFn: async () => {
      const { data } = await supabase.from("vendor_photos").select("*").eq("vendor_id", vendor!.id).order("is_primary", { ascending: false }).order("sort_order");
      return data ?? [];
    },
  });

  const { data: reviews = [] } = useQuery({
    enabled: !!vendor?.id,
    queryKey: ["reviews", vendor?.id],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*, customer:profiles(full_name)").eq("vendor_id", vendor!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: catalogItems = [] } = useQuery({
    enabled: !!vendor?.id,
    queryKey: ["vendor-catalog", vendor?.id],
    queryFn: async () => {
      const { data } = await db
        .from("vendor_catalog_items")
        .select("*")
        .eq("vendor_id", vendor!.id)
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      return (data ?? []) as CatalogItem[];
    },
  });

  const { data: classifiedListings = [] } = useQuery({
    enabled: !!vendor?.id,
    queryKey: ["vendor-listings", vendor?.id],
    queryFn: async () => {
      const { data } = await db
        .from("classified_listings")
        .select("id,listing_type,title,price_type,price,price_unit,is_urgent,created_at,photo_urls")
        .eq("vendor_id", vendor!.id)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  // Log profile view once
  useEffect(() => {
    if (!vendor?.id) return;
    void supabase.from("analytics_events").insert({ vendor_id: vendor.id, event_type: "profile_view" });
  }, [vendor?.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto p-8 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!vendor) throw notFound();

  const machines: Machine[] = Array.isArray(vendor.machine_list) ? (vendor.machine_list as never) : [];
  const primary = photos.find((p) => p.is_primary)?.photo_url || photos[0]?.photo_url;
  const yearsInBusiness = vendor.established_year ? new Date().getFullYear() - vendor.established_year : null;
  const responseTime = (vendor as any).response_time_hrs ?? 24;
  const businessType = (vendor as any).business_type ?? "service_provider";
  const gst = (vendor as any).gst_number;
  const annualTurnover = (vendor as any).annual_turnover;
  const prodCapacity = (vendor as any).production_capacity;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <PlanBadge plan={vendor.subscription_plan} />
                {vendor.is_verified && <VerifiedBadge />}
                {vendor.zone && <ZoneBadge zone={vendor.zone} />}
                {/* IndiaMart-style trust badges */}
                {gst && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" /> GST Verified
                  </span>
                )}
                {yearsInBusiness && yearsInBusiness > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400">
                    <Award className="h-3 w-3" /> {yearsInBusiness}+ Years
                  </span>
                )}
                {vendor.rating_count > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-amber-500" /> {Number(vendor.rating_avg).toFixed(1)} Rating
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold">{vendor.business_name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {vendor.category && <span>{vendor.category.name}</span>}
                <span className="capitalize">{businessType.replace(/_/g, " ")}</span>
                <StarRating value={Number(vendor.rating_avg) || 0} count={vendor.rating_count} />
              </div>
              {/* IndiaMart-style response indicator */}
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-green-500" />
                  Responds within {responseTime < 24 ? `${responseTime}h` : "1 day"}
                </span>
                {vendor.enquiry_count > 0 && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    {vendor.enquiry_count}+ enquiries handled
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <WhatsAppButton phone={vendor.whatsapp || vendor.phone} vendorId={vendor.id} label={t("whatsapp")} />
              <Button asChild variant="outline">
                <a href={`tel:${vendor.phone}`}><Phone className="mr-2 h-4 w-4" />{t("call")}</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Gallery */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="aspect-[16/10] bg-muted">
              {primary ? (
                <img src={primary} alt={vendor.business_name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground/40">
                  <Factory className="h-20 w-20" />
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {photos.map((p) => (
                  <img key={p.id} src={p.photo_url} alt={p.caption || ""} className="h-16 w-24 shrink-0 rounded object-cover" />
                ))}
              </div>
            )}
          </div>

          {/* Main tabs */}
          <Tabs defaultValue="overview">
            <TabsList className="flex h-auto flex-wrap gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="catalog">
                Catalog {catalogItems.length > 0 && <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">{catalogItems.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="machines">Machines</TabsTrigger>
              <TabsTrigger value="business">Business Info</TabsTrigger>
              <TabsTrigger value="listings">
                Listings {classifiedListings.length > 0 && <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">{classifiedListings.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            {/* ── OVERVIEW ── */}
            <TabsContent value="overview" className="space-y-4">
              <p className="whitespace-pre-line text-sm text-foreground">
                {(lang === "kn" && vendor.description_kn) ? vendor.description_kn : vendor.description || "No description provided yet."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {vendor.established_year && <Fact icon={Calendar} label="Established" value={String(vendor.established_year)} />}
                {vendor.employee_count && <Fact icon={Users} label="Team size" value={vendor.employee_count} />}
                {vendor.website && <Fact icon={Globe} label="Website" value={vendor.website} />}
                {vendor.full_address && <Fact icon={MapPin} label="Address" value={vendor.full_address} />}
                {annualTurnover && <Fact icon={IndianRupee} label="Annual Turnover" value={annualTurnover} />}
                {prodCapacity && <Fact icon={TrendingUp} label="Production Capacity" value={prodCapacity} />}
              </div>
              {vendor.certifications && vendor.certifications.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.certifications.map((c: string) => (
                      <span key={c} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                        <Award className="h-3 w-3 text-amber-500" /> {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── CATALOG (IndiaMart-style) ── */}
            <TabsContent value="catalog">
              {catalogItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                  <Layers className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No services/products listed in catalog yet.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {catalogItems.map((item) => (
                    <CatalogCard key={item.id} item={item} vendorPhone={vendor.whatsapp || vendor.phone} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── MACHINES ── */}
            <TabsContent value="machines">
              {machines.length === 0 ? (
                <p className="text-sm text-muted-foreground">Machine details not provided.</p>
              ) : (
                <div className="divide-y divide-border rounded-xl border border-border">
                  {machines.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-4 text-sm">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{m.name}</span>
                        {m.brand && <span className="text-muted-foreground">· {m.brand}</span>}
                      </div>
                      {m.count && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">×{m.count}</span>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── BUSINESS INFO (IndiaMart-style) ── */}
            <TabsContent value="business" className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={Briefcase} label="Nature of Business" value={businessType.replace(/_/g, " ")} capitalize />
                {vendor.established_year && <InfoRow icon={Calendar} label="Year Established" value={String(vendor.established_year)} />}
                {vendor.employee_count && <InfoRow icon={Users} label="Number of Employees" value={vendor.employee_count} />}
                {annualTurnover && <InfoRow icon={IndianRupee} label="Annual Turnover" value={annualTurnover} />}
                {prodCapacity && <InfoRow icon={TrendingUp} label="Production Capacity" value={prodCapacity} />}
                {gst && <InfoRow icon={ShieldCheck} label="GST Number" value={gst} />}
                {vendor.zone && <InfoRow icon={MapPin} label="Industrial Zone" value={`${vendor.zone}${(vendor as any).city ? `, ${(vendor as any).city}` : ""}`} />}
                {responseTime && <InfoRow icon={Clock} label="Response Time" value={`Within ${responseTime < 24 ? responseTime + " hours" : "1 business day"}`} />}
              </div>

              {(vendor as any).payment_terms && (vendor as any).payment_terms.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Terms</h4>
                  <div className="flex flex-wrap gap-2">
                    {(vendor as any).payment_terms.map((term: string) => (
                      <span key={term} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{term}</span>
                    ))}
                  </div>
                </div>
              )}

              {(vendor as any).quality_standards && (vendor as any).quality_standards.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quality Standards</h4>
                  <div className="flex flex-wrap gap-2">
                    {(vendor as any).quality_standards.map((qs: string) => (
                      <span key={qs} className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <Award className="h-3 w-3" /> {qs}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Map in Business Info tab */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location on Map</h4>
                <VendorMap
                  address={vendor.full_address}
                  zone={vendor.zone}
                  businessName={vendor.business_name}
                  city={(vendor as any).city}
                  fullWidth
                />
              </div>
            </TabsContent>

            {/* ── LISTINGS (OLX-style) ── */}
            <TabsContent value="listings">
              {classifiedListings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                  <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No active classified listings from this vendor.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classifiedListings.map((listing: any) => (
                    <Link
                      key={listing.id}
                      to="/listings/$id"
                      params={{ id: listing.id }}
                      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition"
                    >
                      {listing.photo_urls?.[0] ? (
                        <img src={listing.photo_urls[0]} alt={listing.title} className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-7 w-7 text-muted-foreground/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary capitalize">{listing.listing_type.replace(/_/g, " ")}</span>
                          {listing.is_urgent && <span className="flex items-center gap-0.5 text-xs font-bold text-red-600"><Zap className="h-3 w-3" />Urgent</span>}
                        </div>
                        <p className="mt-0.5 font-semibold line-clamp-1">{listing.title}</p>
                        <p className="text-sm font-medium text-primary">
                          {listing.price_type === "contact" || !listing.price ? "Contact for price" :
                            `₹${Number(listing.price).toLocaleString("en-IN")}${listing.price_unit ? " / " + listing.price_unit : ""}`}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                  <div className="text-center">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/listings" search={{ vendor: slug } as never}>View All Listings</Link>
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── REVIEWS ── */}
            <TabsContent value="reviews" className="space-y-6">
              <AddReviewForm vendorId={vendor.id} onReviewed={() => qc.invalidateQueries({ queryKey: ["reviews", vendor.id] })} />

              {reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                  No reviews yet. Be the first customer to rate this workshop!
                </div>
              ) : (
                reviews.map((r: any) => (
                  <div key={r.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{r.customer?.full_name || "Verified Customer"}</div>
                        {r.job_type && <div className="text-xs text-muted-foreground">Job Type: {r.job_type}</div>}
                      </div>
                      <StarRating value={r.rating} />
                    </div>
                    {r.title && <h5 className="font-semibold text-foreground">{r.title}</h5>}
                    {r.body && <p className="text-sm text-muted-foreground">{r.body}</p>}
                    {r.vendor_reply && (
                      <div className="mt-3 rounded-lg border-l-2 border-primary bg-primary/5 p-3 text-sm">
                        <div className="font-semibold text-primary">Vendor's reply</div>
                        <p className="text-muted-foreground">{r.vendor_reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* IndiaMart-style Quick Stats */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Company Stats</h3>
            <div className="space-y-3">
              {vendor.rating_count > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground"><Star className="h-4 w-4 text-amber-400" />Rating</span>
                  <span className="font-bold">{Number(vendor.rating_avg).toFixed(1)} / 5</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 text-green-500" />Response time</span>
                <span className="font-bold">{responseTime < 24 ? `${responseTime}h` : "~1 day"}</span>
              </div>
              {vendor.enquiry_count > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-4 w-4 text-primary" />Enquiries</span>
                  <span className="font-bold">{vendor.enquiry_count}+</span>
                </div>
              )}
              {catalogItems.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" />Services Listed</span>
                  <span className="font-bold">{catalogItems.length}</span>
                </div>
              )}
            </div>
          </div>

          <EnquiryForm vendorId={vendor.id} userId={user?.id} vendorName={vendor.business_name} />

          {/* Map */}
          <VendorMap
            address={vendor.full_address}
            zone={vendor.zone}
            businessName={vendor.business_name}
            city={(vendor as any).city}
          />
        </aside>
      </main>

      <Footer />
    </div>
  );
}

// ── Helpers ──

function VendorMap({
  address,
  zone,
  businessName,
  city = "Belagavi",
  fullWidth = false,
}: {
  address?: string | null;
  zone?: string | null;
  businessName: string;
  city?: string | null;
  fullWidth?: boolean;
}) {
  // Build a search query: prefer full address, fall back to zone + city
  const locationCity = city ?? "Belagavi";
  const query = encodeURIComponent(
    address
      ? `${address}, ${locationCity}, Karnataka`
      : zone
      ? `${zone}, ${locationCity}, Karnataka`
      : `${locationCity}, Karnataka`
  );

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const embedUrl = `https://maps.google.com/maps?q=${query}&output=embed&z=15&hl=en`;

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-card ${fullWidth ? "w-full" : ""}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {zone ? `${zone}, ${locationCity}` : `${locationCity}, Karnataka`}
          </span>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition"
        >
          <Globe className="h-3 w-3" />
          Open in Maps
        </a>
      </div>
      <div className={`relative ${fullWidth ? "aspect-[16/7]" : "aspect-[4/3]"} overflow-hidden bg-muted`}>
        <iframe
          title={`${businessName} location map`}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, position: "absolute", inset: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-foreground">{value}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, capitalize }: { icon: typeof Phone; label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className={`mt-0.5 text-sm font-medium text-foreground ${capitalize ? "capitalize" : ""}`}>{value}</div>
        </div>
      </div>
    </div>
  );
}

function CatalogCard({ item, vendorPhone }: { item: CatalogItem; vendorPhone: string }) {
  const formatItemPrice = () => {
    if (item.price_type === "contact" || !item.price) return "Contact for price";
    if (item.price_type === "per_unit") return `₹${Number(item.price).toLocaleString("en-IN")} / ${item.price_unit ?? "unit"}`;
    if (item.price_type === "range" && item.price_max) return `₹${Number(item.price).toLocaleString("en-IN")} – ₹${Number(item.price_max).toLocaleString("en-IN")}${item.price_unit ? " / " + item.price_unit : ""}`;
    return `₹${Number(item.price).toLocaleString("en-IN")}${item.price_unit ? " / " + item.price_unit : ""}`;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/30 hover:shadow-md">
      {item.photo_url && (
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img src={item.photo_url} alt={item.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-4">
        {item.category && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{item.category}</span>
        )}
        <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
        {item.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}
        <div className="mt-2 font-display text-lg font-bold text-primary">{formatItemPrice()}</div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {item.min_order && <span>Min order: <span className="font-medium text-foreground">{item.min_order}</span></span>}
          {item.lead_time && <span>Lead time: <span className="font-medium text-foreground">{item.lead_time}</span></span>}
        </div>
        <a
          href={`https://wa.me/91${vendorPhone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
        >
          <MessageCircle className="h-4 w-4" />
          Enquire on WhatsApp
        </a>
      </div>
    </div>
  );
}

function EnquiryForm({ vendorId, userId, vendorName }: { vendorId: string; userId?: string; vendorName: string }) {
  const [form, setForm] = useState({
    name: "", phone: "", message: "",
    quantity: "", material: "", deadline: "", budget: "",
  });
  const [busy, setBusy] = useState(false);
  const [advanced, setAdvanced] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return;
    setBusy(true);

    // Build a detailed message
    let fullMessage = form.message;
    if (form.quantity) fullMessage += `\nQuantity: ${form.quantity}`;
    if (form.material) fullMessage += `\nMaterial: ${form.material}`;
    if (form.deadline) fullMessage += `\nDeadline: ${form.deadline}`;
    if (form.budget) fullMessage += `\nBudget: ${form.budget}`;

    const { error } = await supabase.from("enquiries").insert({
      vendor_id: vendorId,
      customer_id: userId ?? null,
      name: form.name,
      phone: form.phone,
      message: fullMessage,
      channel: "form",
    });
    setBusy(false);
    if (error) toast.error("Failed to send enquiry");
    else {
      toast.success("Enquiry sent! The vendor will get back to you soon.");
      setForm({ name: "", phone: "", message: "", quantity: "", material: "", deadline: "", budget: "" });
      setAdvanced(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-bold">Send Requirement</h3>
      <p className="mb-4 text-sm text-muted-foreground">Get a quote from {vendorName}.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div><Label>Your name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required /></div>
        <div><Label>Phone / WhatsApp</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" required /></div>
        <div><Label>Requirement</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Describe what you need…" required /></div>

        {/* Advanced IndiaMart-style fields */}
        <button
          type="button"
          onClick={() => setAdvanced(!advanced)}
          className="flex w-full items-center justify-between rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition"
        >
          {advanced ? "Hide details" : "Add details (quantity, material, budget)"}
          <ChevronRight className={`h-3.5 w-3.5 transition ${advanced ? "rotate-90" : ""}`} />
        </button>

        {advanced && (
          <div className="space-y-3 rounded-lg bg-muted/40 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Quantity / Volume</Label>
                <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 50 pieces" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Material</Label>
                <Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="e.g. MS, CI, Aluminium" className="mt-1" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Deadline</Label>
                <Input value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} placeholder="e.g. Within 1 week" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Budget (₹)</Label>
                <Input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. ₹5,000–₹10,000" className="mt-1" />
              </div>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Sending…" : "Submit Enquiry"}
        </Button>
      </form>
    </div>
  );
}

function AddReviewForm({ vendorId, onReviewed }: { vendorId: string; onReviewed: () => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [jobType, setJobType] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast.error("Please sign in to write a review");
      setBusy(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      vendor_id: vendorId,
      customer_id: u.user.id,
      rating,
      title: title || null,
      body: body || null,
      job_type: jobType || null,
      is_verified: true,
    } as any);

    setBusy(false);
    if (error) {
      toast.error(error.message || "Failed to submit review");
    } else {
      toast.success("Thank you! Your review has been published.");
      setTitle("");
      setBody("");
      setJobType("");
      setOpen(false);
      onReviewed();
    }
  };

  if (!open) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <h4 className="font-semibold text-foreground">Worked with this workshop?</h4>
          <p className="text-xs text-muted-foreground">Share your experience to help other industrial buyers.</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm">
          Write a Review
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/40 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h4 className="font-display font-bold text-foreground">Write a Review</h4>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-1 block text-sm">Rating *</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform"
              >
                <Star className={`h-6 w-6 ${star <= rating ? "fill-amber-400" : "text-muted-foreground/30"}`} />
              </button>
            ))}
            <span className="ml-2 text-sm font-bold text-foreground">{rating} / 5</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Review Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Great quality CNC turning" />
          </div>
          <div>
            <Label>Job / Service Type</Label>
            <Input value={jobType} onChange={(e) => setJobType(e.target.value)} placeholder="e.g. Batch Turning, Welding" />
          </div>
        </div>

        <div>
          <Label>Your Review &amp; Comments</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Describe the quality, turnaround time, accuracy..." required />
        </div>

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </div>
  );
}
