import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { toast } from "sonner";
import { Phone, MapPin, Globe, Building2, Calendar, Users, Factory } from "lucide-react";

export const Route = createFileRoute("/vendor/$slug")({
  component: VendorPage,
});

interface Machine { name: string; count?: number; brand?: string }

function VendorPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useLanguage();
  const { user } = useAuth();

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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <PlanBadge plan={vendor.subscription_plan} />
                {vendor.is_verified && <VerifiedBadge />}
                {vendor.zone && <ZoneBadge zone={vendor.zone} />}
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold">{vendor.business_name}</h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                {vendor.category && <span>{vendor.category.name}</span>}
                <StarRating value={Number(vendor.rating_avg) || 0} count={vendor.rating_count} />
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
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="aspect-[16/10] bg-muted">
              {primary ? (
                <img src={primary} alt={vendor.business_name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground/40"><Factory className="h-20 w-20" /></div>
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

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="machines">Machines</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <p className="whitespace-pre-line text-sm text-foreground">
                {(lang === "kn" && vendor.description_kn) ? vendor.description_kn : vendor.description || "No description provided yet."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {vendor.established_year && <Fact icon={Calendar} label="Established" value={String(vendor.established_year)} />}
                {vendor.employee_count && <Fact icon={Users} label="Team size" value={vendor.employee_count} />}
                {vendor.website && <Fact icon={Globe} label="Website" value={vendor.website} />}
                {vendor.full_address && <Fact icon={MapPin} label="Address" value={vendor.full_address} />}
              </div>
              {vendor.certifications && vendor.certifications.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.certifications.map((c) => <span key={c} className="rounded-full bg-secondary px-3 py-1 text-xs">{c}</span>)}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="machines">
              {machines.length === 0 ? (
                <p className="text-sm text-muted-foreground">Machine details not provided.</p>
              ) : (
                <div className="divide-y divide-border rounded-lg border border-border">
                  {machines.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 text-sm">
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
            <TabsContent value="reviews" className="space-y-4">
              {reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{r.customer?.full_name || "Anonymous"}</div>
                    <StarRating value={r.rating} />
                  </div>
                  {r.title && <h5 className="mt-2 font-semibold">{r.title}</h5>}
                  {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
                  {r.vendor_reply && (
                    <div className="mt-3 rounded-md border-l-2 border-primary bg-primary/5 p-3 text-sm">
                      <div className="font-semibold text-primary">Vendor's reply</div>
                      <p className="text-muted-foreground">{r.vendor_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4">
          <EnquiryForm vendorId={vendor.id} userId={user?.id} />
        </aside>
      </main>

      <Footer />
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

function EnquiryForm({ vendorId, userId }: { vendorId: string; userId?: string }) {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return;
    setBusy(true);
    const { error } = await supabase.from("enquiries").insert({
      vendor_id: vendorId,
      customer_id: userId ?? null,
      name: form.name,
      phone: form.phone,
      message: form.message,
      channel: "form",
    });
    setBusy(false);
    if (error) toast.error("Failed to send enquiry");
    else {
      toast.success("Enquiry sent! The vendor will get back to you soon.");
      setForm({ name: "", phone: "", message: "" });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-display text-lg font-bold">Send Enquiry</h3>
      <p className="mb-4 text-sm text-muted-foreground">Get a quote directly from this workshop.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div><Label>Your name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
        <div><Label>Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} required /></div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending…" : "Send Enquiry"}</Button>
      </form>
    </div>
  );
}
