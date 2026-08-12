-- Phase 1 catalogue hierarchy. This migration extends the existing flat
-- categories table without changing product ownership, authentication or RLS
-- roles. Approved category names are taxonomy only; no product rows are added.

alter table public.categories
  add column if not exists parent_id uuid references public.categories(id) on delete set null,
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null,
  add column if not exists is_active boolean not null default true;

alter table public.categories
  drop constraint if exists categories_parent_not_self;
alter table public.categories
  add constraint categories_parent_not_self check (parent_id is null or parent_id <> id);

create index if not exists categories_parent_order_idx
  on public.categories (parent_id, is_active, status, display_order);

create or replace function private.prevent_category_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is null then
    return new;
  end if;

  if new.parent_id = new.id then
    raise exception 'A category cannot be its own parent';
  end if;

  if exists (
    with recursive ancestors as (
      select c.id, c.parent_id
      from public.categories c
      where c.id = new.parent_id
      union all
      select c.id, c.parent_id
      from public.categories c
      join ancestors a on c.id = a.parent_id
    )
    select 1 from ancestors where id = new.id
  ) then
    raise exception 'A category hierarchy cannot contain a cycle';
  end if;

  return new;
end;
$$;

drop trigger if exists categories_prevent_cycle on public.categories;
create trigger categories_prevent_cycle
before insert or update of parent_id on public.categories
for each row execute function private.prevent_category_cycle();

-- Preserve the original domestic category row and all existing product links.
update public.categories
set
  name = 'Domestic RO Systems',
  slug = 'domestic-ro-systems',
  description = 'Domestic reverse-osmosis and multi-stage purifier categories for household requirements.',
  image_alt = 'Domestic RO filtration system',
  display_order = 10,
  status = 'published',
  is_active = true,
  seo_title = 'Domestic RO Systems | Alpron Aqua Solutions',
  seo_description = 'Explore domestic RO system categories and request confirmed product, installation and quotation details.',
  updated_at = now()
where slug = 'ro-water-purifiers'
  and not exists (
    select 1 from public.categories where slug = 'domestic-ro-systems'
  );

with roots (name, slug, description, image_alt, display_order, seo_title, seo_description) as (
  values
    ('Domestic RO Systems', 'domestic-ro-systems', 'Domestic reverse-osmosis and multi-stage purifier categories for household requirements.', 'Domestic RO filtration system', 10, 'Domestic RO Systems | Alpron Aqua Solutions', 'Explore domestic RO system categories and request confirmed product, installation and quotation details.'),
    ('Commercial & Industrial RO Systems', 'commercial-industrial-ro-systems', 'Commercial and industrial reverse-osmosis plant categories organised by capacity, equipment and application.', 'Commercial reverse-osmosis plant', 20, 'Commercial & Industrial RO Systems | Alpron Aqua Solutions', 'Explore commercial and industrial RO plant, equipment and accessory categories.'),
    ('Water Chemicals', 'water-chemicals', 'RO, boiler, cooling-tower and water-treatment chemical categories for requirement-led enquiries.', 'Water treatment chemical containers', 30, 'Water Treatment Chemicals | Alpron Aqua Solutions', 'Explore water treatment chemical categories and request confirmed application and supply information.'),
    ('Stainless Steel Water Coolers', 'stainless-steel-water-coolers', 'Stainless-steel water cooler categories organised by installation type, application and storage capacity.', 'Stainless steel water cooler', 40, 'Stainless Steel Water Coolers | Alpron Aqua Solutions', 'Explore stainless-steel water cooler categories by application and capacity.'),
    ('Water Softeners', 'water-softeners', 'Domestic, commercial and industrial water-softener categories with related accessories.', 'Water softener system', 50, 'Water Softeners | Alpron Aqua Solutions', 'Explore domestic, commercial and industrial water softener categories and accessories.'),
    ('Spare Parts', 'spare-parts', 'Replacement components and consumables for purifier and water-treatment requirements.', 'RO purifier spare parts and components', 60, 'RO Spare Parts | Alpron Aqua Solutions', 'Browse RO membranes, filters, pumps, valves, housings and related spare-part categories.'),
    ('Installation & Services', 'installation-services', 'Installation, maintenance, testing and commissioning service categories.', 'RO installation and maintenance service', 70, 'RO Installation & Services | Alpron Aqua Solutions', 'Explore RO installation, repair, maintenance, water testing and plant commissioning services.')
)
insert into public.categories (
  name, slug, description, image_alt, display_order, status, is_active,
  seo_title, seo_description, parent_id
)
select
  roots.name, roots.slug, roots.description, roots.image_alt,
  roots.display_order, 'published', true, roots.seo_title,
  roots.seo_description, null
from roots
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_alt = excluded.image_alt,
  display_order = excluded.display_order,
  status = excluded.status,
  is_active = excluded.is_active,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  parent_id = null,
  updated_at = now();

-- Direct children and grouping nodes. Grouping nodes can contain a third level.
with children (parent_slug, name, slug, display_order) as (
  values
    ('domestic-ro-systems', 'Under Sink RO', 'under-sink-ro', 10),
    ('domestic-ro-systems', 'Wall Mount RO', 'wall-mount-ro', 20),
    ('domestic-ro-systems', 'Table Top RO', 'table-top-ro', 30),
    ('domestic-ro-systems', 'RO + UV Water Purifier', 'ro-uv-water-purifier', 40),
    ('domestic-ro-systems', 'RO + UF Water Purifier', 'ro-uf-water-purifier', 50),
    ('domestic-ro-systems', 'RO + UV + UF + TDS Controller', 'ro-uv-uf-tds-controller', 60),
    ('domestic-ro-systems', 'Copper RO', 'copper-ro', 70),
    ('domestic-ro-systems', 'Alkaline RO', 'alkaline-ro', 80),
    ('domestic-ro-systems', 'Hot & Normal RO', 'hot-normal-ro', 90),
    ('domestic-ro-systems', 'Smart RO Purifiers', 'smart-ro-purifiers', 100),
    ('domestic-ro-systems', 'Domestic Spare Parts', 'domestic-spare-parts', 110),

    ('commercial-industrial-ro-systems', 'Commercial RO Plants', 'commercial-ro-plants', 10),
    ('commercial-industrial-ro-systems', 'Industrial RO Plants', 'industrial-ro-plants', 20),
    ('commercial-industrial-ro-systems', 'Customized RO Plants', 'customized-ro-plants', 30),
    ('commercial-industrial-ro-systems', 'Industrial Equipment', 'industrial-equipment', 40),
    ('commercial-industrial-ro-systems', 'Plant Accessories', 'plant-accessories', 50),

    ('water-chemicals', 'RO Chemicals', 'ro-chemicals', 10),
    ('water-chemicals', 'Boiler Chemicals', 'boiler-chemicals', 20),
    ('water-chemicals', 'Cooling Tower Chemicals', 'cooling-tower-chemicals', 30),
    ('water-chemicals', 'Water Treatment Chemicals', 'water-treatment-chemicals', 40),

    ('stainless-steel-water-coolers', 'Wall Mounted Water Coolers', 'wall-mounted-water-coolers', 10),
    ('stainless-steel-water-coolers', 'Floor Standing Water Coolers', 'floor-standing-water-coolers', 20),
    ('stainless-steel-water-coolers', 'Storage Water Coolers', 'storage-water-coolers', 30),
    ('stainless-steel-water-coolers', 'Bottled Water Coolers', 'bottled-water-coolers', 40),
    ('stainless-steel-water-coolers', 'Industrial Water Coolers', 'industrial-water-coolers', 50),
    ('stainless-steel-water-coolers', 'School Water Coolers', 'school-water-coolers', 60),
    ('stainless-steel-water-coolers', 'Railway/Station Water Coolers', 'railway-station-water-coolers', 70),
    ('stainless-steel-water-coolers', 'Water Cooler with RO', 'water-cooler-with-ro', 80),
    ('stainless-steel-water-coolers', 'Water Cooler with Inbuilt Purifier', 'water-cooler-inbuilt-purifier', 90),
    ('stainless-steel-water-coolers', 'Water Cooler Capacity', 'water-cooler-capacity', 100),

    ('water-softeners', 'Domestic Water Softeners', 'domestic-water-softeners', 10),
    ('water-softeners', 'Commercial Water Softeners', 'commercial-water-softeners', 20),
    ('water-softeners', 'Industrial Water Softeners', 'industrial-water-softeners', 30),
    ('water-softeners', 'Softener Accessories', 'softener-accessories', 40),

    ('spare-parts', 'Membranes', 'membranes', 10),
    ('spare-parts', 'Filter Cartridges', 'filter-cartridges', 20),
    ('spare-parts', 'Pumps', 'pumps', 30),
    ('spare-parts', 'Valves', 'valves', 40),
    ('spare-parts', 'Housings', 'housings', 50),
    ('spare-parts', 'Connectors', 'connectors', 60),
    ('spare-parts', 'Faucets', 'faucets', 70),
    ('spare-parts', 'Tubing', 'tubing', 80),
    ('spare-parts', 'SMPS', 'smps', 90),
    ('spare-parts', 'Float Switches', 'float-switches', 100),

    ('installation-services', 'RO Installation', 'ro-installation', 10),
    ('installation-services', 'AMC (Annual Maintenance Contract)', 'annual-maintenance-contract', 20),
    ('installation-services', 'RO Repair', 'ro-repair', 30),
    ('installation-services', 'Membrane Replacement', 'membrane-replacement', 40),
    ('installation-services', 'Filter Replacement', 'filter-replacement', 50),
    ('installation-services', 'Water Testing', 'water-testing', 60),
    ('installation-services', 'Plant Commissioning', 'plant-commissioning', 70),
    ('installation-services', 'Plant Maintenance', 'plant-maintenance', 80)
)
insert into public.categories (
  name, slug, description, image_alt, display_order, status, is_active,
  seo_title, seo_description, parent_id
)
select
  children.name,
  children.slug,
  'Category for ' || children.name || ' enquiries. Product details appear only when verified records are published.',
  children.name || ' category',
  children.display_order,
  'published',
  true,
  children.name || ' | Alpron Aqua Solutions',
  'Explore the ' || children.name || ' category and request confirmed product or service information.',
  parent.id
from children
join public.categories parent on parent.slug = children.parent_slug
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_alt = excluded.image_alt,
  display_order = excluded.display_order,
  status = excluded.status,
  is_active = excluded.is_active,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  parent_id = excluded.parent_id,
  updated_at = now();

with grandchildren (parent_slug, name, slug, display_order) as (
  values
    ('domestic-spare-parts', 'RO Membranes', 'ro-membranes', 10),
    ('domestic-spare-parts', 'Sediment Filters', 'sediment-filters', 20),
    ('domestic-spare-parts', 'Carbon Filters', 'carbon-filters', 30),
    ('domestic-spare-parts', 'Post Carbon Filters', 'post-carbon-filters', 40),
    ('domestic-spare-parts', 'UV Lamps', 'uv-lamps', 50),
    ('domestic-spare-parts', 'Booster Pumps', 'booster-pumps', 60),
    ('domestic-spare-parts', 'Solenoid Valves', 'solenoid-valves', 70),
    ('domestic-spare-parts', 'SMPS/Adapters', 'smps-adapters', 80),
    ('domestic-spare-parts', 'Faucets', 'domestic-ro-faucets', 90),
    ('domestic-spare-parts', 'Storage Tanks', 'domestic-ro-storage-tanks', 100),

    ('commercial-ro-plants', '25 LPH', 'commercial-ro-25-lph', 10),
    ('commercial-ro-plants', '50 LPH', 'commercial-ro-50-lph', 20),
    ('commercial-ro-plants', '100 LPH', 'commercial-ro-100-lph', 30),
    ('commercial-ro-plants', '250 LPH', 'commercial-ro-250-lph', 40),
    ('commercial-ro-plants', '500 LPH', 'commercial-ro-500-lph', 50),
    ('commercial-ro-plants', '1000 LPH', 'commercial-ro-1000-lph', 60),
    ('industrial-ro-plants', '2000 LPH', 'industrial-ro-2000-lph', 10),
    ('industrial-ro-plants', '3000 LPH', 'industrial-ro-3000-lph', 20),
    ('industrial-ro-plants', '5000 LPH', 'industrial-ro-5000-lph', 30),
    ('industrial-ro-plants', '10000 LPH', 'industrial-ro-10000-lph', 40),
    ('industrial-equipment', 'FRP Pressure Vessels', 'frp-pressure-vessels', 10),
    ('industrial-equipment', 'Multiport Valves', 'multiport-valves', 20),
    ('industrial-equipment', 'Dosing Systems', 'dosing-systems', 30),
    ('industrial-equipment', 'Sand Filters', 'sand-filters', 40),
    ('industrial-equipment', 'Activated Carbon Filters', 'activated-carbon-filters', 50),
    ('industrial-equipment', 'Micron Cartridge Filters', 'micron-cartridge-filters', 60),
    ('industrial-equipment', 'Membrane Housings', 'membrane-housings', 70),
    ('industrial-equipment', 'High Pressure Pumps', 'high-pressure-pumps', 80),
    ('industrial-equipment', 'Control Panels', 'control-panels', 90),
    ('industrial-equipment', 'UV Systems', 'industrial-uv-systems', 100),
    ('industrial-equipment', 'Ozonators', 'ozonators', 110),
    ('plant-accessories', 'Flow Meters', 'flow-meters', 10),
    ('plant-accessories', 'Pressure Gauges', 'pressure-gauges', 20),
    ('plant-accessories', 'Conductivity/TDS Meters', 'conductivity-tds-meters', 30),
    ('plant-accessories', 'Dosing Pumps', 'dosing-pumps', 40),
    ('plant-accessories', 'Float Switches', 'plant-float-switches', 50),
    ('plant-accessories', 'Pipes & Fittings', 'pipes-fittings', 60),

    ('ro-chemicals', 'Antiscalant', 'antiscalant', 10),
    ('ro-chemicals', 'Membrane Cleaner (Acidic)', 'membrane-cleaner-acidic', 20),
    ('ro-chemicals', 'Membrane Cleaner (Alkaline)', 'membrane-cleaner-alkaline', 30),
    ('ro-chemicals', 'Biocide', 'ro-biocide', 40),
    ('ro-chemicals', 'Chlorine Tablets', 'chlorine-tablets', 50),
    ('ro-chemicals', 'Sodium Hypochlorite', 'sodium-hypochlorite', 60),
    ('boiler-chemicals', 'Oxygen Scavenger', 'oxygen-scavenger', 10),
    ('boiler-chemicals', 'Scale Inhibitor', 'boiler-scale-inhibitor', 20),
    ('boiler-chemicals', 'Boiler Treatment Chemicals', 'boiler-treatment-chemicals', 30),
    ('cooling-tower-chemicals', 'Corrosion Inhibitor', 'corrosion-inhibitor', 10),
    ('cooling-tower-chemicals', 'Scale Inhibitor', 'cooling-tower-scale-inhibitor', 20),
    ('cooling-tower-chemicals', 'Algaecide', 'algaecide', 30),
    ('cooling-tower-chemicals', 'Biocide', 'cooling-tower-biocide', 40),
    ('water-treatment-chemicals', 'pH Booster', 'ph-booster', 10),
    ('water-treatment-chemicals', 'pH Reducer', 'ph-reducer', 20),
    ('water-treatment-chemicals', 'Activated Carbon Media', 'activated-carbon-media', 30),
    ('water-treatment-chemicals', 'Silica Sand', 'silica-sand', 40),
    ('water-treatment-chemicals', 'Resin Cleaner', 'resin-cleaner', 50),

    ('water-cooler-capacity', '20 L', 'water-cooler-20-l', 10),
    ('water-cooler-capacity', '40 L', 'water-cooler-40-l', 20),
    ('water-cooler-capacity', '60 L', 'water-cooler-60-l', 30),
    ('water-cooler-capacity', '80 L', 'water-cooler-80-l', 40),
    ('water-cooler-capacity', '120 L', 'water-cooler-120-l', 50),
    ('water-cooler-capacity', '150 L', 'water-cooler-150-l', 60),
    ('water-cooler-capacity', '200 L', 'water-cooler-200-l', 70),

    ('domestic-water-softeners', 'Bathroom Softener', 'bathroom-softener', 10),
    ('domestic-water-softeners', 'Whole House Softener', 'whole-house-softener', 20),
    ('domestic-water-softeners', 'Apartment Softener', 'apartment-softener', 30),
    ('commercial-water-softeners', 'Hotels', 'hotel-water-softeners', 10),
    ('commercial-water-softeners', 'Restaurants', 'restaurant-water-softeners', 20),
    ('commercial-water-softeners', 'Hospitals', 'hospital-water-softeners', 30),
    ('commercial-water-softeners', 'Schools', 'school-water-softeners', 40),
    ('industrial-water-softeners', 'Boiler Feed Softener', 'boiler-feed-softener', 10),
    ('industrial-water-softeners', 'Cooling Tower Softener', 'cooling-tower-softener', 20),
    ('industrial-water-softeners', 'Process Water Softener', 'process-water-softener', 30),
    ('softener-accessories', 'Ion Exchange Resin', 'ion-exchange-resin', 10),
    ('softener-accessories', 'Brine Tank', 'brine-tank', 20),
    ('softener-accessories', 'Multiport Valve', 'softener-multiport-valve', 30),
    ('softener-accessories', 'FRP Vessel', 'softener-frp-vessel', 40),
    ('softener-accessories', 'Salt Tablets', 'salt-tablets', 50)
)
insert into public.categories (
  name, slug, description, image_alt, display_order, status, is_active,
  seo_title, seo_description, parent_id
)
select
  grandchildren.name,
  grandchildren.slug,
  'Category for ' || grandchildren.name || ' enquiries. Product details appear only when verified records are published.',
  grandchildren.name || ' category',
  grandchildren.display_order,
  'published',
  true,
  grandchildren.name || ' | Alpron Aqua Solutions',
  'Explore the ' || grandchildren.name || ' category and request confirmed product information.',
  parent.id
from grandchildren
join public.categories parent on parent.slug = grandchildren.parent_slug
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_alt = excluded.image_alt,
  display_order = excluded.display_order,
  status = excluded.status,
  is_active = excluded.is_active,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  parent_id = excluded.parent_id,
  updated_at = now();

-- Safely place legacy categories beneath the closest approved top-level group.
update public.categories
set parent_id = (select id from public.categories where slug = 'spare-parts'),
    is_active = true,
    updated_at = now()
where slug in ('ro-water-purifier-bodies', 'water-filters');

update public.categories
set parent_id = (select id from public.categories where slug = 'domestic-ro-systems'),
    updated_at = now()
where slug in ('ro-filter-assemblies', 'domestic-purifiers-supplied-products');

update public.categories
set parent_id = (select id from public.categories where slug = 'commercial-industrial-ro-systems'),
    updated_at = now()
where slug = 'water-treatment-systems';

-- Public category visibility now respects the active switch while retaining
-- the existing immutable admin-role policy.
drop policy if exists "Public reads published categories" on public.categories;
create policy "Public reads published categories"
on public.categories for select to anon, authenticated
using ((status = 'published' and is_active) or private.is_admin());

-- Category images use the existing protected media library. Anonymous users
-- may read metadata only when a published active category references it.
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
  or exists (
    select 1
    from public.categories c
    where c.media_asset_id = media_assets.id
      and c.status = 'published'
      and c.is_active
  )
  or private.is_admin()
);

update public.site_settings
set
  default_seo_title = 'Alpron Aqua Solutions | Water Treatment Solutions',
  default_seo_description = 'Explore domestic, commercial and industrial water-treatment categories, equipment, spare parts and services from Alpron Aqua Solutions.',
  hero_title = 'Complete water treatment solutions for homes, businesses & industry',
  hero_description = 'Explore domestic RO systems, commercial and industrial RO plants, water-treatment chemicals, stainless-steel water coolers, water softeners, spare parts and related services.',
  about_title = 'A practical catalogue across purification, treatment and system support.',
  about_summary = 'Alpron Aqua Solutions presents domestic, commercial and industrial water-treatment categories through a quotation-led catalogue. Product details are published only after verification.',
  why_choose_intro = 'The catalogue brings purification systems, treatment equipment, chemicals, components and service requirements into one clear enquiry process.',
  ordering_intro = 'Browse the relevant category, share the application and quantity, and request confirmed product, availability and quotation details.',
  cta_title = 'Looking for the right water treatment solution?',
  cta_description = 'Tell us what you need and the team can help identify an appropriate category and prepare a confirmed quotation.',
  updated_at = now()
where id = true;
