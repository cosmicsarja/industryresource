-- =============================================================================
-- MIGRATION: Features — Requirement Matching + Reviews + Machine Specs
-- Run in Supabase SQL Editor
-- =============================================================================

-- ─── PART 1: Requirement Auto-Matching ───────────────────────────────────────

-- 1a. Add city field to requirements (matches vendors.city)
ALTER TABLE public.requirements
  ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'Belagavi';

-- 1b. requirement_matches — tracks which vendors were matched/notified
CREATE TABLE IF NOT EXISTS public.requirement_matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id  UUID NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
  vendor_id       UUID NOT NULL REFERENCES public.vendors(id)      ON DELETE CASCADE,
  match_score     INT  NOT NULL DEFAULT 0,   -- higher = better match
  seen_at         TIMESTAMPTZ,               -- NULL = unseen by vendor
  notified_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requirement_id, vendor_id)
);

GRANT SELECT ON public.requirement_matches TO authenticated;
GRANT ALL    ON public.requirement_matches TO service_role;
ALTER TABLE public.requirement_matches ENABLE ROW LEVEL SECURITY;

-- Vendors see their own matches; buyers see matches for their requirements
CREATE POLICY "Vendor sees own matches"
  ON public.requirement_matches FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

CREATE POLICY "Buyer sees matches for own requirement"
  ON public.requirement_matches FOR SELECT
  USING (auth.uid() IN (
    SELECT customer_id FROM public.requirements WHERE id = requirement_id
  ));

CREATE POLICY "Vendor marks match seen"
  ON public.requirement_matches FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

CREATE INDEX IF NOT EXISTS idx_req_matches_vendor  ON public.requirement_matches(vendor_id, notified_at DESC);
CREATE INDEX IF NOT EXISTS idx_req_matches_req     ON public.requirement_matches(requirement_id);
CREATE INDEX IF NOT EXISTS idx_req_matches_unseen  ON public.requirement_matches(vendor_id) WHERE seen_at IS NULL;

-- 1c. DB trigger — runs after INSERT on requirements, matches top-10 vendors
CREATE OR REPLACE FUNCTION public.match_vendors_on_requirement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Only run for open requirements with a category
  IF NEW.category_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.requirement_matches (requirement_id, vendor_id, match_score)
  SELECT
    NEW.id,
    v.id,
    -- Scoring: zone bonus +2, verified +1, rating bonus 0-5
    (CASE WHEN v.zone = NEW.zone_preference AND NEW.zone_preference IS NOT NULL THEN 2 ELSE 0 END
     + CASE WHEN v.is_verified THEN 1 ELSE 0 END
     + LEAST(ROUND(v.rating_avg)::INT, 5)
    ) AS match_score
  FROM public.vendors v
  WHERE v.category_id = NEW.category_id
    AND v.city = NEW.city
    AND v.is_active = true
    AND v.user_id <> NEW.customer_id  -- don't match the buyer's own vendor profile
  ORDER BY match_score DESC, v.rating_avg DESC, v.is_featured DESC
  LIMIT 10
  ON CONFLICT (requirement_id, vendor_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_match_vendors ON public.requirements;
CREATE TRIGGER trg_match_vendors
  AFTER INSERT ON public.requirements
  FOR EACH ROW EXECUTE FUNCTION public.match_vendors_on_requirement();

-- ─── PART 2: Reviews — per-transaction support ───────────────────────────────

-- 2a. Add requirement_id FK to reviews (links review to a real transaction)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS requirement_id UUID REFERENCES public.requirements(id) ON DELETE SET NULL;

-- 2b. Add order_id for material orders (second transaction path)
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS material_order_id UUID REFERENCES public.material_orders(id) ON DELETE SET NULL;

-- 2c. Relax UNIQUE from per-(vendor, customer) to per-(vendor, customer, requirement)
--     This allows one review per transaction rather than one-ever
--     Drop old constraint, add new per-transaction one
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_vendor_id_customer_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_per_transaction
  ON public.reviews(vendor_id, customer_id, COALESCE(requirement_id::TEXT, material_order_id::TEXT, 'direct'));

-- 2d. Add index for fast lookup by requirement
CREATE INDEX IF NOT EXISTS idx_reviews_requirement ON public.reviews(requirement_id) WHERE requirement_id IS NOT NULL;

-- ─── PART 3: Machine Specs — update search function ──────────────────────────

-- 3a. Extend search_machines() to filter on specifications JSONB
CREATE OR REPLACE FUNCTION public.search_machines(
  search_query    TEXT    DEFAULT NULL,
  filter_category UUID    DEFAULT NULL,
  filter_condition TEXT   DEFAULT NULL,
  filter_zone     TEXT    DEFAULT NULL,
  min_price       NUMERIC DEFAULT NULL,
  max_price       NUMERIC DEFAULT NULL,
  sort_by         TEXT    DEFAULT 'newest',
  -- New spec filters (JSONB key-value filters)
  spec_min_capacity   NUMERIC DEFAULT NULL,   -- e.g. tonnage or capacity (numeric)
  spec_machine_type   TEXT    DEFAULT NULL,   -- exact machine_type match
  spec_material       TEXT    DEFAULT NULL    -- material compatibility contains
) RETURNS SETOF public.machine_listings
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.machine_listings
  WHERE is_active = true AND is_sold = false
    AND (search_query IS NULL OR
         to_tsvector('english',
           title || ' ' ||
           COALESCE(machine_type,'') || ' ' ||
           COALESCE(brand,'') || ' ' ||
           COALESCE(description,'')
         ) @@ plainto_tsquery(search_query))
    AND (filter_category  IS NULL OR category_id = filter_category)
    AND (filter_condition IS NULL OR condition    = filter_condition)
    AND (filter_zone      IS NULL OR zone         = filter_zone)
    AND (min_price IS NULL OR asking_price >= min_price)
    AND (max_price IS NULL OR asking_price <= max_price)
    -- Spec filters: read structured values from JSONB
    AND (spec_machine_type IS NULL OR
         machine_type ILIKE ('%' || spec_machine_type || '%'))
    AND (spec_min_capacity IS NULL OR
         (specifications->>'capacity_tons')::NUMERIC >= spec_min_capacity OR
         (specifications->>'capacity_kg')::NUMERIC   >= spec_min_capacity * 1000 OR
         (specifications->>'tonnage')::NUMERIC        >= spec_min_capacity)
    AND (spec_material IS NULL OR
         specifications->>'material_compatibility' ILIKE ('%' || spec_material || '%'))
  ORDER BY is_featured DESC,
    CASE WHEN sort_by = 'newest'     THEN created_at    END DESC NULLS LAST,
    CASE WHEN sort_by = 'price_low'  THEN asking_price  END ASC  NULLS LAST,
    CASE WHEN sort_by = 'price_high' THEN asking_price  END DESC NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_machines(TEXT,UUID,TEXT,TEXT,NUMERIC,NUMERIC,TEXT,NUMERIC,TEXT,TEXT)
  TO anon, authenticated;

-- ─── Indexes for spec JSONB queries ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_machine_specs ON public.machine_listings
  USING gin(specifications jsonb_path_ops);

RAISE NOTICE '✅ Features migration complete — matching, reviews, machine specs';
