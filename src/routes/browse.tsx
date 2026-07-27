import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { VendorCard, type VendorCardData } from "@/components/vendor-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { CITY_ZONES, CITIES } from "@/lib/marketplace";
import { Search, SlidersHorizontal, X, Factory } from "lucide-react";
import {
  Sheet, SheetContent, SheetTrigger,
} from "@/components/ui/sheet";

const PLANS = ["free", "standard", "premium", "gold"];

const search = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  zone: z.string().optional(),
  plan: z.string().optional(),
  verified: z.coerce.boolean().optional(),
  sort: z.enum(["rating", "newest"]).optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Browse Industrial Vendors | IndustryResource" },
      { name: "description", content: "Browse verified industrial workshops by city, zone, category, and rating. Multi-city coverage with zone-level precision." },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const sp = Route.useSearch();
  const navigate = Route.useNavigate();
  const { t, lang } = useLanguage();
  const [q, setQ] = useState(sp.q ?? "");

  const setFilter = (patch: Record<string, unknown>) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }) as never });

  // When city changes, clear zone
  const handleCityChange = (v: string) =>
    setFilter({ city: v === "all" ? undefined : v, zone: undefined });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name,name_kn,slug").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const categoryId = useMemo(
    () => categories.find((c) => c.slug === sp.category)?.id,
    [categories, sp.category],
  );

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors", sp, categoryId],
    queryFn: async () => {
      let qb = supabase
        .from("vendors")
        .select("id,slug,business_name,description,zone,subscription_plan,is_verified,rating_avg,rating_count,phone,whatsapp,category:categories(name)")
        .eq("is_active", true);

      if (sp.q) qb = qb.ilike("business_name", `%${sp.q}%`);
      if (categoryId) qb = qb.eq("category_id", categoryId);
      if (sp.city) qb = qb.eq("city", sp.city as never);
      if (sp.zone) qb = qb.eq("zone", sp.zone as never);
      if (sp.plan) qb = qb.eq("subscription_plan", sp.plan as never);
      if (sp.verified) qb = qb.eq("is_verified", true);

      if (sp.sort === "newest") qb = qb.order("created_at", { ascending: false });
      else qb = qb.order("is_featured", { ascending: false }).order("rating_avg", { ascending: false });

      const { data } = await qb.limit(60);
      return (data ?? []) as VendorCardData[];
    },
  });

  // Load primary photos for each vendor
  const vendorIds = vendors.map((v) => v.id);
  const { data: primaryPhotos = {} } = useQuery({
    queryKey: ["vendor-primary-photos", vendorIds],
    enabled: vendorIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("vendor_photos")
        .select("vendor_id,photo_url,is_primary,sort_order")
        .in("vendor_id", vendorIds)
        .order("is_primary", { ascending: false })
        .order("sort_order");
      const map: Record<string, string> = {};
      for (const p of data ?? []) {
        if (!map[p.vendor_id] || p.is_primary) map[p.vendor_id] = p.photo_url;
      }
      return map;
    },
  });

  // Zones available for the selected city
  const zonesForCity = sp.city ? (CITY_ZONES[sp.city] ?? []) : Object.values(CITY_ZONES).flat().filter((v, i, a) => a.indexOf(v) === i);

  const Filters = (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("category")}</Label>
        <Select value={sp.category ?? "all"} onValueChange={(v) => setFilter({ category: v === "all" ? undefined : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.slug}>{lang === "kn" ? c.name_kn || c.name : c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("city")}</Label>
        <Select value={sp.city ?? "all"} onValueChange={handleCityChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCities")}</SelectItem>
            {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("zone")}</Label>
        <Select value={sp.zone ?? "all"} onValueChange={(v) => setFilter({ zone: v === "all" ? undefined : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allZones")}</SelectItem>
            {zonesForCity.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("plan")}</Label>
        <Select value={sp.plan ?? "all"} onValueChange={(v) => setFilter({ plan: v === "all" ? undefined : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {PLANS.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="verified" checked={!!sp.verified} onCheckedChange={(v) => setFilter({ verified: v ? true : undefined })} />
        <Label htmlFor="verified" className="text-sm">Verified only</Label>
      </div>
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("sortBy")}</Label>
        <Select value={sp.sort ?? "rating"} onValueChange={(v) => setFilter({ sort: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">{t("bestMatch")}</SelectItem>
            <SelectItem value="newest">{t("newest")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(sp.category || sp.city || sp.zone || sp.plan || sp.verified || sp.q) && (
        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate({ search: {} })}>
          <X className="mr-2 h-3.5 w-3.5" /> Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="border-b border-border bg-card/40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-display text-2xl font-bold md:text-3xl">Browse Industrial Vendors</h1>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setFilter({ q: q || undefined })} placeholder={t("searchPlaceholder")} className="pl-9" aria-label="Search vendors" />
            </div>
            <Button onClick={() => setFilter({ q: q || undefined })}>{t("findVendors")}</Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden" aria-label="Open filters"><SlidersHorizontal className="h-4 w-4" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-6">{Filters}</SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex flex-1 gap-8 px-4 py-8">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24">{Filters}</div>
        </aside>

        <main className="flex-1">
          <p className="mb-4 text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${vendors.length} ${t("vendors")}`}
          </p>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-muted" />
                      <div className="h-3 w-1/3 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-4/5 rounded bg-muted" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="h-8 flex-1 rounded bg-muted" />
                    <div className="h-8 flex-1 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Factory className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
              </div>
              <p className="font-medium text-foreground">{t("noResults")}</p>
              <p className="mt-1 text-sm text-muted-foreground">Try removing a filter or broadening your search.</p>
              <Button variant="outline" size="sm" className="mt-5" onClick={() => navigate({ search: {} })}>
                <X className="mr-2 h-3.5 w-3.5" /> Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.map((v) => <VendorCard key={v.id} v={{ ...v, primary_photo: primaryPhotos[v.id] ?? null }} />)}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
