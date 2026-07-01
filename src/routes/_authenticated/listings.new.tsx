import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Zap, Image } from "lucide-react";

export const Route = createFileRoute("/_authenticated/listings/new")({
  component: NewListingPage,
});

const ZONES = ["Udyambag", "Auto Nagar", "Machhe KIADB", "Gokul Road", "Khanapur Road", "Bogarves", "Shahapur", "Other"];

function NewListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    listing_type: "job_work",
    title: "",
    description: "",
    category_id: "",
    zone: "",
    price_type: "contact",
    price: "",
    price_unit: "",
    contact_name: "",
    contact_phone: "",
    is_urgent: false,
    tags: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  // Get vendor for current user
  const { data: vendor } = useQuery({
    queryKey: ["my-vendor-basic", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("id,business_name,phone,zone").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name,slug").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - photos.length);
    setPhotos((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of photos) {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("classified-photos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("classified-photos").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) { toast.error("You need a vendor profile to post listings."); return; }
    if (!form.title || !form.description) { toast.error("Title and description are required."); return; }

    setBusy(true);
    try {
      setUploading(photos.length > 0);
      const photoUrls = photos.length > 0 ? await uploadPhotos() : [];
      setUploading(false);

      const payload: Record<string, unknown> = {
        vendor_id: vendor.id,
        listing_type: form.listing_type,
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: form.category_id || null,
        zone: form.zone || vendor.zone || null,
        price_type: form.price_type,
        price: form.price ? parseFloat(form.price) : null,
        price_unit: form.price_unit.trim() || null,
        contact_name: form.contact_name.trim() || null,
        contact_phone: form.contact_phone.trim() || vendor.phone,
        is_urgent: form.is_urgent,
        photo_urls: photoUrls,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        is_active: true,
        expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      };

      const { error } = await supabase.from("classified_listings").insert(payload);
      if (error) throw error;

      toast.success("✅ Listing posted! It will appear in classifieds.");
      qc.invalidateQueries({ queryKey: ["classified-listings"] });
      navigate({ to: "/listings" });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to post listing");
    } finally {
      setBusy(false);
      setUploading(false);
    }
  };

  if (!vendor && user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="container mx-auto max-w-md px-4 py-24 text-center">
          <p className="text-muted-foreground">You need a vendor profile to post listings.</p>
          <Button asChild className="mt-4"><Link to="/register-vendor">Register Business</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link to="/listings" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Classifieds
        </Link>

        <h1 className="font-display text-2xl font-bold">Post a Classified Listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your listing will appear for 30 days. Free for all vendors.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {/* Listing type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Listing Type *</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { value: "job_work",     label: "Job Work",     emoji: "🔧" },
                { value: "for_sale",     label: "For Sale",     emoji: "🛒" },
                { value: "wanted",       label: "Wanted",       emoji: "📦" },
                { value: "announcement", label: "Announcement", emoji: "📣" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, listing_type: t.value })}
                  className={`rounded-lg border p-3 text-sm font-medium transition ${form.listing_type === t.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <div className="mt-1">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="listing-title">Title *</Label>
            <Input
              id="listing-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={form.listing_type === "job_work" ? "e.g. CNC Turning Job Work Available" : form.listing_type === "for_sale" ? "e.g. Lathe Machine for Sale" : form.listing_type === "wanted" ? "e.g. Wanted: MS Flat Bars 50mm" : "e.g. New Service Launch — Laser Cutting"}
              maxLength={120}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="listing-desc">Description *</Label>
            <Textarea
              id="listing-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the service, item, or requirement in detail. Include specifications, quantity, material, etc."
              rows={5}
              required
            />
          </div>

          {/* Category & Zone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category_id || "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Zone</Label>
              <Select value={form.zone || "none"} onValueChange={(v) => setForm({ ...form, zone: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any zone</SelectItem>
                  {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3">
            <Label>Pricing</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { value: "contact",    label: "Contact for price" },
                { value: "fixed",      label: "Fixed price" },
                { value: "negotiable", label: "Negotiable" },
                { value: "free",       label: "Free" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, price_type: t.value })}
                  className={`rounded-lg border py-2 px-3 text-xs font-medium transition ${form.price_type === t.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {(form.price_type === "fixed" || form.price_type === "negotiable") && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="listing-price">Price (₹)</Label>
                  <Input
                    id="listing-price"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 500"
                    min={0}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="listing-unit">Per unit (optional)</Label>
                  <Input
                    id="listing-unit"
                    value={form.price_unit}
                    onChange={(e) => setForm({ ...form, price_unit: e.target.value })}
                    placeholder="piece / hr / kg / lot"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="listing-contact-name">Contact Name</Label>
              <Input
                id="listing-contact-name"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder={vendor?.business_name ?? "Your name"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="listing-contact-phone">Contact Phone</Label>
              <Input
                id="listing-contact-phone"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                placeholder={vendor?.phone ?? "10-digit number"}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="listing-tags">Tags (comma separated)</Label>
            <Input
              id="listing-tags"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. CNC, Turning, MS, Belagavi"
            />
          </div>

          {/* Urgent toggle */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, is_urgent: !form.is_urgent })}
              className={`relative h-6 w-11 rounded-full transition ${form.is_urgent ? "bg-red-500" : "bg-muted-foreground/30"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.is_urgent ? "left-5" : "left-0.5"}`} />
            </button>
            <div>
              <p className="text-sm font-medium">Mark as Urgent</p>
              <p className="text-xs text-muted-foreground">Shows a <span className="text-red-600 font-semibold">⚡ Urgent</span> badge on your listing</p>
            </div>
            <Zap className={`ml-auto h-5 w-5 ${form.is_urgent ? "text-red-500" : "text-muted-foreground/40"}`} />
          </div>

          {/* Photo upload */}
          <div className="space-y-3">
            <Label>Photos (up to 5)</Label>
            <div className="flex flex-wrap gap-3">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary transition"
                >
                  <Image className="h-6 w-6" />
                  <span className="text-xs">Add photo</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/listings" })} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="flex-1">
              {uploading ? "Uploading photos…" : busy ? "Posting…" : "Post Listing"}
            </Button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
