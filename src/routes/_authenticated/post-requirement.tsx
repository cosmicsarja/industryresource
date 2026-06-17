import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/post-requirement")({
  head: () => ({ meta: [{ title: "Post a Requirement | IndustrialBelgaum.com" }] }),
  component: PostRequirementPage,
});

const ZONES = ["Udyambag", "Auto Nagar", "Machhe KIADB", "Gokul Road", "Khanapur Road", "Bogarves", "Shahapur", "Other"];
const BUDGETS = ["₹0 - ₹5,000", "₹5,000 - ₹25,000", "₹25,000 - ₹1,00,000", "₹1,00,000+"];

function PostRequirementPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category_id: "", zone_preference: "", material: "",
    quantity: "", budget_range: "", deadline: "", is_urgent: false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { toast.error("Not signed in"); setBusy(false); return; }

    const payload = {
      customer_id: u.user.id,
      title: form.title,
      description: form.description,
      category_id: form.category_id || null,
      zone_preference: form.zone_preference || null,
      material: form.material || null,
      quantity: form.quantity || null,
      budget_range: form.budget_range || null,
      deadline: form.deadline || null,
      is_urgent: form.is_urgent,
    };
    const { error } = await supabase.from("requirements").insert(payload);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Requirement posted!"); navigate({ to: "/requirements" }); }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto max-w-2xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-bold">Post a Requirement</h1>
        <p className="mt-1 text-sm text-muted-foreground">Describe your job. Vendors will send you quotes.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-lg border border-border bg-card p-6">
          <div><Label>Job title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={120} /></div>
          <div><Label>Description *</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required maxLength={2000} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preferred zone</Label>
              <Select value={form.zone_preference} onValueChange={(v) => setForm({ ...form, zone_preference: v })}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>{ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Material</Label><Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} /></div>
            <div><Label>Quantity</Label><Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div>
              <Label>Budget</Label>
              <Select value={form.budget_range} onValueChange={(v) => setForm({ ...form, budget_range: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{BUDGETS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 p-3">
            <Switch checked={form.is_urgent} onCheckedChange={(v) => setForm({ ...form, is_urgent: v })} />
            <Label>Mark as urgent</Label>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>{busy ? "Posting…" : "Post Requirement"}</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
