import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { VendorCard, type VendorCardData } from "@/components/vendor-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;
import { Search, ShieldCheck, MessageCircle, Languages, Hammer, Factory, CheckCircle2, ArrowRight, Tag, Megaphone, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Find Industrial Workshops in Belagavi | IndustrialBelgaum.com" },
      { name: "description", content: "Search 2,500+ verified industrial vendors in Belagavi — CNC, lathe, welding, fabrication, hydraulic repair and more. Connect directly via WhatsApp." },
    ],
  }),
  component: HomePage,
});

const ZONES = ["Udyambag", "Auto Nagar", "Machhe KIADB", "Gokul Road", "Khanapur Road", "Bogarves", "Shahapur", "Other"];

function HomePage() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("all");
  const [zone, setZone] = useState<string>("all");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name,name_kn,slug,icon").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const { data: featured = [] } = useQuery({
    queryKey: ["featured-vendors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendors")
        .select("id,slug,business_name,description,zone,subscription_plan,is_verified,rating_avg,rating_count,phone,whatsapp,category:categories(name)")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("rating_avg", { ascending: false })
        .limit(6);
      return (data ?? []) as VendorCardData[];
    },
  });

  const { data: latestReqs = [] } = useQuery({
    queryKey: ["latest-requirements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("requirements")
        .select("id,title,description,budget_range,zone_preference,is_urgent,created_at,category:categories(name)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: latestClassifieds = [] } = useQuery({
    queryKey: ["latest-classifieds-home"],
    queryFn: async () => {
      const { data } = await db
        .from("classified_listings")
        .select("id,listing_type,title,price_type,price,price_unit,zone,is_urgent,created_at,photo_urls,vendor:vendors(business_name)")
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("is_urgent", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });

  const onSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (categorySlug !== "all") params.set("category", categorySlug);
    if (zone !== "all") params.set("zone", zone);
    navigate({ to: "/browse", search: Object.fromEntries(params) as never });
  };

  const stats = [
    { v: "2,500+", k: "Industrial Units" },
    { v: "₹4,200 Cr", k: "Annual Turnover" },
    { v: "20+", k: "Service Categories" },
    { v: "0", k: "Dedicated Platforms Before Us" },
  ];

  const why = [
    { icon: MapPin, t: "Belagavi-Only Focus", d: "Hyper-local. Every vendor is from Belagavi." },
    { icon: ShieldCheck, t: "Verified Listings", d: "Real workshops, real machines, real reviews." },
    { icon: Languages, t: "Kannada Support", d: "Full ಕನ್ನಡ language toggle across the site." },
    { icon: MessageCircle, t: "WhatsApp Connect", d: "Direct chat with vendors. No middlemen." },
    { icon: CheckCircle2, t: "Free to List", d: "Start with a free vendor profile." },
    { icon: Hammer, t: "Machine-Level Search", d: "Find vendors by exact machine capability." },
  ];

  const plans = [
    { name: "free",    price: "₹0",    popular: false, features: ["Basic listing", "3 photos", "WhatsApp button"] },
    { name: "premium", price: "₹4,000", popular: true,  features: ["25 photos", "Priority ranking", "Verified badge", "Homepage feature"] },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Belagavi's first industrial marketplace
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 text-base text-primary-foreground/80 md:text-lg">{t("heroSub")}</p>

            <div className="mx-auto mt-8 grid max-w-3xl gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur md:grid-cols-[1.6fr_1fr_1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t("searchPlaceholder")} className="h-11 border-0 bg-background pl-9 text-foreground" onKeyDown={(e) => e.key === "Enter" && onSearch()} />
              </div>
              <Select value={categorySlug} onValueChange={setCategorySlug}>
                <SelectTrigger className="h-11 border-0 bg-background text-foreground"><SelectValue placeholder={t("category")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{lang === "kn" ? c.name_kn || c.name : c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger className="h-11 border-0 bg-background text-foreground"><SelectValue placeholder={t("zone")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allZones")}</SelectItem>
                  {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={onSearch} size="lg" className="h-11 bg-accent text-accent-foreground hover:bg-accent/90">
                {t("findVendors")}
              </Button>
            </div>
          </div>

          {/* STATS */}
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.k} className="rounded-lg border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur">
                <div className="font-display text-2xl font-bold md:text-3xl text-accent">{s.v}</div>
                <div className="mt-1 text-xs text-primary-foreground/70">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-16">
        <SectionHeading title={t("featuredCategories")} subtitle="20 specialized industrial categories serving Belagavi" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((c) => (
            <Link key={c.id} to="/browse" search={{ category: c.slug } as never} className="group rounded-lg border border-border bg-card p-4 text-center transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                <Factory className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold text-foreground line-clamp-2">{lang === "kn" ? c.name_kn || c.name : c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED VENDORS */}
      <section className="bg-card/40 py-16">
        <div className="container mx-auto px-4">
          <SectionHeading title={t("topRated")} subtitle="The highest rated workshops on the platform" />
          {featured.length === 0 ? (
            <EmptyMsg text="No vendors listed yet. Be the first to list your workshop!" cta={{ to: "/register-vendor", label: t("listBusiness") }} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((v) => <VendorCard key={v.id} v={v} />)}
            </div>
          )}
          <div className="mt-8 text-center">
            <Button asChild variant="outline" size="lg"><Link to="/browse">View all vendors <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 py-16">
        <SectionHeading title={t("howItWorks")} subtitle="Three steps from requirement to delivery" />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: 1, title: t("step1"), d: "Use search or browse 20+ categories." },
            { n: 2, title: t("step2"), d: "Compare ratings, machines, and zones." },
            { n: 3, title: t("step3"), d: "Direct chat. Get quotes in minutes." },
          ].map((s) => (
            <div key={s.n} className="relative rounded-lg border border-border bg-card p-6">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-accent text-accent-foreground font-display text-lg font-bold">{s.n}</div>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REQUIREMENTS PREVIEW */}
      <section className="bg-card/40 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Open Requirements</h2>
              <p className="text-sm text-muted-foreground">Latest jobs from Belagavi customers</p>
            </div>
            <Button asChild variant="outline" size="sm"><Link to="/requirements">View all</Link></Button>
          </div>
          {latestReqs.length === 0 ? (
            <EmptyMsg text="No open requirements right now." cta={{ to: "/post-requirement", label: t("postRequirement") }} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {latestReqs.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground line-clamp-1">{r.title}</h3>
                    {r.is_urgent && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">URGENT</span>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {r.category && <span className="font-medium text-primary">{r.category.name}</span>}
                    {r.zone_preference && <span>· {r.zone_preference}</span>}
                    {r.budget_range && <span>· {r.budget_range}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MARKETPLACE PREVIEW */}
      <section className="container mx-auto px-4 py-16">
        <SectionHeading title="Marketplace" subtitle="Buy and sell machines, materials, and spare parts" />
        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/machines" className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg">
            <div className="mb-2 inline-grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary"><Hammer className="h-5 w-5" /></div>
            <h3 className="font-display text-xl font-bold">Machines for Sale</h3>
            <p className="mt-1 text-sm text-muted-foreground">New and used industrial machines from verified Belagavi sellers. Direct contact, no middlemen.</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Browse machines <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
          </Link>
          <Link to="/materials" className="group rounded-xl border border-border bg-card p-6 transition hover:border-accent/40 hover:shadow-lg">
            <div className="mb-2 inline-grid h-10 w-10 place-items-center rounded-md bg-accent/10 text-accent"><CheckCircle2 className="h-5 w-5" /></div>
            <h3 className="font-display text-xl font-bold">Materials & Spares</h3>
            <p className="mt-1 text-sm text-muted-foreground">Raw materials, bearings, hoses, casting scrap. Enquire directly or buy online.</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">Browse materials <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
          </Link>
        </div>
      </section>

      {/* CLASSIFIEDS PREVIEW */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-16 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                <Tag className="h-3 w-3" /> Industrial Classifieds
              </div>
              <h2 className="font-display text-3xl font-bold">Latest Listings</h2>
              <p className="text-sm text-muted-foreground">Job work, machines for sale, materials wanted</p>
            </div>
            <Button asChild variant="outline" size="sm"><Link to="/listings">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
          </div>
          {latestClassifieds.length === 0 ? (
            <EmptyMsg text="No listings yet. Be the first to post!" cta={{ to: "/listings", label: "Browse Classifieds" }} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latestClassifieds.map((listing: any) => (
                <Link
                  key={listing.id}
                  to="/listings/$id"
                  params={{ id: listing.id }}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-orange-300/60 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {listing.photo_urls?.[0] ? (
                      <img src={listing.photo_urls[0]} alt={listing.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Megaphone className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    {listing.is_urgent && (
                      <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                        <Zap className="h-3 w-3" /> Urgent
                      </span>
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold capitalize text-white">
                      {listing.listing_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold leading-tight">{listing.title}</p>
                    <div className="mt-1 font-display text-base font-bold text-orange-600">
                      {listing.price_type === "contact" || !listing.price
                        ? "Contact for price"
                        : `₹${Number(listing.price).toLocaleString("en-IN")}${listing.price_unit ? " / " + listing.price_unit : ""}`}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {listing.vendor?.business_name}{listing.zone && ` · ${listing.zone}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ZONES */}

      <section className="container mx-auto px-4 py-16">
        <SectionHeading title={t("industrialZones")} subtitle="Explore vendors by Belagavi's industrial hubs" />
        <div className="grid gap-3 md:grid-cols-3">
          {ZONES.filter(z => z !== "Other").map((z) => (
            <Link key={z} to="/browse" search={{ zone: z } as never} className="group rounded-lg border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-foreground">{z}</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Industrial zone of Belagavi</p>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-card/40 py-16">
        <div className="container mx-auto px-4">
          <SectionHeading title={t("whyUs")} subtitle="Built for Belagavi's industrial community" />
          <div className="grid gap-4 md:grid-cols-3">
            {why.map((f) => (
              <div key={f.t} className="rounded-lg border border-border bg-card p-5">
                <div className="mb-2 inline-grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></div>
                <h3 className="font-display font-semibold">{f.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="container mx-auto px-4 py-16">
        <SectionHeading title={t("pricing")} subtitle="Choose the plan that fits your workshop" />
        <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-xl border bg-card p-8 ${p.popular ? "border-accent shadow-xl" : "border-border"}`}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-0.5 text-xs font-semibold text-accent-foreground">Most Popular</span>}
              <div className="font-display text-xl font-bold capitalize">{p.name}</div>
              <div className="mt-2 font-display text-4xl font-bold">{p.price}<span className="text-sm font-medium text-muted-foreground">{p.price !== "₹0" && t("perYear")}</span></div>
              <ul className="my-5 space-y-3 text-sm text-muted-foreground">
                {p.features.map((f) => <li key={f} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />{f}</li>)}
              </ul>
              <Button asChild className="w-full" variant={p.popular ? "default" : "outline"} size="lg">
                <Link to="/register-vendor">{t("getStarted")}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function MapPin({ className }: { className?: string }) {
  return <Factory className={className} />;
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function EmptyMsg({ text, cta }: { text: string; cta?: { to: string; label: string } }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      {cta && (
        <Button asChild className="mt-4" size="sm">
          <Link to={cta.to as never}>{cta.label}</Link>
        </Button>
      )}
    </div>
  );
}
