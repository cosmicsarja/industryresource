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
import { StockStatusBadge, formatINR } from "@/components/marketplace/badges";
import { ZoneBadge, VerifiedBadge, StarRating } from "@/components/badges";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useMaterial, useSubmitMaterialEnquiry } from "@/lib/marketplace";
import { openRazorpayCheckout, toPaise } from "@/lib/razorpay";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import {
  Phone,
  Package,
  Heart,
  ShoppingCart,
  CreditCard,
  MapPin,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/materials_/$slug")({
  head: () => ({
    meta: [{ title: "Material for Sale in Belagavi | IndustrialBelgaum.com" }],
  }),
  component: MaterialDetail,
});

// ─── Buy-now modal ────────────────────────────────────────────────────────────

interface BuyMaterialModalProps {
  open: boolean;
  onClose: () => void;
  material: {
    id: string;
    title: string;
    price_per_unit: number;
    unit: string;
    min_order_quantity?: number;
  };
  vendor: { id: string; slug: string; business_name: string };
  userId?: string;
  initialQty: number;
}

function BuyMaterialModal({
  open,
  onClose,
  material,
  vendor,
  userId,
  initialQty,
}: BuyMaterialModalProps) {
  const navigate = useNavigate();
  const min = material.min_order_quantity ?? 1;
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_phone: "",
    buyer_email: "",
    delivery_address: "",
    notes: "",
  });
  const [qty, setQty] = useState(initialQty);
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [orderId, setOrderId] = useState<string | null>(null);

  const unitPrice = Number(material.price_per_unit);
  const total = unitPrice * qty;

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
        .from("material_orders")
        .insert({
          material_id: material.id,
          vendor_id: vendor.id,
          ...(userId ? { buyer_id: userId } : {}),
          buyer_phone: form.buyer_phone || "",
          quantity: qty,
          unit_price: unitPrice,
          total_amount: total,
          platform_commission: Math.round(total * 0.02),
          delivery_address: form.delivery_address || null,
          payment_status: "pending",
          fulfillment_status: "pending",
        })
        .select("id")
        .single();

      if (orderError) throw orderError;
      const newOrderId = order.id;
      setOrderId(newOrderId);

      // 2. Open Razorpay
      await openRazorpayCheckout({
        amount: toPaise(total),
        orderId: newOrderId,
        description: `${material.title} × ${qty} ${material.unit}`,
        prefill: {
          name: form.buyer_name,
          contact: form.buyer_phone,
          email: form.buyer_email || undefined,
        },
        notes: {
          material_id: material.id,
          vendor_slug: vendor.slug,
        },
        onSuccess: async (response) => {
          await supabase
            .from("material_orders")
            .update({
              payment_status: "paid",
              razorpay_payment_id: response.razorpay_payment_id,
            })
            .eq("id", newOrderId);

          setStep("success");
          toast.success("Payment successful! Your order has been placed.");
        },
        onFailure: async () => {
          await supabase
            .from("material_orders")
            .update({ payment_status: "failed" })
            .eq("id", newOrderId);
          setStep("form");
          toast.error("Payment failed. Please try again.");
        },
        onDismiss: () => {
          setStep("form");
          toast.info("Payment cancelled. Order saved — you can retry from your dashboard.");
        },
      });
    } catch (err: unknown) {
      setStep("form");
      const msg = err instanceof Error ? err.message : "Failed to create order.";
      toast.error(msg);
    }
  };

  const goToOrder = () => {
    onClose();
    if (orderId) navigate({ to: "/orders/$id", params: { id: orderId } });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Buy Material
          </DialogTitle>
          <DialogDescription>{material.title}</DialogDescription>
        </DialogHeader>

        {step === "success" ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-700">Payment Successful!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your order has been placed. The vendor will process it soon.
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
                <span className="text-muted-foreground">Price / {material.unit}</span>
                <span className="font-semibold">{formatINR(unitPrice)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Quantity ({material.unit})</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(min, q - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border bg-background hover:bg-muted"
                  >−</button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border bg-background hover:bg-muted"
                  >+</button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-bold">
                <span>Total</span>
                <span className="font-display text-lg text-primary">{formatINR(total)}</span>
              </div>
              <p className="mt-1 text-right text-xs text-muted-foreground">
                Min order: {min} {material.unit} · 2% platform fee included
              </p>
            </div>

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

function MaterialDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: m, isLoading } = useMaterial(slug);
  const enquire = useSubmitMaterialEnquiry();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState<number>(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [form, setForm] = useState({ buyer_name: "", buyer_phone: "", message: "" });

  useEffect(() => {
    if (m?.id) supabase.rpc("increment_material_view", { material_uuid: m.id });
  }, [m?.id]);

  useEffect(() => {
    if (m?.min_order_quantity) setQty(Number(m.min_order_quantity));
  }, [m?.min_order_quantity]);

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
        <Link to="/materials" className="text-primary underline">
          Back to materials
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
  const unit = m.unit;
  const pricePerUnit = m.price_per_unit ? Number(m.price_per_unit) : 0;
  const total = pricePerUnit * qty;
  const min = m.min_order_quantity ? Number(m.min_order_quantity) : 1;

  const onEnquire = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enquire.mutateAsync({
        material_id: m.id,
        buyer_id: user?.id ?? null,
        buyer_name: form.buyer_name,
        buyer_phone: form.buyer_phone,
        message: form.message,
        requested_quantity: qty,
      });
      toast.success("Enquiry sent! The seller will contact you soon.");
      setForm({ buyer_name: "", buyer_phone: "", message: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send enquiry";
      toast.error(msg);
    }
  };

  const saveListing = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const { error } = await supabase
      .from("saved_listings")
      .insert({ buyer_id: user.id, listing_type: "material", listing_id: m.id });
    if (error && error.code !== "23505") toast.error(error.message);
    else toast.success("Saved!");
  };

  const isBuyable = m.allow_online_payment && pricePerUnit > 0 && m.is_in_stock;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/materials" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to materials
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Photos */}
          <div className="space-y-3">
            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
              {primary ? (
                <img src={primary} alt={m.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <Package className="h-24 w-24" />
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
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StockStatusBadge inStock={!!m.is_in_stock} qty={m.stock_quantity ? Number(m.stock_quantity) : null} />
                <ZoneBadge zone={m.zone} />
                {m.grade_or_spec && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs">
                    {m.grade_or_spec}
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">{m.title}</h1>
              {m.material_type && (
                <p className="mt-1 text-sm text-muted-foreground">{m.material_type}</p>
              )}
              <div className="mt-3 font-display text-3xl font-bold text-primary">
                {pricePerUnit ? `${formatINR(pricePerUnit)} / ${unit}` : "Price on Enquiry"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Min order: {min} {unit}
              </p>
            </div>

            {/* Quantity & Buy */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Quantity ({unit})</label>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setQty(Math.max(min, qty - 1))}
                    >
                      −
                    </Button>
                    <Input
                      type="number"
                      min={min}
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(min, Number(e.target.value) || min))
                      }
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setQty(qty + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {pricePerUnit > 0 && (
                  <p className="text-sm">
                    Total:{" "}
                    <span className="font-display text-lg font-bold text-primary">
                      {formatINR(total)}
                    </span>
                  </p>
                )}

                <div className="flex gap-2">
                  {isBuyable && (
                    <Button
                      onClick={() => setBuyOpen(true)}
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:opacity-90 transition-all"
                      size="lg"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> Buy Now
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={saveListing}
                    className={isBuyable ? "" : "flex-1"}
                  >
                    <Heart className="mr-1.5 h-4 w-4" /> Save
                  </Button>
                </div>

                {!isBuyable && pricePerUnit > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {!m.is_in_stock
                      ? "Out of stock — use enquiry to be notified"
                      : "Online payment not enabled — use enquiry below"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Specs */}
            {Object.keys(specs).length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-3 font-display font-bold">Specifications</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(specs).map(([k, v]) => (
                        <tr key={k} className="border-b border-border/50 last:border-0">
                          <td className="py-1.5 pr-4 text-muted-foreground capitalize">
                            {k.replace(/_/g, " ")}
                          </td>
                          <td className="py-1.5 font-medium">{String(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {m.description && (
              <p className="whitespace-pre-line text-sm text-muted-foreground">{m.description}</p>
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
                      {Boolean(vendor.zone) && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {String(vendor.zone)}
                        </p>
                      )}
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
                      message={`Hi, I'm interested in: ${m.title}`}
                    />
                    {Boolean(vendor.phone) && (
                      <Button asChild variant="outline" size="sm">
                        <a href={`tel:${vendor.phone}`}>
                          <Phone className="mr-1.5 h-4 w-4" /> Call
                        </a>
                      </Button>
                    )}
                  </div>
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
                  <Button type="submit" disabled={enquire.isPending} className="w-full">
                    {enquire.isPending ? "Sending…" : "Send Enquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Buy Material Modal */}
      {vendor && m && (
        <BuyMaterialModal
          open={buyOpen}
          onClose={() => setBuyOpen(false)}
          material={{
            id: m.id,
            title: m.title,
            price_per_unit: pricePerUnit,
            unit,
            min_order_quantity: min,
          }}
          vendor={{
            id: vendor.id as string,
            slug: vendor.slug as string,
            business_name: vendor.business_name as string,
          }}
          userId={user?.id}
          initialQty={qty}
        />
      )}

      <Footer />
    </div>
  );
}
