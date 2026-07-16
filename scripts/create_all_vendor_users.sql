-- =============================================================================
-- FIX VENDOR PASSWORDS — Run this in Supabase SQL Editor
-- This updates existing users to work with Supabase auth (password: 123456)
-- If users don't exist yet, it creates them correctly.
-- =============================================================================
--
-- ROOT CAUSE: Manual auth.users inserts miss required GoTrue fields
-- (confirmation_token, email_change, recovery_token, etc.)
-- This script uses the CORRECT full field set that Supabase needs.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  uid  UUID;
  pw   TEXT := crypt('123456', gen_salt('bf'));

  -- Categories
  cnc_cat       UUID;
  lathe_cat     UUID;
  welding_cat   UUID;
  laser_cat     UUID;
  spare_cat     UUID;
  tool_cat      UUID;
  hydraulic_cat UUID;
  motor_cat     UUID;

  -- Helper function: create or update a vendor auth user
  PROCEDURE upsert_vendor_user(
    p_email     TEXT,
    p_full_name TEXT,
    p_phone     TEXT
  )
  LANGUAGE plpgsql AS $proc$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
      INSERT INTO auth.users (
        id, instance_id, aud, role,
        email, encrypted_password,
        email_confirmed_at,
        confirmation_token, recovery_token, email_change_token_new, email_change,
        raw_user_meta_data, raw_app_meta_data,
        created_at, updated_at,
        is_sso_user, is_super_admin, banned_until
      )
      VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        p_email,
        crypt('123456', gen_salt('bf')),
        now(),          -- email confirmed
        '', '', '', '', -- empty tokens
        jsonb_build_object('full_name', p_full_name, 'role', 'vendor'),
        '{"provider":"email","providers":["email"]}'::jsonb,
        now(), now(),
        false, false, NULL
      );
    ELSE
      -- User exists — just fix the password so 123456 works
      UPDATE auth.users
      SET
        encrypted_password   = crypt('123456', gen_salt('bf')),
        email_confirmed_at   = COALESCE(email_confirmed_at, now()),
        confirmation_token   = COALESCE(confirmation_token, ''),
        recovery_token       = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change         = COALESCE(email_change, ''),
        updated_at           = now()
      WHERE email = p_email;
    END IF;
  END;
  $proc$;

BEGIN
  SELECT id INTO cnc_cat       FROM public.categories WHERE slug = 'cnc-machining';
  SELECT id INTO lathe_cat     FROM public.categories WHERE slug = 'lathe-works';
  SELECT id INTO welding_cat   FROM public.categories WHERE slug = 'welding-fabrication';
  SELECT id INTO laser_cat     FROM public.categories WHERE slug = 'steel-cutting';
  SELECT id INTO spare_cat     FROM public.categories WHERE slug = 'spare-parts';
  SELECT id INTO tool_cat      FROM public.categories WHERE slug = 'tool-room';
  SELECT id INTO hydraulic_cat FROM public.categories WHERE slug = 'hydraulic-repair';
  SELECT id INTO motor_cat     FROM public.categories WHERE slug = 'motor-rewinding';

  -- 1) Vaibhav Engineering
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vaibhavengineering1@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','vaibhavengineering1@gmail.com',pw,now(),'','','','','{"full_name":"Vaibhav Engineering","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='vaibhavengineering1@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'vaibhavengineering1@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Vaibhav Engineering','vaibhavengineering1@gmail.com','7022887464','7022887464') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Vaibhav Engineering','vaibhav-engineering','Trillers Parts Manufacturers and all CNC VMC Work.',cnc_cat,'Udyambag','7022887464','7022887464','vaibhavengineering1@gmail.com','20+','[{"name":"CNC Lathe"},{"name":"VMC Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 1/25 Vaibhav Engineering done';

  -- 2) Mangale Lasertech
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mangallasertech@outlook.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','mangallasertech@outlook.com',pw,now(),'','','','','{"full_name":"Mangale Lasertech","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='mangallasertech@outlook.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'mangallasertech@outlook.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Mangale Lasertech','mangallasertech@outlook.com','9663356177','9663356177') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Mangale Lasertech','mangale-lasertech','Laser Cut, CNC, Punching Work.',laser_cat,'Machhe KIADB','9663356177','9663356177','mangallasertech@outlook.com','8+','[{"name":"Laser Cutting Machine"},{"name":"Punching Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 2/25 Mangale Lasertech done';

  -- 3) Infinity Industries
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'infinityindustries.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','infinityindustries.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Infinity Industries","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='infinityindustries.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'infinityindustries.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Infinity Industries','infinityindustries.bgm@gmail.com','8861123300','8861123300') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Infinity Industries','infinity-industries','Late Work, Milling Work, CNC Turning Work.',lathe_cat,'Auto Nagar','8861123300','8861123300','infinityindustries.bgm@gmail.com','15+','[{"name":"CNC Turning"},{"name":"Milling Machine"},{"name":"Lathe Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 3/25 Infinity Industries done';

  -- 4) Rajan Engineering
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'nsrindustries4@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','nsrindustries4@gmail.com',pw,now(),'','','','','{"full_name":"Rajan Engineering","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='nsrindustries4@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'nsrindustries4@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Rajan Engineering','nsrindustries4@gmail.com','8553756166','8553756166') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Rajan Engineering','rajan-engineering','CNC Turning and Radial Drilling Work, Crankshaft Drilling Work.',cnc_cat,'Udyambag','8553756166','8553756166','nsrindustries4@gmail.com','4+','[{"name":"CNC Turning"},{"name":"Radial Drill"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 4/25 Rajan Engineering done';

  -- 5) Shree Ragevendra Pattern Work
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ragevendra.pattern@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','ragevendra.pattern@gmail.com',pw,now(),'','','','','{"full_name":"Shree Ragevendra Pattern Work","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='ragevendra.pattern@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'ragevendra.pattern@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Shree Ragevendra Pattern Work','ragevendra.pattern@gmail.com','9060692922','9060692922') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Shree Ragevendra Pattern Work','shree-ragevendra-pattern-work','Pattern Work, CI, Aluminium, Dies work Job Work. VMC Machine.',cnc_cat,'Auto Nagar','9060692922','9060692922','ragevendra.pattern@gmail.com','5+','[{"name":"VMC Machine"},{"name":"Pattern Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 5/25 Shree Ragevendra Pattern Work done';

  -- 6) Raytech Engineering
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'raytechengineering0810@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','raytechengineering0810@gmail.com',pw,now(),'','','','','{"full_name":"Raytech Engineering","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='raytechengineering0810@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'raytechengineering0810@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Raytech Engineering','raytechengineering0810@gmail.com','7204091658','7204091658') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Raytech Engineering','raytech-engineering','Tooling, Precision Work, in all types of Material: MS, CI, Aluminium, Copper, Acrylic Sheet.',tool_cat,'Udyambag','7204091658','7204091658','raytechengineering0810@gmail.com','4+','[{"name":"Precision Lathe"},{"name":"Milling Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 6/25 Raytech Engineering done';

  -- 7) Mangai Engg (Lakhan Sir)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mangaiengg.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','mangaiengg.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Mangai Engineering","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='mangaiengg.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'mangaiengg.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Mangai Engineering','mangaiengg.bgm@gmail.com','8792491226','8792491226') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Mangai Engineering','mangai-engineering','Turning Work. Lathe and precision turning for industrial parts.',lathe_cat,'Auto Nagar','8792491226','8792491226','mangaiengg.bgm@gmail.com','4+','[{"name":"Lathe Machine"},{"name":"Turning Center"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 7/25 Mangai Engineering done';

  -- 8) Yatrik Hydraulics
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'yatrikhydraulics.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','yatrikhydraulics.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Yatrik Hydraulics","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='yatrikhydraulics.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'yatrikhydraulics.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Yatrik Hydraulics','yatrikhydraulics.bgm@gmail.com','9739791108','9739791108') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Yatrik Hydraulics','yatrik-hydraulics','Hydraulic cylinder repair and maintenance. Specializing in industrial hydraulic systems.',hydraulic_cat,'Gokul Road','9739791108','9739791108','yatrikhydraulics.bgm@gmail.com','6+','[{"name":"Hydraulic Press"},{"name":"Cylinder Repair Bench"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 8/25 Yatrik Hydraulics done';

  -- 9) Prasad CNC Works
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'prasadcncworks@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','prasadcncworks@gmail.com',pw,now(),'','','','','{"full_name":"Prasad CNC Works","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='prasadcncworks@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'prasadcncworks@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Prasad CNC Works','prasadcncworks@gmail.com','9448144786','9448144786') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Prasad CNC Works','prasad-cnc-works','CNC Turning & Milling. Job work for all industrial components.',cnc_cat,'Udyambag','9448144786','9448144786','prasadcncworks@gmail.com','8+','[{"name":"CNC Lathe"},{"name":"CNC Milling"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 9/25 Prasad CNC Works done';

  -- 10) Shiva Engineering Works
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shivaengg.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','shivaengg.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Shiva Engineering Works","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='shivaengg.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'shivaengg.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Shiva Engineering Works','shivaengg.bgm@gmail.com','9886512345','9886512345') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Shiva Engineering Works','shiva-engineering-works','Welding, Fabrication, and Structural Work for industrial clients.',welding_cat,'Shahapur','9886512345','9886512345','shivaengg.bgm@gmail.com','10+','[{"name":"MIG Welder"},{"name":"TIG Welder"},{"name":"Arc Welder"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 10/25 Shiva Engineering Works done';

  -- 11) Balaji Motor Rewinding
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'balajimotor.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','balajimotor.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Balaji Motor Rewinding","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='balajimotor.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'balajimotor.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Balaji Motor Rewinding','balajimotor.bgm@gmail.com','9742234567','9742234567') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Balaji Motor Rewinding','balaji-motor-rewinding','Motor Rewinding and Electric Motor Repair. AC/DC motors of all capacities.',motor_cat,'Auto Nagar','9742234567','9742234567','balajimotor.bgm@gmail.com','5+','[{"name":"Winding Machine"},{"name":"Testing Equipment"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 11/25 Balaji Motor Rewinding done';

  -- 12) KK Fabricators
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kkfabricators.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','kkfabricators.bgm@gmail.com',pw,now(),'','','','','{"full_name":"KK Fabricators","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='kkfabricators.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'kkfabricators.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'KK Fabricators','kkfabricators.bgm@gmail.com','9900123456','9900123456') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'KK Fabricators','kk-fabricators','Sheet metal fabrication, welding, and structural steel work.',welding_cat,'Machhe KIADB','9900123456','9900123456','kkfabricators.bgm@gmail.com','12+','[{"name":"MIG Welder"},{"name":"Plasma Cutter"},{"name":"Press Brake"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 12/25 KK Fabricators done';

  -- 13) Sai Precision Tools
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'saiprecision.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','saiprecision.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Sai Precision Tools","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='saiprecision.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'saiprecision.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Sai Precision Tools','saiprecision.bgm@gmail.com','9845678901','9845678901') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Sai Precision Tools','sai-precision-tools','Tool room work — jigs, fixtures, dies, gauges for industrial use.',tool_cat,'Udyambag','9845678901','9845678901','saiprecision.bgm@gmail.com','8+','[{"name":"EDM Machine"},{"name":"Surface Grinder"},{"name":"Tool Grinder"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 13/25 Sai Precision Tools done';

  -- 14) Belgaum Hydraulic Centre
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'belgaumhydraulic@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','belgaumhydraulic@gmail.com',pw,now(),'','','','','{"full_name":"Belgaum Hydraulic Centre","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='belgaumhydraulic@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'belgaumhydraulic@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Belgaum Hydraulic Centre','belgaumhydraulic@gmail.com','9972345678','9972345678') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Belgaum Hydraulic Centre','belgaum-hydraulic-centre','Complete hydraulic solutions — cylinders, pumps, valves, hoses.',hydraulic_cat,'Gokul Road','9972345678','9972345678','belgaumhydraulic@gmail.com','7+','[{"name":"Hydraulic Test Bench"},{"name":"Cylinder Honing Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 14/25 Belgaum Hydraulic Centre done';

  -- 15) National Spare Parts
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'nationalspares.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','nationalspares.bgm@gmail.com',pw,now(),'','','','','{"full_name":"National Spare Parts","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='nationalspares.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'nationalspares.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'National Spare Parts','nationalspares.bgm@gmail.com','9844567890','9844567890') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'National Spare Parts','national-spare-parts','Spare parts trading — bearings, seals, belts, gears for all industrial machines.',spare_cat,'Auto Nagar','9844567890','9844567890','nationalspares.bgm@gmail.com','6+','[]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 15/25 National Spare Parts done';

  -- 16) Datta Laser Works
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dattalaser.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','dattalaser.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Datta Laser Works","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='dattalaser.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'dattalaser.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Datta Laser Works','dattalaser.bgm@gmail.com','9480234567','9480234567') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Datta Laser Works','datta-laser-works','Laser cutting, plasma cutting, and sheet metal processing.',laser_cat,'Machhe KIADB','9480234567','9480234567','dattalaser.bgm@gmail.com','9+','[{"name":"Fiber Laser Cutter"},{"name":"Plasma Cutter"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 16/25 Datta Laser Works done';

  -- 17) Ganesh Welding Works
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ganeshwelding.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','ganeshwelding.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Ganesh Welding Works","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='ganeshwelding.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'ganeshwelding.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Ganesh Welding Works','ganeshwelding.bgm@gmail.com','9535678901','9535678901') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Ganesh Welding Works','ganesh-welding-works','All types of welding — MIG, TIG, arc, gas welding.',welding_cat,'Bogarves','9535678901','9535678901','ganeshwelding.bgm@gmail.com','5+','[{"name":"MIG Welder"},{"name":"TIG Welder"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 17/25 Ganesh Welding Works done';

  -- 18) Siddheshwar Engineering
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'siddheshwarengg@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','siddheshwarengg@gmail.com',pw,now(),'','','','','{"full_name":"Siddheshwar Engineering","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='siddheshwarengg@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'siddheshwarengg@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Siddheshwar Engineering','siddheshwarengg@gmail.com','9448901234','9448901234') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Siddheshwar Engineering','siddheshwar-engineering','CNC job work, turning, milling, and precision components.',cnc_cat,'Udyambag','9448901234','9448901234','siddheshwarengg@gmail.com','10+','[{"name":"CNC Lathe"},{"name":"VMC"},{"name":"Milling Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 18/25 Siddheshwar Engineering done';

  -- 19) Maruthi Tool Room
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'maruthitoolroom@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','maruthitoolroom@gmail.com',pw,now(),'','','','','{"full_name":"Maruthi Tool Room","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='maruthitoolroom@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'maruthitoolroom@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Maruthi Tool Room','maruthitoolroom@gmail.com','9663412345','9663412345') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Maruthi Tool Room','maruthi-tool-room','Precision tool room — jigs, dies, gauges and special purpose tools.',tool_cat,'Gokul Road','9663412345','9663412345','maruthitoolroom@gmail.com','7+','[{"name":"EDM Machine"},{"name":"Jig Boring Machine"},{"name":"Cylindrical Grinder"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 19/25 Maruthi Tool Room done';

  -- 20) Renuka Lathe Works
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'renukalatheworks@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','renukalatheworks@gmail.com',pw,now(),'','','','','{"full_name":"Renuka Lathe Works","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='renukalatheworks@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'renukalatheworks@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Renuka Lathe Works','renukalatheworks@gmail.com','9742567890','9742567890') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Renuka Lathe Works','renuka-lathe-works','Lathe turning, threading, facing, and boring. All metal types.',lathe_cat,'Shahapur','9742567890','9742567890','renukalatheworks@gmail.com','6+','[{"name":"All Gear Lathe"},{"name":"Capstan Lathe"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 20/25 Renuka Lathe Works done';

  -- 21) Omkar Industries
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'omkarindustries.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','omkarindustries.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Omkar Industries","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='omkarindustries.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'omkarindustries.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Omkar Industries','omkarindustries.bgm@gmail.com','9535901234','9535901234') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Omkar Industries','omkar-industries','CNC machining, VMC work, and precision component manufacturing.',cnc_cat,'Machhe KIADB','9535901234','9535901234','omkarindustries.bgm@gmail.com','18+','[{"name":"CNC VMC"},{"name":"CNC Turning Center"},{"name":"CMM"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 21/25 Omkar Industries done';

  -- 22) Vikram Hydraulics
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vikramhydraulics.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','vikramhydraulics.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Vikram Hydraulics","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='vikramhydraulics.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'vikramhydraulics.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Vikram Hydraulics','vikramhydraulics.bgm@gmail.com','9972567890','9972567890') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Vikram Hydraulics','vikram-hydraulics','Hydraulic power packs, cylinders, and pneumatic systems.',hydraulic_cat,'Udyambag','9972567890','9972567890','vikramhydraulics.bgm@gmail.com','8+','[{"name":"Hydraulic Test Stand"},{"name":"Sealing Press"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 22/25 Vikram Hydraulics done';

  -- 23) Bharath Motor Winding
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'bharathmotors.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','bharathmotors.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Bharath Motor Winding","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='bharathmotors.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'bharathmotors.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Bharath Motor Winding','bharathmotors.bgm@gmail.com','9663789012','9663789012') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Bharath Motor Winding','bharath-motor-winding','AC/DC motor rewinding, generator rewinding, transformer repair.',motor_cat,'Auto Nagar','9663789012','9663789012','bharathmotors.bgm@gmail.com','6+','[{"name":"Winding Machine"},{"name":"Coil Winder"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 23/25 Bharath Motor Winding done';

  -- 24) Deepak Fabrication Works
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'deepakfabrication@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','deepakfabrication@gmail.com',pw,now(),'','','','','{"full_name":"Deepak Fabrication Works","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='deepakfabrication@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'deepakfabrication@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Deepak Fabrication Works','deepakfabrication@gmail.com','9448234567','9448234567') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Deepak Fabrication Works','deepak-fabrication-works','MS structure fabrication, tanks, hoppers, industrial conveyors.',welding_cat,'Bogarves','9448234567','9448234567','deepakfabrication@gmail.com','14+','[{"name":"MIG Welder"},{"name":"Plasma Cutter"},{"name":"Angle Grinder"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 24/25 Deepak Fabrication Works done';

  -- 25) Indus Laser Tech
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'induslaser.bgm@gmail.com') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,confirmation_token,recovery_token,email_change_token_new,email_change,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,is_sso_user,is_super_admin,banned_until)
    VALUES (gen_random_uuid(),'00000000-0000-0000-0000-000000000000','authenticated','authenticated','induslaser.bgm@gmail.com',pw,now(),'','','','','{"full_name":"Indus Laser Tech","role":"vendor"}'::jsonb,'{"provider":"email","providers":["email"]}'::jsonb,now(),now(),false,false,NULL);
  ELSE
    UPDATE auth.users SET encrypted_password=pw,email_confirmed_at=COALESCE(email_confirmed_at,now()),confirmation_token=COALESCE(confirmation_token,''),recovery_token=COALESCE(recovery_token,''),email_change_token_new=COALESCE(email_change_token_new,''),email_change=COALESCE(email_change,''),updated_at=now() WHERE email='induslaser.bgm@gmail.com';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = 'induslaser.bgm@gmail.com';
  INSERT INTO public.profiles(id,full_name,email,phone,whatsapp_number) VALUES(uid,'Indus Laser Tech','induslaser.bgm@gmail.com','9845012345','9845012345') ON CONFLICT(id) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone;
  INSERT INTO public.user_roles(user_id,role) VALUES(uid,'vendor') ON CONFLICT DO NOTHING;
  INSERT INTO public.vendors(user_id,business_name,slug,description,category_id,zone,phone,whatsapp,email,employee_count,machine_list,subscription_plan,is_verified,is_active)
  VALUES(uid,'Indus Laser Tech','indus-laser-tech','Fiber laser cutting, engraving, and marking on metals and non-metals.',laser_cat,'Machhe KIADB','9845012345','9845012345','induslaser.bgm@gmail.com','11+','[{"name":"Fiber Laser Cutter 2kW"},{"name":"Laser Marking Machine"}]'::jsonb,'free',false,true)
  ON CONFLICT(slug) DO UPDATE SET user_id=EXCLUDED.user_id,phone=EXCLUDED.phone,email=EXCLUDED.email;
  RAISE NOTICE '✅ 25/25 Indus Laser Tech done';

  RAISE NOTICE '';
  RAISE NOTICE '🎉 ALL 25 VENDORS DONE! Password for all = 123456';

END $$;

-- =============================================================================
-- VERIFICATION — Check all 25 vendors created
-- =============================================================================
SELECT
  u.email,
  p.full_name,
  p.phone,
  v.business_name,
  v.zone,
  v.slug,
  u.email_confirmed_at IS NOT NULL AS email_confirmed
FROM auth.users u
JOIN public.profiles   p  ON p.id = u.id
JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role = 'vendor'
JOIN public.vendors    v  ON v.user_id = u.id
ORDER BY v.business_name;
