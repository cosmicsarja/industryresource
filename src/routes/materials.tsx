import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MaterialCard } from "@/components/marketplace/material-card";
import { useMaterials, useCategories, ZONES, type MaterialFilters } from "@/lib/marketplace";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus } from "lucide-react";

export const Route = createFileRoute("/materials")({
  head: () => ({ meta: [
    { title: "Industrial Materials & Spares — Verified Suppliers | IndustryResource" },
    { name: "description", content: "Buy raw materials, spare parts and components from verified industrial suppliers. Order online or enquire directly." },
  ] }),
  component: MaterialsPage,
});

function MaterialsPage() {
  const [f, setF] = useState<MaterialFilters>({ sort: "newest" });
  const { data: cats = [] } = useCategories();
  const { data: materials = [], isLoading } = useMaterials(f);

  const ids = useMemo(() => materials.map((m) => m.id), [materials]);
  const { data: primaryPhotos = {} } = useQuery({
    queryKey: ["material-primary-photos", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("material_photos").select("material_id,photo_url,is_primary,sort_order").in("material_id", ids).order("sort_order");
      const map: Record<string, string> = {};
      for (const p of data ?? []) {
        if (!map[p.material_id] || p.is_primary) map[p.material_id] = p.photo_url;
      }
      return map;
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="bg-gradient-to-br from-primary to-primary/80 py-10 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">Industrial Materials & Spares</h1>
              <p className="mt-1 text-sm text-primary-foreground/80">Raw materials, spare parts, components. Order online or enquire directly.</p>
            </div>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/materials/new"><Plus className="mr-1.5 h-4 w-4" /> Sell Materials</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 rounded-lg border border-border bg-card p-4 lg:sticky lg:top-20 lg:h-fit">
          <h2 className="font-display font-bold">Filters</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search materials..." className="pl-8" value={f.q ?? ""} onChange={(e) => setF({ ...f, q: e.target.value })} />
          </div>
          <FSelect label="Category" value={f.category ?? "all"} onChange={(v) => setF({ ...f, category: v === "all" ? null : v })} options={[{ value: "all", label: "All" }, ...cats.map((c) => ({ value: c.id, label: c.name }))]} />
          <FSelect label="Zone" value={f.zone ?? "all"} onChange={(v) => setF({ ...f, zone: v === "all" ? null : v })} options={[{ value: "all", label: "All" }, ...ZONES.map((z) => ({ value: z, label: z }))]} />
          <div className="flex items-center justify-between rounded-md border border-border p-2.5">
            <label className="text-sm font-medium">In stock only</label>
            <Switch checked={!!f.inStockOnly} onCheckedChange={(v) => setF({ ...f, inStockOnly: v || null })} />
          </div>
          <FSelect label="Sort" value={f.sort ?? "newest"} onChange={(v) => setF({ ...f, sort: v as MaterialFilters["sort"] })} options={[{ value: "newest", label: "Newest" }, { value: "price_low", label: "Price: Low to High" }, { value: "price_high", label: "Price: High to Low" }]} />
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground">{isLoading ? "Loading…" : `${materials.length} listings found`}</p>
          {!isLoading && materials.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No materials listed yet. Be the first to sell here.</p>
              <Button asChild className="mt-4"><Link to="/materials/new">Sell Materials</Link></Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {materials.map((m) => (
                <MaterialCard key={m.id} m={{ ...m, primary_photo: primaryPhotos[m.id] }} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
