-- ============================================================
-- IndustryResource: Multi-city schema expansion
-- Migration: 20260727120000_multicity_vendors.sql
--
-- SAFETY ANALYSIS (non-destructive):
--   1. ADD COLUMN city TEXT DEFAULT 'Belagavi'
--      → Additive. All existing rows automatically receive city='Belagavi'.
--      → No existing row is modified in a breaking way.
--   2. ALTER COLUMN zone TYPE TEXT USING zone::TEXT
--      → PostgreSQL casts enum values to their text representation.
--      → 'Udyambag'::belagavi_zone → 'Udyambag'::TEXT  (identical string)
--      → No data loss. No row values change.
--   3. DROP TYPE belagavi_zone
--      → Only safe after the column no longer references it (step 2).
--      → No other table uses this enum (verified by audit).
-- ============================================================

-- Step 1: Add city column (additive, default preserves all existing records)
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'Belagavi';

-- Step 2: Change zone from belagavi_zone ENUM → TEXT (cast preserves all values)
ALTER TABLE public.vendors
  ALTER COLUMN zone TYPE TEXT USING zone::TEXT;

-- Step 3: Drop the now-unused enum (safe — no other column references it)
DROP TYPE IF EXISTS public.belagavi_zone;

-- Step 4: Add index for city-based filtering
CREATE INDEX IF NOT EXISTS idx_vendors_city ON public.vendors(city);

-- Step 5: Recreate zone index (now on TEXT column — same behavior)
DROP INDEX IF EXISTS idx_vendors_zone;
CREATE INDEX idx_vendors_zone ON public.vendors(zone);
