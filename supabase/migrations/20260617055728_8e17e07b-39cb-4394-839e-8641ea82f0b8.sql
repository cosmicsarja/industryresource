
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE public.belagavi_zone AS ENUM ('Udyambag','Auto Nagar','Machhe KIADB','Gokul Road','Khanapur Road','Bogarves','Shahapur','Other');
CREATE TYPE public.subscription_plan_t AS ENUM ('free','standard','premium','gold');
CREATE TYPE public.requirement_status AS ENUM ('open','in_progress','closed','fulfilled');
CREATE TYPE public.enquiry_channel AS ENUM ('whatsapp','call','form','email');
CREATE TYPE public.enquiry_status AS ENUM ('new','read','responded','closed');
CREATE TYPE public.payment_status AS ENUM ('pending','success','failed','refunded');
CREATE TYPE public.analytics_event_t AS ENUM ('profile_view','whatsapp_click','call_click','enquiry','quote_sent','saved');
CREATE TYPE public.ad_placement AS ENUM ('homepage_top','homepage_sidebar','search_results','category_page','vendor_page');

-- ============ UTILITY ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  whatsapp_number TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','kn')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES (separate to prevent privilege escalation) ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + default customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper to promote a user to admin (call from SQL editor: SELECT public.promote_to_admin('you@x.com');)
CREATE OR REPLACE FUNCTION public.promote_to_admin(_email TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid UUID;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = _email;
  IF _uid IS NULL THEN RETURN 'User not found'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin') ON CONFLICT DO NOTHING;
  RETURN 'Promoted ' || _email || ' to admin';
END; $$;

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_kn TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.categories (name, name_kn, slug, icon, sort_order) VALUES
('CNC Machining','ಸಿಎನ್‌ಸಿ ಯಂತ್ರ','cnc-machining','settings',1),
('Lathe Works','ಲೇಥ್ ಕೆಲಸ','lathe-works','rotate-cw',2),
('Welding & Fabrication','ವೆಲ್ಡಿಂಗ್ ಮತ್ತು ಫ್ಯಾಬ್ರಿಕೇಶನ್','welding-fabrication','zap',3),
('Hydraulic Repair','ಹೈಡ್ರಾಲಿಕ್ ರಿಪೇರಿ','hydraulic-repair','wrench',4),
('Powder Coating','ಪೌಡರ್ ಕೋಟಿಂಗ್','powder-coating','layers',5),
('Gear Cutting','ಗಿಯರ್ ಕಟ್ಟಿಂಗ್','gear-cutting','cog',6),
('Motor Rewinding','ಮೋಟರ್ ರಿವೈಂಡಿಂಗ್','motor-rewinding','wind',7),
('Sheet Metal','ಶೀಟ್ ಮೆಟಲ್','sheet-metal','square',8),
('Tool Room','ಟೂಲ್ ರೂಮ್','tool-room','wrench',9),
('Foundry & Casting','ಫೌಂಡ್ರಿ','foundry-casting','flame',10),
('Auto Components','ಆಟೋ ಕಾಂಪೊನೆಂಟ್','auto-components','truck',11),
('Steel Cutting','ಸ್ಟೀಲ್ ಕಟ್ಟಿಂಗ್','steel-cutting','scissors',12),
('Drilling & Milling','ಡ್ರಿಲ್ಲಿಂಗ್','drilling-milling','circle',13),
('Bore Well Services','ಬೋರ್‌ವೆಲ್','bore-well','arrow-down',14),
('Electrical & Wiring','ಎಲೆಕ್ಟ್ರಿಕಲ್','electrical-wiring','zap',15),
('Spare Parts Supply','ಸ್ಪೇರ್ ಪಾರ್ಟ್ಸ್','spare-parts','package',16),
('Agricultural Equipment','ಕೃಷಿ ಯಂತ್ರ','agricultural-equipment','tractor',17),
('Pressure Vessel & Tanks','ಪ್ರೆಶರ್ ವೆಸೆಲ್','pressure-vessels','container',18),
('3D Printing / Prototyping','3ಡಿ ಪ್ರಿಂಟಿಂಗ್','3d-printing','printer',19),
('Custom Machine Making','ಕಸ್ಟಮ್ ಮೆಶಿನ್','custom-machines','cpu',20);

-- ============ VENDORS ============
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_kn TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  zone belagavi_zone DEFAULT 'Other',
  full_address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  working_hours JSONB,
  machine_list JSONB DEFAULT '[]'::jsonb,
  certifications TEXT[] DEFAULT '{}',
  established_year INT,
  employee_count TEXT,
  subscription_plan subscription_plan_t NOT NULL DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  profile_views INT NOT NULL DEFAULT 0,
  whatsapp_clicks INT NOT NULL DEFAULT 0,
  enquiry_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active vendors public read" ON public.vendors FOR SELECT USING (is_active = true OR auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner inserts own vendor" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner updates own vendor" ON public.vendors FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner deletes own vendor" ON public.vendors FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_vendors_zone ON public.vendors(zone);
CREATE INDEX idx_vendors_category ON public.vendors(category_id);
CREATE INDEX idx_vendors_plan ON public.vendors(subscription_plan);
CREATE INDEX idx_vendors_rating ON public.vendors(rating_avg DESC);
CREATE INDEX idx_vendors_verified ON public.vendors(is_verified);
CREATE INDEX idx_vendors_slug ON public.vendors(slug);

-- ============ VENDOR PHOTOS ============
CREATE TABLE public.vendor_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendor_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vendor_photos TO authenticated;
GRANT ALL ON public.vendor_photos TO service_role;
ALTER TABLE public.vendor_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photos public read" ON public.vendor_photos FOR SELECT USING (true);
CREATE POLICY "Vendor owner manages photos" ON public.vendor_photos FOR ALL
USING (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id))
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id));

-- ============ REQUIREMENTS ============
CREATE TABLE public.requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  zone_preference TEXT,
  budget_range TEXT,
  quantity TEXT,
  material TEXT,
  deadline DATE,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  status requirement_status NOT NULL DEFAULT 'open',
  quote_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);
GRANT SELECT ON public.requirements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.requirements TO authenticated;
GRANT ALL ON public.requirements TO service_role;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Open requirements public read" ON public.requirements FOR SELECT USING (status = 'open' OR auth.uid() = customer_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Customers create requirements" ON public.requirements FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers update own requirements" ON public.requirements FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Customers delete own requirements" ON public.requirements FOR DELETE USING (auth.uid() = customer_id);

CREATE INDEX idx_requirements_status ON public.requirements(status);
CREATE INDEX idx_requirements_category ON public.requirements(category_id);

-- ============ QUOTES ============
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  price_estimate TEXT,
  delivery_estimate TEXT,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requirement_id, vendor_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quotes read by vendor or requirement owner" ON public.quotes FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
  OR auth.uid() IN (SELECT customer_id FROM public.requirements WHERE id = requirement_id)
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "Vendors submit quotes" ON public.quotes FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
);
CREATE POLICY "Customers update accept on quote" ON public.quotes FOR UPDATE USING (
  auth.uid() IN (SELECT customer_id FROM public.requirements WHERE id = requirement_id)
);

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  job_type TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  vendor_reply TEXT,
  vendor_replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, customer_id)
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers write reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customer edits own review or vendor replies" ON public.reviews FOR UPDATE USING (
  auth.uid() = customer_id
  OR auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "Customer deletes own review" ON public.reviews FOR DELETE USING (auth.uid() = customer_id OR public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_reviews_vendor ON public.reviews(vendor_id);

-- Recalc vendor rating
CREATE OR REPLACE FUNCTION public.recalc_vendor_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _vid UUID;
BEGIN
  _vid := COALESCE(NEW.vendor_id, OLD.vendor_id);
  UPDATE public.vendors v SET
    rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE vendor_id = _vid), 0),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE vendor_id = _vid)
  WHERE v.id = _vid;
  RETURN NULL;
END; $$;
CREATE TRIGGER reviews_recalc AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.recalc_vendor_rating();

-- ============ SAVED VENDORS ============
CREATE TABLE public.saved_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, vendor_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_vendors TO authenticated;
GRANT ALL ON public.saved_vendors TO service_role;
ALTER TABLE public.saved_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON public.saved_vendors FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- ============ ENQUIRIES ============
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT,
  phone TEXT,
  message TEXT,
  channel enquiry_channel NOT NULL DEFAULT 'form',
  status enquiry_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon, authenticated;
GRANT SELECT, UPDATE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit enquiry" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendor reads own enquiries" ON public.enquiries FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
  OR auth.uid() = customer_id
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "Vendor updates own enquiry status" ON public.enquiries FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
);

-- ============ SUBSCRIPTION PLANS ============
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  price_per_year INT NOT NULL,
  features JSONB,
  max_photos INT NOT NULL DEFAULT 5,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  badge_color TEXT
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans public read" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admins manage plans" ON public.subscription_plans FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.subscription_plans (name, price_per_year, max_photos, features, badge_color) VALUES
('free', 0, 3, '{"listing":true,"photos":3,"whatsapp_button":true,"analytics":false,"priority":false}', 'gray'),
('standard', 1500, 10, '{"listing":true,"photos":10,"whatsapp_button":true,"analytics":true,"priority":false,"enhanced_profile":true}', 'blue'),
('premium', 4000, 25, '{"listing":true,"photos":25,"whatsapp_button":true,"analytics":true,"priority":true,"homepage_feature":true,"verified_badge":true}', 'gold'),
('gold', 8000, 50, '{"listing":true,"photos":50,"whatsapp_button":true,"analytics":true,"priority_leads":true,"verified_badge":true,"dedicated_support":true}', 'purple');

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  plan_name TEXT,
  amount INT,
  currency TEXT NOT NULL DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendor reads own payments" ON public.payments FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "Vendor inserts own payment" ON public.payments FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
);

-- ============ ANALYTICS ============
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  event_type analytics_event_t NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendor reads own analytics" ON public.analytics_events FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
  OR public.has_role(auth.uid(),'admin')
);
CREATE INDEX idx_analytics_vendor_date ON public.analytics_events(vendor_id, created_at DESC);

-- ============ BANNER ADS ============
CREATE TABLE public.banner_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  placement ad_placement NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  click_count INT NOT NULL DEFAULT 0,
  impression_count INT NOT NULL DEFAULT 0,
  price_per_month INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banner_ads TO anon, authenticated;
GRANT ALL ON public.banner_ads TO service_role;
ALTER TABLE public.banner_ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active ads public read" ON public.banner_ads FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage ads" ON public.banner_ads FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ ADMIN LOGS ============
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT,
  target_type TEXT,
  target_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_logs TO authenticated;
GRANT ALL ON public.admin_logs TO service_role;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read logs" ON public.admin_logs FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins write logs" ON public.admin_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(),'admin'));
