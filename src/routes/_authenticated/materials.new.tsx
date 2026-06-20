import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/use-auth";
import { useCategories, useMyVendor, ZONES, UNITS, slugify } from "@/lib/marketplace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Upload, X, Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/materials/new")({
  component: NewMaterial,
});

function NewMaterial() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: vendor } = useMyVendor(user?.id);
  const { data: cats = [] } = useCategories();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", category_id: "", material_type: "", grade_or_spec: "",
    description: "", description_kn: "",
    unit: "kg", price_per_unit: "", min_order_quantity: "1", stock_quantity: "",
    allow_online_payment: false, zone: "",
  });
  const [specs, setSpecs] = useState<{ k: string; v: string }[]>([{ k: "", v: "" }]);
  const [files, setFiles] = useState<File[]>([]);

  if (!vendor) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold">You need a vendor profile first</h1>
          <p className="mt-2 text-muted-foreground">Register your business before listing materials.</p>
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

      const { data: inserted, error } = await supabase.from("material_listings").insert({
        vendor_id: vendor.id,
        title: form.title,
        slug: slugify(form.title),
        category_id: form.category_id || null,
        material_type: form.material_type || null,
        grade_or_spec: form.grade_or_spec || null,
        description: form.description || null,
        description_kn: form.description_kn || null,
        specifications: specsObj,
        unit: form.unit,
        price_per_unit: form.price_per_unit ? Number(form.price_per_unit) : null,
        min_order_quantity: Number(form.min_order_quantity) || 1,
        stock_quantity: form.stock_quantity ? Number(form.stock_quantity) : null,
        allow_online_payment: form.allow_online_payment,
        zone: form.zone || vendor.zone || null,
      }).select("id,slug").single();
      if (error) throw error;

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const path = `${vendor.id}/${inserted.id}/${Date.now()}-${i}-${f.name}`;
        const { error: upErr } = await supabase.storage.from("material-photos").upload(path, f);
        if (upErr) { toast.error(`Photo upload failed: ${upErr.message}`); continue; }
        const { data: pub } = supabase.storage.from("material-photos").getPublicUrl(path);
        await supabase.from("material_photos").insert({ material_id: inserted.id, photo_url: pub.publicUrl, is_primary: i === 0, sort_order: i });
      }

      toast.success("Your listing is live!");
      navigate({ to: "/materials/$slug", params: { slug: inserted.slug } });
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
        <h1 className="font-display text-3xl font-bold">List Materials / Spares for Sale</h1>

        <form onSubmit={submit} className="mt-6 space-y-6">
          <Card><CardContent className="space-y-3 p-5">
            <h2 className="font-display font-bold">Basic Information</h2>
            <Input required placeholder="Title (e.g. MS Sheet 5mm 4x8ft)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid gap-3 md:grid-cols-2">
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Material type (Bearings, MS Sheet...)" value={form.material_type} onChange={(e) => setForm({ ...form, material_type: e.target.value })} />
              <Input placeholder="Grade / Spec (e.g. IS 2062 Grade B)" value={form.grade_or_spec} onChange={(e) => setForm({ ...form, grade_or_spec: e.target.value })} className="md:col-span-2" />
            </div>
          </CardContent></Card>

          <Card><CardContent className="space-y-3 p-5">
            <h2 className="font-display font-bold">Pricing & Stock</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>per {u}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="Price per unit (₹)" value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })} />
              <Input type="number" placeholder="Minimum order qty" value={form.min_order_quantity} onChange={(e) => setForm({ ...form, min_order_quantity: e.target.value })} />
              <Input type="number" placeholder="Stock quantity" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
            </div>
            <div className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
              <Switch checked={form.allow_online_payment} onCheckedChange={(v) => setForm({ ...form, allow_online_payment: v })} />
              <div className="text-sm">
                <p className="font-medium">Allow online payments (Razorpay)</p>
                <p className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3 w-3" /> Platform charges 4% commission on online orders. Enquiry-only listings have no commission.
                </p>
              </div>
            </div>
          </CardContent></Card>

          <Card><CardContent className="space-y-3 p-5">
            <h2 className="font-display font-bold">Specifications</h2>
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Label" value={s.k} onChange={(e) => { const n = [...specs]; n[i].k = e.target.value; setSpecs(n); }} />
                <Input placeholder="Value" value={s.v} onChange={(e) => { const n = [...specs]; n[i].v = e.target.value; setSpecs(n); }} />
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
