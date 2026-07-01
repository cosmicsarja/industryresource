-- =============================================================================
-- MIGRATION: OLX + IndiaMart Features
-- Adds: vendor_catalog_items, classified_listings
--       and extra business fields on vendors
-- Paste in Supabase SQL Editor → Run
-- =============================================================================

-- ─── 1. Extend vendors table with IndiaMart-style fields ─────────────────────
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS business_type        TEXT DEFAULT 'service_provider'
                                                  CHECK (business_type IN ('manufacturer','trader','service_provider','all')),
  ADD COLUMN IF NOT EXISTS gst_number           TEXT,
  ADD COLUMN IF NOT EXISTS annual_turnover      TEXT,
  ADD COLUMN IF NOT EXISTS production_capacity  TEXT,
  ADD COLUMN IF NOT EXISTS payment_terms        TEXT[],
  ADD COLUMN IF NOT EXISTS quality_standards    TEXT[],
  ADD COLUMN IF NOT EXISTS response_time_hrs    INT  DEFAULT 24,
  ADD COLUMN IF NOT EXISTS response_rate_pct    INT  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_enquiries_handled INT DEFAULT 0;

-- ─── 2. Catalog Items (IndiaMart product/service catalog) ────────────────────
CREATE TABLE IF NOT EXISTS public.vendor_catalog_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id     UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,                       -- e.g. "CNC Turning", "Welding"
  price_type    TEXT NOT NULL DEFAULT 'contact'
                  CHECK (price_type IN ('fixed','range','per_unit','contact')),
  price         NUMERIC(12,2),              -- fixed price or range-start
  price_max     NUMERIC(12,2),              -- range-end (for 'range' type)
  price_unit    TEXT DEFAULT 'piece',       -- piece / hr / kg / lot / etc.
  min_order     TEXT,                       -- "10 pieces", "1 lot"
  lead_time     TEXT,                       -- "2-3 days", "Same day"
  photo_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vendor_catalog_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vendor_catalog_items TO authenticated;
GRANT ALL ON public.vendor_catalog_items TO service_role;
ALTER TABLE public.vendor_catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog items public read"
  ON public.vendor_catalog_items FOR SELECT USING (is_active = true OR
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

CREATE POLICY "Vendor manages own catalog"
  ON public.vendor_catalog_items FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

CREATE TRIGGER vendor_catalog_updated_at
  BEFORE UPDATE ON public.vendor_catalog_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_catalog_vendor ON public.vendor_catalog_items(vendor_id);

-- ─── 3. Classified Listings (OLX-style) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classified_listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id     UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  listing_type  TEXT NOT NULL DEFAULT 'job_work'
                  CHECK (listing_type IN ('job_work','for_sale','wanted','announcement')),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  category_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  zone          TEXT,
  price_type    TEXT NOT NULL DEFAULT 'contact'
                  CHECK (price_type IN ('fixed','negotiable','free','contact')),
  price         NUMERIC(12,2),
  price_unit    TEXT,                       -- "per piece", "per hr", "per kg"
  photo_urls    TEXT[]  DEFAULT '{}',       -- up to 5 photos
  contact_phone TEXT,
  contact_name  TEXT,
  tags          TEXT[]  DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  is_urgent     BOOLEAN NOT NULL DEFAULT false,
  view_count    INT     NOT NULL DEFAULT 0,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.classified_listings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.classified_listings TO authenticated;
GRANT ALL ON public.classified_listings TO service_role;
ALTER TABLE public.classified_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active classified listings public read"
  ON public.classified_listings FOR SELECT
  USING (
    (is_active = true AND expires_at > now())
    OR auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Vendor inserts own listing"
  ON public.classified_listings FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

CREATE POLICY "Vendor updates own listing"
  ON public.classified_listings FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

CREATE POLICY "Vendor deletes own listing"
  ON public.classified_listings FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

CREATE TRIGGER classified_listings_updated_at
  BEFORE UPDATE ON public.classified_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_classified_vendor   ON public.classified_listings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_classified_type     ON public.classified_listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_classified_zone     ON public.classified_listings(zone);
CREATE INDEX IF NOT EXISTS idx_classified_expires  ON public.classified_listings(expires_at);
CREATE INDEX IF NOT EXISTS idx_classified_category ON public.classified_listings(category_id);

-- ─── 4. Storage bucket for catalog + classified photos ───────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vendor-catalog', 'vendor-catalog', true, 5242880,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('classified-photos', 'classified-photos', true, 5242880,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read catalog photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-catalog');

CREATE POLICY "Authenticated upload catalog photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vendor-catalog' AND auth.role() = 'authenticated');

CREATE POLICY "Public read classified photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'classified-photos');

CREATE POLICY "Authenticated upload classified photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'classified-photos' AND auth.role() = 'authenticated');

RAISE NOTICE '✅ OLX + IndiaMart migration complete!';
