-- =============================================================================
-- CREATE ALL 25 VENDOR USERS  (Password: 123456 for every account)
-- Paste this ENTIRE script in Supabase → SQL Editor → Run
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  uid  UUID;
  pw   TEXT := crypt('123456', gen_salt('bf'));

  cnc_cat       UUID;
  lathe_cat     UUID;
  welding_cat   UUID;
  laser_cat     UUID;
  spare_cat     UUID;
  tool_cat      UUID;
  hydraulic_cat UUID;
  motor_cat     UUID;

BEGIN
  SELECT id INTO cnc_cat       FROM public.categories WHERE slug = 'cnc-machining';
  SELECT id INTO lathe_cat     FROM public.categories WHERE slug = 'lathe-works';
  SELECT id INTO welding_cat   FROM public.categories WHERE slug = 'welding-fabrication';
  SELECT id INTO laser_cat     FROM public.categories WHERE slug = 'steel-cutting';
  SELECT id INTO spare_cat     FROM public.categories WHERE slug = 'spare-parts';
  SELECT id INTO tool_cat      FROM public.categories WHERE slug = 'tool-room';
  SELECT id INTO hydraulic_cat FROM public.categories WHERE slug = 'hydraulic-repair';
  SELECT id INTO motor_cat     FROM public.categories WHERE slug = 'motor-rewinding';

  -- ═══════════════════════════════════════════════════════════════
  -- HELPER PATTERN (repeated for each vendor):
  --   1. Insert into auth.users only if email does not exist
  --   2. Fetch the user id
  --   3. Upsert profile
  --   4. Assign vendor role
  --   5. Upsert vendor record
  -- ═══════════════════════════════════════════════════════════════

  -- ─────────────────────────────────────────────────────────────
  -- 1) Vaibhav Engineering
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vaibhavengineering1@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'vaibhavengineering1@gmail.com',pw,now(),
      '{"full_name":"Vaibhav Engineering","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'vaibhavengineering1@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Vaibhav Engineering','vaibhavengineering1@gmail.com','7022887464','7022887464')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Vaibhav Engineering','vaibhav-engineering',
    'Trillers Parts Manufacturers and all CNC VMC Work. Specializing in high-precision CNC machining and VMC operations for industrial components in Belagavi.',
    cnc_cat,'Udyambag','7022887464','7022887464','vaibhavengineering1@gmail.com','20+',
    '[{"name":"CNC Lathe"},{"name":"VMC Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 1/25 Vaibhav Engineering';

  -- ─────────────────────────────────────────────────────────────
  -- 2) Mangale Lasertech
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mangallasertech@outlook.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'mangallasertech@outlook.com',pw,now(),
      '{"full_name":"Mangale Lasertech","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'mangallasertech@outlook.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Mangale Lasertech','mangallasertech@outlook.com','9663356177','9663356177')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Mangale Lasertech','mangale-lasertech',
    'Laser Cut, CNC, Punching Work. Providing precision laser cutting, CNC machining, and sheet metal punching services for industrial applications.',
    laser_cat,'Machhe KIADB','9663356177','9663356177','mangallasertech@outlook.com','8+',
    '[{"name":"Laser Cutting Machine"},{"name":"CNC Machine"},{"name":"Punching Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 2/25 Mangale Lasertech';

  -- ─────────────────────────────────────────────────────────────
  -- 3) Infinity Industries
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'infinityindustries.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'infinityindustries.bgm@gmail.com',pw,now(),
      '{"full_name":"Infinity Industries","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'infinityindustries.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Infinity Industries','infinityindustries.bgm@gmail.com','8861123300','8861123300')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Infinity Industries','infinity-industries',
    'Lathe Work, Milling Work, CNC Turning Work. Offering comprehensive machining services including lathe, milling and CNC turning for various industrial components.',
    cnc_cat,'Auto Nagar','8861123300','8861123300','infinityindustries.bgm@gmail.com','15+',
    '[{"name":"CNC Turning Machine"},{"name":"Lathe Machine"},{"name":"Milling Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 3/25 Infinity Industries';

  -- ─────────────────────────────────────────────────────────────
  -- 4) Rajan Engineering
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'nsrindustries4@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'nsrindustries4@gmail.com',pw,now(),
      '{"full_name":"Rajan Engineering","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'nsrindustries4@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Rajan Engineering','nsrindustries4@gmail.com','8553756166','8553756166')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Rajan Engineering','rajan-engineering',
    'CNC Turning and Radial Drilling Work, Crankshaft Drilling Work. Specializing in precision CNC turning and drilling services including complex crankshaft drilling.',
    cnc_cat,'Udyambag','8553756166','8553756166','nsrindustries4@gmail.com','4+',
    '[{"name":"CNC Turning Machine"},{"name":"Radial Drilling Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 4/25 Rajan Engineering';

  -- ─────────────────────────────────────────────────────────────
  -- 5) Shree Ragevendra Pattern Work
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shreerage.patternwork@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'shreerage.patternwork@gmail.com',pw,now(),
      '{"full_name":"Shree Ragevendra Pattern Work","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'shreerage.patternwork@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Shree Ragevendra Pattern Work','shreerage.patternwork@gmail.com','9060692922','9060692922')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Shree Ragevendra Pattern Work','shree-ragevendra-pattern-work',
    'Pattern Work, CI, Aluminium, Dies work Job Work, VMC Machine. Expert in pattern making and foundry-related job work using CI, aluminium, and die materials.',
    cnc_cat,'Bogarves','9060692922','9060692922','shreerage.patternwork@gmail.com','5+',
    '[{"name":"VMC Machine"},{"name":"Pattern Making Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 5/25 Shree Ragevendra Pattern Work';

  -- ─────────────────────────────────────────────────────────────
  -- 6) Raytech Engineering
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'raytechengineering0810@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'raytechengineering0810@gmail.com',pw,now(),
      '{"full_name":"Raytech Engineering","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'raytechengineering0810@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Raytech Engineering','raytechengineering0810@gmail.com','7204091658','7204091658')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Raytech Engineering','raytech-engineering',
    'Tooling, Precision Work in all types of Material — MS, CI, Aluminium, Copper, Acrylic Sheet etc. Delivering high-precision tooling and machining solutions across diverse materials.',
    tool_cat,'Machhe KIADB','7204091658','7204091658','raytechengineering0810@gmail.com','4+',
    '[{"name":"CNC Machine"},{"name":"Precision Tooling Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 6/25 Raytech Engineering';

  -- ─────────────────────────────────────────────────────────────
  -- 7) Mangai Engg
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mangaiengg.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'mangaiengg.bgm@gmail.com',pw,now(),
      '{"full_name":"Mangai Engg","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'mangaiengg.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Mangai Engg','mangaiengg.bgm@gmail.com','8792491226','8792491226')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Mangai Engg','mangai-engg',
    'Turning Work. Specialized turning and CNC machining services for industrial components. Contact: Lakahan Sir — 8792491226.',
    lathe_cat,'Auto Nagar','8792491226','8792491226','mangaiengg.bgm@gmail.com','4+',
    '[{"name":"Turning Machine"},{"name":"CNC Lathe"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 7/25 Mangai Engg';

  -- ─────────────────────────────────────────────────────────────
  -- 8) Yatrik Hydraulics
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'yatrikhydraulics.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'yatrikhydraulics.bgm@gmail.com',pw,now(),
      '{"full_name":"Yatrik Hydraulics","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'yatrikhydraulics.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Yatrik Hydraulics','yatrikhydraulics.bgm@gmail.com','9986002200','9986002200')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Yatrik Hydraulics','yatrik-hydraulics',
    'Hydraulic Fittings Manufacturer. Manufacturing and supplying high-quality hydraulic fittings for industrial and engineering applications.',
    hydraulic_cat,'Udyambag','9986002200','9986002200','yatrikhydraulics.bgm@gmail.com','3+',
    '[{"name":"Hydraulic Fitting Manufacturing Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 8/25 Yatrik Hydraulics';

  -- ─────────────────────────────────────────────────────────────
  -- 9) Navsankalp Industries
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'navsankalp.industries@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'navsankalp.industries@gmail.com',pw,now(),
      '{"full_name":"Navsankalp Industries","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'navsankalp.industries@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Navsankalp Industries','navsankalp.industries@gmail.com','9731363853','9731791499')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Navsankalp Industries','navsankalp-industries',
    'Turning, Milling, Grinding, Drilling. Comprehensive machining services covering turning, milling, grinding and drilling operations for industrial requirements.',
    cnc_cat,'Gokul Road','9731363853','9731791499','navsankalp.industries@gmail.com','8+',
    '[{"name":"Turning Machine"},{"name":"Milling Machine"},{"name":"Grinding Machine"},{"name":"Drilling Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 9/25 Navsankalp Industries';

  -- ─────────────────────────────────────────────────────────────
  -- 10) Nova Engineering Solutions
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'nova.engg.solutions@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'nova.engg.solutions@gmail.com',pw,now(),
      '{"full_name":"Nova Engineering Solutions","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'nova.engg.solutions@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Nova Engineering Solutions','nova.engg.solutions@gmail.com','9738319787','9738319787')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Nova Engineering Solutions','nova-engineering-solutions',
    'Conventional machining services: Milling, Squaring, Facing, and Slotting operations for precision engineering requirements.',
    lathe_cat,'Auto Nagar','9738319787','9738319787','nova.engg.solutions@gmail.com','4',
    '[{"name":"Milling Machine"},{"name":"Slotting Machine"},{"name":"Lathe Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 10/25 Nova Engineering Solutions';

  -- ─────────────────────────────────────────────────────────────
  -- 11) Shree Jagadamba Enterprises
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'prasadambewadikar@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'prasadambewadikar@gmail.com',pw,now(),
      '{"full_name":"Shree Jagadamba Enterprises","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'prasadambewadikar@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Shree Jagadamba Enterprises','prasadambewadikar@gmail.com','9738450125','9738450125')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Shree Jagadamba Enterprises','shree-jagadamba-enterprises',
    E'Trusted engineering workshop specializing in Conventional Lathe Work and Drilling Work.\n\nLathe: Turning, Facing, Threading, Shaft Machining, Bush & Sleeve Machining, Bore & Step Turning.\nDrilling: Hole Drilling, Tapping Work, Reaming Work, Multi-size Drilling.',
    lathe_cat,'Udyambag','9738450125','9738450125','prasadambewadikar@gmail.com','5',
    '[{"name":"Conventional Lathe"},{"name":"Drilling Machine"},{"name":"Tapping Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 11/25 Shree Jagadamba Enterprises';

  -- ─────────────────────────────────────────────────────────────
  -- 12) Jaishree Engineering Work  (no phone on file → placeholder)
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jaishreeengineering.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'jaishreeengineering.bgm@gmail.com',pw,now(),
      '{"full_name":"Jaishree Engineering Work","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'jaishreeengineering.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Jaishree Engineering Work','jaishreeengineering.bgm@gmail.com','9900000012','9900000012')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Jaishree Engineering Work','jaishree-engineering-work',
    'Hydraulic Work and Radial Drilling Work. Providing specialized hydraulic servicing and precision radial drilling for various engineering applications.',
    hydraulic_cat,'Machhe KIADB','9900000012','9900000012','jaishreeengineering.bgm@gmail.com','2',
    '[{"name":"Radial Drilling Machine"},{"name":"Hydraulic Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 12/25 Jaishree Engineering Work';

  -- ─────────────────────────────────────────────────────────────
  -- 13) DVS Aaryan Tools  (no phone on file → placeholder)
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dvsaaryantools.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'dvsaaryantools.bgm@gmail.com',pw,now(),
      '{"full_name":"DVS Aaryan Tools","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'dvsaaryantools.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'DVS Aaryan Tools','dvsaaryantools.bgm@gmail.com','9900000013','9900000013')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'DVS Aaryan Tools','dvs-aaryan-tools',
    'Tool and Cutter Drill, Tap and Mill Resharpening and all types of Gauges Manufacturing. Precision tool reconditioning and gauge manufacturing services.',
    tool_cat,'Auto Nagar','9900000013','9900000013','dvsaaryantools.bgm@gmail.com','2',
    '[{"name":"Tool Grinding Machine"},{"name":"Gauge Manufacturing Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 13/25 DVS Aaryan Tools';

  -- ─────────────────────────────────────────────────────────────
  -- 14) Mech-Line Industries  (Contact: Sunil Sir — phone not available)
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mechlineindustries.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'mechlineindustries.bgm@gmail.com',pw,now(),
      '{"full_name":"Mech-Line Industries","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'mechlineindustries.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Mech-Line Industries','mechlineindustries.bgm@gmail.com','9900000014','9900000014')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Mech-Line Industries','mech-line-industries',
    'Milling Operation Work like Slotting, Keyway, Squaring Etc. Precision milling services for industrial components including slotting and keyway cutting. Contact: Sunil Sir.',
    lathe_cat,'Gokul Road','9900000014','9900000014','mechlineindustries.bgm@gmail.com','3',
    '[{"name":"Milling Machine"},{"name":"Slotting Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 14/25 Mech-Line Industries';

  -- ─────────────────────────────────────────────────────────────
  -- 15) Patil Engineering  (Namdev Mohite Patil)
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patilengineering.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'patilengineering.bgm@gmail.com',pw,now(),
      '{"full_name":"Patil Engineering","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'patilengineering.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Patil Engineering','patilengineering.bgm@gmail.com','9008623403','9008623403')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Patil Engineering','patil-engineering',
    'Turning, Pulley Specialist, Motor Body Machining Work. Expert machining for pulleys and motor bodies with precision turning capabilities. Contact: Namdev Mohite Patil.',
    lathe_cat,'Shahapur','9008623403','9008623403','patilengineering.bgm@gmail.com','4',
    '[{"name":"Lathe Machine"},{"name":"Pulley Machining Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 15/25 Patil Engineering';

  -- ─────────────────────────────────────────────────────────────
  -- 16) Omneity Group
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'contact@omneity.in') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'contact@omneity.in',pw,now(),
      '{"full_name":"Omneity Group","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'contact@omneity.in';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Omneity Group','contact@omneity.in','7676929797','7676929797')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Omneity Group','omneity-group',
    'Road Safety and Water Treatment work. Specializing in fabrication and engineering solutions for road safety equipment and water treatment infrastructure.',
    welding_cat,'Udyambag','7676929797','7676929797','contact@omneity.in','26',
    '[{"name":"Fabrication Equipment"},{"name":"Welding Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 16/25 Omneity Group';

  -- ─────────────────────────────────────────────────────────────
  -- 17) Shree Maruti Fabrication
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shreemaruti.fabrication@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'shreemaruti.fabrication@gmail.com',pw,now(),
      '{"full_name":"Shree Maruti Fabrication","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'shreemaruti.fabrication@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Shree Maruti Fabrication','shreemaruti.fabrication@gmail.com','9036108746','9036108746')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Shree Maruti Fabrication','shree-maruti-fabrication',
    E'Trusted fabrication service provider specializing in industrial rework and welding.\n\nServices: CI Casting Defects Rework, Foundry Machinery Rework Welding, Heavy & Light Fabrication Work, Industrial Welding Services, Machine Structure Repair & Modification, General Engineering Fabrication Work.',
    welding_cat,'Machhe KIADB','9036108746','9036108746','shreemaruti.fabrication@gmail.com','4',
    '[{"name":"MIG Welding Machine"},{"name":"ARC Welding Machine"},{"name":"Fabrication Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 17/25 Shree Maruti Fabrication';

  -- ─────────────────────────────────────────────────────────────
  -- 18) Patil Industries
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'patilindustries.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'patilindustries.bgm@gmail.com',pw,now(),
      '{"full_name":"Patil Industries","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'patilindustries.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Patil Industries','patilindustries.bgm@gmail.com','9449142757','9449142757')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Patil Industries','patil-industries',
    E'Professional welding and industrial rework via ARC Welding and TIG Welding.\n\nServices: Gear Teeth Rework Welding, Casting Pump Casing Repair, Shaft Rebuilding, Crack Filling & Hard Facing, Industrial Machinery Reconditioning, CI Casting Defects Rework, SS & MS Fabrication Welding.\n\nServing Sugar, Cement, Foundry and Engineering Industries.',
    welding_cat,'Udyambag','9449142757','9449142757','patilindustries.bgm@gmail.com','3',
    '[{"name":"ARC Welding Machine"},{"name":"TIG Welding Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 18/25 Patil Industries';

  -- ─────────────────────────────────────────────────────────────
  -- 19) Kavari Industries  (Contact: Vinod)
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'karveiindustries5@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'karveiindustries5@gmail.com',pw,now(),
      '{"full_name":"Kavari Industries","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'karveiindustries5@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Kavari Industries','karveiindustries5@gmail.com','9448420887','9448420887')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active,full_address)
  VALUES(uid,'Kavari Industries','kavari-industries',
    'Motor Repair and Rewinding up to 300Hp. Expert motor repair and rewinding services for industrial motors up to 300 horsepower. Contact: Vinod.',
    motor_cat,'Udyambag','9448420887','9448420887','karveiindustries5@gmail.com','2',
    '[{"name":"Motor Rewinding Equipment"},{"name":"Motor Testing Bench"}]'::jsonb,'free',false,true,'Udyambag, Belagavi')
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 19/25 Kavari Industries';

  -- ─────────────────────────────────────────────────────────────
  -- 20) Weld Group
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'weldgroup.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'weldgroup.bgm@gmail.com',pw,now(),
      '{"full_name":"Weld Group","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'weldgroup.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Weld Group','weldgroup.bgm@gmail.com','7353082414','7353082414')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Weld Group','weld-group',
    E'Repair, maintenance, and sales of all types of welding machines and hand power tools.\n\nWelding: ARC, MIG, TIG, Inverter — PCB repair, coil rewinding, spare replacement, performance testing.\n\nPower Tools: Grinding Machines, Cut-Off Machines, Drilling Machines, Polishing Machines, Marble Cutters.',
    welding_cat,'Gokul Road','7353082414','7353082414','weldgroup.bgm@gmail.com','4',
    '[{"name":"Welding Machine Service Equipment"},{"name":"Power Tool Service Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 20/25 Weld Group';

  -- ─────────────────────────────────────────────────────────────
  -- 21) Kishan Services
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kishanservices.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'kishanservices.bgm@gmail.com',pw,now(),
      '{"full_name":"Kishan Services","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'kishanservices.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Kishan Services','kishanservices.bgm@gmail.com','7026081773','7026081773')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Kishan Services','kishan-services',
    'Air Compressor Service and Trader. Also provides Turning, Pulley Specialist, Motor Body Machining Work.',
    motor_cat,'Bogarves','7026081773','7026081773','kishanservices.bgm@gmail.com','2',
    '[{"name":"Air Compressor"},{"name":"Lathe Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 21/25 Kishan Services';

  -- ─────────────────────────────────────────────────────────────
  -- 22) Vijay Sales
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vijaysales2525@hotmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'vijaysales2525@hotmail.com',pw,now(),
      '{"full_name":"Vijay Sales","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'vijaysales2525@hotmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Vijay Sales','vijaysales2525@hotmail.com','9483315977','9483315977')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Vijay Sales','vijay-sales',
    'All types of Industrial Hardware item Trader. Supplying a comprehensive range of industrial hardware items, tools, and accessories for engineering and manufacturing applications.',
    spare_cat,'Auto Nagar','9483315977','9483315977','vijaysales2525@hotmail.com','3',
    '[]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 22/25 Vijay Sales';

  -- ─────────────────────────────────────────────────────────────
  -- 23) Kshipra Engineering
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kshiprabgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'kshiprabgm@gmail.com',pw,now(),
      '{"full_name":"Kshipra Engineering","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'kshiprabgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Kshipra Engineering','kshiprabgm@gmail.com','9449915973','9449915973')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Kshipra Engineering','kshipra-engineering',
    'Authorised Dealer for Nucor Welding, Ador Welding, and Traders of Welding Machines and Spares. Trusted source for welding consumables, machines, and spare parts from leading brands.',
    spare_cat,'Udyambag','9449915973','9449915973','kshiprabgm@gmail.com','2',
    '[]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 23/25 Kshipra Engineering';

  -- ─────────────────────────────────────────────────────────────
  -- 24) Jinacast
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jinacast.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'jinacast.bgm@gmail.com',pw,now(),
      '{"full_name":"Jinacast","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'jinacast.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Jinacast','jinacast.bgm@gmail.com','9110498300','9110498300')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Jinacast','jinacast',
    'Laser Cutting Work. Precision laser cutting services for industrial sheet metal components and custom fabrication requirements.',
    laser_cat,'Machhe KIADB','9110498300','9110498300','jinacast.bgm@gmail.com','3',
    '[{"name":"Laser Cutting Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 24/25 Jinacast';

  -- ─────────────────────────────────────────────────────────────
  -- 25) Induservo
  -- ─────────────────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'induservo.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'induservo.bgm@gmail.com',pw,now(),
      '{"full_name":"Induservo","role":"vendor"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false);
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'induservo.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number)
    VALUES(uid,'Induservo','induservo.bgm@gmail.com','9900000025','9900000025')
    ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Induservo','induservo',
    'CNC Turning and Heavy Industry Fabrication Work. Providing advanced CNC turning services combined with heavy-duty industrial fabrication capabilities.',
    cnc_cat,'Auto Nagar','9900000025','9900000025','induservo.bgm@gmail.com','10+',
    '[{"name":"CNC Turning Machine"},{"name":"Heavy Fabrication Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email,employee_count=EXCLUDED.employee_count;
  RAISE NOTICE '✅ 25/25 Induservo';

  RAISE NOTICE '';
  RAISE NOTICE '🎉 ALL 25 VENDOR ACCOUNTS CREATED! Password for all: 123456';

END $$;

-- =============================================================================
-- VERIFICATION — rows shown after success
-- =============================================================================
SELECT
  u.email,
  p.full_name,
  p.phone,
  v.business_name,
  v.zone,
  v.employee_count,
  v.slug
FROM auth.users u
JOIN public.profiles   p  ON p.id = u.id
JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role = 'vendor'
JOIN public.vendors    v  ON v.user_id = u.id
ORDER BY v.business_name;
