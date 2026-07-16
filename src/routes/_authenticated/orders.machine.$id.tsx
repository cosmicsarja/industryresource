import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  MapPin,
  ArrowLeft,
  ExternalLink,
  ShoppingCart,
  CreditCard,
  Building2,
  Hammer,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders/machine/$id")({
  head: ({ params }) => ({
    meta: [
      {
        title: `Machine Order #${params.id.slice(0, 8).toUpperCase()} | IndustrialBelgaum.com`,
      },
    ],
  }),
  component: MachineOrderDetail,
});

function fmtCurrency(n: number | null | undefined) {
  if (n == null) return "—";
  return "₹" + Number(n).toLocaleString("en-IN");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const FULFILLMENT_STEPS = [
  { key: "pending", icon: Clock, label: "Order Placed" },
  { key: "confirmed", icon: CheckCircle, label: "Confirmed" },
  { key: "dispatched", icon: Truck, label: "Dispatched" },
  { key: "delivered", icon: Package, label: "Delivered" },
];

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: {
      label: "Pending",
      cls: "bg-amber-500/15 text-amber-700 border-amber-400/30",
    },
    paid: {
      label: "Paid",
      cls: "bg-green-500/15 text-green-700 border-green-400/30",
    },
    failed: {
      label: "Failed",
      cls: "bg-red-500/15 text-red-700 border-red-400/30",
    },
    refunded: {
      label: "Refunded",
      cls: "bg-muted text-muted-foreground border-border",
    },
    confirmed: {
      label: "Confirmed",
      cls: "bg-blue-500/15 text-blue-700 border-blue-400/30",
    },
    dispatched: {
      label: "Dispatched",
      cls: "bg-amber-500/15 text-amber-700 border-amber-400/30",
    },
    delivered: {
      label: "Delivered",
      cls: "bg-green-500/15 text-green-700 border-green-400/30",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-red-500/15 text-red-700 border-red-400/30",
    },
  };
  const s = map[status] ?? {
    label: status,
    cls: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function MachineOrderDetail() {
  const { id } = Route.useParams();
  const { loading } = useAuth();

  const {
    data: order,
    isLoading,
  } = useQuery({
    queryKey: ["machine-order-detail", id],
    queryFn: async (): Promise<Record<string, unknown> | null> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("machine_orders")
        .select(
          "id,quantity,unit_price,total_amount,platform_commission,buyer_phone,buyer_name,delivery_address," +
            "razorpay_order_id,razorpay_payment_id,payment_status,fulfillment_status,notes,created_at,updated_at," +
            "machine:machine_listings(id,title,slug,condition,description)," +
            "vendor:vendors(id,business_name,slug,phone,whatsapp,email,zone,full_address)"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Record<string, unknown> | null;
    },
    enabled: !!id && !loading,
  });

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            Loading order…
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground/40" />
          <h1 className="font-display text-2xl font-bold">Order not found</h1>
          <p className="text-muted-foreground">
            This order doesn't exist or you don't have access to it.
          </p>
          <Button asChild variant="outline">
            <Link to="/customer-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const machine = order.machine as Record<string, unknown>;
  const vendor = order.vendor as Record<string, unknown>;
  const currentStep = FULFILLMENT_STEPS.findIndex(
    (s) => s.key === order.fulfillment_status
  );
  const isCancelled = order.fulfillment_status === "cancelled";
  const isDelivered = order.fulfillment_status === "delivered";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Back + Header */}
        <Link
          to="/customer-dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Hammer className="h-5 w-5 text-primary" />
              <h1 className="font-display text-2xl font-bold">
                Machine Order #{(order.id as string).slice(0, 8).toUpperCase()}
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {fmtDate(order.created_at as string)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill status={order.payment_status as string} />
            <StatusPill status={order.fulfillment_status as string} />
          </div>
        </div>

        {/* Fulfillment tracker */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display font-bold">Order Status</h2>
          {isCancelled ? (
            <div className="flex items-center gap-3 rounded-lg bg-red-500/10 p-4 text-red-700">
              <XCircle className="h-5 w-5 shrink-0" />
              <div>
                <div className="font-semibold">Order Cancelled</div>
                <div className="text-sm">
                  This order has been cancelled. Contact the vendor for details.
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-5 h-[calc(100%-28px)] w-0.5 bg-border" />
              <div
                className="absolute left-5 top-5 w-0.5 bg-primary transition-all"
                style={{
                  height: `${(Math.max(0, currentStep) / (FULFILLMENT_STEPS.length - 1)) * 100}%`,
                }}
              />
              <div className="space-y-6">
                {FULFILLMENT_STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground"
                        } ${active ? "ring-4 ring-primary/20" : ""}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1.5">
                        <div
                          className={`font-semibold ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {step.label}
                        </div>
                        {active && (
                          <div className="text-xs text-muted-foreground">Current status</div>
                        )}
                        {done && !active && (
                          <div className="text-xs text-muted-foreground">Completed</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Order summary */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display font-bold">
              <Hammer className="h-4 w-4 text-primary" />
              Machine Order Summary
            </h2>
            {machine && (
              <div className="mb-3">
                <Link
                  to="/machines/$slug"
                  params={{ slug: String(machine.slug) }}
                  className="font-semibold hover:text-primary hover:underline"
                >
                  {String(machine.title)}
                </Link>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                  Condition: {String(machine.condition)}
                </p>
                {Boolean(machine.description) && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {String(machine.description)}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2 border-t border-border pt-3 text-sm">
              <RowItem label="Buyer" value={String(order.buyer_name)} />
              <RowItem label="Quantity" value={String(order.quantity)} />
              <RowItem label="Unit Price" value={fmtCurrency(order.unit_price as number)} />
              <div className="flex items-center justify-between border-t border-border pt-2 font-bold">
                <span>Total</span>
                <span className="font-display text-lg text-primary">
                  {fmtCurrency(order.total_amount as number)}
                </span>
              </div>
            </div>
            {Boolean(order.delivery_address) && (
              <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{String(order.delivery_address)}</span>
              </div>
            )}
          </div>

          {/* Payment info */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-display font-bold">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Details
            </h2>
            <div className="space-y-2 text-sm">
              <RowItem label="Status">
                <StatusPill status={String(order.payment_status)} />
              </RowItem>
              {Boolean(order.razorpay_order_id) && (
                <RowItem
                  label="Razorpay Order"
                  value={String(order.razorpay_order_id)}
                  mono
                />
              )}
              {Boolean(order.razorpay_payment_id) && (
                <RowItem
                  label="Payment ID"
                  value={String(order.razorpay_payment_id)}
                  mono
                />
              )}
              {Boolean(order.platform_commission) && (
                <RowItem
                  label="Platform Fee"
                  value={fmtCurrency(order.platform_commission as number)}
                />
              )}
            </div>
            {Boolean(order.buyer_phone) && (
              <div className="mt-3 border-t border-border pt-3 text-sm">
                <RowItem label="Contact Phone" value={String(order.buyer_phone)} />
              </div>
            )}
          </div>

          {/* Vendor info */}
          {vendor && (
            <div className="rounded-xl border border-border bg-card p-5 md:col-span-2">
              <h2 className="mb-4 flex items-center gap-2 font-display font-bold">
                <Building2 className="h-4 w-4 text-primary" />
                Vendor Details
              </h2>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    to="/vendor/$slug"
                    params={{ slug: String(vendor.slug) }}
                    className="font-semibold hover:text-primary hover:underline"
                  >
                    {String(vendor.business_name)}
                  </Link>
                  {Boolean(vendor.zone) && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {String(vendor.zone)}
                    </p>
                  )}
                  {Boolean(vendor.full_address) && (
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      {String(vendor.full_address)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isDelivered && !isCancelled && (
                    <>
                      <a
                        href={`tel:${vendor.phone}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-4 text-sm font-medium hover:border-primary/40 hover:bg-muted transition"
                      >
                        <Phone className="h-4 w-4" /> Call
                      </a>
                      {vendor.whatsapp && (
                        <a
                          href={`https://wa.me/91${(vendor.whatsapp as string).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 transition"
                        >
                          WhatsApp
                        </a>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link to="/vendor/$slug" params={{ slug: vendor.slug as string }}>
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          View Profile
                        </Link>
                      </Button>
                    </>
                  )}
                  {isDelivered && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Order Delivered ✓
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/customer-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              My Dashboard
            </Link>
          </Button>
          {machine && (
            <Button asChild variant="outline">
              <Link to="/machines/$slug" params={{ slug: machine.slug as string }}>
                View Machine Again
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function RowItem({
  label,
  value,
  mono = false,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      {children ?? (
        <span className={`text-right font-medium ${mono ? "font-mono text-xs" : ""}`}>
          {value}
        </span>
      )}
    </div>
  );
}
