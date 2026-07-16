-- =============================================================================
-- MIGRATION: machine_orders table + buy-now flow
-- Paste in Supabase SQL Editor → Run
-- =============================================================================

-- ─── 1. machine_orders ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.machine_orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id            UUID NOT NULL REFERENCES public.machine_listings(id) ON DELETE RESTRICT,
  vendor_id             UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  buyer_id              UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Buyer details (captured at checkout time)
  buyer_name            TEXT NOT NULL,
  buyer_phone           TEXT NOT NULL,
  buyer_email           TEXT,
  delivery_address      TEXT,

  -- Pricing snapshot
  quantity              INT  NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price            NUMERIC(14,2) NOT NULL,
  total_amount          NUMERIC(14,2) NOT NULL,
  platform_commission   NUMERIC(14,2),

  -- Razorpay
  razorpay_order_id     TEXT,
  razorpay_payment_id   TEXT,

  -- Status
  payment_status        TEXT NOT NULL DEFAULT 'pending'
                          CHECK (payment_status IN ('pending','paid','failed','refunded')),
  fulfillment_status    TEXT NOT NULL DEFAULT 'pending'
                          CHECK (fulfillment_status IN ('pending','confirmed','dispatched','delivered','cancelled')),

  -- Notes
  notes                 TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.machine_orders TO authenticated;
GRANT ALL ON public.machine_orders TO service_role;
ALTER TABLE public.machine_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Buyers can see their own orders
CREATE POLICY "Buyer sees own machine orders"
  ON public.machine_orders FOR SELECT
  USING (buyer_id = auth.uid());

-- Vendors can see orders for their machines
CREATE POLICY "Vendor sees machine orders for their listings"
  ON public.machine_orders FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

-- Buyers can create orders
CREATE POLICY "Buyer creates machine order"
  ON public.machine_orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid() OR buyer_id IS NULL);

-- Buyers can update payment status (e.g. after razorpay callback)
CREATE POLICY "Buyer updates own machine order payment"
  ON public.machine_orders FOR UPDATE
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- Vendors can update fulfillment status
CREATE POLICY "Vendor updates machine order fulfillment"
  ON public.machine_orders FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

-- Trigger for updated_at
CREATE TRIGGER machine_orders_updated_at
  BEFORE UPDATE ON public.machine_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_machine_orders_machine   ON public.machine_orders(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_orders_vendor    ON public.machine_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_machine_orders_buyer     ON public.machine_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_machine_orders_payment   ON public.machine_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_machine_orders_fulfill   ON public.machine_orders(fulfillment_status);

-- ─── 2. Mark machine as sold helper (optional) ───────────────────────────────
-- When a machine_order is delivered, optionally mark machine as sold
-- This is handled in application logic, but we add a function for convenience:
CREATE OR REPLACE FUNCTION public.mark_machine_sold_on_delivery()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.fulfillment_status = 'delivered' AND OLD.fulfillment_status != 'delivered' THEN
    UPDATE public.machine_listings
      SET is_sold = true, is_active = false
      WHERE id = NEW.machine_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_mark_machine_sold
  AFTER UPDATE ON public.machine_orders
  FOR EACH ROW EXECUTE FUNCTION public.mark_machine_sold_on_delivery();

RAISE NOTICE '✅ machine_orders migration complete!';
