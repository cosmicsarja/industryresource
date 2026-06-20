import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/use-auth";
import { useCategories, useMyVendor, ZONES, CONDITIONS, slugify } from "@/lib/marketplace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Upload, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/machines/new")({
  component: NewMachine,
});

function NewMachine() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: vendor } = useMyVendor(user?.id);
  const { data: cats = [] } = useCategories();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", category_id: "", machine_type: "", brand: "", model: "",
    manufacture_year: "", condition: "used_good", description: "", description_kn: "",
    price_type: "negotiable", asking_price: "", quantity_available: "1", zone: "",
  });
  const [specs, setSpecs] = useState<{ k: string; v: string }[]>([{ k: "", v: "" }]);
  const [files, setFiles] = useState<File[]>([]);

  if (!vendor) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold">You need a vendor profile first</h1>
          <p className="mt-2 text-muted-foreground">Register your business before listing machines.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/register-vendor" })}>Register Business</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const specsObj: Record<string, string> = {};
      for (const s of specs) if (s.k.trim()) specsObj[s.k.trim()] = s.v;

      const { data: inserted, error } = await supabase.from("machine_listings").insert({
        vendor_id: vendor.id,
        title: form.title,
        slug: slugify(form.title),
        category_id: form.category_id || null,
        machine_type: form.machine_type || null,
        brand: form.brand || null,
        model: form.model || null,
        manufacture_year: form.manufacture_year ? Number(form.manufacture_year) : null,
        condition: form.condition,
        description: form.description || null,
        description_kn: form.description_kn || null,
        specifications: specsObj,
        price_type: form.price_type,
        asking_price: form.price_type === "on_request" ? null : (form.asking_price ? Number(form.asking_price) : null),
        quantity_available: Number(form.quantity_available) || 1,
        zone: form.zone || vendor.zone || null,
      }).select("id,slug").single();
      if (error) throw error;

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const path = `${vendor.id}/${inserted.id}/${Date.now()}-${i}-${f.name}`;
        const { error: upErr } = await supabase.storage.from("machine-photos").upload(path, f);
        if (upErr) { toast.error(`Photo upload failed: ${upErr.message}`); continue; }
        const { data: pub } = supabase.storage.from("machine-photos").getPublicUrl(path);
        await supabase.from("machine_photos").insert({ machine_id: inserted.id, photo_url: pub.publicUrl, is_primary: i === 0, sort_order: i });
      }

      toast.success("Your machine is now listed!");
      navigate({ to: "/machines/$slug", params: { slug: inserted.slug } });
    } catch (err: any) {
      toast.error(err.message || "Failed to create listing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">List a Machine for Sale</h1>
        <p className="mt-1 text-sm text-muted-foreground">Reach buyers across Belagavi.</p>

        <form onSubmit={submit} className="mt-6 space-y-6">
          <Card><CardContent className="space-y-3 p-5">
            <h2 className="font-display font-bold">Basic Information</h2>
            <Input required placeholder="Title (e.g. Used CNC Lathe — Macpower 2018)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Machine type (CNC Lathe, Hydraulic Press...)" value={form.machine_type} onChange={(e) => setForm({ ...form, machine_type: e.target.value })} />
              <Input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              <Input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              <Input type="number" placeholder="Manufacture year" value={form.manufacture_year} onChange={(e) => setForm({ ...form, manufacture_year: e.target.value })} />
              <Input type="number" placeholder="Quantity available" value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: e.target.value })} />
            </div>
          </CardContent></Card>

          <Card><CardContent className="space-y-3 p-5">
            <h2 className="font-display font-bold">Condition</h2>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <button key={c.value} type="button" onClick={() => setForm({ ...form, condition: c.value })}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium ${form.condition === c.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </CardContent></Card>

          <Card><CardContent className="space-y-3 p-5">
            <h2 className="font-display font-bold">Pricing</h2>
            <Select value={form.price_type} onValueChange={(v) => setForm({ ...form, price_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="negotiable">Negotiable</SelectItem>
                <SelectItem value="on_request">On Request</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Asking price (₹)" disabled={form.price_type === "on_request"} value={form.asking_price} onChange={(e) => setForm({ ...form, asking_price: e.target.value })} />
          </CardContent></Card>

          <Card><CardContent className="space-y-3 p-5">
            <h2 className="font-display font-bold">Specifications</h2>
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Label (e.g. Power)" value={s.k} onChange={(e) => { const n = [...specs]; n[i].k = e.target.value; setSpecs(n); }} />
                <Input placeholder="Value (e.g. 5HP)" value={s.v} onChange={(e) => { const n = [...specs]; n[i].v = e.target.value; setSpecs(n); }} />
                <Button type="button" size="icon" variant="ghost" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => setSpecs([...specs, { k: "", v: "" }])}><Plus className="mr-1 h-4 w-4" /> Add spec</Button>
          </CardContent></Card>

          <Card><CardContent className="space-y-3 p-5">
            <h2 className="font-display font-bold">Description & Location</h2>
            <Textarea placeholder="Description (English)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Textarea placeholder="Description (Kannada) – optional" value={form.description_kn} onChange={(e) => setForm({ ...form, description_kn: e.target.value })} />
            <Select value={form.zone} onValueChange={(v) => setForm({ ...form, zone: v })}>
              <SelectTrigger><SelectValue placeholder="Zone" /></SelectTrigger>
              <SelectContent>{ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
            </Select>
          </CardContent></Card>

          <Card><CardContent className="space-y-3 p-5">
            <h2 className="font-display font-bold">Photos</h2>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-card p-6 text-sm text-muted-foreground hover:border-primary/40">
              <Upload className="h-4 w-4" /> Click to upload photos
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
            </label>
            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded border border-border">
                    <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 rounded-full bg-background/80 p-1">
                      <X className="h-3 w-3" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">PRIMARY</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>

          <Button type="submit" size="lg" disabled={saving} className="w-full">{saving ? "Publishing…" : "Publish Listing"}</Button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
