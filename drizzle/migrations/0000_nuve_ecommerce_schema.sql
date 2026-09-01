-- ROLES
create type public.app_role as enum ('admin','customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles readable" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PROFILES
create table public.profiles (
  id uuid primary key,
  full_name text,
  email text,
  phone text,
  cpf text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer')
  on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text not null unique,
  name text not null,
  tagline text,
  short_description text,
  description text,
  price_cents integer not null default 14990,
  sale_price_cents integer,
  stock integer not null default 0,
  active boolean not null default true,
  featured boolean not null default true,
  accent text default 'blush',
  kind text not null default 'serum',
  benefits jsonb not null default '[]'::jsonb,
  actives jsonb not null default '[]'::jsonb,
  how_to_use jsonb not null default '[]'::jsonb,
  routine text,
  best_for text,
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read active products" on public.products for select to anon using (active);
create policy "auth read products" on public.products for select to authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admins manage products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  fit text not null default 'cover'
);
grant select on public.product_images to anon;
grant select on public.product_images to authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "public read product images" on public.product_images for select to anon using (true);
create policy "auth read product images" on public.product_images for select to authenticated using (true);
create policy "admins manage product images" on public.product_images for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- INVENTORY MOVEMENTS
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  delta integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);
grant select on public.inventory_movements to authenticated;
grant all on public.inventory_movements to service_role;
alter table public.inventory_movements enable row level security;
create policy "admins read movements" on public.inventory_movements for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins write movements" on public.inventory_movements for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- COUPONS
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  percent_off numeric(5,2),
  amount_off_cents integer,
  min_order_cents integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses integer,
  max_uses_per_customer integer default 1,
  uses integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.coupons to anon;
grant select on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "public read active coupons" on public.coupons for select to anon using (active);
create policy "auth read coupons" on public.coupons for select to authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admins manage coupons" on public.coupons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PROMOTIONS (quantity based)
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  min_quantity integer not null default 2,
  percent_off numeric(5,2) not null default 10,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.promotions to anon;
grant select on public.promotions to authenticated;
grant all on public.promotions to service_role;
alter table public.promotions enable row level security;
create policy "public read promotions" on public.promotions for select to anon using (active);
create policy "auth read promotions" on public.promotions for select to authenticated using (true);
create policy "admins manage promotions" on public.promotions for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- BANNERS
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  cta_label text,
  cta_link text,
  image_desktop text not null,
  image_mobile text,
  image_fit text not null default 'contain',
  sort_order integer not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
grant select on public.banners to anon;
grant select on public.banners to authenticated;
grant all on public.banners to service_role;
alter table public.banners enable row level security;
create policy "public read banners" on public.banners for select to anon using (active);
create policy "auth read banners" on public.banners for select to authenticated using (true);
create policy "admins manage banners" on public.banners for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- SITE SETTINGS
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon;
grant select on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon using (true);
create policy "auth read settings" on public.site_settings for select to authenticated using (true);
create policy "admins manage settings" on public.site_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ADDRESSES
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  label text,
  recipient text,
  cep text not null,
  street text not null,
  number text not null,
  complement text,
  district text not null,
  city text not null,
  state text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "own addresses" on public.addresses for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_cpf text,
  shipping jsonb not null default '{}'::jsonb,
  subtotal_cents integer not null default 0,
  promo_discount_cents integer not null default 0,
  coupon_discount_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  coupon_code text,
  status text not null default 'aguardando_pagamento',
  payment_status text not null default 'aguardando',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders" on public.orders for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "admins manage orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  sku text not null,
  name text not null,
  unit_price_cents integer not null,
  quantity integer not null,
  total_cents integer not null
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "own order items" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin')))
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'mercadopago',
  provider_payment_id text,
  provider_preference_id text,
  status text not null default 'aguardando',
  amount_cents integer not null,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index payments_provider_payment_id_key on public.payments(provider, provider_payment_id) where provider_payment_id is not null;
grant select on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "own payments" on public.payments for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin')))
);

create table public.coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  customer_email text,
  created_at timestamptz not null default now()
);
grant select on public.coupon_usage to authenticated;
grant all on public.coupon_usage to service_role;
alter table public.coupon_usage enable row level security;
create policy "admins read coupon usage" on public.coupon_usage for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.reviews to anon;
grant select, insert on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "public read approved reviews" on public.reviews for select to anon using (approved);
create policy "auth read reviews" on public.reviews for select to authenticated using (approved or user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "auth create reviews" on public.reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "admins manage reviews" on public.reviews for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- NEWSLETTER
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
grant select on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "admins read subscribers" on public.newsletter_subscribers for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- KITS
create table public.kits (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image text,
  product_slugs jsonb not null default '[]'::jsonb,
  percent_off numeric(5,2) not null default 10,
  active boolean not null default true,
  sort_order integer not null default 0
);
grant select on public.kits to anon;
grant select on public.kits to authenticated;
grant all on public.kits to service_role;
alter table public.kits enable row level security;
create policy "public read kits" on public.kits for select to anon using (active);
create policy "auth read kits" on public.kits for select to authenticated using (true);
create policy "admins manage kits" on public.kits for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ORDER NUMBER
create or replace function public.next_order_number()
returns text language plpgsql security definer set search_path = public as $$
declare n bigint;
begin
  select count(*) + 1 into n from public.orders;
  return 'NUVE-' || to_char(now(),'YYYY') || '-' || lpad(n::text, 5, '0');
end; $$;

-- SEED PRODUCTS
insert into public.products (slug, sku, name, tagline, short_description, description, price_cents, stock, accent, sort_order, benefits, actives, how_to_use, routine, best_for, seo_title, seo_description) values
('nuve-5-em-1','NUVE-5EM1','NUVE 5 EM 1','Cinco ativos selecionados. Uma rotina prática.',
 'A combinação pensada para hidratar, cuidar e melhorar a aparência da pele, tornando a rotina diária mais prática e completa.',
 'O NUVE 5 EM 1 reúne cinco ativos selecionados em uma única fórmula, para uma rotina simples e sofisticada. Uma proposta de cuidado diário que combina hidratação, conforto e cuidado com a aparência da pele.',
 14990, 40, 'nude', 1,
 '["Hidratação e aparência mais viçosa","Cuidado com a barreira da pele","Aparência mais uniforme e saudável","Ação antioxidante","Rotina mais prática em um único passo"]'::jsonb,
 '[{"name":"Nano Colesterol","text":"Cuidado e suporte à barreira da pele."},{"name":"Nano Ácido Hialurônico","text":"Hidratação e aparência mais preenchida e viçosa."},{"name":"Nano Niacinamida","text":"Barreira, uniformidade e aparência saudável."},{"name":"Resveratrol","text":"Ação antioxidante e cuidado contra os sinais do envelhecimento."},{"name":"Óleo de Rosa Mosqueta","text":"Nutrição, conforto e cuidado com a aparência da pele."}]'::jsonb,
 '["Aplique sobre a pele limpa e seca.","Use de 3 a 5 gotas no rosto e pescoço.","Espalhe com movimentos suaves até absorver.","Finalize com hidratante e, de manhã, protetor solar."]'::jsonb,
 'Manhã e/ou noite, conforme sua rotina.','Para quem procura combinação de ativos e praticidade.',
 'NUVE 5 EM 1 — Sérum facial multifuncional','Cinco ativos selecionados em uma única fórmula: hidratação, cuidado com a barreira e ação antioxidante em um passo.'),
('nuve-ghk-cu','NUVE-GHKCU','NUVE GHK-Cu','O poder dos peptídeos em uma fórmula sofisticada.',
 'Um dos peptídeos mais conhecidos da cosmética avançada, em uma fórmula pensada para elevar a rotina de cuidados.',
 'O NUVE GHK-Cu traz o Copper Tripeptide-1 em uma fórmula sofisticada, pensada para quem busca cuidar da aparência de firmeza, elasticidade e textura da pele.',
 14990, 40, 'azul', 2,
 '["Aparência de firmeza","Elasticidade e textura","Aparência saudável e viçosa","Cuidado antioxidante"]'::jsonb,
 '[{"name":"GHK-Cu (Copper Tripeptide-1)","text":"Peptídeo de cobre, um dos ativos mais conhecidos da cosmética avançada."},{"name":"Ácido Hialurônico","text":"Hidratação e conforto."},{"name":"Colágeno","text":"Cuidado com a aparência de firmeza."}]'::jsonb,
 '["Aplique sobre a pele limpa.","Use de 3 a 4 gotas no rosto.","Massageie suavemente até absorver.","Finalize com hidratante e protetor solar de dia."]'::jsonb,
 'Ideal na rotina noturna.','Para quem deseja incorporar peptídeo de cobre à rotina.',
 'NUVE GHK-Cu — Sérum com peptídeo de cobre','Sérum NUVE GHK-Cu com Copper Tripeptide-1: cuidado com firmeza, elasticidade e textura da pele.'),
('nuve-pdrn','NUVE-PDRN','NUVE PDRN + PEPTÍDEO DE COBRE','Tecnologia avançada para uma rotina de skincare sofisticada.',
 'Uma combinação de ativos inspirada na nova geração do skincare.',
 'PDRN + Peptídeo de Cobre — Uma combinação pensada para quem busca elevar a rotina de cuidados e incorporar ativos associados às novas tendências de skincare.',
 14990, 40, 'rosa', 3,
 '["Ativos associados à nova geração do skincare","Cuidado com a aparência da pele","Textura leve e de rápida absorção","Experiência sofisticada de uso"]'::jsonb,
 '[{"name":"PDRN (Polydeoxyribonucleotide)","text":"Ativo associado às novas tendências do skincare avançado."},{"name":"Peptídeo de Cobre","text":"Cuidado com a aparência de firmeza e textura."}]'::jsonb,
 '["Aplique sobre a pele limpa e seca.","Use de 3 a 4 gotas no rosto.","Espalhe com toques suaves.","Finalize com hidratante."]'::jsonb,
 'Rotina noturna ou conforme preferência.','Para quem busca ativos associados à nova geração do skincare.',
 'NUVE PDRN + Peptídeo de Cobre','Sérum NUVE PDRN + Peptídeo de Cobre: tecnologia avançada para uma rotina de skincare sofisticada.');

insert into public.promotions (name, min_quantity, percent_off, active) values ('10% OFF a partir de 2 unidades', 2, 10, true);

insert into public.site_settings (key, value) values
('announcement', '{"text":"10% OFF NA COMPRA DE 2 OU MAIS UNIDADES","active":true}'::jsonb),
('social', '{"instagram":"https://www.instagram.com/nuve_serum?igsi=MWF0eGxhdmp0MXloMg==","tiktok":"https://www.tiktok.com/@nuveadvanced","whatsapp":"","email":""}'::jsonb),
('shipping', '{"mode":"manual","flat_cents":0,"free_above_cents":0,"note":"Frete a combinar — configuração pendente."}'::jsonb);

insert into public.kits (slug, name, description, product_slugs, percent_off, sort_order) values
('kit-duo','KIT NUVE DUO','Dois séruns para montar uma rotina completa com 10% OFF.','["nuve-5-em-1","nuve-ghk-cu"]'::jsonb,10,1),
('kit-linha-completa','KIT NUVE LINHA COMPLETA','Os três séruns NUVE: ritual completo de cuidado avançado com 10% OFF.','["nuve-5-em-1","nuve-ghk-cu","nuve-pdrn"]'::jsonb,10,2);