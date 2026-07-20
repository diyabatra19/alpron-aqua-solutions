create extension if not exists pgcrypto with schema extensions;

create type public.admin_role as enum ('super_admin', 'content_editor', 'sales_manager');
create type public.product_status as enum ('draft', 'published', 'archived');
create type public.availability_status as enum ('in_stock', 'made_to_order', 'out_of_stock', 'discontinued');
create type public.inquiry_status as enum ('new', 'contacted', 'qualified', 'closed', 'spam');
create type public.verification_status as enum ('unverified', 'verified', 'rejected');

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null default 'sales_manager',
  display_name text check (char_length(display_name) <= 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '' check (char_length(description) <= 500),
  image_alt text not null default '' check (char_length(image_alt) <= 180),
  display_order integer not null default 0,
  status public.product_status not null default 'draft',
  seo_title text check (char_length(seo_title) <= 70),
  seo_description text check (char_length(seo_description) <= 170),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sku text unique check (sku is null or char_length(sku) <= 80),
  category_id uuid not null references public.categories(id) on delete restrict,
  short_description text not null check (char_length(short_description) <= 500),
  full_description jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  price_paise bigint check (price_paise is null or price_paise >= 0),
  show_price boolean not null default false,
  currency char(3) not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  minimum_order_quantity numeric(12,3) check (minimum_order_quantity is null or minimum_order_quantity > 0),
  minimum_order_unit text check (minimum_order_unit is null or char_length(minimum_order_unit) <= 40),
  availability public.availability_status not null default 'made_to_order',
  featured boolean not null default false,
  display_order integer not null default 0,
  status public.product_status not null default 'draft',
  seo_title text check (char_length(seo_title) <= 70),
  seo_description text check (char_length(seo_description) <= 170),
  canonical_url text check (canonical_url is null or canonical_url ~ '^https?://'),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visible_price_requires_value check (not show_price or price_paise is not null)
);

create index products_catalog_idx on public.products (status, category_id, featured, display_order);
create index products_name_search_idx on public.products using gin (to_tsvector('english', name || ' ' || short_description));

create table public.product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  specification_key text not null check (char_length(specification_key) between 1 and 120),
  specification_value text not null check (char_length(specification_value) between 1 and 300),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  original_filename text not null check (char_length(original_filename) <= 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  byte_size integer not null check (byte_size between 1 and 5242880),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  alt_text text not null check (char_length(alt_text) between 1 and 180),
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  alt_text text not null check (char_length(alt_text) between 1 and 180),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, media_asset_id)
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 160),
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  status public.product_status not null default 'draft',
  seo_title text check (char_length(seo_title) <= 70),
  seo_description text check (char_length(seo_description) <= 170),
  canonical_url text check (canonical_url is null or canonical_url ~ '^https?://'),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.page_versions (
  id bigint generated always as identity primary key,
  page_id uuid not null references public.pages(id) on delete cascade,
  title text not null,
  content jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id),
  brand_name text not null default 'Alpron Aqua Solutions',
  default_seo_title text not null,
  default_seo_description text not null,
  hero_title text not null,
  hero_description text not null,
  google_site_verification text,
  analytics_id text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table public.business_facts (
  id uuid primary key default gen_random_uuid(),
  fact_key text not null unique,
  label text not null,
  fact_value text,
  verification_status public.verification_status not null default 'unverified',
  public_visible boolean not null default false,
  source_url text,
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  constraint public_fact_must_be_verified check (not public_visible or verification_status = 'verified')
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  email text check (email is null or char_length(email) <= 254),
  city text not null check (char_length(city) between 2 and 100),
  product_id uuid references public.products(id) on delete set null,
  required_quantity text not null check (char_length(required_quantity) between 1 and 80),
  message text not null check (char_length(message) between 10 and 2000),
  consent_accepted boolean not null check (consent_accepted),
  source_page text not null check (char_length(source_page) <= 300),
  status public.inquiry_status not null default 'new',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_status_date_idx on public.inquiries (status, submitted_at desc);

create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  note text not null check (char_length(note) between 1 and 2000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  event_type text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table private.rate_limit_buckets (
  key_hash text primary key,
  request_count integer not null,
  window_started_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create or replace function private.is_admin(allowed_roles public.admin_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
      and (allowed_roles is null or profile.role = any(allowed_roles))
  );
$$;

revoke all on function private.is_admin(public.admin_role[]) from public;
grant execute on function private.is_admin(public.admin_role[]) to anon, authenticated;

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 or char_length(p_key_hash) < 32 then
    return false;
  end if;

  insert into private.rate_limit_buckets (key_hash, request_count, window_started_at)
  values (p_key_hash, 1, now())
  on conflict (key_hash) do update
    set request_count = case
      when private.rate_limit_buckets.window_started_at + make_interval(secs => p_window_seconds) <= now()
        then 1
      else private.rate_limit_buckets.request_count + 1
    end,
    window_started_at = case
      when private.rate_limit_buckets.window_started_at + make_interval(secs => p_window_seconds) <= now()
        then now()
      else private.rate_limit_buckets.window_started_at
    end,
    updated_at = now()
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

create or replace function public.save_product(p_product jsonb, p_specifications jsonb default '[]'::jsonb, p_media_ids uuid[] default '{}')
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
    canonical_url, published_at
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
    coalesce((p_product->>'availability')::public.availability_status, 'made_to_order'),
    coalesce((p_product->>'featured')::boolean, false),
    coalesce((p_product->>'display_order')::integer, 0),
    coalesce((p_product->>'status')::public.product_status, 'draft'),
    nullif(p_product->>'seo_title', ''),
    nullif(p_product->>'seo_description', ''),
    nullif(p_product->>'canonical_url', ''),
    case when p_product->>'status' = 'published' then coalesce(nullif(p_product->>'published_at', '')::timestamptz, now()) else null end
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
    published_at = excluded.published_at,
    updated_at = now();

  delete from public.product_specifications where product_id = v_product_id;
  for item in select * from jsonb_array_elements(p_specifications)
  loop
    insert into public.product_specifications (product_id, specification_key, specification_value, display_order)
    values (v_product_id, item->>'key', item->>'value', coalesce((item->>'order')::integer, 0));
  end loop;

  delete from public.product_images where product_id = v_product_id;
  foreach media_id in array p_media_ids
  loop
    select alt_text into media_alt from public.media_assets where id = media_id;
    if media_alt is not null then
      insert into public.product_images (product_id, media_asset_id, alt_text, display_order)
      values (v_product_id, media_id, media_alt, item_order);
      item_order := item_order + 1;
    end if;
  end loop;

  insert into public.audit_events (actor_id, event_type, entity_type, entity_id)
  values ((select auth.uid()), 'product.saved', 'product', v_product_id::text);
  return v_product_id;
end;
$$;

revoke all on function public.save_product(jsonb, jsonb, uuid[]) from public, anon;
grant execute on function public.save_product(jsonb, jsonb, uuid[]) to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger admin_profiles_updated before update on public.admin_profiles for each row execute function private.set_updated_at();
create trigger categories_updated before update on public.categories for each row execute function private.set_updated_at();
create trigger products_updated before update on public.products for each row execute function private.set_updated_at();
create trigger pages_updated before update on public.pages for each row execute function private.set_updated_at();
create trigger site_settings_updated before update on public.site_settings for each row execute function private.set_updated_at();
create trigger business_facts_updated before update on public.business_facts for each row execute function private.set_updated_at();
create trigger inquiries_updated before update on public.inquiries for each row execute function private.set_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_specifications enable row level security;
alter table public.media_assets enable row level security;
alter table public.product_images enable row level security;
alter table public.pages enable row level security;
alter table public.page_versions enable row level security;
alter table public.site_settings enable row level security;
alter table public.business_facts enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_notes enable row level security;
alter table public.audit_events enable row level security;

create policy "Public reads published categories" on public.categories for select to anon, authenticated using (status = 'published' or private.is_admin());
create policy "Content admins manage categories" on public.categories for all to authenticated using (private.is_admin(array['super_admin','content_editor']::public.admin_role[])) with check (private.is_admin(array['super_admin','content_editor']::public.admin_role[]));

create policy "Public reads published products" on public.products for select to anon, authenticated using (status = 'published' or private.is_admin());
create policy "Content admins manage products" on public.products for all to authenticated using (private.is_admin(array['super_admin','content_editor']::public.admin_role[])) with check (private.is_admin(array['super_admin','content_editor']::public.admin_role[]));

create policy "Public reads specifications for published products" on public.product_specifications for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'published' or private.is_admin())));
create policy "Content admins manage specifications" on public.product_specifications for all to authenticated using (private.is_admin(array['super_admin','content_editor']::public.admin_role[])) with check (private.is_admin(array['super_admin','content_editor']::public.admin_role[]));

create policy "Public reads media used by published products" on public.media_assets for select to anon, authenticated using (exists (select 1 from public.product_images pi join public.products p on p.id = pi.product_id where pi.media_asset_id = media_assets.id and p.status = 'published') or private.is_admin());
create policy "Content admins manage media" on public.media_assets for all to authenticated using (private.is_admin(array['super_admin','content_editor']::public.admin_role[])) with check (private.is_admin(array['super_admin','content_editor']::public.admin_role[]));

create policy "Public reads images for published products" on public.product_images for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'published' or private.is_admin())));
create policy "Content admins manage product images" on public.product_images for all to authenticated using (private.is_admin(array['super_admin','content_editor']::public.admin_role[])) with check (private.is_admin(array['super_admin','content_editor']::public.admin_role[]));

create policy "Public reads published pages" on public.pages for select to anon, authenticated using (status = 'published' or private.is_admin());
create policy "Content admins manage pages" on public.pages for all to authenticated using (private.is_admin(array['super_admin','content_editor']::public.admin_role[])) with check (private.is_admin(array['super_admin','content_editor']::public.admin_role[]));
create policy "Content admins read versions" on public.page_versions for select to authenticated using (private.is_admin(array['super_admin','content_editor']::public.admin_role[]));
create policy "Content admins create versions" on public.page_versions for insert to authenticated with check (private.is_admin(array['super_admin','content_editor']::public.admin_role[]));

create policy "Public reads site settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Super admins manage settings" on public.site_settings for all to authenticated using (private.is_admin(array['super_admin']::public.admin_role[])) with check (private.is_admin(array['super_admin']::public.admin_role[]));

create policy "Public reads verified facts" on public.business_facts for select to anon, authenticated using ((verification_status = 'verified' and public_visible) or private.is_admin());
create policy "Super admins manage facts" on public.business_facts for all to authenticated using (private.is_admin(array['super_admin']::public.admin_role[])) with check (private.is_admin(array['super_admin']::public.admin_role[]));

create policy "Admins read own profile" on public.admin_profiles for select to authenticated using (user_id = (select auth.uid()) or private.is_admin(array['super_admin']::public.admin_role[]));
create policy "Super admins manage profiles" on public.admin_profiles for all to authenticated using (private.is_admin(array['super_admin']::public.admin_role[])) with check (private.is_admin(array['super_admin']::public.admin_role[]));

create policy "Sales admins read inquiries" on public.inquiries for select to authenticated using (private.is_admin());
create policy "Sales admins update inquiries" on public.inquiries for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Sales admins read notes" on public.inquiry_notes for select to authenticated using (private.is_admin());
create policy "Sales admins create notes" on public.inquiry_notes for insert to authenticated with check (private.is_admin() and created_by = (select auth.uid()));

create policy "Admins read audit events" on public.audit_events for select to authenticated using (private.is_admin());
create policy "Admins create audit events" on public.audit_events for insert to authenticated with check (private.is_admin() and actor_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads product media" on storage.objects for select to anon, authenticated using (bucket_id = 'product-media');
create policy "Content admins upload product media" on storage.objects for insert to authenticated with check (bucket_id = 'product-media' and private.is_admin(array['super_admin','content_editor']::public.admin_role[]));
create policy "Content admins update product media" on storage.objects for update to authenticated using (bucket_id = 'product-media' and private.is_admin(array['super_admin','content_editor']::public.admin_role[]));
create policy "Content admins delete product media" on storage.objects for delete to authenticated using (bucket_id = 'product-media' and private.is_admin(array['super_admin','content_editor']::public.admin_role[]));
