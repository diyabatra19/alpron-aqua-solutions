-- Client-provided business card and April 2026 letterhead corroborate the
-- public contact details below. Private proposal/customer/commercial data is
-- intentionally excluded. ISO and legal-identity claims remain unpublished.

update public.site_settings
set
  brand_name = 'Alpron Aqua Solutions',
  default_seo_title = 'Alpron Aqua Solutions | RO & Water Treatment Solutions',
  default_seo_description = 'Explore domestic and commercial RO systems, water purifiers, industrial water softeners and water-treatment solutions from Alpron Aqua Solutions.',
  hero_title = 'Water purification and treatment solutions for practical requirements.',
  hero_description = 'Explore domestic and commercial RO systems, water purifiers, purifier bodies, filters and industrial water-treatment capabilities, then request a confirmed quotation.',
  about_title = 'Water-treatment capability backed by client-provided project material.',
  about_summary = 'Alpron Aqua Solutions works with domestic and commercial RO systems, water purifiers, industrial water softeners, purifier bodies, filters, and cooling- and boiler-water treatment chemicals. Product configuration, price, availability and delivery are confirmed by quotation.',
  why_choose_intro = 'Direct contact details, a source-backed catalogue and requirement-led quotations help customers discuss the right water-purification or treatment requirement without invented prices or claims.',
  contact_intro = 'Contact the team directly or send a product and quotation enquiry with your city, quantity and intended water-treatment requirement.',
  cta_title = 'Discuss a purifier, softener or water-treatment requirement.',
  cta_description = 'Share the application, quantity and delivery city. Alpron Aqua Solutions will confirm the suitable configuration, price, availability and delivery.',
  updated_at = now()
where id = true;

update public.pages
set
  content = '{"type":"doc","content":[{"type":"paragraph","text":"Alpron Aqua Solutions works with domestic and commercial RO systems, water purifiers, purifier bodies, water filters and industrial water softeners."},{"type":"paragraph","text":"Client-provided project material also supports experience with requirement-specific water softening and cooling- and boiler-water treatment chemicals. Product configuration, performance, price, availability, delivery and payment terms are confirmed for each enquiry."},{"type":"paragraph","text":"The business uses a corporate office in Dilshad Garden, Delhi and lists a regional office in Raipur. Legal identity, registration details and certification claims are published only after current documentary verification."}]}'::jsonb,
  seo_title = 'About Alpron Aqua Solutions',
  seo_description = 'Learn about Alpron Aqua Solutions and its domestic, commercial and industrial water-treatment capabilities.',
  updated_at = now()
where slug = 'about';

insert into public.business_facts (
  fact_key,
  label,
  fact_value,
  verification_status,
  public_visible,
  source_url,
  verified_at
)
values
  ('primary_logo_url', 'Primary logo URL', '/assets/brand/alpron-logo-horizontal-transparent.png', 'verified', true, null, now()),
  ('compact_logo_url', 'Compact logo URL', '/assets/brand/alpron-logo-mark-transparent.png', 'verified', true, null, now()),
  ('contact_person', 'Contact person', 'S.H. Khan', 'verified', true, null, now()),
  ('telephone', 'Business landline', '011-23363216', 'verified', true, null, now()),
  ('phone', 'Primary mobile number', '9717459519', 'verified', true, null, now()),
  ('phone_secondary', 'Additional mobile number', '8802242582', 'verified', true, null, now()),
  ('email', 'Business email', 'sanjarhassankhan@gmail.com', 'verified', true, null, now()),
  ('address', 'Corporate office', 'M-20/A-4, Dilshad Garden, Delhi-110095', 'verified', true, null, now()),
  ('corporate_office', 'Corporate office', 'M-20/A-4, Dilshad Garden, Delhi-110095', 'verified', true, null, now()),
  ('regional_office', 'Regional office', 'MIG (S)-189, Kabir Nagar, Hira Pur, Raipur (C.G.)', 'verified', true, null, now()),
  ('website', 'Existing website', 'https://www.alpronaqua.com', 'verified', true, null, now()),
  ('map_embed_url', 'Corporate office map embed URL', 'https://www.google.com/maps?q=M-20%2FA-4%2C%20Dilshad%20Garden%2C%20Delhi-110095&output=embed', 'verified', true, null, now()),
  ('directions_url', 'Corporate office directions URL', 'https://www.google.com/maps/dir/?api=1&destination=M-20%2FA-4%2C%20Dilshad%20Garden%2C%20Delhi-110095', 'verified', true, null, now()),
  ('business_capabilities', 'Water-treatment capabilities', 'Domestic and commercial RO systems, water purifiers, industrial water softeners, purifier bodies, water filters, and cooling- and boiler-water treatment chemicals', 'verified', true, null, now())
on conflict (fact_key) do update
set
  label = excluded.label,
  fact_value = excluded.fact_value,
  verification_status = excluded.verification_status,
  public_visible = excluded.public_visible,
  source_url = excluded.source_url,
  verified_at = excluded.verified_at,
  updated_at = now();

-- A mobile number is not treated as WhatsApp without explicit confirmation.
update public.business_facts
set
  fact_value = null,
  verification_status = 'unverified',
  public_visible = false,
  verified_at = null,
  verified_by = null,
  updated_at = now()
where fact_key = 'whatsapp';

-- Directory hours and the Sahibabad locality may not apply to the verified
-- Dilshad Garden corporate office. Keep the researched values for admin review
-- but do not combine them with the client-provided corporate location.
update public.business_facts
set
  verification_status = 'unverified',
  public_visible = false,
  verified_at = null,
  verified_by = null,
  updated_at = now()
where fact_key in ('business_hours', 'service_area');
