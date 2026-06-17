import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/register-vendor")({
  head: () => ({ meta: [{ title: "List Your Business | IndustrialBelgaum.com" }] }),
  component: RegisterVendorPage,
});

const ZONES = ["Udyambag", "Auto Nagar", "Machhe KIADB", "Gokul Road", "Khanapur Road", "Bogarves", "Shahapur", "Other"];
const PLANS = [
  { name: "free", price: "₹0", features: ["Basic listing", "3 photos", "WhatsApp button"] },
  { name: "standard", price: "₹1,500/yr", features: ["10 photos", "Analytics", "Enhanced profile"] },
  { name: "premium", price: "₹4,000/yr", features: ["25 photos", "Priority ranking", "Verified badge"] },
  { name: "gold", price: "₹8,000/yr", features: ["50 photos", "Priority leads", "Dedicated support"] },
];

interface Machine { name: string; count: string; brand: string }

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function RegisterVendorPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    business_name: "", category_id: "", zone: "Other", phone: "", whatsapp: "", email: "",
    established_year: "", employee_count: "", full_address: "",
    description: "", description_kn: "",
    subscription_plan: "free" as "free" | "standard" | "premium" | "gold",
  });
  const [machines, setMachines] = useState<Machine[]>([{ name: "", count: "", brand: "" }]);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async () => {
    if (!user) return;
    setBusy(true);
    const baseSlug = slugify(form.business_name);
    const slug = baseSlug + "-" + Math.random().toString(36).slice(2, 6);

    // Ensure user has vendor role
    await supabase.from("user_roles").insert({ user_id: user.id, role: "vendor" }).select();

    const machineList = machines.filter((m) => m.name).map((m) => ({
      name: m.name, count: m.count ? parseInt(m.count) : undefined, brand: m.brand || undefined,
    }));

    const { data, error } = await supabase.from("vendors").insert({
      user_id: user.id,
      business_name: form.business_name,
      slug,
      category_id: form.category_id || null,
      zone: form.zone as never,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      email: form.email || null,
      established_year: form.established_year ? parseInt(form.established_year) : null,
      employee_count: form.employee_count || null,
      full_address: form.full_address || null,
      description: form.description || null,
      description_kn: form.description_kn || null,
      machine_list: machineList,
      subscription_plan: form.subscription_plan,
    }).select("slug").maybeSingle();

    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Your workshop is listed!");
    if (data?.slug) navigate({ to: "/vendor/$slug", params: { slug: data.slug } });
    else navigate({ to: "/browse" });
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <header className="border-b border-border bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4 py-10">
          <h1 className="font-display text-3xl font-bold md:text-4xl">List Your Business</h1>
          <p className="mt-1 text-primary-foreground/80">Reach thousands of customers in Belagavi. Free to start.</p>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl flex-1 px-4 py-10">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-between">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex flex-1 items-center">
              <div className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${step >= n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{step > n ? <CheckCircle2 className="h-5 w-5" /> : n}</div>
              {n < 4 && <div className={`h-0.5 flex-1 ${step > n ? "bg-primary" : "bg-secondary"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Step 1 · Basic Info</h2>
              <div><Label>Business name *</Label><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} required /></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Category *</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Zone *</Label>
                  <Select value={form.zone} onValueChange={(v) => setForm({ ...form, zone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
                <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="Defaults to phone" /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Established year</Label><Input type="number" value={form.established_year} onChange={(e) => setForm({ ...form, established_year: e.target.value })} /></div>
                <div><Label>Employee count</Label><Input placeholder="e.g. 5-10" value={form.employee_count} onChange={(e) => setForm({ ...form, employee_count: e.target.value })} /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Step 2 · Location</h2>
              <div><Label>Full address *</Label><Textarea rows={4} value={form.full_address} onChange={(e) => setForm({ ...form, full_address: e.target.value })} /></div>
              <p className="text-xs text-muted-foreground">Map pin selection coming soon — for now, address is enough.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Step 3 · Details</h2>
              <div><Label>Description (English)</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Description (ಕನ್ನಡ)</Label><Textarea rows={4} value={form.description_kn} onChange={(e) => setForm({ ...form, description_kn: e.target.value })} /></div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Machines</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setMachines([...machines, { name: "", count: "", brand: "" }])}><Plus className="mr-1 h-3.5 w-3.5" />Add</Button>
                </div>
                <div className="space-y-2">
                  {machines.map((m, i) => (
                    <div key={i} className="grid gap-2 rounded-md border border-border p-2 md:grid-cols-[2fr_1fr_1fr_auto]">
                      <Input placeholder="Machine name" value={m.name} onChange={(e) => { const c = [...machines]; c[i].name = e.target.value; setMachines(c); }} />
                      <Input placeholder="Count" value={m.count} onChange={(e) => { const c = [...machines]; c[i].count = e.target.value; setMachines(c); }} />
                      <Input placeholder="Brand" value={m.brand} onChange={(e) => { const c = [...machines]; c[i].brand = e.target.value; setMachines(c); }} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setMachines(machines.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Step 4 · Choose Plan</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {PLANS.map((p) => (
                  <button key={p.name} type="button" onClick={() => setForm({ ...form, subscription_plan: p.name as never })}
                    className={`rounded-lg border-2 p-4 text-left transition ${form.subscription_plan === p.name ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-display text-lg font-bold capitalize">{p.name}</div>
                      <div className="font-bold">{p.price}</div>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {p.features.map((f) => <li key={f}>· {f}</li>)}
                    </ul>
                  </button>
                ))}
              </div>
              {form.subscription_plan !== "free" && (
                <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-foreground">
                  Payment gateway integration (Razorpay) will activate once keys are configured. Your listing will be created as Free until then.
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={back} disabled={step === 1}>Back</Button>
            {step < 4 ? (
              <Button onClick={next} disabled={step === 1 && (!form.business_name || !form.phone || !form.category_id)}>Next</Button>
            ) : (
              <Button onClick={onSubmit} disabled={busy}>{busy ? "Submitting…" : "Submit listing"}</Button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Need help? <Link to="/" className="text-primary hover:underline">Contact us</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
