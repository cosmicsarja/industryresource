import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MachineCard } from "@/components/marketplace/machine-card";
import { useMachines, useCategories, ZONES, CONDITIONS, type MachineFilters } from "@/lib/marketplace";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus } from "lucide-react";

export const Route = createFileRoute("/machines")({
  head: () => ({ meta: [
    { title: "Buy & Sell Industrial Machines in Belagavi | IndustrialBelgaum.com" },
    { name: "description", content: "Browse new and used industrial machines for sale in Belagavi — CNC, lathe, presses, welding, fabrication. Direct contact with verified sellers." },
  ] }),
  component: MachinesPage,
});

function MachinesPage() {
  const [f, setF] = useState<MachineFilters>({ sort: "newest" });
  const { data: cats = [] } = useCategories();
  const { data: machines = [], isLoading } = useMachines(f);

  const ids = useMemo(() => machines.map((m) => m.id), [machines]);
  const { data: primaryPhotos = {} } = useQuery({
    queryKey: ["machine-primary-photos", ids],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("machine_photos").select("machine_id,photo_url,is_primary,sort_order").in("machine_id", ids).order("sort_order");
      const map: Record<string, string> = {};
      for (const p of data ?? []) {
        if (!map[p.machine_id] || p.is_primary) map[p.machine_id] = p.photo_url;
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
              <h1 className="font-display text-3xl font-bold md:text-4xl">Buy & Sell Industrial Machines</h1>
              <p className="mt-1 text-sm text-primary-foreground/80">Verified sellers. Real machines. Direct contact, no middlemen.</p>
            </div>
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/machines/new"><Plus className="mr-1.5 h-4 w-4" /> Sell Your Machine</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 rounded-lg border border-border bg-card p-4 lg:sticky lg:top-20 lg:h-fit">
          <h2 className="font-display font-bold">Filters</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search machines..." className="pl-8" value={f.q ?? ""} onChange={(e) => setF({ ...f, q: e.target.value })} />
          </div>
          <FSelect label="Category" value={f.category ?? "all"} onChange={(v) => setF({ ...f, category: v === "all" ? null : v })} options={[{ value: "all", label: "All" }, ...cats.map((c) => ({ value: c.id, label: c.name }))]} />
          <FSelect label="Condition" value={f.condition ?? "all"} onChange={(v) => setF({ ...f, condition: v === "all" ? null : v })} options={[{ value: "all", label: "All" }, ...CONDITIONS.map((c) => ({ value: c.value, label: c.label }))]} />
          <FSelect label="Zone" value={f.zone ?? "all"} onChange={(v) => setF({ ...f, zone: v === "all" ? null : v })} options={[{ value: "all", label: "All" }, ...ZONES.map((z) => ({ value: z, label: z }))]} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Min ₹" value={f.minPrice ?? ""} onChange={(e) => setF({ ...f, minPrice: e.target.value ? Number(e.target.value) : null })} />
            <Input type="number" placeholder="Max ₹" value={f.maxPrice ?? ""} onChange={(e) => setF({ ...f, maxPrice: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <FSelect label="Sort" value={f.sort ?? "newest"} onChange={(v) => setF({ ...f, sort: v as MachineFilters["sort"] })} options={[{ value: "newest", label: "Newest" }, { value: "price_low", label: "Price: Low to High" }, { value: "price_high", label: "Price: High to Low" }]} />
        </aside>

        <div>
          <p className="mb-4 text-sm text-muted-foreground">{isLoading ? "Loading…" : `${machines.length} machines found`}</p>
          {!isLoading && machines.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No machines listed yet. Be the first to sell here.</p>
              <Button asChild className="mt-4"><Link to="/machines/new">Sell Your Machine</Link></Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {machines.map((m) => (
                <MachineCard key={m.id} m={{ ...m, primary_photo: primaryPhotos[m.id] }} />
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
