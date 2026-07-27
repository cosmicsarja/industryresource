-- =============================================================================
-- MIGRATION: Insert primary thumbnail photos for all 28 vendors
-- Uses Unsplash industrial photos matched to each vendor's description
-- Run in Supabase SQL Editor (bypasses RLS as superuser)
-- =============================================================================

INSERT INTO public.vendor_photos (vendor_id, photo_url, caption, is_primary, sort_order)
SELECT v.id, p.photo_url, p.caption, true, 0
FROM (VALUES
  -- CNC / VMC / Precision Machining
  ('vaibhav-engineering',            'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80', 'CNC VMC machining center with precision parts'),
  ('mangale-lasertech',              'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80', 'Laser cutting machine sparks in operation'),
  ('infinity-industries',            'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80', 'Industrial lathe turning metal component'),
  ('rajan-engineering',              'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&q=80', 'CNC turning and radial drilling operations'),
  ('shree-ragevendra-pattern-work',  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'Metal pattern work casting foundry'),
  ('raytech-engineering',            'https://images.unsplash.com/photo-1613909207039-6b173b755cc1?w=800&q=80', 'Precision tooling machining workshop'),
  ('mangai-engg',                    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80', 'Turning and CNC machining services'),
  ('navsankalp-industries',          'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80', 'Comprehensive machining services'),
  ('nova-engineering-solutions',     'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80', 'Milling squaring facing operations'),
  ('shree-jagadamba-enterprises',    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80', 'Conventional lathe and drilling workshop'),
  ('mech-line-industries',           'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80', 'Milling machine slotting and keyway cutting'),
  ('patil-engineering',              'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80', 'Motor body and pulley precision machining'),
  ('induservo',                      'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&q=80', 'CNC turning and heavy industry fabrication'),
  ('nova-engineering-solutions-7g3p','https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80', 'Engineering solutions precision machining'),

  -- Hydraulics
  ('yatrik-hydraulics',              'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80', 'Hydraulic fittings and industrial pipe systems'),
  ('jaishree-engineering-work',      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80', 'Hydraulic work and radial drilling equipment'),
  ('kishan-services',                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80', 'Industrial air compressor service and maintenance'),

  -- Fabrication & Welding
  ('omneity-group',                  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', 'Fabrication for road safety and water treatment'),
  ('shree-maruti-fabrication',       'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&q=80', 'Heavy fabrication CI casting rework and welding'),
  ('patil-industries',               'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', 'ARC and TIG welding operations gear rework'),
  ('weld-group',                     'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', 'Welding machine repair and power tools service'),
  ('kshipra-engineering',            'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&q=80', 'Authorized welding machine dealer and spares'),

  -- Laser Cutting
  ('jinacast',                       'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80', 'Precision laser cutting sheet metal fabrication'),

  -- Motor & Electrical
  ('kavari-industries',              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'Industrial motor repair and rewinding 300HP'),
  ('cosmic-works-5p8u',              'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&q=80', 'Electrical and electro engineering works'),

  -- Tools & Hardware Trading
  ('dvs-aaryan-tools',               'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'Precision cutting tools gauges resharpening'),
  ('vijay-sales',                    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80', 'Industrial hardware tools and accessories'),

  -- General / Unknown
  ('sun-enterprises-lxno',           'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80', 'Industrial engineering workshop')
) AS p(slug, photo_url, caption)
JOIN public.vendors v ON v.slug = p.slug
ON CONFLICT DO NOTHING;

-- Verify
SELECT v.business_name, vp.photo_url, vp.caption
FROM public.vendor_photos vp
JOIN public.vendors v ON v.id = vp.vendor_id
WHERE vp.is_primary = true
ORDER BY v.business_name;
