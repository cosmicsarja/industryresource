-- =============================================================================
-- VENDOR SEED DATA - Belgavi Industrial Directory
-- Run this AFTER you have at least one user registered in auth.users
-- This seeds all 25 vendors (using the first available profile as owner)
-- =============================================================================

DO $$
DECLARE
  seed_user_id UUID;
  cnc_cat UUID;
  lathe_cat UUID;
  welding_cat UUID;
  laser_cat UUID;
  spare_cat UUID;
  tool_cat UUID;
  hydraulic_cat UUID;
  motor_cat UUID;
BEGIN
  -- Get first available user to associate vendors with
  SELECT id INTO seed_user_id FROM public.profiles LIMIT 1;

  IF seed_user_id IS NULL THEN
    RAISE NOTICE 'No profiles found. Please create a user account first, then re-run this script.';
    RETURN;
  END IF;

  RAISE NOTICE 'Seeding vendors with user_id: %', seed_user_id;

  -- Get category IDs
  SELECT id INTO cnc_cat FROM public.categories WHERE slug = 'cnc-machining';
  SELECT id INTO lathe_cat FROM public.categories WHERE slug = 'lathe-works';
  SELECT id INTO welding_cat FROM public.categories WHERE slug = 'welding-fabrication';
  SELECT id INTO laser_cat FROM public.categories WHERE slug = 'steel-cutting';
  SELECT id INTO spare_cat FROM public.categories WHERE slug = 'spare-parts';
  SELECT id INTO tool_cat FROM public.categories WHERE slug = 'tool-room';
  SELECT id INTO hydraulic_cat FROM public.categories WHERE slug = 'hydraulic-repair';
  SELECT id INTO motor_cat FROM public.categories WHERE slug = 'motor-rewinding';

  -- =========================================================================
  -- GROUP 1: CNC OPERATION WORK COMPANIES
  -- =========================================================================

  -- 1) Vaibhav Engineering
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Vaibhav Engineering', 'vaibhav-engineering',
    'Trillers Parts Manufacturers and all CNC VMC Work. Specializing in high-precision CNC machining and VMC operations for industrial components in Belagavi.',
    cnc_cat, 'Udyambag', '9999000001', 'free', false, true,
    '[{"name":"CNC Lathe"},{"name":"VMC Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 2) Mangale Lasertech
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Mangale Lasertech', 'mangale-lasertech',
    'Laser Cut, CNC, Punching Work. Providing precision laser cutting, CNC machining, and sheet metal punching services for industrial applications.',
    cnc_cat, 'Machhe KIADB', '9999000002', 'free', false, true,
    '[{"name":"Laser Cutting Machine"},{"name":"CNC Machine"},{"name":"Punching Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 3) Infinity Industries
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Infinity Industries', 'infinity-industries',
    'Lathe Work, Milling Work, CNC Turning Work. Offering comprehensive machining services including lathe, milling and CNC turning for various industrial components.',
    cnc_cat, 'Auto Nagar', '9999000003', 'free', false, true,
    '[{"name":"CNC Turning Machine"},{"name":"Lathe Machine"},{"name":"Milling Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 4) Rajan Engineering
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Rajan Engineering', 'rajan-engineering',
    'CNC Turning and Radial Drilling Work, Crankshaft Drilling Work. Specializing in precision CNC turning and drilling services including complex crankshaft drilling.',
    cnc_cat, 'Udyambag', '9999000004', 'free', false, true,
    '[{"name":"CNC Turning Machine"},{"name":"Radial Drilling Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 5) Shree Ragevendra Pattern Work
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Shree Ragevendra Pattern Work', 'shree-ragevendra-pattern-work',
    'Pattern Work, CI, Aluminium, Dies work Job Work, VMC Machine. Expert in pattern making and foundry-related job work using CI, aluminium, and die materials.',
    cnc_cat, 'Bogarves', '9999000005', 'free', false, true,
    '[{"name":"VMC Machine"},{"name":"Pattern Making Equipment"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 6) Raytech Engineering
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Raytech Engineering', 'raytech-engineering',
    'Tooling, Precision Work in all types of Material — MS, CI, Aluminium, Copper, Acrylic Sheet etc. Delivering high-precision tooling and machining solutions across diverse materials.',
    tool_cat, 'Machhe KIADB', '9999000006', 'free', false, true,
    '[{"name":"CNC Machine"},{"name":"Precision Tooling Equipment"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 7) Mangai Engg
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, whatsapp, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Mangai Engg', 'mangai-engg',
    'Turning Work. Specialized turning and CNC machining services for industrial components. Contact: Lakahan Sir — 8792491226.',
    lathe_cat, 'Auto Nagar', '8792491226', '8792491226', 'free', false, true,
    '[{"name":"Turning Machine"},{"name":"CNC Lathe"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 8) Yatrik Hydraulics
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Yatrik Hydraulics', 'yatrik-hydraulics',
    'Hydraulic Fittings Manufacturer. Manufacturing and supplying high-quality hydraulic fittings for industrial and engineering applications.',
    hydraulic_cat, 'Udyambag', '9999000008', 'free', false, true,
    '[{"name":"Hydraulic Fitting Manufacturing Equipment"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 9) Navsankalp Industries
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, whatsapp, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Navsankalp Industries', 'navsankalp-industries',
    'Turning, Milling, Grinding, Drilling. Comprehensive machining services covering turning, milling, grinding and drilling operations for industrial requirements.',
    cnc_cat, 'Gokul Road', '9731791499', '9731791499', 'free', false, true,
    '[{"name":"Turning Machine"},{"name":"Milling Machine"},{"name":"Grinding Machine"},{"name":"Drilling Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- =========================================================================
  -- GROUP 2: CONVENTIONAL WORK (LATHE, MILLING, GRINDING)
  -- =========================================================================

  -- 10) Nova Engineering Solutions
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Nova Engineering Solutions', 'nova-engineering-solutions',
    'Conventional machining services: Milling, Squaring, Facing, and Slotting operations for precision engineering requirements.',
    lathe_cat, 'Auto Nagar', '9999000010', 'free', false, true,
    '[{"name":"Milling Machine"},{"name":"Slotting Machine"},{"name":"Lathe Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 11) Shree Jagadamba Enterprises
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Shree Jagadamba Enterprises', 'shree-jagadamba-enterprises',
    E'Trusted engineering workshop specializing in Conventional Lathe Work and Drilling Work.\n\nLathe services: Turning, Facing, Threading, Shaft Machining, Bush & Sleeve Machining, Bore & Step Turning, Rework and Job Work, Industrial Component Machining.\n\nDrilling services: Hole Drilling, Tapping Work, Reaming Work, Multi-size Drilling.',
    lathe_cat, 'Udyambag', '9999000011', 'free', false, true,
    '[{"name":"Conventional Lathe"},{"name":"Drilling Machine"},{"name":"Tapping Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 12) Jaishree Engineering Work
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Jaishree Engineering Work', 'jaishree-engineering-work',
    'Hydraulic Work and Radial Drilling Work. Providing specialized hydraulic servicing and precision radial drilling for various engineering applications.',
    hydraulic_cat, 'Machhe KIADB', '9999000012', 'free', false, true,
    '[{"name":"Radial Drilling Machine"},{"name":"Hydraulic Equipment"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 13) DVS Aaryan Tools
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'DVS Aaryan Tools', 'dvs-aaryan-tools',
    'Tool and Cutter Drill, Tap and Mill Resharpening and all types of Gauges Manufacturing. Precision tool reconditioning and gauge manufacturing services.',
    tool_cat, 'Auto Nagar', '9999000013', 'free', false, true,
    '[{"name":"Tool Grinding Machine"},{"name":"Gauge Manufacturing Equipment"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 14) Mech-Line Industries
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Mech-Line Industries', 'mech-line-industries',
    'Milling Operation Work like Slotting, Keyway, Squaring Etc. Precision milling services for industrial components including slotting and keyway cutting.',
    lathe_cat, 'Gokul Road', '9999000014', 'free', false, true,
    '[{"name":"Milling Machine"},{"name":"Slotting Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 15) Patil Engineering
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, whatsapp, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Patil Engineering', 'patil-engineering',
    'Turning, Pulley Specialist, Motor Body Machining Work. Expert machining for pulleys and motor bodies with precision turning capabilities. Contact: Namdev Mohite Patil.',
    lathe_cat, 'Shahapur', '9008623403', '9008623403', 'free', false, true,
    '[{"name":"Lathe Machine"},{"name":"Pulley Machining Equipment"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- =========================================================================
  -- GROUP 3: HEAVY FABRICATION AND CNC WORK
  -- =========================================================================

  -- 16) Omneity Group
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Omneity Group', 'omneity-group',
    'Road Safety and Water Treatment work. Specializing in fabrication and engineering solutions for road safety equipment and water treatment infrastructure.',
    welding_cat, 'Udyambag', '9999000016', 'free', false, true,
    '[{"name":"Fabrication Equipment"},{"name":"Welding Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 17) Shree Maruti Fabrication
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Shree Maruti Fabrication', 'shree-maruti-fabrication',
    E'Trusted and quality-focused fabrication service provider specializing in industrial rework and welding solutions.\n\nServices:\n• CI Casting Defects Rework\n• Foundry Machinery Rework Welding\n• Heavy & Light Fabrication Work\n• Industrial Welding Services\n• Machine Structure Repair & Modification\n• General Engineering Fabrication Work\n\nSkilled workforce delivering quality welding, finishing, and timely project completion.',
    welding_cat, 'Machhe KIADB', '9999000017', 'free', false, true,
    '[{"name":"MIG Welding Machine"},{"name":"ARC Welding Machine"},{"name":"Fabrication Equipment"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 18) Patil Industries
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Patil Industries', 'patil-industries',
    E'Professional welding and industrial rework service provider specializing in ARC Welding and TIG Welding.\n\nServices:\n• Gear Teeth Rework Welding\n• Casting Pump Casing Repair\n• Shaft Rebuilding\n• Crack Filling & Hard Facing\n• Industrial Machinery Reconditioning\n• CI Casting Defects Rework\n• SS & MS Fabrication Welding\n\nServing Sugar Industries, Cement Industries, Foundries, and Engineering Units.',
    welding_cat, 'Udyambag', '9999000018', 'free', false, true,
    '[{"name":"ARC Welding Machine"},{"name":"TIG Welding Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 19) Induservo
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Induservo', 'induservo',
    'CNC Turning and Heavy Industry Fabrication Work. Providing advanced CNC turning services combined with heavy-duty industrial fabrication capabilities.',
    cnc_cat, 'Auto Nagar', '9999000019', 'free', false, true,
    '[{"name":"CNC Turning Machine"},{"name":"Heavy Fabrication Equipment"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- =========================================================================
  -- GROUP 4: INDUSTRIAL MACHINE SERVICE PROVIDERS
  -- =========================================================================

  -- 20) Kavari Industries
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, email, subscription_plan, is_verified, is_active, machine_list, full_address)
  VALUES (seed_user_id, 'Kavari Industries', 'kavari-industries',
    'Motor Repair and Rewinding up to 300Hp. Expert motor repair and rewinding services for industrial motors up to 300 horsepower. Contact: Vinod.',
    motor_cat, 'Udyambag', '9448420887', 'karveiindustries5@gmail.com', 'free', false, true,
    '[{"name":"Motor Rewinding Equipment"},{"name":"Motor Testing Bench"}]'::jsonb,
    'Udyambag, Belagavi')
  ON CONFLICT (slug) DO NOTHING;

  -- 21) Weld Group
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Weld Group', 'weld-group',
    E'Trusted service provider for repair, maintenance, and sales of all types of welding machines and hand power tools.\n\nWelding machines serviced: ARC, MIG, TIG, Inverter, and Industrial Welding Equipment — PCB repair, coil rewinding, spare replacement, performance testing.\n\nPower tools serviced: Grinding Machines, Cut-Off Machines, Drilling Machines, Polishing Machines, Marble Cutters.\n\nAlso deals in genuine spare parts and accessories.',
    welding_cat, 'Gokul Road', '9999000021', 'free', false, true,
    '[{"name":"Welding Machine Service Equipment"},{"name":"Power Tool Service Equipment"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 22) Kishan Services
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Kishan Services', 'kishan-services',
    'Air Compressor Service and Trader. Also provides Turning, Pulley Specialist, Motor Body Machining Work. Comprehensive compressor servicing combined with precision machining.',
    motor_cat, 'Bogarves', '9999000022', 'free', false, true,
    '[{"name":"Air Compressor"},{"name":"Lathe Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- =========================================================================
  -- GROUP 5: INDUSTRIAL MACHINE AND SPARES TRADERS
  -- =========================================================================

  -- 23) Vijay Sales
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Vijay Sales', 'vijay-sales',
    'All types of Industrial Hardware item Trader. Supplying a comprehensive range of industrial hardware items, tools, and accessories for engineering and manufacturing applications.',
    spare_cat, 'Auto Nagar', '9999000023', 'free', false, true,
    '[]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- 24) Kshipra Engineering
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Kshipra Engineering', 'kshipra-engineering',
    'Authorised Dealer for Nucor Welding, Ador Welding, and Traders of Welding Machines and Spares. Trusted source for welding consumables, machines, and spare parts from leading brands.',
    spare_cat, 'Udyambag', '9999000024', 'free', false, true,
    '[]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- =========================================================================
  -- GROUP 6: LASER CUTTING AND PUNCHING WORK
  -- =========================================================================

  -- 25) Mangale Lasertech (already seeded in group 1, skipped)

  -- 26) Jinacast
  INSERT INTO public.vendors (user_id, business_name, slug, description, category_id, zone, phone, subscription_plan, is_verified, is_active, machine_list)
  VALUES (seed_user_id, 'Jinacast', 'jinacast',
    'Laser Cutting Work. Precision laser cutting services for industrial sheet metal components and custom fabrication requirements.',
    laser_cat, 'Machhe KIADB', '9999000026', 'free', false, true,
    '[{"name":"Laser Cutting Machine"}]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE '✅ Vendor seed complete! Inserted up to 25 vendors.';
END $$;
