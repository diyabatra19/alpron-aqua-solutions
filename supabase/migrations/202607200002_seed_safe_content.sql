insert into public.categories (name, slug, description, image_alt, display_order, status, seo_title, seo_description)
values
  ('RO Water Purifiers', 'ro-water-purifiers', 'Explore RO water purifier options after product details are verified and published.', 'RO water purifier category placeholder awaiting approved product photography', 10, 'published', 'RO Water Purifiers | Alpron Aqua Solutions', 'Browse published RO water purifier options from Alpron Aqua Solutions.'),
  ('RO Water Purifier Bodies', 'ro-water-purifier-bodies', 'Purifier body options will appear here after models and specifications are confirmed.', 'RO water purifier body category placeholder awaiting approved product photography', 20, 'published', 'RO Water Purifier Bodies | Alpron Aqua Solutions', 'Browse published RO water purifier body options from Alpron Aqua Solutions.'),
  ('Water Filters', 'water-filters', 'Water filter products will appear here after specifications are approved.', 'Water filter category placeholder awaiting approved product photography', 30, 'published', 'Water Filters | Alpron Aqua Solutions', 'Browse published water filter options from Alpron Aqua Solutions.')
on conflict (slug) do nothing;

insert into public.pages (slug, title, content, status, seo_title, seo_description, published_at)
values
  ('home', 'Home', '{"type":"doc","content":[{"type":"paragraph","text":"RO water purifiers, purifier bodies and water filters for customer and trade enquiries across Delhi/NCR."}]}'::jsonb, 'published', 'Alpron Aqua Solutions | RO Water Purifiers & Filters', 'Explore RO water purifiers, purifier bodies and water filters from Alpron Aqua Solutions in Delhi/NCR.', now()),
  ('about', 'About Alpron Aqua Solutions', '{"type":"doc","content":[{"type":"paragraph","text":"Alpron Aqua Solutions serves enquiries for RO water purification products and components. Legal and operational details will be added after client verification."}]}'::jsonb, 'published', 'About Alpron Aqua Solutions', 'Learn about Alpron Aqua Solutions and its RO water purification product categories.', now()),
  ('privacy-policy', 'Privacy Policy', '{"type":"doc","content":[{"type":"paragraph","text":"This website collects information submitted through quotation and contact forms to respond to enquiries. Final legal text requires client review before launch."}]}'::jsonb, 'published', 'Privacy Policy | Alpron Aqua Solutions', 'Read the website privacy information for Alpron Aqua Solutions.', now()),
  ('terms', 'Terms of Use', '{"type":"doc","content":[{"type":"paragraph","text":"Product details and availability are subject to confirmation through a formal quotation. Final legal terms require client review before launch."}]}'::jsonb, 'published', 'Terms of Use | Alpron Aqua Solutions', 'Read the website terms of use for Alpron Aqua Solutions.', now())
on conflict (slug) do nothing;

insert into public.site_settings (
  id, brand_name, default_seo_title, default_seo_description, hero_title, hero_description
) values (
  true,
  'Alpron Aqua Solutions',
  'Alpron Aqua Solutions | RO Water Purifiers & Filters',
  'RO water purifier products, purifier bodies and water filters for enquiries across Delhi/NCR.',
  'Water purification products, presented with clarity.',
  'Explore RO water purifiers, purifier bodies and water filters, then request a quotation for confirmed product details.'
) on conflict (id) do nothing;

insert into public.business_facts (fact_key, label, fact_value, verification_status, public_visible, source_url)
values
  ('legal_name', 'Legal name', null, 'unverified', false, null),
  ('proprietor', 'Proprietor', 'Mr. Sanjar Hussan Khan', 'unverified', false, 'https://www.tradeindia.com/alpron-aqua-solutions-33057429/'),
  ('gst_number', 'GST number', '07ANLPK6376P1Z3', 'unverified', false, 'https://www.tradeindia.com/alpron-aqua-solutions-33057429/'),
  ('address', 'Business address', 'M/20/4A, Ground Floor, Dilshad Garden, Delhi 110095', 'unverified', false, 'https://www.tradeindia.com/alpron-aqua-solutions-33057429/'),
  ('phone', 'Phone number', null, 'unverified', false, null),
  ('whatsapp', 'WhatsApp number', null, 'unverified', false, null),
  ('email', 'Email address', null, 'unverified', false, null),
  ('business_hours', 'Business hours', null, 'unverified', false, null)
on conflict (fact_key) do nothing;
