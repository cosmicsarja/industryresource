import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRef } from "react";
import {
  Package,
  MessageSquare,
  ShoppingCart,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  AlertTriangle,
  LayoutDashboard,
  Hammer,
  Layers,
  RefreshCcw,
  TrendingUp,
  InboxIcon,
  Image,
  Star,
  Upload,
  Camera,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: VendorDashboard,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface MachineListing {
  id: string;
  title: string;
  slug: string;
  condition: string;
  price_type: string;
  asking_price: number | null;
  is_active: boolean;
  is_sold: boolean;
  view_count: number;
  enquiry_count: number;
  created_at: string;
}

interface MaterialListing {
  id: string;
  title: string;
  slug: string;
  unit: string;
  price_per_unit: number | null;
  is_in_stock: boolean;
  is_active: boolean;
  view_count: number;
  enquiry_count: number;
  order_count: number;
  created_at: string;
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

interface MaterialOrder {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  buyer_phone: string;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  material: { title: string; slug: string } | null;
  buyer: { full_name: string | null } | null;
}

interface MachineOrder {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  buyer_name: string;
  buyer_phone: string;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  machine: { title: string; slug: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    new: { label: "New", variant: "default" },
    negotiating: { label: "Negotiating", variant: "secondary" },
    accepted: { label: "Accepted", variant: "default" },
    declined: { label: "Declined", variant: "destructive" },
    closed: { label: "Closed", variant: "outline" },
    quoted: { label: "Quoted", variant: "secondary" },
    pending: { label: "Pending", variant: "secondary" },
    paid: { label: "Paid", variant: "default" },
    failed: { label: "Failed", variant: "destructive" },
    refunded: { label: "Refunded", variant: "outline" },
    confirmed: { label: "Confirmed", variant: "default" },
    dispatched: { label: "Dispatched", variant: "secondary" },
    delivered: { label: "Delivered", variant: "default" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };
  const cfg = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

function formatCurrency(n: number | null) {
  if (n == null) return "—";
  return "₹" + n.toLocaleString("en-IN");
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

function VendorDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  // ── vendor
  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ["my-vendor-full", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("vendors")
        .select("id,business_name,slug,zone,subscription_plan")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  if (vendorLoading) {
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

  if (!vendor) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto max-w-xl px-4 py-24 text-center">
          <div className="mb-4 inline-grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold">No vendor profile found</h1>
          <p className="mt-2 text-muted-foreground">
            You need a vendor profile before you can manage listings.
          </p>
          <Button className="mt-6" onClick={() => navigate({ to: "/register-vendor" })}>
            Register Your Business
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Vendor Dashboard
            </div>
            <h1 className="mt-0.5 font-display text-2xl font-bold">{vendor.business_name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{vendor.subscription_plan} plan · {(vendor as any).city ?? vendor.zone ?? "Belagavi"}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/machines/new">
                <Hammer className="mr-1.5 h-3.5 w-3.5" />
                List Machine
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/materials/new">
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                List Material
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto flex-1 px-4 py-6">
        <Tabs defaultValue="matched-reqs">
          <TabsList className="mb-6 grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="matched-reqs" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              Matched Leads
            </TabsTrigger>
            <TabsTrigger value="photos" className="gap-1.5">
              <Camera className="h-3.5 w-3.5" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-1.5">
              <Package className="h-3.5 w-3.5" />
              My Listings
            </TabsTrigger>
            <TabsTrigger value="enquiries" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Enquiries
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matched-reqs">
            <MatchedRequirementsTab vendorId={vendor.id} qc={qc} />
          </TabsContent>

          <TabsContent value="photos">
            <PhotosTab vendorId={vendor.id} vendorSlug={vendor.slug} subscriptionPlan={vendor.subscription_plan} qc={qc} />
          </TabsContent>

          <TabsContent value="listings">
            <ListingsTab vendorId={vendor.id} qc={qc} />
          </TabsContent>

          <TabsContent value="enquiries">
            <EnquiriesTab vendorId={vendor.id} qc={qc} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab vendorId={vendor.id} qc={qc} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

// ─── Listings Tab ─────────────────────────────────────────────────────────────

function ListingsTab({ vendorId, qc }: { vendorId: string; qc: ReturnType<typeof useQueryClient> }) {
  const [subTab, setSubTab] = useState<"machines" | "materials">("machines");

  const { data: machines = [], isLoading: mLoading } = useQuery({
    queryKey: ["my-machine-listings", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("machine_listings")
        .select("id,title,slug,condition,price_type,asking_price,is_active,is_sold,view_count,enquiry_count,created_at")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MachineListing[];
    },
  });

  const { data: materials = [], isLoading: matLoading } = useQuery({
    queryKey: ["my-material-listings", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_listings")
        .select("id,title,slug,unit,price_per_unit,is_in_stock,is_active,view_count,enquiry_count,order_count,created_at")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MaterialListing[];
    },
  });

  const toggleMachineActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("machine_listings").update({ is_active: !current }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(current ? "Listing deactivated" : "Listing activated"); qc.invalidateQueries({ queryKey: ["my-machine-listings"] }); }
  };

  const markMachineSold = async (id: string) => {
    const { error } = await supabase.from("machine_listings").update({ is_sold: true, is_active: false }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Marked as sold"); qc.invalidateQueries({ queryKey: ["my-machine-listings"] }); }
  };

  const deleteMachine = async (id: string) => {
    if (!confirm("Delete this machine listing? This cannot be undone.")) return;
    const { error } = await supabase.from("machine_listings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Listing deleted"); qc.invalidateQueries({ queryKey: ["my-machine-listings"] }); }
  };

  const toggleMaterialActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("material_listings").update({ is_active: !current }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(current ? "Listing deactivated" : "Listing activated"); qc.invalidateQueries({ queryKey: ["my-material-listings"] }); }
  };

  const toggleMaterialStock = async (id: string, current: boolean) => {
    const { error } = await supabase.from("material_listings").update({ is_in_stock: !current }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(current ? "Marked out of stock" : "Marked in stock"); qc.invalidateQueries({ queryKey: ["my-material-listings"] }); }
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm("Delete this material listing? This cannot be undone.")) return;
    const { error } = await supabase.from("material_listings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Listing deleted"); qc.invalidateQueries({ queryKey: ["my-material-listings"] }); }
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Machines Listed" value={machines.length} icon={Hammer} />
        <StatCard label="Materials Listed" value={materials.length} icon={Layers} />
        <StatCard label="Total Views" value={[...machines, ...materials].reduce((a, m) => a + (m.view_count || 0), 0)} icon={Eye} />
        <StatCard label="Total Enquiries" value={[...machines, ...materials].reduce((a, m) => a + (m.enquiry_count || 0), 0)} icon={MessageSquare} />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab("machines")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${subTab === "machines" ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:border-primary/40"}`}
        >
          Machines ({machines.length})
        </button>
        <button
          onClick={() => setSubTab("materials")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${subTab === "materials" ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:border-primary/40"}`}
        >
          Materials ({materials.length})
        </button>
      </div>

      {subTab === "machines" && (
        <div>
          {mLoading ? (
            <LoadingRows />
          ) : machines.length === 0 ? (
            <EmptyState
              icon={Hammer}
              text="No machine listings yet."
              cta={{ to: "/machines/new", label: "List a Machine" }}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Machine</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Price</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Views / Enquiries</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {machines.map((m) => (
                    <tr key={m.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium line-clamp-1">{m.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">{m.condition.replace("_", " ")} · {relativeDate(m.created_at)}</div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {m.price_type === "on_request" ? <span className="text-muted-foreground">On request</span> : formatCurrency(m.asking_price)}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell text-muted-foreground">
                        {m.view_count} views · {m.enquiry_count} enquiries
                      </td>
                      <td className="px-4 py-3">
                        {m.is_sold ? (
                          <Badge variant="outline">Sold</Badge>
                        ) : m.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild size="icon" variant="ghost" className="h-7 w-7" title="View listing">
                            <Link to="/machines/$slug" params={{ slug: m.slug }}><Eye className="h-3.5 w-3.5" /></Link>
                          </Button>
                          {!m.is_sold && (
                            <>
                              <Button size="icon" variant="ghost" className="h-7 w-7" title={m.is_active ? "Deactivate" : "Activate"} onClick={() => toggleMachineActive(m.id, m.is_active)}>
                                {m.is_active ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" title="Mark as sold" onClick={() => markMachineSold(m.id)}>
                                <TrendingUp className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Delete" onClick={() => deleteMachine(m.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {subTab === "materials" && (
        <div>
          {matLoading ? (
            <LoadingRows />
          ) : materials.length === 0 ? (
            <EmptyState
              icon={Layers}
              text="No material listings yet."
              cta={{ to: "/materials/new", label: "List a Material" }}
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Material</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Price / Unit</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Views / Orders</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {materials.map((m) => (
                    <tr key={m.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium line-clamp-1">{m.title}</div>
                        <div className="text-xs text-muted-foreground">{m.unit} · {relativeDate(m.created_at)}</div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        {m.price_per_unit ? `${formatCurrency(m.price_per_unit)}/${m.unit}` : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell text-muted-foreground">
                        {m.view_count} views · {m.order_count} orders
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {m.is_active ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                          {!m.is_in_stock && <Badge variant="outline" className="text-xs">Out of Stock</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild size="icon" variant="ghost" className="h-7 w-7" title="View listing">
                            <Link to="/materials/$slug" params={{ slug: m.slug }}><Eye className="h-3.5 w-3.5" /></Link>
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" title={m.is_active ? "Deactivate" : "Activate"} onClick={() => toggleMaterialActive(m.id, m.is_active)}>
                            {m.is_active ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" title={m.is_in_stock ? "Mark out of stock" : "Mark in stock"} onClick={() => toggleMaterialStock(m.id, m.is_in_stock)}>
                            <RefreshCcw className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Delete" onClick={() => deleteMaterial(m.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Enquiries Tab ────────────────────────────────────────────────────────────

function EnquiriesTab({ vendorId, qc }: { vendorId: string; qc: ReturnType<typeof useQueryClient> }) {
  const [subTab, setSubTab] = useState<"machine" | "material">("machine");

  const { data: machineEnq = [], isLoading: meLoading } = useQuery({
    queryKey: ["my-machine-enquiries", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("machine_enquiries")
        .select("id,buyer_name,buyer_phone,message,offered_price,status,created_at,machine:machine_listings(title,slug)")
        .in(
          "machine_id",
          (await supabase.from("machine_listings").select("id").eq("vendor_id", vendorId)).data?.map((r) => r.id) ?? []
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MachineEnquiry[];
    },
  });

  const { data: materialEnq = [], isLoading: matELoading } = useQuery({
    queryKey: ["my-material-enquiries", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_enquiries")
        .select("id,buyer_name,buyer_phone,message,requested_quantity,status,created_at,material:material_listings(title,slug)")
        .in(
          "material_id",
          (await supabase.from("material_listings").select("id").eq("vendor_id", vendorId)).data?.map((r) => r.id) ?? []
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MaterialEnquiry[];
    },
  });

  const updateMachineEnquiryStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("machine_enquiries").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["my-machine-enquiries"] }); }
  };

  const updateMaterialEnquiryStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("material_enquiries").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["my-material-enquiries"] }); }
  };

  const newMachineCount = machineEnq.filter((e) => e.status === "new").length;
  const newMaterialCount = materialEnq.filter((e) => e.status === "new").length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab("machine")}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition ${subTab === "machine" ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:border-primary/40"}`}
        >
          Machine Enquiries
          {newMachineCount > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${subTab === "machine" ? "bg-white/20" : "bg-primary text-primary-foreground"}`}>
              {newMachineCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setSubTab("material")}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition ${subTab === "material" ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:border-primary/40"}`}
        >
          Material Enquiries
          {newMaterialCount > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${subTab === "material" ? "bg-white/20" : "bg-primary text-primary-foreground"}`}>
              {newMaterialCount}
            </span>
          )}
        </button>
      </div>

      {subTab === "machine" && (
        meLoading ? <LoadingRows /> : machineEnq.length === 0 ? (
          <EmptyState icon={InboxIcon} text="No machine enquiries yet." />
        ) : (
          <div className="space-y-3">
            {machineEnq.map((e) => (
              <div key={e.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{e.buyer_name}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    {e.machine && (
                      <Link to="/machines/$slug" params={{ slug: e.machine.slug }} className="text-xs text-primary hover:underline">
                        {e.machine.title}
                      </Link>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      <a href={`tel:${e.buyer_phone}`} className="hover:text-primary">{e.buyer_phone}</a>
                      {e.offered_price && <span> · Offered: {formatCurrency(e.offered_price)}</span>}
                      <span> · {relativeDate(e.created_at)}</span>
                    </div>
                    {e.message && <p className="mt-2 text-sm text-foreground">{e.message}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${e.buyer_phone}`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium hover:border-primary/40 hover:bg-muted">
                      📞 Call
                    </a>
                    <a href={`https://wa.me/91${e.buyer_phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700">
                      WhatsApp
                    </a>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Update status:</span>
                  {(["new", "negotiating", "accepted", "declined", "closed"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateMachineEnquiryStatus(e.id, s)}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${e.status === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {subTab === "material" && (
        matELoading ? <LoadingRows /> : materialEnq.length === 0 ? (
          <EmptyState icon={InboxIcon} text="No material enquiries yet." />
        ) : (
          <div className="space-y-3">
            {materialEnq.map((e) => (
              <div key={e.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{e.buyer_name}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    {e.material && (
                      <Link to="/materials/$slug" params={{ slug: e.material.slug }} className="text-xs text-primary hover:underline">
                        {e.material.title}
                      </Link>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      <a href={`tel:${e.buyer_phone}`} className="hover:text-primary">{e.buyer_phone}</a>
                      {e.requested_quantity && <span> · Qty: {e.requested_quantity}</span>}
                      <span> · {relativeDate(e.created_at)}</span>
                    </div>
                    {e.message && <p className="mt-2 text-sm text-foreground">{e.message}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${e.buyer_phone}`} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium hover:border-primary/40 hover:bg-muted">
                      📞 Call
                    </a>
                    <a href={`https://wa.me/91${e.buyer_phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-md bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700">
                      WhatsApp
                    </a>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Update status:</span>
                  {(["new", "quoted", "closed"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateMaterialEnquiryStatus(e.id, s)}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${e.status === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ vendorId, qc }: { vendorId: string; qc: ReturnType<typeof useQueryClient> }) {
  const [subTab, setSubTab] = useState<"material" | "machine">("material");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Material orders ──
  const { data: materialOrders = [], isLoading: matLoading } = useQuery({
    queryKey: ["my-orders", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_orders")
        .select("id,quantity,unit_price,total_amount,buyer_phone,payment_status,fulfillment_status,created_at,material:material_listings(title,slug),buyer:profiles(full_name)")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MaterialOrder[];
    },
  });

  // ── Machine orders ──
  const { data: machineOrders = [], isLoading: machLoading } = useQuery({
    queryKey: ["my-machine-orders", vendorId],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("machine_orders")
        .select("id,quantity,unit_price,total_amount,buyer_name,buyer_phone,payment_status,fulfillment_status,created_at,machine:machine_listings(title,slug)")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MachineOrder[];
    },
  });

  const updateMaterialFulfillment = async (id: string, status: string) => {
    const { error } = await supabase.from("material_orders").update({ fulfillment_status: status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Fulfillment status updated"); qc.invalidateQueries({ queryKey: ["my-orders"] }); }
  };

  const updateMachineFulfillment = async (id: string, status: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("machine_orders").update({ fulfillment_status: status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Fulfillment status updated"); qc.invalidateQueries({ queryKey: ["my-machine-orders"] }); }
  };

  const allOrders = subTab === "material" ? materialOrders : machineOrders;
  const filtered = filterStatus === "all" ? allOrders : allOrders.filter((o) => o.fulfillment_status === filterStatus);

  const totalRevenue = [...materialOrders, ...machineOrders]
    .filter(o => o.payment_status === "paid")
    .reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingCount = [...materialOrders, ...machineOrders].filter(o => o.fulfillment_status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Material Orders" value={materialOrders.length} icon={ShoppingCart} />
        <StatCard label="Machine Orders" value={machineOrders.length} icon={Hammer} />
        <StatCard label="Paid Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={TrendingUp} isMonetary />
        <StatCard label="Pending" value={pendingCount} icon={Clock} />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setSubTab("material"); setFilterStatus("all"); }}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition ${subTab === "material" ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:border-primary/40"}`}
        >
          <Layers className="h-3.5 w-3.5" /> Material Orders ({materialOrders.length})
        </button>
        <button
          onClick={() => { setSubTab("machine"); setFilterStatus("all"); }}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition ${subTab === "machine" ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:border-primary/40"}`}
        >
          <Hammer className="h-3.5 w-3.5" /> Machine Orders ({machineOrders.length})
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter by status:</span>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "confirmed", "dispatched", "delivered", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-md border px-3 py-1 text-xs font-medium transition capitalize ${filterStatus === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Material orders list ── */}
      {subTab === "material" && (
        matLoading ? <LoadingRows /> : filtered.length === 0 ? (
          <EmptyState icon={ShoppingCart} text={filterStatus === "all" ? "No material orders received yet." : `No ${filterStatus} material orders.`} />
        ) : (
          <div className="space-y-3">
            {(filtered as MaterialOrder[]).map((o) => (
              <div key={o.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    {o.material && (
                      <Link to="/materials/$slug" params={{ slug: o.material.slug }} className="font-semibold hover:text-primary hover:underline">
                        {o.material.title}
                      </Link>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={o.payment_status} />
                      <StatusBadge status={o.fulfillment_status} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {o.buyer?.full_name && <span>{o.buyer.full_name} · </span>}
                      <a href={`tel:${o.buyer_phone}`} className="hover:text-primary">{o.buyer_phone}</a>
                      <span> · Qty: {o.quantity}</span>
                      <span> · {relativeDate(o.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl font-bold">{formatCurrency(o.total_amount)}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(o.unit_price)} / unit</div>
                  </div>
                </div>
                {o.payment_status === "paid" && o.fulfillment_status !== "delivered" && o.fulfillment_status !== "cancelled" && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">Update fulfillment:</span>
                    {(["confirmed", "dispatched", "delivered", "cancelled"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateMaterialFulfillment(o.id, s)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition capitalize ${o.fulfillment_status === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Machine orders list ── */}
      {subTab === "machine" && (
        machLoading ? <LoadingRows /> : filtered.length === 0 ? (
          <EmptyState icon={Hammer} text={filterStatus === "all" ? "No machine orders received yet." : `No ${filterStatus} machine orders.`} />
        ) : (
          <div className="space-y-3">
            {(filtered as MachineOrder[]).map((o) => (
              <div key={o.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    {o.machine && (
                      <Link to="/machines/$slug" params={{ slug: o.machine.slug }} className="font-semibold hover:text-primary hover:underline">
                        {o.machine.title}
                      </Link>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge status={o.payment_status} />
                      <StatusBadge status={o.fulfillment_status} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <span>{o.buyer_name} · </span>
                      <a href={`tel:${o.buyer_phone}`} className="hover:text-primary">{o.buyer_phone}</a>
                      <span> · Qty: {o.quantity}</span>
                      <span> · {relativeDate(o.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl font-bold">{formatCurrency(o.total_amount)}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(o.unit_price)} / unit</div>
                    <Link
                      to="/orders/machine/$id"
                      params={{ id: o.id }}
                      className="mt-1 inline-block text-xs text-primary hover:underline"
                    >
                      View Order →
                    </Link>
                  </div>
                </div>
                {o.payment_status === "paid" && o.fulfillment_status !== "delivered" && o.fulfillment_status !== "cancelled" && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">Update fulfillment:</span>
                    {(["confirmed", "dispatched", "delivered", "cancelled"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateMachineFulfillment(o.id, s)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition capitalize ${o.fulfillment_status === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  isMonetary = false,
}: {
  label: string;
  value: number | string;
  icon: typeof Package;
  isMonetary?: boolean;
}) {
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

function EmptyState({
  icon: Icon,
  text,
  cta,
}: {
  icon: typeof Package;
  text: string;
  cta?: { to: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
      <Icon className="mb-3 h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{text}</p>
      {cta && (
        <Button asChild size="sm" className="mt-4">
          <Link to={cta.to as never}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {cta.label}
          </Link>
        </Button>
      )}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

// ─── Photos Tab ───────────────────────────────────────────────────────────────

const PLAN_PHOTO_LIMITS: Record<string, number> = {
  free: 3,
  standard: 10,
  premium: 25,
  gold: 50,
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface VendorPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  is_primary: boolean;
  sort_order: number;
}

function PhotosTab({
  vendorId,
  vendorSlug,
  subscriptionPlan,
  qc,
}: {
  vendorId: string;
  vendorSlug: string;
  subscriptionPlan: string;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const photoLimit = PLAN_PHOTO_LIMITS[subscriptionPlan] ?? 3;

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["my-vendor-photos", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_photos")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("is_primary", { ascending: false })
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as VendorPhoto[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["my-vendor-photos", vendorId] });
    // Also invalidate the public vendor profile cache
    qc.invalidateQueries({ queryKey: ["vendor-photos", vendorId] });
    qc.invalidateQueries({ queryKey: ["vendor", vendorSlug] });
    qc.invalidateQueries({ queryKey: ["featured-vendors"] });
    qc.invalidateQueries({ queryKey: ["vendor-primary-photos"] });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Validate count against plan limit
    const remaining = photoLimit - photos.length;
    if (remaining <= 0) {
      toast.error(`Your ${subscriptionPlan} plan allows a maximum of ${photoLimit} photos. Delete some to upload more.`);
      return;
    }
    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.warning(`Only uploading ${remaining} photo(s) — plan limit reached.`);
    }

    setUploading(true);
    let uploaded = 0;

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];

      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported image type. Use JPEG, PNG, or WebP.`);
        continue;
      }

      // Validate size
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`"${file.name}" exceeds the 5 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
        continue;
      }

      // Build a unique storage path: {vendor_id}/{uuid}-{sanitized-filename}
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const uuid = crypto.randomUUID();
      const storagePath = `${vendorId}/${uuid}.${ext}`;

      // Upload to Supabase Storage
      const { error: upErr } = await supabase.storage
        .from("vendor-photos")
        .upload(storagePath, file, { upsert: false });

      if (upErr) {
        toast.error(`Upload failed for "${file.name}": ${upErr.message}`);
        continue;
      }

      // Get the permanent public URL
      const { data: pub } = supabase.storage
        .from("vendor-photos")
        .getPublicUrl(storagePath);

      // Determine if this should be the primary photo
      const isFirst = photos.length === 0 && i === 0;

      // Insert row into vendor_photos table
      const { error: dbErr } = await supabase.from("vendor_photos").insert({
        vendor_id: vendorId,
        photo_url: pub.publicUrl,
        caption: null,
        is_primary: isFirst,
        sort_order: photos.length + i,
      });

      if (dbErr) {
        toast.error(`Failed to save photo record: ${dbErr.message}`);
        // Clean up orphaned storage object
        await supabase.storage.from("vendor-photos").remove([storagePath]);
        continue;
      }

      uploaded++;
    }

    if (uploaded > 0) {
      toast.success(`${uploaded} photo${uploaded > 1 ? "s" : ""} uploaded successfully!`);
      invalidate();
    }

    setUploading(false);
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setPrimary = async (photo: VendorPhoto) => {
    if (photo.is_primary) return;
    // Clear existing primary
    await supabase
      .from("vendor_photos")
      .update({ is_primary: false })
      .eq("vendor_id", vendorId);
    // Set new primary
    const { error } = await supabase
      .from("vendor_photos")
      .update({ is_primary: true })
      .eq("id", photo.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Primary photo updated!");
    invalidate();
  };

  const deletePhoto = async (photo: VendorPhoto) => {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    setDeletingId(photo.id);

    // Extract storage path from public URL
    // URL format: https://.../storage/v1/object/public/vendor-photos/{path}
    const marker = "/vendor-photos/";
    const idx = photo.photo_url.indexOf(marker);
    if (idx !== -1) {
      const storagePath = photo.photo_url.slice(idx + marker.length);
      await supabase.storage.from("vendor-photos").remove([storagePath]);
    }

    const { error } = await supabase.from("vendor_photos").delete().eq("id", photo.id);
    if (error) { toast.error(error.message); setDeletingId(null); return; }

    // If we deleted the primary, promote the next photo
    if (photo.is_primary && photos.length > 1) {
      const next = photos.find((p) => p.id !== photo.id);
      if (next) {
        await supabase.from("vendor_photos").update({ is_primary: true }).eq("id", next.id);
      }
    }

    toast.success("Photo deleted.");
    setDeletingId(null);
    invalidate();
  };

  if (isLoading) return <LoadingRows />;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Profile Photos</h2>
          <p className="text-sm text-muted-foreground">
            {photos.length} / {photoLimit} photos used · The primary photo is your cover image on listings.
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            id="photo-upload-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading || photos.length >= photoLimit}
          />
          <Button
            id="photo-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || photos.length >= photoLimit}
            className="gap-2"
          >
            {uploading ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Upload Photos"}
          </Button>
        </div>
      </div>

      {/* Plan limit note */}
      {photos.length >= photoLimit && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            You've reached your {subscriptionPlan} plan limit of {photoLimit} photos.
            Delete a photo to upload a new one, or upgrade your plan for more.
          </span>
        </div>
      )}

      {/* Upload drop hint */}
      {photos.length === 0 && !uploading && (
        <button
          id="photo-upload-dropzone"
          onClick={() => fileInputRef.current?.click()}
          className="group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-16 text-center transition hover:border-primary/50 hover:bg-primary/5"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition">
            <Image className="h-8 w-8 text-muted-foreground/50 group-hover:text-primary/60" />
          </div>
          <div>
            <p className="font-medium text-foreground">Upload your first photo</p>
            <p className="mt-1 text-sm text-muted-foreground">JPEG, PNG or WebP · Max 5 MB each · Up to {photoLimit} photos</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Upload className="h-4 w-4" /> Choose Photos
          </span>
        </button>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`group relative overflow-hidden rounded-xl border-2 bg-card transition ${
                photo.is_primary
                  ? "border-primary shadow-md"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={photo.photo_url}
                  alt={photo.caption ?? "Vendor photo"}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Primary badge */}
              {photo.is_primary && (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground shadow">
                  <Star className="h-3 w-3 fill-current" /> Primary
                </div>
              )}

              {/* Action bar */}
              <div className="flex items-center justify-between gap-2 border-t border-border bg-card/95 p-2">
                {!photo.is_primary ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-xs"
                    onClick={() => setPrimary(photo)}
                    title="Set as primary / cover photo"
                  >
                    <Star className="h-3 w-3" /> Set Primary
                  </Button>
                ) : (
                  <span className="text-xs font-medium text-primary">Cover photo</span>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => deletePhoto(photo)}
                  disabled={deletingId === photo.id}
                  title="Delete photo"
                >
                  {deletingId === photo.id ? (
                    <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}

          {/* Upload more slot */}
          {photos.length < photoLimit && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-muted-foreground transition hover:border-primary/50 hover:text-primary disabled:opacity-50"
            >
              <Upload className="h-6 w-6" />
              <span className="text-xs font-medium">Add more</span>
            </button>
          )}
        </div>
      )}

      {/* View profile link */}
      {photos.length > 0 && (
        <div className="text-center">
          <Button asChild variant="outline" size="sm">
            <a href={`/vendor/${vendorSlug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview your profile
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

function MatchedRequirementsTab({ vendorId, qc }: { vendorId: string; qc: ReturnType<typeof useQueryClient> }) {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["vendor-matched-requirements", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requirement_matches")
        .select("*, requirement:requirements(*, category:categories(name), customer:profiles(full_name, phone, whatsapp_number))")
        .eq("vendor_id", vendorId)
        .order("notified_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const markAsSeen = async (matchId: string) => {
    await supabase.from("requirement_matches").update({ seen_at: new Date().toISOString() }).eq("id", matchId);
    qc.invalidateQueries({ queryKey: ["vendor-matched-requirements", vendorId] });
  };

  if (isLoading) return <LoadingRows />;
  if (matches.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        text="No automated requirement matches yet. When buyers post jobs matching your category & location, they will show up here automatically!"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Automated Leads for Your Workshop</h2>
        <span className="text-xs text-muted-foreground">{matches.length} matching requirement{matches.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid gap-4">
        {matches.map((m: any) => {
          const req = m.requirement;
          if (!req) return null;
          const isUnseen = !m.seen_at;
          const waPhone = req.customer?.whatsapp_number || req.customer?.phone || "";
          const cleanPhone = waPhone.replace(/\D/g, "");
          const waText = encodeURIComponent(`Hello! I saw your requirement "${req.title}" on IndustryResource.in and would like to provide a quote.`);
          const waUrl = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${waText}` : null;

          return (
            <div
              key={m.id}
              className={`rounded-xl border p-5 transition ${isUnseen ? "border-primary/50 bg-primary/5 dark:bg-primary/10" : "border-border bg-card"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {isUnseen && <Badge variant="default" className="bg-primary text-[10px]">NEW MATCH</Badge>}
                    {req.is_urgent && <Badge variant="destructive" className="text-[10px]">URGENT</Badge>}
                    <span className="text-xs text-muted-foreground">Match Score: {m.match_score}/8</span>
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold">{req.title}</h3>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(m.notified_at), { addSuffix: true })}
                </div>
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{req.description}</p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {req.category?.name && <span className="font-semibold text-primary">Category: {req.category.name}</span>}
                <span>Location: {req.zone_preference ? `${req.zone_preference}, ` : ""}{req.city || "Belagavi"}</span>
                {req.budget_range && <span>Budget: {req.budget_range}</span>}
                {req.quantity && <span>Qty: {req.quantity}</span>}
                {req.material && <span>Material: {req.material}</span>}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div className="text-xs text-muted-foreground">
                  Posted by: <strong>{req.customer?.full_name || "Verified Industrial Buyer"}</strong>
                </div>
                <div className="flex items-center gap-2">
                  {isUnseen && (
                    <Button size="sm" variant="ghost" onClick={() => markAsSeen(m.id)}>
                      Mark as read
                    </Button>
                  )}
                  {waUrl ? (
                    <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5" onClick={() => markAsSeen(m.id)}>
                      <a href={waUrl} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="h-4 w-4" />
                        Send Quote on WhatsApp
                      </a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => markAsSeen(m.id)}>
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
