import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MachineFilters = {
  q?: string;
  category?: string | null;
  condition?: string | null;
  zone?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sort?: "newest" | "price_low" | "price_high";
};

export type MaterialFilters = {
  q?: string;
  category?: string | null;
  zone?: string | null;
  inStockOnly?: boolean | null;
  sort?: "newest" | "price_low" | "price_high";
};

export function useMachines(f: MachineFilters) {
  return useQuery({
    queryKey: ["machines", f],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_machines", {
        search_query: f.q || null,
        filter_category: f.category || null,
        filter_condition: f.condition || null,
        filter_zone: f.zone || null,
        min_price: f.minPrice ?? null,
        max_price: f.maxPrice ?? null,
        sort_by: f.sort || "newest",
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMaterials(f: MaterialFilters) {
  return useQuery({
    queryKey: ["materials", f],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_materials", {
        search_query: f.q || null,
        filter_category: f.category || null,
        filter_zone: f.zone || null,
        in_stock_only: f.inStockOnly ?? null,
        sort_by: f.sort || "newest",
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMachine(slug: string) {
  return useQuery({
    queryKey: ["machine", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("machine_listings")
        .select("*, vendor:vendors(id,slug,business_name,zone,is_verified,subscription_plan,rating_avg,rating_count,phone,whatsapp), category:categories(id,name,slug), photos:machine_photos(id,photo_url,is_primary,sort_order)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useMaterial(slug: string) {
  return useQuery({
    queryKey: ["material", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_listings")
        .select("*, vendor:vendors(id,slug,business_name,zone,is_verified,subscription_plan,rating_avg,rating_count,phone,whatsapp), category:categories(id,name,slug), photos:material_photos(id,photo_url,is_primary,sort_order)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,name,name_kn,slug").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });
}

export function useMyVendor(userId?: string | null) {
  return useQuery({
    queryKey: ["my-vendor", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from("vendors").select("id,business_name,zone").eq("user_id", userId).maybeSingle();
      return data;
    },
    enabled: !!userId,
  });
}

export function useSubmitMachineEnquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { machine_id: string; buyer_id?: string | null; buyer_name: string; buyer_phone: string; message?: string; offered_price?: number | null }) => {
      const { error } = await supabase.from("machine_enquiries").insert(input);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["machine"] }),
  });
}

export function useSubmitMaterialEnquiry() {
  return useMutation({
    mutationFn: async (input: { material_id: string; buyer_id?: string | null; buyer_name: string; buyer_phone: string; message?: string; requested_quantity?: number | null }) => {
      const { error } = await supabase.from("material_enquiries").insert(input);
      if (error) throw error;
    },
  });
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) + "-" + Math.random().toString(36).slice(2, 7);
}

export const ZONES = ["Udyambag", "Auto Nagar", "Machhe KIADB", "Gokul Road", "Khanapur Road", "Bogarves", "Shahapur", "Other"];
export const UNITS = ["kg", "ton", "piece", "meter", "liter", "box", "set", "roll"] as const;
export const CONDITIONS: { value: string; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "used_good", label: "Used – Good" },
  { value: "used_fair", label: "Used – Fair" },
  { value: "for_parts", label: "For Parts" },
];
