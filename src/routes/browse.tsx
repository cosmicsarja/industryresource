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
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet, SheetContent, SheetTrigger,
} from "@/components/ui/sheet";

const ZONES = ["Udyambag", "Auto Nagar", "Machhe KIADB", "Gokul Road", "Khanapur Road", "Bogarves", "Shahapur", "Other"];
const PLANS = ["free", "standard", "premium", "gold"];

const search = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  zone: z.string().optional(),
  plan: z.string().optional(),
  verified: z.coerce.boolean().optional(),
  sort: z.enum(["rating", "newest"]).optional(),
});

export const Route = createFileRoute("/browse")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Browse Industrial Vendors in Belagavi | IndustrialBelgaum.com" },
      { name: "description", content: "Browse verified industrial workshops in Belagavi by category, zone, and rating." },
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
    navigate({ search: (prev) => ({ ...prev, ...patch }) as never });

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
      if (sp.zone) qb = qb.eq("zone", sp.zone as never);
      if (sp.plan) qb = qb.eq("subscription_plan", sp.plan as never);
      if (sp.verified) qb = qb.eq("is_verified", true);

      if (sp.sort === "newest") qb = qb.order("created_at", { ascending: false });
      else qb = qb.order("is_featured", { ascending: false }).order("rating_avg", { ascending: false });

      const { data } = await qb.limit(60);
      return (data ?? []) as VendorCardData[];
    },
  });

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
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("zone")}</Label>
        <Select value={sp.zone ?? "all"} onValueChange={(v) => setFilter({ zone: v === "all" ? undefined : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allZones")}</SelectItem>
            {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
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
      {(sp.category || sp.zone || sp.plan || sp.verified || sp.q) && (
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
              <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setFilter({ q: q || undefined })} placeholder={t("searchPlaceholder")} className="pl-9" />
            </div>
            <Button onClick={() => setFilter({ q: q || undefined })}>{t("findVendors")}</Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden"><SlidersHorizontal className="h-4 w-4" /></Button>
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
          {vendors.length === 0 && !isLoading ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">{t("noResults")}</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.map((v) => <VendorCard key={v.id} v={v} />)}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
