import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ConditionBadge, formatINR } from "@/components/marketplace/badges";
import { ZoneBadge, VerifiedBadge, StarRating } from "@/components/badges";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useMachine, useSubmitMachineEnquiry } from "@/lib/marketplace";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Phone, Hammer, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/machines/$slug")({
  head: ({ params }) => ({ meta: [
    { title: `Machine for Sale in Belagavi | ${params.slug} | IndustrialBelgaum.com` },
  ] }),
  component: MachineDetail,
});

function MachineDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: m, isLoading } = useMachine(slug);
  const enquire = useSubmitMachineEnquiry();
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({ buyer_name: "", buyer_phone: "", message: "", offered_price: "" });

  useEffect(() => {
    if (m?.id) supabase.rpc("increment_machine_view", { machine_uuid: m.id });
  }, [m?.id]);

  if (isLoading) return <div className="p-10 text-center">Loading…</div>;
  if (!m) return <div className="p-10 text-center">Listing not found. <Link to="/machines" className="text-primary underline">Back to machines</Link></div>;

  const photos = (m.photos ?? []).sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order);
  const primary = photos[active]?.photo_url;
  const vendor = m.vendor as any;
  const specs = (m.specifications ?? {}) as Record<string, string>;

  const onEnquire = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enquire.mutateAsync({
        machine_id: m.id,
        buyer_id: user?.id ?? null,
        buyer_name: form.buyer_name,
        buyer_phone: form.buyer_phone,
        message: form.message,
        offered_price: form.offered_price ? Number(form.offered_price) : null,
      });
      toast.success("Enquiry sent! The seller will contact you soon.");
      setForm({ buyer_name: "", buyer_phone: "", message: "", offered_price: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send enquiry");
    }
  };

  const saveListing = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const { error } = await supabase.from("saved_listings").insert({ buyer_id: user.id, listing_type: "machine", listing_id: m.id });
    if (error && error.code !== "23505") toast.error(error.message); else toast.success("Saved!");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/machines" className="text-sm text-muted-foreground hover:text-primary">← Back to machines</Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
              {primary ? <img src={primary} alt={m.title} className="h-full w-full object-cover" /> : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40"><Hammer className="h-24 w-24" /></div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {photos.map((p: any, i: number) => (
                  <button key={p.id} onClick={() => setActive(i)} className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded border-2 ${i === active ? "border-primary" : "border-transparent"}`}>
                    <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ConditionBadge condition={m.condition} />
                <ZoneBadge zone={m.zone} />
              </div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">{m.title}</h1>
              {(m.brand || m.model) && <p className="mt-1 text-sm text-muted-foreground">{[m.brand, m.model].filter(Boolean).join(" · ")}</p>}
              <div className="mt-3 font-display text-3xl font-bold text-primary">
                {m.price_type === "on_request" ? "Price on Request" : formatINR(Number(m.asking_price))}
                {m.price_type === "negotiable" && <span className="ml-2 text-sm font-medium text-muted-foreground">Negotiable</span>}
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 font-display font-bold">Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {m.brand && <Row k="Brand" v={m.brand} />}
                    {m.model && <Row k="Model" v={m.model} />}
                    {m.manufacture_year && <Row k="Year" v={String(m.manufacture_year)} />}
                    {m.quantity_available != null && <Row k="Quantity Available" v={String(m.quantity_available)} />}
                    {Object.entries(specs).map(([k, v]) => <Row key={k} k={k} v={String(v)} />)}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {m.description && (
              <div>
                <h3 className="mb-2 font-display font-bold">Description</h3>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{m.description}</p>
              </div>
            )}

            {vendor && (
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold">{vendor.business_name}</h3>
                        {vendor.is_verified && <VerifiedBadge />}
                      </div>
                      <StarRating value={Number(vendor.rating_avg) || 0} count={vendor.rating_count} />
                    </div>
                    <Button asChild variant="outline" size="sm"><Link to="/vendor/$slug" params={{ slug: vendor.slug }}>View Profile</Link></Button>
                  </div>
                  <div className="flex gap-2">
                    <WhatsAppButton phone={vendor.whatsapp || vendor.phone} vendorId={vendor.id} message={`Hi, I'm interested in your machine: ${m.title}`} />
                    {vendor.phone && <Button asChild variant="outline" size="sm"><a href={`tel:${vendor.phone}`}><Phone className="mr-1.5 h-4 w-4" /> Call</a></Button>}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 font-display font-bold">Send Enquiry</h3>
                <form onSubmit={onEnquire} className="space-y-3">
                  <Input required placeholder="Your name" value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} />
                  <Input required placeholder="Phone number" value={form.buyer_phone} onChange={(e) => setForm({ ...form, buyer_phone: e.target.value })} />
                  <Textarea placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  <Input type="number" placeholder="Your offer price (optional)" value={form.offered_price} onChange={(e) => setForm({ ...form, offered_price: e.target.value })} />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={enquire.isPending} className="flex-1">{enquire.isPending ? "Sending…" : "Send Enquiry"}</Button>
                    <Button type="button" variant="outline" onClick={saveListing}><Heart className="mr-1.5 h-4 w-4" /> Save</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-1.5 pr-4 text-muted-foreground capitalize">{k.replace(/_/g, " ")}</td>
      <td className="py-1.5 font-medium">{v}</td>
    </tr>
  );
}
