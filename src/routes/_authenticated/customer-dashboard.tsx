import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Heart,
  ShoppingCart,
  MessageSquare,
  Hammer,
  Layers,
  Trash2,
  Eye,
  ExternalLink,
  LayoutDashboard,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  InboxIcon,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/customer-dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard | IndustrialBelgaum.com" }] }),
  component: CustomerDashboard,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedMachine {
  id: string;
  listing_id: string;
  listing_type: "machine";
  created_at: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    asking_price: number | null;
    price_type: string;
    condition: string;
    zone: string | null;
    is_active: boolean;
    is_sold: boolean;
  } | null;
}

interface SavedMaterial {
  id: string;
  listing_id: string;
  listing_type: "material";
  created_at: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    price_per_unit: number | null;
    unit: string;
    is_in_stock: boolean;
    is_active: boolean;
  } | null;
}

interface MaterialOrder {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  buyer_phone: string;
  delivery_address: string | null;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  updated_at: string;
  material: { title: string; slug: string } | null;
  vendor: { business_name: string; slug: string; phone: string; whatsapp: string | null } | null;
}

interface MachineEnquiry {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  message: string | null;
  offered_price: number | null;
  status: string;
  created_at: string;
  machine: { title: string; slug: string } | null;
}

interface MaterialEnquiry {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  message: string | null;
  requested_quantity: number | null;
  status: string;
  created_at: string;
  material: { title: string; slug: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number | null | undefined) {
  if (n == null) return "—";
  return "₹" + Number(n).toLocaleString("en-IN");
}

function relDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    new:        { label: "New",        cls: "bg-blue-500/15 text-blue-700 border-blue-400/30" },
    negotiating:{ label: "Negotiating",cls: "bg-amber-500/15 text-amber-700 border-amber-400/30" },
    accepted:   { label: "Accepted",   cls: "bg-green-500/15 text-green-700 border-green-400/30" },
    declined:   { label: "Declined",   cls: "bg-red-500/15 text-red-700 border-red-400/30" },
    closed:     { label: "Closed",     cls: "bg-muted text-muted-foreground border-border" },
    quoted:     { label: "Quoted",     cls: "bg-amber-500/15 text-amber-700 border-amber-400/30" },
    pending:    { label: "Pending",    cls: "bg-amber-500/15 text-amber-700 border-amber-400/30" },
    paid:       { label: "Paid",       cls: "bg-green-500/15 text-green-700 border-green-400/30" },
    failed:     { label: "Failed",     cls: "bg-red-500/15 text-red-700 border-red-400/30" },
    refunded:   { label: "Refunded",   cls: "bg-muted text-muted-foreground border-border" },
    confirmed:  { label: "Confirmed",  cls: "bg-blue-500/15 text-blue-700 border-blue-400/30" },
    dispatched: { label: "Dispatched", cls: "bg-amber-500/15 text-amber-700 border-amber-400/30" },
    delivered:  { label: "Delivered",  cls: "bg-green-500/15 text-green-700 border-green-400/30" },
    cancelled:  { label: "Cancelled",  cls: "bg-red-500/15 text-red-700 border-red-400/30" },
  };
  const s = cfg[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function CustomerDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto flex flex-1 items-center justify-center">
          <div className="text-muted-foreground">Loading…</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    navigate({ to: "/auth" });
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LayoutDashboard className="h-3.5 w-3.5" />
              My Dashboard
            </div>
            <h1 className="mt-0.5 font-display text-2xl font-bold">
              {user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "My Account"}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/machines">
                <Hammer className="mr-1.5 h-3.5 w-3.5" />
                Browse Machines
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/materials">
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                Browse Materials
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto flex-1 px-4 py-6">
        <Tabs defaultValue="saved">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="saved" className="gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="enquiries" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Enquiries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved">
            <SavedTab userId={user.id} />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab userId={user.id} />
          </TabsContent>
          <TabsContent value="enquiries">
            <EnquiriesTab userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

// ─── Saved Listings Tab ───────────────────────────────────────────────────────

function SavedTab({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [subTab, setSubTab] = useState<"machines" | "materials">("machines");

  const { data: savedMachines = [], isLoading: mLoading } = useQuery({
    queryKey: ["saved-machines", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_listings")
        .select("id,listing_id,listing_type,created_at")
        .eq("buyer_id", userId)
        .eq("listing_type", "machine")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data?.length) return [];

      // Fetch actual listings
      const ids = data.map((r) => r.listing_id);
      const { data: listings } = await supabase
        .from("machine_listings")
        .select("id,title,slug,asking_price,price_type,condition,zone,is_active,is_sold")
        .in("id", ids);
      const map = new Map((listings ?? []).map((l) => [l.id, l]));
      return data.map((r) => ({ ...r, listing: map.get(r.listing_id) ?? null })) as SavedMachine[];
    },
  });

  const { data: savedMaterials = [], isLoading: matLoading } = useQuery({
    queryKey: ["saved-materials", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_listings")
        .select("id,listing_id,listing_type,created_at")
        .eq("buyer_id", userId)
        .eq("listing_type", "material")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data?.length) return [];

      const ids = data.map((r) => r.listing_id);
      const { data: listings } = await supabase
        .from("material_listings")
        .select("id,title,slug,price_per_unit,unit,is_in_stock,is_active")
        .in("id", ids);
      const map = new Map((listings ?? []).map((l) => [l.id, l]));
      return data.map((r) => ({ ...r, listing: map.get(r.listing_id) ?? null })) as SavedMaterial[];
    },
  });

  const unsave = async (id: string, type: "machine" | "material") => {
    const { error } = await supabase.from("saved_listings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Removed from saved");
      qc.invalidateQueries({ queryKey: [type === "machine" ? "saved-machines" : "saved-materials"] });
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Saved Machines" value={savedMachines.length} icon={Hammer} />
        <StatCard label="Saved Materials" value={savedMaterials.length} icon={Layers} />
      </div>

      <div className="flex gap-2">
        <SubTabBtn active={subTab === "machines"} onClick={() => setSubTab("machines")}>
          Machines ({savedMachines.length})
        </SubTabBtn>
        <SubTabBtn active={subTab === "materials"} onClick={() => setSubTab("materials")}>
          Materials ({savedMaterials.length})
        </SubTabBtn>
      </div>

      {subTab === "machines" && (
        mLoading ? <Skeleton /> : savedMachines.length === 0 ? (
          <Empty icon={Hammer} text="No saved machines yet.">
            <Button asChild size="sm" className="mt-4"><Link to="/machines"><ArrowRight className="mr-1.5 h-3.5 w-3.5" />Browse Machines</Link></Button>
          </Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedMachines.map((s) => (
              <div key={s.id} className="group relative rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md">
                <button
                  onClick={() => unsave(s.id, "machine")}
                  className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {s.listing ? (
                  <>
                    <div className="mb-2 flex flex-wrap gap-1">
                      {s.listing.is_sold && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Sold</span>}
                      {!s.listing.is_active && !s.listing.is_sold && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Inactive</span>}
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">{s.listing.condition.replace("_", " ")}</span>
                    </div>
                    <Link to="/machines/$slug" params={{ slug: s.listing.slug }} className="font-semibold leading-snug hover:text-primary hover:underline line-clamp-2">
                      {s.listing.title}
                    </Link>
                    <div className="mt-2 font-display text-lg font-bold text-primary">
                      {s.listing.price_type === "on_request" ? "On Request" : fmtCurrency(s.listing.asking_price)}
                    </div>
                    {s.listing.zone && <div className="mt-1 text-xs text-muted-foreground">{s.listing.zone}</div>}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Listing no longer available</p>
                )}
                <div className="mt-3 text-xs text-muted-foreground">Saved {relDate(s.created_at)}</div>
              </div>
            ))}
          </div>
        )
      )}

      {subTab === "materials" && (
        matLoading ? <Skeleton /> : savedMaterials.length === 0 ? (
          <Empty icon={Layers} text="No saved materials yet.">
            <Button asChild size="sm" className="mt-4"><Link to="/materials"><ArrowRight className="mr-1.5 h-3.5 w-3.5" />Browse Materials</Link></Button>
          </Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedMaterials.map((s) => (
              <div key={s.id} className="group relative rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md">
                <button
                  onClick={() => unsave(s.id, "material")}
                  className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {s.listing ? (
                  <>
                    <div className="mb-2 flex flex-wrap gap-1">
                      {s.listing.is_in_stock
                        ? <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700">In Stock</span>
                        : <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-700">Out of Stock</span>}
                    </div>
                    <Link to="/materials/$slug" params={{ slug: s.listing.slug }} className="font-semibold leading-snug hover:text-primary hover:underline line-clamp-2">
                      {s.listing.title}
                    </Link>
                    <div className="mt-2 font-display text-lg font-bold text-primary">
                      {s.listing.price_per_unit ? `${fmtCurrency(s.listing.price_per_unit)}/${s.listing.unit}` : "—"}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Listing no longer available</p>
                )}
                <div className="mt-3 text-xs text-muted-foreground">Saved {relDate(s.created_at)}</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ userId }: { userId: string }) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders-buyer", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_orders")
        .select(
          "id,quantity,unit_price,total_amount,buyer_phone,delivery_address,payment_status,fulfillment_status,created_at,updated_at," +
          "material:material_listings(title,slug)," +
          "vendor:vendors(business_name,slug,phone,whatsapp)"
        )
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as MaterialOrder[]) ?? [];
    },
  });

  const totalSpent = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.total_amount), 0);
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.fulfillment_status)).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Orders" value={orders.length} icon={ShoppingCart} />
        <StatCard label="Active" value={activeOrders} icon={Truck} />
        <StatCard label="Delivered" value={orders.filter((o) => o.fulfillment_status === "delivered").length} icon={CheckCircle} />
        <StatCard label="Total Spent" value={`₹${totalSpent.toLocaleString("en-IN")}`} icon={TrendingUp} />
      </div>

      {isLoading ? (
        <Skeleton />
      ) : orders.length === 0 ? (
        <Empty icon={ShoppingCart} text="No orders yet.">
          <Button asChild size="sm" className="mt-4"><Link to="/materials"><ArrowRight className="mr-1.5 h-3.5 w-3.5" />Browse Materials</Link></Button>
        </Empty>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg border border-border bg-card p-4 transition hover:border-primary/30">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {o.material ? (
                    <Link to="/materials/$slug" params={{ slug: o.material.slug }} className="font-semibold hover:text-primary hover:underline line-clamp-1">
                      {o.material.title}
                    </Link>
                  ) : (
                    <span className="font-semibold text-muted-foreground">Material removed</span>
                  )}
                  {o.vendor && (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      by{" "}
                      <Link to="/vendor/$slug" params={{ slug: o.vendor.slug }} className="hover:text-primary">
                        {o.vendor.business_name}
                      </Link>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={o.payment_status} />
                    <StatusBadge status={o.fulfillment_status} />
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground">
                    Qty: {o.quantity} · {fmtCurrency(o.unit_price)}/unit · Ordered {relDate(o.created_at)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="font-display text-xl font-bold">{fmtCurrency(o.total_amount)}</div>
                  <Link
                    to="/orders/$id"
                    params={{ id: o.id }}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/40 hover:bg-muted transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Order
                  </Link>
                </div>
              </div>

              {/* Fulfillment tracker */}
              <div className="mt-4">
                <FulfillmentTracker status={o.fulfillment_status} />
              </div>

              {o.vendor && o.fulfillment_status !== "delivered" && o.fulfillment_status !== "cancelled" && (
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  <a
                    href={`tel:${o.vendor.phone}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium hover:border-primary/40 hover:bg-muted transition"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Vendor
                  </a>
                  {o.vendor.whatsapp && (
                    <a
                      href={`https://wa.me/91${o.vendor.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700 transition"
                    >
                      WhatsApp Vendor
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Enquiries Tab ────────────────────────────────────────────────────────────

function EnquiriesTab({ userId }: { userId: string }) {
  const [subTab, setSubTab] = useState<"machine" | "material">("machine");

  const { data: machineEnq = [], isLoading: mLoading } = useQuery({
    queryKey: ["my-machine-enquiries-buyer", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("machine_enquiries")
        .select("id,buyer_name,buyer_phone,message,offered_price,status,created_at,machine:machine_listings(title,slug)")
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MachineEnquiry[];
    },
  });

  const { data: materialEnq = [], isLoading: matLoading } = useQuery({
    queryKey: ["my-material-enquiries-buyer", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_enquiries")
        .select("id,buyer_name,buyer_phone,message,requested_quantity,status,created_at,material:material_listings(title,slug)")
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MaterialEnquiry[];
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Machine Enquiries" value={machineEnq.length} icon={Hammer} />
        <StatCard label="Material Enquiries" value={materialEnq.length} icon={Layers} />
      </div>

      <div className="flex gap-2">
        <SubTabBtn active={subTab === "machine"} onClick={() => setSubTab("machine")}>
          Machines ({machineEnq.length})
        </SubTabBtn>
        <SubTabBtn active={subTab === "material"} onClick={() => setSubTab("material")}>
          Materials ({materialEnq.length})
        </SubTabBtn>
      </div>

      {subTab === "machine" && (
        mLoading ? <Skeleton /> : machineEnq.length === 0 ? (
          <Empty icon={InboxIcon} text="No machine enquiries sent yet." />
        ) : (
          <div className="space-y-3">
            {machineEnq.map((e) => (
              <EnquiryCard
                key={e.id}
                title={e.machine?.title ?? "Listing removed"}
                link={e.machine ? { to: "/machines/$slug", params: { slug: e.machine.slug } } : null}
                status={e.status}
                date={e.created_at}
                message={e.message}
                detail={e.offered_price ? `Offered: ${fmtCurrency(e.offered_price)}` : undefined}
              />
            ))}
          </div>
        )
      )}

      {subTab === "material" && (
        matLoading ? <Skeleton /> : materialEnq.length === 0 ? (
          <Empty icon={InboxIcon} text="No material enquiries sent yet." />
        ) : (
          <div className="space-y-3">
            {materialEnq.map((e) => (
              <EnquiryCard
                key={e.id}
                title={e.material?.title ?? "Listing removed"}
                link={e.material ? { to: "/materials/$slug", params: { slug: e.material.slug } } : null}
                status={e.status}
                date={e.created_at}
                message={e.message}
                detail={e.requested_quantity ? `Requested qty: ${e.requested_quantity}` : undefined}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Shared Sub-components ────────────────────────────────────────────────────

function FulfillmentTracker({ status }: { status: string }) {
  const steps = ["pending", "confirmed", "dispatched", "delivered"];
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-xs text-destructive">
        <XCircle className="h-4 w-4" />
        Order cancelled
      </div>
    );
  }
  const current = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-0.5 flex-1">
            <div className={`h-2 w-full rounded-full transition-colors ${i <= current ? "bg-primary" : "bg-border"}`} />
            <span className={`text-[10px] capitalize ${i === current ? "font-semibold text-primary" : "text-muted-foreground"}`}>
              {step}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EnquiryCard({
  title,
  link,
  status,
  date,
  message,
  detail,
}: {
  title: string;
  link: { to: string; params: Record<string, string> } | null;
  status: string;
  date: string;
  message: string | null;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {link ? (
            <Link to={link.to as never} params={link.params as never} className="font-semibold hover:text-primary hover:underline line-clamp-1">
              {title}
            </Link>
          ) : (
            <span className="font-semibold text-muted-foreground line-clamp-1">{title}</span>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <span className="text-xs text-muted-foreground">{relDate(date)}</span>
            {detail && <span className="text-xs text-muted-foreground">· {detail}</span>}
          </div>
          {message && <p className="mt-2 text-sm text-foreground line-clamp-2">{message}</p>}
        </div>
        {link && (
          <Link to={link.to as never} params={link.params as never} className="shrink-0 rounded-md border border-border p-1.5 text-muted-foreground hover:border-primary/40 hover:text-primary transition">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof Package }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

function SubTabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:border-primary/40"}`}
    >
      {children}
    </button>
  );
}

function Empty({ icon: Icon, text, children }: { icon: typeof Package; text: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
      <Icon className="mb-3 h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-card" />
      ))}
    </div>
  );
}
