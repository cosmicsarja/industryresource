
CREATE TABLE public.machine_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  machine_type TEXT,
  brand TEXT,
  model TEXT,
  manufacture_year INT,
  condition TEXT NOT NULL CHECK (condition IN ('new','like_new','used_good','used_fair','for_parts')),
  description TEXT,
  description_kn TEXT,
  specifications JSONB DEFAULT '{}'::jsonb,
  price_type TEXT DEFAULT 'negotiable' CHECK (price_type IN ('fixed','negotiable','on_request')),
  asking_price NUMERIC(12,2),
  currency TEXT DEFAULT 'INR',
  quantity_available INT DEFAULT 1,
  zone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_sold BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  enquiry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.machine_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_listings TO authenticated;
GRANT ALL ON public.machine_listings TO service_role;
ALTER TABLE public.machine_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active machine listings" ON public.machine_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Vendor can insert own machine listings" ON public.machine_listings FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));
CREATE POLICY "Vendor can update own machine listings" ON public.machine_listings FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));
CREATE POLICY "Vendor can delete own machine listings" ON public.machine_listings FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));
CREATE INDEX idx_machine_listings_vendor ON public.machine_listings(vendor_id);
CREATE INDEX idx_machine_listings_category ON public.machine_listings(category_id);
CREATE INDEX idx_machine_listings_condition ON public.machine_listings(condition);
CREATE INDEX idx_machine_listings_active ON public.machine_listings(is_active, is_sold);
CREATE INDEX idx_machine_listings_zone ON public.machine_listings(zone);

CREATE TABLE public.machine_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID NOT NULL REFERENCES public.machine_listings(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.machine_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_photos TO authenticated;
GRANT ALL ON public.machine_photos TO service_role;
ALTER TABLE public.machine_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view machine photos" ON public.machine_photos FOR SELECT USING (true);
CREATE POLICY "Vendor manages own machine photos" ON public.machine_photos FOR ALL
  USING (auth.uid() IN (SELECT v.user_id FROM public.vendors v JOIN public.machine_listings m ON m.vendor_id = v.id WHERE m.id = machine_id))
  WITH CHECK (auth.uid() IN (SELECT v.user_id FROM public.vendors v JOIN public.machine_listings m ON m.vendor_id = v.id WHERE m.id = machine_id));

CREATE TABLE public.machine_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID NOT NULL REFERENCES public.machine_listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id),
  buyer_name TEXT,
  buyer_phone TEXT,
  message TEXT,
  offered_price NUMERIC(12,2),
  status TEXT DEFAULT 'new' CHECK (status IN ('new','negotiating','accepted','declined','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.machine_enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_enquiries TO authenticated;
GRANT ALL ON public.machine_enquiries TO service_role;
ALTER TABLE public.machine_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can submit machine enquiries" ON public.machine_enquiries FOR INSERT WITH CHECK (auth.uid() = buyer_id OR buyer_id IS NULL);
CREATE POLICY "Buyer and vendor can view machine enquiries" ON public.machine_enquiries FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() IN (SELECT v.user_id FROM public.vendors v JOIN public.machine_listings m ON m.vendor_id = v.id WHERE m.id = machine_id)
);
CREATE POLICY "Vendor can update machine enquiry status" ON public.machine_enquiries FOR UPDATE
  USING (auth.uid() IN (SELECT v.user_id FROM public.vendors v JOIN public.machine_listings m ON m.vendor_id = v.id WHERE m.id = machine_id));

CREATE TABLE public.material_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  material_type TEXT,
  grade_or_spec TEXT,
  description TEXT,
  description_kn TEXT,
  specifications JSONB DEFAULT '{}'::jsonb,
  unit TEXT NOT NULL CHECK (unit IN ('kg','ton','piece','meter','liter','box','set','roll')),
  price_per_unit NUMERIC(12,2),
  currency TEXT DEFAULT 'INR',
  min_order_quantity NUMERIC(10,2) DEFAULT 1,
  stock_quantity NUMERIC(12,2),
  is_in_stock BOOLEAN DEFAULT TRUE,
  allow_online_payment BOOLEAN DEFAULT FALSE,
  zone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  enquiry_count INT DEFAULT 0,
  order_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.material_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_listings TO authenticated;
GRANT ALL ON public.material_listings TO service_role;
ALTER TABLE public.material_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active material listings" ON public.material_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Vendor can insert own material listings" ON public.material_listings FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));
CREATE POLICY "Vendor can update own material listings" ON public.material_listings FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));
CREATE POLICY "Vendor can delete own material listings" ON public.material_listings FOR DELETE USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));
CREATE INDEX idx_material_listings_vendor ON public.material_listings(vendor_id);
CREATE INDEX idx_material_listings_category ON public.material_listings(category_id);
CREATE INDEX idx_material_listings_active ON public.material_listings(is_active, is_in_stock);

CREATE TABLE public.material_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.material_listings(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.material_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_photos TO authenticated;
GRANT ALL ON public.material_photos TO service_role;
ALTER TABLE public.material_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view material photos" ON public.material_photos FOR SELECT USING (true);
CREATE POLICY "Vendor manages own material photos" ON public.material_photos FOR ALL
  USING (auth.uid() IN (SELECT v.user_id FROM public.vendors v JOIN public.material_listings m ON m.vendor_id = v.id WHERE m.id = material_id))
  WITH CHECK (auth.uid() IN (SELECT v.user_id FROM public.vendors v JOIN public.material_listings m ON m.vendor_id = v.id WHERE m.id = material_id));

CREATE TABLE public.material_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.material_listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id),
  buyer_name TEXT,
  buyer_phone TEXT,
  message TEXT,
  requested_quantity NUMERIC(10,2),
  status TEXT DEFAULT 'new' CHECK (status IN ('new','quoted','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.material_enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_enquiries TO authenticated;
GRANT ALL ON public.material_enquiries TO service_role;
ALTER TABLE public.material_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can submit material enquiries" ON public.material_enquiries FOR INSERT WITH CHECK (auth.uid() = buyer_id OR buyer_id IS NULL);
CREATE POLICY "Buyer and vendor can view material enquiries" ON public.material_enquiries FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() IN (SELECT v.user_id FROM public.vendors v JOIN public.material_listings m ON m.vendor_id = v.id WHERE m.id = material_id)
);
CREATE POLICY "Vendor can update material enquiry status" ON public.material_enquiries FOR UPDATE
  USING (auth.uid() IN (SELECT v.user_id FROM public.vendors v JOIN public.material_listings m ON m.vendor_id = v.id WHERE m.id = material_id));

CREATE TABLE public.material_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID NOT NULL REFERENCES public.material_listings(id),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id),
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  platform_commission NUMERIC(12,2),
  delivery_address TEXT,
  buyer_phone TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending','confirmed','dispatched','delivered','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_orders TO authenticated;
GRANT ALL ON public.material_orders TO service_role;
ALTER TABLE public.material_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyer can create material order" ON public.material_orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyer and vendor can view own material orders" ON public.material_orders FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
);
CREATE POLICY "Vendor can update fulfillment status" ON public.material_orders FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));
CREATE INDEX idx_material_orders_buyer ON public.material_orders(buyer_id);
CREATE INDEX idx_material_orders_vendor ON public.material_orders(vendor_id);
CREATE INDEX idx_material_orders_status ON public.material_orders(payment_status, fulfillment_status);

CREATE TABLE public.saved_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('machine','material')),
  listing_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(buyer_id, listing_type, listing_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_listings TO authenticated;
GRANT ALL ON public.saved_listings TO service_role;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved listings" ON public.saved_listings FOR ALL
  USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);

CREATE TRIGGER trg_machine_listings_updated BEFORE UPDATE ON public.machine_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_material_listings_updated BEFORE UPDATE ON public.material_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_material_orders_updated BEFORE UPDATE ON public.material_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_machine_view(machine_uuid UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN UPDATE public.machine_listings SET view_count = view_count + 1 WHERE id = machine_uuid; END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_machine_view(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_material_view(material_uuid UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN UPDATE public.material_listings SET view_count = view_count + 1 WHERE id = material_uuid; END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_material_view(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.search_machines(
  search_query TEXT DEFAULT NULL, filter_category UUID DEFAULT NULL,
  filter_condition TEXT DEFAULT NULL, filter_zone TEXT DEFAULT NULL,
  min_price NUMERIC DEFAULT NULL, max_price NUMERIC DEFAULT NULL,
  sort_by TEXT DEFAULT 'newest'
) RETURNS SETOF public.machine_listings
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.machine_listings
  WHERE is_active = true AND is_sold = false
    AND (search_query IS NULL OR to_tsvector('english', title || ' ' || COALESCE(machine_type,'') || ' ' || COALESCE(brand,'')) @@ plainto_tsquery(search_query))
    AND (filter_category IS NULL OR category_id = filter_category)
    AND (filter_condition IS NULL OR condition = filter_condition)
    AND (filter_zone IS NULL OR zone = filter_zone)
    AND (min_price IS NULL OR asking_price >= min_price)
    AND (max_price IS NULL OR asking_price <= max_price)
  ORDER BY is_featured DESC,
    CASE WHEN sort_by = 'newest' THEN created_at END DESC NULLS LAST,
    CASE WHEN sort_by = 'price_low' THEN asking_price END ASC NULLS LAST,
    CASE WHEN sort_by = 'price_high' THEN asking_price END DESC NULLS LAST;
END; $$;
GRANT EXECUTE ON FUNCTION public.search_machines(TEXT,UUID,TEXT,TEXT,NUMERIC,NUMERIC,TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.search_materials(
  search_query TEXT DEFAULT NULL, filter_category UUID DEFAULT NULL,
  filter_zone TEXT DEFAULT NULL, in_stock_only BOOLEAN DEFAULT NULL,
  sort_by TEXT DEFAULT 'newest'
) RETURNS SETOF public.material_listings
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.material_listings
  WHERE is_active = true
    AND (search_query IS NULL OR to_tsvector('english', title || ' ' || COALESCE(material_type,'') || ' ' || COALESCE(grade_or_spec,'')) @@ plainto_tsquery(search_query))
    AND (filter_category IS NULL OR category_id = filter_category)
    AND (filter_zone IS NULL OR zone = filter_zone)
    AND (in_stock_only IS NULL OR is_in_stock = in_stock_only)
  ORDER BY is_featured DESC,
    CASE WHEN sort_by = 'newest' THEN created_at END DESC NULLS LAST,
    CASE WHEN sort_by = 'price_low' THEN price_per_unit END ASC NULLS LAST,
    CASE WHEN sort_by = 'price_high' THEN price_per_unit END DESC NULLS LAST;
END; $$;
GRANT EXECUTE ON FUNCTION public.search_materials(TEXT,UUID,TEXT,BOOLEAN,TEXT) TO anon, authenticated;
