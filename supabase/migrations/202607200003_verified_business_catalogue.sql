-- Verified directory research and editable business catalogue.
-- This migration is intentionally idempotent for content upserts.

drop function if exists public.save_product(jsonb, jsonb, uuid[]);

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'availability_status_v2'
  ) then
    create type public.availability_status_v2 as enum (
      'contact_for_availability',
      'in_stock',
      'made_to_order',
      'out_of_stock',
      'discontinued'
    );
  end if;
end
$$;

alter table public.products alter column availability drop default;
alter table public.products
  alter column availability type public.availability_status_v2
  using availability::text::public.availability_status_v2;
drop type public.availability_status;
alter type public.availability_status_v2 rename to availability_status;
alter table public.products
  alter column availability set default 'contact_for_availability'::public.availability_status;

alter table public.products
  add column if not exists source_url text
    check (source_url is null or source_url ~ '^https?://'),
  add column if not exists verification_status public.verification_status not null default 'unverified',
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references auth.users(id);

alter table public.site_settings
  add column if not exists about_title text not null default 'Water purification products for practical requirements.',
  add column if not exists about_summary text not null default '',
  add column if not exists why_choose_intro text not null default '',
  add column if not exists ordering_intro text not null default '',
  add column if not exists ordering_process text not null default '',
  add column if not exists contact_intro text not null default '',
  add column if not exists cta_title text not null default 'Tell us what you need.',
  add column if not exists cta_description text not null default '';

create or replace function public.save_product(
  p_product jsonb,
  p_specifications jsonb default '[]'::jsonb,
  p_media_ids uuid[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product_id uuid;
  item jsonb;
  media_id uuid;
  media_alt text;
  item_order integer := 0;
begin
  if not private.is_admin(array['super_admin', 'content_editor']::public.admin_role[]) then
    raise exception 'Not authorized';
  end if;

  v_product_id := nullif(p_product->>'id', '')::uuid;
  if v_product_id is null then v_product_id := extensions.gen_random_uuid(); end if;

  insert into public.products (
    id, name, slug, sku, category_id, short_description, full_description,
    price_paise, show_price, currency, minimum_order_quantity, minimum_order_unit,
    availability, featured, display_order, status, seo_title, seo_description,
    canonical_url, source_url, verification_status, verified_at, verified_by,
    published_at
  ) values (
    v_product_id,
    p_product->>'name',
    p_product->>'slug',
    nullif(p_product->>'sku', ''),
    (p_product->>'category_id')::uuid,
    p_product->>'short_description',
    coalesce(p_product->'full_description', '{"type":"doc","content":[]}'::jsonb),
    nullif(p_product->>'price_paise', '')::bigint,
    coalesce((p_product->>'show_price')::boolean, false),
    coalesce(p_product->>'currency', 'INR'),
    nullif(p_product->>'minimum_order_quantity', '')::numeric,
    nullif(p_product->>'minimum_order_unit', ''),
    coalesce(
      (p_product->>'availability')::public.availability_status,
      'contact_for_availability'::public.availability_status
    ),
    coalesce((p_product->>'featured')::boolean, false),
    coalesce((p_product->>'display_order')::integer, 0),
    coalesce((p_product->>'status')::public.product_status, 'draft'),
    nullif(p_product->>'seo_title', ''),
    nullif(p_product->>'seo_description', ''),
    nullif(p_product->>'canonical_url', ''),
    nullif(p_product->>'source_url', ''),
    coalesce(
      (p_product->>'verification_status')::public.verification_status,
      'unverified'::public.verification_status
    ),
    case
      when p_product->>'verification_status' = 'verified' then
        coalesce(nullif(p_product->>'verified_at', '')::timestamptz, now())
      else null
    end,
    case
      when p_product->>'verification_status' = 'verified' then (select auth.uid())
      else null
    end,
    case
      when p_product->>'status' = 'published' then
        coalesce(nullif(p_product->>'published_at', '')::timestamptz, now())
      else null
    end
  )
  on conflict (id) do update set
    name = excluded.name,
    slug = excluded.slug,
    sku = excluded.sku,
    category_id = excluded.category_id,
    short_description = excluded.short_description,
    full_description = excluded.full_description,
    price_paise = excluded.price_paise,
    show_price = excluded.show_price,
    currency = excluded.currency,
    minimum_order_quantity = excluded.minimum_order_quantity,
    minimum_order_unit = excluded.minimum_order_unit,
    availability = excluded.availability,
    featured = excluded.featured,
    display_order = excluded.display_order,
    status = excluded.status,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    canonical_url = excluded.canonical_url,
    source_url = excluded.source_url,
    verification_status = excluded.verification_status,
    verified_at = excluded.verified_at,
    verified_by = excluded.verified_by,
    published_at = excluded.published_at,
    updated_at = now();

  delete from public.product_specifications where product_id = v_product_id;
  for item in select * from jsonb_array_elements(p_specifications)
  loop
    insert into public.product_specifications (
      product_id, specification_key, specification_value, display_order
    )
    values (
      v_product_id,
      item->>'key',
      item->>'value',
      coalesce((item->>'order')::integer, 0)
    );
  end loop;

  delete from public.product_images where product_id = v_product_id;
  foreach media_id in array p_media_ids
  loop
    select alt_text into media_alt from public.media_assets where id = media_id;
    if media_alt is not null then
      insert into public.product_images (
        product_id, media_asset_id, alt_text, display_order
      )
      values (v_product_id, media_id, media_alt, item_order);
      item_order := item_order + 1;
    end if;
  end loop;

  insert into public.audit_events (
    actor_id, event_type, entity_type, entity_id, metadata
  )
  values (
    (select auth.uid()),
    'product.saved',
    'product',
    v_product_id::text,
    jsonb_build_object(
      'status', p_product->>'status',
      'verification_status', p_product->>'verification_status'
    )
  );

  return v_product_id;
end;
$$;

revoke all on function public.save_product(jsonb, jsonb, uuid[]) from public, anon;
grant execute on function public.save_product(jsonb, jsonb, uuid[]) to authenticated;

drop policy if exists "Public reads published products" on public.products;
create policy "Public reads published products"
on public.products for select to anon, authenticated
using (
  (status = 'published' and verification_status = 'verified')
  or private.is_admin()
);

drop policy if exists "Public reads specifications for published products" on public.product_specifications;
create policy "Public reads specifications for published products"
on public.product_specifications for select to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_id
      and (
        (p.status = 'published' and p.verification_status = 'verified')
        or private.is_admin()
      )
  )
);

drop policy if exists "Public reads media used by published products" on public.media_assets;
create policy "Public reads media used by published products"
on public.media_assets for select to anon, authenticated
using (
  exists (
    select 1
    from public.product_images pi
    join public.products p on p.id = pi.product_id
    where pi.media_asset_id = media_assets.id
      and p.status = 'published'
      and p.verification_status = 'verified'
  )
  or private.is_admin()
);

drop policy if exists "Public reads images for published products" on public.product_images;
create policy "Public reads images for published products"
on public.product_images for select to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_id
      and (
        (p.status = 'published' and p.verification_status = 'verified')
        or private.is_admin()
      )
  )
);

update public.categories
set
  description = case slug
    when 'ro-water-purifiers' then 'RO water purifier options listed for household and supply enquiries. Configuration and pricing are confirmed by quotation.'
    when 'ro-water-purifier-bodies' then 'RO water purifier body options for product and trade requirements, with model details confirmed before supply.'
    when 'water-filters' then 'Water filter options listed for quotation, with application and specification details confirmed for each enquiry.'
    else description
  end,
  image_alt = case slug
    when 'ro-water-purifiers' then 'RO water purifier category illustration'
    when 'ro-water-purifier-bodies' then 'RO water purifier body category illustration'
    when 'water-filters' then 'Water filter category illustration'
    else image_alt
  end,
  updated_at = now()
where slug in ('ro-water-purifiers', 'ro-water-purifier-bodies', 'water-filters');

update public.site_settings
set
  brand_name = 'Alpron Aqua Solutions',
  default_seo_title = 'Alpron Aqua Solutions | RO Purifiers, Bodies & Filters',
  default_seo_description = 'Explore RO water purifiers, purifier bodies and water filters from Alpron Aqua Solutions and request a confirmed quotation.',
  hero_title = 'RO purification products for homes, trade and supply.',
  hero_description = 'Explore the product range, share your required quantity and receive confirmed pricing, availability, delivery and product details from Alpron Aqua Solutions.',
  about_title = 'A focused water-purification manufacturer and supplier.',
  about_summary = 'Alpron Aqua Solutions supplies RO water purifiers, RO water purifier bodies and water filters. The catalogue is designed for direct product and quotation enquiries, with prices and configurations confirmed before supply.',
  why_choose_intro = 'Clear product categories, direct quotation requests and careful publication of verified business information make it easier to discuss the right requirement.',
  ordering_intro = 'There is no online checkout. Every order begins with a product enquiry so price, configuration, quantity, delivery and payment can be confirmed.',
  ordering_process = E'Browse the published product range\nOpen the product that fits your requirement\nChoose Request a Quote or Get Latest Price\nEnter your contact details and required quantity\nSubmit the enquiry or use a verified WhatsApp contact\nThe team confirms price, availability, delivery and payment',
  contact_intro = 'Send a product or general quotation enquiry. Include your city, quantity and intended requirement so the team can respond with relevant details.',
  cta_title = 'Ready to discuss a purifier or supply requirement?',
  cta_description = 'Choose a product or send a general enquiry. Alpron Aqua Solutions will confirm the applicable configuration, price, availability and delivery.',
  updated_at = now()
where id = true;

update public.pages
set
  content = '{"type":"doc","content":[{"type":"paragraph","text":"Alpron Aqua Solutions is presented as a manufacturer and supplier of RO water purifiers, RO water purifier bodies and water filters. The business serves product and quotation enquiries through its published catalogue."},{"type":"paragraph","text":"Product configurations, availability, prices, delivery and payment terms are confirmed for each enquiry. Legal identity and registration details are published only after documentary client verification."}]}'::jsonb,
  seo_title = 'About Alpron Aqua Solutions',
  seo_description = 'Learn about Alpron Aqua Solutions, a manufacturer and supplier of RO purifier products, purifier bodies and water filters.',
  updated_at = now()
where slug = 'about';

insert into public.business_facts (
  fact_key, label, fact_value, verification_status, public_visible, source_url,
  verified_at
)
values
  (
    'business_type',
    'Business type',
    'Manufacturer and supplier',
    'verified',
    true,
    'https://www.tradeindia.com/alpron-aqua-solutions-33057429/',
    now()
  ),
  (
    'address',
    'Customer-facing address',
    '138, Vikram Enclave, Shalimar Garden, 80 Feet Road, Shalimar Garden Extension I, Sahibabad-201005, Uttar Pradesh',
    'verified',
    true,
    'https://www.justdial.com/Sahibabad/Alpron-Aqua-Solutions-Pvt-Ltd-Vikram-Enclave-Shalimar-Garden-Shalimar-Garden-Extension-I/011PXX11-XX11-110430122841-V1Q5_BZDET',
    now()
  ),
  (
    'registered_address',
    'Registered / seller address',
    'M/20/4A, Ground Floor, Dilshad Garden, Delhi, Delhi 110095, India',
    'unverified',
    false,
    'https://www.tradeindia.com/alpron-aqua-solutions-33057429/',
    null
  ),
  (
    'business_hours',
    'Business hours',
    'Monday-Saturday: 9:30 AM-6:30 PM; Sunday: Closed',
    'verified',
    true,
    'https://www.justdial.com/Sahibabad/Alpron-Aqua-Solutions-Pvt-Ltd-Vikram-Enclave-Shalimar-Garden-Shalimar-Garden-Extension-I/011PXX11-XX11-110430122841-V1Q5_BZDET',
    now()
  ),
  (
    'service_area',
    'Listed service area',
    'Shalimar Garden Extension I',
    'verified',
    true,
    'https://www.justdial.com/Sahibabad/Alpron-Aqua-Solutions-Pvt-Ltd-Vikram-Enclave-Shalimar-Garden-Shalimar-Garden-Extension-I/011PXX11-XX11-110430122841-V1Q5_BZDET',
    now()
  ),
  (
    'map_embed_url',
    'Google Maps embed URL',
    'https://www.google.com/maps?q=28.693021944444%2C77.338490833333&z=16&output=embed',
    'verified',
    true,
    'https://www.justdial.com/Sahibabad/Alpron-Aqua-Solutions-Pvt-Ltd-Vikram-Enclave-Shalimar-Garden-Shalimar-Garden-Extension-I/011PXX11-XX11-110430122841-V1Q5_BZDET',
    now()
  ),
  (
    'directions_url',
    'Google Maps directions URL',
    'https://www.google.com/maps/dir/?api=1&destination=28.693021944444%2C77.338490833333',
    'verified',
    true,
    'https://www.justdial.com/Sahibabad/Alpron-Aqua-Solutions-Pvt-Ltd-Vikram-Enclave-Shalimar-Garden-Shalimar-Garden-Extension-I/011PXX11-XX11-110430122841-V1Q5_BZDET',
    now()
  ),
  (
    'phone',
    'Direct phone number',
    null,
    'unverified',
    false,
    'https://www.justdial.com/Sahibabad/Alpron-Aqua-Solutions-Pvt-Ltd-Vikram-Enclave-Shalimar-Garden-Shalimar-Garden-Extension-I/011PXX11-XX11-110430122841-V1Q5_BZDET',
    null
  ),
  (
    'whatsapp',
    'WhatsApp number',
    null,
    'unverified',
    false,
    null,
    null
  ),
  (
    'email',
    'Email address',
    null,
    'unverified',
    false,
    null,
    null
  ),
  (
    'facebook_url',
    'Facebook URL',
    null,
    'unverified',
    false,
    null,
    null
  ),
  (
    'instagram_url',
    'Instagram URL',
    null,
    'unverified',
    false,
    null,
    null
  ),
  (
    'youtube_url',
    'YouTube URL',
    null,
    'unverified',
    false,
    null,
    null
  )
on conflict (fact_key) do update
set
  label = excluded.label,
  fact_value = case
    when business_facts.verification_status = 'verified'
      then business_facts.fact_value
    else excluded.fact_value
  end,
  verification_status = case
    when business_facts.verification_status = 'verified'
      then business_facts.verification_status
    else excluded.verification_status
  end,
  public_visible = case
    when business_facts.verification_status = 'verified'
      then business_facts.public_visible
    else excluded.public_visible
  end,
  source_url = coalesce(business_facts.source_url, excluded.source_url),
  verified_at = case
    when business_facts.verification_status = 'verified'
      then business_facts.verified_at
    else excluded.verified_at
  end,
  updated_at = now();

with catalogue (
  name, slug, category_slug, short_description, full_description,
  featured, display_order, seo_title, seo_description
) as (
  values
    (
      'Reverse Osmosis Water Purifiers',
      'reverse-osmosis-water-purifiers',
      'ro-water-purifiers',
      'RO water purifier options listed by Alpron Aqua Solutions, with configuration and price confirmed for each quotation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"This reverse osmosis water purifier range is listed by Alpron Aqua Solutions for product and supply enquiries."},{"type":"paragraph","text":"Purification stages, storage capacity, installation requirements, price, minimum order and current availability are confirmed before supply."}]}'::jsonb,
      true,
      10,
      'Reverse Osmosis Water Purifiers | Alpron Aqua Solutions',
      'Request a confirmed quotation for reverse osmosis water purifier options listed by Alpron Aqua Solutions.'
    ),
    (
      'Domestic Reverse Osmosis System',
      'domestic-reverse-osmosis-system',
      'ro-water-purifiers',
      'A domestic reverse osmosis system listed for household product enquiries and confirmed quotation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"This domestic reverse osmosis system is listed by Alpron Aqua Solutions for household water-purification enquiries."},{"type":"paragraph","text":"The applicable configuration, installation requirements, capacity, availability and price are confirmed after the customer shares the requirement."}]}'::jsonb,
      true,
      20,
      'Domestic Reverse Osmosis System | Alpron Aqua Solutions',
      'Enquire about a domestic reverse osmosis system and receive confirmed configuration, availability and pricing.'
    ),
    (
      'Aquafresh RO Water Purifiers',
      'aquafresh-ro-water-purifiers',
      'ro-water-purifiers',
      'Aquafresh RO water purifier products shown on the Alpron Aqua Solutions seller listing and available for quotation enquiries.',
      '{"type":"doc","content":[{"type":"paragraph","text":"Aquafresh RO water purifiers appear on the Alpron Aqua Solutions IndiaMART seller catalogue."},{"type":"paragraph","text":"Model, brand authorization, specifications, availability, price and installation details must be confirmed in the quotation before an order is agreed."}]}'::jsonb,
      false,
      30,
      'Aquafresh RO Water Purifiers | Alpron Aqua Solutions',
      'Request current model, specification, availability and price details for seller-listed Aquafresh RO water purifiers.'
    ),
    (
      'Aquafresh Water Purifiers',
      'aquafresh-water-purifiers',
      'ro-water-purifiers',
      'Aquafresh water purifier products shown on the Alpron Aqua Solutions seller listing and available for quotation enquiries.',
      '{"type":"doc","content":[{"type":"paragraph","text":"Aquafresh water purifiers appear on the Alpron Aqua Solutions IndiaMART seller catalogue."},{"type":"paragraph","text":"The exact model, brand authorization, purification configuration, availability and price are confirmed before supply."}]}'::jsonb,
      false,
      40,
      'Aquafresh Water Purifiers | Alpron Aqua Solutions',
      'Send an enquiry for current Aquafresh water purifier model, configuration, availability and pricing details.'
    ),
    (
      'RO Water Purifier Body',
      'ro-water-purifier-body',
      'ro-water-purifier-bodies',
      'An RO water purifier body option listed for product, component and supply enquiries.',
      '{"type":"doc","content":[{"type":"paragraph","text":"This RO water purifier body is listed by Alpron Aqua Solutions for component and supply enquiries."},{"type":"paragraph","text":"Body design, dimensions, compatibility, colour, order quantity, availability and price are confirmed before supply."}]}'::jsonb,
      true,
      50,
      'RO Water Purifier Body | Alpron Aqua Solutions',
      'Request confirmed dimensions, compatibility, availability and pricing for an RO water purifier body.'
    ),
    (
      'Water Filter',
      'water-filter',
      'water-filters',
      'A water filter product listed by Alpron Aqua Solutions, with application and specifications confirmed by quotation.',
      '{"type":"doc","content":[{"type":"paragraph","text":"This water filter product is listed by Alpron Aqua Solutions for customer and supply enquiries."},{"type":"paragraph","text":"Filter type, intended application, dimensions, replacement requirements, availability and price are confirmed for the requested use."}]}'::jsonb,
      true,
      60,
      'Water Filter | Alpron Aqua Solutions',
      'Request application, specification, availability and pricing details for a water filter from Alpron Aqua Solutions.'
    )
)
insert into public.products (
  name, slug, category_id, short_description, full_description,
  price_paise, show_price, currency, minimum_order_quantity,
  minimum_order_unit, availability, featured, display_order, status,
  seo_title, seo_description, canonical_url, source_url,
  verification_status, verified_at, published_at
)
select
  catalogue.name,
  catalogue.slug,
  categories.id,
  catalogue.short_description,
  catalogue.full_description,
  null,
  false,
  'INR',
  null,
  null,
  'contact_for_availability',
  catalogue.featured,
  catalogue.display_order,
  'published',
  catalogue.seo_title,
  catalogue.seo_description,
  null,
  'https://www.indiamart.com/alpron-aqua-solution/',
  'verified',
  now(),
  now()
from catalogue
join public.categories on categories.slug = catalogue.category_slug
on conflict (slug) do update
set
  category_id = excluded.category_id,
  source_url = excluded.source_url,
  verification_status = excluded.verification_status,
  verified_at = coalesce(products.verified_at, excluded.verified_at),
  updated_at = now();
