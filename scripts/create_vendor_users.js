#!/usr/bin/env node
// =============================================================================
// CREATE VENDOR USERS + SEED VENDOR PROFILES
// Run: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/create_vendor_users.js
// =============================================================================

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_URL = "https://cmrhvsiqlzntxwftfryj.supabase.co";
const PASSWORD = "123456";

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY env var is required");
  console.log("\nTo find your service role key:");
  console.log("1. Go to https://supabase.com/dashboard/project/cmrhvsiqlzntxwftfryj/settings/api");
  console.log("2. Copy the 'service_role' secret key");
  console.log("3. Run: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/create_vendor_users.js");
  process.exit(1);
}

const adminHeaders = {
  "apikey": SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

// =============================================================================
// VENDOR DATA - All 26 companies from the list
// Generated emails where missing (based on business name)
// =============================================================================
const VENDORS = [
  // GROUP 1: CNC OPERATION WORK COMPANIES
  {
    email: "vaibhavengineering1@gmail.com",
    full_name: "Vaibhav Engineering",
    phone: "7022887464",
    slug: "vaibhav-engineering",
    business_name: "Vaibhav Engineering",
    description: "Trillers Parts Manufacturers and all CNC VMC Work. Specializing in high-precision CNC machining and VMC operations for industrial components in Belagavi.",
    category_slug: "cnc-machining",
    zone: "Udyambag",
    whatsapp: "7022887464",
    employee_count: "20+",
    machine_list: [{ name: "CNC Lathe" }, { name: "VMC Machine" }],
  },
  {
    email: "mangallasertech@outlook.com",
    full_name: "Mangale Lasertech",
    phone: "9663356177",
    slug: "mangale-lasertech",
    business_name: "Mangale Lasertech",
    description: "Laser Cut, CNC, Punching Work. Providing precision laser cutting, CNC machining, and sheet metal punching services for industrial applications.",
    category_slug: "steel-cutting",
    zone: "Machhe KIADB",
    whatsapp: "9663356177",
    employee_count: "8+",
    machine_list: [{ name: "Laser Cutting Machine" }, { name: "CNC Machine" }, { name: "Punching Machine" }],
  },
  {
    email: "infinityindustries.bgm@gmail.com",
    full_name: "Infinity Industries",
    phone: "8861123300",
    slug: "infinity-industries",
    business_name: "Infinity Industries",
    description: "Lathe Work, Milling Work, CNC Turning Work. Offering comprehensive machining services including lathe, milling and CNC turning for various industrial components.",
    category_slug: "cnc-machining",
    zone: "Auto Nagar",
    whatsapp: "8861123300",
    employee_count: "15+",
    machine_list: [{ name: "CNC Turning Machine" }, { name: "Lathe Machine" }, { name: "Milling Machine" }],
  },
  {
    email: "nsrindustries4@gmail.com",
    full_name: "Rajan Engineering",
    phone: "8553756166",
    slug: "rajan-engineering",
    business_name: "Rajan Engineering",
    description: "CNC Turning and Radial Drilling Work, Crankshaft Drilling Work. Specializing in precision CNC turning and drilling services including complex crankshaft drilling.",
    category_slug: "cnc-machining",
    zone: "Udyambag",
    whatsapp: "8553756166",
    employee_count: "4+",
    machine_list: [{ name: "CNC Turning Machine" }, { name: "Radial Drilling Machine" }],
  },
  {
    email: "shreerage.patternwork@gmail.com",
    full_name: "Shree Ragevendra Pattern Work",
    phone: "9060692922",
    slug: "shree-ragevendra-pattern-work",
    business_name: "Shree Ragevendra Pattern Work",
    description: "Pattern Work, CI, Aluminium, Dies work Job Work, VMC Machine. Expert in pattern making and foundry-related job work using CI, aluminium, and die materials.",
    category_slug: "cnc-machining",
    zone: "Bogarves",
    whatsapp: "9060692922",
    employee_count: "5+",
    machine_list: [{ name: "VMC Machine" }, { name: "Pattern Making Equipment" }],
  },
  {
    email: "raytechengineering0810@gmail.com",
    full_name: "Raytech Engineering",
    phone: "7204091658",
    slug: "raytech-engineering",
    business_name: "Raytech Engineering",
    description: "Tooling, Precision Work in all types of Material — MS, CI, Aluminium, Copper, Acrylic Sheet etc. Delivering high-precision tooling and machining solutions across diverse materials.",
    category_slug: "tool-room",
    zone: "Machhe KIADB",
    whatsapp: "7204091658",
    employee_count: "4+",
    machine_list: [{ name: "CNC Machine" }, { name: "Precision Tooling Equipment" }],
  },
  {
    email: "mangaiengg.bgm@gmail.com",
    full_name: "Mangai Engg",
    phone: "8792491226",
    slug: "mangai-engg",
    business_name: "Mangai Engg",
    description: "Turning Work. Specialized turning and CNC machining services for industrial components. Contact: Lakahan Sir — 8792491226.",
    category_slug: "lathe-works",
    zone: "Auto Nagar",
    whatsapp: "8792491226",
    employee_count: "4+",
    machine_list: [{ name: "Turning Machine" }, { name: "CNC Lathe" }],
  },
  {
    email: "yatrikhydraulics.bgm@gmail.com",
    full_name: "Yatrik Hydraulics",
    phone: "9986002200",
    slug: "yatrik-hydraulics",
    business_name: "Yatrik Hydraulics",
    description: "Hydraulic Fittings Manufacturer. Manufacturing and supplying high-quality hydraulic fittings for industrial and engineering applications.",
    category_slug: "hydraulic-repair",
    zone: "Udyambag",
    whatsapp: "9986002200",
    employee_count: "3+",
    machine_list: [{ name: "Hydraulic Fitting Manufacturing Equipment" }],
  },
  {
    email: "navsankalp.industries@gmail.com",
    full_name: "Navsankalp Industries",
    phone: "9731363853",
    slug: "navsankalp-industries",
    business_name: "Navsankalp Industries",
    description: "Turning, Milling, Grinding, Drilling. Comprehensive machining services covering turning, milling, grinding and drilling operations for industrial requirements.",
    category_slug: "cnc-machining",
    zone: "Gokul Road",
    whatsapp: "9731791499",
    employee_count: "8+",
    machine_list: [{ name: "Turning Machine" }, { name: "Milling Machine" }, { name: "Grinding Machine" }, { name: "Drilling Machine" }],
  },

  // GROUP 2: CONVENTIONAL WORK (LATHE, MILLING, GRINDING)
  {
    email: "nova.engg.solutions@gmail.com",
    full_name: "Nova Engineering Solutions",
    phone: "9738319787",
    slug: "nova-engineering-solutions",
    business_name: "Nova Engineering Solutions",
    description: "Conventional machining services: Milling, Squaring, Facing, and Slotting operations for precision engineering requirements.",
    category_slug: "lathe-works",
    zone: "Auto Nagar",
    whatsapp: "9738319787",
    employee_count: "4",
    machine_list: [{ name: "Milling Machine" }, { name: "Slotting Machine" }, { name: "Lathe Machine" }],
  },
  {
    email: "prasadambewadikar@gmail.com",
    full_name: "Shree Jagadamba Enterprises",
    phone: "9738450125",
    slug: "shree-jagadamba-enterprises",
    business_name: "Shree Jagadamba Enterprises",
    description: "Trusted engineering workshop specializing in Conventional Lathe Work and Drilling Work.\n\nLathe services: Turning, Facing, Threading, Shaft Machining, Bush & Sleeve Machining, Bore & Step Turning, Rework and Job Work, Industrial Component Machining.\n\nDrilling services: Hole Drilling, Tapping Work, Reaming Work, Multi-size Drilling.",
    category_slug: "lathe-works",
    zone: "Udyambag",
    whatsapp: "9738450125",
    employee_count: "5",
    machine_list: [{ name: "Conventional Lathe" }, { name: "Drilling Machine" }, { name: "Tapping Machine" }],
  },
  {
    email: "jaishreeengineering.bgm@gmail.com",
    full_name: "Jaishree Engineering Work",
    phone: "9900000012",
    slug: "jaishree-engineering-work",
    business_name: "Jaishree Engineering Work",
    description: "Hydraulic Work and Radial Drilling Work. Providing specialized hydraulic servicing and precision radial drilling for various engineering applications.",
    category_slug: "hydraulic-repair",
    zone: "Machhe KIADB",
    whatsapp: "9900000012",
    employee_count: "2",
    machine_list: [{ name: "Radial Drilling Machine" }, { name: "Hydraulic Equipment" }],
  },
  {
    email: "dvsaaryantools.bgm@gmail.com",
    full_name: "DVS Aaryan Tools",
    phone: "9900000013",
    slug: "dvs-aaryan-tools",
    business_name: "DVS Aaryan Tools",
    description: "Tool and Cutter Drill, Tap and Mill Resharpening and all types of Gauges Manufacturing. Precision tool reconditioning and gauge manufacturing services.",
    category_slug: "tool-room",
    zone: "Auto Nagar",
    whatsapp: "9900000013",
    employee_count: "2",
    machine_list: [{ name: "Tool Grinding Machine" }, { name: "Gauge Manufacturing Equipment" }],
  },
  {
    email: "mechlineindustries.bgm@gmail.com",
    full_name: "Mech-Line Industries",
    phone: "9900000014",
    slug: "mech-line-industries",
    business_name: "Mech-Line Industries",
    description: "Milling Operation Work like Slotting, Keyway, Squaring Etc. Precision milling services for industrial components including slotting and keyway cutting.",
    category_slug: "lathe-works",
    zone: "Gokul Road",
    whatsapp: "9900000014",
    employee_count: "3",
    machine_list: [{ name: "Milling Machine" }, { name: "Slotting Machine" }],
  },
  {
    email: "patilengineering.bgm@gmail.com",
    full_name: "Patil Engineering",
    phone: "9008623403",
    slug: "patil-engineering",
    business_name: "Patil Engineering",
    description: "Turning, Pulley Specialist, Motor Body Machining Work. Expert machining for pulleys and motor bodies with precision turning capabilities. Contact: Namdev Mohite Patil.",
    category_slug: "lathe-works",
    zone: "Shahapur",
    whatsapp: "9008623403",
    employee_count: "4",
    machine_list: [{ name: "Lathe Machine" }, { name: "Pulley Machining Equipment" }],
  },

  // GROUP 3: HEAVY FABRICATION AND CNC WORK
  {
    email: "contact@omneity.in",
    full_name: "Omneity Group",
    phone: "7676929797",
    slug: "omneity-group",
    business_name: "Omneity Group",
    description: "Road Safety and Water Treatment work. Specializing in fabrication and engineering solutions for road safety equipment and water treatment infrastructure.",
    category_slug: "welding-fabrication",
    zone: "Udyambag",
    whatsapp: "7676929797",
    employee_count: "26",
    machine_list: [{ name: "Fabrication Equipment" }, { name: "Welding Machine" }],
  },
  {
    email: "shreemaruti.fabrication@gmail.com",
    full_name: "Shree Maruti Fabrication",
    phone: "9036108746",
    slug: "shree-maruti-fabrication",
    business_name: "Shree Maruti Fabrication",
    description: "Trusted and quality-focused fabrication service provider specializing in industrial rework and welding solutions.\n\nServices:\n• CI Casting Defects Rework\n• Foundry Machinery Rework Welding\n• Heavy & Light Fabrication Work\n• Industrial Welding Services\n• Machine Structure Repair & Modification\n• General Engineering Fabrication Work",
    category_slug: "welding-fabrication",
    zone: "Machhe KIADB",
    whatsapp: "9036108746",
    employee_count: "4",
    machine_list: [{ name: "MIG Welding Machine" }, { name: "ARC Welding Machine" }, { name: "Fabrication Equipment" }],
  },
  {
    email: "patilindustries.bgm@gmail.com",
    full_name: "Patil Industries",
    phone: "9449142757",
    slug: "patil-industries",
    business_name: "Patil Industries",
    description: "Professional welding and industrial rework service provider specializing in ARC Welding and TIG Welding.\n\nServices:\n• Gear Teeth Rework Welding\n• Casting Pump Casing Repair\n• Shaft Rebuilding\n• Crack Filling & Hard Facing\n• Industrial Machinery Reconditioning\n• CI Casting Defects Rework\n• SS & MS Fabrication Welding\n\nServing Sugar Industries, Cement Industries, Foundries, and Engineering Units.",
    category_slug: "welding-fabrication",
    zone: "Udyambag",
    whatsapp: "9449142757",
    employee_count: "3",
    machine_list: [{ name: "ARC Welding Machine" }, { name: "TIG Welding Machine" }],
  },

  // GROUP 4: INDUSTRIAL MACHINE SERVICE PROVIDERS
  {
    email: "karveiindustries5@gmail.com",
    full_name: "Kavari Industries",
    phone: "9448420887",
    slug: "kavari-industries",
    business_name: "Kavari Industries",
    description: "Motor Repair and Rewinding up to 300Hp. Expert motor repair and rewinding services for industrial motors up to 300 horsepower. Contact: Vinod.",
    category_slug: "motor-rewinding",
    zone: "Udyambag",
    whatsapp: "9448420887",
    employee_count: "2",
    full_address: "Udyambag, Belagavi",
    machine_list: [{ name: "Motor Rewinding Equipment" }, { name: "Motor Testing Bench" }],
  },
  {
    email: "weldgroup.bgm@gmail.com",
    full_name: "Weld Group",
    phone: "7353082414",
    slug: "weld-group",
    business_name: "Weld Group",
    description: "Trusted service provider for repair, maintenance, and sales of all types of welding machines and hand power tools.\n\nWelding machines serviced: ARC, MIG, TIG, Inverter, and Industrial Welding Equipment — PCB repair, coil rewinding, spare replacement, performance testing.\n\nPower tools serviced: Grinding Machines, Cut-Off Machines, Drilling Machines, Polishing Machines, Marble Cutters.",
    category_slug: "welding-fabrication",
    zone: "Gokul Road",
    whatsapp: "7353082414",
    employee_count: "4",
    machine_list: [{ name: "Welding Machine Service Equipment" }, { name: "Power Tool Service Equipment" }],
  },
  {
    email: "kishanservices.bgm@gmail.com",
    full_name: "Kishan Services",
    phone: "7026081773",
    slug: "kishan-services",
    business_name: "Kishan Services",
    description: "Air Compressor Service and Trader. Also provides Turning, Pulley Specialist, Motor Body Machining Work. Comprehensive compressor servicing combined with precision machining.",
    category_slug: "motor-rewinding",
    zone: "Bogarves",
    whatsapp: "7026081773",
    employee_count: "2",
    machine_list: [{ name: "Air Compressor" }, { name: "Lathe Machine" }],
  },

  // GROUP 5: INDUSTRIAL MACHINE AND SPARES TRADERS
  {
    email: "vijaysales2525@hotmail.com",
    full_name: "Vijay Sales",
    phone: "9483315977",
    slug: "vijay-sales",
    business_name: "Vijay Sales",
    description: "All types of Industrial Hardware item Trader. Supplying a comprehensive range of industrial hardware items, tools, and accessories for engineering and manufacturing applications.",
    category_slug: "spare-parts",
    zone: "Auto Nagar",
    whatsapp: "9483315977",
    employee_count: "3",
    machine_list: [],
  },
  {
    email: "kshiprabgm@gmail.com",
    full_name: "Kshipra Engineering",
    phone: "9449915973",
    slug: "kshipra-engineering",
    business_name: "Kshipra Engineering",
    description: "Authorised Dealer for Nucor Welding, Ador Welding, and Traders of Welding Machines and Spares. Trusted source for welding consumables, machines, and spare parts from leading brands.",
    category_slug: "spare-parts",
    zone: "Udyambag",
    whatsapp: "9449915973",
    employee_count: "2",
    machine_list: [],
  },

  // GROUP 6: LASER CUTTING AND PUNCHING
  // (Mangale Lasertech already covered above — same company, entry #2)
  {
    email: "jinacast.bgm@gmail.com",
    full_name: "Jinacast",
    phone: "9110498300",
    slug: "jinacast",
    business_name: "Jinacast",
    description: "Laser Cutting Work. Precision laser cutting services for industrial sheet metal components and custom fabrication requirements.",
    category_slug: "steel-cutting",
    zone: "Machhe KIADB",
    whatsapp: "9110498300",
    employee_count: "3",
    machine_list: [{ name: "Laser Cutting Machine" }],
  },
];

// =============================================================================
// HELPER: Create an auth user via Supabase Admin API
// =============================================================================
async function createAuthUser(email, password, fullName, phone, role) {
  const res = await fetch(`${PROJECT_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        role,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    // If user already exists, try to fetch them
    if (data.msg?.includes("already been registered") || data.message?.includes("already")) {
      return getUserByEmail(email);
    }
    throw new Error(`Failed to create user ${email}: ${JSON.stringify(data)}`);
  }
  return data;
}

// =============================================================================
// HELPER: Fetch a user by email (if already exists)
// =============================================================================
async function getUserByEmail(email) {
  const res = await fetch(
    `${PROJECT_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    { headers: adminHeaders }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`Failed to fetch user ${email}: ${JSON.stringify(data)}`);
  // API returns { users: [...] }
  const users = data.users || [];
  const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error(`User ${email} not found after creation`);
  return user;
}

// =============================================================================
// HELPER: Fetch category ID by slug via REST API
// =============================================================================
async function getCategoryId(slug) {
  const res = await fetch(
    `${PROJECT_URL}/rest/v1/categories?slug=eq.${encodeURIComponent(slug)}&select=id`,
    { headers: adminHeaders }
  );
  const data = await res.json();
  if (!res.ok || !data.length) {
    console.warn(`  ⚠️  Category slug "${slug}" not found, using null`);
    return null;
  }
  return data[0].id;
}

// =============================================================================
// HELPER: Upsert vendor row
// =============================================================================
async function upsertVendor(userId, vendor, categoryId) {
  const body = {
    user_id: userId,
    business_name: vendor.business_name,
    slug: vendor.slug,
    description: vendor.description,
    category_id: categoryId,
    zone: vendor.zone,
    phone: vendor.phone,
    whatsapp: vendor.whatsapp || vendor.phone,
    email: vendor.email,
    employee_count: vendor.employee_count,
    machine_list: vendor.machine_list,
    subscription_plan: "free",
    is_verified: false,
    is_active: true,
    ...(vendor.full_address ? { full_address: vendor.full_address } : {}),
  };

  const res = await fetch(
    `${PROJECT_URL}/rest/v1/vendors?slug=eq.${encodeURIComponent(vendor.slug)}`,
    {
      method: "PATCH",
      headers: { ...adminHeaders, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(body),
    }
  );

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  // If PATCH returned empty array (no matching row), INSERT instead
  if (res.ok && Array.isArray(data) && data.length === 0) {
    const insertRes = await fetch(`${PROJECT_URL}/rest/v1/vendors`, {
      method: "POST",
      headers: { ...adminHeaders, Prefer: "return=representation" },
      body: JSON.stringify(body),
    });
    const insertText = await insertRes.text();
    let insertData;
    try { insertData = JSON.parse(insertText); } catch { insertData = insertText; }
    if (!insertRes.ok) throw new Error(`Insert failed for ${vendor.slug}: ${insertText}`);
    return Array.isArray(insertData) ? insertData[0] : insertData;
  }

  if (!res.ok) throw new Error(`Upsert failed for ${vendor.slug}: ${text}`);
  return Array.isArray(data) ? data[0] : data;
}

// =============================================================================
// HELPER: Upsert profile
// =============================================================================
async function upsertProfile(userId, vendor) {
  const body = {
    id: userId,
    full_name: vendor.full_name,
    email: vendor.email,
    phone: vendor.phone,
    whatsapp_number: vendor.whatsapp || vendor.phone,
  };

  const res = await fetch(`${PROJECT_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...adminHeaders, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    // If not found, insert
    const insertRes = await fetch(`${PROJECT_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: { ...adminHeaders, Prefer: "return=representation" },
      body: JSON.stringify(body),
    });
    if (!insertRes.ok) {
      const insertText = await insertRes.text();
      throw new Error(`Profile upsert failed for ${userId}: ${insertText}`);
    }
  }
}

// =============================================================================
// HELPER: Assign vendor role
// =============================================================================
async function assignVendorRole(userId) {
  const res = await fetch(`${PROJECT_URL}/rest/v1/user_roles`, {
    method: "POST",
    headers: { ...adminHeaders, Prefer: "resolution=ignore-duplicates" },
    body: JSON.stringify({ user_id: userId, role: "vendor" }),
  });
  // Ignore conflicts (already has role)
}

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  console.log("🚀 Starting vendor user creation...\n");

  // Pre-cache category IDs
  const categorySlugs = [...new Set(VENDORS.map((v) => v.category_slug))];
  const categoryMap = {};
  for (const slug of categorySlugs) {
    categoryMap[slug] = await getCategoryId(slug);
  }

  const results = [];
  for (const vendor of VENDORS) {
    process.stdout.write(`⏳ Processing: ${vendor.business_name} (${vendor.email})...`);

    try {
      // 1. Create auth user
      const user = await createAuthUser(vendor.email, PASSWORD, vendor.full_name, vendor.phone, "vendor");
      const userId = user.id;

      // 2. Ensure profile exists
      await upsertProfile(userId, vendor);

      // 3. Assign vendor role
      await assignVendorRole(userId);

      // 4. Upsert vendor record
      const categoryId = categoryMap[vendor.category_slug];
      await upsertVendor(userId, vendor, categoryId);

      console.log(` ✅ Done (uid: ${userId})`);
      results.push({ business: vendor.business_name, email: vendor.email, status: "✅ Created", userId });
    } catch (err) {
      console.log(` ❌ Error`);
      console.error(`   → ${err.message}`);
      results.push({ business: vendor.business_name, email: vendor.email, status: `❌ ${err.message}` });
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n=============================================================");
  console.log("📋 SUMMARY");
  console.log("=============================================================");
  for (const r of results) {
    console.log(`${r.status}  ${r.business.padEnd(35)} | ${r.email}`);
  }

  const success = results.filter((r) => r.status.startsWith("✅")).length;
  const fail = results.filter((r) => r.status.startsWith("❌")).length;
  console.log(`\n✅ ${success} vendors created  |  ❌ ${fail} failed`);
  console.log("\n🔑 Login password for all vendors: 123456");
}

main().catch(console.error);
