import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConditionBadge, formatINR } from "@/components/marketplace/badges";
import { ZoneBadge, VerifiedBadge, StarRating } from "@/components/badges";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useMachine, useSubmitMachineEnquiry } from "@/lib/marketplace";
import { openRazorpayCheckout, toPaise } from "@/lib/razorpay";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import {
  Phone,
  Hammer,
  Heart,
  ShoppingCart,
  CreditCard,
  MapPin,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/machines_/$slug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `Machine for Sale | ${params.slug} | IndustryResource`,
      },
    ],
  }),
  component: MachineDetail,
});

// ─── Buy-now modal ────────────────────────────────────────────────────────────

interface BuyMachineModalProps {
  open: boolean;
  onClose: () => void;
  machine: { id: string; title: string; asking_price: number; quantity_available?: number };
  vendor: { id: string; slug: string; business_name: string };
  userId?: string;
}

function BuyMachineModal({ open, onClose, machine, vendor, userId }: BuyMachineModalProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_phone: "",
    buyer_email: "",
    delivery_address: "",
    quantity: 1,
    notes: "",
  });
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [orderId, setOrderId] = useState<string | null>(null);

  const maxQty = machine.quantity_available ?? 999;
  const unitPrice = Number(machine.asking_price);
  const total = unitPrice * form.quantity;

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buyer_name || !form.buyer_phone) {
      toast.error("Please fill in your name and phone number.");
      return;
    }
    setStep("processing");

    try {
      // 1. Create pending order in Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: order, error: orderError } = await (supabase as any)
        .from("machine_orders")
        .insert({
          machine_id: machine.id,
          vendor_id: vendor.id,
          buyer_id: userId ?? null,
          buyer_name: form.buyer_name,
          buyer_phone: form.buyer_phone,
          buyer_email: form.buyer_email || null,
          delivery_address: form.delivery_address || null,
          quantity: form.quantity,
          unit_price: unitPrice,
          total_amount: total,
          platform_commission: Math.round(total * 0.02), // 2% platform fee
          payment_status: "pending",
          fulfillment_status: "pending",
          notes: form.notes || null,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;
      const newOrderId = order.id;
      setOrderId(newOrderId);

      // 2. Open Razorpay checkout
      await openRazorpayCheckout({
        amount: toPaise(total),
        orderId: newOrderId,
        description: `${machine.title} × ${form.quantity}`,
        prefill: {
          name: form.buyer_name,
          contact: form.buyer_phone,
          email: form.buyer_email || undefined,
        },
        notes: {
          machine_id: machine.id,
          vendor_slug: vendor.slug,
        },
        onSuccess: async (response) => {
          // 3. Mark order as paid
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from("machine_orders")
            .update({
              payment_status: "paid",
              razorpay_payment_id: response.razorpay_payment_id,
            })
            .eq("id", newOrderId);

          setStep("success");
          toast.success("Payment successful! Your order has been placed.");
        },
        onFailure: async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from("machine_orders")
            .update({ payment_status: "failed" })
            .eq("id", newOrderId);
          setStep("form");
          toast.error("Payment failed. Please try again.");
        },
        onDismiss: () => {
          setStep("form");
          toast.info("Payment cancelled. Your order was saved — you can pay later.");
        },
      });
    } catch (err: unknown) {
      setStep("form");
      const msg = err instanceof Error ? err.message : "Failed to create order. Please try again.";
      toast.error(msg);
    }
  };

  const goToOrder = () => {
    onClose();
    if (orderId) navigate({ to: "/orders/machine/$id", params: { id: orderId } });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Buy Machine
          </DialogTitle>
          <DialogDescription>{machine.title}</DialogDescription>
        </DialogHeader>

        {step === "success" ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-700">Payment Successful!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your order has been placed. The vendor will contact you soon.
              </p>
            </div>
            <Button onClick={goToOrder} className="mt-2 w-full">
              View Order Details
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBuy} className="space-y-4">
            {/* Order summary */}
            <div className="rounded-lg bg-muted/60 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Unit Price</span>
                <span className="font-semibold">{formatINR(unitPrice)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border bg-background hover:bg-muted"
                  >−</button>
                  <span className="w-8 text-center font-semibold">{form.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, quantity: Math.min(maxQty, f.quantity + 1) }))}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border bg-background hover:bg-muted"
                  >+</button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-bold">
                <span>Total</span>
                <span className="font-display text-lg text-primary">{formatINR(total)}</span>
              </div>
              <p className="mt-1 text-right text-xs text-muted-foreground">
                + 2% platform fee included
              </p>
            </div>

            {/* Buyer info */}
            <div className="space-y-3">
              <Input
                required
                placeholder="Your full name *"
                value={form.buyer_name}
                onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
              />
              <Input
                required
                type="tel"
                placeholder="Phone number *"
                value={form.buyer_phone}
                onChange={(e) => setForm({ ...form, buyer_phone: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email (optional)"
                value={form.buyer_email}
                onChange={(e) => setForm({ ...form, buyer_email: e.target.value })}
              />
              <Textarea
                placeholder="Delivery address"
                value={form.delivery_address}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                rows={2}
              />
              <Textarea
                placeholder="Additional notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={step === "processing"}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
              >
                {step === "processing" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                ) : (
                  <><CreditCard className="mr-2 h-4 w-4" /> Pay {formatINR(total)}</>
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              🔒 Secured by Razorpay · UPI, Cards, Net Banking accepted
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function MachineDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: m, isLoading } = useMachine(slug);
  const enquire = useSubmitMachineEnquiry();
  const [active, setActive] = useState(0);
  const [buyOpen, setBuyOpen] = useState(false);
  const [form, setForm] = useState({ buyer_name: "", buyer_phone: "", message: "", offered_price: "" });

  useEffect(() => {
    if (m?.id) supabase.rpc("increment_machine_view", { machine_uuid: m.id });
  }, [m?.id]);

  if (isLoading)
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );

  if (!m)
    return (
      <div className="p-10 text-center">
        Listing not found.{" "}
        <Link to="/machines" className="text-primary underline">
          Back to machines
        </Link>
      </div>
    );

  const photos = (m.photos ?? []).sort(
    (a: Record<string, unknown>, b: Record<string, unknown>) =>
      (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) ||
      (a.sort_order as number) - (b.sort_order as number)
  );
  const primary = (photos[active] as { photo_url?: string } | undefined)?.photo_url;
  const vendor = m.vendor as Record<string, unknown>;
  const specs = (m.specifications ?? {}) as Record<string, string>;
  const isBuyable = m.price_type !== "on_request" && m.asking_price && !m.is_sold;

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send enquiry";
      toast.error(msg);
    }
  };

  const saveListing = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const { error } = await supabase
      .from("saved_listings")
      .insert({ buyer_id: user.id, listing_type: "machine", listing_id: m.id });
    if (error && error.code !== "23505") toast.error(error.message);
    else toast.success("Saved!");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/machines" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to machines
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Photos */}
          <div className="space-y-3">
            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
              {primary ? (
                <img src={primary} alt={m.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <Hammer className="h-24 w-24" />
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {(photos as { id: string; photo_url: string }[]).map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(i)}
                    className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded border-2 transition ${i === active ? "border-primary" : "border-transparent hover:border-primary/40"}`}
                  >
                    <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            {/* Title & price */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ConditionBadge condition={m.condition} />
                <ZoneBadge zone={m.zone} />
                {m.is_sold && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                    SOLD
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">{m.title}</h1>
              {(m.brand || m.model) && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {[m.brand, m.model].filter(Boolean).join(" · ")}
                </p>
              )}
              <div className="mt-3 font-display text-3xl font-bold text-primary">
                {m.price_type === "on_request" ? "Price on Request" : formatINR(Number(m.asking_price))}
                {m.price_type === "negotiable" && (
                  <span className="ml-2 text-sm font-medium text-muted-foreground">Negotiable</span>
                )}
              </div>
              {m.quantity_available != null && m.quantity_available > 1 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {m.quantity_available} units available
                </p>
              )}
            </div>

            {/* Buy Now + Save */}
            {!m.is_sold && (
              <div className="flex gap-3">
                {isBuyable ? (
                  <Button
                    onClick={() => setBuyOpen(true)}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-primary/25 hover:opacity-90 transition-all"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy Now — {formatINR(Number(m.asking_price))}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={saveListing}
                  className="gap-2"
                >
                  <Heart className="h-5 w-5" />
                  {isBuyable ? "" : "Save"}
                </Button>
              </div>
            )}

            {/* Specs */}
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 font-display font-bold">Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {m.brand && <Row k="Brand" v={m.brand} />}
                    {m.model && <Row k="Model" v={m.model} />}
                    {m.manufacture_year && <Row k="Year" v={String(m.manufacture_year)} />}
                    {m.quantity_available != null && (
                      <Row k="Quantity Available" v={String(m.quantity_available)} />
                    )}
                    {Object.entries(specs).map(([k, v]) => (
                      <Row key={k} k={k} v={String(v)} />
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Description */}
            {m.description && (
              <div>
                <h3 className="mb-2 font-display font-bold">Description</h3>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{m.description}</p>
              </div>
            )}

            {/* Vendor card */}
            {vendor && (
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold">{String(vendor.business_name)}</h3>
                        {Boolean(vendor.is_verified) && <VerifiedBadge />}
                      </div>
                      <StarRating
                        value={Number(vendor.rating_avg) || 0}
                        count={Number(vendor.rating_count) || 0}
                      />
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/vendor/$slug" params={{ slug: String(vendor.slug) }}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <WhatsAppButton
                      phone={String(vendor.whatsapp || vendor.phone || "")}
                      vendorId={String(vendor.id)}
                      message={`Hi, I'm interested in your machine: ${m.title}`}
                    />
                    {Boolean(vendor.phone) && (
                      <Button asChild variant="outline" size="sm">
                        <a href={`tel:${vendor.phone}`}>
                          <Phone className="mr-1.5 h-4 w-4" /> Call
                        </a>
                      </Button>
                    )}
                  </div>
                  {Boolean(vendor.zone) && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {String(vendor.zone)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Enquiry form */}
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 font-display font-bold">Send Enquiry</h3>
                <form onSubmit={onEnquire} className="space-y-3">
                  <Input
                    required
                    placeholder="Your name"
                    value={form.buyer_name}
                    onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
                  />
                  <Input
                    required
                    placeholder="Phone number"
                    value={form.buyer_phone}
                    onChange={(e) => setForm({ ...form, buyer_phone: e.target.value })}
                  />
                  <Textarea
                    placeholder="Your message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Your offer price (optional)"
                    value={form.offered_price}
                    onChange={(e) => setForm({ ...form, offered_price: e.target.value })}
                  />
                  <Button type="submit" disabled={enquire.isPending} className="w-full">
                    {enquire.isPending ? "Sending…" : "Send Enquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Buy Machine Modal */}
      {vendor && m && isBuyable && (
        <BuyMachineModal
          open={buyOpen}
          onClose={() => setBuyOpen(false)}
          machine={{
            id: m.id,
            title: m.title,
            asking_price: Number(m.asking_price),
            quantity_available: m.quantity_available ? Number(m.quantity_available) : undefined,
          }}
          vendor={{
            id: vendor.id as string,
            slug: vendor.slug as string,
            business_name: vendor.business_name as string,
          }}
          userId={user?.id}
        />
      )}

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
