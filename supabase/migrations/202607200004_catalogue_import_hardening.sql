-- Harden the verified IndiaMART catalogue import for databases that already
-- ran the initial catalogue migration. No model numbers, prices, MOQs,
-- specifications or images are inferred: those fields remain null until the
-- client supplies and verifies them.

insert into public.categories (
  name, slug, description, image_alt, display_order, status,
  seo_title, seo_description
)
values
  (
    'RO Water Purifiers',
    'ro-water-purifiers',
    'RO water purifier products listed for household and supply enquiries. Configuration and pricing are confirmed by quotation.',
    'RO water purifier category image awaiting approved client photography',
    10, 'published',
    'RO Water Purifiers | Alpron Aqua Solutions',
    'Browse seller-listed RO water purifier products and request a confirmed quotation.'
  ),
  (
    'RO Water Purifier Bodies',
    'ro-water-purifier-bodies',
    'RO water purifier body options listed for component and trade requirements. Model details are confirmed before supply.',
    'RO water purifier body category image awaiting approved client photography',
    20, 'published',
    'RO Water Purifier Bodies | Alpron Aqua Solutions',
    'Browse seller-listed RO water purifier body options and request a confirmed quotation.'
  ),
  (
    'Water Filters',
    'water-filters',
    'Water filter products listed for customer and supply enquiries. Application and specifications are confirmed for each quotation.',
    'Water filter category image awaiting approved client photography',
    30, 'published',
    'Water Filters | Alpron Aqua Solutions',
    'Browse seller-listed water filters and request application, availability and pricing details.'
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_alt = excluded.image_alt,
  display_order = excluded.display_order,
  status = excluded.status,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();

with catalogue (name, slug, category_slug, short_description, full_description, featured, display_order) as (
  values
    (
      'Reverse Osmosis Water Purifiers',
      'reverse-osmosis-water-purifiers',
      'ro-water-purifiers',
      'Reverse osmosis water purifier options listed on the Alpron Aqua Solutions seller catalogue.',
      '{"type":"doc","content":[{"type":"paragraph","text":"Reverse osmosis water purifiers are listed on the Alpron Aqua Solutions IndiaMART seller catalogue."},{"type":"paragraph","text":"Model, configuration, availability, price, minimum order and installation details are confirmed for each enquiry before supply."}]}'::jsonb,
      true, 10
    ),
    (
      'Domestic Reverse Osmosis System',
      'domestic-reverse-osmosis-system',
      'ro-water-purifiers',
      'Domestic reverse osmosis system listed for household product enquiries and quotation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"A domestic reverse osmosis system appears on the Alpron Aqua Solutions seller catalogue."},{"type":"paragraph","text":"The applicable configuration, capacity, availability, installation requirements and price are confirmed after the requirement is shared."}]}'::jsonb,
      true, 20
    ),
    (
      'Aquafresh RO Water Purifiers',
      'aquafresh-ro-water-purifiers',
      'ro-water-purifiers',
      'Aquafresh RO water purifier products shown on the Alpron Aqua Solutions seller listing.',
      '{"type":"doc","content":[{"type":"paragraph","text":"Aquafresh RO water purifiers appear on the Alpron Aqua Solutions IndiaMART seller catalogue."},{"type":"paragraph","text":"The exact model, brand authorization, specifications, availability, price and installation details require confirmation before an order is agreed."}]}'::jsonb,
      false, 30
    ),
    (
      'Aquafresh Water Purifiers',
      'aquafresh-water-purifiers',
      'ro-water-purifiers',
      'Aquafresh water purifier products shown on the Alpron Aqua Solutions seller listing.',
      '{"type":"doc","content":[{"type":"paragraph","text":"Aquafresh water purifiers appear on the Alpron Aqua Solutions IndiaMART seller catalogue."},{"type":"paragraph","text":"The exact model, brand authorization, purification configuration, availability and price require confirmation before supply."}]}'::jsonb,
      false, 40
    ),
    (
      'RO Water Purifier Body',
      'ro-water-purifier-body',
      'ro-water-purifier-bodies',
      'RO water purifier body option listed for component and supply enquiries.',
      '{"type":"doc","content":[{"type":"paragraph","text":"An RO water purifier body is listed by Alpron Aqua Solutions for component and supply enquiries."},{"type":"paragraph","text":"Body design, dimensions, compatibility, colour, order quantity, availability and price are confirmed before supply."}]}'::jsonb,
      true, 50
    ),
    (
      'Water Filter',
      'water-filter',
      'water-filters',
      'Water filter product listed by Alpron Aqua Solutions for customer and supply enquiries.',
      '{"type":"doc","content":[{"type":"paragraph","text":"A water filter product is listed by Alpron Aqua Solutions for customer and supply enquiries."},{"type":"paragraph","text":"Filter type, intended application, dimensions, replacement requirements, availability and price are confirmed for the requested use."}]}'::jsonb,
      true, 60
    )
)
insert into public.products (
  name, slug, category_id, short_description, full_description,
  price_paise, show_price, currency, minimum_order_quantity,
  minimum_order_unit, availability, featured, display_order, status,
  seo_title, seo_description, source_url, verification_status,
  verified_at, published_at
)
select
  c.name,
  c.slug,
  cat.id,
  c.short_description,
  c.full_description,
  null,
  false,
  'INR',
  null,
  null,
  'contact_for_availability',
  c.featured,
  c.display_order,
  'published',
  c.name || ' | Alpron Aqua Solutions',
  'Request current model, specification, availability and price details for ' || lower(c.name) || '.',
  'https://www.indiamart.com/alpron-aqua-solution/',
  'verified',
  coalesce(p.verified_at, now()),
  coalesce(p.published_at, now())
from catalogue c
join public.categories cat on cat.slug = c.category_slug
left join public.products p on p.slug = c.slug
on conflict (slug) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  show_price = false,
  price_paise = null,
  currency = 'INR',
  minimum_order_quantity = null,
  minimum_order_unit = null,
  availability = 'contact_for_availability',
  featured = excluded.featured,
  display_order = excluded.display_order,
  status = 'published',
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  source_url = excluded.source_url,
  verification_status = 'verified',
  verified_at = coalesce(products.verified_at, excluded.verified_at),
  published_at = coalesce(products.published_at, excluded.published_at),
  updated_at = now();

-- Additional seller-listed IndiaMART entries. These remain drafts because the
-- source exposes duplicate listings, a possible spelling error, or no owned
-- technical specification sheet. They are retained for client review rather
-- than silently dropped or presented as confirmed models.
with additional_catalogue (name, slug, category_slug, short_description, full_description, sku, display_order) as (
  values
    (
      'Domestic Reverse Osmosis System',
      'domestic-reverse-osmosis-system-19587029473',
      'ro-water-purifiers',
      'Additional domestic reverse osmosis system listing found on the Alpron Aqua Solutions IndiaMART catalogue; model identity requires confirmation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"This additional domestic reverse osmosis system listing was found on the Alpron Aqua Solutions IndiaMART seller catalogue."},{"type":"paragraph","text":"The listing is retained as an unpublished draft until the client confirms the model, configuration, availability and image permission."}]}'::jsonb,
      'IM-19587029473', 70
    ),
    (
      'RO Water Purifier Body',
      'ro-water-purifier-body-19587035012',
      'ro-water-purifier-bodies',
      'Additional RO water purifier body listing found on the Alpron Aqua Solutions IndiaMART catalogue; dimensions and model require confirmation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"This additional RO water purifier body listing was found on the Alpron Aqua Solutions IndiaMART seller catalogue."},{"type":"paragraph","text":"Dimensions, compatibility, colour, availability and image permission require client confirmation before publication."}]}'::jsonb,
      'IM-19587035012', 80
    ),
    (
      'RO Water Purifier Body',
      'ro-water-purifier-body-19587018355',
      'ro-water-purifier-bodies',
      'Additional RO water purifier body listing found on the Alpron Aqua Solutions IndiaMART catalogue; dimensions and model require confirmation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"This additional RO water purifier body listing was found on the Alpron Aqua Solutions IndiaMART seller catalogue."},{"type":"paragraph","text":"Dimensions, compatibility, colour, availability and image permission require client confirmation before publication."}]}'::jsonb,
      'IM-19587018355', 90
    ),
    (
      'Dual Media Filter',
      'dual-media-filter',
      'water-filters',
      'Dual media filter listing found on the Alpron Aqua Solutions IndiaMART catalogue; application and specifications require confirmation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"A Dual Media Filter listing appears on the Alpron Aqua Solutions IndiaMART seller catalogue."},{"type":"paragraph","text":"The application, dimensions, media configuration, availability and price must be confirmed before publication."}]}'::jsonb,
      'IM-3613350148', 100
    ),
    (
      'Pressser Sand Filter',
      'pressser-sand-filter',
      'water-filters',
      'Source-listed “Pressser Sand Filter”; spelling and product specifications require client confirmation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"The IndiaMART seller catalogue shows the name “Pressser Sand Filter”."},{"type":"paragraph","text":"The intended product name, application, specifications and availability require client confirmation before publication."}]}'::jsonb,
      'IM-3613350091', 110
    ),
    (
      'Water Fitler',
      'water-fitler',
      'water-filters',
      'Source-listed “Water Fitler”; spelling appears to be a typo and remains an unpublished draft pending confirmation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"The IndiaMART seller catalogue shows the name “Water Fitler”."},{"type":"paragraph","text":"The client must confirm whether this is a distinct product or a duplicate of Water Filter, and provide approved spelling and specifications."}]}'::jsonb,
      'IM-6141368133', 120
    ),
    (
      'Multigrade Filter',
      'multigrade-filter',
      'water-filters',
      'Multigrade filter listing found on the Alpron Aqua Solutions IndiaMART catalogue; application and specifications require confirmation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"A Multigrade Filter listing appears on the Alpron Aqua Solutions IndiaMART seller catalogue."},{"type":"paragraph","text":"The application, dimensions, media configuration, availability and price must be confirmed before publication."}]}'::jsonb,
      'IM-3613349988', 130
    )
)
insert into public.products (
  name, slug, sku, category_id, short_description, full_description,
  price_paise, show_price, currency, minimum_order_quantity,
  minimum_order_unit, availability, featured, display_order, status,
  seo_title, seo_description, source_url, verification_status
)
select
  c.name, c.slug, null, cat.id, c.short_description, c.full_description,
  null, false, 'INR', null, null, 'contact_for_availability', false,
  c.display_order, 'draft', c.name || ' | Alpron Aqua Solutions',
  'IndiaMART seller-listed draft requiring client confirmation: ' || lower(c.name) || '.',
  'https://www.indiamart.com/alpron-aqua-solution/', 'unverified'
from additional_catalogue c
join public.categories cat on cat.slug = c.category_slug
on conflict (slug) do update set
  name = excluded.name,
  sku = null,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  source_url = excluded.source_url,
  verification_status = 'unverified',
  updated_at = now();
